export interface IndustryCampaign {
  industry: string
  rewardName: string
  totalStamps: number
  minimumPurchase: number
  emoji: string
  description: string
}

export const industryCampaigns: Record<string, IndustryCampaign> = {
  restaurant: { industry: 'Restaurant', rewardName: 'Free Butter Naan', totalStamps: 10, minimumPurchase: 300, emoji: '🍽️', description: '10 visits = Free Butter Naan (Min ₹300 per visit)' },
  bakery: { industry: 'Bakery', rewardName: 'Free Cake Slice', totalStamps: 8, minimumPurchase: 200, emoji: '🎂', description: '8 visits = Free Cake Slice (Min ₹200 per visit)' },
  cafe: { industry: 'Café', rewardName: 'Free Coffee', totalStamps: 10, minimumPurchase: 150, emoji: '☕', description: '10 visits = Free Coffee (Min ₹150 per visit)' },
  salon: { industry: 'Salon', rewardName: 'Free Haircut', totalStamps: 6, minimumPurchase: 500, emoji: '💇', description: '6 visits = Free Haircut (Min ₹500 per visit)' },
  spa: { industry: 'Spa', rewardName: 'Free Head Massage', totalStamps: 5, minimumPurchase: 800, emoji: '💆', description: '5 visits = Free Head Massage (Min ₹800 per visit)' },
  gym: { industry: 'Gym/Fitness', rewardName: 'Free Month Extension', totalStamps: 12, minimumPurchase: 0, emoji: '🏋️', description: '12 check-ins = Free Month Extension' },
  retail: { industry: 'Retail Store', rewardName: '₹200 Shopping Voucher', totalStamps: 10, minimumPurchase: 500, emoji: '🛍️', description: '10 purchases = ₹200 Shopping Voucher (Min ₹500 per visit)' },
  grocery: { industry: 'Grocery/Kirana', rewardName: '₹100 Discount', totalStamps: 15, minimumPurchase: 200, emoji: '🥬', description: '15 visits = ₹100 Discount (Min ₹200 per visit)' },
  pharmacy: { industry: 'Pharmacy', rewardName: 'Free Health Checkup', totalStamps: 10, minimumPurchase: 300, emoji: '💊', description: '10 purchases = Free Health Checkup (Min ₹300 per visit)' },
}

export function getRecommendedCampaign(businessType?: string | null): IndustryCampaign {
  if (!businessType) return industryCampaigns.restaurant // default
  const key = businessType.toLowerCase().replace(/[^a-z]/g, '')
  // fuzzy match
  for (const [k, v] of Object.entries(industryCampaigns)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return industryCampaigns.restaurant // fallback
}
