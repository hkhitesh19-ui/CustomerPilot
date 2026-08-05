// CustomerPilot V6 — Google Review Engine
// Restored as a core pillar. Generates AI-drafted review text after a redemption
// or post-bill, customer edits/submits, earns bonus stamps. Photo bonus on top.
//
// Three bonus tiers:
//   - Text review submitted: +1 stamp
//   - 5-star rating: +1 additional stamp
//   - Photo attached: +2 additional stamps
// Max bonus per review: 4 stamps

export const REVIEW_BONUS_BASE = 1 // for submitting any review
export const REVIEW_BONUS_5_STAR = 1 // additional for 5-star rating
export const REVIEW_BONUS_PHOTO = 2 // additional for photo attachment

export function calculateReviewBonus(opts: { rating: number; hasPhoto: boolean }): number {
  let bonus = REVIEW_BONUS_BASE
  if (opts.rating === 5) bonus += REVIEW_BONUS_5_STAR
  if (opts.hasPhoto) bonus += REVIEW_BONUS_PHOTO
  return bonus
}

/**
 * Generate an AI draft for the customer based on their recent redemption
 * and merchant context. In production this would call an LLM; here we use
 * a templated generator so the demo is deterministic and offline.
 */
export function generateReviewDraft(opts: {
  customerName: string
  merchantName: string
  rewardName: string
  rating: number
}): string {
  const { customerName, merchantName, rewardName, rating } = opts
  const firstName = customerName.split(" ")[0]

  if (rating >= 4) {
    return `Absolutely loved my recent visit to ${merchantName}! I redeemed my stamps for a ${rewardName.toLowerCase()} and it was perfect. The staff was warm and remembered my usual order. Their stamp loyalty program makes every visit feel rewarding — I'm already working on my next card. Highly recommend ${merchantName} for anyone who appreciates great service and consistency. Can't wait to come back! ⭐⭐⭐⭐⭐`
  }

  if (rating === 3) {
    return `Visited ${merchantName} recently and redeemed a ${rewardName.toLowerCase()} through their stamp program. The loyalty system is straightforward and the reward was decent. Service was okay — could be a touch faster during rush hours. Overall a solid experience, will probably return.`
  }

  return `Had a mixed experience at ${merchantName}. The stamp program is easy to use, but I had some issues with my recent redemption of ${rewardName.toLowerCase()}. I've shared feedback with the manager — hoping they look into it. The product itself was fine.`
}

/**
 * Reputation impact model — translates review activity into a rough "reputation
 * score" the merchant can track. Used by the dashboard reputation widget.
 *
 * Score range: 0-100. Starts at 50 (neutral).
 *   +5 per 5-star review
 *   +2 per 4-star
 *   -3 per 3-star
 *   -8 per 2-star
 *   -15 per 1-star
 *   +2 per review with photo (trust signal)
 *   -2 per stale review >90 days old
 */
export function computeReputationScore(opts: {
  reviews: { rating: number; hasPhoto: boolean; submittedAt: string; status: string }[]
  now?: Date
}): { score: number; rating: number; totalReviews: number; recent30: number } {
  const now = opts.now ?? new Date()
  let score = 50
  let totalRating = 0
  let submitted = 0
  let recent30 = 0

  for (const r of opts.reviews) {
    if (r.status !== "submitted") continue
    submitted++
    totalRating += r.rating

    const ageDays = Math.floor((now.getTime() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
    if (ageDays <= 30) recent30++
    if (ageDays > 90) score -= 2

    if (r.rating === 5) score += 5
    else if (r.rating === 4) score += 2
    else if (r.rating === 3) score -= 3
    else if (r.rating === 2) score -= 8
    else if (r.rating === 1) score -= 15

    if (r.hasPhoto) score += 2
  }

  score = Math.max(0, Math.min(100, score))
  const avgRating = submitted ? totalRating / submitted : 0
  return { score, rating: avgRating, totalReviews: submitted, recent30 }
}
