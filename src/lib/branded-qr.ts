import QRCode from "qrcode"
import sharp from "sharp"
import path from "path"
import fs from "fs"

export interface BrandedQROptions {
  width?: number
  darkColor?: string
  lightColor?: string
}


/**
 * Generates a QR Code as Data URL with CustomerPilot logo & name (without tagline) in the center.
 * Uses Error Correction Level 'H' (30% redundancy) for 100% reliable scanning.
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
