import { db } from "@/lib/db"

export interface MerchantHealthMetrics {
  merchantId: string
  merchantName: string
  score: number // 0 to 100
  status: "EXCELLENT" | "GOOD" | "ATTENTION" | "CRITICAL"
  whatsAppSuccessRatePct: number
  reviewConversionPct: number
  repeatCustomerRatePct: number
  queueBacklog: number
}

export async function calculateMerchantHealthScore(merchantId: string): Promise<MerchantHealthMetrics> {
  const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
  const merchantName = merchant?.name || merchantId

  // 1. WhatsApp Success Rate (Weight 30%)
  const totalMessages = await db.whatsAppMessage.count({ where: { merchantId } })
  const failedMessages = await db.whatsAppMessage.count({ where: { merchantId, status: "failed" } })
  const whatsAppSuccessRatePct = totalMessages > 0 ? Number((((totalMessages - failedMessages) / totalMessages) * 100).toFixed(1)) : 100

  // 2. Google Review Conversion (Weight 25%)
  const totalReviewRequests = await db.whatsAppMessage.count({ where: { merchantId, template: "review_request" } })
  const reviewsSubmitted = await db.review.count({ where: { merchantId, status: "APPROVED" } })
  const reviewConversionPct = totalReviewRequests > 0 ? Number(((reviewsSubmitted / totalReviewRequests) * 100).toFixed(1)) : 0

  // 3. Repeat Customer Rate (Weight 25%)
  const totalCustomers = await db.customer.count({ where: { merchantId } })
  const repeatCustomers = await db.customer.count({ where: { merchantId, lifetimeSpend: { gt: 0 } } })
  const repeatCustomerRatePct = totalCustomers > 0 ? Number(((repeatCustomers / totalCustomers) * 100).toFixed(1)) : 0

  // 4. Queue Health (Weight 20%)
  const queueBacklog = await db.whatsAppMessage.count({ where: { merchantId, status: "queued" } })
  const queueScore = Math.max(0, 100 - queueBacklog * 2)

  // Composite Score Calculation
  const score = Math.round(
    whatsAppSuccessRatePct * 0.3 +
    reviewConversionPct * 0.25 +
    repeatCustomerRatePct * 0.25 +
    queueScore * 0.2
  )

  let status: "EXCELLENT" | "GOOD" | "ATTENTION" | "CRITICAL" = "EXCELLENT"
  if (score < 50) status = "CRITICAL"
  else if (score < 70) status = "ATTENTION"
  else if (score < 85) status = "GOOD"

  return {
    merchantId,
    merchantName,
    score,
    status,
    whatsAppSuccessRatePct,
    reviewConversionPct,
    repeatCustomerRatePct,
    queueBacklog,
  }
}
