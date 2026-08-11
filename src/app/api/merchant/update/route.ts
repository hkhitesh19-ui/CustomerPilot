import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
export async function PATCH(req: NextRequest) {
  const merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) return err("Unauthorized", 401)

  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON payload", 400)

  // Validate only the allowed fields
  const allowedUpdates: any = {}
  if (body.name !== undefined) allowedUpdates.name = body.name
  if (body.ownerName !== undefined) allowedUpdates.ownerName = body.ownerName
  if (body.businessType !== undefined) allowedUpdates.businessType = body.businessType
  if (body.address !== undefined) allowedUpdates.address = body.address
  if (body.businessTiming !== undefined) allowedUpdates.businessTiming = body.businessTiming
  if (body.category !== undefined) allowedUpdates.category = body.category
  if (body.timezone !== undefined) allowedUpdates.timezone = body.timezone
  if (body.whatsappPhone !== undefined) allowedUpdates.whatsappPhone = body.whatsappPhone
  if (body.googleReviewDelayMinutes !== undefined) {
    const delay = Number(body.googleReviewDelayMinutes)
    const validDelays = [0, 5, 15, 30, 45, 60, 120, 180, 240, 360, 480, 720, 1440]
    if (!Number.isInteger(delay) || !validDelays.includes(delay)) {
      return err("Invalid Google Review delay option. Must be a valid delay in minutes.", 400)
    }
    allowedUpdates.googleReviewDelayMinutes = delay
  }
  if (body.vipUpgradeBonusStamps !== undefined) {
    const bonus = Number(body.vipUpgradeBonusStamps)
    if (Number.isInteger(bonus) && bonus >= 0) {
      allowedUpdates.vipUpgradeBonusStamps = bonus
    }
  }
  if (body.winbackDays1 !== undefined) {
    const d = Number(body.winbackDays1)
    if (Number.isInteger(d) && d > 0) allowedUpdates.winbackDays1 = d
  }
  if (body.winbackDays2 !== undefined) {
    const d = Number(body.winbackDays2)
    if (Number.isInteger(d) && d > 0) allowedUpdates.winbackDays2 = d
  }
  if (body.winbackDays3 !== undefined) {
    const d = Number(body.winbackDays3)
    if (Number.isInteger(d) && d > 0) allowedUpdates.winbackDays3 = d
  }
  if (body.expiryWarningDays !== undefined) {
    const d = Number(body.expiryWarningDays)
    if (Number.isInteger(d) && d > 0) allowedUpdates.expiryWarningDays = d
  }
  if (body.almostThereInactivityDays !== undefined) {
    const d = Number(body.almostThereInactivityDays)
    if (Number.isInteger(d) && d > 0) allowedUpdates.almostThereInactivityDays = d
  }

  try {
    const updated = await db.merchant.update({
      where: { id: merchantId },
      data: allowedUpdates,
    })

    return ok({ message: "Merchant updated successfully", merchant: updated })
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('whatsappPhone')) {
      return err("This WhatsApp number is already linked to another account.", 400)
    }
    return err("Failed to update merchant configuration", 500)
  }
}
