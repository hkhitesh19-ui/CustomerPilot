// CustomerPilot V6 — VIP Tier Engine
// Assigns customers to tiers based on lifetimeSpend thresholds.
// VIP tiers give a stamp bonus multiplier and exclusive perks.

export type VipTierName = "none" | "silver" | "gold" | "platinum"

export interface VipTierConfig {
  name: VipTierName
  minLifetimeSpend: number
  bonusMultiplier: number // 1.0 = no bonus, 1.2 = +20% stamps
  perks: string[]
  color: string
}

export const DEFAULT_VIP_TIERS: VipTierConfig[] = [
  {
    name: "none",
    minLifetimeSpend: 0,
    bonusMultiplier: 1.0,
    perks: ["Standard stamp earning"],
    color: "stone",
  },
  {
    name: "silver",
    minLifetimeSpend: 2000,
    bonusMultiplier: 1.1,
    perks: ["10% bonus stamps on every bill", "Priority WhatsApp support"],
    color: "stone",
  },
  {
    name: "gold",
    minLifetimeSpend: 5000,
    bonusMultiplier: 1.2,
    perks: ["20% bonus stamps on every bill", "Free birthday reward", "Early access to new items"],
    color: "amber",
  },
  {
    name: "platinum",
    minLifetimeSpend: 10000,
    bonusMultiplier: 1.5,
    perks: ["50% bonus stamps on every bill", "Free birthday reward", "Monthly surprise gift", "Skip-the-queue priority"],
    color: "purple",
  },
]

export function getVipTierForSpend(lifetimeSpend: number): VipTierConfig {
  const tiers = [...DEFAULT_VIP_TIERS].sort((a, b) => b.minLifetimeSpend - a.minLifetimeSpend)
  return tiers.find((t) => lifetimeSpend >= t.minLifetimeSpend) ?? DEFAULT_VIP_TIERS[0]
}

/**
 * @deprecated DO NOT use this function to calculate or award bonus stamps in award/route.ts.
 * Bonus stamps are ONLY awarded inside award/route.ts on Loyalty Level/Card completion (isCardFinished).
 * Spend thresholds ONLY control display category tier names, NOT stamp counts.
 */
export function applyVipBonusStamps(baseStamps: number, tier: VipTierConfig): number {
  // Round down — never inflate.
  return Math.floor(baseStamps * tier.bonusMultiplier)
}

export const VIP_TIER_LABELS: Record<VipTierName, string> = {
  none: "Regular",
  silver: "Silver Member",
  gold: "Gold Member",
  platinum: "Platinum VIP",
}

export const VIP_TIER_ICONS: Record<VipTierName, string> = {
  none: "👤",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
}
