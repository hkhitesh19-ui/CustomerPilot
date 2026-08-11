import { db } from "@/lib/db"

export async function scheduleGoogleReviewRequest({
  merchantId,
  customerId,
}: {
  merchantId: string
  customerId: string
}) {
  try {
    // 1. Fetch merchant & customer
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    const customer = await db.customer.findUnique({ where: { id: customerId } })

    if (!merchant || !customer || !customer.whatsappOptIn || !customer.phone) {
      return { scheduled: false, reason: "Customer not eligible or opted out" }
    }

    // 2. Business Rule: Skip if customer already submitted a review
    const existingReview = await db.review.findFirst({
      where: { customerId: customer.id }
    })
    if (existingReview) {
      return { scheduled: false, reason: "Review already submitted" }
    }

    // 3. Deduplication: Skip if review_request was EVER sent to this customer
    const previousRequest = await db.whatsAppMessage.findFirst({
      where: {
        merchantId: merchant.id,
        toPhone: customer.phone,
        template: "review_request"
      }
    })
    if (previousRequest) {
      return { scheduled: false, reason: "Review request already sent previously" }
    }

    // 4. Calculate Delay based on merchant.googleReviewDelayMinutes configuration
    const delayMinutes = merchant.googleReviewDelayMinutes ?? 30
    const now = new Date()
    const scheduledFor = delayMinutes > 0
      ? new Date(now.getTime() + delayMinutes * 60 * 1000)
      : null
    const status = delayMinutes > 0 ? "scheduled" : "queued"

    const reviewMsg = `Hi ${customer.name} ❤️\n\nHope you loved your recent purchase from *${merchant.name}*!\n\nWould you like AI to prepare your Google Review? Reply *YES* to see the draft and unlock a 🎁 *Bonus Stamp* on your VIP Card!`

    const msg = await db.whatsAppMessage.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        toPhone: customer.phone,
        template: "review_request",
        body: reviewMsg,
        status,
        scheduledFor,
      }
    })

    // ✅ CRITICAL FIX: If message is sent immediately (queued/no delay),
    // set botState right away. If delayed (scheduled), cron will set it on dispatch.
    if (status === "queued" || !scheduledFor) {
      await db.customer.update({
        where: { id: customer.id },
        data: {
          botState: "AWAITING_REVIEW_CONSENT",
          botStateUpdatedAt: new Date()
        }
      }).catch(() => {})
    }

    return { scheduled: true, messageId: msg.id, status, scheduledFor, delayMinutes }
  } catch (error) {
    console.error("[scheduleGoogleReviewRequest Error]", error)
    return { scheduled: false, reason: String(error) }
  }
}
