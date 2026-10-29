import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  try {
    const { customerId } = await params

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        merchant: {
          include: {
            merchantGoogleConnections: true
          }
        },
        stampCards: {
          include: {
            stampCard: true
          },
          orderBy: { createdAt: "desc" }
        },
        stamps: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const activeStampCardRule = await db.stampCard.findFirst({
      where: { merchantId: customer.merchantId, active: true }
    })

    if (!activeStampCardRule) {
      return NextResponse.json({ error: "No active loyalty program found for this store" }, { status: 404 })
    }

    // Active uncompleted card
    const activeCard = customer.stampCards.find(
      c => c.stampCardId === activeStampCardRule.id && !c.completed && !c.redeemed
    )

    // Completed unredeemed card
    const unredeemedRewardCard = customer.stampCards.find(
      c => c.stampCardId === activeStampCardRule.id && c.completed && !c.redeemed
    )

    const stampsRequired = activeStampCardRule.stampsRequired || 10
    const stampsCollected = activeCard ? activeCard.stampsCollected : (unredeemedRewardCard ? stampsRequired : 0)

    const latestReview = customer.reviews?.[0]
    const hasPostedReview = Boolean(latestReview)
    const hasPostedPhoto = Boolean(latestReview && (latestReview.photoBonusStamps > 0 || latestReview.photoUrl))

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        vipTier: customer.vipTier || "VIP",
        lifetimeStamps: customer.lifetimeStamps,
        walletCredit: customer.walletCredit || 0
      },
      merchant: {
        id: customer.merchant.id,
        name: customer.merchant.name,
        logoUrl: customer.merchant.logoUrl,
        address: customer.merchant.address,
        whatsappPhone: customer.merchant.whatsappPhone
      },
      rule: {
        id: activeStampCardRule.id,
        title: activeStampCardRule.name,
        stampsRequired,
        rewardName: activeStampCardRule.rewardName || "FREE Reward",
        googleReviewBonus: activeStampCardRule.googleReviewBonus ?? 2,
        photoBonus: activeStampCardRule.photoBonus ?? 2
      },
      card: {
        id: activeCard?.id || unredeemedRewardCard?.id || null,
        stampsCollected,
        stampsRequired,
        isCompleted: Boolean(unredeemedRewardCard && !activeCard),
        isRewardReady: Boolean(unredeemedRewardCard),
        rewardName: activeStampCardRule.rewardName || "FREE Reward"
      },
      stampsHistory: customer.stamps.map(s => {
        let label = "Store Purchase"
        let icon = "🛍️"
        if (s.source === "JOINING_BONUS") {
          label = "Welcome Joining Bonus"
          icon = "🎁"
        } else if (s.source === "review_bonus") {
          label = "Google Review Bonus"
          icon = "⭐"
        } else if (s.source === "photo_bonus") {
          label = "Photo Review Bonus"
          icon = "📸"
        } else if (s.source?.includes("vip") || s.source === "LEVEL_UP_BONUS") {
          label = "Level-Up Kickstart Bonus"
          icon = "🥈"
        } else if (s.source?.includes("referral")) {
          label = "Friend Referral Bonus"
          icon = "🤝"
        }
        return {
          id: s.id,
          source: s.source,
          label,
          icon,
          createdAt: s.createdAt
        }
      }),
      reviewStatus: {
        hasPostedReview,
        hasPostedPhoto,
        reviewUrl: `/review?c=${customer.id}&m=${customer.merchantId}`
      }
    })
  } catch (error: any) {
    console.error("[Wallet API Error]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
