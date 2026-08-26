import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    
    const daysSinceJoined = Math.floor((new Date().getTime() - new Date(merchant.createdAt).getTime()) / (1000 * 60 * 60 * 24))

    const totalCustomers = await db.customer.count({
      where: { merchantId: merchant.id, deletedAt: null }
    })

    const totalStamps = await db.stamp.count({
      where: { merchantId: merchant.id }
    })

    const totalReviews = await db.googleBusinessReview.count({
      where: { merchantId: merchant.id }
    })

    const totalRedemptions = await db.redemption.count({
      where: { merchantId: merchant.id }
    })

    const storyText = `${merchant.name} joined CustomerPilot ${daysSinceJoined} days ago. In this time, they gained ${totalCustomers} loyalty members, collected ${totalStamps} stamps, received ${totalReviews} Google reviews, and redeemed ${totalRedemptions} rewards.`

    return ok({ story: storyText })
  } catch (error) {
    console.error('[Success Story GET Error]', error)
    return err('Failed to generate success story', 500)
  }
}
