export interface IndustryLoyaltyRule {
  industry: string
  categoryKey: string
  rewardName: string
  stampsRequired: number
  stampValue: number // Eligible Minimum Purchase Amount for Loyalty stamp
  validityDays: number // Maximum Time Duration to earn Loyalty Reward (days)
  googleReviewBonus: number
  photoBonus: number
  joiningBonusEnabled: boolean
  joiningBonusStamps: number
  vipUpgradeBonusStamps: number
  color: string
  emoji: string
  description: string
  getCardTitle: (businessName?: string | null) => string
}

export interface IndustryCampaign {
  industry: string
  rewardName: string
  totalStamps: number
  minimumPurchase: number
  emoji: string
  description: string
}

export const industryLoyaltyRules: Record<string, IndustryLoyaltyRule> = {
  bakery: {
    industry: 'Bakery & Cake Shop',
    categoryKey: 'bakery',
    rewardName: '500 Free Cake',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 60,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#6366f1',
    emoji: '🎂',
    description: '10 visits (Min ₹300) = 500 Free Cake',
    getCardTitle: (b) => `${b || 'Cake Connection'} VIP Club`,
  },
  restaurant: {
    industry: 'Restaurant & Dine-in',
    categoryKey: 'restaurant',
    rewardName: 'Free Butter Naan / Starter',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 60,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#10b981',
    emoji: '🍽️',
    description: '10 visits (Min ₹300) = Free Butter Naan / Starter',
    getCardTitle: (b) => `${b || 'Restaurant'} VIP Club`,
  },
  cafe: {
    industry: 'Café & Coffee Shop',
    categoryKey: 'cafe',
    rewardName: 'Free Specialty Coffee',
    stampsRequired: 10,
    stampValue: 150,
    validityDays: 60,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#f59e0b',
    emoji: '☕',
    description: '10 visits (Min ₹150) = Free Specialty Coffee',
    getCardTitle: (b) => `${b || 'Café'} VIP Club`,
  },
  salon: {
    industry: 'Salon & Beauty Parlour',
    categoryKey: 'salon',
    rewardName: 'Free Haircut / Styling',
    stampsRequired: 6,
    stampValue: 500,
    validityDays: 90,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#ec4899',
    emoji: '💇',
    description: '6 visits (Min ₹500) = Free Haircut / Styling',
    getCardTitle: (b) => `${b || 'Salon'} VIP Beauty Pass`,
  },
  spa: {
    industry: 'Spa & Wellness',
    categoryKey: 'spa',
    rewardName: 'Free Head Massage / Aromatherapy',
    stampsRequired: 5,
    stampValue: 800,
    validityDays: 90,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#8b5cf6',
    emoji: '💆',
    description: '5 visits (Min ₹800) = Free Head Massage',
    getCardTitle: (b) => `${b || 'Spa'} Wellness VIP Pass`,
  },
  gym: {
    industry: 'Gym & Fitness Center',
    categoryKey: 'gym',
    rewardName: 'Free 1 Month Membership Extension',
    stampsRequired: 12,
    stampValue: 500,
    validityDays: 90,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#3b82f6',
    emoji: '🏋️',
    description: '12 visits = Free 1 Month Extension',
    getCardTitle: (b) => `${b || 'Fitness'} VIP Club`,
  },
  retail: {
    industry: 'Retail & Clothing Store',
    categoryKey: 'retail',
    rewardName: '₹200 Shopping Voucher',
    stampsRequired: 10,
    stampValue: 500,
    validityDays: 60,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#6366f1',
    emoji: '🛍️',
    description: '10 purchases (Min ₹500) = ₹200 Shopping Voucher',
    getCardTitle: (b) => `${b || 'Store'} VIP Shopper Pass`,
  },
  grocery: {
    industry: 'Grocery & Kirana Store',
    categoryKey: 'grocery',
    rewardName: '₹100 Instant Grocery Discount',
    stampsRequired: 15,
    stampValue: 200,
    validityDays: 60,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#10b981',
    emoji: '🥬',
    description: '15 visits (Min ₹200) = ₹100 Discount',
    getCardTitle: (b) => `${b || 'Grocery'} VIP Savings Club`,
  },
  pharmacy: {
    industry: 'Pharmacy & Chemist',
    categoryKey: 'pharmacy',
    rewardName: 'Free Health Checkup / ₹150 Voucher',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 90,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#06b6d4',
    emoji: '💊',
    description: '10 purchases (Min ₹300) = Free Health Checkup',
    getCardTitle: (b) => `${b || 'Pharmacy'} Health Care Club`,
  },
  electronics: {
    industry: 'Electronics & Mobile Shop',
    categoryKey: 'electronics',
    rewardName: 'Free Tempered Glass / ₹250 Accessory Voucher',
    stampsRequired: 8,
    stampValue: 500,
    validityDays: 90,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#3b82f6',
    emoji: '📱',
    description: '8 purchases (Min ₹500) = Free Accessory Voucher',
    getCardTitle: (b) => `${b || 'Electronics'} Tech VIP Club`,
  },
  other: {
    industry: 'Local Business',
    categoryKey: 'other',
    rewardName: 'Special VIP Surprise Gift',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 60,
    googleReviewBonus: 2,
    photoBonus: 2,
    joiningBonusEnabled: true,
    joiningBonusStamps: 2,
    vipUpgradeBonusStamps: 1,
    color: '#6366f1',
    emoji: '🎁',
    description: '10 visits (Min ₹300) = Special VIP Surprise Gift',
    getCardTitle: (b) => `${b || 'Our Store'} VIP Club`,
  },
}

