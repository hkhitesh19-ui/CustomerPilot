import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    
    const data = await db.merchant.findUnique({
      where: { id: merchant.id },
      select: { showPoweredBy: true, ctaEnabled: true }
    })
    
    if (!data) return err("Merchant not found", 404)
    
    return ok(data)
  } catch (error: any) {
    return err(error.message || "Unauthorized", 401)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => ({}))
    const updateData: any = {}
    
    if (typeof body.showPoweredBy === "boolean") {
      updateData.showPoweredBy = body.showPoweredBy
    }
    
    if (typeof body.ctaEnabled === "boolean") {
      updateData.ctaEnabled = body.ctaEnabled
    }
    
    if (Object.keys(updateData).length === 0) {
      return err("No valid fields provided", 400)
    }
    
    const updated = await db.merchant.update({
      where: { id: merchant.id },
      data: updateData,
      select: { showPoweredBy: true, ctaEnabled: true }
    })
    
    return ok(updated)
  } catch (error: any) {
    return err(error.message || "Failed to update branding", 500)
  }
}
