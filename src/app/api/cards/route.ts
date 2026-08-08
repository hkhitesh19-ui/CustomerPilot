// POST /api/cards — create or edit a stamp card template (manager+).
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, created, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, name, stampsRequired, rewardName, stampsPerBill, color, cardId } = body as {
    staffId?: string
    name?: string
    stampsRequired?: number
    rewardName?: string
    stampsPerBill?: string
    color?: string
    cardId?: string
  }

  if (!staffId || !name || typeof stampsRequired !== "number" || !rewardName) {
    return err("staffId, name, stampsRequired, rewardName required")
  }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)

  if (cardId) {
    // Edit existing
    if (!can(staff.role as Role, "cards.edit")) {
      return err(deniedMessage(staff.role as Role, "cards.edit"), 403)
    }
    const updated = await db.stampCard.update({
      where: { id: cardId },
      data: { name, stampsRequired, rewardName, stampsPerBill: stampsPerBill ?? "1", color: color ?? "amber" },
    })
    return ok({ card: updated })
  }

  if (!can(staff.role as Role, "cards.create")) {
    return err(deniedMessage(staff.role as Role, "cards.create"), 403)
  }

  const card = await db.stampCard.create({
    data: {
      merchantId: merchant.id,
      name,
      stampsRequired,
      rewardName,
      stampsPerBill: stampsPerBill ?? "1",
      color: color ?? "amber",
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "CARD_CREATED",
      entity: "StampCard",
      entityId: card.id,
      metadata: JSON.stringify({ name, stampsRequired }),
    },
  })

  return created({ card })
}
