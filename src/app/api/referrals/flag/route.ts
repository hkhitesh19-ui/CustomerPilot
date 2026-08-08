// POST /api/referrals/flag — flag a referral as suspected fraud (manager+).
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
    const { staffId, referralId, reason } = body as { staffId?: string; referralId?: string; reason?: string }
    if (!staffId || !referralId) return err("staffId and referralId required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "referrals.flag")) {
    return err(deniedMessage(staff.role as Role, "referrals.flag"), 403)
  }

  const referral = await db.referral.findUnique({ where: { id: referralId } })
  if (!referral || referral.merchantId !== merchant.id) return err("Referral not found", 404)

  const updated = await db.referral.update({
    where: { id: referral.id },
    data: { status: "fraud_flagged", flaggedReason: reason ?? "Suspected fraud" },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "REFERRAL_FLAGGED_FRAUD",
      entity: "Referral",
      entityId: referral.id,
      metadata: JSON.stringify({ reason }),
    },
  })

  return ok({ referral: updated })
  } catch (error: unknown) {
    console.error('[Referrals Flag Error]', error)
    return err('Failed to flag referral', 500)
  }
}
