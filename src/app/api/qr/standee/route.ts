import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import QRCode from "qrcode"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { getOrCreateDigitalBusinessCard } from "@/lib/digital-card-service"

export const dynamic = "force-dynamic"

type LogoSize = "l" | "xl" | "xxl"

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

function escapeXml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// Clean short store name for typographic fallback so long SEO titles never overflow
function getShortStoreDisplayName(raw: string | null | undefined, maxLen: number = 28): string {
  let clean = String(raw || "CustomerPilot VIP").trim()
  if (clean.length > maxLen) {
    const splitMatch = clean.split(/\s*(?:\(|:|\||—|–)\s*/)[0]?.trim()
    if (splitMatch && splitMatch.length >= 3) clean = splitMatch
  }
  if (clean.length > maxLen) {
    clean = clean.slice(0, maxLen - 1).trim() + "…"
  }
  return clean
}

function normalizeLogoSize(raw: string | null): LogoSize {
  const v = (raw || "xl").toLowerCase().trim()
  if (v === "l" || v === "md" || v === "medium") return "l"
  if (v === "xxl" || v === "hero" || v === "2xl") return "xxl"
  return "xl"
}

// Cache the tiny archival anti-banding matte grain tile in memory (generated once)
let cachedArchivalLightTile: Buffer | null = null
let cachedArchivalDarkTile: Buffer | null = null

async function getArchivalPrintTile(isDark: boolean): Promise<Buffer> {
  if (!isDark && cachedArchivalLightTile) return cachedArchivalLightTile
  if (isDark && cachedArchivalDarkTile) return cachedArchivalDarkTile

  const tileW = 256
  const tileH = 256
  const amp = isDark ? 6 : 2 // ±2 on light, ±6 overlay @ alpha 145 on dark (~±2-3 final RGB: invisible to human eye, true print RIP anti-banding)
  const raw = Buffer.alloc(tileW * tileH * 4)
  let seed = isDark ? 9876543 : 1234567
  for (let i = 0; i < tileW * tileH; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const delta = ((seed >>> 24) % (amp * 2 + 1)) - amp
    const base = isDark ? 128 + delta : 253 + delta
    const v = Math.min(255, Math.max(0, base))
    raw[i * 4] = v
    raw[i * 4 + 1] = v
    raw[i * 4 + 2] = v
    raw[i * 4 + 3] = isDark ? 155 : 255
  }
  const png = await sharp(raw, { raw: { width: tileW, height: tileH, channels: 4 } })
    .png()
    .toBuffer()

  if (isDark) cachedArchivalDarkTile = png
  else cachedArchivalLightTile = png
  return png
}

// Helper: load local asset from public/
function loadPublicAssetBuffer(relPath: string): Buffer | null {
  try {
    const publicDir = path.resolve(process.cwd(), "public")
    const cleanPath = relPath.replace(/^\/+/, "")
    const localPath = path.resolve(publicDir, cleanPath)
    if (localPath.startsWith(publicDir) && fs.existsSync(localPath)) {
      return fs.readFileSync(localPath)
    }
  } catch {}
  return null
}

// Helper: load merchant logo buffer safely & trim empty transparent/white padding
async function getMerchantLogoBuffer(logoUrl: string | null | undefined): Promise<Buffer | null> {
  if (!logoUrl) return null
  if (logoUrl.includes("cplogo") || logoUrl.includes("placeholder")) return null

  let rawBuf: Buffer | null = null
  try {
    if (logoUrl.startsWith("data:")) {
      const base64Data = logoUrl.split(",")[1]
      rawBuf = base64Data ? Buffer.from(base64Data, "base64") : null
    } else if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
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
            rawBuf = Buffer.from(await res.arrayBuffer())
          }
        } catch {
          clearTimeout(timeout)
        }
      }
    } else {
      rawBuf = loadPublicAssetBuffer(logoUrl)
    }
  } catch (e) {
    console.warn("Logo load error:", e)
  }

  if (!rawBuf) return null

  // Smart trim blank whitespace/transparent margins so L/XL/XXL sizing looks bold & accurate
  try {
    const trimmed = await sharp(rawBuf).trim({ threshold: 16 }).png().toBuffer()
    const tMeta = await sharp(trimmed).metadata()
    if ((tMeta.width || 0) >= 16 && (tMeta.height || 0) >= 16) {
      return trimmed
    }
  } catch {}

  return rawBuf
}

