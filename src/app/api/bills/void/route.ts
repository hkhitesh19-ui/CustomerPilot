// POST /api/bills/void — void a confirmed bill (manager+).
// Reverses awarded stamps from the customer's active card.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")

  const { billId, staffId, reason } = body as { billId?: string; staffId?: string; reason?: string }
  if (!billId || !staffId) return err("billId and staffId are required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)

  if (!can(staff.role as Role, "bills.void")) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "RBAC_DENIED",
        entity: "Bill",
        metadata: JSON.stringify({ permission: "bills.void", billId }),
      },
    })
    return err(deniedMessage(staff.role as Role, "bills.void"), 403)
  }

  const bill = await db.bill.findUnique({ where: { id: billId } })
  if (!bill || bill.merchantId !== merchant.id) return err("Bill not found", 404)
  if (bill.status === "voided") return err("Bill is already voided")

  // Reverse stamps: delete stamp rows tied to this bill, decrement counter
  const stampsToDelete = await db.stamp.findMany({ where: { billId: bill.id } })
  await db.stamp.deleteMany({ where: { billId: bill.id } })

  // Group stamps by customer stamp card
  const cardStampCounts = new Map<string, number>()
  for (const s of stampsToDelete) {
    if (s.customerStampCardId) {
      cardStampCounts.set(
        s.customerStampCardId,
        (cardStampCounts.get(s.customerStampCardId) ?? 0) + 1
      )
    }
  }
  for (const [cardId, count] of cardStampCounts) {
    const c = await db.customerStampCard.findUnique({ where: { id: cardId } })
    if (c) {
      const newCount = Math.max(0, c.stampsCollected - count)
      await db.customerStampCard.update({
        where: { id: cardId },
        data: { stampsCollected: newCount, completed: false },
      })
    }
  }

  // Decrement customer lifetime stats
  await db.customer.update({
    where: { id: bill.customerId },
    data: {
      lifetimeStamps: { decrement: bill.stampsAwarded },
      lifetimeSpend: { decrement: bill.amount },
    },
  })

  const updated = await db.bill.update({
    where: { id: billId },
    data: { status: "voided", notes: reason ? `VOIDED: ${reason}` : "VOIDED" },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "BILL_VOIDED",
      entity: "Bill",
      entityId: bill.id,
      metadata: JSON.stringify({ number: bill.number, reason }),
    },
  })

  return ok({ bill: updated })
}
