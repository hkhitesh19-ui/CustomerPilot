// POST /api/reviews/draft — generate an AI draft for a customer review.
// Body: { staffId, customerId, rating, requestSource? }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { generateReviewDraft, calculateReviewBonus } from "@/lib/review-engine"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, customerId, rating, requestSource } = body as {
    staffId?: string; customerId?: string; rating?: number; requestSource?: string
  }
  if (!staffId || !customerId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return err("staffId, customerId, rating (1-5) required")
  }

  const customer = await db.customer.findUnique({ where: { id: customerId } })
  if (!customer || customer.merchantId !== merchant.id) return err("Customer not found", 404)

  // Find the customer's most recent redemption for context
  const lastRedemption = await db.redemption.findFirst({
    where: { customerId, status: "completed" },
    orderBy: { createdAt: "desc" },
  })
  const reward = lastRedemption ? await db.reward.findUnique({ where: { id: lastRedemption.rewardId } }) : null
  const rewardName = reward?.name ?? "your reward"

  const draft = generateReviewDraft({
    customerName: customer.name,
    merchantName: merchant.name,
    rewardName,
    rating,
  })

  // Create or update Review row
  const review = await db.review.create({
    data: {
      merchantId: merchant.id,
      customerId: customer.id,
      rating,
      aiDraft: draft,
      status: "draft_ready",
      requestSource: requestSource ?? "manual",
    },
  })

  // Queue WhatsApp with draft to customer
  if (customer.whatsappOptIn && customer.phone) {
    await db.whatsAppMessage.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        toPhone: customer.phone,
        template: "review_request",
        body: `Hi ${customer.name}! Thanks for visiting ${merchant.name}. Would you like to leave a review? Here's a draft you can edit and submit:\n\n"${draft}"\n\nReply with your edited version or "Submit as is" to earn bonus stamps!`,
        status: "queued",
      },
    })
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "REVIEW_DRAFT_GENERATED",
      entity: "Review",
      entityId: review.id,
      metadata: JSON.stringify({ customer: customer.name, rating }),
    },
  })

  return ok({ review, draft })
}
