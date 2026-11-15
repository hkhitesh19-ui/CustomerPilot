import { NextRequest, NextResponse } from "next/server"
import { generateBrandedQRDataUrl } from "@/lib/branded-qr"
import { getAuthenticatedMerchant } from "@/lib/api"
import { db } from "@/lib/db"
import { sanitizeDestinationUrl } from "@/lib/url-sanitizer"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, noLogo, customLogoUrl } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const sanitized = sanitizeDestinationUrl(url)
    const targetUrl = sanitized.isValid ? sanitized.cleanUrl : url.trim()

    let merchantLogoUrl: string | null = customLogoUrl || null
    if (!noLogo && !merchantLogoUrl) {
      const authM = await getAuthenticatedMerchant()
      if (authM) {
        const m = await db.merchant.findUnique({
          where: { id: authM.id },
          select: { logoUrl: true }
        })
        merchantLogoUrl = m?.logoUrl || null
      }
    }

    const qrDataUrl = await generateBrandedQRDataUrl(targetUrl, {
      width: 800,
      noLogo: Boolean(noLogo),
      merchantLogoUrl: noLogo ? null : merchantLogoUrl
    })

    return NextResponse.json({ success: true, qrDataUrl, cleanUrl: targetUrl })
  } catch (err: any) {
    console.error("[QR Preview Error]:", err)
    return NextResponse.json({ error: "Failed to generate QR preview" }, { status: 500 })
  }
}
