export const DEFAULT_10_LOYALTY_CATEGORIES = [
  "VIP",         // Level 1: 0 completed cards (Default on Registration)
  "Silver",      // Level 2: 1 completed card
  "Gold",        // Level 3: 2 completed cards
  "Platinum",    // Level 4: 3 completed cards
  "Diamond",     // Level 5: 4 completed cards
  "Royal",       // Level 6: 5 completed cards
  "Elite",       // Level 7: 6 completed cards
  "Prestige",    // Level 8: 7 completed cards
  "Ambassador",  // Level 9: 8 completed cards
  "Legend"       // Level 10: 9+ completed cards
]

export function parseMerchantLoyaltyCategories(jsonString?: string | null): string[] {
  if (!jsonString) return DEFAULT_10_LOYALTY_CATEGORIES
  try {
    const parsed = JSON.parse(jsonString)
    if (Array.isArray(parsed) && parsed.length >= 10) {
      return parsed.map((item, idx) => String(item || DEFAULT_10_LOYALTY_CATEGORIES[idx]).trim())
    }
  } catch {}
  return DEFAULT_10_LOYALTY_CATEGORIES
}

export function resolveLoyaltyCategoryName(
  jsonString: string | null | undefined,
  completedCyclesCount: number
): string {
  const categories = parseMerchantLoyaltyCategories(jsonString)
  const index = Math.min(Math.max(0, completedCyclesCount), categories.length - 1)
  return categories[index] || DEFAULT_10_LOYALTY_CATEGORIES[index] || "VIP"
}

export async function updateCustomerLoyaltyCategory(merchantId: string, customerId: string): Promise<string> {
  const { db } = await import("@/lib/db")

  const merchant = await db.merchant.findUnique({
    where: { id: merchantId },
    select: { loyaltyCategoryNames: true }
  })

  // Count how many completed stamp cards this customer has
  const completedCardsCount = await db.customerStampCard.count({
    where: { merchantId, customerId, completed: true }
  })

  const newCategoryName = resolveLoyaltyCategoryName(merchant?.loyaltyCategoryNames, completedCardsCount)

  await db.customer.update({
    where: { id: customerId },
    data: { vipTier: newCategoryName }
  })

  return newCategoryName
}
