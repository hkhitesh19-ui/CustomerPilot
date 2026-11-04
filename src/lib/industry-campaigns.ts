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
    rewardName: '500g Free Cake',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '🎂',
    description: '10 visits (Min ₹300) = 500g Free Cake',
    getCardTitle: (b) => `${b || 'Cake Shop'} VIP Club`,
  },
  restaurant: {
    industry: 'Restaurant & Dine-in',
    categoryKey: 'restaurant',
    rewardName: 'Free Butter Naan / Starter',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '🍽️',
    description: '10 visits (Min ₹300) = Free Butter Naan / Starter',
    getCardTitle: (b) => `${b || 'Restaurant'} VIP Club`,
  },
  cafe: {
    industry: 'Café & Coffee Shop',
    categoryKey: 'cafe',
    rewardName: 'Free Specialty Coffee',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '☕',
    description: '10 visits (Min ₹300) = Free Specialty Coffee',
    getCardTitle: (b) => `${b || 'Café'} VIP Club`,
  },
  salon: {
    industry: 'Salon & Beauty Parlour',
    categoryKey: 'salon',
    rewardName: 'Free Haircut / Styling',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '💇',
    description: '10 visits (Min ₹300) = Free Haircut / Styling',
    getCardTitle: (b) => `${b || 'Salon'} VIP Beauty Pass`,
  },
  spa: {
    industry: 'Spa & Wellness',
    categoryKey: 'spa',
    rewardName: 'Free Head Massage / Aromatherapy',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '💆',
    description: '10 visits (Min ₹300) = Free Head Massage',
    getCardTitle: (b) => `${b || 'Spa'} Wellness VIP Pass`,
  },
  gym: {
    industry: 'Gym & Fitness Center',
    categoryKey: 'gym',
    rewardName: 'Free 1 Month Membership Extension',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '🏋️',
    description: '10 visits (Min ₹300) = Free 1 Month Extension',
    getCardTitle: (b) => `${b || 'Fitness'} VIP Club`,
  },
  retail: {
    industry: 'Retail & Clothing Store',
    categoryKey: 'retail',
    rewardName: '₹200 Shopping Voucher',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '🛍️',
    description: '10 purchases (Min ₹300) = ₹200 Shopping Voucher',
    getCardTitle: (b) => `${b || 'Store'} VIP Shopper Pass`,
  },
  grocery: {
    industry: 'Grocery & Kirana Store',
    categoryKey: 'grocery',
    rewardName: '₹100 Instant Grocery Discount',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '🥬',
    description: '10 visits (Min ₹300) = ₹100 Discount',
    getCardTitle: (b) => `${b || 'Grocery'} VIP Savings Club`,
  },
  pharmacy: {
    industry: 'Pharmacy & Chemist',
    categoryKey: 'pharmacy',
    rewardName: 'Free Health Checkup / ₹150 Voucher',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '💊',
    description: '10 purchases (Min ₹300) = Free Health Checkup',
    getCardTitle: (b) => `${b || 'Pharmacy'} Health Care Club`,
  },
  electronics: {
    industry: 'Electronics & Mobile Shop',
    categoryKey: 'electronics',
    rewardName: 'Free Tempered Glass / ₹250 Accessory Voucher',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    color: '#6366f1',
    emoji: '📱',
    description: '10 purchases (Min ₹300) = Free Accessory Voucher',
    getCardTitle: (b) => `${b || 'Electronics'} Tech VIP Club`,
  },
  other: {
    industry: 'Local Business',
    categoryKey: 'other',
    rewardName: 'Special VIP Surprise Gift',
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
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

  // Common aliases across Top 10 Recommended Categories
  if (key.includes('cake') || key.includes('sweet') || key.includes('dessert') || key.includes('pastry') || key.includes('bakery')) {
    return industryLoyaltyRules.bakery
  }
  if (key.includes('southindian') || key.includes('dosa') || key.includes('fastfood') || key.includes('pizza') || key.includes('burger')) {
    return {
      industry: 'South Indian & Fast Food',
      categoryKey: 'south_indian_fastfood',
      rewardName: 'Free Special Dosa / Pizza Slice',
      stampsRequired: 6,
      stampValue: 180,
      validityDays: 180,
      googleReviewBonus: 1,
      photoBonus: 1,
      joiningBonusEnabled: true,
      joiningBonusStamps: 1,
      vipUpgradeBonusStamps: 2,
      color: '#ea580c',
      emoji: '🥞',
      description: '6 visits (Min ₹180) = Free Special Dosa / Pizza Slice',
      getCardTitle: (b) => `${b || 'Fast Food'} VIP Club`,
    }
  }
  if (key.includes('food') || key.includes('dine') || key.includes('dhaba') || key.includes('bhojnalay') || key.includes('restaurant') || key.includes('punjabi')) {
    return industryLoyaltyRules.restaurant
  }
  if (key.includes('coffee') || key.includes('tea') || key.includes('chai') || key.includes('cafe')) {
    return industryLoyaltyRules.cafe
  }
  if (key.includes('wash') || key.includes('car') || key.includes('auto') || key.includes('detailing')) {
    return {
      industry: 'Car Wash & Auto Detailing',
      categoryKey: 'car_wash',
      rewardName: 'Free Snow Foam Wash & Vacuum',
      stampsRequired: 4,
      stampValue: 350,
      validityDays: 180,
      googleReviewBonus: 1,
      photoBonus: 1,
      joiningBonusEnabled: true,
      joiningBonusStamps: 1,
      vipUpgradeBonusStamps: 2,
      color: '#0284c7',
      emoji: '🚗',
      description: '4 visits = Free Snow Foam Wash & Vacuum',
      getCardTitle: (b) => `${b || 'Auto Detailing'} VIP Club`,
    }
  }
  if (key.includes('coach') || key.includes('tuition') || key.includes('class') || key.includes('school') || key.includes('education') || key.includes('hobby')) {
    return {
      industry: 'Coaching & Education',
      categoryKey: 'coaching_classes',
      rewardName: 'Free Test Series / Subject Workshop',
      stampsRequired: 4,
      stampValue: 500,
      validityDays: 180,
      googleReviewBonus: 1,
      photoBonus: 1,
      joiningBonusEnabled: true,
      joiningBonusStamps: 1,
      vipUpgradeBonusStamps: 2,
      color: '#4f46e5',
      emoji: '📚',
      description: '4 months = Free Test Series / Subject Workshop',
      getCardTitle: (b) => `${b || 'Academy'} VIP Scholar Pass`,
    }
  }
  if (key.includes('dental') || key.includes('clinic') || key.includes('doctor') || key.includes('health') || key.includes('hospital')) {
    return {
      industry: 'Dental & Healthcare Clinic',
      categoryKey: 'dental_clinic',
      rewardName: 'Free Teeth Polishing / Consultation Off',
      stampsRequired: 3,
      stampValue: 500,
      validityDays: 180,
      googleReviewBonus: 1,
      photoBonus: 1,
      joiningBonusEnabled: true,
      joiningBonusStamps: 1,
      vipUpgradeBonusStamps: 2,
      color: '#059669',
      emoji: '🩺',
      description: '3 visits = Free Teeth Polishing / Consultation Off',
      getCardTitle: (b) => `${b || 'Clinic'} Health VIP Pass`,
    }
  }
  if (key.includes('barber') || key.includes('menssalon') || key.includes('grooming') || key.includes('fade')) {
    return {
      industry: "Men's Salon & Grooming",
      categoryKey: 'mens_salon',
      rewardName: 'Free Relaxing Head Massage or D-Tan',
      stampsRequired: 5,
      stampValue: 200,
      validityDays: 180,
      googleReviewBonus: 1,
      photoBonus: 1,
      joiningBonusEnabled: true,
      joiningBonusStamps: 1,
      vipUpgradeBonusStamps: 2,
      color: '#0284c7',
      emoji: '✂️',
      description: '5 visits (Min ₹200) = Free Head Massage or D-Tan',
      getCardTitle: (b) => `${b || 'Grooming'} VIP Club`,
    }
  }
  if (key.includes('hair') || key.includes('beauty') || key.includes('parlour') || key.includes('parlor') || key.includes('spa') || key.includes('unisex') || key.includes('makeup')) {
    return industryLoyaltyRules.salon
  }
  if (key.includes('fitness') || key.includes('crossfit') || key.includes('yoga') || key.includes('gym') || key.includes('pilates')) {
    return industryLoyaltyRules.gym
  }
  if (key.includes('cloth') || key.includes('apparel') || key.includes('garment') || key.includes('boutique') || key.includes('jewel') || key.includes('footwear') || key.includes('retail')) {
    return industryLoyaltyRules.retail
  }
  if (key.includes('kirana') || key.includes('mart') || key.includes('supermarket') || key.includes('grocery')) {
    return industryLoyaltyRules.grocery
  }
  if (key.includes('med') || key.includes('drug') || key.includes('chemist')) {
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

