// @ts-nocheck
// CustomerPilot V5 — Stamp Engine
// Encapsulates the stamps-based loyalty logic (NOT points).
//
// Core rule: each confirmed Bill awards stamps based on the active StampCard
// rule (default: 1 stamp per bill; advanced: 1 stamp per $10 spent). When a
// CustomerStampCard reaches `stampsRequired`, the card is marked `completed`
// and the customer is WhatsApp-notified that a reward is ready.

import { db } from "@/lib/db"

export type StampAwardResult = {
  stampsAwarded: number
  cardId: string
  cardCompleted: boolean
  rewardReady: boolean
}

/**
 * Calculate how many stamps a bill should award, based on the card's rule.
 * Rule format:
 *   "1"               -> flat 1 stamp per bill
 *   "1 per $N"        -> floor(amount / N) stamps, capped at 5
 */
export function stampsForAmount(rule: string, amount: number): number {
  if (!rule) return 1
  if (rule === "1") return 1
  const perMatch = rule.match(/^1\s*per\s*\$(\d+(\.\d+)?)$/i)
  if (perMatch) {
    const threshold = parseFloat(perMatch[1])
    if (!threshold || threshold <= 0) return 1
    return Math.min(5, Math.floor(amount / threshold))
  }
  return 1
}

/**
 * Award stamps for a confirmed bill. Creates a Stamp row, attaches it to the
 * active CustomerStampCard (creating one if needed), and marks the card as
 * completed when the threshold is reached.
 */
export async function awardStampsForBill(opts: {
  merchantId: string
  customerId: string
  billId: string
  amount: number
}): Promise<StampAwardResult> {
  const { merchantId, customerId, billId } = opts

  // Find an active stamp-card template for this merchant
  const template = await db.stampCard.findFirst({
    where: { merchantId, active: true },
    orderBy: { createdAt: "asc" },
  })
  if (!template) {
    return { stampsAwarded: 0, cardId: "", cardCompleted: false, rewardReady: false }
  }

  const stamps = stampsForAmount(template.stampsPerBill, opts.amount)

  // Find or create the customer's active card for this template
  let card = await db.customerStampCard.findFirst({
    where: { customerId, stampCardId: template.id, completed: false, redeemed: false },
  })
  if (!card) {
    card = await db.customerStampCard.create({
      data: {
        customerId,
        stampCardId: template.id,
        merchantId,
        stampsCollected: 0,
      },
    })
  }

  // Create stamp rows
  const stampRows = []
  for (let i = 0; i < stamps; i++) {
    stampRows.push({
      customerId,
      stampCardId: template.id,
      customerStampCardId: card.id,
      billId,
      merchantId,
      source: "bill",
    })
  }
  await db.stamp.createMany({ data: stampRows })

  const newCount = card.stampsCollected + stamps
  const completed = newCount >= template.stampsRequired

  card = await db.customerStampCard.update({
    where: { id: card.id },
    data: {
      stampsCollected: Math.min(newCount, template.stampsRequired),
      completed,
    },
  })

  // Update customer lifetime stats
  await db.customer.update({
    where: { id: customerId },
    data: {
      lifetimeStamps: { increment: stamps },
      lifetimeSpend: { increment: opts.amount },
      lastActiveAt: new Date(),
    },
  })

  return {
    stampsAwarded: stamps,
    cardId: card.id,
    cardCompleted: completed,
    rewardReady: completed,
  }
}

/**
 * Spend stamps for a redemption. Currently we use completed-card logic:
 * each completed card == 1 redemption unit. We mark the card as `redeemed`
 * to prevent double-redemption.
 */
export async function spendStampsForRedemption(opts: {
  customerId: string
  rewardCost: number // number of completed cards required
}): Promise<{ ok: boolean; cardIds: string[]; reason?: string }> {
  const cards = await db.customerStampCard.findMany({
    where: {
      customerId: opts.customerId,
      completed: true,
      redeemed: false,
    },
    orderBy: { createdAt: "asc" },
    take: opts.rewardCost,
  })

  if (cards.length < opts.rewardCost) {
    return {
      ok: false,
      cardIds: [],
      reason: `Need ${opts.rewardCost} completed stamp card(s); customer only has ${cards.length}.`,
    }
  }

  const ids = cards.map((c) => c.id)
  await db.customerStampCard.updateMany({
    where: { id: { in: ids } },
    data: { redeemed: true },
  })

  return { ok: true, cardIds: ids }
}

/**
 * Recompute churn risk score (0-100) based on days-since-last-active and
 * lifetime engagement. Pure function so it can be tested without DB.
 */
export function computeChurnRisk(opts: {
  lastActiveAt: Date | null
  lifetimeStamps: number
  lifetimeSpend: number
  now?: Date
}): number {
  const now = opts.now ?? new Date()
  if (!opts.lastActiveAt) return 80 // never active = high risk

  const daysSince = Math.floor(
    (now.getTime() - opts.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  let score = 0
  if (daysSince > 90) score += 60
  else if (daysSince > 60) score += 40
  else if (daysSince > 30) score += 20
  else if (daysSince > 14) score += 10

  // engagement dampener
  if (opts.lifetimeStamps > 50) score = Math.max(0, score - 30)
  else if (opts.lifetimeStamps > 20) score = Math.max(0, score - 15)

  if (opts.lifetimeSpend > 5000) score = Math.max(0, score - 20)

  return Math.min(100, score)
}



