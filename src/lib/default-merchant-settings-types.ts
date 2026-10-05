export interface DefaultMerchantSettingsData {
  // Reward Card Rules (Step A)
  cardName: string
  rewardName: string
  stampsRequired: number
  stampValue: number
  validityDays: number
  googleReviewBonus: number
  photoBonus: number
  joiningBonusEnabled: boolean
  joiningBonusStamps: number
  vipUpgradeBonusStamps: number
  color: string
  tierRewardsEnabled: boolean
  rewardImageUrl?: string

  // 10 Loyalty Cycle Categories (Step B)
  loyaltyCategoryNames: string[]

  // System Automation Rules (Step C)
  googleReviewDelayMinutes: number
  winbackDays1: number
  winbackDays2: number
  winbackDays3: number
  expiryWarningDays: number
  enabledModules: string
}

export const FALLBACK_GLOBAL_DEFAULTS: DefaultMerchantSettingsData = {
  cardName: "Cake Connection VIP Club",
  rewardName: "250g Free Cake",
  stampsRequired: 11,
  stampValue: 500,
  validityDays: 90,
  googleReviewBonus: 1,
  photoBonus: 1,
  joiningBonusEnabled: true,
  joiningBonusStamps: 2,
  vipUpgradeBonusStamps: 1,
  color: "#6366f1",
  tierRewardsEnabled: false,
  rewardImageUrl: "",

  loyaltyCategoryNames: [
    "VIP",
    "VIP Silver",
    "VIP Gold",
    "VIP Platinum",
    "VIP Diamond",
    "VIP Elite",
    "VIP Master",
    "VIP Champion",
    "VIP Legend",
    "VIP Imperial"
  ],

  googleReviewDelayMinutes: 30,
  winbackDays1: 30,
  winbackDays2: 60,
  winbackDays3: 90,
  expiryWarningDays: 7,
  enabledModules: "LOYALTY,REVIEWS,AUTOREPLY"
}
