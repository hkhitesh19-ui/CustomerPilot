import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import {
  getGlobalDefaultMerchantSettings,
  saveGlobalDefaultMerchantSettings,
  DefaultMerchantSettingsData
} from "@/lib/default-merchant-settings"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0"
}

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role")
    // Allow super_admin or internal usage
    const settings = await getGlobalDefaultMerchantSettings()
    return ok({ settings }, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return err(error.message || "Failed to fetch default settings", 500, { headers: NO_CACHE_HEADERS })
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role")
    if (role && role !== "super_admin") {
      return err("Unauthorized: SuperAdmin required", 403, { headers: NO_CACHE_HEADERS })
    }

    const body = await req.json().catch(() => ({}))
    const { settings, applyToAll } = body

    if (!settings) {
      return err("Missing settings payload", 400, { headers: NO_CACHE_HEADERS })
    }

    const updated = await saveGlobalDefaultMerchantSettings(settings)

    let affectedMerchantsCount = 0
    let affectedCardsCount = 0

    if (applyToAll) {
      // 1. Batch update all active merchants with default automation & tier rules
      const merchantUpdateResult = await db.merchant.updateMany({
        data: {
          vipUpgradeBonusStamps: updated.vipUpgradeBonusStamps,
          loyaltyCategoryNames: JSON.stringify(updated.loyaltyCategoryNames),
          googleReviewDelayMinutes: updated.googleReviewDelayMinutes,
          winbackDays1: updated.winbackDays1,
          winbackDays2: updated.winbackDays2,
          winbackDays3: updated.winbackDays3,
          expiryWarningDays: updated.expiryWarningDays,
          enabledModules: updated.enabledModules
        }
      })
      affectedMerchantsCount = merchantUpdateResult.count

      // 2. Batch update active stamp cards
      const cardUpdateResult = await db.stampCard.updateMany({
        where: { active: true },
        data: {
          name: updated.cardName,
          rewardName: updated.rewardName,
          stampsRequired: updated.stampsRequired,
          stampValue: updated.stampValue,
          validityDays: updated.validityDays,
          googleReviewBonus: updated.googleReviewBonus,
          photoBonus: updated.photoBonus,
          joiningBonusEnabled: updated.joiningBonusEnabled,
          joiningBonusStamps: updated.joiningBonusStamps,
          color: updated.color
        }
      })
      affectedCardsCount = cardUpdateResult.count

      // 3. Batch update referral and social reward rules for all merchants
      const allMerchants = await db.merchant.findMany({ select: { id: true } })
      for (const m of allMerchants) {
        if (updated.referralBonusEnabled !== undefined) {
          await db.systemContent.upsert({
            where: { key: `MERCHANT_REFERRAL_RULES_${m.id}` },
            create: {
              key: `MERCHANT_REFERRAL_RULES_${m.id}`,
              section: "merchant_settings",
              category: "referral_rules",
              value: JSON.stringify({
                referralBonusEnabled: Boolean(updated.referralBonusEnabled ?? true),
                referralBonusStamps: Math.max(0, Number(updated.referralBonusStamps ?? 1)),
                referralFriendBonusStamps: Math.max(0, Number(updated.referralFriendBonusStamps ?? 1)),
                referralRewardAmount: Math.max(0, Number(updated.referralRewardAmount ?? 0)),
              })
            },
            update: {
              value: JSON.stringify({
                referralBonusEnabled: Boolean(updated.referralBonusEnabled ?? true),
                referralBonusStamps: Math.max(0, Number(updated.referralBonusStamps ?? 1)),
                referralFriendBonusStamps: Math.max(0, Number(updated.referralFriendBonusStamps ?? 1)),
                referralRewardAmount: Math.max(0, Number(updated.referralRewardAmount ?? 0)),
              })
            }
          }).catch(() => {})
        }

        if (updated.instagramStoryBonusEnabled !== undefined) {
          await db.systemContent.upsert({
            where: { key: `MERCHANT_SOCIAL_REWARD_RULES_${m.id}` },
            create: {
              key: `MERCHANT_SOCIAL_REWARD_RULES_${m.id}`,
              section: "merchant_settings",
              category: "social_reward_rules",
              value: JSON.stringify({
                instagramStoryBonusEnabled: Boolean(updated.instagramStoryBonusEnabled ?? true),
                instagramStoryBonusStamps: Math.max(0, Number(updated.instagramStoryBonusStamps ?? 1)),
                instagramStoryFrequency: updated.instagramStoryFrequency || "ONCE_PER_CYCLE",
              })
            },
            update: {
              value: JSON.stringify({
                instagramStoryBonusEnabled: Boolean(updated.instagramStoryBonusEnabled ?? true),
                instagramStoryBonusStamps: Math.max(0, Number(updated.instagramStoryBonusStamps ?? 1)),
                instagramStoryFrequency: updated.instagramStoryFrequency || "ONCE_PER_CYCLE",
              })
            }
          }).catch(() => {})
        }
      }
    }

    return ok({
      settings: updated,
      appliedToAll: !!applyToAll,
      affectedMerchantsCount,
      affectedCardsCount,
      message: applyToAll
        ? `Saved and applied to ${affectedMerchantsCount} merchants and ${affectedCardsCount} cards!`
        : "Global default merchant settings saved successfully."
    }, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    console.error("[api/admin/default-settings POST] Error:", error)
    return err(error.message || "Failed to save default settings", 500, { headers: NO_CACHE_HEADERS })
  }
}
