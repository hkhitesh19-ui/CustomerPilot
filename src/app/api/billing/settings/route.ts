import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"

export interface BillingSettings {
  itemizedBillingEnabled: boolean
  defaultGstRate: number
  gstType: "CGST_SGST" | "IGST" | "EXEMPT"
  gstin: string
  invoicePrefix: string
  upiId: string
  terms: string
  thankYouMessage: string
}

const DEFAULT_SETTINGS: BillingSettings = {
  itemizedBillingEnabled: false,
  defaultGstRate: 0,
  gstType: "CGST_SGST",
  gstin: "",
  invoicePrefix: "INV-",
  upiId: "",
  terms: "Thank you for shopping with us! Goods once sold will not be returned.",
  thankYouMessage: "🙏 Thank you for your visit! Please visit again.",
}

async function resolveMerchantId(req: NextRequest): Promise<string | null> {
  const headerId = req.headers.get("x-merchant-id")
  if (headerId) return headerId

  const merchant = await getAuthenticatedMerchant()
  return merchant?.id || null
}

export async function GET(req: NextRequest) {
  try {
    const merchantId = await resolveMerchantId(req)
    if (!merchantId) return err("Unauthorized", 401)

    const record = await db.systemContent.findUnique({
      where: { key: `MERCHANT_BILLING_SETTINGS_${merchantId}` },
    })

    if (!record?.value) {
      return ok({ settings: DEFAULT_SETTINGS })
    }

    let parsed = {}
    try {
      parsed = JSON.parse(record.value)
    } catch (_) {}

    return ok({ settings: { ...DEFAULT_SETTINGS, ...parsed } })
  } catch (error: any) {
    return err(error.message || "Failed to fetch billing settings", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchantId = await resolveMerchantId(req)
    if (!merchantId) return err("Unauthorized", 401)

    const body = await req.json().catch(() => ({}))

    const currentRecord = await db.systemContent.findUnique({
      where: { key: `MERCHANT_BILLING_SETTINGS_${merchantId}` },
    })

    let existing = DEFAULT_SETTINGS
    if (currentRecord?.value) {
      try {
        existing = { ...DEFAULT_SETTINGS, ...JSON.parse(currentRecord.value) }
      } catch (_) {}
    }

    const updatedSettings: BillingSettings = {
      itemizedBillingEnabled: body.itemizedBillingEnabled !== undefined ? Boolean(body.itemizedBillingEnabled) : existing.itemizedBillingEnabled,
      defaultGstRate: body.defaultGstRate !== undefined ? Number(body.defaultGstRate) : existing.defaultGstRate,
      gstType: body.gstType ? body.gstType : existing.gstType,
      gstin: body.gstin !== undefined ? String(body.gstin).trim().toUpperCase() : existing.gstin,
      invoicePrefix: body.invoicePrefix !== undefined ? String(body.invoicePrefix).trim().toUpperCase() : existing.invoicePrefix,
      upiId: body.upiId !== undefined ? String(body.upiId).trim() : existing.upiId,
      terms: body.terms !== undefined ? String(body.terms).trim() : existing.terms,
      thankYouMessage: body.thankYouMessage !== undefined ? String(body.thankYouMessage).trim() : (existing.thankYouMessage || DEFAULT_SETTINGS.thankYouMessage),
    }

    await db.systemContent.upsert({
      where: { key: `MERCHANT_BILLING_SETTINGS_${merchantId}` },
      update: { value: JSON.stringify(updatedSettings) },
      create: {
        section: "MERCHANT_BILLING",
        key: `MERCHANT_BILLING_SETTINGS_${merchantId}`,
        value: JSON.stringify(updatedSettings),
        category: "BILLING",
      },
    })

    return ok({ message: "Billing settings saved successfully", settings: updatedSettings })
  } catch (error: any) {
    return err(error.message || "Failed to save billing settings", 500)
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req)
}