// Helper: create crisp QR code with optional center icon (merchant logo or WhatsApp icon)
async function createBrandedQRBuffer(
  targetUrl: string,
  qrSize: number,
  centerLogoBuffer: Buffer | null,
  darkColor: string = "#0f172a"
): Promise<Buffer> {
  const qrRaw = await QRCode.toBuffer(targetUrl, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: qrSize,
    color: { dark: darkColor, light: "#ffffff" },
  })

  const qrSharp = sharp(qrRaw)

  if (centerLogoBuffer) {
    try {
      const badgeSize = Math.round(qrSize * 0.21)
      const logoInnerSize = Math.round(badgeSize * 0.78)
      const rx = Math.max(8, Math.round(badgeSize * 0.16))
      const strokeW = Math.max(1.8, Math.round(qrSize / 150))
      const resizedLogo = await sharp(centerLogoBuffer)
        .resize({ width: logoInnerSize, height: logoInnerSize, fit: "inside" })
        .png()
        .toBuffer()

      const badgeSvg = Buffer.from(
        `<svg width="${badgeSize}" height="${badgeSize}" xmlns="http://www.w3.org/2000/svg">
          <rect x="${strokeW}" y="${strokeW}" width="${badgeSize - strokeW * 2}" height="${badgeSize - strokeW * 2}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#cbd5e1" stroke-width="${strokeW}"/>
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

// Helper: finalize buffer in either Fast Preview (723x1024) or Ultra-HD 600-DPI Print Master (~9–10 MB JPEG)
async function encodeFinalStandeeJpeg(
  baseCanvas: sharp.Sharp,
  composites: sharp.OverlayOptions[],
  opts: { hd: boolean; isDarkCanvas?: boolean; preserveNaturalMaster?: boolean; qrCompositeOnTop?: sharp.OverlayOptions }
): Promise<Buffer> {
  const finalComposites = [...composites]

  if (opts.hd && !opts.preserveNaturalMaster) {
    // Apply subtle archival print anti-banding finish (imperceptible to eye, true print-house bitrate ~9–10 MB)
    const grainTile = await getArchivalPrintTile(Boolean(opts.isDarkCanvas))
    finalComposites.push({
      input: grainTile,
      tile: true,
      blend: opts.isDarkCanvas ? "overlay" : "multiply",
    })
  }

  // Always composite the crisp QR code LAST so QR modules stay 100% pure black & white for instant scan
  if (opts.qrCompositeOnTop) {
    finalComposites.push(opts.qrCompositeOnTop)
  }

  let pipeline = baseCanvas.composite(finalComposites)

  if (opts.hd) {
    pipeline = pipeline.withMetadata({ density: 600 })
    return await pipeline
      .jpeg({ quality: 100, chromaSubsampling: "4:4:4", mozjpeg: false })
      .toBuffer()
  }

  return await pipeline
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer()
}

// Helper: composite merchant header plaque or circular medallion with L / XL / XXL scaling
async function compositeMerchantHeader(
  composites: sharp.OverlayOptions[],
  merchant: any,
  logoBuffer: Buffer | null,
  baseWidth: number = 723,
  scale: number = 1,
  logoSize: LogoSize = "xl"
) {
  const s = (n: number) => Math.round(n * scale)
  const archCx = s(baseWidth / 2)
  const archCy = s(88)

  // Scale factors for L / XL / XXL
  const sizeFactor = logoSize === "l" ? 0.88 : logoSize === "xxl" ? 1.24 : 1.06

  if (logoBuffer) {
    try {
      const meta = await sharp(logoBuffer).metadata()
      const lw = meta.width || 100
      const lh = meta.height || 100
      const aspect = lw / lh

      if (aspect >= 0.72 && aspect <= 1.28) {
        // Circular / Square Medallion
        const diam = s(Math.min(156, Math.round(122 * sizeFactor)))
        const maskSvg = Buffer.from(`
          <svg width="${diam}" height="${diam}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${diam / 2}" cy="${diam / 2}" r="${diam / 2 - s(2)}" fill="#ffffff"/>
          </svg>
        `)
        const resizedLogo = await sharp(logoBuffer)
          .resize(diam, diam, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .png()
          .toBuffer()
        const circularLogo = await sharp(resizedLogo)
          .composite([{ input: maskSvg, blend: "dest-in" }])
          .png()
          .toBuffer()
        const frameSvg = Buffer.from(`
          <svg width="${diam}" height="${diam}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${diam / 2}" cy="${diam / 2}" r="${diam / 2 - s(2)}" fill="none" stroke="#d4af37" stroke-width="${s(3)}"/>
            <circle cx="${diam / 2}" cy="${diam / 2}" r="${diam / 2 - s(4)}" fill="none" stroke="#fef08a" stroke-width="${Math.max(1, s(1))}"/>
          </svg>
        `)
        const medallionBuf = await sharp(circularLogo)
          .composite([{ input: frameSvg }])
          .png()
          .toBuffer()

        const medLeft = Math.round(archCx - diam / 2)
        const medRight = Math.round(archCx + diam / 2)

        const wingsSvg = Buffer.from(`
          <svg width="${s(baseWidth)}" height="${s(176)}" viewBox="0 0 ${baseWidth} 176" xmlns="http://www.w3.org/2000/svg">
            <line x1="${Math.round(medLeft / scale) - 14}" y1="88" x2="${Math.max(36, Math.round(medLeft / scale) - 130)}" y2="88" stroke="#d4af37" stroke-width="2.5"/>
            <circle cx="${Math.max(34, Math.round(medLeft / scale) - 132)}" cy="88" r="3" fill="#d4af37"/>
            <line x1="${Math.round(medRight / scale) + 14}" y1="88" x2="${Math.min(baseWidth - 36, Math.round(medRight / scale) + 130)}" y2="88" stroke="#d4af37" stroke-width="2.5"/>
            <circle cx="${Math.min(baseWidth - 34, Math.round(medRight / scale) + 132)}" cy="88" r="3" fill="#d4af37"/>
          </svg>
        `)

        composites.push({ input: wingsSvg, left: 0, top: 0 })
        composites.push({ input: medallionBuf, left: medLeft, top: Math.max(s(6), Math.round(archCy - diam / 2)) })
      } else {
        // Wide / Landscape Plaque
        const basePw = logoSize === "l" ? 370 : logoSize === "xxl" ? 510 : 440
        const basePh = logoSize === "l" ? 92 : logoSize === "xxl" ? 132 : 112
        const pw = s(basePw)
        const ph = s(basePh)
        const plaqueSvg = Buffer.from(`
          <svg width="${pw}" height="${ph}" viewBox="0 0 ${basePw} ${basePh}" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="${basePw - 4}" height="${basePh - 4}" rx="18" fill="#ffffff" stroke="#d4af37" stroke-width="2.5"/>
            <rect x="5" y="5" width="${basePw - 10}" height="${basePh - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
          </svg>
        `)
        const resizedLogo = await sharp(logoBuffer)
          .resize({ width: Math.round(pw - s(24)), height: Math.round(ph - s(14)), fit: "inside" })
          .png()
          .toBuffer()
        const plaqueBuf = await sharp(plaqueSvg)
          .composite([{ input: resizedLogo, gravity: "center" }])
          .png()
          .toBuffer()

        composites.push({
          input: plaqueBuf,
          left: Math.round(archCx - pw / 2),
          top: Math.max(s(8), Math.round(archCy - ph / 2)),
        })
      }
    } catch (e) {
      console.warn("Logo overlay error:", e)
    }
  } else {
    // Wordmark Fallback
    const basePw = 440
    const basePh = 104
    const pw = s(basePw)
    const ph = s(basePh)
    const rawName = getShortStoreDisplayName(merchant.name, 26)
    const fontSize = rawName.length > 22 ? 22 : rawName.length > 16 ? 26 : 30
    const safeName = escapeXml(rawName)

    const wordmarkSvg = Buffer.from(`
      <svg width="${pw}" height="${ph}" viewBox="0 0 ${basePw} ${basePh}" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="${basePw - 4}" height="${basePh - 4}" rx="18" fill="#061a32" stroke="#d4af37" stroke-width="3"/>
        <rect x="5" y="5" width="${basePw - 10}" height="${basePh - 10}" rx="15" fill="none" stroke="#fef08a" stroke-width="1"/>
        <text x="${basePw / 2}" y="44" font-family="'Times New Roman', Georgia, serif" font-size="${fontSize}" font-weight="bold" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">${safeName}</text>
        <text x="${basePw / 2}" y="78" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#93c5fd" text-anchor="middle" letter-spacing="2">OFFICIAL PARTNER</text>
      </svg>
    `)
    const wordmarkBuf = await sharp(wordmarkSvg).png().toBuffer()
    composites.push({ input: wordmarkBuf, left: Math.round(archCx - pw / 2), top: Math.round(archCy - ph / 2) })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE A: SMART AI GOOGLE REVIEW STANDEE (723 x 1024 | HD: 4338 x 6144)
// ─────────────────────────────────────────────────────────────────────────────
async function renderReviewStandee(
  merchant: any,
  logoBuffer: Buffer | null,
  targetUrl: string,
  logoSize: LogoSize,
  hd: boolean
) {
  const baseW = 723
  const baseH = 1024
  const scale = hd ? 6 : 1
  const width = baseW * scale
  const height = baseH * scale
  const s = (n: number) => Math.round(n * scale)

  const qrBuf = await createBrandedQRBuffer(targetUrl, s(280), logoBuffer, "#0f172a")

  const baseSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${baseW} ${baseH}" xmlns="http://www.w3.org/2000/svg">
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
    </defs>

    <rect width="${baseW}" height="${baseH}" fill="#f8fafc"/>
    <rect x="12" y="12" width="${baseW - 24}" height="${baseH - 24}" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="18" y="18" width="${baseW - 36}" height="${baseH - 36}" rx="20" fill="none" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="6,4"/>

    <path d="M 18 38 Q 18 18 38 18 L ${baseW - 38} 18 Q ${baseW - 18} 18 ${baseW - 18} 38 L ${baseW - 18} 170 L 18 170 Z" fill="url(#headerGrad)"/>
    <line x1="18" y1="170" x2="${baseW - 18}" y2="170" stroke="url(#goldGrad)" stroke-width="3.5"/>

    <text x="${baseW / 2}" y="210" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="0.5">LOVED YOUR EXPERIENCE?</text>
    <text x="${baseW / 2}" y="238" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="3">RATE US 5 STARS ON</text>

    <g transform="translate(205, 292)">
      <text x="0" y="0" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#4285F4">G</text>
      <text x="36" y="0" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#EA4335">o</text>
      <text x="63" y="0" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#FBBC05">o</text>
      <text x="90" y="0" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#4285F4">g</text>
      <text x="117" y="0" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#34A853">l</text>
      <text x="130" y="0" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#EA4335">e</text>
      <text x="172" y="-3" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" letter-spacing="1">REVIEWS</text>
    </g>

    <g transform="translate(${baseW / 2}, 346)" text-anchor="middle">
      <text font-family="'Segoe UI', Arial, sans-serif" font-size="32" fill="#fbbf24" letter-spacing="6">&#9733;&#9733;&#9733;&#9733;&#9733;</text>
    </g>

    <rect x="196" y="392" width="330" height="330" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M 216 450 L 216 418 Q 216 414 220 414 L 252 414" fill="none" stroke="#EA4335" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M 470 414 L 502 414 Q 506 414 506 418 L 506 450" fill="none" stroke="#FBBC05" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M 216 668 L 216 700 Q 216 704 220 704 L 252 704" fill="none" stroke="#34A853" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M 470 704 L 502 704 Q 506 704 506 700 L 506 668" fill="none" stroke="#4285F4" stroke-width="6.5" stroke-linecap="round"/>

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

    <rect x="42" y="876" width="${baseW - 84}" height="56" rx="14" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.2"/>
    <text x="${baseW / 2}" y="910" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="700" fill="#1e40af" text-anchor="middle">
      Open Phone Camera &#8594; Scan QR &#8594; Tap 5 Stars on Google Maps
    </text>

    <path d="M 18 ${baseH - 66} L ${baseW - 18} ${baseH - 66} L ${baseW - 18} ${baseH - 38} Q ${baseW - 18} ${baseH - 18} ${baseW - 38} ${baseH - 18} L 38 ${baseH - 18} Q 18 ${baseH - 18} 18 ${baseH - 38} Z" fill="#061932"/>
    <text x="${baseW / 2}" y="${baseH - 32}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; SMART AI GOOGLE REVIEWS
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [{ input: baseBuf, left: 0, top: 0 }]
  await compositeMerchantHeader(composites, merchant, logoBuffer, baseW, scale, logoSize)

  const baseCanvas = sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })

  return await encodeFinalStandeeJpeg(baseCanvas, composites, {
    hd,
    isDarkCanvas: false,
    qrCompositeOnTop: { input: qrBuf, left: s(221), top: s(417) },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE B: SMART DIGITAL BUSINESS CARD STANDEE (723 x 1024 | HD: 4338 x 6144)
// ─────────────────────────────────────────────────────────────────────────────
async function renderCardStandee(
  merchant: any,
  logoBuffer: Buffer | null,
  targetUrl: string,
  logoSize: LogoSize,
  hd: boolean
) {
  const baseW = 723
  const baseH = 1024
  const scale = hd ? 6 : 1
  const width = baseW * scale
  const height = baseH * scale
  const s = (n: number) => Math.round(n * scale)

  const qrBuf = await createBrandedQRBuffer(targetUrl, s(280), logoBuffer, "#0f172a")

  const baseSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${baseW} ${baseH}" xmlns="http://www.w3.org/2000/svg">
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
    </defs>

    <rect width="${baseW}" height="${baseH}" fill="url(#cardBg)"/>
    <rect x="14" y="14" width="${baseW - 28}" height="${baseH - 28}" rx="24" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
    <rect x="20" y="20" width="${baseW - 40}" height="${baseH - 40}" rx="18" fill="none" stroke="#fef08a" stroke-width="1" stroke-opacity="0.6"/>

    <line x1="24" y1="170" x2="${baseW - 24}" y2="170" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <text x="${baseW / 2}" y="220" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="1.5">SCAN TO CONNECT</text>
    <text x="${baseW / 2}" y="250" font-family="'Segoe UI', Arial, sans-serif" font-size="14.5" font-weight="700" fill="#93c5fd" text-anchor="middle" letter-spacing="1">SAVE OUR CONTACT &#8226; EXPLORE DIGITAL CARD</text>
    <text x="${baseW / 2}" y="278" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1" text-anchor="middle">1-Tap Contact Save &#8226; Instant WhatsApp &#8226; Product Catalog</text>

    <rect x="196" y="320" width="330" height="330" rx="26" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3.5"/>
    <path d="M 216 376 L 216 344 Q 216 340 220 340 L 252 340" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 340 L 502 340 Q 506 340 506 344 L 506 376" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 216 594 L 216 626 Q 216 630 220 630 L 252 630" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 630 L 502 630 Q 506 630 506 626 L 506 594" fill="none" stroke="#d4af37" stroke-width="6" stroke-linecap="round"/>

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
        <text x="90" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="600" fill="#93c5fd" text-anchor="middle">Products &amp; Prices</text>
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

    <rect x="42" y="876" width="${baseW - 84}" height="54" rx="16" fill="#061932" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="${baseW / 2}" y="909" font-family="'Segoe UI', Arial, sans-serif" font-size="13.5" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      Tap &quot;Save to Phone&quot; to Add Store Card Directly to Contacts
    </text>

    <text x="${baseW / 2}" y="${baseH - 30}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; SMART DIGITAL BUSINESS CARD
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [{ input: baseBuf, left: 0, top: 0 }]
  await compositeMerchantHeader(composites, merchant, logoBuffer, baseW, scale, logoSize)

  const baseCanvas = sharp({
    create: { width, height, channels: 4, background: { r: 6, g: 26, b: 50, alpha: 1 } },
  })

  return await encodeFinalStandeeJpeg(baseCanvas, composites, {
    hd,
    isDarkCanvas: true,
    qrCompositeOnTop: { input: qrBuf, left: s(221), top: s(345) },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE C: CONNECT & REVIEW DUO STANDEE (723 x 1024 | HD: 4338 x 6144)
// ─────────────────────────────────────────────────────────────────────────────
async function renderComboStandee(
  merchant: any,
  logoBuffer: Buffer | null,
  targetUrl: string,
  logoSize: LogoSize,
  hd: boolean
) {
  const baseW = 723
  const baseH = 1024
  const scale = hd ? 6 : 1
  const width = baseW * scale
  const height = baseH * scale
  const s = (n: number) => Math.round(n * scale)

  const qrBuf = await createBrandedQRBuffer(targetUrl, s(280), logoBuffer, "#0f172a")

  const baseSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${baseW} ${baseH}" xmlns="http://www.w3.org/2000/svg">
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
    </defs>

    <rect width="${baseW}" height="${baseH}" fill="url(#comboBg)"/>
    <rect x="14" y="14" width="${baseW - 28}" height="${baseH - 28}" rx="24" fill="none" stroke="url(#goldGrad)" stroke-width="3"/>
    <rect x="20" y="20" width="${baseW - 40}" height="${baseH - 40}" rx="18" fill="none" stroke="#fef08a" stroke-width="1" stroke-opacity="0.5"/>
    <line x1="24" y1="170" x2="${baseW - 24}" y2="170" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <text x="${baseW / 2}" y="214" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="0.5">CONNECT WITH US &amp; RATE YOUR EXPERIENCE</text>
    <text x="${baseW / 2}" y="240" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#93c5fd" text-anchor="middle" letter-spacing="1">SAVE CONTACT &#8226; VIEW CATALOG &#8226; 5-STAR GOOGLE REVIEW</text>

    <g transform="translate(${baseW / 2}, 268)" text-anchor="middle">
      <text font-family="'Segoe UI', Arial, sans-serif" font-size="22" fill="#fbbf24" letter-spacing="4">&#9733;&#9733;&#9733;&#9733;&#9733;</text>
    </g>

    <rect x="196" y="296" width="330" height="330" rx="26" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3.5"/>
    <path d="M 216 352 L 216 320 Q 216 316 220 316 L 252 316" fill="none" stroke="#EA4335" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 316 L 502 316 Q 506 316 506 320 L 506 352" fill="none" stroke="#FBBC05" stroke-width="6" stroke-linecap="round"/>
    <path d="M 216 570 L 216 602 Q 216 606 220 606 L 252 606" fill="none" stroke="#34A853" stroke-width="6" stroke-linecap="round"/>
    <path d="M 470 606 L 502 606 Q 506 606 506 602 L 506 570" fill="none" stroke="#4285F4" stroke-width="6" stroke-linecap="round"/>

    <g transform="translate(48, 680)">
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
        <text x="42" y="125" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">Catalog &amp; Services</text>
      </g>
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

    <rect x="42" y="878" width="${baseW - 84}" height="52" rx="14" fill="#061932" stroke="url(#goldGrad)" stroke-width="1.5"/>
    <text x="${baseW / 2}" y="910" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="0.5">
      One Smart QR Code &#8226; Everything Your Customer Needs
    </text>

    <text x="${baseW / 2}" y="${baseH - 30}" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle" letter-spacing="1">
      POWERED BY CUSTOMERPILOT &#8226; DIGITAL BUSINESS CARD &amp; AI REVIEWS
    </text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [{ input: baseBuf, left: 0, top: 0 }]
  await compositeMerchantHeader(composites, merchant, logoBuffer, baseW, scale, logoSize)

  const baseCanvas = sharp({
    create: { width, height, channels: 4, background: { r: 10, g: 25, b: 47, alpha: 1 } },
  })

  return await encodeFinalStandeeJpeg(baseCanvas, composites, {
    hd,
    isDarkCanvas: true,
    qrCompositeOnTop: { input: qrBuf, left: s(221), top: s(321) },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE D: MASTER VIP LOYALTY STANDEE (723 x 1024 | HD: 4338 x 6144)
// ─────────────────────────────────────────────────────────────────────────────
async function renderMasterStandee(
  merchant: any,
  logoBuffer: Buffer | null,
  targetUrl: string,
  config: StandeeConfig,
  baseImagePath: string,
  logoSize: LogoSize,
  hd: boolean
) {
  const baseMeta = await sharp(baseImagePath).metadata()
  const baseW = baseMeta.width || 723
  const baseH = baseMeta.height || 1024
  const scale = hd ? 6 : 1
  const s = (n: number) => Math.round(n * scale)

  const qrBuf = await createBrandedQRBuffer(targetUrl, s(config.qr.width), logoBuffer, config.darkColor || "#0f172a")
  const composites: sharp.OverlayOptions[] = []

  if (config.whiteCard) {
    const bw = config.whiteCard.width
    const bh = config.whiteCard.height
    const rx = config.whiteCard.rx
    const cardSvg = Buffer.from(`
      <svg width="${s(bw)}" height="${s(bh)}" viewBox="0 0 ${bw} ${bh}" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="${bw - 3}" height="${bh - 3}" rx="${rx}" ry="${rx}" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
        <path d="M 16 46 L 16 16 L 46 16" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M ${bw - 46} 16 L ${bw - 16} 16 L ${bw - 16} 46" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M 16 ${bh - 46} L 16 ${bh - 16} L 46 ${bh - 16}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M ${bw - 46} ${bh - 16} L ${bw - 16} ${bh - 16} L ${bw - 16} ${bh - 46}" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-linecap="round"/>
      </svg>
    `)
    const cardBuf = await sharp(cardSvg).png().toBuffer()
    composites.push({ input: cardBuf, left: s(config.whiteCard.left), top: s(config.whiteCard.top) })
  }

  if (config.cpBadge) {
    const cpLogoBuf = loadPublicAssetBuffer("cplogo.png")
    if (cpLogoBuf) {
      const bw = s(config.cpBadge.width)
      const bh = s(config.cpBadge.height)
      const badgeSvg = Buffer.from(`
        <svg width="${bw}" height="${bh}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${bw}" height="${bh}" rx="${Math.round(bh / 2)}" ry="${Math.round(bh / 2)}" fill="#ffffff" stroke="#cbd5e1" stroke-width="${Math.max(1.5, scale)}"/>
        </svg>
      `)
      const cpLogoResized = await sharp(cpLogoBuf)
        .resize({ width: Math.round(bw * 0.88), fit: "inside" })
        .png()
        .toBuffer()
      const cpBadgeBuffer = await sharp(badgeSvg)
        .composite([{ input: cpLogoResized, gravity: "center" }])
        .png()
        .toBuffer()
      composites.push({ input: cpBadgeBuffer, left: s(config.cpBadge.left), top: s(config.cpBadge.top) })
    }
  }

  if (config.headerPill) {
    await compositeMerchantHeader(composites, merchant, logoBuffer, baseW, scale, logoSize)
  }

  let baseCanvas = sharp(baseImagePath)
  if (hd) {
    baseCanvas = baseCanvas.resize(s(baseW), s(baseH), { kernel: "lanczos3" })
  }

  return await encodeFinalStandeeJpeg(baseCanvas, composites, {
    hd,
    preserveNaturalMaster: true,
    qrCompositeOnTop: { input: qrBuf, left: s(config.qr.left), top: s(config.qr.top) },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE E: SMART AI GOOGLE REVIEWS V3 STANDEE (Exact Match to Settings Step A)
// ─────────────────────────────────────────────────────────────────────────────
async function renderGoogleReviewV3Standee(
  merchant: any,
  logoBuffer: Buffer | null,
  targetUrl: string,
  logoSize: LogoSize,
  hd: boolean
) {
  const baseW = 723
  const baseH = 1024
  const scale = hd ? 6 : 1
  const width = baseW * scale
  const height = baseH * scale
  const s = (n: number) => Math.round(n * scale)

  const rawStoreName = getShortStoreDisplayName(merchant.name, 26)
  const storeNameUpper = escapeXml(rawStoreName.toUpperCase())
  // Logo height bands based on L / XL / XXL
  const logoBoxH = logoSize === "l" ? 128 : logoSize === "xxl" ? 205 : 168
  const logoBoxW = logoSize === "l" ? 440 : logoSize === "xxl" ? 590 : 520
  const logoCenterY = 38 + Math.round(logoBoxH / 2)

  // Dynamic vertical positions so XXL logo never collides with Google Reviews mark
  const gLogoTop = Math.max(198, 48 + logoBoxH + 10)
  const qrFrameTop = gLogoTop + 86
  const qrFrameSize = 354
  const qrSize = 304
  const scanMeY = qrFrameTop + qrFrameSize + 38
  const taglineY = scanMeY + 34
  const thankYouY = taglineY + 52

  const qrBuf = await createBrandedQRBuffer(targetUrl, s(qrSize), logoBuffer, "#0f172a")

  const storeFallbackSvg = !logoBuffer
    ? `
      <rect x="116" y="54" width="491" height="106" rx="22" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2.5"/>
      <text x="${baseW / 2}" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="${rawStoreName.length > 22 ? 22 : 28}" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="0.8">${storeNameUpper}</text>
      <text x="${baseW / 2}" y="138" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#d97706" text-anchor="middle" letter-spacing="2">&#9733; OFFICIAL 5-STAR REVIEW QR &#9733;</text>
    `
    : ""

  const qrX = Math.round((baseW - qrFrameSize) / 2)
  const baseSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${baseW} ${baseH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${baseW}" height="${baseH}" fill="#ffffff"/>
    <!-- Left Google 4-Color Stripe -->
    <rect x="0" y="0" width="14" height="${baseH / 4}" fill="#4285F4"/>
    <rect x="0" y="${baseH / 4}" width="14" height="${baseH / 4}" fill="#EA4335"/>
    <rect x="0" y="${(baseH * 2) / 4}" width="14" height="${baseH / 4}" fill="#FBBC05"/>
    <rect x="0" y="${(baseH * 3) / 4}" width="14" height="${baseH / 4}" fill="#34A853"/>
    <!-- Right Google 4-Color Stripe -->
    <rect x="${baseW - 14}" y="0" width="14" height="${baseH / 4}" fill="#EA4335"/>
    <rect x="${baseW - 14}" y="${baseH / 4}" width="14" height="${baseH / 4}" fill="#4285F4"/>
    <rect x="${baseW - 14}" y="${(baseH * 2) / 4}" width="14" height="${baseH / 4}" fill="#34A853"/>
    <rect x="${baseW - 14}" y="${(baseH * 3) / 4}" width="14" height="${baseH / 4}" fill="#FBBC05"/>

    ${storeFallbackSvg}

    <!-- 4-Color Google Rounded QR Frame -->
    <g transform="translate(${qrX}, ${qrFrameTop})">
      <rect x="0" y="0" width="${qrFrameSize}" height="${qrFrameSize}" rx="36" fill="#ffffff"/>
      <path d="M ${qrFrameSize / 2} 9 L 42 9 A 33 33 0 0 0 9 42 L 9 ${qrFrameSize / 2}" fill="none" stroke="#4285F4" stroke-width="14" stroke-linecap="round"/>
      <path d="M ${qrFrameSize / 2} 9 L ${qrFrameSize - 42} 9 A 33 33 0 0 1 ${qrFrameSize - 9} 42 L ${qrFrameSize - 9} ${qrFrameSize / 2}" fill="none" stroke="#EA4335" stroke-width="14" stroke-linecap="round"/>
      <path d="M 9 ${qrFrameSize / 2} L 9 ${qrFrameSize - 42} A 33 33 0 0 0 42 ${qrFrameSize - 9} L ${qrFrameSize / 2} ${qrFrameSize - 9}" fill="none" stroke="#34A853" stroke-width="14" stroke-linecap="round"/>
      <path d="M ${qrFrameSize - 9} ${qrFrameSize / 2} L ${qrFrameSize - 9} ${qrFrameSize - 42} A 33 33 0 0 1 ${qrFrameSize - 42} ${qrFrameSize - 9} L ${qrFrameSize / 2} ${qrFrameSize - 9}" fill="none" stroke="#FBBC05" stroke-width="14" stroke-linecap="round"/>
    </g>

    <!-- SCAN ME + Tagline + Thank You -->
    <text x="${baseW / 2}" y="${Math.min(scanMeY, 795)}" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="4">SCAN ME</text>
    <text x="${baseW / 2}" y="${Math.min(taglineY, 830)}" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="600" fill="#334155" text-anchor="middle">your review matters</text>
    <text x="${baseW / 2}" y="${Math.min(thankYouY, 886)}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="46" font-weight="700" fill="#dc2626" text-anchor="middle">Thank You</text>

    <!-- Footer Divider & Powered By -->
    <rect x="14" y="924" width="${baseW - 28}" height="100" fill="#f8fafc"/>
    <line x1="14" y1="924" x2="${baseW - 14}" y2="924" stroke="#e2e8f0" stroke-width="2"/>
    <text x="${baseW / 2}" y="950" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#64748b" text-anchor="middle" letter-spacing="2.5">POWERED BY:</text>
    <text x="${baseW / 2 + 6}" y="990" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="900" fill="#94a3b8" text-anchor="middle">&#8226;</text>
    <text x="${baseW / 2 + 54}" y="990" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="900" fill="#0f172a" text-anchor="start">+91 9033304707</text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [{ input: baseBuf, left: 0, top: 0 }]

  // Composite Merchant Logo in L / XL / XXL
  if (logoBuffer) {
    try {
      const resizedLogo = await sharp(logoBuffer)
        .resize({ width: s(logoBoxW), height: s(logoBoxH), fit: "inside" })
        .png()
        .toBuffer()
      const meta = await sharp(resizedLogo).metadata()
      const lw = meta.width || s(200)
      const lh = meta.height || s(120)
      composites.push({
        input: resizedLogo,
        left: Math.round((width - lw) / 2),
        top: Math.max(s(22), Math.round(s(logoCenterY) - lh / 2)),
      })
    } catch {}
  }

  // Composite Official Google Reviews Logo
  const googleReviewsBuf = loadPublicAssetBuffer("google_reviews_official_logo.png")
  if (googleReviewsBuf) {
    try {
      const resizedG = await sharp(googleReviewsBuf)
        .resize({ width: s(280), height: s(74), fit: "inside" })
        .png()
        .toBuffer()
      const gm = await sharp(resizedG).metadata()
      composites.push({
        input: resizedG,
        left: Math.round((width - (gm.width || s(220))) / 2),
        top: s(gLogoTop),
      })
    } catch {}
  }

  // Composite Footer CustomerPilot Logo & WhatsApp Icon
  const cpLogoBuf = loadPublicAssetBuffer("cplogo_notagline.png")
  if (cpLogoBuf) {
    try {
      const cpResized = await sharp(cpLogoBuf)
        .resize({ width: s(185), height: s(34), fit: "inside" })
        .png()
        .toBuffer()
      const cm = await sharp(cpResized).metadata()
      composites.push({
        input: cpResized,
        left: s(Math.round(baseW / 2) - 8) - (cm.width || s(160)),
        top: s(966),
      })
    } catch {}
  }

  const waIconBuf = loadPublicAssetBuffer("whatsapp_clean_icon.png")
  if (waIconBuf) {
    try {
      const waResized = await sharp(waIconBuf)
        .resize(s(26), s(26), { fit: "contain" })
        .png()
        .toBuffer()
      composites.push({
        input: waResized,
        left: s(Math.round(baseW / 2) + 20),
        top: s(970),
      })
    } catch {}
  }

  const baseCanvas = sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })

  return await encodeFinalStandeeJpeg(baseCanvas, composites, {
    hd,
    isDarkCanvas: false,
    qrCompositeOnTop: {
      input: qrBuf,
      left: s(qrX + Math.round((qrFrameSize - qrSize) / 2)),
      top: s(qrFrameTop + Math.round((qrFrameSize - qrSize) / 2)),
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE F: WHATSAPP GROUP BOOSTER / PRO STANDEE (Exact Match to WAGroupBooster)
// ─────────────────────────────────────────────────────────────────────────────
async function renderWaBoosterStandee(
  merchant: any,
  logoBuffer: Buffer | null,
  targetUrl: string,
  opts: {
    logoSize: LogoSize
    hd: boolean
    qrStyle: "whatsapp" | "store_logo" | "clean"
    message: string
    showStoreText: boolean
    subtext?: string
  }
) {
  const baseW = 723
  const baseH = 1024
  const scale = opts.hd ? 6 : 1
  const width = baseW * scale
  const height = baseH * scale
  const s = (n: number) => Math.round(n * scale)

  const rawStoreName = getShortStoreDisplayName(merchant.name, 26)
  const storeNameUpper = escapeXml(rawStoreName.toUpperCase())
  const bannerMessage = escapeXml(opts.message || "Scan n Join Whatsapp Group")
  const subtext = escapeXml(opts.subtext || "Scan to join our official WhatsApp Community")

  // Determine QR center logo based on qrStyle
  let qrCenterLogo: Buffer | null = null
  if (opts.qrStyle === "whatsapp") {
    qrCenterLogo = loadPublicAssetBuffer("whatsapp_clean_icon.png")
  } else if (opts.qrStyle === "store_logo") {
    qrCenterLogo = logoBuffer
  }

  const logoBoxH = opts.logoSize === "l" ? 138 : opts.logoSize === "xxl" ? 230 : 185
  const logoBoxW = opts.logoSize === "l" ? 450 : opts.logoSize === "xxl" ? 600 : 530
  const logoTop = 44

  const showText = !logoBuffer || opts.showStoreText
  const textY = logoBuffer ? logoTop + logoBoxH + 34 : 138
  const badgeY = showText ? textY + 24 : (logoBuffer ? logoTop + logoBoxH + 18 : 172)
  const qrBoxTop = badgeY + 62
  const qrBoxSize = 370
  const qrSize = 330
  const scanY = Math.min(846, qrBoxTop + qrBoxSize + 44)
  const subY = scanY + 28

  const qrBuf = await createBrandedQRBuffer(targetUrl, s(qrSize), qrCenterLogo, "#0f172a")
  const badgeWidth = Math.min(580, Math.max(300, (opts.message || "Scan n Join Whatsapp Group").length * 14 + 68))

  const baseSvg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${baseW} ${baseH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${baseW}" height="${baseH}" fill="#ffffff"/>
    <!-- Outer Bold Acrylic Border Frame -->
    <rect x="20" y="20" width="${baseW - 40}" height="${baseH - 40}" rx="42" fill="#ffffff" stroke="#0f172a" stroke-width="10"/>

    ${showText ? `<text x="${baseW / 2}" y="${textY}" font-family="'Segoe UI', Arial, sans-serif" font-size="${rawStoreName.length > 24 ? 22 : 28}" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="0.5">${storeNameUpper}</text>` : ""}

    <!-- Emerald Pill Banner -->
    <rect x="${Math.round((baseW - badgeWidth) / 2)}" y="${badgeY}" width="${badgeWidth}" height="44" rx="22" fill="#059669"/>
    <text x="${baseW / 2}" y="${badgeY + 29}" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="0.4">${bannerMessage}</text>

    <!-- QR Container Frame -->
    <rect x="${Math.round((baseW - qrBoxSize) / 2)}" y="${qrBoxTop}" width="${qrBoxSize}" height="${qrBoxSize}" rx="28" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>

    <!-- Callout Footer -->
    <text x="${baseW / 2}" y="${scanY}" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="900" fill="#0f172a" text-anchor="middle" letter-spacing="1">SCAN WITH ANY SCANNER</text>
    <text x="${baseW / 2}" y="${subY}" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="600" fill="#64748b" text-anchor="middle">${subtext}</text>

    <!-- Bottom Powered By Bar -->
    <line x1="56" y1="920" x2="${baseW - 56}" y2="920" stroke="#e2e8f0" stroke-width="2"/>
    <text x="${baseW / 2 - 28}" y="958" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#475569" text-anchor="end">Powered by <tspan font-weight="900" fill="#0f172a">CustomerPilot.in :</tspan></text>
    <text x="${baseW / 2 + 12}" y="958" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="900" fill="#0f172a" text-anchor="start">+91 9033304707</text>
  </svg>
  `

  const baseBuf = await sharp(Buffer.from(baseSvg)).png().toBuffer()
  const composites: sharp.OverlayOptions[] = [{ input: baseBuf, left: 0, top: 0 }]

  if (logoBuffer) {
    try {
      const resizedLogo = await sharp(logoBuffer)
        .resize({ width: s(logoBoxW), height: s(logoBoxH), fit: "inside" })
        .png()
        .toBuffer()
      const meta = await sharp(resizedLogo).metadata()
      const lw = meta.width || s(220)
      const lh = meta.height || s(140)
      composites.push({
        input: resizedLogo,
        left: Math.round((width - lw) / 2),
        top: s(logoTop) + Math.round((s(logoBoxH) - lh) / 2),
      })
    } catch {}
  }

  const waIconBuf = loadPublicAssetBuffer("whatsapp_clean_icon.png")
  if (waIconBuf) {
    try {
      const waResized = await sharp(waIconBuf).resize(s(24), s(24), { fit: "contain" }).png().toBuffer()
      composites.push({
        input: waResized,
        left: s(Math.round(baseW / 2) - 18),
        top: s(940),
      })
    } catch {}
  }

  const baseCanvas = sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })

  return await encodeFinalStandeeJpeg(baseCanvas, composites, {
    hd: opts.hd,
    isDarkCanvas: false,
    qrCompositeOnTop: {
      input: qrBuf,
      left: s(Math.round((baseW - qrSize) / 2)),
      top: s(qrBoxTop + Math.round((qrBoxSize - qrSize) / 2)),
    },
  })
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
    const isHd = url.searchParams.get("hd") === "1" || url.searchParams.get("format") === "hd"
    const logoSize = normalizeLogoSize(url.searchParams.get("logoSize"))

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

    let digitalCard = merchant.digitalBusinessCard
    if (!digitalCard) {
      digitalCard = await getOrCreateDigitalBusinessCard(merchant.id)
    }

    const enabledModules = merchant.enabledModules || "LOYALTY,REVIEWS,AUTOREPLY"
    const hasLoyalty = enabledModules.includes("LOYALTY")
    const hasReviews = enabledModules.includes("REVIEWS") || enabledModules.includes("AUTOREPLY")
    const hasCard = enabledModules.includes("DIGITAL_CARD") || !!digitalCard

    let activeDesign = rawDesign
    if (activeDesign === "auto" || !activeDesign) {
      if (hasLoyalty) activeDesign = "master"
      else if (hasCard && hasReviews) activeDesign = "combo"
      else if (hasCard) activeDesign = "card"
      else if (hasReviews) activeDesign = "review"
      else activeDesign = "master"
    }

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

    // Custom targetUrl override (used for Dynamic QR Studio / WA Group Booster publicUrl / Review type)
    const customTargetUrl = url.searchParams.get("targetUrl")
    let targetUrl = customTargetUrl || ""

    if (!targetUrl) {
      if (activeDesign === "google_review_v3") {
        const qrType = url.searchParams.get("type") || "review_counter"
        const directGoogleUrl =
          merchant.merchantGoogleConnections?.googleReviewUrl ||
          (merchant as any).googleReviewLink ||
          null
        targetUrl =
          qrType === "review_direct" && directGoogleUrl
            ? directGoogleUrl
            : `${protocol}://${host}/review?m=${merchant.id}`
      } else if (activeDesign === "review") {
        targetUrl =
          merchant.merchantGoogleConnections?.googleReviewUrl ||
          (merchant as any).googleReviewLink ||
          `${protocol}://${host}/review?m=${merchant.id}`
      } else if (activeDesign === "card" || activeDesign === "combo") {
        targetUrl = `${protocol}://${host}/c/${slug}`
      } else {
        if (digitalCard) {
          targetUrl = `${protocol}://${host}/c/${slug}`
        } else {
          const merchantPhone = normalizePhone(merchant.whatsappPhone) || "919999999999"
          const bizName = merchant.name || "our store"
          const joinText = `Hi ${bizName}! Checking in for my VIP Club stamps 🎁`
          targetUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(joinText)}`
        }
      }
    }

    // Always resolve latest merchant logo (with digital card fallback)
    const effectiveLogoUrl = merchant.logoUrl || digitalCard?.logoUrl || null
    const logoBuffer = await getMerchantLogoBuffer(effectiveLogoUrl)

    let finalImageBuffer: Buffer

    if (activeDesign === "google_review_v3") {
      finalImageBuffer = await renderGoogleReviewV3Standee(merchant, logoBuffer, targetUrl, logoSize, isHd)
    } else if (activeDesign === "wa_booster" || activeDesign === "dynamic_qr") {
      const qrStyleRaw = (url.searchParams.get("qrStyle") || (activeDesign === "dynamic_qr" ? "store_logo" : "whatsapp")).toLowerCase()
      const qrStyle = (["whatsapp", "store_logo", "clean"].includes(qrStyleRaw) ? qrStyleRaw : "whatsapp") as
        | "whatsapp"
        | "store_logo"
        | "clean"
      const message =
        url.searchParams.get("message") ||
        (activeDesign === "dynamic_qr" ? "Scan Smart Dynamic QR" : "Scan n Join Whatsapp Group")
      const showStoreText = url.searchParams.get("showStoreText") === "1"
      const subtext =
        url.searchParams.get("subtext") ||
        (activeDesign === "dynamic_qr"
          ? "Scan with any phone camera to open instantly"
          : "Scan to join our official WhatsApp Community")

      finalImageBuffer = await renderWaBoosterStandee(merchant, logoBuffer, targetUrl, {
        logoSize,
        hd: isHd,
        qrStyle,
        message,
        showStoreText,
        subtext,
      })
    } else if (activeDesign === "review") {
      finalImageBuffer = await renderReviewStandee(merchant, logoBuffer, targetUrl, logoSize, isHd)
    } else if (activeDesign === "card") {
      finalImageBuffer = await renderCardStandee(merchant, logoBuffer, targetUrl, logoSize, isHd)
    } else if (activeDesign === "combo") {
      finalImageBuffer = await renderComboStandee(merchant, logoBuffer, targetUrl, logoSize, isHd)
    } else {
      const configMap = isPrintFormat ? PRINT_POSTER_COORDS : STANDEE_COORDS
      const config = configMap[activeDesign] || configMap.master || configMap.bakery
      const baseImagePath = path.join(process.cwd(), "public", "standees", config.image)

      if (!fs.existsSync(baseImagePath)) {
        return new NextResponse("Standee template not found", { status: 404 })
      }

      finalImageBuffer = await renderMasterStandee(merchant, logoBuffer, targetUrl, config, baseImagePath, logoSize, isHd)
    }

    const safeFileName = `${(merchant.name || "CustomerPilot").replace(/[^a-zA-Z0-9_-]+/g, "_")}-${activeDesign.toUpperCase()}-HD-Standee.jpg`

    return new NextResponse(new Uint8Array(finalImageBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(finalImageBuffer.length),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        ...(isHd ? { "Content-Disposition": `attachment; filename="${safeFileName}"` } : {}),
      },
    })
  } catch (error: any) {
    console.error("Standee render error:", error)
    return new NextResponse("Error generating standee: " + error.message, { status: 500 })
  }
}
