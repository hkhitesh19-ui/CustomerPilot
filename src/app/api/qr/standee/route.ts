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
}

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
  // Backwards-compatible aliases for previously selected design keys
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

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const design = (url.searchParams.get("design") || "bakery") as string
    const merchantId = url.searchParams.get("m") || req.headers.get("x-merchant-id")

    if (!merchantId) {
      return new NextResponse("Merchant ID required", { status: 400 })
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
    })

    if (!merchant) {
      return new NextResponse("Merchant not found", { status: 404 })
    }

    const config = STANDEE_COORDS[design] || STANDEE_COORDS.bakery
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

    const composites: sharp.OverlayOptions[] = [
      {
        input: qrBuffer,
        left: config.qr.left,
        top: config.qr.top,
      },
    ]

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
