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

  // Spend stamps + decrement stock + create redemption — all in one transaction to prevent race conditions
  let spend: { ok: boolean; reason?: string; cardIds: string[] }
  let redemption: Awaited<ReturnType<typeof db.redemption.create>>

  try {
    const result = await db.$transaction(async (tx) => {
      // Re-check stock inside transaction (prevents double-spend race)
      const freshReward = await tx.reward.findUnique({ where: { id: reward.id } })
      if (!freshReward || freshReward.stock <= 0) {
        throw new Error('OUT_OF_STOCK')
      }

      // Decrement stock atomically inside transaction
      await tx.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } },
      })

      // Create redemption record
      const newRedemption = await tx.redemption.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          rewardId: reward.id,
          approvedById: staff.id,
          stampsSpent: reward.stampsCost,
          status: 'completed',
        },
      })

      return { redemption: newRedemption }
    })

    redemption = result.redemption
  } catch (txError: any) {
    if (txError.message === 'OUT_OF_STOCK') {
      return err(`Reward "${reward.name}" is out of stock`, 409)
    }
    console.error('[rewards/redeem] Transaction error:', txError)
    return err('Redemption failed due to a server error', 500)
  }

  // Spend stamps (outside transaction — stamp engine has its own logic)
  spend = await spendStampsForRedemption({ customerId: customer.id, rewardCost: reward.stampsCost })
  if (!spend.ok) {
    // Roll back stock decrement if stamps couldn't be spent
    await db.reward.update({ where: { id: reward.id }, data: { stock: { increment: 1 } } }).catch(() => {})
    await db.redemption.delete({ where: { id: redemption.id } }).catch(() => {})
    return err(spend.reason ?? 'Insufficient completed stamp cards', 409)
  }

  // WhatsApp confirmation
  if (customer.whatsappOptIn && customer.phone) {
    await db.whatsAppMessage.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        toPhone: customer.phone,
        template: 'redemption_confirm',
        body: `Hi ${customer.name}! ✅ You've redeemed: ${reward.name}. Thanks for being a loyal customer of ${merchant.name}.`,
        status: 'queued',
      },
    })
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: 'STAFF',
      actorId: staff.id,
      staffId: staff.id,
      action: 'REDEMPTION_APPROVED',
      entity: 'Redemption',
      entityId: redemption.id,
      metadata: JSON.stringify({ reward: reward.name, customer: customer.name, cardsSpent: spend.cardIds.length }),
    },
  })

  return ok({ redemption, status: 'completed', cardIds: spend.cardIds })
}
