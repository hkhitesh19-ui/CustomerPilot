import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { postReviewReplyToGBP } from "@/lib/google-reviews-service"
import { generateAIReviewReply } from "@/lib/ai-review-reply"
import { applyBulkAiRateLimit } from "@/lib/rate-limiter"

export async function POST(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) return NextResponse.json({ error: "Missing merchantId" }, { status: 400 })

    // Rate limit: max 5 bulk AI operations per merchant per minute
    const limited = await applyBulkAiRateLimit(merchantId)
    if (limited) return limited

    const { jobId } = await req.json()
    if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 })

    // 1. TIER CHECK (Race Condition Protection)
    const subscription = await db.subscription.findFirst({
      where: { merchantId, status: "active" },
      include: { plan: true }
    })
    
    const isPaidUser = subscription && subscription.plan && subscription.plan.price > 0
    if (!isPaidUser) {
      await db.backgroundJob.update({
        where: { id: jobId },
        data: { status: "failed", error: "Subscription expired mid-job." }
      })
      return NextResponse.json({ error: "Upgrade Required" }, { status: 403 })
    }

    // 2. CHECK JOB LOCK
    const job = await db.backgroundJob.findUnique({ where: { id: jobId } })
    if (!job || job.status !== "running") {
      return NextResponse.json({ error: "Job is not running." }, { status: 400 })
    }

    // 3. FETCH CONNECTION
    const conn = await db.merchantGoogleConnection.findUnique({
      where: { merchantId },
      include: { merchant: true }
    })

    if (!conn) {
      await db.backgroundJob.update({ where: { id: jobId }, data: { status: "failed", error: "Connection lost." } })
      return NextResponse.json({ error: "Google Business Profile not connected" }, { status: 400 })
    }

    // 4. GET A SMALL CHUNK ATOMICALLY (Idempotency)
    const CHUNK_SIZE = 5
    
    // Check if we hit the job's total items limit to avoid overspending
    if (job.processed >= job.totalItems) {
      const completedJob = await db.backgroundJob.update({
        where: { id: jobId },
        data: { status: "completed", completedAt: new Date() }
      })
      return NextResponse.json({ success: true, status: "completed", processed: completedJob.processed, totalItems: completedJob.totalItems })
    }

    // Atomically find 5 pending reviews and mark them as processing
    // Using a transaction ensures no two chunks grab the same rows.
    const unrepliedReviews = await db.$transaction(async (tx) => {
      const pending = await tx.googleBusinessReview.findMany({
        where: { merchantId, isReplied: false, status: "pending", comment: { not: null } },
        take: CHUNK_SIZE,
        select: { id: true, gbpReviewId: true, comment: true, rating: true }
      })
      
      if (pending.length === 0) return []

      const ids = pending.map(p => p.id)
      
      await tx.googleBusinessReview.updateMany({
        where: { id: { in: ids } },
        data: { status: "processing" }
      })
      
      return pending
    })

    if (unrepliedReviews.length === 0) {
      const completedJob = await db.backgroundJob.update({
        where: { id: jobId },
        data: { status: "completed", completedAt: new Date() }
      })
      return NextResponse.json({ success: true, status: "completed", processed: completedJob.processed, totalItems: completedJob.totalItems })
    }

    let processedInThisChunk = 0

    // 5. PROCESS CHUNK SEQUENTIALLY
    for (const review of unrepliedReviews) {
      try {
        const storeLocation = conn.merchant.city || conn.merchant.address || conn.address || "Vadodara"
        const storeCategory = conn.merchant.businessType || conn.merchant.category || "fresh cakes and bakery products"
        const replyText = await generateAIReviewReply({
          merchantName: conn.merchant.name || "Our Store",
          locationOrArea: storeLocation,
          category: storeCategory,
          customerReview: review.comment || `${review.rating || 5}-Star Rating and wonderful experience!`,
          rating: review.rating || 5
        })

        const success = await postReviewReplyToGBP(merchantId, review.gbpReviewId, replyText)

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
        } else {
          throw new Error("Failed to post to GBP")
        }
      } catch (err: any) {
        console.error(`[Chunk API] Failed to process review ${review.id}:`, err.message)
        await db.googleBusinessReview.update({
          where: { id: review.id },
          data: { status: "failed" } // Mark as failed so it's not picked up again in this job loop
        })
      } finally {
        // We always count it as processed whether it succeeded or failed, so the job progresses and doesn't get stuck infinitely
        processedInThisChunk++
      }
    }

    // 6. UPDATE JOB PROGRESS
    const updatedJob = await db.backgroundJob.update({
      where: { id: jobId },
      data: {
        processed: { increment: processedInThisChunk }
      }
    })

    return NextResponse.json({
      success: true,
      status: "running",
      processed: updatedJob.processed,
      totalItems: updatedJob.totalItems,
      chunkProcessed: processedInThisChunk
    })

  } catch (error: any) {
    console.error("[Bulk Reply Process API] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
