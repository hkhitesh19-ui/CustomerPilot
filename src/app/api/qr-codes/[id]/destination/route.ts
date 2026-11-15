import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sanitizeDestinationUrl } from "@/lib/url-sanitizer"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const merchantId = req.headers.get("x-merchant-id")
    const body = await req.json()
    const { destination, note, redirectMode, isActive } = body

    if (!destination && redirectMode === undefined && isActive === undefined) {
      return NextResponse.json({ error: "No update parameters provided" }, { status: 400 })
    }

    const qr = await db.qrCode.findUnique({
      where: { id }
    })

    if (!qr) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    if (merchantId && qr.merchantId !== merchantId) {
      return NextResponse.json({ error: "Forbidden: Not your QR code" }, { status: 403 })
    }

    const updateData: any = {}
    if (redirectMode !== undefined) updateData.redirectMode = redirectMode
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)

    if (destination) {
      const isWhatsAppContext = 
        Boolean(note?.toLowerCase().includes("whatsapp")) || 
        destination.toLowerCase().includes("whatsapp") || 
        destination.toLowerCase().includes("wa.me")

      const sanitized = sanitizeDestinationUrl(destination, {
        requireWhatsApp: isWhatsAppContext
      })

      if (!sanitized.isValid) {
        return NextResponse.json(
          { error: sanitized.error || "Invalid destination URL." },
          { status: 400 }
        )
      }

      const finalDest = sanitized.cleanUrl

      if (finalDest !== qr.currentDest) {
        updateData.currentDest = finalDest

        // Record destination change in history table
        await db.qrDestination.create({
          data: {
            qrCodeId: qr.id,
            destination: finalDest,
            changedBy: merchantId || "merchant",
            note: sanitized.hadMultipleUrls
              ? `[Auto-sanitized concatenated link] ${note || "Dashboard update"}`
              : (note || "Dashboard update")
          }
        })
      }
    }

    const updated = await db.qrCode.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, qrCode: updated })
  } catch (err: any) {
    console.error("[QR Update Destination Error]:", err)
    return NextResponse.json({ error: "Failed to update destination" }, { status: 500 })
  }
}
