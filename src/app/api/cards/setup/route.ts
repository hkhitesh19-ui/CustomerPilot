import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"

const RECOMMENDED_DEFAULTS = {
  name: "Loyalty Stamp Card",
  stampsRequired: 10,
  rewardName: "FREE 500gm Cake",
  stampValue: 500, // ₹500 Purchase = 1 Stamp
  validityDays: 90,
  googleReviewBonus: 1,
  photoBonus: 1,
  joiningBonusEnabled: true,
  joiningBonusStamps: 2,
  color: "#6366f1",
  tierRewardsEnabled: false,
  excludedCategories: "",
  rewardImageUrl: ""
}

export async function GET(req: NextRequest) {
  try {
    let merchantId = req.headers.get("x-merchant-id")
    console.log(`[CardSetup GET] x-merchant-id from header: "${merchantId}"`)
    
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
      console.log(`[CardSetup GET] merchantId from getAuthenticatedMerchant: "${merchantId}"`)
    }
    if (!merchantId) {
      console.log(`[CardSetup GET] NO merchantId found → returning 401`)
      return err("Unauthorized", 401)
    }

    const [card, merchant] = await Promise.all([
      db.stampCard.findFirst({
        where: { merchantId, active: true },
        orderBy: { updatedAt: "desc" }  // always get the most recently SAVED card
      }),
      db.merchant.findUnique({
        where: { id: merchantId },
        select: { vipUpgradeBonusStamps: true }
      })
    ])

    console.log(`[CardSetup GET] Card found for merchant ${merchantId}:`, card ? `id=${card.id} stamps=${card.stampsRequired} val=${card.stampValue}` : "NULL → will return DEFAULTS")

    if (!card) {
      return ok({ card: { ...RECOMMENDED_DEFAULTS, vipUpgradeBonusStamps: merchant?.vipUpgradeBonusStamps ?? 1 }, isDefault: true }, {
        headers: { "Cache-Control": "no-store, private" }
      })
    }

    return ok({ card: { ...card, vipUpgradeBonusStamps: merchant?.vipUpgradeBonusStamps ?? 1 }, isDefault: false }, {
      headers: { "Cache-Control": "no-store, private" }
    })
  } catch (error: any) {
    return err(error.message || "Failed to fetch reward card setup", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    let merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
    }
    if (!merchantId) return err("Unauthorized", 401)

    const body = await req.json().catch(() => ({}))
    const {
      id,
      name,
      stampsRequired,
      rewardName,
      stampValue,
      validityDays,
      googleReviewBonus,
      photoBonus,
      vipUpgradeBonusStamps,
      joiningBonusEnabled,
      joiningBonusStamps,
      color,
      tierRewardsEnabled,
      excludedCategories,
      rewardImageUrl
    } = body

    if (!name || !rewardName || !stampsRequired) {
      return err("Card name, reward name, and required stamps are mandatory", 400)
    }

    // Save vipUpgradeBonusStamps to Merchant record if provided
    if (vipUpgradeBonusStamps !== undefined) {
      await db.merchant.update({
        where: { id: merchantId },
        data: { vipUpgradeBonusStamps: Math.max(0, Number(vipUpgradeBonusStamps)) }
      }).catch(() => {})
    }

    // Find the canonical active card for this merchant
    // Always pick the most recently UPDATED one as the single source of truth
    let existingCard = null
    if (id) {
      existingCard = await db.stampCard.findFirst({
        where: { id, merchantId }
      })
    }
    if (!existingCard) {
      existingCard = await db.stampCard.findFirst({
        where: { merchantId, active: true },
        orderBy: { updatedAt: "desc" }
      })
    }

    // Deactivate any OTHER duplicate active cards to prevent desync
    if (existingCard) {
      await db.stampCard.updateMany({
        where: { merchantId, active: true, id: { not: existingCard.id } },
        data: { active: false }
      })
    }

    let card
    if (existingCard) {
      card = await db.stampCard.update({
        where: { id: existingCard.id },
        data: {
          name,
          stampsRequired: Number(stampsRequired),
          rewardName,
          stampValue: stampValue ? Number(stampValue) : 500,
          validityDays: validityDays ? Number(validityDays) : 90,
          googleReviewBonus: googleReviewBonus !== undefined ? Number(googleReviewBonus) : 1,
          photoBonus: photoBonus !== undefined ? Number(photoBonus) : 1,
          joiningBonusEnabled: joiningBonusEnabled !== undefined ? Boolean(joiningBonusEnabled) : true,
          joiningBonusStamps: joiningBonusStamps !== undefined ? Number(joiningBonusStamps) : 2,
          color: color || "#6366f1",
          tierRewardsEnabled: Boolean(tierRewardsEnabled),
          excludedCategories: excludedCategories || null,
          rewardImageUrl: rewardImageUrl || null,
          active: true
        }
      })
    } else {
      card = await db.stampCard.create({
        data: {
          merchantId,
          name,
          stampsRequired: Number(stampsRequired),
          rewardName,
          stampValue: stampValue ? Number(stampValue) : 500,
          validityDays: validityDays ? Number(validityDays) : 90,
          googleReviewBonus: googleReviewBonus !== undefined ? Number(googleReviewBonus) : 1,
          photoBonus: photoBonus !== undefined ? Number(photoBonus) : 1,
          joiningBonusEnabled: joiningBonusEnabled !== undefined ? Boolean(joiningBonusEnabled) : true,
          joiningBonusStamps: joiningBonusStamps !== undefined ? Number(joiningBonusStamps) : 2,
          color: color || "#6366f1",
          tierRewardsEnabled: Boolean(tierRewardsEnabled),
          excludedCategories: excludedCategories || null,
          rewardImageUrl: rewardImageUrl || null,
          active: true
        }
      })
    }

    return ok({ card, message: "Reward card configuration saved successfully" })
  } catch (error: any) {
    console.error("[POST /api/cards/setup Error]", error)
    return err(error.message || "Failed to save reward card setup", 500)
  }
}
