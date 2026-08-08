import { db } from "@/lib/db"

export interface CustomerPilotSuccessScoreResult {
  merchantId: string
  merchantName: string
  successScore: number // 0 to 100
  tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE"
  metrics: {
    repeatCustomerRatePct: number
    reviewConversionPct: number
    rewardRedemptionPct: number
    whatsAppDeliverySuccessPct: number
    customerGrowthCount: number
    activityConsistencyDays: number
  }
  proactiveAlerts: string[]
  churnRisk: {
    isAtRisk: boolean
    riskFactors: string[]
  }
  aiRecommendations: string[]
}

export async function calculateCustomerPilotSuccessScore(merchantId: string): Promise<CustomerPilotSuccessScoreResult> {
  const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
  const merchantName = merchant?.name || merchantId

  // 1. Repeat Customer Rate (Weight 25%)
  const totalCustomers = await db.customer.count({ where: { merchantId } })
  const repeatCustomers = await db.customer.count({ where: { merchantId, lifetimeSpend: { gt: 0 } } })
  const repeatCustomerRatePct = totalCustomers > 0 ? Number(((repeatCustomers / totalCustomers) * 100).toFixed(1)) : 0

  // 2. Google Review Conversion Rate (Weight 25%)
  const totalReviewRequests = await db.whatsAppMessage.count({ where: { merchantId, template: "review_request" } })
  const reviewsApproved = await db.review.count({ where: { merchantId, status: "APPROVED" } })
  const reviewConversionPct = totalReviewRequests > 0 ? Number(((reviewsApproved / totalReviewRequests) * 100).toFixed(1)) : 0

  // 3. Reward Redemption Rate (Weight 20%)
  const totalCompletedCards = await db.customerStampCard.count({ where: { merchantId, completed: true } })
  const totalRedeemedCards = await db.customerStampCard.count({ where: { merchantId, redeemed: true } })
  const rewardRedemptionPct = totalCompletedCards > 0 ? Number(((totalRedeemedCards / totalCompletedCards) * 100).toFixed(1)) : 0

  // 4. WhatsApp Delivery Success (Weight 15%)
  const totalMessages = await db.whatsAppMessage.count({ where: { merchantId } })
  const failedMessages = await db.whatsAppMessage.count({ where: { merchantId, status: "failed" } })
  const whatsAppDeliverySuccessPct = totalMessages > 0 ? Number((((totalMessages - failedMessages) / totalMessages) * 100).toFixed(1)) : 100

  // 5. Customer Growth & Activity Consistency (Weight 15%)
  const customerGrowthCount = totalCustomers
  const recentBills = await db.bill.count({
    where: { merchantId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
  })
  const activityConsistencyDays = Math.min(7, Math.ceil(recentBills / 3))

  // Calculate Success Score (0 - 100)
  const successScore = Math.min(100, Math.round(
    repeatCustomerRatePct * 0.25 +
    reviewConversionPct * 0.25 +
    rewardRedemptionPct * 0.20 +
    whatsAppDeliverySuccessPct * 0.15 +
    (activityConsistencyDays / 7) * 15
  ))

  // Assign Tier
  let tier: "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" = "PLATINUM"
  if (successScore < 45) tier = "BRONZE"
  else if (successScore < 70) tier = "SILVER"
  else if (successScore < 85) tier = "GOLD"

  // Proactive Alerts Detection
  const proactiveAlerts: string[] = []
  if (reviewConversionPct < 20 && totalReviewRequests > 5) {
    proactiveAlerts.push("WARNING: Google Review conversion rate is below target (< 20%). Adjust review delay.")
  }
  if (whatsAppDeliverySuccessPct < 95 && totalMessages > 10) {
    proactiveAlerts.push("CRITICAL: WhatsApp failure rate is elevated (> 5%). Check WhatsApp connection.")
  }
  if (recentBills === 0) {
    proactiveAlerts.push("ALERT: Zero POS bills created in the last 7 days. Merchant usage stopped.")
  }

  // Subscription Churn Risk Engine
  const riskFactors: string[] = []
  if (recentBills === 0) riskFactors.push("Inactive usage for 7+ days")
  if (reviewConversionPct < 10 && totalReviewRequests > 5) riskFactors.push("Very low Google Review conversion")
  if (repeatCustomerRatePct < 15 && totalCustomers > 10) riskFactors.push("Low customer repeat frequency")

  const isAtRisk = riskFactors.length >= 2 || recentBills === 0

  // Actionable AI Recommendations Engine
  const aiRecommendations: string[] = []
  const currentDelay = merchant?.googleReviewDelayMinutes ?? 30
  if (reviewConversionPct < 30) {
    aiRecommendations.push(
      `Your Success Score is ${successScore}/100. Adjust your Google Review delay from ${currentDelay}m to 30m to optimize customer review submissions.`
    )
  }
  if (rewardRedemptionPct < 50 && totalCompletedCards > 0) {
    aiRecommendations.push(
      "Your customers are completing stamp cards but not redeeming rewards. Send an automated reward reminder message to boost visits by ~15%."
    )
  }
  if (aiRecommendations.length === 0) {
    aiRecommendations.push(
      `Great job! Your CustomerPilot Success Score is ${successScore}/100 (${tier} Tier). Your loyalty and Google Review engines are performing at peak efficiency.`
    )
  }

  return {
    merchantId,
    merchantName,
    successScore,
    tier,
    metrics: {
      repeatCustomerRatePct,
      reviewConversionPct,
      rewardRedemptionPct,
      whatsAppDeliverySuccessPct,
      customerGrowthCount,
      activityConsistencyDays,
    },
    proactiveAlerts,
    churnRisk: {
      isAtRisk,
      riskFactors,
    },
    aiRecommendations,
  }
}
