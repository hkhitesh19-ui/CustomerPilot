import { db } from "@/lib/db";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";

export const MIN_RATING = 1;
const BASE_REVIEW_STAMPS = 2;
const PHOTO_BONUS_STAMPS = 2;
const HOURLY_STAMP_CAP = 5;

export interface MatchableReview {
  gbpReviewId: string;
  reviewerName: string;
  rating: number;
  hasMedia?: boolean;
  createdAt: Date;
}

/**
 * Normalize a name: lowercase, strip emojis/punctuation, collapse whitespace,
 * and collapse repeated duplicate names (e.g. "Aditya Bihari Aditya Bihari" -> "aditya bihari").
 */
export function normalizeReviewerName(raw: string): string {
  const cleaned = (raw || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  const tokens = cleaned.split(" ");
  // Collapse exact half-repetition ("x y x y" -> "x y")
  if (tokens.length >= 2 && tokens.length % 2 === 0) {
    const half = tokens.length / 2;
    if (tokens.slice(0, half).join(" ") === tokens.slice(half).join(" ")) {
      return tokens.slice(0, half).join(" ");
    }
  }

  // Collapse consecutive duplicate tokens ("x x" -> "x")
  const deduped: string[] = [];
  for (const t of tokens) {
    if (deduped[deduped.length - 1] !== t) {
      deduped.push(t);
    }
  }
  return deduped.join(" ");
}

function levenshteinSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }

  return 1 - dp[n] / Math.max(m, n);
}

/**
 * Matches customer name against Google displayName.
 * Requires at least one full token match AND (token subset overlap OR Levenshtein >= 0.8).
 */
export function nameMatch(customerName: string, reviewerName: string): boolean {
  const normA = normalizeReviewerName(customerName);
  const normB = normalizeReviewerName(reviewerName);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const aTokens = normA.split(" ");
  const bTokens = normB.split(" ");

  const hasFullTokenMatch = aTokens.some(
    (t) => (t.length >= 2 || (aTokens.length === 1 && bTokens.length === 1)) && bTokens.includes(t)
  );
  if (!hasFullTokenMatch) return false;

  // Subset token overlap: every token of the shorter name appears in the longer name
  const shorter = aTokens.length <= bTokens.length ? aTokens : bTokens;
  const longer = aTokens.length <= bTokens.length ? bTokens : aTokens;
  const commonCount = shorter.filter((t) => longer.includes(t)).length;

  if (commonCount === shorter.length) return true;
  if (commonCount / shorter.length >= 0.8) return true;

  return levenshteinSimilarity(normA, normB) >= 0.8;
}

async function creditStampsInTx(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  params: {
    merchantId: string;
    customerId: string;
    stampsCount: number;
    source: string;
    reason: string;
    gbpReviewId: string;
  }
): Promise<{ awarded: number; newBalance: number; stampsRequired: number; isCompleted: boolean } | null> {
  const { merchantId, customerId, stampsCount, source, reason, gbpReviewId } = params;
  if (stampsCount <= 0) return null;

  // Respect per-period velocity cap
  const recentCount = await tx.stamp.count({
    where: {
      merchantId,
      customerId,
      source: { in: ["google_review_auto", "photo_bonus"] },
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
    }
  });
  if (recentCount + stampsCount > HOURLY_STAMP_CAP) {
    console.warn(`[ReviewMatcher] Hourly stamp cap reached for customer ${customerId}`);
    return null;
  }

  let template = await tx.stampCard.findFirst({
    where: { merchantId, active: true },
    orderBy: { createdAt: "asc" }
  });
  if (!template) {
    template = await tx.stampCard.findFirst({
      where: { merchantId },
      orderBy: { createdAt: "asc" }
    });
  }
  if (!template) return null;

  const stampsRequired = template.stampsRequired || 10;

  let card = await tx.customerStampCard.findFirst({
    where: { customerId, stampCardId: template.id, completed: false, redeemed: false },
    orderBy: { createdAt: "desc" }
  });
  if (!card) {
    card = await tx.customerStampCard.create({
      data: { customerId, stampCardId: template.id, merchantId, stampsCollected: 0 }
    });
  }

  const stampRows = Array.from({ length: stampsCount }, () => ({
    customerId,
    stampCardId: template.id,
    customerStampCardId: card.id,
    merchantId,
    source
  }));
  await tx.stamp.createMany({ data: stampRows });

  const totalNew = card.stampsCollected + stampsCount;
  const isCompleted = totalNew >= stampsRequired;
  let newBalance = totalNew;

  if (isCompleted) {
    await tx.customerStampCard.update({
      where: { id: card.id },
      data: { stampsCollected: stampsRequired, completed: true }
    });
    const overflow = totalNew - stampsRequired;
    if (overflow > 0) {
      await tx.customerStampCard.create({
        data: { customerId, stampCardId: template.id, merchantId, stampsCollected: overflow }
      });
      newBalance = overflow;
    } else {
      newBalance = stampsRequired;
    }
  } else {
    await tx.customerStampCard.update({
      where: { id: card.id },
      data: { stampsCollected: totalNew, completed: false }
    });
  }

  await tx.customer.update({
    where: { id: customerId },
    data: { lifetimeStamps: { increment: stampsCount }, lastActiveAt: new Date() }
  });

  await tx.auditLog.create({
    data: {
      merchantId,
      actorType: "SYSTEM",
      action: "AUTO_REVIEW_MATCH_STAMP",
      entity: "Stamp",
      metadata: JSON.stringify({
        customerId,
        gbpReviewId,
        source,
        stampsAwarded: stampsCount,
        reason,
        newBalance,
        isCompleted
      })
    }
  });

  return { awarded: stampsCount, newBalance, stampsRequired, isCompleted };
}

