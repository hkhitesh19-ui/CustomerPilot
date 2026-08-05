// POST /api/referrals — create a new referral (a customer shares with a friend).
// Body: { staffId, referrerCustomerId, friendPhone }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, referrerCustomerId, friendPhone } = body as {
    staffId?: string
    referrerCustomerId?: string
    friendPhone?: string
  }

  if (!staffId || !referrerCustomerId || !friendPhone) {
    return err("staffId, referrerCustomerId, friendPhone required")
  }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)

  const referrer = await db.customer.findUnique({ where: { id: referrerCustomerId } })
  if (!referrer || referrer.merchantId !== merchant.id) return err("Referrer not found", 404)

  // Duplicate prevention: same friend already referred?
  const existing = await db.referral.findFirst({
    where: { merchantId: merchant.id, referrerId: referrer.id, friendPhone },
  })
  if (existing) return err("This friend has already been referred by this customer", 409)

  const referral = await db.referral.create({
    data: {
      merchantId: merchant.id,
      referrerId: referrer.id,
      friendPhone,
      status: "pending",
    },
  })

  // Queue WhatsApp to friend with referral link/code
  await db.whatsAppMessage.create({
    data: {
      merchantId: merchant.id,
      toPhone: friendPhone,
      template: "referral_invite",
      body: `Hi! ${referrer.name} invited you to ${merchant.name}. Show code ${referrer.referralCode} on your first visit to get a bonus stamp! 🎁`,
      status: "queued",
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "REFERRAL_CREATED",
      entity: "Referral",
      entityId: referral.id,
      metadata: JSON.stringify({ referrer: referrer.name, friendPhone }),
    },
  })

  return ok({ referral })
}
