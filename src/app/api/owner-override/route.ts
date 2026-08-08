// POST /api/owner-override — owner manually gives stamps or reward to a customer.
// Body: { staffId, customerId, type: 'stamps'|'reward'|'both', amount?, rewardId?, reason, notifyCustomer? }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

const MONTHLY_OVERRIDE_CAP = 5

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
    const { staffId, customerId, type, amount, rewardId, reason, notifyCustomer } = body as {
      staffId?: string; customerId?: string; type?: string; amount?: number; rewardId?: string; reason?: string; notifyCustomer?: boolean
    }
    if (!staffId || !customerId || !type || !reason) return err("staffId, customerId, type, reason required")
    if (typeof staffId !== 'string' || typeof customerId !== 'string') return err("staffId and customerId must be strings")
    if (!['stamps', 'reward', 'both'].includes(type)) return err("type must be 'stamps', 'reward', or 'both'")
    if (reason.length < 10) return err("Reason must be at least 10 characters")

    const staff = await db.staff.findUnique({ where: { id: staffId } })
    if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
    if (staff.role !== "OWNER") return err("Only Owner can perform manual overrides", 403)

    // Monthly cap check
    const monthKey = new Date().toISOString().slice(0, 7) // YYYY-MM
    const overridesThisMonth = await db.ownerOverrideLog.count({
      where: { merchantId: merchant.id, ownerStaffId: staffId, monthKey },
    })
    if (overridesThisMonth >= MONTHLY_OVERRIDE_CAP) {
      return err(`Monthly override cap (${MONTHLY_OVERRIDE_CAP}) exceeded. Contact support to increase.`, 403)
    }

    const customer = await db.customer.findUnique({ where: { id: customerId } })
    if (!customer || customer.merchantId !== merchant.id) return err("Customer not found", 404)

    let stampsAwarded = 0
    let finalRewardId = rewardId ?? null

    // Award stamps if requested
    if ((type === "stamps" || type === "both") && amount && amount > 0) {
      stampsAwarded = amount
      const template = await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } })
      if (template) {
        let card = await db.customerStampCard.findFirst({
          where: { customerId: customer.id, stampCardId: template.id, completed: false, redeemed: false },
        })
        if (!card) {
          card = await db.customerStampCard.create({
            data: { customerId: customer.id, stampCardId: template.id, merchantId: merchant.id, stampsCollected: 0 },
          })
        }
        for (let i = 0; i < amount; i++) {
          await db.stamp.create({
            data: { customerId: customer.id, stampCardId: template.id, customerStampCardId: card.id, merchantId: merchant.id, source: "manual_override" },
          })
        }
        const newCount = Math.min(card.stampsCollected + amount, template.stampsRequired)
        await db.customerStampCard.update({
          where: { id: card.id },
          data: { stampsCollected: newCount, completed: newCount >= template.stampsRequired },
        })
        await db.customer.update({
          where: { id: customer.id },
          data: { lifetimeStamps: { increment: amount } },
        })
      }
    }

    // Award reward if requested
    if (type === "reward" || type === "both") {
      if (!rewardId) return err("rewardId required for reward/both type")
      const reward = await db.reward.findUnique({ where: { id: rewardId } })
      if (!reward || reward.merchantId !== merchant.id) return err("Reward not found", 404)

      // V6.2 Fix: Owner override gifts DO decrement inventory.
      // The pastry/cupcake is physically handed over — inventory must reflect this.
      // If stock = 0, block the override (merchant must restock first or pick different reward).
      if (reward.stock <= 0) {
        return err(`Cannot override: "${reward.name}" is out of stock. Restock or pick a different reward.`, 409)
      }

      finalRewardId = reward.id
      // Decrement inventory (V6.2 fix — gift physically consumes inventory)
      await db.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } },
      })
      // Create redemption
      await db.redemption.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          rewardId: reward.id,
          approvedById: staffId,
          stampsSpent: 0, // override — no stamps spent
          status: "completed",
          notes: `Manual override: ${reason}`,
        },
      })
      await db.customer.update({
        where: { id: customer.id },
        data: { lifetimeRedemptions: { increment: 1 } },
      })
    }

    // Log the override
    await db.ownerOverrideLog.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        ownerStaffId: staffId,
        overrideType: type,
        monthKey,
      },
    })

    // Notify customer if requested
    if ((notifyCustomer ?? true) && customer.whatsappOptIn && customer.phone) {
      const msgBody = stampsAwarded > 0 && finalRewardId
        ? `Hi ${customer.name}! ${merchant.name} has gifted you ${stampsAwarded} bonus stamps and a free reward. Reason: ${reason}`
        : stampsAwarded > 0
          ? `Hi ${customer.name}! ${merchant.name} has gifted you ${stampsAwarded} bonus stamps. Reason: ${reason}`
          : `Hi ${customer.name}! ${merchant.name} has a surprise gift for you. Visit us to claim it.`
      await db.whatsAppMessage.create({
        data: {
          merchantId: merchant.id,
          customerId: customer.id,
          toPhone: customer.phone,
          template: "manual_override",
          body: msgBody,
          status: "queued",
        },
      })
    }

    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staffId,
        staffId,
        action: "OWNER_OVERRIDE",
        entity: "Customer",
        entityId: customerId,
        metadata: JSON.stringify({ type, stampsAwarded, rewardId: finalRewardId, reason, monthKey, overridesUsed: overridesThisMonth + 1 }),
      },
    })

    return ok({ success: true, stampsAwarded, rewardId: finalRewardId, overridesUsedThisMonth: overridesThisMonth + 1 })
  } catch (error: unknown) {
    console.error('[Owner Override Error]', error)
    return err('Failed to process owner override', 500)
  }
}
