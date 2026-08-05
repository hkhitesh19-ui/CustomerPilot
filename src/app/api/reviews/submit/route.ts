// POST /api/reviews/submit — customer submits (or declines) a review draft.
// Awards bonus stamps based on rating + photo presence.
// Body: { staffId, reviewId, finalText, hasPhoto }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { calculateReviewBonus } from "@/lib/review-engine"
import { awardStampsForBill } from "@/lib/stamp-engine"
import { CommunicationService } from "@/communication/services/CommunicationService"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, reviewId, finalText, hasPhoto } = body as {
    staffId?: string; reviewId?: string; finalText?: string; hasPhoto?: boolean
  }
  if (!staffId || !reviewId) return err("staffId and reviewId required")

  const review = await db.review.findUnique({ where: { id: reviewId } })
  if (!review || review.merchantId !== merchant.id) return err("Review not found", 404)
  if (review.status === "submitted") return err("Already submitted")

  const bonus = calculateReviewBonus({ rating: review.rating, hasPhoto: !!hasPhoto })

  const updated = await db.review.update({
    where: { id: reviewId },
    data: {
      finalText: finalText ?? review.aiDraft,
      photoUrl: hasPhoto ? "https://example.com/photo.jpg" : null,
      status: "submitted",
      submittedAt: new Date(),
      bonusStampsAwarded: bonus,
      photoBonusStamps: hasPhoto ? 2 : 0,
    },
  })

  // Award bonus stamps to customer
  const customer = await db.customer.findUnique({ where: { id: review.customerId } })
  if (customer) {
    const template = await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } })
    if (template) {
      let card = await db.customerStampCard.findFirst({
        where: { customerId: customer.id, stampCardId: template.id, completed: false, redeemed: false },
      })
      if (!card) {
        card = await db.customerStampCard.create({
          data: { customerId: customer.id, stampCardId: template.id, merchantId: merchant.id, stampsCollected: 0 },
        })
      }
      for (let i = 0; i < bonus; i++) {
        await db.stamp.create({
          data: { customerId: customer.id, stampCardId: template.id, customerStampCardId: card.id, merchantId: merchant.id, source: "review_bonus" },
        })
      }
      const newCount = Math.min(card.stampsCollected + bonus, template.stampsRequired)
      await db.customerStampCard.update({
        where: { id: card.id },
        data: { stampsCollected: newCount, completed: newCount >= template.stampsRequired },
      })
      await db.customer.update({
        where: { id: customer.id },
        data: { lifetimeStamps: { increment: bonus } },
      })
    }

    // WhatsApp thank-you via CommunicationService
    if (customer.whatsappOptIn && customer.phone) {
      await CommunicationService.dispatch({
        to: customer.phone,
        templateName: "review_thank_you",
        variables: { name: customer.name, bonus: String(bonus) },
        metadata: { merchantId: merchant.id, customerId: customer.id }
      }).catch(e => console.error("[ReviewSubmit] Dispatch Error:", e))
    }
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "REVIEW_SUBMITTED",
      entity: "Review",
      entityId: review.id,
      metadata: JSON.stringify({ rating: review.rating, bonus, hasPhoto: !!hasPhoto }),
    },
  })

  return ok({ review: updated, bonusStamps: bonus })
}