/**
 * Returns complete loyalty rules and default card config customized by nature of business.
 */
export function getIndustryLoyaltyRule(businessType?: string | null, businessName?: string | null): IndustryLoyaltyRule {
  if (!businessType) return industryLoyaltyRules.bakery // default
  const key = businessType.toLowerCase().replace(/[^a-z]/g, '')

  for (const [k, rule] of Object.entries(industryLoyaltyRules)) {
    if (key.includes(k) || k.includes(key)) return rule
  }

  // Common aliases
  if (key.includes('cake') || key.includes('sweet') || key.includes('dessert') || key.includes('pastry')) {
    return industryLoyaltyRules.bakery
  }
  if (key.includes('food') || key.includes('dine') || key.includes('dhaba') || key.includes('bhojnalay')) {
    return industryLoyaltyRules.restaurant
  }
  if (key.includes('coffee') || key.includes('tea') || key.includes('chai')) {
    return industryLoyaltyRules.cafe
  }
  if (key.includes('hair') || key.includes('barber') || key.includes('beauty') || key.includes('parlour')) {
    return industryLoyaltyRules.salon
  }
  if (key.includes('fitness') || key.includes('crossfit') || key.includes('yoga')) {
    return industryLoyaltyRules.gym
  }
  if (key.includes('cloth') || key.includes('apparel') || key.includes('garment') || key.includes('boutique')) {
    return industryLoyaltyRules.retail
  }
  if (key.includes('kirana') || key.includes('mart') || key.includes('supermarket')) {
    return industryLoyaltyRules.grocery
  }
  if (key.includes('med') || key.includes('drug') || key.includes('chemist') || key.includes('clinic')) {
    return industryLoyaltyRules.pharmacy
  }

  return industryLoyaltyRules.bakery
}

/**
 * Backward compatibility with existing IndustryCampaign callers.
 */
export const industryCampaigns: Record<string, IndustryCampaign> = Object.fromEntries(
  Object.entries(industryLoyaltyRules).map(([k, r]) => [
    k,
    {
      industry: r.industry,
      rewardName: r.rewardName,
      totalStamps: r.stampsRequired,
      minimumPurchase: r.stampValue,
      emoji: r.emoji,
      description: r.description,
    },
  ])
)

export function getRecommendedCampaign(businessType?: string | null): IndustryCampaign {
  const rule = getIndustryLoyaltyRule(businessType)
  return {
    industry: rule.industry,
    rewardName: rule.rewardName,
    totalStamps: rule.stampsRequired,
    minimumPurchase: rule.stampValue,
    emoji: rule.emoji,
    description: rule.description,
  }
}

