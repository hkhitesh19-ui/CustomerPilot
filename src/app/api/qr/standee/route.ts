import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import QRCode from "qrcode"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { getOrCreateDigitalBusinessCard } from "@/lib/digital-card-service"

interface StandeeConfig {
  image: string
  qr: { left: number; top: number; width: number; height: number }
  darkColor: string
  cpBadge?: { left: number; top: number; width: number; height: number }
  whiteCard?: { left: number; top: number; width: number; height: number; rx: number }
  headerPill?: { left: number; top: number; width: number; height: number }
}

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
}

// Helper: load merchant logo buffer safely
async function getMerchantLogoBuffer(logoUrl: string | null | undefined): Promise<Buffer | null> {
  if (!logoUrl) return null
  try {
    if (logoUrl.startsWith("data:")) {
      const base64Data = logoUrl.split(",")[1]
      return base64Data ? Buffer.from(base64Data, "base64") : null
    }
    if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
      const parsedUrl = new URL(logoUrl)
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

      if (!isDisallowedHost) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        try {
          const res = await fetch(logoUrl, { signal: controller.signal, redirect: "error" })
          clearTimeout(timeout)
          if (res.ok) {
            return Buffer.from(await res.arrayBuffer())
          }
        } catch {
          clearTimeout(timeout)
        }
      }
    }
    const publicDir = path.resolve(process.cwd(), "public")
    const cleanPath = logoUrl.replace(/^\/+/, "")
    const localPath = path.resolve(publicDir, cleanPath)
    if (localPath.startsWith(publicDir) && fs.existsSync(localPath)) {
      return fs.readFileSync(localPath)
    }
  } catch (e) {
    console.warn("Logo load error:", e)
  }
  return null
}

// Helper: create crisp QR code with merchant logo embedded in center
async function createBrandedQRBuffer(
  targetUrl: string,
  qrSize: number,
  logoBuffer: Buffer | null,
  darkColor: string = "#0f172a"
): Promise<Buffer> {
  // Generate QR directly at exact target size without fuzzy interpolation
  // ErrorCorrectionLevel "H" provides 30% recovery capacity
  const qrRaw = await QRCode.toBuffer(targetUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: qrSize,
    color: { dark: darkColor, light: "#ffffff" },
  })

  let qrSharp = sharp(qrRaw)

  if (logoBuffer) {
    try {
      // 20% logo badge width covers only 4% of total QR area, leaving 26% safety margin
      // for instant scan on all phone cameras, screens, and low-light environments
      const badgeSize = Math.round(qrSize * 0.20)
      const logoInnerSize = Math.round(badgeSize * 0.78)
      const resizedLogo = await sharp(logoBuffer)
        .resize({ width: logoInnerSize, height: logoInnerSize, fit: "inside" })
        .png()
        .toBuffer()

      const badgeSvg = Buffer.from(
        `<svg width="${badgeSize}" height="${badgeSize}">
          <rect x="0" y="0" width="${badgeSize}" height="${badgeSize}" rx="8" ry="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.8"/>
        </svg>`
      )

      const badgeWithLogo = await sharp(badgeSvg)
        .composite([{ input: resizedLogo, gravity: "center" }])
        .png()
        .toBuffer()

      return await qrSharp
        .composite([{ input: badgeWithLogo, gravity: "center" }])
        .png()
        .toBuffer()
    } catch (e) {
      console.warn("QR logo embed error:", e)
    }
  }

  return await qrSharp.png().toBuffer()
}

