import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { hashIpAddress, resolveQrBySlug } from "@/lib/qr-engine"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await req.json()
    const { name, phone, transactionalConsent, marketingConsent } = body

    if (!phone || !name) {
      return NextResponse.json({ error: "Name and Phone number are required." }, { status: 400 })
    }

    const qrCode = await resolveQrBySlug(slug)

    if (!qrCode || !qrCode.isActive) {
      return NextResponse.json({ error: "QR code not found or inactive." }, { status: 404 })
    }

    const normalizedPhone = normalizePhone(phone)
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1"
    const ipHash = hashIpAddress(rawIp)

    // 1. Upsert Customer in CRM
    const customer = await db.customer.upsert({
      where: {
        merchantId_phone: {
          merchantId: qrCode.merchantId,
          phone: normalizedPhone
        }
      },
      update: {
        name: name.trim(),
        whatsappOptIn: Boolean(transactionalConsent),
        acquisitionChan: "qr_whatsapp_group"
      },
      create: {
        merchantId: qrCode.merchantId,
        phone: normalizedPhone,
        name: name.trim(),
        whatsappOptIn: Boolean(transactionalConsent),
        acquisitionChan: "qr_whatsapp_group"
      }
    })

    // 2. Record Customer Consent
    if (transactionalConsent) {
      await db.customerConsent.create({
        data: {
          customerId: customer.id,
          merchantId: qrCode.merchantId,
          consentType: "transactional",
          status: "opted_in",
          source: "qr_form",
          ipHash
        }
      }).catch(() => {})
    }

    if (marketingConsent) {
      await db.customerConsent.create({
        data: {
          customerId: customer.id,
          merchantId: qrCode.merchantId,
          consentType: "marketing",
          status: "opted_in",
          source: "qr_form",
          ipHash
        }
      }).catch(() => {})
    }

    let targetUrl = qrCode.currentDest.trim()
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`
    }

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      redirectUrl: targetUrl
    })
  } catch (err: any) {
    console.error("[WG Registration API Error]:", err)
    return NextResponse.json({ error: "Failed to complete registration." }, { status: 500 })
  }
}
