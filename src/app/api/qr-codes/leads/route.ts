import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
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

    const leads = await db.customer.findMany({
      where: {
        merchantId,
        acquisitionChan: "qr_whatsapp_group"
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        whatsappOptIn: true,
        consents: {
          select: {
            consentType: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      totalLeads: leads.length,
      leads: leads.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        joinedAt: l.createdAt,
        whatsappOptIn: l.whatsappOptIn,
        hasTransactionalConsent: l.consents.some(c => c.consentType === "transactional" && c.status === "opted_in"),
        hasMarketingConsent: l.consents.some(c => c.consentType === "marketing" && c.status === "opted_in")
      }))
    })
  } catch (err: any) {
    console.error("[QR Leads GET Error]:", err)
    return NextResponse.json({ error: "Failed to fetch booster leads" }, { status: 500 })
  }
}
