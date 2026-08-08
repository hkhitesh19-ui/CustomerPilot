// POST /api/referrals/approve — approve a pending referral (manager+).
// Awards bonus stamps to both referrer and friend.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, referralId } = body as { staffId?: string; referralId?: string }
  if (!staffId || !referralId) return err("staffId and referralId required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "referrals.approve")) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "RBAC_DENIED",
        entity: "Referral",
        metadata: JSON.stringify({ permission: "referrals.approve" }),
      },
    })
    return err(deniedMessage(staff.role as Role, "referrals.approve"), 403)
  }

  const referral = await db.referral.findUnique({ where: { id: referralId } })
  if (!referral || referral.merchantId !== merchant.id) return err("Referral not found", 404)
  if (referral.status === "approved") return err("Already approved")
  if (referral.status === "fraud_flagged") return err("Cannot approve a fraud-flagged referral")

  const BONUS_REFERRER = 1
  const BONUS_FRIEND = 1

  // Award bonus stamp to referrer
  const referrer = await db.customer.findUnique({ where: { id: referral.referrerId } })
  if (!referrer) return err("Referrer customer not found", 404)

  // Find or create a stamp card for referrer
  let template = await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } })
  if (template) {
    let card = await db.customerStampCard.findFirst({
      where: { customerId: referrer.id, stampCardId: template.id, completed: false, redeemed: false },
    })
    if (!card) {
      card = await db.customerStampCard.create({
        data: { customerId: referrer.id, stampCardId: template.id, merchantId: merchant.id, stampsCollected: 0 },
      })
    }
    await db.stamp.create({
      data: { customerId: referrer.id, stampCardId: template.id, customerStampCardId: card.id, merchantId: merchant.id, source: "referral_bonus" },
    })
    const newCount = Math.min(card.stampsCollected + 1, template.stampsRequired)
    await db.customerStampCard.update({
      where: { id: card.id },
      data: { stampsCollected: newCount, completed: newCount >= template.stampsRequired },
    })
  }
  await db.customer.update({
    where: { id: referrer.id },
    data: { lifetimeStamps: { increment: BONUS_REFERRER } },
  })

  // Award to friend if linked
  if (referral.friendCustomerId) {
    const friend = await db.customer.findUnique({ where: { id: referral.friendCustomerId } })
    if (friend && template) {
      let fcard = await db.customerStampCard.findFirst({
        where: { customerId: friend.id, stampCardId: template.id, completed: false, redeemed: false },
      })
      if (!fcard) {
        fcard = await db.customerStampCard.create({
          data: { customerId: friend.id, stampCardId: template.id, merchantId: merchant.id, stampsCollected: 0 },
        })
      }
      await db.stamp.create({
        data: { customerId: friend.id, stampCardId: template.id, customerStampCardId: fcard.id, merchantId: merchant.id, source: "referral_bonus" },
      })
      const newCount = Math.min(fcard.stampsCollected + 1, template.stampsRequired)
      await db.customerStampCard.update({
        where: { id: fcard.id },
        data: { stampsCollected: newCount, completed: newCount >= template.stampsRequired },
      })
    }
    if (friend) {
      await db.customer.update({
        where: { id: friend.id },
        data: { lifetimeStamps: { increment: BONUS_FRIEND } },
      })
      // WhatsApp
      await db.whatsAppMessage.create({
        data: {
          merchantId: merchant.id,
          customerId: friend.id,
          toPhone: friend.phone,
          template: "referral_bonus",
          body: `Hi ${friend.name}! 🎁 You received a ${BONUS_FRIEND}-stamp referral bonus from ${referrer.name}.`,
          status: "queued",
        },
      })
    }
  }

  await db.whatsAppMessage.create({
    data: {
      merchantId: merchant.id,
      customerId: referrer.id,
      toPhone: referrer.phone,
      template: "referral_bonus",
      body: `Hi ${referrer.name}! 🎁 Your referral was approved. +${BONUS_REFERRER} bonus stamp added.`,
      status: "queued",
    },
  })

  // RACE CONDITION FIX: Atomically check + mark referral as approved
  let updatedReferral: typeof referral
  try {
    updatedReferral = await db.$transaction(async (tx) => {
      // Re-check referral status inside transaction
      const freshReferral = await tx.referral.findUnique({ where: { id: referral.id } })
      if (!freshReferral || freshReferral.status === 'approved') {
        throw new Error('ALREADY_APPROVED')
      }
      if (freshReferral.status === 'fraud_flagged') {
        throw new Error('FRAUD_FLAGGED')
      }

      return tx.referral.update({
        where: { id: referral.id },
        data: { status: 'approved', bonusStampsReferrer: BONUS_REFERRER, bonusStampsFriend: BONUS_FRIEND },
      })
    })
  } catch (txError: any) {
    if (txError.message === 'ALREADY_APPROVED') return err('Already approved')
    if (txError.message === 'FRAUD_FLAGGED') return err('Cannot approve a fraud-flagged referral')
    console.error('[referrals/approve] Transaction error:', txError)
    return err('Referral approval failed due to a server error', 500)
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "REFERRAL_APPROVED",
      entity: "Referral",
      entityId: referral.id,
      metadata: JSON.stringify({ referrer: referrer.name, bonusReferrer: BONUS_REFERRER, bonusFriend: BONUS_FRIEND }),
    },
  })

  return ok({ referral: updatedReferral })
}
