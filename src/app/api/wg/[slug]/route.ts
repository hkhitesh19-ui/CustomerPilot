import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logQrScanEvent } from "@/lib/qr-engine"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ error: "Missing QR slug" }, { status: 400 })
    }

    const qrCode = await db.qrCode.findUnique({
      where: { slug },
      include: {
        merchant: {
          select: { id: true, name: true, logoUrl: true, status: true }
        }
      }
    })

    if (!qrCode) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>QR Code Not Found</h2><p>This dynamic QR code does not exist or has been removed.</p></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      )
    }

    if (!qrCode.isActive) {
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>QR Code Inactive</h2><p>This merchant's QR code is temporarily deactivated.</p></body></html>`,
        { status: 403, headers: { "Content-Type": "text/html" } }
      )
    }

    // Fire-and-forget scan logging
    logQrScanEvent(qrCode.id, qrCode.merchantId, req).catch(() => {})

    // Mode A: Direct Redirection (Tier 1: Zero-Friction 0-second redirect)
    if (qrCode.redirectMode === "DIRECT") {
      let targetUrl = qrCode.currentDest.trim()
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `https://${targetUrl}`
      }
      return NextResponse.redirect(targetUrl, 302)
    }

    // Mode B: Lead Capture Form (Tier 2: Mini Registration Form)
    const host = req.headers.get("host") || "customerpilot.in"
    const protocol = host.includes("localhost") ? "http" : "https"
    return NextResponse.redirect(`${protocol}://${host}/wg/${slug}`, 302)
  } catch (err: any) {
    console.error("[WG Redirect Error]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
