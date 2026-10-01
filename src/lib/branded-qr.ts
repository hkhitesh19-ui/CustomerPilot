import QRCode from "qrcode"
import sharp from "sharp"
import path from "path"
import fs from "fs"

export interface BrandedQROptions {
  width?: number
  darkColor?: string
  lightColor?: string
  merchantLogoUrl?: string | null
}

/**
 * Generates a high-resolution QR Code as Data URL with Error Correction Level 'H'.
 * If merchantLogoUrl is provided, embeds the Merchant's Business Logo in the center.
 * If not, embeds CustomerPilot's logo as fallback.
 */
export async function generateBrandedQRDataUrl(
  url: string,
  options?: BrandedQROptions
): Promise<string> {
  const qrSize = options?.width || 600
  const darkColor = options?.darkColor || "#0f172a"
  const lightColor = options?.lightColor || "#ffffff"

  const qrBuffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: qrSize,
    color: { dark: darkColor, light: lightColor }
  })

  // Try to load Merchant Business Logo if provided
  let merchantLogoBuffer: Buffer | null = null
  if (options?.merchantLogoUrl) {
    try {
      const rawUrl = options.merchantLogoUrl.trim()
      if (rawUrl.startsWith("data:")) {
        const base64Data = rawUrl.split(",")[1]
        if (base64Data) merchantLogoBuffer = Buffer.from(base64Data, "base64")
      } else if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3500)
        const res = await fetch(rawUrl, { signal: controller.signal })
        clearTimeout(timeoutId)
        if (res.ok) {
          const arr = await res.arrayBuffer()
          merchantLogoBuffer = Buffer.from(arr)
        }
      } else {
        // Local file in public/
        const cleanPath = rawUrl.replace(/^\/+/, "")
        const localPath = path.join(process.cwd(), "public", cleanPath)
        if (fs.existsSync(localPath)) {
          merchantLogoBuffer = fs.readFileSync(localPath)
        }
      }
    } catch (e) {
      console.warn("Failed to load merchant logo for QR embedding:", e)
    }
  }

  // If Merchant Logo is available, embed it into the center badge
  if (merchantLogoBuffer) {
    try {
      const badgeSize = Math.round(qrSize * 0.28)
      const logoInnerSize = Math.round(badgeSize * 0.82)

      const resizedLogo = await sharp(merchantLogoBuffer)
        .resize({ width: logoInnerSize, height: logoInnerSize, fit: "inside" })
        .png()
        .toBuffer()

      const badgeSvg = Buffer.from(
        `<svg width="${badgeSize}" height="${badgeSize}">
          <rect x="0" y="0" width="${badgeSize}" height="${badgeSize}" rx="16" ry="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
        </svg>`
      )

      const badgeWithLogo = await sharp(badgeSvg)
        .composite([{ input: resizedLogo, gravity: "center" }])
        .png()
        .toBuffer()

      const finalQRBuffer = await sharp(qrBuffer)
        .composite([{ input: badgeWithLogo, gravity: "center" }])
        .png()
        .toBuffer()

      return `data:image/png;base64,${finalQRBuffer.toString("base64")}`
    } catch (err) {
      console.warn("Error compositing merchant logo into QR, falling back to CP logo:", err)
    }
  }

  // Fallback: Embed CustomerPilot Logo
  const logoPath = path.join(process.cwd(), "public", "cplogo_notagline.png")
  if (!fs.existsSync(logoPath)) {
    return `data:image/png;base64,${qrBuffer.toString("base64")}`
  }

  const badgeWidth = Math.round(qrSize * 0.40)
  const badgeHeight = Math.round(badgeWidth * 0.28)
  const logoWidth = Math.round(badgeWidth * 0.85)

  const resizedLogo = await sharp(logoPath)
    .resize({ width: logoWidth, fit: "inside" })
    .toBuffer()

  const badgeSvg = Buffer.from(
    `<svg width="${badgeWidth}" height="${badgeHeight}">
      <rect x="0" y="0" width="${badgeWidth}" height="${badgeHeight}" rx="14" ry="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    </svg>`
  )

  const badgeWithLogo = await sharp(badgeSvg)
    .composite([{ input: resizedLogo, gravity: "center" }])
    .png()
    .toBuffer()

  const finalQRBuffer = await sharp(qrBuffer)
    .composite([{ input: badgeWithLogo, gravity: "center" }])
    .png()
    .toBuffer()

  return `data:image/png;base64,${finalQRBuffer.toString("base64")}`
}
