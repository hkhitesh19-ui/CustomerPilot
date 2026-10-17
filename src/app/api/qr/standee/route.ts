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
    image: "standee_master_authentic.jpg",
    qr: { left: 236, top: 381, width: 250, height: 250 },
    darkColor: "#0f172a",
    whiteCard: { left: 196, top: 363, width: 330, height: 286, rx: 22 },
    headerPill: { left: 122, top: 16, width: 480, height: 104 },
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
    image: "standee_master_authentic.jpg",
    qr: { left: 236, top: 381, width: 250, height: 250 },
    darkColor: "#0f172a",
    whiteCard: { left: 196, top: 363, width: 330, height: 286, rx: 22 },
    headerPill: { left: 122, top: 16, width: 480, height: 104 },
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

    // 1. Generate live target URL
    // In CustomerPilot Complete ("master" design), if merchant has an active Digital Business Card,
    // scanning the Master Standee opens their Smart Digital Business Card (/c/[slug]) where both
    // Digital Loyalty Stamp and Smart AI Google Review modules are available!
    let targetUrl = ""
    const digitalCard = await db.digitalBusinessCard.findFirst({
      where: { merchantId: merchant.id, isActive: true },
    })

    if (digitalCard && (design === "master" || !design)) {
      const host = req.headers.get("host") || "localhost:3000"
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https"
      targetUrl = `${protocol}://${host}/c/${digitalCard.slug}`
    } else {
      const merchantPhone = normalizePhone(merchant.whatsappPhone) || "919999999999"
      const bizName = merchant.name || "our store"
      const joinText = `Hi ${bizName}! Checking in for my VIP Club stamps 🎁`
      targetUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(joinText)}`
    }

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
      const w = config.whiteCard.width
      const h = config.whiteCard.height
      const rx = config.whiteCard.rx
      const cardSvg = Buffer.from(`
        <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <!-- White card backdrop -->
          <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
          <!-- Authentic Gold Corner Scan Framing Brackets matching master template -->
          <path d="M 16 46 L 16 16 L 46 16" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M ${w - 46} 16 L ${w - 16} 16 L ${w - 16} 46" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M 16 ${h - 46} L 16 ${h - 16} L 46 ${h - 16}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M ${w - 46} ${h - 16} L ${w - 16} ${h - 16} L ${w - 16} ${h - 46}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
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

    // 4. Composite Merchant Branding Header in top Arch (Universal for ALL merchants)
    if (config.headerPill) {
      const archCx = 361
      const archCy = 84

      let logoBuf: Buffer | null = null

      if (merchant.logoUrl && (merchant.logoUrl.startsWith("http") || merchant.logoUrl.startsWith("/") || merchant.logoUrl.startsWith("data:"))) {
        try {
          if (merchant.logoUrl.startsWith("data:")) {
            const base64Data = merchant.logoUrl.split(",")[1]
            if (base64Data) {
              logoBuf = Buffer.from(base64Data, "base64")
            }
          } else if (merchant.logoUrl.startsWith("http")) {
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
                const logoRes = await fetch(merchant.logoUrl, { signal: controller.signal, redirect: "error" })
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
        } catch (e) {
          console.warn("Logo load error:", e)
        }
      }

      if (logoBuf) {
        try {
          const meta = await sharp(logoBuf).metadata()
          const lw = meta.width || 100
          const lh = meta.height || 100
          const aspect = lw / lh

          if (aspect >= 0.75 && aspect <= 1.25) {
            // Circular / Square Medallion (e.g. Vinayak Fashion)
            const diam = 126
            const maskSvg = Buffer.from(`
              <svg width="${diam}" height="${diam}">
                <circle cx="${diam / 2}" cy="${diam / 2}" r="${diam / 2 - 2}" fill="#ffffff"/>
              </svg>
            `)

            const resizedLogo = await sharp(logoBuf)
              .resize(diam, diam, { fit: "cover" })
              .png()
              .toBuffer()

            const circularLogo = await sharp(resizedLogo)
              .composite([{ input: maskSvg, blend: "dest-in" }])
              .png()
              .toBuffer()

            const frameSvg = Buffer.from(`
              <svg width="${diam}" height="${diam}">
                <circle cx="${diam / 2}" cy="${diam / 2}" r="${diam / 2 - 2}" fill="none" stroke="#d4af37" stroke-width="3"/>
                <circle cx="${diam / 2}" cy="${diam / 2}" r="${diam / 2 - 4}" fill="none" stroke="#fef08a" stroke-width="1"/>
              </svg>
            `)

            const medallionBuf = await sharp(circularLogo)
              .composite([{ input: frameSvg }])
              .png()
              .toBuffer()

            const medLeft = Math.round(archCx - diam / 2)
            const medRight = Math.round(archCx + diam / 2)

            const wingsSvg = Buffer.from(`
              <svg width="723" height="170" xmlns="http://www.w3.org/2000/svg">
                <!-- Left Wing -->
                <line x1="${medLeft - 16}" y1="${archCy}" x2="${medLeft - 140}" y2="${archCy}" stroke="#d4af37" stroke-width="2.5"/>
                <line x1="${medLeft - 16}" y1="${archCy - 1}" x2="${medLeft - 140}" y2="${archCy - 1}" stroke="#fef08a" stroke-width="1"/>
                <polygon points="${medLeft - 16},${archCy} ${medLeft - 24},${archCy - 4} ${medLeft - 32},${archCy} ${medLeft - 24},${archCy + 4}" fill="#fef08a"/>
                <circle cx="${medLeft - 142}" cy="${archCy}" r="3" fill="#d4af37"/>

                <!-- Right Wing -->
                <line x1="${medRight + 16}" y1="${archCy}" x2="${medRight + 140}" y2="${archCy}" stroke="#d4af37" stroke-width="2.5"/>
                <line x1="${medRight + 16}" y1="${archCy - 1}" x2="${medRight + 140}" y2="${archCy - 1}" stroke="#fef08a" stroke-width="1"/>
                <polygon points="${medRight + 16},${archCy} ${medRight + 24},${archCy - 4} ${medRight + 32},${archCy} ${medRight + 24},${archCy + 4}" fill="#fef08a"/>
                <circle cx="${medRight + 142}" cy="${archCy}" r="3" fill="#d4af37"/>
              </svg>
            `)

            composites.push({
              input: wingsSvg,
              left: 0,
              top: 0,
            })

            composites.push({
              input: medallionBuf,
              left: medLeft,
              top: Math.round(archCy - diam / 2),
            })
          } else {
            // Wide / Landscape Logo (e.g. Cake Connection, Gujarat Photo Goods)
            const pw = 440
            const ph = 108
            const maxLw = pw - 36
            const maxLh = ph - 16

            const plaqueSvg = Buffer.from(`
              <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#ffffff" stroke="#d4af37" stroke-width="3"/>
                <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
              </svg>
            `)

            const resizedLogo = await sharp(logoBuf)
              .resize({ width: maxLw, height: maxLh, fit: "inside" })
              .png()
              .toBuffer()

            const plaqueBuf = await sharp(plaqueSvg)
              .composite([{ input: resizedLogo, gravity: "center" }])
              .png()
              .toBuffer()

            composites.push({
              input: plaqueBuf,
              left: Math.round(archCx - pw / 2),
              top: Math.round(archCy - ph / 2),
            })
          }
        } catch (e) {
          console.warn("Logo overlay composite error:", e)
        }
      } else {
        // Luxury Typography Wordmark (Store Name Fallback)
        const pw = 440
        const ph = 108
        const rawName = merchant.name || "CustomerPilot VIP"
        const fontSize = rawName.length > 28 ? 20 : rawName.length > 22 ? 24 : rawName.length > 16 ? 28 : 32
        const safeName = rawName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

        const wordmarkSvg = Buffer.from(`
          <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#061a32" stroke="#d4af37" stroke-width="3"/>
            <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
            <text x="${pw / 2}" y="44" font-family="'Times New Roman', Georgia, serif" font-size="${fontSize}" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">${safeName}</text>
            <text x="${pw / 2}" y="78" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#93c5fd" text-anchor="middle" letter-spacing="2">OFFICIAL LOYALTY PARTNER</text>
          </svg>
        `)

        const wordmarkBuf = await sharp(wordmarkSvg).png().toBuffer()
        composites.push({
          input: wordmarkBuf,
          left: Math.round(archCx - pw / 2),
          top: Math.round(archCy - ph / 2),
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
