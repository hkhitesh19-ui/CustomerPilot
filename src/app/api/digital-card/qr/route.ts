import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resolveDigitalCardBySlug } from "@/lib/digital-card-service"
import QRCode from "qrcode"
import sharp from "sharp"
import path from "path"
import fs from "fs"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    const merchantId = searchParams.get("merchantId")
    const download = searchParams.get("download") === "1" || searchParams.get("download") === "true"
    const size = Math.min(Math.max(parseInt(searchParams.get("size") || "600", 10), 200), 2000)

    let card: any = null

    if (slug) {
      card = await resolveDigitalCardBySlug(slug)
    }

    if (!card && merchantId) {
      card = await db.digitalBusinessCard.findFirst({
        where: { merchantId },
        include: { merchant: true }
      })
    }

    if (!card) {
      // Default fallback
      card = await db.digitalBusinessCard.findFirst({
        include: { merchant: true }
      })
    }

    if (!card) {
      return NextResponse.json({ error: "Digital Business Card not found" }, { status: 404 })
    }

    const host = req.headers.get("host") || "customerpilot.in"
    const protocol = host.includes("localhost") ? "http" : "https"
    const targetUrl = `${protocol}://${host}/c/${card.slug}`

    // 1. Generate base QR code buffer (Level H error correction)
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      errorCorrectionLevel: "H",
      type: "png",
      width: size,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })

    // 2. Resolve logo
    const rawLogoUrl = card.logoUrl || card.merchant?.logoUrl || null
    let logoBuffer: Buffer | null = null

    if (rawLogoUrl) {
      try {
        if (rawLogoUrl.startsWith("http://") || rawLogoUrl.startsWith("https://")) {
          const res = await fetch(rawLogoUrl, { signal: AbortSignal.timeout(4000) })
          if (res.ok) {
            logoBuffer = Buffer.from(await res.arrayBuffer())
          }
        } else {
          // Local path like /uploads/...
          const cleanLocal = rawLogoUrl.replace(/^\/+/, "")
          const fullPath = path.join(process.cwd(), "public", cleanLocal)
          if (fs.existsSync(fullPath)) {
            logoBuffer = fs.readFileSync(fullPath)
          }
        }
      } catch (err) {
        console.warn("[QR_API] Failed to fetch or read logo:", err)
      }
    }

    // 3. Composite center logo if available
    let finalBuffer = qrBuffer

    if (logoBuffer) {
      try {
        const logoSize = Math.round(size * 0.22)
        const padSize = Math.round(size * 0.26)
        const rx = Math.round(padSize * 0.2)

        const badgeSvg = `
          <svg width="${padSize}" height="${padSize}" viewBox="0 0 ${padSize} ${padSize}">
            <rect x="0" y="0" width="${padSize}" height="${padSize}" rx="${rx}" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
          </svg>
        `

        const resizedLogo = await sharp(logoBuffer)
          .resize(logoSize, logoSize, {
            fit: "contain",
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          })
          .toBuffer()

        const badgeBuffer = await sharp(Buffer.from(badgeSvg))
          .composite([{ input: resizedLogo, gravity: "center" }])
          .png()
          .toBuffer()

        finalBuffer = await sharp(qrBuffer)
          .composite([{ input: badgeBuffer, gravity: "center" }])
          .png()
          .toBuffer()
      } catch (err) {
        console.warn("[QR_API] Sharp composite failed, falling back to base QR:", err)
        finalBuffer = qrBuffer
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    }

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${card.slug}-digital-card-qr.png"`
    }

    return new NextResponse(finalBuffer as any, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("[QR_API_ERROR]", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
