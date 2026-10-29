import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const snapshots = await db.growthSnapshot.findMany({
      where: { merchantId: merchant.id },
      orderBy: { snapshotDate: "desc" }
    })
    return ok({ snapshots })
  } catch (error) {
    console.error('[Growth Snapshot GET Error]', error)
    return err('Failed to fetch snapshots', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()

    const customers = await db.customer.count({
      where: { merchantId: merchant.id, deletedAt: null }
    })
    const stamps = await db.stamp.count({
      where: { merchantId: merchant.id }
    })
    const redemptions = await db.redemption.count({
      where: { merchantId: merchant.id }
    })
    const reviews = await db.review.count({
      where: { merchantId: merchant.id }
    })
    const googleReviews = await db.googleBusinessReview.count({
      where: { merchantId: merchant.id }
    })

    const snapshot = await db.growthSnapshot.create({
      data: {
        merchantId: merchant.id,
        snapshotDate: new Date(),
        totalCustomers: customers,
        totalStamps: stamps,
        totalRedemptions: redemptions,
        totalReviews: reviews,
        googleReviewCount: googleReviews,
      }
    })

    return ok({ snapshot })
  } catch (error) {
    console.error('[Growth Snapshot POST Error]', error)
    return err('Failed to create snapshot', 500)
  }
}
