import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateSlug } from "@/lib/qr-engine"
import { generateBrandedQRDataUrl } from "@/lib/branded-qr"
import { getAuthenticatedMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    let merchantId = req.headers.get("x-merchant-id") || req.nextUrl.searchParams.get("merchantId")
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
    }
    if (!merchantId) {
      return NextResponse.json({ error: "Unauthorized: Merchant ID required" }, { status: 401 })
    }

    let qrCodes = await db.qrCode.findMany({
      where: { merchantId },
      include: {
        destinations: { orderBy: { changedAt: "desc" }, take: 5 },
        _count: { select: { scanEvents: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    // If merchant has no QR code yet, auto-scaffold a default one
    if (qrCodes.length === 0) {
      const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
      if (merchant) {
        const baseSlug = generateSlug(merchant.name || "store")
        // Ensure uniqueness
        let uniqueSlug = baseSlug
        let count = 1
        while (await db.qrCode.findUnique({ where: { slug: uniqueSlug } })) {
          uniqueSlug = `${baseSlug}-${count++}`
        }

        const defaultDest = merchant.communityUrl || "https://chat.whatsapp.com/"
        const newQr = await db.qrCode.create({
          data: {
            merchantId: merchant.id,
            slug: uniqueSlug,
            label: "Main Counter QR",
            currentDest: defaultDest,
            redirectMode: "DIRECT",
            tier: "LITE"
          },
          include: {
            destinations: true,
            _count: { select: { scanEvents: true } }
          }
        })
        qrCodes = [newQr]
      }
    }

    const host = req.headers.get("host") || "customerpilot.in"
    const protocol = host.includes("localhost") ? "http" : "https"

    // Attach generated QR data URLs
    const enhanced = await Promise.all(
      qrCodes.map(async (qr) => {
        const fullUrl = `${protocol}://${host}/api/wg/${qr.slug}`
        const qrImage = await generateBrandedQRDataUrl(fullUrl, { width: 500 }).catch(() => "")
        return {
          ...qr,
          publicUrl: fullUrl,
          qrDataUrl: qrImage
        }
      })
    )

    return NextResponse.json({ success: true, qrCodes: enhanced })
  } catch (err: any) {
    console.error("[QR Codes GET API Error]:", err)
    return NextResponse.json({ error: "Failed to fetch QR codes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
    }
    if (!merchantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { label, currentDest, redirectMode, customSlug } = body

    if (!currentDest) {
      return NextResponse.json({ error: "Destination URL is required" }, { status: 400 })
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    const baseSlug = customSlug ? generateSlug(customSlug) : generateSlug(merchant.name)
    let uniqueSlug = baseSlug
    let count = 1
    while (await db.qrCode.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count++}`
    }

    const qr = await db.qrCode.create({
      data: {
        merchantId,
        slug: uniqueSlug,
        label: label || "Store QR",
        currentDest: currentDest.trim(),
        redirectMode: redirectMode === "FORM_CAPTURE" ? "FORM_CAPTURE" : "DIRECT",
        tier: redirectMode === "FORM_CAPTURE" ? "PRO" : "LITE"
      }
    })

    return NextResponse.json({ success: true, qrCode: qr })
  } catch (err: any) {
    console.error("[QR Codes POST API Error]:", err)
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 })
  }
}
