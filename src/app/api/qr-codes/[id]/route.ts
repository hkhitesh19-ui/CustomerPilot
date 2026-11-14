import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthenticatedMerchant } from "@/lib/api"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
    }

    const qr = await db.qrCode.findUnique({ where: { id } })
    if (!qr) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    }

    if (merchantId && qr.merchantId !== merchantId) {
      return NextResponse.json({ error: "Forbidden: Not your QR code" }, { status: 403 })
    }

    await db.qrCode.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "QR code deleted successfully" })
  } catch (err: any) {
    console.error("[QR Delete Error]:", err)
    return NextResponse.json({ error: "Failed to delete QR code" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const qr = await db.qrCode.findUnique({
      where: { id },
      include: { destinations: { orderBy: { changedAt: "desc" }, take: 10 }, _count: { select: { scanEvents: true } } }
    })
    if (!qr) return NextResponse.json({ error: "QR code not found" }, { status: 404 })
    return NextResponse.json({ success: true, qrCode: qr })
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
