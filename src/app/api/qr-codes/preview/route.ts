import { NextRequest, NextResponse } from "next/server"
import { generateBrandedQRDataUrl } from "@/lib/branded-qr"
import { getAuthenticatedMerchant } from "@/lib/api"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, noLogo, customLogoUrl } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

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

    const qrDataUrl = await generateBrandedQRDataUrl(url.trim(), {
      width: 800,
      noLogo: Boolean(noLogo),
      merchantLogoUrl: noLogo ? null : merchantLogoUrl
    })

    return NextResponse.json({ success: true, qrDataUrl })
  } catch (err: any) {
    console.error("[QR Preview Error]:", err)
    return NextResponse.json({ error: "Failed to generate QR preview" }, { status: 500 })
  }
}
