import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { fetchGoogleReviews, syncGoogleReviewsToDb } from "@/lib/google-reviews-service"

export async function POST(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) return NextResponse.json({ error: "Missing merchantId" }, { status: 400 })

    // 1. TIER CHECK: Verify active Paid Subscription
    const subscription = await db.subscription.findFirst({
      where: { merchantId, status: "active" },
      include: { plan: true }
    })

    const isPaidUser = subscription && subscription.plan && subscription.plan.price > 0
    if (!isPaidUser) {
      return NextResponse.json({ 
        error: "Upgrade Required", 
        code: "TRIAL_USER_RESTRICTION" 
      }, { status: 403 })
    }

    // 2. CHECK EXISTING LOCK: Prevent duplicate runs (with stale job cleanup)
    const existingJob = await db.backgroundJob.findFirst({
      where: {
        merchantId,
        type: "BULK_REVIEW_REPLY",
        status: "running"
      }
    })

    if (existingJob) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (existingJob.updatedAt < fiveMinutesAgo) {
        // Stale job cleanup: override it
        await db.backgroundJob.update({
          where: { id: existingJob.id },
          data: { status: "failed", error: "Job timed out and was overridden." }
        })
      } else {
        return NextResponse.json({
          success: true,
          jobId: existingJob.id,
          message: "Job already running, resuming...",
          totalItems: existingJob.totalItems,
          processed: existingJob.processed
        })
      }
    }

    // 3. SCAN & SYNC REVIEWS
    // We fetch a larger chunk to queue up. E.g. up to 100 historical reviews.
    const latestReviews = await fetchGoogleReviews(merchantId, 100)
    await syncGoogleReviewsToDb(merchantId, latestReviews)

    // 4. PRE-COUNT UNREPLIED REVIEWS
    const unrepliedCount = await db.googleBusinessReview.count({
      where: {
        merchantId,
        isReplied: false,
        comment: { not: null }
      }
    })

    if (unrepliedCount === 0) {
      return NextResponse.json({
        success: true,
        message: "No unreplied reviews found. Everything is up to date!",
        totalItems: 0,
        processed: 0
      })
    }

    // Cost Cap / Limit constraint
    const CAP_LIMIT = 200
    const finalCountToProcess = Math.min(unrepliedCount, CAP_LIMIT)

    // 5. CREATE JOB LOCK
    const job = await db.backgroundJob.create({
      data: {
        merchantId,
        type: "BULK_REVIEW_REPLY",
        status: "running",
        totalItems: finalCountToProcess,
        processed: 0,
        startedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      totalItems: job.totalItems,
      processed: job.processed,
      message: `Started bulk job for ${job.totalItems} reviews.`
    })

  } catch (error: any) {
    console.error("[Bulk Reply Start API] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