async function sendRewardWhatsApp(params: {
  merchantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  stampsAwarded: number;
  newBalance: number;
  stampsRequired: number;
  isCompleted: boolean;
  isLatePhoto?: boolean;
}) {
  try {
    if (!params.customerPhone || params.customerPhone.startsWith("guest_")) return;
    if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY) return;

    const merchant = await db.merchant.findUnique({ where: { id: params.merchantId } });
    if (!merchant) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in";
    const walletUrl = `${appUrl}/q/wallet/${params.customerId}`;
    const remaining = Math.max(0, params.stampsRequired - params.newBalance);

    const text = params.isLatePhoto
      ? `📸 *Photo Verified! +${params.stampsAwarded} Bonus Stamps!* ⭐\n\n` +
        `Thank you ${params.customerName || "VIP"} for sharing your photo at *${merchant.name}*!\n\n` +
        `📊 *Wallet:* ${params.newBalance} / ${params.stampsRequired} Stamps` +
        `${params.isCompleted ? " — 🏆 *REWARD UNLOCKED!*" : ` (${remaining} more needed)`}\n\n` +
        `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`
      : `🎉 *Thank you ${params.customerName || "VIP"}!* ⭐\n\n` +
        `Your feedback for *${merchant.name}* has been verified!\n\n` +
        `✅ *+${params.stampsAwarded} Loyalty Stamps Credited!*\n` +
        `📊 *Wallet:* ${params.newBalance} / ${params.stampsRequired} Stamps` +
        `${params.isCompleted ? " — 🏆 *REWARD UNLOCKED!*" : ` (${remaining} more needed)`}\n\n` +
        `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`;

    await sendCentralWhatsAppMessage({
      merchantId: params.merchantId,
      toPhone: params.customerPhone,
      text,
      template: params.isLatePhoto ? "review_photo_bonus_auto" : "review_bonus_auto",
      customerId: params.customerId
    });
  } catch (err: any) {
    console.error("[ReviewMatcher] WhatsApp notification failed (non-fatal):", err.message);
  }
}

async function awardMatchedClaim(
  claim: { id: string; merchantId: string; customerId: string; customer: { name: string; phone: string } },
  rv: MatchableReview
): Promise<boolean> {
  const totalToAward = BASE_REVIEW_STAMPS + (rv.hasMedia ? PHOTO_BONUS_STAMPS : 0);

  const txResult = await db.$transaction(async (tx) => {
    const upd = await tx.reviewClaim.updateMany({
      where: { id: claim.id, status: "open" },
      data: { status: "matched", matchedGbpReviewId: rv.gbpReviewId }
    });
    if (upd.count === 0) return null;

    const baseRes = await creditStampsInTx(tx, {
      merchantId: claim.merchantId,
      customerId: claim.customerId,
      stampsCount: BASE_REVIEW_STAMPS,
      source: "google_review_auto",
      reason: "auto_matched_google_review",
      gbpReviewId: rv.gbpReviewId
    });
    if (!baseRes) {
      throw new Error("CAP_OR_TEMPLATE_BLOCKED");
    }

    let finalRes = baseRes;
    if (rv.hasMedia) {
      const photoRes = await creditStampsInTx(tx, {
        merchantId: claim.merchantId,
        customerId: claim.customerId,
        stampsCount: PHOTO_BONUS_STAMPS,
        source: "photo_bonus",
        reason: "auto_matched_google_review_photo",
        gbpReviewId: rv.gbpReviewId
      });
      if (photoRes) {
        finalRes = photoRes;
      }
    }

    const awarded = rv.hasMedia && finalRes !== baseRes ? totalToAward : BASE_REVIEW_STAMPS;
    await tx.reviewClaim.update({
      where: { id: claim.id },
      data: { stampsAwarded: awarded }
    });

    return {
      awarded,
      newBalance: finalRes.newBalance,
      stampsRequired: finalRes.stampsRequired,
      isCompleted: finalRes.isCompleted
    };
  }).catch((err) => {
    if (err?.message === "CAP_OR_TEMPLATE_BLOCKED") return null;
    if (err?.code === "P2002") return null; // Unique constraint on matchedGbpReviewId
    throw err;
  });

  if (!txResult) return false;

  await sendRewardWhatsApp({
    merchantId: claim.merchantId,
    customerId: claim.customerId,
    customerName: claim.customer.name,
    customerPhone: claim.customer.phone,
    stampsAwarded: txResult.awarded,
    newBalance: txResult.newBalance,
    stampsRequired: txResult.stampsRequired,
    isCompleted: txResult.isCompleted
  });

  return true;
}

