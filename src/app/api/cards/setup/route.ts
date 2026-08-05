import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

const RECOMMENDED_DEFAULTS = {
  name: "Loyalty Stamp Card",
  stampsRequired: 10,
  rewardName: "FREE 500gm Cake",
  stampValue: 500, // ₹500 Purchase = 1 Stamp
  validityDays: 90,
  googleReviewBonus: 1,
  photoBonus: 1,
  color: "#6366f1",
  tierRewardsEnabled: false,
  excludedCategories: "",
  rewardImageUrl: ""
}

export async function GET(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) return err("Unauthorized", 401)

    const card = await db.stampCard.findFirst({
      where: { merchantId, active: true },
      orderBy: { createdAt: "desc" }
    })

    if (!card) {
      return ok({ card: RECOMMENDED_DEFAULTS, isDefault: true })
    }

    return ok({ card, isDefault: false })
  } catch (error: any) {
    return err(error.message || "Failed to fetch reward card setup", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) return err("Unauthorized", 401)

    const body = await req.json()
    const {
      id,
      name,
      stampsRequired,
      rewardName,
      stampValue,
      validityDays,
      googleReviewBonus,
      photoBonus,
      color,
      tierRewardsEnabled,
      excludedCategories,
      rewardImageUrl
    } = body

    if (!name || !rewardName || !stampsRequired) {
      return err("Card name, reward name, and required stamps are mandatory", 400)
    }

    let card
    if (id) {
      card = await db.stampCard.update({
        where: { id },
        data: {
          name,
          stampsRequired: Number(stampsRequired),
          rewardName,
          stampValue: stampValue ? Number(stampValue) : null,
          validityDays: validityDays ? Number(validityDays) : 90,
          googleReviewBonus: googleReviewBonus ? Number(googleReviewBonus) : 0,
          photoBonus: photoBonus ? Number(photoBonus) : 0,
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
          googleReviewBonus: googleReviewBonus ? Number(googleReviewBonus) : 1,
          photoBonus: photoBonus ? Number(photoBonus) : 1,
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
    return err(error.message || "Failed to save reward card setup", 500)
  }
}
