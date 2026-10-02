import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { generateBrandedQRDataUrl } from "@/lib/branded-qr"

interface StandeeConfig {
  image: string
  qr: { left: number; top: number; width: number; height: number }
  darkColor: string
  cpBadge?: { left: number; top: number; width: number; height: number }
  whiteCard?: { left: number; top: number; width: number; height: number; rx: number }
}

// 3D Tabletop Studio Mockups (Displayed on Merchant Dashboard preview)
const STANDEE_COORDS: Record<string, StandeeConfig> = {
  bakery: {
    image: "standee_bakery_mockup.jpg",
    qr: { left: 408, top: 440, width: 266, height: 268 },
    darkColor: "#4a0e17",
    cpBadge: { left: 428, top: 922, width: 225, height: 40 },
  },
  royal: {
    image: "standee_royal_mockup.jpg",
    qr: { left: 432, top: 598, width: 172, height: 172 },
    darkColor: "#0f2942",
    cpBadge: { left: 375, top: 996, width: 215, height: 38 },
  },
  celebration: {
    image: "standee_celebration_mockup.jpg",
    qr: { left: 412, top: 590, width: 168, height: 178 },
    darkColor: "#3b1d11",
    cpBadge: { left: 350, top: 935, width: 205, height: 36 },
  },
  retail: {
    image: "standee_royal_mockup.jpg",
    qr: { left: 432, top: 598, width: 172, height: 172 },
    darkColor: "#0f2942",
    cpBadge: { left: 375, top: 996, width: 215, height: 38 },
  },
  pizzeria: {
    image: "standee_celebration_mockup.jpg",
    qr: { left: 412, top: 590, width: 168, height: 178 },
    darkColor: "#3b1d11",
    cpBadge: { left: 350, top: 935, width: 205, height: 36 },
  },
}

// Pure 2D Flat Printable Poster Inserts (NO tables, NO room backgrounds, NO perspective - for A4 printing)
const PRINT_POSTER_COORDS: Record<string, StandeeConfig> = {
  bakery: {
    image: "poster_bakery_insert.jpg",
    qr: { left: 465, top: 375, width: 275, height: 275 },
    darkColor: "#500713",
    whiteCard: { left: 445, top: 355, width: 315, height: 315, rx: 24 },
  },
  royal: {
    image: "poster_royal_insert.jpg",
    qr: { left: 425, top: 465, width: 275, height: 275 },
    darkColor: "#0f2942",
    whiteCard: { left: 405, top: 445, width: 315, height: 315, rx: 24 },
  },
  celebration: {
    image: "poster_celebration_insert.jpg",
    qr: { left: 485, top: 435, width: 275, height: 275 },
    darkColor: "#3b1d11",
    whiteCard: { left: 465, top: 415, width: 315, height: 315, rx: 24 },
  },
  retail: {
    image: "poster_royal_insert.jpg",
    qr: { left: 425, top: 465, width: 275, height: 275 },
    darkColor: "#0f2942",
    whiteCard: { left: 405, top: 445, width: 315, height: 315, rx: 24 },
  },
  pizzeria: {
    image: "poster_celebration_insert.jpg",
    qr: { left: 485, top: 435, width: 275, height: 275 },
    darkColor: "#3b1d11",
    whiteCard: { left: 465, top: 415, width: 315, height: 315, rx: 24 },
  },
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const design = (url.searchParams.get("design") || "bakery") as string
    const merchantId = url.searchParams.get("m") || req.headers.get("x-merchant-id")
    const isPrintFormat = url.searchParams.get("format") === "print"

    if (!merchantId) {
      return new NextResponse("Merchant ID required", { status: 400 })
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
    })

    if (!merchant) {
      return new NextResponse("Merchant not found", { status: 404 })
    }

    const configMap = isPrintFormat ? PRINT_POSTER_COORDS : STANDEE_COORDS
    const config = configMap[design] || configMap.bakery
    const baseImagePath = path.join(process.cwd(), "public", "standees", config.image)

    if (!fs.existsSync(baseImagePath)) {
      return new NextResponse("Standee template not found", { status: 404 })
    }

    // 1. Generate live WhatsApp Check-in URL
    const merchantPhone = normalizePhone(merchant.whatsappPhone) || "919999999999"
    const bizName = merchant.name || "our store"
    const joinText = `Hi ${bizName}! Checking in for my VIP Club stamps 🎁`
    const targetUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(joinText)}`

    // 2. Generate crisp QR code with merchant logo in center
    const qrDataUrl = await generateBrandedQRDataUrl(targetUrl, {
      width: config.qr.width * 2, // 2x for sharp retina rendering
      darkColor: config.darkColor || "#0f172a",
      lightColor: "#ffffff",
      merchantLogoUrl: merchant.logoUrl || null,
    })

    // Convert base64 data URL to Buffer
    const base64Data = qrDataUrl.replace(/^data:image\/\w+;base64,/, "")
    const qrRawBuffer = Buffer.from(base64Data, "base64")

    // Resize QR to exact bounding box
    const qrBuffer = await sharp(qrRawBuffer)
      .resize(config.qr.width, config.qr.height, { fit: "fill" })
      .png()
      .toBuffer()

    const composites: sharp.OverlayOptions[] = []

    // Prepend clean white rounded card backing under QR if configured
    if (config.whiteCard) {
      const cardSvg = Buffer.from(`
        <svg width="${config.whiteCard.width}" height="${config.whiteCard.height}">
          <rect x="0" y="0" width="${config.whiteCard.width}" height="${config.whiteCard.height}" rx="${config.whiteCard.rx}" ry="${config.whiteCard.rx}" fill="#ffffff"/>
        </svg>
      `)
      const cardBuf = await sharp(cardSvg).png().toBuffer()
      composites.push({
        input: cardBuf,
        left: config.whiteCard.left,
        top: config.whiteCard.top,
      })
    }

    composites.push({
      input: qrBuffer,
      left: config.qr.left,
      top: config.qr.top,
    })

    // 3. Composite CustomerPilot Logo Badge if configured
    if (config.cpBadge) {
      const cpLogoPath = path.join(process.cwd(), "public", "cplogo.png")
      if (fs.existsSync(cpLogoPath)) {
        const badgeSvg = Buffer.from(`
          <svg width="${config.cpBadge.width}" height="${config.cpBadge.height}">
            <rect x="0" y="0" width="${config.cpBadge.width}" height="${config.cpBadge.height}" rx="${Math.round(config.cpBadge.height / 2)}" ry="${Math.round(config.cpBadge.height / 2)}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
          </svg>
        `)
        const cpLogoResized = await sharp(cpLogoPath)
          .resize({ width: Math.round(config.cpBadge.width * 0.88), fit: "inside" })
          .png()
          .toBuffer()

        const cpBadgeBuffer = await sharp(badgeSvg)
          .composite([{ input: cpLogoResized, gravity: "center" }])
          .png()
          .toBuffer()

        composites.push({
          input: cpBadgeBuffer,
          left: config.cpBadge.left,
          top: config.cpBadge.top,
        })
      }
    }

    // 4. Composite live elements onto photorealistic tabletop standee
    const finalImageBuffer = await sharp(baseImagePath)
      .composite(composites)
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer()

    return new NextResponse(finalImageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    })
  } catch (error: any) {
    console.error("Standee render error:", error)
    return new NextResponse("Error generating standee: " + error.message, { status: 500 })
  }
}
