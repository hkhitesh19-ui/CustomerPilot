"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check, Sparkles, Shield, Crown, Zap, Gift, Star, Users, ArrowRight,
  Database, HelpCircle, CheckCircle2, Lock, Award, HeartHandshake, Flame,
  ShieldCheck, RefreshCw, MessageSquare, Edit3, Save, CheckSquare, Square,
  Layers, ChevronRight, Tag, Sliders, Info, AlertCircle, ShoppingBag, Eye
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
    id: "reviews",
    name: "Smart Ai (SEO Optimized) Google Reviews",
    shortTitle: "Smart AI Google Reviews",
    icon: "⭐",
    badge: "Local SEO Growth",
    tagline: "Automated WhatsApp Prompts & 3-Angle AI Drafts [upto 2500 Reviews]",
    description: "Collect authentic 5-star Google Maps reviews via WhatsApp after purchase. Generates 3 AI psychological review angles with zero banned AI words.",
    features: [
      "Post-Purchase WhatsApp Review Request Engine",
      "3-Angle Gemini AI Review Drafts (Quality, Vibes, 1-Liner)",
      "+2 Bonus Stamps Photo Upload Reward Callout",
      "Anti-AI Detection Filter (10-Category Local SEO Entities)",
      "1-Click Copy & Direct Google Maps Post"
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
    tagline: "Google Business Profile Sync & 1-Click AI Owner Responses",
    description: "Gemini AI crafts appreciative, contextual owner replies to Google Maps reviews. Store owners review and publish to Google Maps in 1-Click.",
    features: [
      "Official Google Business Profile (GBP) OAuth Sync",
      "Context-Aware AI Appreciation & De-escalation Replies",
      "1-Click Direct Publish to Live Google Maps Listing",
      "Sentiment Adaptation & Bulk Response Studio",
      "Automated 60-Second Reply Safety Queue"
    ],
    planKey6Mo: "autoreply_6mo",
    planKey1Yr: "autoreply_yearly",
    defaultPrice6Mo: 549,
    defaultMrp6Mo: 1099,
    defaultPrice1Yr: 799,
    defaultMrp1Yr: 1599
  },
  {
    id: "loyalty",
    name: "Digital Loyalty Stamps & VIP Club",
    shortTitle: "Loyalty Stamps & VIP",
    icon: "🎁",
    badge: "Repeat Visit Engine",
    tagline: "WhatsApp Digital Stamp Cards & Automated Birthday Rewards",
    description: "Turn walk-in shoppers into loyal repeat customers with WhatsApp digital stamp cards, cashier counter queue, and automated win-back triggers.",
    features: [
      "Digital WhatsApp Stamp Card (No App Download)",
      "Cashier 1-Tap Counter Check-In Mode",
      "Automated Birthday & Anniversary Rewards Engine",
      "14/30/60-Day Inactivity Win-Back WhatsApp Alerts",
      "VIP Tier Upgrades & Customer Loyalty Analytics"
    ],
    planKey6Mo: "loyalty_6mo",
    planKey1Yr: "loyalty_yearly",
    defaultPrice6Mo: 799,
    defaultMrp6Mo: 1598,
    defaultPrice1Yr: 1299,
    defaultMrp1Yr: 2598
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

  // Plans data state
  const [plans, setPlans] = useState<PlanItem[]>(initialPlans)
  const [loading, setLoading] = useState(initialPlans.length === 0)
  const [savingPlans, setSavingPlans] = useState(false)

  // Admin edit mode toggle
  const [adminEditMode, setAdminEditMode] = useState(false)

  // Tenure selection: "6mo" | "1year" | "lifetime"
  const [selectedTenure, setSelectedTenure] = useState<"6mo" | "1year" | "lifetime">("1year")

  // Bundle builder selected products
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({
    card: true,
    loyalty: true,
    reviews: true,
    autoreply: true
  })

  // Standalone active tab
  const [standaloneTenureFilter, setStandaloneTenureFilter] = useState<"all" | "6mo" | "1year">("all")

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
      // Other products don't have lifetime, fall back to 1 year
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

  // Handle local plan field change
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

  // Preset selectors for bundle
  const selectPreset = (preset: "complete" | "all4" | "reviews_only" | "card_loyalty") => {
    if (preset === "all4") {
      setSelectedModules({ card: true, loyalty: true, reviews: true, autoreply: true })
    } else if (preset === "complete") {
      setSelectedModules({ card: false, loyalty: true, reviews: true, autoreply: true })
    } else if (preset === "reviews_only") {
      setSelectedModules({ card: false, loyalty: false, reviews: true, autoreply: true })
    } else if (preset === "card_loyalty") {
      setSelectedModules({ card: true, loyalty: true, reviews: false, autoreply: false })
    }
  }

  // Complete bundle canonical plans
  const complete6MoPlan = getPlanByKey("growth_180")
  const complete1YrPlan = getPlanByKey("enterprise_365")
  const enterprisePlan = getPlanByKey("enterprise_unlimited_365")

  const completePrice6Mo = complete6MoPlan ? complete6MoPlan.price : 2499
  const completeMrp6Mo = complete6MoPlan?.originalPrice || 4998
  const completePrice1Yr = complete1YrPlan ? complete1YrPlan.price : 4899
  const completeMrp1Yr = complete1YrPlan?.originalPrice || 9798

  // Bundle calculations
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
        const pricing = getProductPrice(mod, selectedTenure)
        standaloneSumPrice += pricing.price
        standaloneSumMrp += pricing.mrp
      }
    })

    // Determine smart bundle price: live sum of selected tools
    let bundleOfferPrice = standaloneSumPrice
    let bundleTotalMrp = standaloneSumMrp
    let appliedBundleBadge = ""
    let matchedPlan: PlanItem | null = null

    if (selectedCount === 4) {
      appliedBundleBadge = "👑 All 4 Tools Selected (Live Sum)"
      if (selectedTenure === "6mo") matchedPlan = complete6MoPlan || null
      else if (selectedTenure === "1year") matchedPlan = complete1YrPlan || null
    } else if (hasCompleteTrio) {
      appliedBundleBadge = "⭐ Complete 3-in-1 Trio Selected (Live Sum)"
      if (selectedTenure === "6mo") matchedPlan = complete6MoPlan || null
      else if (selectedTenure === "1year") matchedPlan = complete1YrPlan || null
    } else if (selectedCount === 1) {
      const singleMod = PRODUCT_MODULES.find((m) => selectedModules[m.id])
      if (singleMod) {
        if (selectedTenure === "6mo") {
          matchedPlan = getPlanByKey(singleMod.planKey6Mo) || null
        } else if (selectedTenure === "1year") {
          matchedPlan = getPlanByKey(singleMod.planKey1Yr) || null
        } else if (selectedTenure === "lifetime" && singleMod.id === "card") {
          matchedPlan = getPlanByKey("card_lifetime") || null
        }
        appliedBundleBadge = `${singleMod.shortTitle} Plan`
      }
    } else if (selectedCount > 1) {
      appliedBundleBadge = `🧺 Custom Bundle (${selectedCount} Tools Selected)`
    }

    const totalSavings = Math.max(0, bundleTotalMrp - bundleOfferPrice)
    const savingsPercent = bundleTotalMrp > 0 ? Math.round((totalSavings / bundleTotalMrp) * 100) : 50

    // Daily cost estimate
    const days = selectedTenure === "6mo" ? 180 : selectedTenure === "1year" ? 365 : 3650
    const dailyCost = (bundleOfferPrice / days).toFixed(1)
    const monthlyCost = Math.round((bundleOfferPrice / (days / 30)))

    return {
      selectedCount,
      hasCard,
      hasLoyalty,
      hasReviews,
      hasAutoReply,
      hasCompleteTrio,
      standaloneSumPrice,
      standaloneSumMrp,
      bundleOfferPrice,
      bundleTotalMrp,
      totalSavings,
      savingsPercent,
      dailyCost,
      monthlyCost,
      appliedBundleBadge,
      matchedPlan
    }
  }, [selectedModules, selectedTenure, plans, completePrice6Mo, completeMrp6Mo, completePrice1Yr, completeMrp1Yr])

  // Primary action button handler
  const handleBundleAction = () => {
    if (mode === "superadmin") {
      toast({
        title: "SuperAdmin Preview",
        description: `Active Bundle: ${bundleCalculation.appliedBundleBadge || "Custom Bundle"} at ₹${bundleCalculation.bundleOfferPrice}`
      })
      return
    }

    if (bundleCalculation.matchedPlan) {
      if (onSelectPlan) {
        onSelectPlan(bundleCalculation.matchedPlan, {
          selectedModules,
          tenure: selectedTenure,
          price: bundleCalculation.bundleOfferPrice
        })
      }
      if (onCheckout) {
        onCheckout(bundleCalculation.matchedPlan)
      }
    }
  }

  // Dynamic theme wrapper classes
  const isDark = theme === "dark" || mode === "superadmin" || mode === "merchant"

  return (
    <div className={`w-full transition-colors duration-200 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      {/* ─── Studio Header & Admin Edit Mode Control ─── */}
      <div className="space-y-4 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> CustomerPilot Pricing Studio v4
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Pricing Studio v4
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Pick a product, compare tenures, build your bundle — all prices live
            </p>
          </div>

          {/* Admin Edit Mode Control Checkbox / Toggle */}
          {(showAdminToggle || mode === "superadmin") && (
            <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setAdminEditMode(!adminEditMode)}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${adminEditMode ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-950"}`}>
                  {adminEditMode && <Check className="w-3.5 h-3.5 font-black stroke-[3]" />}
                </div>
                <Label className="text-xs font-bold cursor-pointer select-none text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                  Admin edit mode
                </Label>
              </div>

              {adminEditMode && (
                <Button
                  size="sm"
                  onClick={handleSaveAllPlans}
                  disabled={savingPlans}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-md cursor-pointer ml-auto"
                >
                  {savingPlans ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Admin Edit Mode Banner */}
        {adminEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Admin Edit Mode Active:</strong> You can edit prices, MRPs, badges, and discount tags directly on any plan card or standalone row. Click &quot;Save Changes&quot; to persist live to all users.
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleSaveAllPlans}
              disabled={savingPlans}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 rounded-xl"
            >
              {savingPlans ? "Saving..." : "Save Live Prices"}
            </Button>
          </motion.div>
        )}
      </div>

      {/* ─── SECTION 1: ### 🧺 Your Bundle (Interactive Dynamic Builder) ─── */}
      <section className="space-y-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
              <span>Dynamic Configurator</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
              <span>🧺 Your Bundle</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select any combination of tools below. The live engine bundles them with automatic volume discounts.
            </p>
          </div>

          {/* Quick Presets Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => selectPreset("all4")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
            >
              👑 All 4 Tools
            </button>
            <button
              type="button"
              onClick={() => selectPreset("complete")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
            >
              ⭐ Complete Trio
            </button>
            <button
              type="button"
              onClick={() => selectPreset("reviews_only")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
            >
              ⭐ Google Reputation
            </button>
            <button
              type="button"
              onClick={() => selectPreset("card_loyalty")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
            >
              🪪 Card + Loyalty
            </button>
          </div>
        </div>

        {/* Tenure Switcher For Bundle */}
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md mx-auto shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedTenure("6mo")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              selectedTenure === "6mo"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            6 Months (Semi-Annual)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTenure("1year")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedTenure === "1year"
                ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>1 Year</span>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500 text-white">50% OFF</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTenure("lifetime")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              selectedTenure === "lifetime"
                ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Lifetime (Card)
          </button>
        </div>

        {/* Interactive Products Grid + Live Basket Summary */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 4 Selectable Product Cards (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 grid sm:grid-cols-2 gap-4">
            {PRODUCT_MODULES.map((mod) => {
              const isChecked = Boolean(selectedModules[mod.id])
              const pricing = getProductPrice(mod, selectedTenure)
              const planRecord = pricing.plan

              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isChecked
                      ? isDark
                        ? "bg-slate-900/95 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "bg-white border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500"
                      : isDark
                      ? "bg-slate-950/60 border-slate-800/80 opacity-75 hover:opacity-100 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200/80 opacity-80 hover:opacity-100 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header with Icon, Badge & Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">{mod.icon}</span>
                        <div>
                          <Badge variant="outline" className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none">
                            {mod.badge}
                          </Badge>
                          <h4 className="text-base font-bold leading-tight mt-1">
                            {mod.shortTitle}
                          </h4>
                        </div>
                      </div>

                      {/* Custom Checkbox */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                        isChecked
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      }`}>
                        {isChecked && <Check className="w-4 h-4 font-black stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {mod.tagline}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-1.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {mod.features.slice(0, 3).map((feat, fidx) => (
                        <li key={fidx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Tag & Admin Inline Edit */}
                  <div className="pt-4 mt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex items-baseline justify-between">
                    <div>
                      <div className="flex items-baseline gap-2">
                        {adminEditMode && planRecord ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs font-bold">₹</span>
                            <Input
                              type="number"
                              value={planRecord.price}
                              onChange={(e) => handlePlanChange(planRecord.planKey!, "price", Number(e.target.value))}
                              className="w-20 h-7 text-xs font-black bg-white dark:bg-slate-900 text-emerald-600"
                            />
                          </div>
                        ) : (
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            ₹{pricing.price.toLocaleString("en-IN")}
                          </span>
                        )}

                        {pricing.mrp && (
                          adminEditMode && planRecord ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <span className="text-[10px] text-slate-400">MRP:</span>
                              <Input
                                type="number"
                                value={planRecord.originalPrice}
                                onChange={(e) => handlePlanChange(planRecord.planKey!, "originalPrice", Number(e.target.value))}
                                className="w-16 h-7 text-[11px] text-slate-400 bg-white dark:bg-slate-900"
                              />
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-slate-400 line-through">
                              ₹{pricing.mrp.toLocaleString("en-IN")}
                            </span>
                          )
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {selectedTenure === "6mo" ? "for 6 months" : selectedTenure === "1year" ? "for 1 year" : "lifetime access"}
                      </span>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isChecked
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}>
                      {isChecked ? "In Bundle ✓" : "+ Add"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Live Reactive Bundle Calculator (5 cols / 4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <Card className={`rounded-3xl border-2 transition-all shadow-2xl ${
              isDark
                ? "bg-slate-900/90 border-indigo-500/50 shadow-indigo-500/10 backdrop-blur-xl"
                : "bg-white border-slate-900/90 shadow-2xl shadow-indigo-500/10"
            }`}>
              <CardHeader className="p-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <CardTitle className="text-lg font-black">Live Bundle Summary</CardTitle>
                  </div>
                  <Badge className="bg-emerald-500 text-white font-extrabold text-[10px]">
                    {bundleCalculation.savingsPercent}% TOTAL SAVINGS
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {bundleCalculation.selectedCount} product{bundleCalculation.selectedCount !== 1 ? "s" : ""} selected for {selectedTenure === "6mo" ? "6 Months" : selectedTenure === "1year" ? "1 Year" : "Lifetime"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Selected Products List */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included In Your Package:</p>
                  <div className="space-y-1.5">
                    {PRODUCT_MODULES.filter((m) => selectedModules[m.id]).map((m) => {
                      const p = getProductPrice(m, selectedTenure)
                      return (
                        <div key={m.id} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80">
                          <span className="flex items-center gap-2 font-semibold">
                            <span>{m.icon}</span>
                            <span className="truncate max-w-[170px]">{m.shortTitle}</span>
                          </span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">
                            ₹{p.price}
                          </span>
                        </div>
                      )
                    })}

                    {bundleCalculation.selectedCount === 0 && (
                      <p className="text-xs text-amber-500 italic p-3 text-center bg-amber-500/10 rounded-xl">
                        Please select at least 1 product above to build your bundle.
                      </p>
                    )}
                  </div>
                </div>

                {/* Highlight Deal Pill */}
                {bundleCalculation.appliedBundleBadge && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 border border-amber-500/30 text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{bundleCalculation.appliedBundleBadge}</span>
                  </div>
                )}

                {/* Math Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Standalone Total (MRP):</span>
                    <span className="line-through font-mono">₹{bundleCalculation.bundleTotalMrp.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Bundle Discount Savings:</span>
                    <span>-₹{bundleCalculation.totalSavings.toLocaleString("en-IN")} ({bundleCalculation.savingsPercent}% OFF)</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">Final Bundle Price</span>
                      <p className="text-[10px] text-slate-400 font-medium">All taxes included · No hidden fees</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                        ₹{bundleCalculation.bundleOfferPrice.toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        Just ₹{bundleCalculation.dailyCost}/day (~₹{bundleCalculation.monthlyCost}/mo)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  {mode === "public" ? (
                    <Link href={`/signup?tenure=${selectedTenure}&modules=${Object.keys(selectedModules).filter(k => selectedModules[k]).join(",")}`}>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm h-12 rounded-2xl shadow-xl shadow-indigo-600/25 cursor-pointer">
                        Start 3 Days Free Trial with this Bundle →
                      </Button>
                    </Link>
                  ) : mode === "merchant" ? (
                    <Button
                      onClick={handleBundleAction}
                      disabled={bundleCalculation.selectedCount === 0}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm h-12 rounded-2xl shadow-xl shadow-emerald-600/25 cursor-pointer"
                    >
                      Proceed to Checkout (₹{bundleCalculation.bundleOfferPrice.toLocaleString("en-IN")}) →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBundleAction}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm h-12 rounded-2xl cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Active Bundle
                    </Button>
                  )}
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    🔒 Instant Activation · 100% WhatsApp-Native Delivery
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: ## Compare all tenures ─── */}
      <section className="space-y-6 mb-16 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" /> Long-Term Value Multiplier
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Compare all tenures
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Choose between flexible Semi-Annual, the maximum-savings 1-Year Pro plan, or permanent Lifetime access for your Smart Digital Card.
          </p>
        </div>

        {/* Monthly Option Callout */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs max-w-4xl mx-auto text-indigo-950 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Also Available — Complete Monthly:</strong> <strong>₹449/mo</strong> (₹14.97/day · MRP <span className="line-through">₹898</span> · 50% OFF · Save ₹449). 6-Months saves ~7%/mo extra and 12-Months saves ~9%/mo extra!
            </span>
          </div>
          <Link href="/signup?tenure=monthly" className="shrink-0 font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Choose Monthly →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-4">
          {/* Card 1: Lifetime Deal (Lowest Price: ₹1,499) */}
          <Card className={`rounded-3xl border transition-all p-6 sm:p-7 flex flex-col justify-between ${
            selectedTenure === "lifetime"
              ? isDark
                ? "border-cyan-500 bg-slate-900/90 ring-2 ring-cyan-500 shadow-xl"
                : "border-cyan-600 bg-white ring-2 ring-cyan-600 shadow-xl"
              : isDark
              ? "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] font-bold border-cyan-500/40 text-cyan-500">
                    One-Time Purchase
                  </Badge>
                  <h3 className="text-xl font-black mt-1">Lifetime Deal</h3>
                </div>
                <span className="text-2xl">💎</span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400">₹1,499</span>
                  <span className="text-sm text-slate-400 line-through">₹3,999</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ₹0.41/day (MRP ₹1.10/day) · Save ₹2,500 (~62% OFF)
                </p>
                <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  Zero Renewal Fees Forever
                </span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 text-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lifetime Privileges:</p>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Permanent Cloud Hosting (10 Years Guaranteed)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>1-Tap Phonebook Sync (.vcf) &amp; Review Trigger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Unlimited Real-Time Profile &amp; Menu Edits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Custom Smart Digital Card Setup Guidance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span>Founder Direct Support Line</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={() => setSelectedTenure("lifetime")}
                variant={selectedTenure === "lifetime" ? "default" : "outline"}
                className={`w-full font-bold text-xs h-11 rounded-xl cursor-pointer ${
                  selectedTenure === "lifetime"
                    ? "bg-cyan-600 hover:bg-cyan-500 text-white"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                {selectedTenure === "lifetime" ? "Selected Tenure ✓" : "Choose Lifetime"}
              </Button>
            </div>
          </Card>

          {/* Card 2: 6 Months Complete (₹2,499) */}
          <Card className={`rounded-3xl border transition-all p-6 sm:p-7 flex flex-col justify-between ${
            selectedTenure === "6mo"
              ? isDark
                ? "border-indigo-500 bg-slate-900/90 ring-2 ring-indigo-500 shadow-xl"
                : "border-indigo-600 bg-white ring-2 ring-indigo-600 shadow-xl"
              : isDark
              ? "border-slate-800 bg-slate-950/60 hover:border-slate-700"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] font-bold border-indigo-400 text-indigo-600 dark:text-indigo-400">
                    ⭐ Best Value
                  </Badge>
                  <h3 className="text-xl font-black mt-1">6 Months Complete</h3>
                </div>
                <span className="text-2xl">⏳</span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black">₹2,499</span>
                  <span className="text-sm text-slate-400 line-through">₹4,998</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ₹13.88/day (MRP ₹27.77/day) · ~₹417/mo · 180 days
                </p>
                <span className="inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  50% OFF · Save ₹2,499 (~7% sasta/mo)
                </span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 text-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Complete Suite Inclusions:</p>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Up to 1,000 VIP Customers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>180-Day WhatsApp Automations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>AI Google Reviews &amp; AutoReply</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>WhatsApp Digital Loyalty Stamp Cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Printable Counter QR Code Display</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={() => setSelectedTenure("6mo")}
                variant={selectedTenure === "6mo" ? "default" : "outline"}
                className={`w-full font-bold text-xs h-11 rounded-xl cursor-pointer ${
                  selectedTenure === "6mo"
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                {selectedTenure === "6mo" ? "Selected Tenure ✓" : "Choose 6 Months"}
              </Button>
            </div>
          </Card>

          {/* Card 3: 12 Months Complete (₹4,899) */}
          <Card className={`rounded-3xl border-2 transition-all p-6 sm:p-7 flex flex-col justify-between relative ${
            isDark
              ? "border-amber-500 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 shadow-2xl shadow-amber-500/10 ring-2 ring-amber-500/50"
              : "border-amber-500 bg-gradient-to-b from-white via-amber-50/20 to-orange-50/30 shadow-2xl shadow-amber-500/15 ring-2 ring-amber-500/80"
          }`}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] tracking-wider uppercase px-3 py-1 rounded-full shadow-lg">
                👑 12 MONTHS · ANNUAL PRO SUITE
              </span>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <Badge className="bg-amber-500 text-white font-extrabold text-[10px]">
                    Annual Scaling (365 Days)
                  </Badge>
                  <h3 className="text-xl font-black mt-1">12 Months Complete</h3>
                </div>
                <span className="text-3xl">👑</span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-700 dark:text-amber-400">₹4,899</span>
                  <span className="text-sm text-slate-400 line-through">₹9,798</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-1">
                  ₹13.42/day (MRP ₹26.84/day) · ~₹408/mo · 365 days
                </p>
                <span className="inline-block mt-2 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                  50% OFF · Save ₹4,899 (~9% sasta/mo)
                </span>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-amber-500/20 text-xs">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Everything in 6 Mo, Plus:</p>
                <ul className="space-y-2 text-slate-700 dark:text-slate-200">
                  <li className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Up to 2,500 VIP Customers Capacity</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>365-Day Continuous Automation (Zero Pauses)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>VIP Customer CRM &amp; CSV Export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Custom High-Resolution Counter QR Code</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Priority WhatsApp VIP Line (+91 90333 04707)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={() => setSelectedTenure("1year")}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs h-11 rounded-xl shadow-lg shadow-orange-500/30 cursor-pointer"
              >
                {selectedTenure === "1year" ? "Selected Tenure (50% OFF) ✓" : "Choose 12 Months (Save 50%)"}
              </Button>
            </div>
          </Card>

          </div>
      </section>

      {/* ─── SECTION 3: ## Standalone services — 6 Months & 1 Year (with total) ─── */}
      <section className="space-y-6 mb-16 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-2">
              <CheckSquare className="w-3.5 h-3.5" /> Granular Transparency
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Standalone services — 6 Months &amp; 1 Year (with total)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Need only one specific tool? Pick exactly what you need, or see how much you save with CustomerPilot Complete.
            </p>
          </div>

          {/* Sub-filter for standalone cards */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStandaloneTenureFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                standaloneTenureFilter === "all" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
              }`}
            >
              Side-by-Side Comparison
            </button>
            <button
              type="button"
              onClick={() => setStandaloneTenureFilter("6mo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                standaloneTenureFilter === "6mo" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
              }`}
            >
              6 Months Only
            </button>
            <button
              type="button"
              onClick={() => setStandaloneTenureFilter("1year")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                standaloneTenureFilter === "1year" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
              }`}
            >
              1 Year Only
            </button>
          </div>
        </div>

        {/* Master Comparison Table */}
        <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
          <table className="w-full text-left border-collapse min-w-[840px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
                <th className="p-4 sm:p-5 text-xs sm:text-sm font-extrabold w-[36%]">Standalone Service &amp; Core Engine</th>
                <th className="p-4 text-center text-xs sm:text-sm font-extrabold w-[24%]">
                  6 Months Plan
                </th>
                <th className="p-4 text-center text-xs sm:text-sm font-extrabold text-amber-300 w-[24%]">
                  1 Year Plan (50% OFF)
                </th>
                <th className="p-4 text-center text-xs sm:text-sm font-extrabold w-[16%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm">
              {PRODUCT_MODULES.map((mod) => {
                const plan6 = getPlanByKey(mod.planKey6Mo)
                const plan1 = getPlanByKey(mod.planKey1Yr)

                const price6 = plan6 ? plan6.price : mod.defaultPrice6Mo
                const mrp6 = plan6?.originalPrice || mod.defaultMrp6Mo
                const price1 = plan1 ? plan1.price : mod.defaultPrice1Yr
                const mrp1 = plan1?.originalPrice || mod.defaultMrp1Yr

                const daily6 = (price6 / 180).toFixed(1)
                const daily1 = (price1 / 365).toFixed(1)

                return (
                  <tr key={mod.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition">
                    <td className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0">{mod.icon}</span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{mod.name}</span>
                            <Badge variant="outline" className="text-[10px] hidden sm:inline-block">
                              {mod.badge}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {mod.tagline}
                          </p>
                          {mod.id === "card" && (
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold block mt-1">
                              💎 Lifetime Deal also available: ₹1,499 one-time
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 6 Months Cell */}
                    <td className="p-4 text-center">
                      {adminEditMode && plan6 ? (
                        <div className="space-y-1 max-w-[120px] mx-auto">
                          <Input
                            type="number"
                            value={plan6.price}
                            onChange={(e) => handlePlanChange(plan6.planKey!, "price", Number(e.target.value))}
                            className="h-7 text-xs font-black text-center text-emerald-600 dark:text-emerald-400 bg-slate-50 dark:bg-slate-900"
                          />
                          <span className="text-[10px] text-slate-400">MRP: ₹{mrp6}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-base font-black text-slate-900 dark:text-white">₹{price6}</span>
                            <span className="text-xs text-slate-400 line-through">₹{mrp6}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            ₹{daily6}/day · 180 days
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 1 Year Cell */}
                    <td className="p-4 text-center bg-amber-50/30 dark:bg-amber-950/15">
                      {adminEditMode && plan1 ? (
                        <div className="space-y-1 max-w-[120px] mx-auto">
                          <Input
                            type="number"
                            value={plan1.price}
                            onChange={(e) => handlePlanChange(plan1.planKey!, "price", Number(e.target.value))}
                            className="h-7 text-xs font-black text-center text-amber-600 dark:text-amber-400 bg-slate-50 dark:bg-slate-900"
                          />
                          <span className="text-[10px] text-slate-400">MRP: ₹{mrp1}</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-base font-black text-amber-700 dark:text-amber-400">₹{price1}</span>
                            <span className="text-xs text-slate-400 line-through">₹{mrp1}</span>
                          </div>
                          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block mt-0.5">
                            ₹{daily1}/day · 365 days
                          </span>
                          <span className="inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            50% OFF Locked
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="p-4 text-center">
                      {mode === "public" ? (
                        <Link href={`/signup?module=${mod.id}`}>
                          <Button size="sm" variant="outline" className="text-xs font-bold rounded-xl h-8 px-3 cursor-pointer">
                            Select →
                          </Button>
                        </Link>
                      ) : mode === "merchant" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            const p = plan1 || plan6
                            if (p && onSelectPlan) onSelectPlan(p)
                          }}
                          className="bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs rounded-xl h-8 px-3 cursor-pointer"
                        >
                          Select
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-xs font-semibold h-8 text-slate-400">
                          Active ✓
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}

              {/* ─── STANDALONE SERVICES ROW TOTAL ─── */}
              <tr className="bg-slate-100/80 dark:bg-slate-900/90 font-black border-t-2 border-slate-300 dark:border-slate-700">
                <td className="p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <div>
                      <div className="text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                        TOTAL (4 Standalone Services)
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Combined sum of all 4 standalone modules (Card + Reviews + AutoReply + Loyalty)
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    ₹2,246
                  </div>
                  <span className="text-[11px] text-slate-400 line-through">MRP ₹4,495</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold mt-0.5">
                    ₹12.48/day · Save ₹2,249 (50%)
                  </span>
                </td>
                <td className="p-4 text-center bg-amber-100/50 dark:bg-amber-950/30">
                  <div className="text-base font-black text-amber-700 dark:text-amber-400">
                    ₹3,396
                  </div>
                  <span className="text-[11px] text-slate-400 line-through">MRP ₹6,995</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 block font-bold mt-0.5">
                    ₹9.30/day · Save ₹3,599 (~51%)
                  </span>
                </td>
                <td className="p-4 text-center text-xs text-slate-400 font-normal">
                  Sum Total
                </td>
              </tr>

              {/* ─── COMPLETE BUNDLE COMPARISON ROW ─── */}
              <tr className="bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-indigo-500/10 dark:from-emerald-950/30 dark:via-amber-950/30 dark:to-indigo-950/30 border-2 border-indigo-500/50">
                <td className="p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <div className="text-indigo-700 dark:text-indigo-400 font-black text-sm sm:text-base flex items-center gap-2">
                        <span>CustomerPilot Complete All-in-One Engine</span>
                        <Badge className="bg-indigo-600 text-white text-[10px]">ALL-IN-ONE ENGINE</Badge>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        Unified Dashboard + Loyalty Stamps + AI Reviews + 1-Click AutoReply + VIP QR + Direct GBP Sync
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="text-lg font-black text-indigo-700 dark:text-indigo-400">
                    ₹2,499
                  </div>
                  <span className="text-[11px] text-slate-400 line-through">MRP ₹4,998</span>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold block mt-0.5">
                    ₹13.88/day · ~₹417/mo
                  </span>
                  <span className="text-[9px] text-slate-500 block font-semibold mt-1">
                    Complete ₹253 difference (Premium Unified Engine)
                  </span>
                </td>
                <td className="p-4 text-center bg-indigo-500/15 dark:bg-indigo-950/40">
                  <div className="text-xl font-black text-indigo-700 dark:text-indigo-400">
                    ₹4,899
                  </div>
                  <span className="text-[11px] text-slate-400 line-through">MRP ₹9,798</span>
                  <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 block mt-0.5">
                    ₹13.42/day · ~₹408/mo (50% OFF)
                  </span>
                  <span className="text-[9px] text-slate-500 block font-semibold mt-1">
                    Complete ₹1,503 difference (Enterprise Multi-Tool Synergies)
                  </span>
                </td>
                <td className="p-4 text-center">
                  {mode === "public" ? (
                    <Link href="/signup">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl h-9 px-4 shadow-md cursor-pointer">
                        Get Suite →
                      </Button>
                    </Link>
                  ) : mode === "merchant" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        if (complete1YrPlan && onSelectPlan) onSelectPlan(complete1YrPlan)
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl h-9 px-4 shadow-md cursor-pointer"
                    >
                      Choose Suite
                    </Button>
                  ) : (
                    <Badge className="bg-indigo-600 text-white text-[10px]">
                      Best Seller
                    </Badge>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
