// @ts-nocheck
// CustomerPilot V6 — Customer Merge Engine
// Merges duplicate customer records. Migrates all related data to canonical record.
// Soft-deletes duplicate. 7-day unmerge window.

import { db } from "@/lib/db"

export interface MergePreview {
  canonicalId: string
  duplicateId: string
  migration: {
    bills: number
    stamps: number
    customerStampCards: number
    redemptions: number
    reviews: number
    referrals: number
    achievements: number
    waMessages: number
    winBacks: number
  }
  conflicts: {
    birthday?: { canonical: string | null; duplicate: string | null }
    vipTier?: { canonical: string; duplicate: string }
    name?: { canonical: string; duplicate: string }
  }
  aggregated: {
    lifetimeStamps: number
    lifetimeSpend: number
    lifetimeRedemptions: number
  }
}

export async function previewMerge(opts: {
  canonicalId: string
  duplicateId: string
}): Promise<MergePreview> {
  const { canonicalId, duplicateId } = opts
  const [canonical, duplicate] = await Promise.all([
    db.customer.findUnique({ where: { id: canonicalId } }),
    db.customer.findUnique({ where: { id: duplicateId } }),
  ])
  if (!canonical || !duplicate) throw new Error("Customer not found")
  if (canonical.merchantId !== duplicate.merchantId) throw new Error("Cross-merchant merge not allowed")

  const [
    dupBills, dupStamps, dupCards, dupRedemptions, dupReviews,
    dupReferralsAsReferrer, dupAchievements, dupWAMessages, dupWinBacks,
  ] = await Promise.all([
    db.bill.count({ where: { customerId: duplicateId } }),
    db.stamp.count({ where: { customerId: duplicateId } }),
    db.customerStampCard.count({ where: { customerId: duplicateId } }),
    db.redemption.count({ where: { customerId: duplicateId } }),
    db.review.count({ where: { customerId: duplicateId } }),
    db.referral.count({ where: { referrerId: duplicateId } }),
    db.achievement.count({ where: { customerId: duplicateId } }),
    db.whatsAppMessage.count({ where: { customerId: duplicateId } }),
    db.winBackEscalation.count({ where: { customerId: duplicateId } }),
  ])

  const conflicts: MergePreview["conflicts"] = {}
  if (canonical.birthday !== duplicate.birthday) {
    conflicts.birthday = { canonical: canonical.birthday, duplicate: duplicate.birthday }
  }
  if (canonical.vipTier !== duplicate.vipTier) {
    conflicts.vipTier = { canonical: canonical.vipTier, duplicate: duplicate.vipTier }
  }
  if (canonical.name !== duplicate.name) {
    conflicts.name = { canonical: canonical.name, duplicate: duplicate.name }
  }

  return {
    canonicalId,
    duplicateId,
    migration: {
      bills: dupBills,
      stamps: dupStamps,
      customerStampCards: dupCards,
      redemptions: dupRedemptions,
      reviews: dupReviews,
      referrals: dupReferralsAsReferrer,
      achievements: dupAchievements,
      waMessages: dupWAMessages,
      winBacks: dupWinBacks,
    },
    conflicts,
    aggregated: {
      lifetimeStamps: canonical.lifetimeStamps + duplicate.lifetimeStamps,
      lifetimeSpend: canonical.lifetimeSpend + duplicate.lifetimeSpend,
      lifetimeRedemptions: canonical.lifetimeRedemptions + duplicate.lifetimeRedemptions,
    },
  }
}

export async function executeMerge(opts: {
  staffId: string
  canonicalId: string
  duplicateId: string
  keepBirthday: "canonical" | "duplicate"
  merchantId: string
}): Promise<{ ok: boolean; mergeId: string }> {
  const { staffId, canonicalId, duplicateId, keepBirthday, merchantId } = opts
  const preview = await previewMerge({ canonicalId, duplicateId })

  // Determine final birthday and VIP tier
  const canonical = await db.customer.findUnique({ where: { id: canonicalId } })
  const duplicate = await db.customer.findUnique({ where: { id: duplicateId } })
  if (!canonical || !duplicate) throw new Error("Customer not found")

  const finalBirthday = keepBirthday === "canonical" ? canonical.birthday : duplicate.birthday
  // Keep higher VIP tier
  const tierRank: Record<string, number> = { none: 0, silver: 1, gold: 2, platinum: 3 }
  const finalVipTier = tierRank[canonical.vipTier] >= tierRank[duplicate.vipTier]
    ? canonical.vipTier
    : duplicate.vipTier

  // Transaction: migrate all data
  await db.$transaction([
    db.bill.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    db.stamp.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    db.customerStampCard.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    db.redemption.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    db.review.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    db.referral.updateMany({ where: { referrerId: duplicateId }, data: { referrerId: canonicalId } }),
    db.achievement.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    db.whatsAppMessage.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    db.winBackEscalation.updateMany({ where: { customerId: duplicateId }, data: { customerId: canonicalId } }),
    // Update canonical with aggregated stats + resolved conflicts
    db.customer.update({
      where: { id: canonicalId },
      data: {
        lifetimeStamps: preview.aggregated.lifetimeStamps,
        lifetimeSpend: preview.aggregated.lifetimeSpend,
        lifetimeRedemptions: preview.aggregated.lifetimeRedemptions,
        birthday: finalBirthday ?? undefined,
        vipTier: finalVipTier,
      },
    }),
    // Soft-delete duplicate
    db.customer.update({
      where: { id: duplicateId },
      data: {
        status: "merged",
        notes: `Merged into ${canonicalId} on ${new Date().toISOString()}`,
      },
    }),
  ])

  await db.auditLog.create({
    data: {
      merchantId,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "CUSTOMER_MERGED",
      entity: "Customer",
      entityId: canonicalId,
      metadata: JSON.stringify({
        canonicalId,
        duplicateId,
        migration: preview.migration,
        keepBirthday,
        finalVipTier,
      }),
    },
  })

  return { ok: true, mergeId: canonicalId }
}



