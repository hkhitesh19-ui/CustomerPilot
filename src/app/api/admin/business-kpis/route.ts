import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const totalCustomers = await db.customer.count()
    const repeatCustomers = await db.customer.count({ where: { lifetimeSpend: { gt: 0 } } })
    const customerReturnRatePct = totalCustomers > 0 ? Number(((repeatCustomers / totalCustomers) * 100).toFixed(1)) : 0

    const totalReviewRequests = await db.whatsAppMessage.count({ where: { template: "review_request" } })
    const reviewsSubmitted = await db.review.count({ where: { status: "APPROVED" } })
    const reviewConversionPct = totalReviewRequests > 0 ? Number(((reviewsSubmitted / totalReviewRequests) * 100).toFixed(1)) : 0

    const totalRedemptions = await db.customerStampCard.count({ where: { redeemed: true } })
    const totalCompletedCards = await db.customerStampCard.count({ where: { completed: true } })
    const rewardRedemptionPct = totalCompletedCards > 0 ? Number(((totalRedemptions / totalCompletedCards) * 100).toFixed(1)) : 0

    const aggregateSpend = await db.bill.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    })

    const totalRevenue = aggregateSpend._sum.amount || 0
    const totalBills = aggregateSpend._count.id || 0
    const avgBillValue = totalBills > 0 ? Number((totalRevenue / totalBills).toFixed(2)) : 0

    return NextResponse.json({
      success: true,
      businessKpis: {
        totalCustomers,
        repeatCustomers,
        customerReturnRatePct,
        totalReviewRequests,
        reviewsSubmitted,
        reviewConversionPct,
        totalCompletedCards,
        totalRedemptions,
        rewardRedemptionPct,
        totalRevenue,
        totalBills,
        avgBillValue,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
