// POST /api/rewards/redeem — redeem a reward for a customer.
// Body: { staffId, customerId, rewardId }
// Behavior:
//   - If reward.requiresManagerApproval and staff is CASHIER → status=pending_approval
//   - Otherwise consume completed cards and create status=completed redemption
//   - If reward stock is 0 → return "out of stock" error (edge case)
//   - Queue WhatsApp redemption_confirm message
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"
import { spendStampsForRedemption } from "@/lib/stamp-engine"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, customerId, rewardId } = body as { staffId?: string; customerId?: string; rewardId?: string }

  if (!staffId || !customerId || !rewardId) {
    return err("staffId, customerId, rewardId required")
  }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "rewards.redeem")) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "RBAC_DENIED",
        entity: "Redemption",
        metadata: JSON.stringify({ permission: "rewards.redeem" }),
      },
    })
    return err(deniedMessage(staff.role as Role, "rewards.redeem"), 403)
  }

  const reward = await db.reward.findUnique({ where: { id: rewardId } })
  if (!reward || reward.merchantId !== merchant.id) return err("Reward not found", 404)
  if (!reward.active) return err("Reward is not active")
  if (reward.stock <= 0) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "REDEMPTION_OUT_OF_STOCK",
        entity: "Reward",
        entityId: reward.id,
        metadata: JSON.stringify({ name: reward.name }),
      },
    })
    return err(`Reward "${reward.name}" is out of stock`, 409)
  }

  const customer = await db.customer.findUnique({ where: { id: customerId } })
  if (!customer || customer.merchantId !== merchant.id) return err("Customer not found", 404)

  // Manager-approval branch
  if (reward.requiresManagerApproval && staff.role === "CASHIER") {
    const redemption = await db.redemption.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        rewardId: reward.id,
        stampsSpent: reward.stampsCost,
        status: "pending_approval",
      },
    })
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "REDEMPTION_PENDING_APPROVAL",
        entity: "Redemption",
        entityId: redemption.id,
        metadata: JSON.stringify({ reward: reward.name, customer: customer.name }),
      },
    })
    return ok({ redemption, status: "pending_approval" })
  }

  // Spend stamps (consume completed cards)
  const spend = await spendStampsForRedemption({ customerId: customer.id, rewardCost: reward.stampsCost })
  if (!spend.ok) {
    return err(spend.reason ?? "Insufficient completed stamp cards", 409)
  }

  // Decrement stock
  await db.reward.update({
    where: { id: reward.id },
    data: { stock: { decrement: 1 } },
  })

  const redemption = await db.redemption.create({
    data: {
      merchantId: merchant.id,
      customerId: customer.id,
      rewardId: reward.id,
      approvedById: staff.id,
      stampsSpent: reward.stampsCost,
      status: "completed",
    },
  })

  // WhatsApp confirmation
  if (customer.whatsappOptIn && customer.phone) {
    await db.whatsAppMessage.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        toPhone: customer.phone,
        template: "redemption_confirm",
        body: `Hi ${customer.name}! ✅ You've redeemed: ${reward.name}. Thanks for being a loyal customer of ${merchant.name}.`,
        status: "queued",
      },
    })
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "REDEMPTION_APPROVED",
      entity: "Redemption",
      entityId: redemption.id,
      metadata: JSON.stringify({ reward: reward.name, customer: customer.name, cardsSpent: spend.cardIds.length }),
    },
  })

  return ok({ redemption, status: "completed", cardIds: spend.cardIds })
}
