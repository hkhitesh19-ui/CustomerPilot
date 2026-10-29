import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')

    if (month) {
      const report = await db.growthReport.findUnique({
        where: {
          merchantId_reportMonth: {
            merchantId: merchant.id,
            reportMonth: month
          }
        }
      })
      return ok({ report })
    }

    const reports = await db.growthReport.findMany({
      where: { merchantId: merchant.id },
      orderBy: { reportMonth: 'desc' }
    })
    
    return ok({ reports })
  } catch (error) {
    console.error('[Growth Report GET Error]', error)
    return err('Failed to fetch growth reports', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() // 0-indexed
    const reportMonth = `${year}-${String(month + 1).padStart(2, '0')}`
    
    const periodStart = new Date(year, month, 1)
    const periodEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)

    const newCustomers = await db.customer.count({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: periodStart, lte: periodEnd }
      }
    })

    const stampsIssued = await db.stamp.count({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: periodStart, lte: periodEnd }
      }
    })

    const rewardsRedeemed = await db.redemption.count({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: periodStart, lte: periodEnd }
      }
    })

    const internalReviews = await db.review.count({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: periodStart, lte: periodEnd }
      }
    })
    
    const googleReviews = await db.googleBusinessReview.count({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: periodStart, lte: periodEnd }
      }
    })

    const reviewsReceived = internalReviews + googleReviews

    const repliesPosted = await db.googleBusinessReview.count({
      where: {
        merchantId: merchant.id,
        repliedAt: { gte: periodStart, lte: periodEnd }
      }
    })

    const repeatVisitsData = await db.stamp.groupBy({
      by: ['customerId'],
      where: {
        merchantId: merchant.id,
        createdAt: { gte: periodStart, lte: periodEnd }
      },
      having: {
        customerId: {
          _count: { gt: 1 }
        }
      }
    })
    const repeatVisits = repeatVisitsData.length

    const report = await db.growthReport.upsert({
      where: {
        merchantId_reportMonth: {
          merchantId: merchant.id,
          reportMonth
        }
      },
      update: {
        periodStart,
        periodEnd,
        newCustomers,
        stampsIssued,
        rewardsRedeemed,
        reviewsReceived,
        repliesPosted,
        repeatVisits
      },
      create: {
        merchantId: merchant.id,
        reportMonth,
        periodStart,
        periodEnd,
        newCustomers,
        stampsIssued,
        rewardsRedeemed,
        reviewsReceived,
        repliesPosted,
        repeatVisits
      }
    })

    return ok({ report })
  } catch (error) {
    console.error('[Growth Report POST Error]', error)
    return err('Failed to generate report', 500)
  }
}
