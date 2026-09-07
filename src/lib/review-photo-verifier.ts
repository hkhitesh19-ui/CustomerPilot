import { db } from "@/lib/db"
import { getValidOAuthAccessToken } from "@/lib/google-reviews-service"
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service"
import { hasModule } from "@/lib/feature-gate"

/**
 * Clean string for fuzzy comparison (remove punctuation, lower-case, normalize whitespace)
 */
function normalizeName(str: string): string {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Calculate Jaro-Winkler similarity metric (0.0 to 1.0)
 */
function jaroWinkler(s1: string, s2: string): number {
  const a = normalizeName(s1)
  const b = normalizeName(s2)

  if (!a || !b) return 0.0
  if (a === b) return 1.0

  // Token subset match: if one name is fully contained as a word in the other
  const aTokens = a.split(" ")
  const bTokens = b.split(" ")
  const commonToken = aTokens.some(t => t.length > 2 && bTokens.includes(t))
  if (commonToken) {
    return 0.92 // Strong match if first name or last name matches exactly
  }

  const matchWindow = Math.floor(Math.max(a.length, b.length) / 2) - 1
  const aMatches = new Array(a.length).fill(false)
  const bMatches = new Array(b.length).fill(false)

  let matches = 0
  let transpositions = 0

  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, b.length)

    for (let j = start; j < end; j++) {
      if (bMatches[j]) continue
      if (a[i] !== b[j]) continue
      aMatches[i] = true
      bMatches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0.0

  let k = 0
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue
    while (!bMatches[k]) k++
    if (a[i] !== b[k]) transpositions++
    k++
  }

  const jaro = (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3

  // Winkler prefix scaling
  let prefix = 0
  for (let i = 0; i < Math.min(4, Math.min(a.length, b.length)); i++) {
    if (a[i] === b[i]) prefix++
    else break
  }

  return jaro + prefix * 0.1 * (1 - jaro)
}

export interface PhotoVerificationResult {
  verified: boolean
  stage: "GBP_DIRECT" | "GBP_CUSTOMER_MEDIA" | "FAILSAFE" | "RETROACTIVE"
  photoUri?: string
  confidence?: number
  isAmbiguous?: boolean
  reason: string
}

/**
 * Verifies whether a genuine customer photo was posted for a Google location
 */
export async function verifyCustomerGooglePhoto(
  merchantId: string,
  reviewerName: string,
  reviewSubmissionTime: Date
): Promise<PhotoVerificationResult> {
  const { connection, token } = await getValidOAuthAccessToken(merchantId)

  if (!connection || !token || token.startsWith("mock_")) {
    // Sandbox / Demo mode verification: Check if customer uploaded photo in ReviewEditor
    const localReview = await db.review.findFirst({
      where: {
        merchantId,
        createdAt: { gte: new Date(reviewSubmissionTime.getTime() - 30 * 60 * 1000) }
      },
      orderBy: { createdAt: "desc" }
    })

    if (localReview?.photoUrl) {
      return {
        verified: true,
        stage: "GBP_CUSTOMER_MEDIA",
        photoUri: localReview.photoUrl,
        confidence: 0.95,
        reason: "verified_via_session_photo"
      }
    }

    return {
      verified: false,
      stage: "FAILSAFE",
      reason: "no_photo_detected_sandbox"
    }
  }

  // Live GBP API Check: Try customer media endpoint
  try {
    const accountId = connection.gbpAccountId
    const locationId = connection.gbpLocationId

    if (accountId && locationId) {
      const mediaUrl = `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/media/customers?pageSize=50`
      const res = await fetch(mediaUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (res.ok) {
        const data = await res.json()
        const mediaItems = data.mediaItems || []

        const reviewTimeMs = reviewSubmissionTime.getTime()
        // Window: Photo uploaded between 15 mins before review and 24 hours after review
        const minTime = reviewTimeMs - 15 * 60 * 1000
        const maxTime = reviewTimeMs + 24 * 60 * 60 * 1000

        for (const item of mediaItems) {
          const createTimeMs = item.createTime ? new Date(item.createTime).getTime() : 0
          if (createTimeMs < minTime || createTimeMs > maxTime) continue

          const authorName = item.attribution?.profileName || item.attribution?.displayName || null
          const photoUrl = item.googleUrl || item.thumbnailUrl || null

          if (!authorName) {
            // Anonymous Google attribution within tight 15-min window -> Trust-based confirmation
            if (Math.abs(createTimeMs - reviewTimeMs) <= 15 * 60 * 1000) {
              return {
                verified: true,
                stage: "GBP_CUSTOMER_MEDIA",
                photoUri: photoUrl,
                confidence: 0.85,
                reason: "anonymous_author_within_15min_window"
              }
            }
            continue
          }

          const confidence = jaroWinkler(authorName, reviewerName)

          if (confidence >= 0.80) {
            return {
              verified: true,
              stage: "GBP_CUSTOMER_MEDIA",
              photoUri: photoUrl,
              confidence,
              reason: `author_match_high_confidence_${confidence.toFixed(2)}`
            }
          }

          if (confidence >= 0.50) {
            return {
              verified: false,
              stage: "GBP_CUSTOMER_MEDIA",
              photoUri: photoUrl,
              confidence,
              isAmbiguous: true,
              reason: `author_ambiguous_${confidence.toFixed(2)}`
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error(`[ReviewPhotoVerifier] Error querying GBP customer media:`, err.message)
  }

  return {
    verified: false,
    stage: "FAILSAFE",
    reason: "no_matching_photo_found"
  }
}

/**
 * Atomically awards the +2 Photo Bonus stamps once photo is verified
 */
export async function awardVerifiedPhotoBonus(params: {
  logId: string
  merchantId: string
  customerId: string
  stage: string
  confidence?: number
  photoUri?: string
  reason: string
}) {
  const { logId, merchantId, customerId, stage, confidence, photoUri, reason } = params

  const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
  const customer = await db.customer.findUnique({ where: { id: customerId } })

  if (!merchant || !customer) return { ok: false, error: "Merchant or customer not found" }
  if (!hasModule(merchant, "LOYALTY")) return { ok: false, error: "Loyalty module not active" }

  // Check log status (Idempotency)
  const log = await db.reviewBonusLog.findUnique({ where: { id: logId } })
  if (!log || log.decision === "4_STAMPS") {
    return { ok: true, message: "Already finalized" }
  }

  // Anti-Abuse: Velocity check (< 5 review bonus allocations in past 1 hour)
  const recentBonusCount = await db.stamp.count({
    where: {
      merchantId,
      customerId,
      source: "photo_bonus",
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
    }
  })
  if (recentBonusCount >= 5) {
    console.warn(`[ReviewPhotoVerifier] Velocity limit hit for customer ${customerId}`)
    return { ok: false, error: "Velocity limit exceeded" }
  }

  const template = await db.stampCard.findFirst({ where: { merchantId, active: true } })
  const photoBonusToAward = template?.photoBonus ?? 2

  let finalStamps = 0
  let cardCompleted = false

  await db.$transaction(async (tx) => {
    let card = await tx.customerStampCard.findFirst({
      where: { customerId, stampCardId: template?.id, completed: false, redeemed: false },
      orderBy: { createdAt: "desc" }
    })

    if (!card && template) {
      card = await tx.customerStampCard.create({
        data: { customerId, stampCardId: template.id, merchantId, stampsCollected: 0 }
      })
    }

    if (card && template) {
      for (let i = 0; i < photoBonusToAward; i++) {
        await tx.stamp.create({
          data: {
            customerId,
            stampCardId: template.id,
            customerStampCardId: card.id,
            merchantId,
            source: "photo_bonus"
          }
        })
      }

      const stampsRequired = template.stampsRequired || 10
      const totalNewCount = card.stampsCollected + photoBonusToAward

      if (totalNewCount >= stampsRequired) {
        cardCompleted = true
        await tx.customerStampCard.update({
          where: { id: card.id },
          data: { stampsCollected: stampsRequired, completed: true }
        })
        finalStamps = stampsRequired

        const overflow = totalNewCount - stampsRequired
        if (overflow > 0) {
          await tx.customerStampCard.create({
            data: { customerId, stampCardId: template.id, merchantId, stampsCollected: overflow }
          })
          finalStamps = overflow
        }
      } else {
        await tx.customerStampCard.update({
          where: { id: card.id },
          data: { stampsCollected: totalNewCount, completed: false }
        })
        finalStamps = totalNewCount
      }

      await tx.customer.update({
        where: { id: customerId },
        data: { lifetimeStamps: { increment: photoBonusToAward } }
      })
    }

    // Mark log as 4_STAMPS awarded
    await tx.reviewBonusLog.update({
      where: { id: logId },
      data: {
        stage,
        photoUri,
        matchConfidence: confidence ?? null,
        decision: "4_STAMPS",
        reason,
        recheckScheduled: false,
        finalizedAt: new Date()
      }
    })

    // Sync review record photoBonusStamps
    const existingReview = await tx.review.findFirst({
      where: { merchantId, customerId },
      orderBy: { createdAt: "desc" }
    })
    if (existingReview) {
      await tx.review.update({
        where: { id: existingReview.id },
        data: {
          photoBonusStamps: photoBonusToAward,
          bonusStampsAwarded: existingReview.bonusStampsAwarded + photoBonusToAward,
          photoUrl: photoUri || existingReview.photoUrl
        }
      })
    }
  })

  // Dispatch celebratory WhatsApp confirmation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const walletUrl = `${appUrl}/q/wallet/${customerId}`
  const stampsRequired = template?.stampsRequired || 10
  const remaining = Math.max(0, stampsRequired - finalStamps)

  const msg = `🎉 *Awesome News ${customer.name || "VIP"}!* 📸\n\n` +
    `Your product photo on Google Maps has been verified! ✅\n\n` +
    `🎁 *+${photoBonusToAward} Extra Photo Bonus Stamps Credited!* (Total: 4 Bonus Stamps)\n` +
    `📊 *Wallet:* ${finalStamps} / ${stampsRequired} Stamps\n` +
    `🎁 *Goal:* ${template?.rewardName || "FREE Reward"}${cardCompleted ? " — 🏆 *REWARD UNLOCKED!*" : ` (${remaining} more needed)`}\n\n` +
    `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`

  await sendCentralWhatsAppMessage({
    merchantId,
    toPhone: customer.phone,
    text: msg,
    template: "review_photo_bonus_verified",
    customerId
  }).catch((err) => {
    console.error("[ReviewPhotoVerifier] Failed to send WhatsApp notification:", err.message)
  })

  return { ok: true, finalStamps }
}

/**
 * Queue worker: Scans and processes pending review photo verifications
 */
export async function processPendingReviewPhotoVerifications() {
  const pendingLogs = await db.reviewBonusLog.findMany({
    where: {
      decision: "PENDING",
      recheckAt: { lte: new Date() }
    },
    take: 20
  })

  if (pendingLogs.length === 0) return 0

  let processedCount = 0

  for (const log of pendingLogs) {
    try {
      const result = await verifyCustomerGooglePhoto(
        log.merchantId,
        log.reviewerName,
        log.createdAt
      )

      if (result.verified) {
        // Photo verified -> Award +2 stamps (Total 4)
        await awardVerifiedPhotoBonus({
          logId: log.id,
          merchantId: log.merchantId,
          customerId: log.customerId,
          stage: result.stage,
          confidence: result.confidence,
          photoUri: result.photoUri,
          reason: result.reason
        })
        processedCount++
      } else {
        // No photo detected at T+20m -> Finalize immediately at 2 stamps (No 24h waiting)
        await db.reviewBonusLog.update({
          where: { id: log.id },
          data: {
            stage: result.stage || "FAILSAFE",
            matchConfidence: result.confidence ?? null,
            decision: "2_STAMPS",
            reason: result.reason || "no_photo_detected_at_20m",
            recheckScheduled: false,
            finalizedAt: new Date()
          }
        })
      }
    } catch (e: any) {
      console.error(`[ReviewPhotoVerifier] Error processing log ${log.id}:`, e.message)
    }
  }

  return processedCount
}
