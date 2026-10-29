import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { getIndustryLoyaltyRule } from "@/lib/industry-campaigns"
import { getGlobalDefaultMerchantSettings } from "@/lib/default-merchant-settings"

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

    const [card, merchant, globalDefaults, referralRecord, socialRewardRecord] = await Promise.all([
      db.stampCard.findFirst({
        where: { merchantId, active: true },
        orderBy: { updatedAt: "desc" }  // always get the most recently SAVED card
      }),
      db.merchant.findUnique({
        where: { id: merchantId },
        select: { name: true, businessType: true, vipUpgradeBonusStamps: true }
      }),
      getGlobalDefaultMerchantSettings(),
      db.systemContent.findUnique({
        where: { key: `MERCHANT_REFERRAL_RULES_${merchantId}` }
      }),
      db.systemContent.findUnique({
        where: { key: `MERCHANT_SOCIAL_REWARD_RULES_${merchantId}` }
      })
    ])

    let referralRules = {
      referralBonusEnabled: globalDefaults?.referralBonusEnabled ?? true,
      referralBonusStamps: globalDefaults?.referralBonusStamps ?? 1,
      referralFriendBonusStamps: globalDefaults?.referralFriendBonusStamps ?? 1,
      referralRewardAmount: globalDefaults?.referralRewardAmount ?? 0,
    }
    if (referralRecord?.value) {
      try {
        const parsed = JSON.parse(referralRecord.value)
        referralRules = { ...referralRules, ...parsed }
      } catch (e) {}
    }

    let socialRewardRules = {
      instagramStoryBonusEnabled: globalDefaults?.instagramStoryBonusEnabled ?? true,
      instagramStoryBonusStamps: globalDefaults?.instagramStoryBonusStamps ?? 1,
      instagramStoryFrequency: globalDefaults?.instagramStoryFrequency || "ONCE_PER_CYCLE",
    }
    if (socialRewardRecord?.value) {
      try {
        const parsed = JSON.parse(socialRewardRecord.value)
        socialRewardRules = { ...socialRewardRules, ...parsed }
      } catch (e) {}
    }

    console.log(`[CardSetup GET] Card found for merchant ${merchantId}:`, card ? `id=${card.id} stamps=${card.stampsRequired} val=${card.stampValue}` : "NULL → will return GLOBAL DEFAULTS")

    if (!card) {
      const rule = getIndustryLoyaltyRule(merchant?.businessType, merchant?.name)
      const defaultCardData = {
        name: globalDefaults?.cardName || rule.getCardTitle(merchant?.name),
        stampsRequired: globalDefaults?.stampsRequired ?? rule.stampsRequired,
        rewardName: globalDefaults?.rewardName || rule.rewardName,
        stampValue: globalDefaults?.stampValue ?? rule.stampValue,
        validityDays: globalDefaults?.validityDays ?? rule.validityDays,
        googleReviewBonus: globalDefaults?.googleReviewBonus ?? rule.googleReviewBonus,
        photoBonus: globalDefaults?.photoBonus ?? rule.photoBonus,
        joiningBonusEnabled: globalDefaults?.joiningBonusEnabled ?? rule.joiningBonusEnabled,
        joiningBonusStamps: globalDefaults?.joiningBonusStamps ?? rule.joiningBonusStamps,
        vipUpgradeBonusStamps: merchant?.vipUpgradeBonusStamps ?? globalDefaults?.vipUpgradeBonusStamps ?? rule.vipUpgradeBonusStamps,
        color: globalDefaults?.color || rule.color,
        tierRewardsEnabled: false,
        excludedCategories: "",
        rewardImageUrl: ""
      }

      // Auto-create initial card in DB so it exists persistently for this merchant
      const createdCard = await db.stampCard.create({
        data: {
          merchantId,
          name: defaultCardData.name,
          stampsRequired: defaultCardData.stampsRequired,
          rewardName: defaultCardData.rewardName,
          stampValue: defaultCardData.stampValue,
          validityDays: defaultCardData.validityDays,
          googleReviewBonus: defaultCardData.googleReviewBonus,
          photoBonus: defaultCardData.photoBonus,
          joiningBonusEnabled: defaultCardData.joiningBonusEnabled,
          joiningBonusStamps: defaultCardData.joiningBonusStamps,
          color: defaultCardData.color,
          tierRewardsEnabled: false,
          active: true,
        }
      }).catch(() => null)

      return ok({
        card: createdCard ? { ...createdCard, ...referralRules, ...socialRewardRules, vipUpgradeBonusStamps: defaultCardData.vipUpgradeBonusStamps } : { ...defaultCardData, ...referralRules, ...socialRewardRules },
        isDefault: true
      }, {
        headers: { "Cache-Control": "no-store, private" }
      })
    }

    return ok({ card: { ...card, ...referralRules, ...socialRewardRules, vipUpgradeBonusStamps: merchant?.vipUpgradeBonusStamps ?? globalDefaults?.vipUpgradeBonusStamps ?? 2 }, isDefault: false }, {
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
      referralBonusEnabled,
      referralBonusStamps,
      referralFriendBonusStamps,
      referralRewardAmount,
      instagramStoryBonusEnabled,
      instagramStoryBonusStamps,
      instagramStoryFrequency,
      color,
      tierRewardsEnabled,
      excludedCategories,
      rewardImageUrl
    } = body

    if (!name || !rewardName || !stampsRequired) {
      return err("Card name, reward name, and required stamps are mandatory", 400)
    }

    // Save referral rules to SystemContent if provided
    if (referralBonusEnabled !== undefined || referralBonusStamps !== undefined || referralFriendBonusStamps !== undefined || referralRewardAmount !== undefined) {
      await db.systemContent.upsert({
        where: { key: `MERCHANT_REFERRAL_RULES_${merchantId}` },
        create: {
          key: `MERCHANT_REFERRAL_RULES_${merchantId}`,
          section: "merchant_settings",
          category: "referral_rules",
          value: JSON.stringify({
            referralBonusEnabled: Boolean(referralBonusEnabled ?? true),
            referralBonusStamps: Math.max(0, Number(referralBonusStamps ?? 1)),
            referralFriendBonusStamps: Math.max(0, Number(referralFriendBonusStamps ?? 1)),
            referralRewardAmount: Math.max(0, Number(referralRewardAmount ?? 0)),
          })
        },
        update: {
          value: JSON.stringify({
            referralBonusEnabled: Boolean(referralBonusEnabled ?? true),
            referralBonusStamps: Math.max(0, Number(referralBonusStamps ?? 1)),
            referralFriendBonusStamps: Math.max(0, Number(referralFriendBonusStamps ?? 1)),
            referralRewardAmount: Math.max(0, Number(referralRewardAmount ?? 0)),
          })
        }
      }).catch((e) => console.error("[CardSetup POST] Error saving referral rules:", e))
    }

    // Save social reward rules (Instagram Story Bonus) to SystemContent if provided
    if (instagramStoryBonusEnabled !== undefined || instagramStoryBonusStamps !== undefined || instagramStoryFrequency !== undefined) {
      await db.systemContent.upsert({
        where: { key: `MERCHANT_SOCIAL_REWARD_RULES_${merchantId}` },
        create: {
          key: `MERCHANT_SOCIAL_REWARD_RULES_${merchantId}`,
          section: "merchant_settings",
          category: "social_reward_rules",
          value: JSON.stringify({
            instagramStoryBonusEnabled: Boolean(instagramStoryBonusEnabled ?? true),
            instagramStoryBonusStamps: Math.max(0, Number(instagramStoryBonusStamps ?? 1)),
            instagramStoryFrequency: instagramStoryFrequency || "ONCE_PER_CYCLE",
          })
        },
        update: {
          value: JSON.stringify({
            instagramStoryBonusEnabled: Boolean(instagramStoryBonusEnabled ?? true),
            instagramStoryBonusStamps: Math.max(0, Number(instagramStoryBonusStamps ?? 1)),
            instagramStoryFrequency: instagramStoryFrequency || "ONCE_PER_CYCLE",
          })
        }
      }).catch((e) => console.error("[CardSetup POST] Error saving social reward rules:", e))
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
    let existingCard: any = null
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