// Helper: composite merchant header plaque or circular medallion
async function compositeMerchantHeader(
  composites: sharp.OverlayOptions[],
  merchant: any,
  logoBuffer: Buffer | null,
  width: number = 723
) {
  const archCx = Math.round(width / 2)
  const archCy = 88

  if (logoBuffer) {
    try {
      const meta = await sharp(logoBuffer).metadata()
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
        const resizedLogo = await sharp(logoBuffer)
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
          <svg width="${width}" height="170" xmlns="http://www.w3.org/2000/svg">
            <line x1="${medLeft - 16}" y1="${archCy}" x2="${medLeft - 140}" y2="${archCy}" stroke="#d4af37" stroke-width="2.5"/>
            <line x1="${medLeft - 16}" y1="${archCy - 1}" x2="${medLeft - 140}" y2="${archCy - 1}" stroke="#fef08a" stroke-width="1"/>
            <polygon points="${medLeft - 16},${archCy} ${medLeft - 24},${archCy - 4} ${medLeft - 32},${archCy} ${medLeft - 24},${archCy + 4}" fill="#fef08a"/>
            <circle cx="${medLeft - 142}" cy="${archCy}" r="3" fill="#d4af37"/>
            <line x1="${medRight + 16}" y1="${archCy}" x2="${medRight + 140}" y2="${archCy}" stroke="#d4af37" stroke-width="2.5"/>
            <line x1="${medRight + 16}" y1="${archCy - 1}" x2="${medRight + 140}" y2="${archCy - 1}" stroke="#fef08a" stroke-width="1"/>
            <polygon points="${medRight + 16},${archCy} ${medRight + 24},${archCy - 4} ${medRight + 32},${archCy} ${medRight + 24},${archCy + 4}" fill="#fef08a"/>
            <circle cx="${medRight + 142}" cy="${archCy}" r="3" fill="#d4af37"/>
          </svg>
        `)

        composites.push({ input: wingsSvg, left: 0, top: 0 })
        composites.push({ input: medallionBuf, left: medLeft, top: Math.round(archCy - diam / 2) })
      } else {
        // Wide / Landscape Plaque (e.g. Cake Connection)
        const pw = 420
        const ph = 104
        const plaqueSvg = Buffer.from(`
          <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#ffffff" stroke="#d4af37" stroke-width="2.5"/>
            <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
          </svg>
        `)
        const resizedLogo = await sharp(logoBuffer)
          .resize({ width: pw - 36, height: ph - 16, fit: "inside" })
          .png()
          .toBuffer()
        const plaqueBuf = await sharp(plaqueSvg)
          .composite([{ input: resizedLogo, gravity: "center" }])
          .png()
          .toBuffer()

        composites.push({ input: plaqueBuf, left: Math.round(archCx - pw / 2), top: Math.round(archCy - ph / 2) })
      }
    } catch (e) {
      console.warn("Logo overlay error:", e)
    }
  } else {
    // Wordmark Fallback
    const pw = 440
    const ph = 104
    const rawName = merchant.name || "CustomerPilot VIP"
    const fontSize = rawName.length > 28 ? 20 : rawName.length > 22 ? 24 : rawName.length > 16 ? 28 : 32
    const safeName = rawName.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

    const wordmarkSvg = Buffer.from(`
      <svg width="${pw}" height="${ph}" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="${pw - 4}" height="${ph - 4}" rx="18" fill="#061a32" stroke="#d4af37" stroke-width="3"/>
        <rect x="5" y="5" width="${pw - 10}" height="${ph - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
        <text x="${pw / 2}" y="44" font-family="'Times New Roman', Georgia, serif" font-size="${fontSize}" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">${safeName}</text>
        <text x="${pw / 2}" y="78" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#93c5fd" text-anchor="middle" letter-spacing="2">OFFICIAL PARTNER</text>
      </svg>
    `)
    const wordmarkBuf = await sharp(wordmarkSvg).png().toBuffer()
    composites.push({ input: wordmarkBuf, left: Math.round(archCx - pw / 2), top: Math.round(archCy - ph / 2) })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE A: SMART AI GOOGLE REVIEW STANDEE (723 x 1024)
// ─────────────────────────────────────────────────────────────────────────────
async function renderReviewStandee(merchant: any, logoBuffer: Buffer | null, targetUrl: string) {
  const width = 723
  const height = 1024

  const qrBuf = await createBrandedQRBuffer(targetUrl, 280, logoBuffer, "#0f172a")

  const baseSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#061932"/>
        <stop offset="100%" stop-color="#0f294a"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d4af37"/>
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.14"/>
      </filter>
    </defs>

    <rect width="${width}" height="${height}" fill="#f8fafc"/>
    <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="20" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="6,4"/>

    <!-- Top Navy Header Banner -->
    <path d="M 18 38 Q 18 18 38 18 L ${width - 38} 18 Q ${width - 18} 18 ${width - 18} 38 L ${width - 18} 170 L 18 170 Z" fill="url(#headerGrad)"/>
    <line x1="18" y1="170" x2="${width - 18}" y2="170" stroke="url(#goldGrad)" stroke-width="3.5"/>

    <!-- Hero Title Section -->
    <text x="${width / 2}" y="210" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="0.5">LOVED YOUR EXPERIENCE?</text>
    <text x="${width / 2}" y="238" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="3">RATE US 5 STARS ON</text>

    <!-- Google Wordmark + REVIEWS with Explicit X Coordinates -->
    <g transform="translate(205, 292)">
      <text x="0" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#4285F4">G</text>
      <text x="36" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#EA4335">o</text>
      <text x="63" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#FBBC05">o</text>
      <text x="90" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#4285F4">g</text>
      <text x="117" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#34A853">l</text>
      <text x="130" y="0" font-family="'Product Sans', Arial, sans-serif" font-size="44" font-weight="900" fill="#EA4335">e</text>
      <text x="172" y="-3" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="1">REVIEWS</text>
    </g>

    <!-- 5 Glowing Stars -->
    <g transform="translate(${width / 2}, 346)" text-anchor="middle">
      <text font-family="'Segoe UI', Arial, sans-serif" font-size="32" fill="#fbbf24" letter-spacing="6">&#9733;&#9733;&#9733;&#9733;&#9733;</text>
    </g>

    <!-- Center White QR Card Frame -->
    <rect x="196" y="392" width="330" height="330" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#cardShadow)"/>

    <!-- Google 4-Color Framing Brackets -->
    <path d="M 216 450 L 216 418 Q 216 414 220 414 L 252 414" fill="none" stroke="#EA4335" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M 470 414 L 502 414 Q 506 414 506 418 L 506 450" fill="none" stroke="#FBBC05" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M 216 668 L 216 700 Q 216 704 220 704 L 252 704" fill="none" stroke="#34A853" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M 470 704 L 502 704 Q 506 704 506 700 L 506 668" fill="none" stroke="#4285F4" stroke-width="6.5" stroke-linecap="round"/>

    <!-- 3 Bottom Feature Badges -->
    <g transform="translate(62, 746)">
      <g transform="translate(0, 0)">
        <rect width="180" height="96" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <circle cx="90" cy="30" r="16" fill="#fef3c7"/>
        <polygon points="89,19 81,30 90,30 87,41 99,28 90,28" fill="#d97706"/>
        <text x="90" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">10-SEC FAST</text>
        <text x="90" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Zero Typing Needed</text>
      </g>
      <g transform="translate(210, 0)">
        <rect width="180" height="96" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <circle cx="90" cy="30" r="16" fill="#dbeafe"/>
        <g transform="translate(90, 30)">
          <rect x="-6" y="-9" width="12" height="18" rx="2.5" fill="none" stroke="#2563eb" stroke-width="1.8"/>
          <circle cx="0" cy="5" r="1.2" fill="#2563eb"/>
        </g>
        <text x="90" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">ZERO APP</text>
        <text x="90" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Use Any Phone Camera</text>
      </g>
      <g transform="translate(420, 0)">
        <rect width="180" height="96" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <circle cx="90" cy="30" r="16" fill="#f3e8ff"/>
        <g transform="translate(90, 30)">
          <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill="#9333ea"/>
          <circle cx="5" cy="-5" r="1.2" fill="#a855f7"/>
        </g>
        <text x="90" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">AI DRAFTED</text>
        <text x="90" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">1-Tap Maps Publish</text>
      </g>
    </g>

    <!-- Bottom Instruction Step Bar -->
    <rect x="42" y="876" width="${width - 84}" height="56" rx="14" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.2"/>
    <text x="${width / 2}" y="910" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="700" fill="#1e40af" text-anchor="middle">
      Open Phone Camera &#8594; Scan QR &#8594; Tap 5 Stars on Google Maps
    </text>

    <!-- Bottom Dark Footer -->
    <path d="M 18 ${height - 66} L ${width - 18} ${height - 66} L ${width - 18} ${height - 38} Q ${width - 18} ${height - 18} ${width - 38} ${height - 18} L 38 ${height - 18} Q 18 ${height - 18} 18 ${height - 38} Z" fill="#061932"/>
    <text x="${width / 2}" y="${height - 32}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; SMART AI GOOGLE REVIEWS
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [
    { input: baseBuf, left: 0, top: 0 },
    { input: qrBuf, left: 221, top: 417 },
  ]

  await compositeMerchantHeader(composites, merchant, logoBuffer, width)

  return await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite(composites)
    .jpeg({ quality: 94, mozjpeg: true })
    .toBuffer()
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE B: SMART DIGITAL BUSINESS CARD STANDEE (723 x 1024)
// ─────────────────────────────────────────────────────────────────────────────
async function renderCardStandee(merchant: any, logoBuffer: Buffer | null, targetUrl: string) {
  const width = 723
  const height = 1024

  const qrBuf = await createBrandedQRBuffer(targetUrl, 280, logoBuffer, "#0f172a")

  const baseSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#061a32"/>
        <stop offset="30%" stop-color="#0b2447"/>
        <stop offset="70%" stop-color="#08182b"/>
        <stop offset="100%" stop-color="#030a14"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d4af37"/>
      </linearGradient>
      <filter id="goldShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#000000" flood-opacity="0.4"/>
      </filter>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#cardBg)"/>
    <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="24" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="none" stroke="#fef08a" stroke-width="1" stroke-opacity="0.6"/>

    <line x1="24" y1="170" x2="${width - 24}" y2="170" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <text x="${width / 2}" y="220" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="1.5">SCAN TO CONNECT</text>
    <text x="${width / 2}" y="250" font-family="'Segoe UI', Arial, sans-serif" font-size="14.5" font-weight="700" fill="#93c5fd" text-anchor="middle" letter-spacing="1">SAVE OUR CONTACT &#8226; EXPLORE DIGITAL CARD</text>
    <text x="${width / 2}" y="278" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1" text-anchor="middle">1-Tap Contact Save &#8226; Instant WhatsApp &#8226; Product Catalog</text>

    <!-- Center QR Box Backing -->
    <rect x="196" y="320" width="330" height="330" rx="26" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3.5" filter="url(#goldShadow)"/>

    <!-- Corner Gold Frame Brackets -->
    <path d="M 216 376 L 216 344 Q 216 340 220 340 L 252 340" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 340 L 502 340 Q 506 340 506 344 L 506 376" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 216 594 L 216 626 Q 216 630 220 630 L 252 630" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 630 L 502 630 Q 506 630 506 626 L 506 594" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>

    <!-- 3 Bottom Action Cards -->
    <g transform="translate(62, 716)">
      <g transform="translate(0, 0)">
        <rect width="180" height="110" rx="18" fill="#0f294a" stroke="#1e3a5f" stroke-width="1.5"/>
        <circle cx="90" cy="34" r="20" fill="#1e3a5f"/>
        <g transform="translate(90, 34)">
          <circle cx="0" cy="-4" r="5" fill="#fef08a"/>
          <path d="M -8 9 C -8 3 -4 3 0 3 C 4 3 8 3 8 9 Z" fill="#fef08a"/>
        </g>
        <text x="90" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle">SAVE CONTACT</text>
        <text x="90" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Phone, Email &amp; WhatsApp</text>
      </g>
      <g transform="translate(210, 0)">
        <rect width="180" height="110" rx="18" fill="#0f294a" stroke="#1e3a5f" stroke-width="1.5"/>
        <circle cx="90" cy="34" r="20" fill="#1e3a5f"/>
        <g transform="translate(90, 34)">
          <rect x="-6" y="-3" width="12" height="12" rx="2" fill="none" stroke="#fef08a" stroke-width="1.8"/>
          <path d="M -3 -3 Q -3 -7 0 -7 Q 3 -7 3 -3" fill="none" stroke="#fef08a" stroke-width="1.8"/>
        </g>
        <text x="90" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle">CATALOG &amp; MENU</text>
        <text x="90" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Products, Cakes &amp; Prices</text>
      </g>
      <g transform="translate(420, 0)">
        <rect width="180" height="110" rx="18" fill="#0f294a" stroke="#1e3a5f" stroke-width="1.5"/>
        <circle cx="90" cy="34" r="20" fill="#1e3a5f"/>
        <g transform="translate(90, 34)">
          <path d="M 0 -8 C -4 -8 -7 -4 -7 0 C -7 5 0 10 0 10 C 0 10 7 5 7 0 C 7 -4 4 -8 0 -8 Z" fill="#fef08a"/>
          <circle cx="0" cy="-1" r="2.2" fill="#0f294a"/>
        </g>
        <text x="90" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle">MAPS &amp; SOCIALS</text>
        <text x="90" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Google Maps &amp; Instagram</text>
      </g>
    </g>

    <!-- Bottom Gold Highlight Banner -->
    <rect x="42" y="876" width="${width - 84}" height="54" rx="16" fill="#061932" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="${width / 2}" y="909" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      Tap "Save to Phone" to Add Store Card Directly to Contacts
    </text>

    <!-- Footer Branding -->
    <text x="${width / 2}" y="${height - 30}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; SMART DIGITAL BUSINESS CARD
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [
    { input: baseBuf, left: 0, top: 0 },
    { input: qrBuf, left: 221, top: 345 },
  ]

  await compositeMerchantHeader(composites, merchant, logoBuffer, width)

  return await sharp({
    create: { width, height, channels: 4, background: { r: 6, g: 26, b: 50, alpha: 1 } },
  })
    .composite(composites)
    .jpeg({ quality: 94, mozjpeg: true })
    .toBuffer()
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE C: CONNECT & REVIEW DUO STANDEE (723 x 1024)
// ─────────────────────────────────────────────────────────────────────────────
async function renderComboStandee(merchant: any, logoBuffer: Buffer | null, targetUrl: string) {
  const width = 723
  const height = 1024

  const qrBuf = await createBrandedQRBuffer(targetUrl, 280, logoBuffer, "#0f172a")

  const baseSvg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="comboBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0a192f"/>
        <stop offset="25%" stop-color="#112240"/>
        <stop offset="75%" stop-color="#0b172a"/>
        <stop offset="100%" stop-color="#020c1b"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#d4af37"/>
        <stop offset="50%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#d4af37"/>
      </linearGradient>
      <filter id="boxShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>

    <rect width="${width}" height="${height}" fill="url(#comboBg)"/>
    <rect x="14" y="14" width="${width - 28}" height="${height - 28}" rx="24" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="none" stroke="#fef08a" stroke-width="1" stroke-opacity="0.5"/>

    <line x1="24" y1="170" x2="${width - 24}" y2="170" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <text x="${width / 2}" y="214" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="0.5">CONNECT WITH US &amp; RATE YOUR EXPERIENCE</text>
    <text x="${width / 2}" y="240" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#93c5fd" text-anchor="middle" letter-spacing="1">SAVE CONTACT &#8226; VIEW CATALOG &#8226; 5-STAR GOOGLE REVIEW</text>

    <!-- Mini Stars -->
    <g transform="translate(${width / 2}, 268)" text-anchor="middle">
      <text font-family="'Segoe UI', Arial, sans-serif" font-size="22" fill="#fbbf24" letter-spacing="4">&#9733;&#9733;&#9733;&#9733;&#9733;</text>
    </g>

    <rect x="196" y="296" width="330" height="330" rx="26" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3.5" filter="url(#boxShadow)"/>

    <!-- Google 4-Color Brackets -->
    <path d="M 216 352 L 216 320 Q 216 316 220 316 L 252 316" fill="none" stroke="#EA4335" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 316 L 502 316 Q 506 316 506 320 L 506 352" fill="none" stroke="#FBBC05" stroke-width="6" stroke-linecap="round"/>
    <path d="M 216 570 L 216 602 Q 216 606 220 606 L 252 606" fill="none" stroke="#34A853" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 606 L 502 606 Q 506 606 506 602 L 506 570" fill="none" stroke="#4285F4" stroke-width="6" stroke-linecap="round"/>

    <!-- Two Dual Power Blocks -->
    <g transform="translate(48, 680)">
      <!-- Left: Digital Card -->
      <g transform="translate(0, 0)">
        <rect width="298" height="155" rx="20" fill="#0f294a" stroke="#234567" stroke-width="1.5"/>
        <rect x="14" y="14" width="36" height="36" rx="10" fill="#1e3a5f"/>
        <g transform="translate(32, 32)">
          <rect x="-5.5" y="-9" width="11" height="18" rx="2.5" fill="none" stroke="#fef08a" stroke-width="1.8"/>
          <circle cx="0" cy="5.5" r="1.2" fill="#fef08a"/>
        </g>
        <text x="60" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="900" fill="#fef08a">DIGITAL CARD</text>
        <circle cx="28" cy="73" r="6.5" fill="#10b981"/>
        <path d="M 25 73 L 27 75 L 31 70" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="42" y="77" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">1-Tap Save to Contacts</text>
        <circle cx="28" cy="97" r="6.5" fill="#10b981"/>
        <path d="M 25 97 L 27 99 L 31 94" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="42" y="101" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">WhatsApp Order &amp; Call</text>
        <circle cx="28" cy="121" r="6.5" fill="#10b981"/>
        <path d="M 25 121 L 27 123 L 31 118" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="42" y="125" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">Food Menu &amp; Catalog</text>
      </g>

      <!-- Right: Google Reviews -->
      <g transform="translate(328, 0)">
        <rect width="298" height="155" rx="20" fill="#0f294a" stroke="#234567" stroke-width="1.5"/>
        <rect x="14" y="14" width="36" height="36" rx="10" fill="#1e3a5f"/>
        <g transform="translate(32, 32)">
          <polygon points="0,-8 2.2,-2.5 8,-2 3.8,1.6 5.2,7.5 0,4.4 -5.2,7.5 -3.8,1.6 -8,-2 -2.2,-2.5" fill="#fef08a"/>
        </g>
        <text x="60" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="900" fill="#fef08a">GOOGLE REVIEWS</text>
        <circle cx="28" cy="73" r="6.5" fill="#3b82f6"/>
        <path d="M 25 73 L 27 75 L 31 70" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="42" y="77" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">5-Star Instant Rating</text>
        <circle cx="28" cy="97" r="6.5" fill="#3b82f6"/>
        <path d="M 25 97 L 27 99 L 31 94" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="42" y="101" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">AI Pre-Drafted Reviews</text>
        <circle cx="28" cy="121" r="6.5" fill="#3b82f6"/>
        <path d="M 25 121 L 27 123 L 31 118" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="42" y="125" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">Direct Google Maps Link</text>
      </g>
    </g>

    <!-- Bottom Instruction Bar -->
    <rect x="42" y="878" width="${width - 84}" height="52" rx="14" fill="#061932" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="${width / 2}" y="910" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      One Smart QR Code &#8226; Everything Your Customer Needs
    </text>

    <!-- Footer Branding -->
    <text x="${width / 2}" y="${height - 30}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; DIGITAL BUSINESS CARD &amp; AI REVIEWS
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [
    { input: baseBuf, left: 0, top: 0 },
    { input: qrBuf, left: 221, top: 321 },
  ]

  await compositeMerchantHeader(composites, merchant, logoBuffer, width)

  return await sharp({
    create: { width, height, channels: 4, background: { r: 10, g: 25, b: 47, alpha: 1 } },
  })
    .composite(composites)
    .jpeg({ quality: 94, mozjpeg: true })
    .toBuffer()
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE D: MASTER VIP LOYALTY STANDEE (723 x 1024)
// ─────────────────────────────────────────────────────────────────────────────
async function renderMasterStandee(
  merchant: any,
  logoBuffer: Buffer | null,
  targetUrl: string,
  config: StandeeConfig,
  baseImagePath: string
) {
  const qrBuf = await createBrandedQRBuffer(targetUrl, config.qr.width, logoBuffer, config.darkColor || "#0f172a")

  const composites: sharp.OverlayOptions[] = []

  // Prepend clean white rounded card backing under QR if configured
  if (config.whiteCard) {
    const w = config.whiteCard.width
    const h = config.whiteCard.height
    const rx = config.whiteCard.rx
    const cardSvg = Buffer.from(`
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <path d="M 16 46 L 16 16 L 46 16" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M ${w - 46} 16 L ${w - 16} 16 L ${w - 16} 46" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M 16 ${h - 46} L 16 ${h - 16} L 46 ${h - 16}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M ${w - 46} ${h - 16} L ${w - 16} ${h - 16} L ${w - 16} ${h - 46}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `)
    const cardBuf = await sharp(cardSvg).png().toBuffer()
    composites.push({ input: cardBuf, left: config.whiteCard.left, top: config.whiteCard.top })
  }

  composites.push({ input: qrBuf, left: config.qr.left, top: config.qr.top })

  // CustomerPilot Badge if configured
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

      composites.push({ input: cpBadgeBuffer, left: config.cpBadge.left, top: config.cpBadge.top })
    }
  }

  // Header branding in top arch
  if (config.headerPill) {
    await compositeMerchantHeader(composites, merchant, logoBuffer, 723)
  }

  return await sharp(baseImagePath)
    .composite(composites)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer()
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GET HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const rawDesign = (url.searchParams.get("design") || "auto").toLowerCase()
    const merchantId = url.searchParams.get("m") || req.headers.get("x-merchant-id")
    const isPrintFormat = url.searchParams.get("format") === "print"

    if (!merchantId) {
      return new NextResponse("Merchant ID required", { status: 400 })
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      include: {
        digitalBusinessCard: true,
        merchantGoogleConnections: true,
      },
    })

    if (!merchant) {
      return new NextResponse("Merchant not found", { status: 404 })
    }

    // Auto-resolve merchant's digital business card if missing
    let digitalCard = merchant.digitalBusinessCard
    if (!digitalCard) {
      digitalCard = await getOrCreateDigitalBusinessCard(merchant.id)
    }

    const enabledModules = merchant.enabledModules || "LOYALTY,REVIEWS,AUTOREPLY"
    const hasLoyalty = enabledModules.includes("LOYALTY")
    const hasReviews = enabledModules.includes("REVIEWS") || enabledModules.includes("AUTOREPLY")
    const hasCard = enabledModules.includes("DIGITAL_CARD") || !!digitalCard

    // Resolve design automatically if "auto" or empty
    let activeDesign = rawDesign
    if (activeDesign === "auto" || !activeDesign) {
      if (hasLoyalty) {
        activeDesign = "master"
      } else if (hasCard && hasReviews) {
        activeDesign = "combo"
      } else if (hasCard) {
        activeDesign = "card"
      } else if (hasReviews) {
        activeDesign = "review"
      } else {
        activeDesign = "master"
      }
    }

    // Map common aliases
    if (activeDesign === "reviews" || activeDesign === "google_review" || activeDesign === "template_a") {
      activeDesign = "review"
    }
    if (activeDesign === "digital_card" || activeDesign === "template_b") {
      activeDesign = "card"
    }
    if (activeDesign === "card_review" || activeDesign === "template_c") {
      activeDesign = "combo"
    }
    if (activeDesign === "loyalty" || activeDesign === "template_d") {
      activeDesign = "master"
    }

    const host = req.headers.get("host") || "customerpilot.in"
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https"
    const slug = digitalCard?.slug || merchant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    // Determine target URL based on active design
    let targetUrl = ""
    if (activeDesign === "review") {
      // Direct to Google Review or AI Review generator
      targetUrl =
        merchant.merchantGoogleConnections?.googleReviewUrl ||
        (merchant as any).googleReviewLink ||
        `${protocol}://${host}/c/${slug}`
    } else if (activeDesign === "card" || activeDesign === "combo") {
      // Smart Digital Business Card (contains both Card and Review CTA)
      targetUrl = `${protocol}://${host}/c/${slug}`
    } else {
      // Master Loyalty: opens digital card if available, else WhatsApp VIP join
      if (digitalCard) {
        targetUrl = `${protocol}://${host}/c/${slug}`
      } else {
        const merchantPhone = normalizePhone(merchant.whatsappPhone) || "919999999999"
        const bizName = merchant.name || "our store"
        const joinText = `Hi ${bizName}! Checking in for my VIP Club stamps 🎁`
        targetUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(joinText)}`
      }
    }

    const logoBuffer = await getMerchantLogoBuffer(merchant.logoUrl)

    let finalImageBuffer: Buffer

    if (activeDesign === "review") {
      finalImageBuffer = await renderReviewStandee(merchant, logoBuffer, targetUrl)
    } else if (activeDesign === "card") {
      finalImageBuffer = await renderCardStandee(merchant, logoBuffer, targetUrl)
    } else if (activeDesign === "combo") {
      finalImageBuffer = await renderComboStandee(merchant, logoBuffer, targetUrl)
    } else {
      // Master / Bakery / Royal / Celebration
      const configMap = isPrintFormat ? PRINT_POSTER_COORDS : STANDEE_COORDS
      const config = configMap[activeDesign] || configMap.master || configMap.bakery
      const baseImagePath = path.join(process.cwd(), "public", "standees", config.image)

      if (!fs.existsSync(baseImagePath)) {
        return new NextResponse("Standee template not found", { status: 404 })
      }

      finalImageBuffer = await renderMasterStandee(merchant, logoBuffer, targetUrl, config, baseImagePath)
    }

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
