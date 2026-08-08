// POST /api/bills/refund — refund a confirmed bill (manager+).
// Like void, but keeps the bill record with status="refunded" for audit trail.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")

    const { billId, staffId, reason } = body as { billId?: string; staffId?: string; reason?: string }
    if (!billId || !staffId) return err("billId and staffId are required")
    if (typeof billId !== 'string' || typeof staffId !== 'string') return err("billId and staffId must be strings")

    const staff = await db.staff.findUnique({ where: { id: staffId } })
    if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)

    if (!can(staff.role as Role, "bills.refund")) {
      await db.auditLog.create({
        data: {
          merchantId: merchant.id,
          actorType: "STAFF",
          actorId: staff.id,
          staffId: staff.id,
          action: "RBAC_DENIED",
          entity: "Bill",
          metadata: JSON.stringify({ permission: "bills.refund", billId }),
        },
      })
      return err(deniedMessage(staff.role as Role, "bills.refund"), 403)
    }

    const bill = await db.bill.findUnique({ where: { id: billId } })
    if (!bill || bill.merchantId !== merchant.id) return err("Bill not found", 404)
    if (bill.status === "refunded") return err("Bill already refunded")
    if (bill.status === "voided") return err("Cannot refund a voided bill")

    // Reverse stamps
    const stampsToDelete = await db.stamp.findMany({ where: { billId: bill.id } })
    await db.stamp.deleteMany({ where: { billId: bill.id } })
    const cardStampCounts = new Map<string, number>()
    for (const s of stampsToDelete) {
      if (s.customerStampCardId) {
        cardStampCounts.set(s.customerStampCardId, (cardStampCounts.get(s.customerStampCardId) ?? 0) + 1)
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
    await db.customer.update({
      where: { id: bill.customerId },
      data: {
        lifetimeStamps: { decrement: bill.stampsAwarded },
        lifetimeSpend: { decrement: bill.amount },
      },
    })

    const updated = await db.bill.update({
      where: { id: billId },
      data: { status: "refunded", notes: reason ? `REFUND: ${reason}` : "REFUNDED" },
    })

    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "BILL_REFUNDED",
        entity: "Bill",
        entityId: bill.id,
        metadata: JSON.stringify({ number: bill.number, reason }),
      },
    })

    return ok({ bill: updated })
  } catch (error: unknown) {
    console.error('[Bills Refund Error]', error)
    return err('Failed to process refund', 500)
  }
}

