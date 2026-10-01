import { NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import sharp from "sharp"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { generateBrandedQRDataUrl } from "@/lib/branded-qr"

const STANDEE_COORDS: Record<string, { image: string; qr: { left: number; top: number; width: number; height: number }; darkColor: string }> = {
  bakery: {
    image: "standee_bakery_mockup.jpg",
    qr: { left: 408, top: 440, width: 266, height: 268 },
    darkColor: "#4a0e17",
  },
  royal: {
    image: "standee_royal_mockup.jpg",
    qr: { left: 448, top: 615, width: 142, height: 142 },
    darkColor: "#0f2942",
  },
  celebration: {
    image: "standee_celebration_mockup.jpg",
    qr: { left: 420, top: 602, width: 152, height: 168 },
    darkColor: "#3b1d11",
  },
  // Backwards-compatible aliases for previously selected design keys
  retail: {
    image: "standee_royal_mockup.jpg",
    qr: { left: 448, top: 615, width: 142, height: 142 },
    darkColor: "#0f2942",
  },
  pizzeria: {
    image: "standee_celebration_mockup.jpg",
    qr: { left: 420, top: 602, width: 152, height: 168 },
    darkColor: "#3b1d11",
  },
}

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const design = (url.searchParams.get("design") || "bakery") as "bakery" | "retail" | "pizzeria"
    const merchantId = url.searchParams.get("m") || req.headers.get("x-merchant-id")

    if (!merchantId) {
      return new NextResponse("Merchant ID required", { status: 400 })
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
    })

    if (!merchant) {
      return new NextResponse("Merchant not found", { status: 404 })
    }

    const config = STANDEE_COORDS[design] || STANDEE_COORDS.bakery
    const baseImagePath = path.join(process.cwd(), "public", "standees", config.image)

    if (!fs.existsSync(baseImagePath)) {
      return new NextResponse("Standee template not found", { status: 404 })
    }

    // 1. Generate live WhatsApp Check-in URL
    const merchantPhone = normalizePhone(merchant.whatsappPhone) || "919999999999"
    const bizName = merchant.name || "our store"
    const joinText = `Hi ${bizName}! Checking in for my VIP Club stamps 🎁`
    const targetUrl = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(joinText)}`

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

    // 3. Composite live QR onto photorealistic tabletop standee
    const finalImageBuffer = await sharp(baseImagePath)
      .composite([
        {
          input: qrBuffer,
          left: config.qr.left,
          top: config.qr.top,
        },
      ])
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
