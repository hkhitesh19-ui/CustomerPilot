"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check, Sparkles, Shield, Crown, Zap, Gift, Star, Users, ArrowRight,
  Database, HelpCircle, CheckCircle2, Lock, Award, HeartHandshake, Flame,
  ShieldCheck, RefreshCw, MessageSquare, Edit3, Save, CheckSquare, Square,
  Layers, ChevronRight, Tag, Sliders, Info, AlertCircle, ShoppingBag, Eye,
  ChevronDown, ChevronUp, PhoneCall, QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export interface PlanItem {
  id?: string
  planKey?: string
  name: string
  description?: string
  days: number
  price: number
  originalPrice?: number
  discountPercent?: number
  badge?: string
  popular?: boolean
  features: string[]
  enabledModules?: string
  active?: boolean
}

export interface PricingStudioProps {
  mode?: "public" | "superadmin" | "merchant"
  theme?: "light" | "dark"
  initialPlans?: PlanItem[]
  showAdminToggle?: boolean
  selectedPlanId?: string
  onSelectPlan?: (plan: PlanItem, bundleMeta?: any) => void
  onCheckout?: (plan: PlanItem) => void
  merchantId?: string
  currentPlanName?: string
  daysRemaining?: number
  isExpired?: boolean
}

// Canonical product definitions with keys & outcome markers
export interface ProductModule {
  id: "card" | "loyalty" | "reviews" | "autoreply"
  name: string
  shortTitle: string
  icon: string
  badge: string
  tagline: string
  description: string
  features: string[]
  planKey6Mo: string
  planKey1Yr: string
  planKeyLifetime?: string
  defaultPrice6Mo: number
  defaultMrp6Mo: number
  defaultPrice1Yr: number
  defaultMrp1Yr: number
  defaultPriceLifetime?: number
  defaultMrpLifetime?: number
}

export const PRODUCT_MODULES: ProductModule[] = [
  {
    id: "card",
    name: "Smart Digital Business Card",
    shortTitle: "Smart Digital Card",
    icon: "🪪",
    badge: "Instant 2-Min Setup",
    tagline: "1-Tap Contact Save (.vcf) + Direct Google Reviews + Ordering Links",
    description: "Interactive digital business card. 1-Tap save contact to mobile phonebook, instant 5-star Google review trigger, and online ordering catalog.",
    features: [
      "1-Tap Save Contact (vCard .vcf phonebook sync)",
      "Direct 5-Star Google Reviews Submission Modal",
      "WhatsApp Chat & Direct Calling Connect",
      "Google Maps Turn-by-Turn Navigation",
      "Online Ordering Links (Zomato / Swiggy / Catalog)",
      "Printable High-Resolution QR Code"
    ],
    planKey6Mo: "card_6mo",
    planKey1Yr: "card_yearly",
    planKeyLifetime: "card_lifetime",
    defaultPrice6Mo: 349,
    defaultMrp6Mo: 699,
    defaultPrice1Yr: 499,
    defaultMrp1Yr: 1199,
    defaultPriceLifetime: 1499,
    defaultMrpLifetime: 3999
  },
  {
    id: "loyalty",
    name: "Digital Loyalty Stamps & VIP Club",
    shortTitle: "Loyalty Stamps & VIP",
    icon: "🎁",
    badge: "Repeat Visit Engine",
    tagline: "WhatsApp Digital Stamp Cards & Automated Birthday Rewards",
    description: "Turns first-time customers into lifetime regulars with WhatsApp digital stamp cards, automated rewards, and inactive customer win-backs.",
    features: [
      "Digital WhatsApp Stamp Card (No App Download)",
      "Cashier 1-Tap Counter Check-In Mode",
      "Automated Birthday & Anniversary Rewards Engine",
      "14 & 30-Day Inactive Customer Win-Back Reminders",
      "VIP Tier Upgrades & Exclusive Member Discounts",
      "Real-Time Merchant Analytics & Stamp Ledger"
    ],
    planKey6Mo: "loyalty_6mo",
    planKey1Yr: "loyalty_yearly",
    defaultPrice6Mo: 549,
    defaultMrp6Mo: 1099,
    defaultPrice1Yr: 799,
    defaultMrp1Yr: 1599
  },
  {
    id: "reviews",
    name: "Smart Ai (SEO Optimized) Google Reviews",
    shortTitle: "Smart AI Google Reviews",
    icon: "⭐",
    badge: "Local SEO Growth",
    tagline: "WhatsApp Post-Purchase Prompts + 10 Retail Fallback Categories",
    description: "Collect authentic 5-star Google reviews on WhatsApp with zero effort. Built with anti-AI detection and local SEO entity keywords for top Google Maps ranking.",
    features: [
      "Post-Purchase WhatsApp Review Request Engine",
      "Smart 3-Angle Psychology Review Suggestions",
      "10 Local Retail Category SEO Entity Libraries",
      "+2 Bonus Stamps Reward for Photo Uploads",
      "1-Click Direct Copy & Post to Google Maps",
      "Google Maps Local 3-Pack SEO Ranking Booster"
    ],
    planKey6Mo: "reviews_6mo",
    planKey1Yr: "reviews_yearly",
    defaultPrice6Mo: 549,
    defaultMrp6Mo: 1099,
    defaultPrice1Yr: 799,
    defaultMrp1Yr: 1599
  },
  {
    id: "autoreply",
    name: "Ai Drafted (SEO Optimized) 1-Click AutoReply",
    shortTitle: "1-Click AutoReply",
    icon: "💬",
    badge: "Owner Assistant Mode",
    tagline: "Smart Context Responses & 1-Click Google Maps Publish",
    description: "Never leave customer Google reviews unacknowledged. AI crafts warm, appreciative, context-aware owner replies ready to publish in 1 tap.",
    features: [
      "Instant Google Business Profile Review Sync",
      "Context-Aware Appreciation Reply Generator",
      "Sentiment Adaptation (5-Star Gratitude & Critical Care)",
      "1-Click Publish to Live Google Maps Listing",
      "Zero Repetitive Clichés or AI Hallucinations",
      "Owner Review Management Dashboard"
    ],
    planKey6Mo: "autoreply_6mo",
    planKey1Yr: "autoreply_yearly",
    defaultPrice6Mo: 549,
    defaultMrp6Mo: 1099,
    defaultPrice1Yr: 799,
    defaultMrp1Yr: 1599
  }
]

