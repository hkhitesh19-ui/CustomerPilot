import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { fetchGoogleReviews, syncGoogleReviewsToDb, postReviewReplyToGBP } from "@/lib/google-reviews-service"
import { generateAIReviewReply, getCleanMerchantName } from "@/lib/ai-review-reply"
import { processPendingReviewPhotoVerifications } from "@/lib/review-photo-verifier"

// Vercel cron configuration (runs every 5 minutes in production)
export const maxDuration = 300 // 5 minutes limit

export async function GET(req: Request) {
  try {
    // Basic auth check for cron if needed, omitted here for local demo testing

    console.log("[CRON] Starting Real-time Google Reviews Polling...")

    // 1. Fetch all active merchants who have Google Business Profiles connected (case-insensitive syncStatus)
    const connections = await db.merchantGoogleConnection.findMany({
      where: { 
        syncStatus: { in: ["active", "ACTIVE"] },
        merchant: {
          OR: [
            { trialEndsAt: null },
            { trialEndsAt: { gt: new Date() } }
          ]
        }
      },
      include: { merchant: true }
    })

    console.log(`[CRON] Found ${connections.length} active GBP connections.`)

    let totalRepliesSent = 0

    // 2. Loop through each merchant
    for (const conn of connections) {
      try {
        // Fetch latest reviews (mock or real depending on implementation in service)
        const latestReviews = await fetchGoogleReviews(conn.merchantId, 10)
        
        // Sync them to DB (only inserts new ones)
        const newCount = await syncGoogleReviewsToDb(conn.merchantId, latestReviews)
        console.log(`[CRON] Fetched ${newCount} NEW reviews for Merchant ${conn.merchantId}`)

        // 3. Find unreplied reviews in our DB that need an auto-reply (Strictly exclude already replied reviews)
        const unrepliedReviews = await db.googleBusinessReview.findMany({
          where: {
            merchantId: conn.merchantId,
            isReplied: false,
            status: "pending",
            reviewReply: null,
            AND: [
              { comment: { not: null } },
              { comment: { not: "" } }
            ] // Only reply if they left a non-empty text comment
          },
          take: 5 // Process in small batches
        })

        if (unrepliedReviews.length === 0) continue

        // 4. Generate & Post Replies
        for (const review of unrepliedReviews) {
          // Strict race-condition and whitespace-only guard
          if (review.isReplied || review.reviewReply || !review.comment || review.comment.trim().length === 0) continue

          console.log(`[CRON] Generating SEO Auto-Reply for review ${review.gbpReviewId} (${review.rating}⭐)...`)
          
          const cleanName = getCleanMerchantName(conn.merchant.name)
          const storeLocation = conn.merchant.city || conn.merchant.address || conn.address || "Vadodara"
          const storeCategory = conn.merchant.businessType || conn.merchant.category || "fresh cakes and bakery products"

          const replyText = await generateAIReviewReply({
            merchantName: cleanName,
            locationOrArea: storeLocation,
            category: storeCategory,
            customerReview: review.comment || `${review.rating}-Star Rating and wonderful experience!`,
            rating: review.rating ?? 5,
            reviewerName: review.reviewerName
          })

          const success = await postReviewReplyToGBP(conn.merchantId, review.gbpReviewId, replyText)

          if (success) {
            await db.googleBusinessReview.update({
              where: { id: review.id },
              data: {
                isReplied: true,
                reviewReply: replyText,
                repliedAt: new Date(),
                status: "replied"
              }
            })
            totalRepliesSent++
            console.log(`[CRON] ✅ Successfully published SEO Auto-Reply for review ${review.gbpReviewId}`)
          }
        }
      } catch (err: any) {
        console.error(`[CRON] Error processing merchant ${conn.merchantId}:`, err.message)
      }
    }

    // 5. Process any pending review photo verifications
    const verifiedPhotosCount = await processPendingReviewPhotoVerifications()
    console.log(`[CRON] Processed ${verifiedPhotosCount} pending review photo verifications.`)

    return NextResponse.json({
      success: true,
      message: "Real-time Google Reviews Polling completed.",
      repliesSent: totalRepliesSent,
      verifiedPhotosCount
    })

  } catch (error: any) {
    console.error("[CRON] Global Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
