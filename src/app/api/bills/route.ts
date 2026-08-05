// @ts-nocheck
// POST /api/bills — create a confirmed bill (POS action).
// Body: { staffId, customerId, amount, notes? }
// Awards stamps based on active card rule, marks card as completed if threshold reached,
// queues WhatsApp stamp_earned / reward_ready messages, writes audit log.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { awardStampsForBill, stampsForAmount } from "@/lib/stamp-engine"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const merchantId = typeof req.headers.get('x-merchant-id') === 'string' 
    ? (req.headers.get('x-merchant-id') as string)
    : undefined;
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")

  const { staffId, customerId, amount, notes } = body as {
    staffId?: string
    customerId?: string
    amount?: number
    notes?: string
  }
  if (!staffId || !customerId || typeof amount !== "number") {
    return err("staffId, customerId, amount are required")
  }
  if (amount <= 0) return err("Amount must be > 0")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)

  // RBAC check
  if (!can(staff.role as Role, "bills.create")) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "RBAC_DENIED",
        entity: "Bill",
        metadata: JSON.stringify({ permission: "bills.create", customerId, amount }),
      },
    })
    return err(deniedMessage(staff.role as Role, "bills.create"), 403)
  }

  const customer = await db.customer.findUnique({ where: { id: customerId } })
  if (!customer || customer.merchantId !== merchant.id) {
    return err("Customer not found", 404)
  }

  // Generate bill number CP-YYYY-NNNN
  const year = new Date().getFullYear()
  const count = await db.bill.count({ where: { merchantId: merchant.id } })
  const number = `CP-${year}-${String(count + 1).padStart(4, "0")}`

  // Find active stamp card to know how many stamps will be awarded
  const template = await db.stampCard.findFirst({
    where: { merchantId: merchant.id, active: true },
    orderBy: { createdAt: "asc" },
  })
  const stamps = template ? stampsForAmount(template.stampsPerBill, amount) : 0

  // Create bill
  const bill = await db.bill.create({
    data: {
      merchantId: merchant.id,
      customerId: customer.id,
      issuedById: staff.id,
      number,
      amount,
      stampsAwarded: stamps,
      status: "confirmed",
      notes: notes ?? null,
    },
  })

  // Award stamps
  let awardResult: { stampsAwarded: number; cardId: string; cardCompleted: boolean; rewardReady: boolean } | null = null
  if (template) {
    awardResult = await awardStampsForBill({
      merchantId: merchant.id,
      customerId: customer.id,
      billId: bill.id,
      amount,
    })

    // Queue WhatsApp notifications
    if (customer.whatsappOptIn && customer.phone) {
      const total = await db.customerStampCard.findFirst({
        where: { customerId: customer.id, stampCardId: template.id, completed: false, redeemed: false },
      })
      const currentStamps = total?.stampsCollected ?? 0
      const remaining = Math.max(0, template.stampsRequired - currentStamps)

      if (awardResult.cardCompleted) {
        await db.whatsAppMessage.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            toPhone: customer.phone,
            template: "reward_ready",
            body: `Hi ${customer.name}! 🎉 You've completed your "${template.name}". Visit us to claim your reward: ${template.rewardName}.`,
            status: "queued",
          },
        })
      } else {
        await db.whatsAppMessage.create({
          data: {
            merchantId: merchant.id,
            customerId: customer.id,
            toPhone: customer.phone,
            template: "stamp_earned",
            body: `Hi ${customer.name}! You earned ${awardResult.stampsAwarded} stamp(s) on "${template.name}". Total: ${currentStamps}/${template.stampsRequired}. ${remaining} more to go!`,
            status: "queued",
          },
        })
      }
    }
  }

  // Audit log
  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "BILL_CREATED",
      entity: "Bill",
      entityId: bill.id,
      metadata: JSON.stringify({ number, amount, customerId, stampsAwarded: stamps }),
    },
  })

  return ok({ bill, awardResult })
}



