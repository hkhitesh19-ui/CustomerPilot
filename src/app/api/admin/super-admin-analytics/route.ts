import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { calculateCustomerPilotSuccessScore } from "@/lib/merchant-intelligence"

export async function GET() {
  try {
    const totalMerchants = await db.merchant.count()
    const activeMerchants = await db.merchant.count({ where: { status: "ACTIVE" } })
    const totalCustomers = await db.customer.count()
    const repeatCustomers = await db.customer.count({ where: { lifetimeSpend: { gt: 0 } } })

    const totalBills = await db.bill.count()
    const totalRevenueAgg = await db.bill.aggregate({ _sum: { amount: true } })
    const totalRevenue = totalRevenueAgg._sum.amount || 0

    // Today's revenue & bills
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
    const todayBillsCount = await db.bill.count({ where: { createdAt: { gte: startOfToday } } })
    const todayRevenueAgg = await db.bill.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { amount: true },
    })
    const todayRevenue = todayRevenueAgg._sum.amount || 0

    // MRR & ARR Estimations
    const mrr = activeMerchants * 2999 // Estimated Rs 2,999/mo per active merchant
    const arr = mrr * 12

    // Review & WhatsApp Conversion
    const totalReviewRequests = await db.whatsAppMessage.count({ where: { template: "review_request" } })
    const reviewsApproved = await db.review.count({ where: { status: "APPROVED" } })
    const globalReviewConversionPct = totalReviewRequests > 0 ? Number(((reviewsApproved / totalReviewRequests) * 100).toFixed(1)) : 0

    const totalWhatsAppMessages = await db.whatsAppMessage.count()
    const failedWhatsAppMessages = await db.whatsAppMessage.count({ where: { status: "failed" } })
    const whatsAppSuccessPct = totalWhatsAppMessages > 0 ? Number((((totalWhatsAppMessages - failedWhatsAppMessages) / totalWhatsAppMessages) * 100).toFixed(1)) : 100

    // Calculate CustomerPilot Success Score for all merchants
    const merchants = await db.merchant.findMany({ select: { id: true, name: true } })
    const merchantIntelligenceList = await Promise.all(
      merchants.map(m => calculateCustomerPilotSuccessScore(m.id))
    )

    // Sort Top 5 and Bottom 5 Merchants
    merchantIntelligenceList.sort((a, b) => b.successScore - a.successScore)
    const topMerchants = merchantIntelligenceList.slice(0, 5)
    const bottomMerchants = merchantIntelligenceList.slice(-5).reverse()
    const churnRiskMerchants = merchantIntelligenceList.filter(m => m.churnRisk.isAtRisk)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      businessAnalytics: {
        totalMerchants,
        activeMerchants,
        totalCustomers,
        repeatCustomers,
        todayRevenue,
        todayBillsCount,
        totalRevenue,
        totalBills,
        mrr,
        arr,
        globalReviewConversionPct,
        whatsAppSuccessPct,
      },
      merchantRankings: {
        topMerchants,
        bottomMerchants,
        churnRiskCount: churnRiskMerchants.length,
        churnRiskMerchants,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
