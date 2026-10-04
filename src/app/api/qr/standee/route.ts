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
  headerPill?: { left: number; top: number; width: number; height: number }
}

// 3D Tabletop Studio Mockups (Displayed on Merchant Dashboard preview)
const STANDEE_COORDS: Record<string, StandeeConfig> = {
  master: {
    image: "standee_universal_base.jpg",
    qr: { left: 255, top: 400, width: 256, height: 230 },
    darkColor: "#0f172a",
    whiteCard: { left: 248, top: 392, width: 270, height: 246, rx: 16 },
    headerPill: { left: 132, top: 18, width: 455, height: 130 },
  },
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
  master: {
    image: "standee_universal_base.jpg",
    qr: { left: 255, top: 400, width: 256, height: 230 },
    darkColor: "#0f172a",
    whiteCard: { left: 248, top: 392, width: 270, height: 246, rx: 16 },
    headerPill: { left: 132, top: 18, width: 455, height: 130 },
  },
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
    const design = (url.searchParams.get("design") || "master") as string
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
    const config = configMap[design] || configMap.master || configMap.bakery
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

    // 4. Composite Merchant Branding Header Pill if configured (Master Template)
    if (config.headerPill) {
      let headerContentBuf: Buffer | null = null

      if (merchant.logoUrl && (merchant.logoUrl.startsWith("http") || merchant.logoUrl.startsWith("/"))) {
        try {
          let logoBuf: Buffer | null = null
          if (merchant.logoUrl.startsWith("http")) {
            const parsedUrl = new URL(merchant.logoUrl)
            const host = parsedUrl.hostname.toLowerCase()
            const isDisallowedHost = 
              host === "localhost" ||
              host === "127.0.0.1" ||
              host.startsWith("192.168.") ||
              host.startsWith("10.") ||
              host.startsWith("172.16.") ||
              host.startsWith("169.254.") ||
              host.endsWith(".internal") ||
              host.endsWith(".local")

            if (!isDisallowedHost && (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:")) {
              const controller = new AbortController()
              const timeout = setTimeout(() => controller.abort(), 5000)
              try {
                const logoRes = await fetch(merchant.logoUrl, { signal: controller.signal })
                clearTimeout(timeout)
                const contentLength = Number(logoRes.headers.get("content-length")) || 0
                if (logoRes.ok && contentLength < 5 * 1024 * 1024) {
                  logoBuf = Buffer.from(await logoRes.arrayBuffer())
                }
              } catch {
                clearTimeout(timeout)
              }
            }
          } else {
            const publicDir = path.resolve(process.cwd(), "public")
            const cleanPath = merchant.logoUrl.replace(/^\/+/, "")
            const localPath = path.resolve(publicDir, cleanPath)
            if (localPath.startsWith(publicDir) && fs.existsSync(localPath)) {
              logoBuf = fs.readFileSync(localPath)
            }
          }

          if (logoBuf) {
            const resizedLogo = await sharp(logoBuf)
              .resize({ width: Math.round(config.headerPill.width * 0.75), height: Math.round(config.headerPill.height * 0.75), fit: "inside" })
              .png()
              .toBuffer()

            const pillSvg = Buffer.from(`
              <svg width="${config.headerPill.width}" height="${config.headerPill.height}" viewBox="0 0 ${config.headerPill.width} ${config.headerPill.height}">
                <rect x="2" y="2" width="${config.headerPill.width - 4}" height="${config.headerPill.height - 4}" rx="20" fill="#05101c" stroke="#d4af37" stroke-width="2"/>
              </svg>
            `)
            headerContentBuf = await sharp(pillSvg)
              .composite([{ input: resizedLogo, gravity: "center" }])
              .png()
              .toBuffer()
          }
        } catch (e) {
          console.warn("Logo overlay fallback to wordmark:", e)
        }
      }

      // If no logo or logo overlay failed, render Times New Roman serif wordmark
      if (!headerContentBuf) {
        const rawName = merchant.name || "CustomerPilot VIP"
        const displayName = rawName.length > 25 ? rawName.slice(0, 24) + "…" : rawName
        const fontSize = displayName.length > 18 ? 26 : displayName.length > 12 ? 30 : 34

        const wordmarkSvg = Buffer.from(`
          <svg width="${config.headerPill.width}" height="${config.headerPill.height}" viewBox="0 0 ${config.headerPill.width} ${config.headerPill.height}">
            <rect x="2" y="2" width="${config.headerPill.width - 4}" height="${config.headerPill.height - 4}" rx="20" fill="#05101c" stroke="#d4af37" stroke-width="2"/>
            <text x="50%" y="58%" font-family="'Times New Roman', Georgia, serif" font-size="${fontSize}" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">${displayName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
          </svg>
        `)
        headerContentBuf = await sharp(wordmarkSvg).png().toBuffer()
      }

      if (headerContentBuf) {
        composites.push({
          input: headerContentBuf,
          left: config.headerPill.left,
          top: config.headerPill.top,
        })
      }
    }

    // 5. Composite live elements onto photorealistic tabletop standee
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
