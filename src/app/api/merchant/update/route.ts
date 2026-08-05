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
