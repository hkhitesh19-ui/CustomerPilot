import QRCode from "qrcode"

export interface ClientBrandedQROptions {
  width?: number
  darkColor?: string
  lightColor?: string
  merchantLogoUrl?: string | null
}

/**
 * Generates a QR Code as Data URL.
 * If merchantLogoUrl is provided, embeds the merchant's business logo in the center.
 * If not, returns a clean QR code with no center logo (CP logo removed).
 * Uses browser HTML5 Canvas.
 */
export async function createBrandedClientQR(
  text: string,
  options?: ClientBrandedQROptions
): Promise<string> {
  const width = options?.width || 600
  const darkColor = options?.darkColor || "#0f172a"
  const lightColor = options?.lightColor || "#ffffff"

  // 1. Generate base QR code with High error correction (30% redundancy)
  const baseQrDataUrl = await QRCode.toDataURL(text, {
    width,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: darkColor, light: lightColor }
  })

  // If no merchant logo, return clean QR (no center badge)
  if (!options?.merchantLogoUrl) {
    return baseQrDataUrl
  }

  // If running in SSR / non-browser, return base QR directly
  if (typeof window === "undefined" || typeof document === "undefined") {
    return baseQrDataUrl
  }

  // 2. Load into HTML5 Canvas to composite merchant logo in center
  return new Promise((resolve) => {
    const qrImg = new Image()
    qrImg.crossOrigin = "anonymous"
    qrImg.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = width
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(baseQrDataUrl)

      // Draw base QR
      ctx.drawImage(qrImg, 0, 0, width, width)

      // Load Merchant logo
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        // Badge dimensions (occupies ~20% of QR area, within 30% error correction tolerance)
        const badgeSize = Math.round(width * 0.22)
        const badgeX = Math.round((width - badgeSize) / 2)
        const badgeY = Math.round((width - badgeSize) / 2)
        const radius = 10

        // Draw white rounded background badge
        ctx.fillStyle = "#ffffff"
        ctx.strokeStyle = "#e2e8f0"
        ctx.lineWidth = 2
        ctx.beginPath()
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius)
        } else {
          ctx.rect(badgeX, badgeY, badgeSize, badgeSize)
        }
        ctx.fill()
        ctx.stroke()

        // Draw logo centered inside badge with padding
        const logoPadding = 6
        const logoSize = badgeSize - logoPadding * 2
        const logoX = badgeX + logoPadding
        const logoY = badgeY + logoPadding

        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        resolve(canvas.toDataURL("image/png"))
      }
      logoImg.onerror = () => resolve(baseQrDataUrl)
      logoImg.src = options.merchantLogoUrl as string
    }
    qrImg.onerror = () => resolve(baseQrDataUrl)
    qrImg.src = baseQrDataUrl
  })
}