/**
 * Matches newly synced Google reviews against open ReviewClaim intents.
 * Never throws: errors are caught and logged so cron & auto-reply are never disrupted.
 */
export async function matchReviewsToClaims(
  merchantId: string,
  newReviews: MatchableReview[]
): Promise<{ matched: number; manual: number }> {
  let matched = 0;
  let manual = 0;

  try {
    for (const rv of newReviews) {
      if (rv.rating < MIN_RATING) continue;

      const candidates = await db.reviewClaim.findMany({
        where: {
          merchantId,
          status: "open",
          clickedAt: { lte: rv.createdAt },
          expiresAt: { gte: rv.createdAt }
        },
        include: { customer: true }
      });

      const hits = candidates.filter((c) => nameMatch(c.customer.name, rv.reviewerName));

      if (hits.length === 1) {
        const ok = await awardMatchedClaim(hits[0], rv);
        if (ok) matched++;
      } else if (hits.length > 1) {
        await db.reviewClaim.updateMany({
          where: { id: { in: hits.map((h) => h.id) }, status: "open" },
          data: { status: "manual" }
        });
        console.warn(
          `[ReviewMatcher] Ambiguous match (${hits.length} candidates) for "${rv.reviewerName}" (${rv.gbpReviewId}) -> marked manual`
        );
        manual += hits.length;
      }
    }
  } catch (err: any) {
    console.error(`[ReviewMatcher] Error matching reviews for merchant ${merchantId}:`, err.message);
  }

  return { matched, manual };
}

/**
 * Awards +2 late photo bonus if a matched claim (stampsAwarded=2) now has hasMedia=true
 * within its claim expiry window.
 */
export async function processLatePhotoBonuses(merchantId: string): Promise<number> {
  let photoAwardedCount = 0;
  try {
    const matchedClaims = await db.reviewClaim.findMany({
      where: {
        merchantId,
        status: "matched",
        stampsAwarded: BASE_REVIEW_STAMPS,
        expiresAt: { gte: new Date() },
        matchedGbpReviewId: { not: null }
      },
      include: { customer: true }
    });

    for (const claim of matchedClaims) {
      if (!claim.matchedGbpReviewId) continue;

      const gbpReview = await db.googleBusinessReview.findUnique({
        where: {
          merchantId_gbpReviewId: {
            merchantId,
            gbpReviewId: claim.matchedGbpReviewId
          }
        }
      });

      if (!gbpReview?.hasMedia) continue;

      const txResult = await db.$transaction(async (tx) => {
        const upd = await tx.reviewClaim.updateMany({
          where: { id: claim.id, status: "matched", stampsAwarded: BASE_REVIEW_STAMPS },
          data: { stampsAwarded: BASE_REVIEW_STAMPS + PHOTO_BONUS_STAMPS }
        });
        if (upd.count === 0) return null;

        const photoRes = await creditStampsInTx(tx, {
          merchantId: claim.merchantId,
          customerId: claim.customerId,
          stampsCount: PHOTO_BONUS_STAMPS,
          source: "photo_bonus",
          reason: "auto_matched_late_photo_bonus",
          gbpReviewId: claim.matchedGbpReviewId!
        });
        if (!photoRes) {
          throw new Error("CAP_OR_TEMPLATE_BLOCKED");
        }
        return photoRes;
      }).catch((err) => {
        if (err?.message === "CAP_OR_TEMPLATE_BLOCKED") return null;
        throw err;
      });

      if (txResult) {
        photoAwardedCount++;
        await sendRewardWhatsApp({
          merchantId: claim.merchantId,
          customerId: claim.customerId,
          customerName: claim.customer.name,
          customerPhone: claim.customer.phone,
          stampsAwarded: txResult.awarded,
          newBalance: txResult.newBalance,
          stampsRequired: txResult.stampsRequired,
          isCompleted: txResult.isCompleted,
          isLatePhoto: true
        });
      }
    }
  } catch (err: any) {
    console.error(`[ReviewMatcher] Error processing late photo bonuses for ${merchantId}:`, err.message);
  }
  return photoAwardedCount;
}
