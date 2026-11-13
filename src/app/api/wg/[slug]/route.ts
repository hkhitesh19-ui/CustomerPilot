import { NextRequest, NextResponse } from "next/server"
import { logQrScanEvent, resolveQrBySlug } from "@/lib/qr-engine"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ error: "Missing QR slug" }, { status: 400 })
    }

    const qrCode = await resolveQrBySlug(slug)

    if (!qrCode) {
      const isJson = req.nextUrl.searchParams.get("info") === "true" || req.headers.get("accept")?.includes("application/json")
      if (isJson) {
        return NextResponse.json({ error: "QR code not found or inactive." }, { status: 404 })
      }
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>QR Code Not Found</h2><p>This dynamic QR code does not exist or has been removed.</p></body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      )
    }

    if (!qrCode.isActive) {
      const isJson = req.nextUrl.searchParams.get("info") === "true" || req.headers.get("accept")?.includes("application/json")
      if (isJson) {
        return NextResponse.json({ error: "This merchant's QR code is temporarily deactivated." }, { status: 403 })
      }
      return new NextResponse(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>QR Code Inactive</h2><p>This merchant's QR code is temporarily deactivated.</p></body></html>`,
        { status: 403, headers: { "Content-Type": "text/html" } }
      )
    }

    // Metadata JSON API endpoint for /wg/[slug] frontend rendering
    if (req.nextUrl.searchParams.get("info") === "true") {
      return NextResponse.json({
        success: true,
        qrCode: {
          id: qrCode.id,
          slug: qrCode.slug,
          label: qrCode.label,
          currentDest: qrCode.currentDest,
          redirectMode: qrCode.redirectMode
        },
        merchant: {
          id: qrCode.merchant.id,
          name: qrCode.merchant.name,
          logoUrl: qrCode.merchant.logoUrl,
          category: (qrCode.merchant as any).category || "Local Business"
        }
      })
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
    return NextResponse.redirect(`${protocol}://${host}/wg/${qrCode.slug}`, 302)
  } catch (err: any) {
    console.error("[WG Redirect Error]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
