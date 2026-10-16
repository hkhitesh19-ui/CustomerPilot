import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { DigitalWalletClient } from "@/components/wallet/DigitalWalletClient"

export const dynamic = "force-dynamic"

export default async function WalletPage({ 
  params 
}: { 
  params: Promise<{ customerId: string }> | { customerId: string } 
}) {
  const resolvedParams = await params
  const { customerId } = resolvedParams

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

  if (!customer) return notFound()

  // Find the active stamp card rule for this merchant, or fallback to any existing rule
  let activeStampCardRule = await db.stampCard.findFirst({
    where: { merchantId: customer.merchantId, active: true }
  })

  if (!activeStampCardRule) {
    activeStampCardRule = await db.stampCard.findFirst({
      where: { merchantId: customer.merchantId }
    })
  }

  // Self-healing: if merchant has no stamp card at all, auto-create default VIP card
  if (!activeStampCardRule) {
    try {
      activeStampCardRule = await db.stampCard.create({
        data: {
          merchantId: customer.merchantId,
          name: `${customer.merchant?.name || "VIP"} Club Card`,
          stampsRequired: 10,
          rewardName: "Special VIP Reward",
          joiningBonusEnabled: true,
          joiningBonusStamps: 2,
          color: "#6366f1",
          active: true,
        }
      })
    } catch (e) {
      console.error("[Wallet Page] Failed to auto-create fallback stamp card:", e)
    }
  }

  // Find active uncompleted card
  let activeCard = customer.stampCards.find(
    c => activeStampCardRule && c.stampCardId === activeStampCardRule.id && !c.completed && !c.redeemed
  )

  // Find completed unredeemed card
  const unredeemedRewardCard = customer.stampCards.find(
    c => activeStampCardRule && c.stampCardId === activeStampCardRule.id && c.completed && !c.redeemed
  )

  // Self-healing: if customer has no active card, auto-create one with joining bonus
  if (!activeCard && !unredeemedRewardCard && activeStampCardRule) {
    try {
      const initialStamps = activeStampCardRule.joiningBonusEnabled ? (activeStampCardRule.joiningBonusStamps ?? 2) : 1
      activeCard = await db.customerStampCard.create({
        data: {
          customerId: customer.id,
          merchantId: customer.merchantId,
          stampCardId: activeStampCardRule.id,
          stampsCollected: initialStamps,
          completed: false,
          redeemed: false,
        }
      }) as any
    } catch (e) {
      console.warn("[Wallet Page] Could not auto-create customer card:", e)
    }
  }

  const stampsRequired = activeStampCardRule?.stampsRequired || 10
  const stampsCollected = activeCard ? activeCard.stampsCollected : (unredeemedRewardCard ? stampsRequired : (activeStampCardRule?.joiningBonusEnabled ? (activeStampCardRule.joiningBonusStamps ?? 2) : 0))

  const latestReview = customer.reviews?.[0]
  const hasPostedReview = Boolean(latestReview)
  const hasPostedPhoto = Boolean(latestReview && (latestReview.photoBonusStamps > 0 || latestReview.photoUrl))

  const initialData = {
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
      } else if (s.source?.includes("vip")) {
        label = "VIP Tier Upgrade Bonus"
        icon = "👑"
      } else if (s.source?.includes("referral")) {
        label = "Friend Referral Bonus"
        icon = "🤝"
      }
      return {
        id: s.id,
        source: s.source,
        label,
        icon,
        createdAt: s.createdAt.toISOString()
      }
    }),
    reviewStatus: {
      hasPostedReview,
      hasPostedPhoto,
      reviewUrl: `/review?c=${customer.id}&m=${customer.merchantId}`
    }
  }

  return <DigitalWalletClient initialData={initialData} />
}