export function PricingStudio({
  mode = "public",
  theme = "light",
  initialPlans = [],
  showAdminToggle = false,
  selectedPlanId,
  onSelectPlan,
  onCheckout,
  merchantId,
  currentPlanName,
  daysRemaining,
  isExpired
}: PricingStudioProps) {
  const { toast } = useToast()
  const isDark = theme === "dark"

  // Live plans state
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans)
  const [loading, setLoading] = useState(initialPlans.length === 0)
  const [savingPlans, setSavingPlans] = useState(false)

  // SuperAdmin edit mode toggle
  const [adminEditMode, setAdminEditMode] = useState(false)

  // Global billing cycle: "1year" (50% OFF, default) vs "6mo"
  const [billingCycle, setBillingCycle] = useState<"6mo" | "1year">("1year")

  // Selected standalone engine tool (for Card 3)
  const [selectedStandaloneTool, setSelectedStandaloneTool] = useState<"loyalty" | "reviews" | "autoreply">("loyalty")

  // Collapsible Custom Bundle Builder state
  const [showBundleBuilder, setShowBundleBuilder] = useState(false)

  // Bundle builder multi-select state
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({
    card: true,
    loyalty: true,
    reviews: true,
    autoreply: true
  })

  // Fetch plans if not provided
  useEffect(() => {
    if (initialPlans.length > 0) {
      setPlans(initialPlans)
      setLoading(false)
      return
    }

    setLoading(true)
    fetch("/api/pricing/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.data?.plans)) {
          setPlans(data.data.plans)
        }
      })
      .catch((err) => {
        console.error("[PricingStudio] Failed to fetch plans:", err)
      })
      .finally(() => setLoading(false))
  }, [initialPlans])

  // Helper to get active plan record by planKey
  const getPlanByKey = (key: string): PlanItem | undefined => {
    return plans.find((p) => p.planKey === key)
  }

  // Get price for a specific product and tenure
  const getProductPrice = (mod: ProductModule, tenure: "6mo" | "1year" | "lifetime") => {
    if (tenure === "lifetime") {
      if (mod.id === "card") {
        const p = getPlanByKey(mod.planKeyLifetime || "card_lifetime")
        return {
          price: p ? p.price : (mod.defaultPriceLifetime || 1499),
          mrp: p?.originalPrice ? p.originalPrice : (mod.defaultMrpLifetime || 3999),
          plan: p
        }
      }
      const p = getPlanByKey(mod.planKey1Yr)
      return {
        price: p ? p.price : mod.defaultPrice1Yr,
        mrp: p?.originalPrice ? p.originalPrice : mod.defaultMrp1Yr,
        plan: p
      }
    }

    if (tenure === "6mo") {
      const p = getPlanByKey(mod.planKey6Mo)
      return {
        price: p ? p.price : mod.defaultPrice6Mo,
        mrp: p?.originalPrice ? p.originalPrice : mod.defaultMrp6Mo,
        plan: p
      }
    }

    // 1year
    const p = getPlanByKey(mod.planKey1Yr)
    return {
      price: p ? p.price : mod.defaultPrice1Yr,
      mrp: p?.originalPrice ? p.originalPrice : mod.defaultMrp1Yr,
      plan: p
    }
  }

  // Save updated plans to backend
  const handleSaveAllPlans = async () => {
    setSavingPlans(true)
    try {
      const res = await fetch("/api/pricing/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans })
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to update plans")

      toast({
        title: "Pricing Saved! 🚀",
        description: "Updated pricing live across Main Website, SuperAdmin & Merchant Panels."
      })
    } catch (e: any) {
      toast({
        title: "Save Failed",
        description: e.message || "Could not persist pricing",
        variant: "destructive"
      })
    } finally {
      setSavingPlans(false)
    }
  }

  // Handle local plan field change in SuperAdmin
  const handlePlanChange = (planKey: string, field: keyof PlanItem, value: any) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.planKey === planKey) {
          return { ...p, [field]: value }
        }
        return p
      })
    )
  }

  // Toggle selection of a product in bundle builder
  const toggleModule = (id: string) => {
    setSelectedModules((prev) => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Canonical Complete Pro Suite plans
  const complete6MoPlan = getPlanByKey("growth_180")
  const complete1YrPlan = getPlanByKey("enterprise_365")

  const completePrice6Mo = complete6MoPlan ? complete6MoPlan.price : 1749
  const completeMrp6Mo = complete6MoPlan?.originalPrice || 3499
  const completePrice1Yr = complete1YrPlan ? complete1YrPlan.price : 2249
  const completeMrp1Yr = complete1YrPlan?.originalPrice || 4499

  // Digital Card Plan
  const card6MoPlan = getPlanByKey("card_6mo")
  const card1YrPlan = getPlanByKey("card_yearly")
  const cardPrice6Mo = card6MoPlan ? card6MoPlan.price : 349
  const cardMrp6Mo = card6MoPlan?.originalPrice || 699
  const cardPrice1Yr = card1YrPlan ? card1YrPlan.price : 499
  const cardMrp1Yr = card1YrPlan?.originalPrice || 1199

  // Selected Standalone Tool Plan
  const currentStandaloneMod = PRODUCT_MODULES.find((m) => m.id === selectedStandaloneTool)!
  const standalonePriceData = getProductPrice(currentStandaloneMod, billingCycle)

  // Bundle calculations for the expandable drawer
  const bundleCalculation = useMemo(() => {
    const selectedCount = Object.values(selectedModules).filter(Boolean).length
    const hasCard = selectedModules.card
    const hasLoyalty = selectedModules.loyalty
    const hasReviews = selectedModules.reviews
    const hasAutoReply = selectedModules.autoreply
    const hasCompleteTrio = hasLoyalty && hasReviews && hasAutoReply

    let standaloneSumPrice = 0
    let standaloneSumMrp = 0

    PRODUCT_MODULES.forEach((mod) => {
      if (selectedModules[mod.id]) {
        const pricing = getProductPrice(mod, billingCycle)
        standaloneSumPrice += pricing.price
        standaloneSumMrp += pricing.mrp
      }
    })

    let bundleOfferPrice = standaloneSumPrice
    let bundleTotalMrp = standaloneSumMrp
    let appliedBundleBadge = ""
    let matchedPlan: PlanItem | null = null

    if (billingCycle === "6mo") {
      if (hasCard && hasCompleteTrio) {
        bundleOfferPrice = 1999
        bundleTotalMrp = completeMrp6Mo + 699
        appliedBundleBadge = "🔥 4-in-1 All-Inclusive Bundle Deal"
        matchedPlan = complete6MoPlan || null
      } else if (hasCompleteTrio) {
        bundleOfferPrice = completePrice6Mo
        bundleTotalMrp = completeMrp6Mo
        appliedBundleBadge = "⭐ CustomerPilot Complete (3-in-1)"
        matchedPlan = complete6MoPlan || null
      } else if (selectedCount === 1) {
        const singleMod = PRODUCT_MODULES.find((m) => selectedModules[m.id])
        if (singleMod) {
          const p = getPlanByKey(singleMod.planKey6Mo)
          matchedPlan = p || null
        }
      }
    } else {
      // 1year
      if (hasCard && hasCompleteTrio) {
        bundleOfferPrice = completePrice1Yr
        bundleTotalMrp = completeMrp1Yr + 1199
        appliedBundleBadge = "👑 Ultimate Growth Bundle (All 4 Products)"
        matchedPlan = complete1YrPlan || null
      } else if (hasCompleteTrio) {
        bundleOfferPrice = completePrice1Yr
        bundleTotalMrp = completeMrp1Yr
        appliedBundleBadge = "⭐ Pro Scaling Suite (CustomerPilot Complete)"
        matchedPlan = complete1YrPlan || null
      } else if (selectedCount === 1) {
        const singleMod = PRODUCT_MODULES.find((m) => selectedModules[m.id])
        if (singleMod) {
          const p = getPlanByKey(singleMod.planKey1Yr)
          matchedPlan = p || null
        }
      }
    }

    const totalSavings = Math.max(0, bundleTotalMrp - bundleOfferPrice)
    const savingsPercent = bundleTotalMrp > 0 ? Math.round((totalSavings / bundleTotalMrp) * 100) : 50
    const days = billingCycle === "6mo" ? 180 : 365
    const dailyCost = (bundleOfferPrice / days).toFixed(1)

    return {
      selectedCount,
      standaloneSumPrice,
      standaloneSumMrp,
      bundleOfferPrice,
      bundleTotalMrp,
      totalSavings,
      savingsPercent,
      dailyCost,
      appliedBundleBadge,
      matchedPlan
    }
  }, [selectedModules, billingCycle, plans, completePrice6Mo, completeMrp6Mo, completePrice1Yr, completeMrp1Yr])

  // Plan Selection Handler
  const handleSelectCard = (targetPlan: PlanItem | null, fallbackKey: string) => {
    const finalPlan = targetPlan || getPlanByKey(fallbackKey)
    if (!finalPlan) return

    if (mode === "superadmin") {
      toast({
        title: "SuperAdmin Plan Preview",
        description: `Plan: ${finalPlan.name} (₹${finalPlan.price})`
      })
      return
    }

    if (onSelectPlan) {
      onSelectPlan(finalPlan)
    }
  }

  // Check if a specific plan is currently selected
  const isPlanActive = (planKey6Mo: string, planKey1Yr: string) => {
    const activeKey = billingCycle === "1year" ? planKey1Yr : planKey6Mo
    const currentPlan = getPlanByKey(activeKey)
    return selectedPlanId && currentPlan && selectedPlanId === currentPlan.id
  }

  return (
    <div
      className={`w-full font-sans transition-colors duration-200 ${
        isDark ? "text-slate-100" : "text-slate-900"
      }`}
    >
      {/* ─── HEADER & BILLING TOGGLE ─── */}
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
          Pricing
        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Pick a product, compare tenures, build your bundle — all prices live
        </p>

        {/* SuperAdmin Edit Mode Control Bar */}
        {(showAdminToggle || mode === "superadmin") && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Switch
                id="admin-edit-mode-toggle"
                checked={adminEditMode}
                onCheckedChange={setAdminEditMode}
              />
              <Label
                htmlFor="admin-edit-mode-toggle"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Admin edit mode</span>
              </Label>
              {adminEditMode && (
                <Button
                  size="sm"
                  onClick={handleSaveAllPlans}
                  disabled={savingPlans}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-7 px-3 rounded-xl ml-2 shadow-sm"
                >
                  {savingPlans ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        )}

        {/* SuperAdmin Banner */}
        {adminEditMode && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3 max-w-3xl mx-auto shadow-sm">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Admin Edit Mode Active:</strong> You can edit prices and MRPs directly in the cards below. Click Save Live Prices to persist changes.
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleSaveAllPlans}
              disabled={savingPlans}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 rounded-xl"
            >
              Save Live Prices
            </Button>
          </div>
        )}

        {/* ─── SINGLE UNIFIED BILLING SWITCHER ─── */}
        <div className="pt-2">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle("6mo")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                billingCycle === "6mo"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              6 Months (Semi-Annual)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("1year")}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                billingCycle === "1year"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-950 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>1 Year Pro</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white tracking-wide uppercase">
                50% OFF
              </span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            {billingCycle === "1year" ? "🔥 Flat 50% discount locked on all 1-year plans" : "Standard semi-annual billing (180 days)"}
          </p>
        </div>
      </div>

      {/* ─── THE 3 PRIMARY CARDS (CLEAN & NON-CONFUSING) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-12">
        {/* ──────── CARD 1: SMART DIGITAL CARD ──────── */}
        <Card
          className={`relative rounded-3xl transition-all duration-200 flex flex-col justify-between border ${
            isPlanActive("card_6mo", "card_yearly")
              ? "ring-2 ring-indigo-500 shadow-xl border-indigo-500"
              : isDark
              ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-xl"
          }`}
        >
          <CardHeader className="p-6 sm:p-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🪪</span>
              <Badge variant="outline" className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                Instant 2-Min Setup
              </Badge>
            </div>

            <div>
              <CardTitle className="text-xl font-black tracking-tight">Smart Digital Card</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For shops &amp; owners needing an interactive digital visiting card &amp; menu catalog.
              </CardDescription>
            </div>

            {/* Price Box */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {adminEditMode ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-slate-400">Price (₹):</Label>
                    <Input
                      type="number"
                      value={billingCycle === "1year" ? cardPrice1Yr : cardPrice6Mo}
                      onChange={(e) =>
                        handlePlanChange(
                          billingCycle === "1year" ? "card_yearly" : "card_6mo",
                          "price",
                          Number(e.target.value)
                        )
                      }
                      className="h-7 text-xs bg-slate-950 border-slate-700 w-24 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-slate-400">MRP (₹):</Label>
                    <Input
                      type="number"
                      value={billingCycle === "1year" ? cardMrp1Yr : cardMrp6Mo}
                      onChange={(e) =>
                        handlePlanChange(
                          billingCycle === "1year" ? "card_yearly" : "card_6mo",
                          "originalPrice",
                          Number(e.target.value)
                        )
                      }
                      className="h-7 text-xs bg-slate-950 border-slate-700 w-24"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      ₹{billingCycle === "1year" ? cardPrice1Yr : cardPrice6Mo}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      ₹{billingCycle === "1year" ? cardMrp1Yr : cardMrp6Mo}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {billingCycle === "1year" ? "58% OFF" : "50% OFF"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {billingCycle === "1year" ? "per year (~₹1.3 / day)" : "for 6 months (~₹1.9 / day)"}
                  </p>
                </>
              )}
            </div>

            {/* Feature Bullets */}
            <div className="pt-3 space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Included Features:</p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>1-Tap Save Contact (vCard .vcf to Phonebook)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Direct 5-Star Google Reviews Submission Modal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>WhatsApp Chat &amp; Direct Calling Connect</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Google Maps Turn-by-Turn Navigation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Online Ordering (Zomato / Swiggy / Catalog)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Printable High-Resolution QR Code</span>
                </li>
              </ul>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 pt-0 space-y-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Lifetime deal option:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹1,499 one-time</span>
            </div>

            {mode === "public" ? (
              <Link href="/smart-digital-business-card#create-card" className="block">
                <Button className="w-full text-xs font-bold rounded-xl py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700">
                  Get Smart Digital Card →
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() =>
                  handleSelectCard(
                    billingCycle === "1year" ? card1YrPlan || null : card6MoPlan || null,
                    billingCycle === "1year" ? "card_yearly" : "card_6mo"
                  )
                }
                className="w-full text-xs font-bold rounded-xl py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
              >
                {isPlanActive("card_6mo", "card_yearly") ? "✓ Currently Selected" : "Select Digital Card Plan"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ──────── CARD 2: CUSTOMERPILOT COMPLETE PRO SUITE (👑 MOST POPULAR) ──────── */}
        <Card
          className={`relative rounded-3xl transition-all duration-200 flex flex-col justify-between border-2 lg:-translate-y-2 ${
            isPlanActive("growth_180", "enterprise_365")
              ? "ring-2 ring-emerald-500 shadow-2xl border-emerald-500"
              : isDark
              ? "bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-900 border-indigo-500/80 shadow-2xl shadow-indigo-950/60"
              : "bg-gradient-to-b from-indigo-50/50 via-white to-white border-indigo-600 shadow-2xl shadow-indigo-500/15"
          }`}
        >
          {/* Top Most Popular Ribbon */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 text-white border border-emerald-400/40 shadow-lg flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>MOST POPULAR · 84% OF STORES</span>
            </span>
          </div>

          <CardHeader className="p-6 sm:p-7 space-y-3 pt-8">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🚀</span>
              <Badge className="text-[10px] font-black uppercase bg-emerald-500 text-white border-none tracking-wide">
                All 4 Tools Included
              </Badge>
            </div>

            <div>
              <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                CustomerPilot Complete Pro
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                The all-in-one repeat sales, WhatsApp loyalty, and 5★ Google reviews engine.
              </CardDescription>
            </div>

            {/* Price Box */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {adminEditMode ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-slate-400">Price (₹):</Label>
                    <Input
                      type="number"
                      value={billingCycle === "1year" ? completePrice1Yr : completePrice6Mo}
                      onChange={(e) =>
                        handlePlanChange(
                          billingCycle === "1year" ? "enterprise_365" : "growth_180",
                          "price",
                          Number(e.target.value)
                        )
                      }
                      className="h-7 text-xs bg-slate-950 border-slate-700 w-24 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-slate-400">MRP (₹):</Label>
                    <Input
                      type="number"
                      value={billingCycle === "1year" ? completeMrp1Yr : completeMrp6Mo}
                      onChange={(e) =>
                        handlePlanChange(
                          billingCycle === "1year" ? "enterprise_365" : "growth_180",
                          "originalPrice",
                          Number(e.target.value)
                        )
                      }
                      className="h-7 text-xs bg-slate-950 border-slate-700 w-24"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400">
                      ₹{billingCycle === "1year" ? completePrice1Yr : completePrice6Mo}
                    </span>
                    <span className="text-base font-semibold text-slate-400 line-through">
                      ₹{billingCycle === "1year" ? completeMrp1Yr : completeMrp6Mo}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      FLAT 50% OFF
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {billingCycle === "1year" ? "₹6.1 / day" : "₹9.7 / day"}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      (Costs less than 1 cup of chai per day)
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Feature Bullets */}
            <div className="pt-3 space-y-2.5">
              <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Complete Suite Includes Everything:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200">
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>WhatsApp Digital Loyalty Stamp Cards (No App Download)</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Smart AI 5★ Google Reviews Engine (10 Categories + 3 Angles)</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-Click AI AutoReply Engine for Google Reviews</span>
                </li>
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Smart Digital Business Card + 1-Tap Save Contact (.vcf)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Automated Birthday &amp; Anniversary Rewards Engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Inactive Customer 14 &amp; 30-Day Auto Win-Back Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Print-Ready Counter QR Code Master Graphic</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                  <span>Priority WhatsApp Helpdesk (+91 90333 04707)</span>
                </li>
              </ul>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 pt-0 space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between font-bold">
              <span>Total Standalone Sum: ₹{billingCycle === "1year" ? "2,896" : "1,996"}</span>
              <span className="text-emerald-600 dark:text-emerald-400">Save ₹{billingCycle === "1year" ? "647" : "247"} with Suite!</span>
            </div>

            {mode === "public" ? (
              <Link href="/signup" className="block">
                <Button className="w-full text-sm font-black rounded-xl py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-xl shadow-emerald-500/20 cursor-pointer">
                  Start 3-Day Free Trial (All-in-One) →
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() =>
                  handleSelectCard(
                    billingCycle === "1year" ? complete1YrPlan || null : complete6MoPlan || null,
                    billingCycle === "1year" ? "enterprise_365" : "growth_180"
                  )
                }
                className="w-full text-sm font-black rounded-xl py-3.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white shadow-xl shadow-emerald-500/20 cursor-pointer"
              >
                {isPlanActive("growth_180", "enterprise_365") ? "✓ Currently Selected" : "Select Complete Pro Suite"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ──────── CARD 3: STANDALONE SINGLE ENGINE (PICK 1 TOOL) ──────── */}
        <Card
          className={`relative rounded-3xl transition-all duration-200 flex flex-col justify-between border ${
            isDark
              ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md"
              : "bg-white border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-xl"
          }`}
        >
          <CardHeader className="p-6 sm:p-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{currentStandaloneMod.icon}</span>
              <Badge variant="outline" className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                Single Tool License
              </Badge>
            </div>

            <div>
              <CardTitle className="text-xl font-black tracking-tight">Pick Any 1 Standalone Tool</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Need only one specific tool for your shop? Deploy exactly what you require.
              </CardDescription>
            </div>

            {/* Interactive Tool Selector Chips inside Card */}
            <div className="pt-1">
              <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
                Select Your Desired Tool:
              </Label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedStandaloneTool("loyalty")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition text-center truncate cursor-pointer ${
                    selectedStandaloneTool === "loyalty"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  🎁 Loyalty
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStandaloneTool("reviews")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition text-center truncate cursor-pointer ${
                    selectedStandaloneTool === "reviews"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  ⭐ Reviews
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStandaloneTool("autoreply")}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold transition text-center truncate cursor-pointer ${
                    selectedStandaloneTool === "autoreply"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  💬 AutoReply
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              {adminEditMode ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-slate-400">Price (₹):</Label>
                    <Input
                      type="number"
                      value={standalonePriceData.price}
                      onChange={(e) =>
                        handlePlanChange(
                          billingCycle === "1year" ? currentStandaloneMod.planKey1Yr : currentStandaloneMod.planKey6Mo,
                          "price",
                          Number(e.target.value)
                        )
                      }
                      className="h-7 text-xs bg-slate-950 border-slate-700 w-24 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-slate-400">MRP (₹):</Label>
                    <Input
                      type="number"
                      value={standalonePriceData.mrp}
                      onChange={(e) =>
                        handlePlanChange(
                          billingCycle === "1year" ? currentStandaloneMod.planKey1Yr : currentStandaloneMod.planKey6Mo,
                          "originalPrice",
                          Number(e.target.value)
                        )
                      }
                      className="h-7 text-xs bg-slate-950 border-slate-700 w-24"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      ₹{standalonePriceData.price}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      ₹{standalonePriceData.mrp}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      50% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {billingCycle === "1year" ? "per year (~₹2.1 / day)" : "for 6 months (~₹3.0 / day)"}
                  </p>
                </>
              )}
            </div>

            {/* Dynamic Features List for Selected Tool */}
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {currentStandaloneMod.shortTitle} Features:
              </p>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {currentStandaloneMod.features.slice(0, 5).map((feat, fidx) => (
                  <li key={fidx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[3]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 pt-0 space-y-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Active Selection:</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentStandaloneMod.shortTitle}</span>
            </div>

            {mode === "public" ? (
              <Link href={`/signup?module=${currentStandaloneMod.id}`} className="block">
                <Button className="w-full text-xs font-bold rounded-xl py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700">
                  Select {currentStandaloneMod.shortTitle} →
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() =>
                  handleSelectCard(
                    standalonePriceData.plan || null,
                    billingCycle === "1year" ? currentStandaloneMod.planKey1Yr : currentStandaloneMod.planKey6Mo
                  )
                }
                className="w-full text-xs font-bold rounded-xl py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
              >
                {selectedPlanId && standalonePriceData.plan?.id === selectedPlanId
                  ? "✓ Currently Selected"
                  : `Select ${currentStandaloneMod.shortTitle}`}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── OPTIONAL / COLLAPSIBLE CUSTOM BUNDLE BUILDER ─── */}
      <div className="mb-14">
        <button
          type="button"
          onClick={() => setShowBundleBuilder(!showBundleBuilder)}
          className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 text-left cursor-pointer ${
            showBundleBuilder
              ? "bg-indigo-50/60 dark:bg-slate-900 border-indigo-400/50 shadow-md"
              : isDark
              ? "bg-slate-900/40 border-slate-800 hover:bg-slate-900"
              : "bg-white border-slate-200 hover:bg-slate-50 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-lg">
              🧺
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Want a custom combination? Open Interactive Bundle Builder</span>
                <Badge variant="outline" className="text-[10px] border-indigo-400/40 text-indigo-500">
                  Advanced
                </Badge>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pick 2 or 3 specific products with automatic volume bundle discounts (10% to 15% off).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            <span>{showBundleBuilder ? "Hide Builder" : "Configure Custom Bundle"}</span>
            {showBundleBuilder ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {showBundleBuilder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-6 sm:p-8 rounded-3xl bg-slate-50/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Interactive Bundle Configurator</span>
                    <Badge className="bg-emerald-500 text-white text-[10px]">Real-time Calculation</Badge>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Toggle checkboxes on the tools you want to bundle together.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedModules({ card: true, loyalty: true, reviews: true, autoreply: true })}
                    className="text-xs h-8 rounded-xl border-slate-300 dark:border-slate-700"
                  >
                    Select All (4-in-1)
                  </Button>
                </div>
              </div>

              {/* 4 Tool Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PRODUCT_MODULES.map((mod) => {
                  const isChecked = Boolean(selectedModules[mod.id])
                  const pricing = getProductPrice(mod, billingCycle)

                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isChecked
                          ? isDark
                            ? "bg-slate-950 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md"
                            : "bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-md"
                          : isDark
                          ? "bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100"
                          : "bg-slate-100/60 border-slate-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{mod.icon}</span>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                              {mod.shortTitle}
                            </p>
                            <p className="text-[10px] text-slate-400">₹{pricing.price} / {billingCycle === "1year" ? "yr" : "6mo"}</p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                            isChecked ? "bg-indigo-600 text-white" : "border border-slate-400 dark:border-slate-600"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {mod.tagline}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Bundle Summary Result Strip */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selected Tools: <strong className="text-slate-900 dark:text-white">{bundleCalculation.selectedCount} of 4</strong>
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Bundle Price:{" "}
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{bundleCalculation.bundleOfferPrice.toLocaleString()}
                    </span>{" "}
                    <span className="text-xs text-slate-400 line-through">
                      ₹{bundleCalculation.bundleTotalMrp.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal ml-2">
                      (~₹{bundleCalculation.dailyCost}/day)
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {mode === "public" ? (
                    <Link href="/signup">
                      <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl">
                        Start Trial with This Bundle →
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={() => {
                        if (bundleCalculation.matchedPlan) {
                          handleSelectCard(bundleCalculation.matchedPlan, "")
                        } else {
                          toast({ title: "Custom Bundle Configured", description: `Active at ₹${bundleCalculation.bundleOfferPrice}` })
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer"
                    >
                      Apply This Custom Bundle
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── FEATURE COMPARISON MATRIX ─── */}
      <div className="mb-14 space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Compare Plan Capabilities
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            See exactly what is included in each option at a glance.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-md">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/80 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 sm:p-4">Feature / Engine</th>
                <th className="p-3.5 sm:p-4 text-center">Smart Digital Card (₹499/yr)</th>
                <th className="p-3.5 sm:p-4 text-center">Single Standalone (₹799/yr)</th>
                <th className="p-3.5 sm:p-4 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black">
                  Complete Pro Suite (₹2,249/yr)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">1-Tap Save Contact (vCard .vcf)</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500">✓ Included</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">—</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500 font-bold bg-emerald-500/5">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Online Ordering Catalog &amp; Social Links</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500">✓ Included</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">—</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500 font-bold bg-emerald-500/5">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">WhatsApp Digital Loyalty Stamp Cards</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">—</td>
                <td className="p-3.5 sm:p-4 text-center text-indigo-500">✓ (If Loyalty picked)</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500 font-bold bg-emerald-500/5">✓ Unlimited VIP Stamps</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Smart AI 5★ Google Review Generator</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">Modal Only</td>
                <td className="p-3.5 sm:p-4 text-center text-indigo-500">✓ (If Reviews picked)</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500 font-bold bg-emerald-500/5">✓ Full WhatsApp SEO Engine</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">1-Click AI AutoReply to Google Reviews</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">—</td>
                <td className="p-3.5 sm:p-4 text-center text-indigo-500">✓ (If AutoReply picked)</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500 font-bold bg-emerald-500/5">✓ Unlimited AI AutoReplies</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Automated Birthday &amp; Anniversary Rewards</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">—</td>
                <td className="p-3.5 sm:p-4 text-center text-indigo-500">✓ (If Loyalty picked)</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500 font-bold bg-emerald-500/5">✓ 365-Day Automation</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-slate-900 dark:text-white">Print-Ready Counter QR Code Display</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">QR Only</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-400">Standard Graphic</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-500 font-bold bg-emerald-500/5">✓ Master QR Code Graphic</td>
              </tr>
              <tr className="bg-slate-50/60 dark:bg-slate-950 font-bold">
                <td className="p-3.5 sm:p-4 text-slate-900 dark:text-white">Total Annual Cost (1 Year Pro)</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-900 dark:text-white">₹499 (~₹1.3/day)</td>
                <td className="p-3.5 sm:p-4 text-center text-slate-900 dark:text-white">₹799 (~₹2.1/day)</td>
                <td className="p-3.5 sm:p-4 text-center text-emerald-600 dark:text-emerald-400 font-black text-sm bg-emerald-500/10">
                  ₹2,249 (~₹6.1/day)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── FREQUENTLY ASKED QUESTIONS ─── */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg sm:text-xl font-black text-center text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <p className="font-bold text-slate-900 dark:text-white">Is there a free trial?</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Yes, all plans include an unrestricted 3-day free trial. You can test customer stamp cards, AI review collection, and contact saving risk-free. No credit card required.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <p className="font-bold text-slate-900 dark:text-white">Do customers need an app?</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Never! Customers participate 100% via WhatsApp and their standard mobile web browser. Zero friction means 3x higher customer adoption.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <p className="font-bold text-slate-900 dark:text-white">Can I upgrade to Complete Suite later?</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Yes, you can start with the Digital Card (₹499) or a Single Tool (₹799) and upgrade to CustomerPilot Complete anytime directly from your dashboard.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-xs">
            <p className="font-bold text-slate-900 dark:text-white">How does the 50% discount work?</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              All 1-year annual subscriptions are locked at flat 50% off regular MRP. Complete Pro Suite is discounted from ₹4,499 down to ₹2,249/yr (~₹6.1/day).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
