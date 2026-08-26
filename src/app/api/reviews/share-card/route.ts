import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    
    if (!body || !body.reviewId) {
      return err("Missing reviewId", 400)
    }

    const { reviewId } = body

    // Try GoogleBusinessReview first
    const googleReview = await db.googleBusinessReview.findFirst({
      where: { id: reviewId, merchantId: merchant.id }
    })

    if (googleReview) {
      return ok({
        review: {
          rating: googleReview.rating,
          comment: googleReview.comment || "",
          authorName: googleReview.reviewerName,
          createdAt: googleReview.createdAt,
          merchantName: merchant.name
        }
      })
    }

    // Try internal Review
    const internalReview = await db.review.findFirst({
      where: { id: reviewId, merchantId: merchant.id },
      include: { customer: { select: { name: true } } }
    })

    if (internalReview) {
      return ok({
        review: {
          rating: internalReview.rating,
          comment: internalReview.finalText || "",
          authorName: internalReview.customer.name,
          createdAt: internalReview.createdAt,
          merchantName: merchant.name
        }
      })
    }

    return err("Review not found", 404)
  } catch (error) {
    console.error('[Review Share Card POST Error]', error)
    return err('Failed to fetch review for share card', 500)
  }
}
