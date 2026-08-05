import { NextRequest } from "next/server"
import QRCode from "qrcode"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) return err("Unauthorized", 401)

    const urlParams = req.nextUrl.searchParams
    const type = urlParams.get("type") || "counter" // counter, table, poster, sticker, cake_box

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId }
    })

    if (!merchant) return err("Merchant not found", 404)

    // Build WhatsApp deep link — Requirements.txt: "QR directly opens WhatsApp"
    // Format: https://wa.me/{phone}?text=JOIN|{merchantId}|{type}
    // When customer sends this message, our Evolution webhook processes it.
    const merchantPhone = (merchant.whatsappPhone || "").replace(/[^0-9]/g, "")
    if (!merchantPhone) return err("Merchant WhatsApp number not configured", 400)

    // Build the pre-filled WhatsApp message — friendly & natural for both new and returning customers
    // Merchant is identified by their phone number on the webhook side
    const bizName = merchant.name || "our store"
    const joinText = `Hi ${bizName}! Checking in for my VIP Club stamps 🎁`
    const targetUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(joinText)}`

    // Generate QR Code as Data URL
    const qrDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff"
      }
    })

    const titleMap: Record<string, string> = {
      counter: "Counter QR Stand",
      table: "Table QR Standee",
      poster: "Store Window Poster",
      sticker: "Packaging Sticker QR",
      cake_box: "Cake Box Seal QR"
    }

    return ok({
      type,
      title: titleMap[type] || "Store QR Code",
      qrDataUrl,
      targetUrl,
      merchant: {
        name: merchant.name,
        logoUrl: merchant.logoUrl,
        category: merchant.category
      }
    })
  } catch (error: any) {
    return err(error.message || "Failed to generate QR Code", 500)
  }
}
