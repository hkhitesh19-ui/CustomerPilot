import QRCode from "qrcode"

export interface ClientBrandedQROptions {
  width?: number
  darkColor?: string
  lightColor?: string
}

/**
 * Generates a QR Code as Data URL with CustomerPilot logo & name (without tagline) in the center.
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

  // If running in SSR / non-browser, return base QR directly
  if (typeof window === "undefined" || typeof document === "undefined") {
    return baseQrDataUrl
  }

  // 2. Load into HTML5 Canvas to composite center badge
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

      // Load CustomerPilot logo (no tagline)
      const logoImg = new Image()
      logoImg.crossOrigin = "anonymous"
      logoImg.onload = () => {
        // Badge dimensions (occupies ~4% of QR area, well below 30% tolerance)
        const badgeW = Math.round(width * 0.40)
        const badgeH = Math.round(badgeW * 0.28)
        const badgeX = Math.round((width - badgeW) / 2)
        const badgeY = Math.round((width - badgeH) / 2)
        const radius = 14

        // Draw white rounded background badge
        ctx.fillStyle = "#ffffff"
        ctx.strokeStyle = "#e2e8f0"
        ctx.lineWidth = 2
        ctx.beginPath()
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius)
        } else {
          ctx.rect(badgeX, badgeY, badgeW, badgeH)
        }
        ctx.fill()
        ctx.stroke()

        // Draw logo centered inside badge with padding
        const logoPadding = 8
        const logoW = badgeW - logoPadding * 2
        const logoH = logoW * (logoImg.height / logoImg.width)
        const logoX = badgeX + logoPadding
        const logoY = badgeY + (badgeH - logoH) / 2

        ctx.drawImage(logoImg, logoX, logoY, logoW, logoH)
        resolve(canvas.toDataURL("image/png"))
      }
      logoImg.onerror = () => resolve(baseQrDataUrl)
      logoImg.src = "/cplogo_notagline.png"
    }
    qrImg.onerror = () => resolve(baseQrDataUrl)
    qrImg.src = baseQrDataUrl
  })
}