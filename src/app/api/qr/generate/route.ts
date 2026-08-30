import { NextRequest } from "next/server"
import QRCode from "qrcode"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) return err("Unauthorized", 401)

    const urlParams = req.nextUrl.searchParams
    const mode = urlParams.get("mode") || (urlParams.get("type")?.startsWith("review_") ? "reviews" : "loyalty")
    const type = urlParams.get("type") || (mode === "reviews" ? "review_counter" : "counter") 

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      include: {
        merchantGoogleConnections: true
      }
    })

    if (!merchant) return err("Merchant not found", 404)

    let targetUrl = ""
    let defaultTitle = "Store QR Code"

    if (mode === "reviews" || type.startsWith("review_")) {
      // ─── Smart AI Google Reviews QR ─────────────────────────
      const host = req.headers.get("host") || "localhost:3000"
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https"
      const appUrl = `${protocol}://${host}`

      const gbpConn = merchant.merchantGoogleConnections
      const directGoogleUrl = gbpConn?.googleReviewUrl || (merchant as any).googleReviewLink || null

      if (type === "review_direct" && directGoogleUrl) {
        targetUrl = directGoogleUrl
      } else {
        // Default: AI Smart Review Draft Assistant
        targetUrl = `${appUrl}/review?m=${merchant.id}`
      }

      const reviewTitleMap: Record<string, string> = {
        review_counter: "Google Reviews Counter Standee",
        review_table: "Table Tent Google Review QR",
        review_sticker: "Packaging / Bill Review Sticker QR",
        review_poster: "Store Front 5-Star Review Poster",
        review_direct: "Direct Google 5-Star Review QR"
      }
      defaultTitle = reviewTitleMap[type] || "Google Reviews QR Standee"
    } else {
      // ─── Loyalty VIP WhatsApp Check-in QR ───────────────────
      const merchantPhone = (merchant.whatsappPhone || "").replace(/[^0-9]/g, "")
      if (!merchantPhone) return err("Merchant WhatsApp number not configured. Please configure WhatsApp number first.", 400)

      const bizName = merchant.name || "our store"
      const joinText = `Hi ${bizName}! Checking in for my VIP Club stamps 🎁`
      targetUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(joinText)}`

      const loyaltyTitleMap: Record<string, string> = {
        counter: "VIP Loyalty Counter QR Stand",
        table: "Table VIP Stamp Standee",
        poster: "Store Window VIP Loyalty Poster",
        sticker: "VIP Packaging Sticker QR",
        cake_box: "Cake Box Seal VIP QR"
      }
      defaultTitle = loyaltyTitleMap[type] || "VIP Loyalty QR Code"
    }

    // Generate QR Code as Data URL
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: mode === "reviews" || type.startsWith("review_") ? "#0f172a" : "#1e1b4b",
        light: "#ffffff"
      }
    })

    return ok({
      mode: mode === "reviews" || type.startsWith("review_") ? "reviews" : "loyalty",
      type,
      title: defaultTitle,
      qrDataUrl,
      targetUrl,
      merchant: {
        name: merchant.name,
        logoUrl: merchant.logoUrl,
        category: merchant.category,
        googleReviewUrl: merchant.merchantGoogleConnections?.googleReviewUrl || (merchant as any).googleReviewLink || null,
        googlePlaceName: merchant.merchantGoogleConnections?.placeName || null,
      }
    })
  } catch (error: any) {
    return err(error.message || "Failed to generate QR Code", 500)
  }
}
