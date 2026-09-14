// Master Plans & Coupons Canonical Definition and Self-Healing Auto-Seeder
// Ensures database ALWAYS has all 9 subscription plans and active coupons even after fresh resets or DB wipes.

export interface MasterPlanDefinition {
  planKey: string
  name: string
  description: string
  days: number
  price: number
  originalPrice: number
  discountPercent: number
  badge: string
  popular: boolean
  features: string[]
  enabledModules: string
  active: boolean
}

export interface MasterCouponDefinition {
  code: string
  description: string
  discountType: string
  discountValue: number
  minOrderAmount: number
  maxDiscount?: number
  maxUses: number
  active: boolean
}

export const MASTER_PLANS: MasterPlanDefinition[] = [
  // ─── CustomerPilot Complete Capacity Plans ───
  {
    planKey: "growth_180",
    name: "Starter Growth Plan (CustomerPilot Complete) (6 Months)",
    description: "Full CustomerPilot Complete suite for up to 1,000 VIP customers (₹10/day).",
    days: 180,
    price: 1749,
    originalPrice: 3499,
    discountPercent: 50,
    badge: "Complete (6 Mo)",
    popular: false,
    features: [
      "Up to 1,000 VIP Customers",
      "Unlimited WhatsApp Stamps",
      "AI Google Review 5-Star Filter",
      "1-Click Google Maps AutoReply",
      "Automated 30/60/90 Day Win-Backs",
      "Printable Counter Standee",
      "Basic Morning Intelligence"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
    active: true
  },
  {
    planKey: "enterprise_365",
    name: "Pro Scaling Plan (CustomerPilot Complete) (1 Year)",
    description: "Full CustomerPilot Complete suite for up to 2,500 VIP customers (₹6.2/day).",
    days: 365,
    price: 2249,
    originalPrice: 4499,
    discountPercent: 50,
    badge: "⭐ Most Popular",
    popular: true,
    features: [
      "Up to 2,500 VIP Customers",
      "365-Day Unlimited Automation",
      "AI Review Reply Generator",
      "Customizable WhatsApp Templates",
      "VIP Tier Upgrades & Bonus Stamps",
      "Live Queue Cashier Tablet Mode",
      "Priority WhatsApp Helpdesk (+91 90333 04707)"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
    active: true
  },
  {
    planKey: "enterprise_unlimited_365",
    name: "Enterprise / upto 5-Outlets (1 Year)",
    description: "Capacity retention system for up to 5 retail outlets & brands (₹14/day).",
    days: 365,
    price: 4999,
    originalPrice: 9999,
    discountPercent: 50,
    badge: "upto 5 Outlets",
    popular: false,
    features: [
      "Up to 5 Retail Outlets Supported",
      "Unlimited VIP Customers",
      "Multi-Outlet Store Switcher",
      "Custom Brand Domain & Logo",
      "Dedicated Account Manager",
      "Custom ERP/POS Sync Assistance",
      "Maximum ROI Guarantee"
    ],
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
    active: true
  },

  // ─── Standalone Service 1: Digital Loyalty Stamps & VIP Club ───
  {
    planKey: "loyalty_6mo",
    name: "Digital Loyalty Stamps & VIP Club — 6 Months",
    description: "WhatsApp digital loyalty stamp card and VIP rewards automation for 6 months (₹3/day).",
    days: 180,
    price: 549,
    originalPrice: 1099,
    discountPercent: 50,
    badge: "Loyalty (6 Mo)",
    popular: false,
    features: [
      "Digital Loyalty Stamp Card",
      "QR Counter Check-In",
      "Birthday Rewards Engine",
      "VIP Tier Upgrades",
      "Automated 30/60/90 Day Win-Backs",
      "Basic Customer Analytics"
    ],
    enabledModules: "LOYALTY",
    active: true
  },
  {
    planKey: "loyalty_yearly",
    name: "Digital Loyalty Stamps & VIP Club — 1 Year",
    description: "Full year of loyalty automation (₹2.2/day Billed yearly).",
    days: 365,
    price: 799,
    originalPrice: 1599,
    discountPercent: 50,
    badge: "Loyalty (1 Year)",
    popular: false,
    features: [
      "Everything in Loyalty 6 Months",
      "365-Day Unlimited Automation",
      "VIP Customer CRM & Export",
      "Custom Store Branding",
      "Priority WhatsApp Support"
    ],
    enabledModules: "LOYALTY",
    active: true
  },

  // ─── Standalone Service 2: Smart Ai (SEO Optimized) Google Reviews ───
  {
    planKey: "reviews_6mo",
    name: "Smart Ai (SEO Optimized) Google Reviews [upto 1000 Reviews] — 6 Months",
    description: "Automated WhatsApp review collection with AI-drafted 5-star reviews [upto 1000 reviews] (₹3/day).",
    days: 180,
    price: 549,
    originalPrice: 1099,
    discountPercent: 50,
    badge: "Reviews (6 Mo)",
    popular: false,
    features: [
      "Up to 1,000 Reviews Collection",
      "WhatsApp Review Request Automation",
      "AI-Drafted Customer Reviews",
      "5-Star Review Filter",
      "Google Maps Deep Link",
      "Review Analytics Dashboard"
    ],
    enabledModules: "REVIEWS",
    active: true
  },
  {
    planKey: "reviews_yearly",
    name: "Smart Ai (SEO Optimized) Google Reviews [upto 2500 Reviews] — 1 Year",
    description: "Full year automated review collection [upto 2500 reviews] (₹2.2/day Billed yearly).",
    days: 365,
    price: 799,
    originalPrice: 1599,
    discountPercent: 50,
    badge: "Reviews (1 Year)",
    popular: false,
    features: [
      "Up to 2,500 Reviews Collection",
      "Everything in Reviews 6 Months",
      "365-Day Unlimited Review Collection",
      "Priority WhatsApp Delivery",
      "Review Sentiment Reports"
    ],
    enabledModules: "REVIEWS",
    active: true
  },

  // ─── Standalone Service 3: Ai Drafted (SEO Optimized) 1-Click AutoReply ───
  {
    planKey: "autoreply_6mo",
    name: "Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews — 6 Months",
    description: "AI-powered Google review replies published in 1-Click to Google Maps for 6 months (₹3/day).",
    days: 180,
    price: 549,
    originalPrice: 1099,
    discountPercent: 50,
    badge: "AutoReply (6 Mo)",
    popular: false,
    features: [
      "Google Business Profile Connect",
      "Smart AI Context-Aware Replies",
      "1-Click Publish to Google Maps",
      "Smart Sentiment Adaptation",
      "Bulk Reply Engine",
      "Review Sync Dashboard"
    ],
    enabledModules: "AUTOREPLY",
    active: true
  },
  {
    planKey: "autoreply_yearly",
    name: "Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews — 1 Year",
    description: "Full year of AI review replies published in 1-Click to Google Maps (₹2.2/day Billed yearly).",
    days: 365,
    price: 799,
    originalPrice: 1599,
    discountPercent: 50,
    badge: "AutoReply (1 Year)",
    popular: false,
    features: [
      "Everything in AutoReply 6 Months",
      "365-Day Unlimited AI Replies",
      "Dead-Letter Queue Safety",
      "Multi-Location Google Support"
    ],
    enabledModules: "AUTOREPLY",
    active: true
  }
]

export const MASTER_COUPONS: MasterCouponDefinition[] = [
  {
    code: "CP99",
    description: "Special ₹99 Founder Test Pass (Pay only ₹99)",
    discountType: "fixed",
    discountValue: 1650,
    minOrderAmount: 99,
    maxUses: 1000,
    active: true
  },
  {
    code: "WELCOME20",
    description: "20% off on any subscription plan",
    discountType: "percent",
    discountValue: 20,
    minOrderAmount: 500,
    maxDiscount: 2000,
    maxUses: 500,
    active: true
  },
  {
    code: "LAUNCH50",
    description: "Special 50% discount for early adopters",
    discountType: "percent",
    discountValue: 50,
    minOrderAmount: 900,
    maxDiscount: 5000,
    maxUses: 100,
    active: true
  },
  {
    code: "FLAT500",
    description: "Flat ₹500 discount on 6-Month or 1-Year plans",
    discountType: "fixed",
    discountValue: 500,
    minOrderAmount: 1500,
    maxUses: 200,
    active: true
  }
]

/**
 * Ensures the database contains all master plans and canonical coupons.
 * Runs idempotently in <15ms. If plans are missing, upserts them.
 */
export async function ensureMasterPlans(prismaClient: any): Promise<{ seededPlans: number; seededCoupons: number }> {
  let seededPlans = 0
  let seededCoupons = 0

  try {
    for (const p of MASTER_PLANS) {
      const existing = await prismaClient.plan.findFirst({
        where: { OR: [{ planKey: p.planKey }, { name: p.name }] }
      })

      const dataToSave = {
        planKey: p.planKey,
        name: p.name,
        description: p.description,
        days: p.days,
        price: p.price,
        originalPrice: p.originalPrice,
        discountPercent: p.discountPercent,
        badge: p.badge,
        popular: p.popular,
        currency: "INR",
        features: JSON.stringify(p.features),
        enabledModules: p.enabledModules,
        active: p.active
      }

      if (existing) {
        // Ensure active and planKey are populated
        if (!existing.active || !existing.planKey) {
          await prismaClient.plan.update({
            where: { id: existing.id },
            data: dataToSave
          })
          seededPlans++
        }
      } else {
        await prismaClient.plan.create({
          data: dataToSave
        })
        seededPlans++
      }
    }

    // Also ensure canonical coupons (including CP99) exist
    for (const c of MASTER_COUPONS) {
      const existingCoupon = await prismaClient.coupon.findUnique({
        where: { code: c.code }
      })

      if (!existingCoupon) {
        await prismaClient.coupon.create({
          data: {
            code: c.code,
            description: c.description,
            discountType: c.discountType,
            discountValue: c.discountValue,
            minOrderAmount: c.minOrderAmount,
            maxDiscount: c.maxDiscount,
            maxUses: c.maxUses,
            active: c.active
          }
        })
        seededCoupons++
      }
    }
  } catch (err: any) {
    console.error("[ensureMasterPlans] Error during self-healing seed:", err?.message || err)
  }

  return { seededPlans, seededCoupons }
}
