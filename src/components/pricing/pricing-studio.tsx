"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check, Sparkles, Shield, Crown, Zap, Gift, Star, Users, ArrowRight,
  Database, HelpCircle, CheckCircle2, Lock, Award, HeartHandshake, Flame,
  ShieldCheck, RefreshCw, MessageSquare, Edit3, Save, CheckSquare, Square,
  Layers, ChevronRight, Tag, Sliders, Info, AlertCircle, ShoppingBag, Eye,
  CreditCard, Calendar, QrCode, Smartphone, PhoneCall, MapPin, Share2,
  TrendingUp, BarChart3, Bot, Compass, Store, Award as Trophy, ThumbsUp,
  Percent, ArrowUpRight, Sparkle, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckoutActivationModal, SelectedCheckoutItem } from "./checkout-activation-modal"

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

// ─── SOURCE OF TRUTH FROM CustomerPilot_Pricing.html ───
// C: Complete plans (Postpaid Monthly 0.3%, 6 Months ₹1,999, 12 Months ₹3,499)
export const COMPLETE_TIERS = [
  { t: "Postpaid · Monthly", d: 30, s: 0, m: 0, planKey: "complete_postpaid", badge: "Zero Upfront", isPostpaid: true },
  { t: "6 Months", d: 180, s: 1999, m: 3998, planKey: "growth_180", badge: "Popular", isPostpaid: false },
  { t: "12 Months", d: 365, s: 3499, m: 6998, planKey: "enterprise_365", badge: "Best Value", isPostpaid: false }
]

// Postpaid Configuration (Placeholders kept for billing extensions)
export const POSTPAID_CONFIG = {
  salesPercent: 0.3,
  salesRateMultiplier: 0.003,
  upfrontFee: 0,
  exampleSales: 500000,
  exampleFee: 1500,
  breakEvenSalesMonthly: 194000, // Monthly sales above which 12M prepaid (₹3,499 / 12 = ~₹583/mo) is more economical
  // Hidden placeholder constants (not displayed in UI as per requirements)
  MIN_FEE: 0,
  GST_NOTE: "exclusive of GST",
  CAP: null as number | null
}

// Gear Combos Configuration
export interface GearComboDefinition {
  gearKey: string
  name: string
  subtitle: string
  badge: string
  iconBg: string
  modulesIncluded: string[] // keys matching standalone services
  tenures: {
    180: { offer: number; regular: number; planKey: string }
    365: { offer: number; regular: number; planKey: string }
  }
}

export const GEAR_COMBOS: GearComboDefinition[] = [
  {
    gearKey: "gear_2",
    name: "Gear 2 : Smart Digital Business Card + Smart AI Google Reviews",
    subtitle: "Smart Digital Business Card + Smart AI Google Reviews",
    badge: "Gear 2 Combo",
    iconBg: "bg-emerald-600",
    modulesIncluded: ["card", "star"],
    tenures: {
      180: { offer: 799, regular: 1598, planKey: "gear2_6mo" },
      365: { offer: 1149, regular: 2298, planKey: "gear2_yearly" }
    }
  },
  {
    gearKey: "gear_3",
    name: "Gear 3 : Smart Digital Business Card + Whatsapp Digital Loyalty Stamps & VIP Club + Smart AI Google Reviews",
    subtitle: "Smart Digital Business Card + Whatsapp Digital Loyalty Stamps & VIP Club + Smart AI Google Reviews",
    badge: "Gear 3 Growth Pack",
    iconBg: "bg-amber-600",
    modulesIncluded: ["card", "loyalty", "star"],
    tenures: {
      180: { offer: 1499, regular: 2998, planKey: "gear3_6mo" },
      365: { offer: 2499, regular: 4998, planKey: "gear3_yearly" }
    }
  },
  {
    gearKey: "gear_4",
    name: "Gear 4 : CustomerPilot Complete",
    subtitle: "Smart Digital Business Card + Whatsapp Digital Loyalty Stamps & VIP Club + Smart AI Google Reviews + 1-Click AI AutoReply",
    badge: "Gear 4 Complete Suite",
    iconBg: "bg-indigo-600",
    modulesIncluded: ["card", "loyalty", "star", "chat"],
    tenures: {
      180: { offer: 1999, regular: 3998, planKey: "growth_180" },
      365: { offer: 3499, regular: 7000, planKey: "enterprise_365" }
    }
  }
]

// S: Standalone Services sorted highest 1Y price first
export const STANDALONE_SERVICES = [
  {
    i: "loyalty",
    n: "Whatsapp Digital Loyalty Stamps & VIP Club",
    t: "Automated WhatsApp loyalty stamp cards, milestone rewards, and customer VIP tier progression.",
    planKey6Mo: "loyalty_6mo",
    planKey1Yr: "loyalty_yearly",
    p: { 180: [899, 1598], 365: [1499, 2598] } as Record<number, [number, number]>,
    iconBg: "bg-purple-600",
    colorText: "text-purple-600 dark:text-purple-400"
  },
  {
    i: "star",
    n: "Smart AI Google Reviews",
    t: "Autonomous WhatsApp review collection with AI-drafted, SEO-optimized reviews. Up to 1,000 (6M) / 2,500 (1Y) reviews.",
    planKey6Mo: "reviews_6mo",
    planKey1Yr: "reviews_yearly",
    p: { 180: [649, 1099], 365: [899, 1599] } as Record<number, [number, number]>,
    iconBg: "bg-amber-500",
    colorText: "text-amber-500 dark:text-amber-400"
  },
  {
    i: "chat",
    n: "1-Click AI AutoReply",
    t: "AI-drafted, SEO-rich owner replies published in 1-click to Google Maps via official Google OAuth.",
    planKey6Mo: "autoreply_6mo",
    planKey1Yr: "autoreply_yearly",
    p: { 180: [549, 1099], 365: [799, 1599] } as Record<number, [number, number]>,
    iconBg: "bg-blue-600",
    colorText: "text-blue-600 dark:text-blue-400"
  },
  {
    i: "card",
    n: "Smart Digital Business Card",
    t: "Interactive Smart QR digital card with 1-tap contact saving and instant review collection.",
    planKey6Mo: "card_6mo",
    planKey1Yr: "card_yearly",
    p: { 180: [349, 699], 365: [499, 1199] } as Record<number, [number, number]>,
    lt: [1499, 3999] as [number, number],
    planKeyLt: "card_lifetime",
    iconBg: "bg-indigo-600",
    colorText: "text-indigo-600 dark:text-indigo-400"
  }
]

// Formatting helpers
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN")
export const dy = (n: number, d: number) => `(₹${(n / d).toFixed(2)}/day)`
export const off = (s: number, m: number) => Math.round((1 - s / m) * 100)

const DEFAULT_INITIAL_PLANS: PlanItem[] = []

export function PricingStudio({
  mode = "public",
  theme = "light",
  initialPlans = DEFAULT_INITIAL_PLANS,
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
  const [adminEditMode, setAdminEditMode] = useState(false)

  // Interactive tenure tab for CustomerPilot Complete Prepaid: 1=6 Months, 2=12 Months (Default 12 Months)
  const [activePrepaidIndex, setActivePrepaidIndex] = useState<number>(2)

  // Standalone selected modules map: { [serviceId]: tenureDays (180 or 365) }
  const [selectedStandalone, setSelectedStandalone] = useState<Record<string, number>>({})

  // Checkout & Account Activation Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [checkoutModalItems, setCheckoutModalItems] = useState<SelectedCheckoutItem[]>([])
  const [checkoutModalTotal, setCheckoutModalTotal] = useState(0)
  const [checkoutModalOriginalTotal, setCheckoutModalOriginalTotal] = useState(0)

  const hasFetchedRef = React.useRef(false)

  // Fetch plans if not passed
  useEffect(() => {
    if (initialPlans && initialPlans.length > 0) {
      setPlans(initialPlans)
      setLoading(false)
      return
    }

    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    const controller = new AbortController()
    let isMounted = true

    const loadPlans = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/pricing/plans", {
          signal: controller.signal,
          cache: "no-store"
        }).catch(() => null)

        if (!res || !res.ok || !isMounted) return

        const data = await res.json().catch(() => null)
        if (isMounted && data?.ok && Array.isArray(data.data?.plans)) {
          setPlans(data.data.plans)
        }
      } catch {
        // Silently fall back to built-in default tiers if network/HMR interrupts fetch
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPlans()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [initialPlans])

  // Helper to find DB plan by key
  const getPlanByKey = (key: string): PlanItem | undefined => {
    return plans.find((p) => p.planKey === key)
  }

  // Active prepaid complete tier
  const activePrepaidTier = COMPLETE_TIERS[activePrepaidIndex]
  const prepaidDbPlan = getPlanByKey(activePrepaidTier.planKey)
  const prepaidPrice = prepaidDbPlan?.price || activePrepaidTier.s
  const prepaidMrp = prepaidDbPlan?.originalPrice || activePrepaidTier.m
  const prepaidDays = activePrepaidTier.d

  // Postpaid tier shortcut
  const postpaidTier = COMPLETE_TIERS[0]

  // Effective monthly costs calculation for progress bars
  const effectiveMonthlyCosts = useMemo(() => {
    return COMPLETE_TIERS.map((tier) => {
      const dbP = getPlanByKey(tier.planKey)
      const p = dbP?.price || tier.s
      const perMonth = tier.d > 0 ? p / (tier.d / 30) : 0
      return perMonth
    })
  }, [plans])

  const maxMonthlyCost = Math.max(effectiveMonthlyCosts[1] || 333, effectiveMonthlyCosts[2] || 292)
  const yearlyCheaperPercent = Math.round(
    (1 - (effectiveMonthlyCosts[2] || 292) / (effectiveMonthlyCosts[1] || 333)) * 100
  )

  // Standalone total calculations
  const standaloneTot = (days: 180 | 365) =>
    STANDALONE_SERVICES.reduce((sum, s) => {
      const dbP = getPlanByKey(days === 180 ? s.planKey6Mo : s.planKey1Yr)
      return sum + (dbP?.price || s.p[days][0])
    }, 0)

  const standaloneMrpTot = (days: 180 | 365) =>
    STANDALONE_SERVICES.reduce((sum, s) => {
      const dbP = getPlanByKey(days === 180 ? s.planKey6Mo : s.planKey1Yr)
      return sum + (dbP?.originalPrice || s.p[days][1])
    }, 0)

  // Floating bottom bar calculations
  const selectedList = useMemo(() => {
    return STANDALONE_SERVICES.filter((s) => selectedStandalone[s.i])
  }, [selectedStandalone])

  const selectedTotalSum = useMemo(() => {
    return selectedList.reduce((sum, s) => {
      const d = selectedStandalone[s.i]
      const dbP = getPlanByKey(d === 180 ? s.planKey6Mo : s.planKey1Yr)
      return sum + (dbP?.price || s.p[d][0])
    }, 0)
  }, [selectedList, selectedStandalone, plans])

  const selectedPerDaySum = useMemo(() => {
    return selectedList.reduce((sum, s) => {
      const d = selectedStandalone[s.i]
      const dbP = getPlanByKey(d === 180 ? s.planKey6Mo : s.planKey1Yr)
      const price = dbP?.price || s.p[d][0]
      return sum + price / d
    }, 0)
  }, [selectedList, selectedStandalone, plans])

  const selectedOriginalSum = useMemo(() => {
    return selectedList.reduce((sum, s) => {
      const d = selectedStandalone[s.i]
      const dbP = getPlanByKey(d === 180 ? s.planKey6Mo : s.planKey1Yr)
      return sum + (dbP?.originalPrice || s.p[d][1])
    }, 0)
  }, [selectedList, selectedStandalone, plans])

  // Toggle selection
  const handleToggleStandalone = (serviceId: string, days: number) => {
    setSelectedStandalone((prev) => {
      const next = { ...prev }
      if (next[serviceId] === days) {
        delete next[serviceId]
      } else {
        next[serviceId] = days
      }
      return next
    })
  }

  // Sync selected standalone modules to onSelectPlan whenever selection changes
  useEffect(() => {
    if (!onSelectPlan) return
    if (selectedList.length === 1) {
      const s = selectedList[0]
      const d = selectedStandalone[s.i]
      const planKey = d === 180 ? s.planKey6Mo : s.planKey1Yr
      const dbP = getPlanByKey(planKey)
      const p: PlanItem = dbP || {
        id: planKey,
        planKey,
        name: `${s.n} (${d === 180 ? "6 Months" : "1 Year"})`,
        price: s.p[d][0],
        originalPrice: s.p[d][1],
        days: d,
        features: [s.t],
        enabledModules: s.i === "loyalty" ? "LOYALTY" : s.i === "star" ? "REVIEWS" : s.i === "chat" ? "AUTOREPLY" : s.i === "card" ? "DIGITAL_CARD" : s.i
      }
      onSelectPlan(p)
    } else if (selectedList.length > 1) {
      const maxDays = Math.max(...selectedList.map((s) => selectedStandalone[s.i] || 365))
      const p: PlanItem = {
        id: "custom_bundle",
        planKey: "custom_bundle",
        name: `Custom Bundle (${selectedList.length} services)`,
        price: selectedTotalSum,
        originalPrice: selectedOriginalSum,
        days: maxDays,
        features: selectedList.map((s) => s.n),
        enabledModules: selectedList.map((s) => {
          if (s.i === "loyalty") return "LOYALTY"
          if (s.i === "star") return "REVIEWS"
          if (s.i === "chat") return "AUTOREPLY"
          if (s.i === "card") return "DIGITAL_CARD"
          return s.i
        }).join(",")
      }
      onSelectPlan(p, { selectedStandalone })
    }
  }, [selectedStandalone, selectedTotalSum, selectedOriginalSum, selectedList, plans])

  const handleClearStandalone = () => {
    setSelectedStandalone({})
  }

  // Handle Combo plan checkout (Gear 2, Gear 3, Gear 4)
  const handleSelectGearCombo = (combo: GearComboDefinition, tenureDays: 180 | 365) => {
    const tenureData = combo.tenures[tenureDays]
    const dbP = getPlanByKey(tenureData.planKey)
    const price = dbP?.price || tenureData.offer
    const originalPrice = dbP?.originalPrice || tenureData.regular

    const moduleMapping: Record<string, string> = {
      card: "DIGITAL_CARD",
      star: "REVIEWS",
      loyalty: "LOYALTY",
      chat: "AUTOREPLY"
    }
    const enabledModules = combo.modulesIncluded.map((m) => moduleMapping[m] || m).join(",")

    if (mode === "merchant" && onCheckout) {
      const p: PlanItem = dbP || {
        id: tenureData.planKey,
        planKey: tenureData.planKey,
        name: `${combo.name} (${tenureDays === 180 ? "6 Months" : "1 Year"})`,
        price,
        originalPrice,
        days: tenureDays,
        features: [combo.subtitle],
        enabledModules
      }
      if (onSelectPlan) onSelectPlan(p)
      onCheckout(p)
      return
    }

    const item: SelectedCheckoutItem = {
      id: tenureData.planKey,
      name: `${combo.name} (${tenureDays === 180 ? "6 Months" : "1 Year"})`,
      tenureDays,
      price,
      originalPrice,
      planKey: tenureData.planKey,
      iconBg: combo.iconBg,
      moduleKey: combo.gearKey
    }

    setCheckoutModalItems([item])
    setCheckoutModalTotal(price)
    setCheckoutModalOriginalTotal(originalPrice)
    setCheckoutModalOpen(true)
  }

  // Handle plan purchase
  const handleSelectComplete = (tierIndex: number) => {
    const tier = COMPLETE_TIERS[tierIndex]
    const dbP = getPlanByKey(tier.planKey)
    const p: PlanItem = dbP || {
      id: tier.planKey,
      planKey: tier.planKey,
      name: `Gear 4 : CustomerPilot Complete (${tier.t})`,
      price: tier.s,
      originalPrice: tier.m,
      days: tier.d,
      features: [
        "Smart Digital Business Card",
        "Smart AI Google Reviews",
        "1-Click AI AutoReply",
        "Whatsapp Digital Loyalty Stamps & VIP Club"
      ],
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD"
    }

    if (onSelectPlan) onSelectPlan(p)
    if (onCheckout) onCheckout(p)
  }

  // Handle Complete tier checkout in public mode
  const handleSelectCompletePublic = (tierIndex: number) => {
    const tier = COMPLETE_TIERS[tierIndex]
    const dbP = getPlanByKey(tier.planKey)
    const item: SelectedCheckoutItem = {
      id: "complete_" + tier.d,
      name: `Gear 4 : CustomerPilot Complete (${tier.t})`,
      tenureDays: tier.d,
      price: dbP?.price || tier.s,
      originalPrice: dbP?.originalPrice || tier.m,
      planKey: tier.planKey,
      iconBg: "bg-indigo-600",
      moduleKey: "complete"
    }
    setCheckoutModalItems([item])
    setCheckoutModalTotal(dbP?.price || tier.s)
    setCheckoutModalOriginalTotal(dbP?.originalPrice || tier.m)
    setCheckoutModalOpen(true)
  }

  // Handle Lifetime Deal checkout
  const handleSelectLifetimeDeal = () => {
    const dbP = getPlanByKey("card_lifetime")
    const item: SelectedCheckoutItem = {
      id: "card_lifetime",
      name: "Smart Digital Business Card · Lifetime Deal",
      tenureDays: 3650,
      price: dbP?.price || 1499,
      originalPrice: dbP?.originalPrice || 3999,
      planKey: "card_lifetime",
      iconBg: "bg-indigo-600",
      moduleKey: "card"
    }

    if (mode === "merchant" && onCheckout) {
      const p: PlanItem = dbP || {
        id: "card_lifetime",
        planKey: "card_lifetime",
        name: "Smart Digital Business Card · Lifetime Deal",
        price: 1499,
        originalPrice: 3999,
        days: 3650,
        features: ["Permanent Cloud Hosting", "Digital Card & QR"],
        enabledModules: "DIGITAL_CARD"
      }
      if (onSelectPlan) onSelectPlan(p)
      onCheckout(p)
      return
    }

    setCheckoutModalItems([item])
    setCheckoutModalTotal(dbP?.price || 1499)
    setCheckoutModalOriginalTotal(dbP?.originalPrice || 3999)
    setCheckoutModalOpen(true)
  }

  // Handle Standalone checkout
  const handleCheckoutStandalone = () => {
    if (selectedList.length === 0) return

    const items: SelectedCheckoutItem[] = selectedList.map((s) => {
      const d = selectedStandalone[s.i]
      const planKey = d === 180 ? s.planKey6Mo : s.planKey1Yr
      const dbP = getPlanByKey(planKey)
      return {
        id: s.i,
        name: `${s.n} (${d === 180 ? "6 Months" : "1 Year"})`,
        tenureDays: d,
        price: dbP?.price || s.p[d][0],
        originalPrice: dbP?.originalPrice || s.p[d][1],
        planKey,
        iconBg: s.iconBg,
        moduleKey: s.i
      }
    })

    if (mode === "merchant" && onCheckout) {
      const maxDays = Math.max(...selectedList.map((s) => selectedStandalone[s.i] || 365))
      const bundlePlan: PlanItem = {
        id: selectedList.length === 1 ? (getPlanByKey(items[0].planKey)?.id || items[0].planKey) : "custom_bundle",
        planKey: selectedList.length === 1 ? items[0].planKey : "custom_bundle",
        name: selectedList.length === 1 ? items[0].name : `Custom Bundle (${selectedList.length} services)`,
        price: selectedTotalSum,
        originalPrice: selectedOriginalSum,
        days: maxDays,
        features: selectedList.map((s) => s.n),
        enabledModules: selectedList.map((s) => {
          if (s.i === "loyalty") return "LOYALTY"
          if (s.i === "star") return "REVIEWS"
          if (s.i === "chat") return "AUTOREPLY"
          if (s.i === "card") return "DIGITAL_CARD"
          return s.i
        }).join(",")
      }
      if (onSelectPlan) onSelectPlan(bundlePlan)
      onCheckout(bundlePlan)
      return
    }

    setCheckoutModalItems(items)
    setCheckoutModalTotal(selectedTotalSum)
    setCheckoutModalOriginalTotal(selectedOriginalSum)
    setCheckoutModalOpen(true)
  }

  // Admin save changes
  const handleSaveAllPlans = async () => {
    setSavingPlans(true)
    try {
      const res = await fetch("/api/pricing/plans/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans })
      })
      const data = await res.json()
      if (data.ok) {
        toast({
          title: "Pricing Updated Successfully",
          description: "All prices and plans have been synchronized live."
        })
      } else {
        throw new Error(data.error || "Update failed")
      }
    } catch (err: any) {
      toast({
        title: "Update Error",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setSavingPlans(false)
    }
  }

  const isDark = theme === "dark" || mode === "superadmin"

  return (
    <div className={`w-full transition-colors duration-200 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
      {/* ─── Hero Section ─── */}
      <section className="text-center py-6 sm:py-10 relative">
        {/* Big High-Impact 50% OFF Discount Banner Card (Matches Dashboard Subscription Screenshot) */}
        {mode !== "merchant" && (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-2 border-amber-400/60 p-5 sm:p-7 shadow-sm mb-8 sm:mb-10 text-left">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left text & details */}
              <div className="flex items-start sm:items-center gap-4 text-left flex-1">
                <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 items-center justify-center flex-shrink-0 text-amber-600 shadow-xs">
                  <Flame className="w-8 h-8 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-widest mb-2">
                    <Flame className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Limited Time 50% Discount Offer
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                    All Plans Locked at Flat Half Price!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
                    Complete WhatsApp Loyalty, Smart AI Google Reviews &amp; 1-Click AutoReply.{" "}
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">Main Price:</span> <span className="font-extrabold text-slate-500 dark:text-slate-400 line-through decoration-rose-500 decoration-2">₹6,998/yr</span> ➔ <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Offer Price: ₹3,499/yr</span> (₹9.59/day). Standalone <span className="font-extrabold text-slate-500 dark:text-slate-400 line-through decoration-rose-500 decoration-2">₹1,199/yr</span> ➔ <span className="text-amber-700 dark:text-amber-400 font-extrabold">₹499/yr</span> (₹1.37/day).
                  </p>
                </div>
              </div>

              {/* Right Biggest Font Highlight */}
              <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center justify-center px-8 py-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-amber-400 shadow-md text-center">
                <span className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">FLAT DISCOUNT</span>
                <div className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 drop-shadow-xs">
                  50% OFF
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold tracking-wide">
                  ⚡ INSTANT SAVINGS LOCKED
                </div>
              </div>
            </div>
          </div>
        )}

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Simple, Flexible{" "}
          <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
            Pricing
          </span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-xl max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
          One platform or one tool at a time. Every price comes with its true daily cost, so you always know what you pay.
        </p>

        {/* Admin toggle if enabled */}
        {(showAdminToggle || mode === "superadmin") && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setAdminEditMode(!adminEditMode)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Admin edit mode</span>
            </button>
            {adminEditMode && (
              <Button
                size="sm"
                onClick={handleSaveAllPlans}
                disabled={savingPlans}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-xl"
              >
                {savingPlans ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Changes
              </Button>
            )}
          </div>
        )}
      </section>

      {/* ─── SECTION 1: CustomerPilot Complete (Prepaid & Postpaid Showcase) ─── */}
      <section className="space-y-6 mb-14">
        <div className="pb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            All-in-one Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Gear 4 : CustomerPilot Complete
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            All 4 flagship engines in one unified subscription: Smart Digital Business Card, Smart AI Google Reviews, 1-Click AI AutoReply, and Whatsapp Digital Loyalty Stamps & VIP Club.
          </p>
        </div>

        {/* 2 Dedicated Cards Side-by-Side: Prepaid Complete (6M / 12M) vs Dedicated Postpaid Complete */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* ══════ CARD 1: COMPLETE PREPAID PLANS (6M & 12M) ══════ */}
          <div
            className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 border border-cyan-400/30"
            style={{
              background: "radial-gradient(600px 320px at 90% 10%, rgba(255,255,255,0.22), transparent 70%), linear-gradient(135deg, #0284c7 0%, #0369a1 25%, #1e40af 70%, #4338ca 100%)"
            }}
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Prepaid Header & Tenure Selector */}
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-black uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-300" /> Gear 4 : Prepaid Plans (Flat 50% OFF)
                </div>

                {/* Tenure Switcher Tabs (6 Months vs 12 Months) */}
                <div className="inline-flex bg-slate-950/30 backdrop-blur-md rounded-2xl p-1 border border-white/15 shadow-inner">
                  {[COMPLETE_TIERS[1], COMPLETE_TIERS[2]].map((tier, localIdx) => {
                    const globalIdx = localIdx + 1
                    const isActive = activePrepaidIndex === globalIdx
                    return (
                      <button
                        key={tier.t}
                        type="button"
                        onClick={() => setActivePrepaidIndex(globalIdx)}
                        className={`font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 ${
                          isActive
                            ? "bg-white text-slate-950 shadow-md shadow-slate-950/20 scale-[1.02]"
                            : "text-white/85 hover:text-white hover:bg-white/15"
                        }`}
                      >
                        <span>{tier.t}</span>
                        {tier.badge && (
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded tracking-wider ${
                              isActive ? "bg-cyan-100 text-cyan-800" : "bg-white/20 text-white"
                            }`}
                          >
                            {tier.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Pricing Display */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-slate-950/35 border border-white/20 rounded-xl px-3.5 py-1.5 backdrop-blur-xs">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    Main Price:
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-white/90 line-through decoration-rose-400 decoration-2">
                    {inr(prepaidMrp)}
                  </span>
                  <span className="text-xs font-semibold text-white/75">
                    {dy(prepaidMrp, prepaidDays)}
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 px-2.5 py-1 rounded-lg self-center">
                    Offer Price:
                  </span>
                  <span className="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-sm text-white">
                    {inr(prepaidPrice)}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-cyan-100/95">
                    {dy(prepaidPrice, prepaidDays)}
                  </span>
                </div>

                {/* MRP & Savings Strip */}
                <div className="flex items-center gap-2.5 flex-wrap mt-2.5 text-xs sm:text-sm">
                  <span className="bg-emerald-400 text-slate-950 font-black text-xs rounded-full px-3 py-0.5 shadow-xs">
                    FLAT {off(prepaidPrice, prepaidMrp)}% OFF
                  </span>
                  <span className="text-white font-bold bg-white/15 px-3 py-0.5 rounded-full">
                    Instant Savings: {inr(prepaidMrp - prepaidPrice)}
                  </span>
                </div>
              </div>

              {/* Included Items 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-6 text-xs sm:text-sm">
                {[
                  "Whatsapp Digital Loyalty Stamps & VIP Club",
                  "Smart AI Google Reviews",
                  "1-Click AI AutoReply",
                  "Smart Digital Business Card"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-white/10 backdrop-blur-xs rounded-xl px-3 py-2 border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-cyan-400/30 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold text-white/95">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 relative z-10">
              {mode === "public" ? (
                <button
                  type="button"
                  onClick={() => handleSelectCompletePublic(activePrepaidIndex)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl py-3.5 px-6 shadow-lg shadow-slate-950/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Choose Gear 4 {activePrepaidTier.t} Prepaid Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : mode === "merchant" ? (
                <button
                  type="button"
                  onClick={() => handleSelectComplete(activePrepaidIndex)}
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl py-3.5 px-6 shadow-lg shadow-slate-950/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Choose Gear 4 {activePrepaidTier.t} Prepaid Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full bg-white text-slate-950 font-bold text-sm sm:text-base rounded-xl py-3.5 px-6 shadow-md"
                >
                  Active Plan Preview
                </button>
              )}
            </div>
          </div>

          {/* ══════ CARD 2: DEDICATED POSTPAID MONTHLY CARD ══════ */}
          <div
            className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 border-2 border-emerald-400/60 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950"
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Postpaid Header Badges */}
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Gear 4 : Performance Postpaid · Zero Upfront
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  Billed at Month-End
                </span>
              </div>

              {/* Pricing Display */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-slate-950/60 border border-emerald-400/30 rounded-xl px-3.5 py-1.5 backdrop-blur-xs">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Upfront Activation:
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-300">
                    ₹0 (Zero Upfront Fee)
                  </span>
                </div>

                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2.5 py-1 rounded-lg self-center">
                    Postpaid Fee:
                  </span>
                  <span className="text-4xl sm:text-6xl font-black tracking-tight drop-shadow-sm text-white">
                    0.3%
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-emerald-200/90">
                    of monthly store sales
                  </span>
                </div>

                {/* Example calculation box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-400/20 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span>Example: ₹5,00,000 monthly sales = ₹1,500/month</span>
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    Pay nothing upfront. Billed monthly based on store sales entered in your merchant dashboard.
                  </div>
                </div>

                {/* Break-even note */}
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] text-slate-200 leading-relaxed">
                  <strong className="text-amber-300">Approx. Estimate:</strong> For monthly store sales above ₹1,94,000, our 12-Month plan (₹3,499/year ≈ ₹583/month) is more economical.
                </div>
              </div>

              {/* Included Items 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-6 text-xs sm:text-sm">
                {[
                  "Whatsapp Digital Loyalty Stamps & VIP Club",
                  "Smart AI Google Reviews",
                  "1-Click AI AutoReply",
                  "Smart Digital Business Card"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-slate-800/40 backdrop-blur-xs rounded-xl px-3 py-2 border border-emerald-400/20">
                    <div className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold text-white/95">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2 relative z-10">
              {mode === "public" ? (
                <button
                  type="button"
                  onClick={() => handleSelectCompletePublic(0)}
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm sm:text-base rounded-xl py-3.5 px-6 shadow-lg shadow-emerald-950/30 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Choose Gear 4 Postpaid Plan (0.3% of sales)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : mode === "merchant" ? (
                <button
                  type="button"
                  onClick={() => handleSelectComplete(0)}
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm sm:text-base rounded-xl py-3.5 px-6 shadow-lg shadow-emerald-950/30 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Choose Gear 4 Postpaid Plan (0.3% of sales)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base rounded-xl py-3.5 px-6 shadow-md"
                >
                  Active Plan Preview
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ══════ EFFECTIVE MONTHLY COST & TENURE COMPARISON BAR ══════ */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Effective Monthly Cost &amp; Billing Comparison
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Compare per-month equivalent pricing across prepaid tenures and zero-upfront postpaid.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 self-start md:self-center">
              Complete Suite Breakdown
            </span>
          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 12 Months */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-900 dark:text-white">
                  12 Months (Prepaid)
                </span>
                <span className="text-xs font-bold text-slate-400 line-through decoration-rose-500">
                  ₹583/mo
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  ₹292
                </span>
                <span className="text-xs font-semibold text-slate-500">/ month</span>
                <span className="ml-auto text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Best Value
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: "88%" }} />
              </div>
            </div>

            {/* 6 Months */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-slate-900 dark:text-white">
                  6 Months (Prepaid)
                </span>
                <span className="text-xs font-bold text-slate-400 line-through decoration-rose-500">
                  ₹666/mo
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-sky-600 dark:text-sky-400">
                  ₹333
                </span>
                <span className="text-xs font-semibold text-slate-500">/ month</span>
                <span className="ml-auto text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
                  Popular
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-sky-500" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Postpaid */}
            <div className="p-3.5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-emerald-900 dark:text-emerald-300">
                  Postpaid · Monthly
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  ₹0 Upfront
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  0.3%
                </span>
                <span className="text-xs font-semibold text-slate-500">of sales</span>
                <span className="ml-auto text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  Zero Upfront
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: "100%" }} />
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
            <span>
              12 Months works out <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{yearlyCheaperPercent}% lower cost</strong> than 6 Months.
            </span>
            <span>
              Postpaid fee is ₹0 upfront, billed 0.3% of sales at month-end.
            </span>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: GEAR GROWTH COMBOS (Gear 2, Gear 3, Gear 4) ─── */}
      <section className="space-y-6 mb-16">
        <div className="pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 text-indigo-600" /> Growth Packs &amp; Combos
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Pre-Configured Gear Combos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered combos designed for maximum retention velocity. Save up to 50% compared to standalone pricing.
          </p>
        </div>

        {/* 3-Column Responsive Modern Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {GEAR_COMBOS.map((combo) => {
            const dbPlan6 = getPlanByKey(combo.tenures[180].planKey)
            const dbPlan1 = getPlanByKey(combo.tenures[365].planKey)

            const p180 = dbPlan6?.price || combo.tenures[180].offer
            const m180 = dbPlan6?.originalPrice || combo.tenures[180].regular

            const p365 = dbPlan1?.price || combo.tenures[365].offer
            const m365 = dbPlan1?.originalPrice || combo.tenures[365].regular

            const isGear4 = combo.gearKey === "gear_4"
            const isGear3 = combo.gearKey === "gear_3"

            // Standalone total comparison
            const standalone1YrSum = combo.modulesIncluded.reduce((acc, modKey) => {
              const serv = STANDALONE_SERVICES.find((s) => s.i === modKey)
              if (!serv) return acc
              const sDbP = getPlanByKey(serv.planKey1Yr)
              return acc + (sDbP?.price || serv.p[365][0])
            }, 0)
            const savings1YrVsStandalone = Math.max(0, standalone1YrSum - p365)

            return (
              <div
                key={combo.gearKey}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative overflow-hidden border ${
                  isGear4
                    ? "bg-gradient-to-b from-indigo-50/70 via-white to-sky-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900 border-indigo-400 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10"
                    : isGear3
                    ? "bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/60 shadow-sm hover:shadow-md"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md"
                }`}
              >
                {/* Glow accent for Gear 4 */}
                {isGear4 && (
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
                )}

                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isGear4
                          ? "bg-indigo-600 text-white"
                          : isGear3
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                          : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                      }`}
                    >
                      {combo.badge}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                      50% OFF
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
                    {combo.subtitle}
                  </p>

                  {/* Included Engines Checklist */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Modules:
                    </span>
                    {combo.modulesIncluded.map((modKey) => {
                      const serv = STANDALONE_SERVICES.find((s) => s.i === modKey)
                      return (
                        <div key={modKey} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span>{serv?.n || modKey}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pricing Tiers Box */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {/* 1 Year Option (Recommended) */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">1 Year Plan</span>
                          {savings1YrVsStandalone > 0 && (
                            <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-1.5 py-0.2 rounded">
                              Save {inr(savings1YrVsStandalone)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            {inr(p365)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 line-through decoration-rose-500">
                            {inr(m365)}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">({dy(p365, 365)})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectGearCombo(combo, 365)}
                        className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer transition shrink-0"
                      >
                        Choose 1Y
                      </button>
                    </div>

                    {/* 6 Months Option */}
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">6 Months Plan</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                            {inr(p180)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 line-through decoration-rose-500">
                            {inr(m180)}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">({dy(p180, 180)})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectGearCombo(combo, 180)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-600 hover:text-indigo-600 cursor-pointer transition shrink-0"
                      >
                        Choose 6M
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── SECTION 3: MODULAR STANDALONE TOOLS & BUILD-YOUR-OWN BUNDLE ─── */}
      <section className="space-y-4 mb-16">
        <div className="pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5 text-slate-600" /> Modular Retention Tools
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Or Choose Exactly What You Need
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Add any individual engine for 6 Months or 1 Year, or combine them to craft your bespoke retention stack.
          </p>
        </div>

        {/* Responsive Table Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold bg-slate-50/60 dark:bg-slate-950/40">
                  <th className="py-4 px-6 w-[43%]">Standalone Engine</th>
                  <th className="py-4 px-6 w-[28.5%]">6 Months (Main vs Offer Price)</th>
                  <th className="py-4 px-6 w-[28.5%]">1 Year (Main vs Offer Price)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {STANDALONE_SERVICES.map((s) => {
                  const dbPlan6 = getPlanByKey(s.planKey6Mo)
                  const dbPlan1 = getPlanByKey(s.planKey1Yr)

                  const p180 = dbPlan6?.price || s.p[180][0]
                  const m180 = dbPlan6?.originalPrice || s.p[180][1]

                  const p365 = dbPlan1?.price || s.p[365][0]
                  const m365 = dbPlan1?.originalPrice || s.p[365][1]

                  const isAdded180 = selectedStandalone[s.i] === 180
                  const isAdded365 = selectedStandalone[s.i] === 365

                  return (
                    <tr key={s.i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      {/* Service Info */}
                      <td className="py-5 px-6 align-top">
                        <div className="flex items-start gap-3.5">
                          {/* Vibrant Icon Box */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${s.iconBg}`}>
                            {s.i === "loyalty" && <Gift className="w-5 h-5" />}
                            {s.i === "star" && <Star className="w-5 h-5" />}
                            {s.i === "chat" && <MessageSquare className="w-5 h-5" />}
                            {s.i === "card" && <CreditCard className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                              {s.n}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {s.t}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 6 Months Cell */}
                      <td className="py-5 px-6 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Main Price:
                            </span>
                            <span className="text-sm sm:text-base font-extrabold text-slate-600 dark:text-slate-300 line-through decoration-rose-500 decoration-2">
                              {inr(m180)}
                            </span>
                            <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                              {off(p180, m180)}% OFF
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              Offer:
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                              {inr(p180)}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {dy(p180, 180)}
                            </span>
                          </div>
                          <div className="pt-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStandalone(s.i, 180)}
                              className={`text-xs font-semibold px-4 py-1.5 rounded-lg border transition cursor-pointer ${
                                isAdded180
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-600 hover:text-indigo-600"
                              }`}
                            >
                              {isAdded180 ? "✓ Added" : "Add"}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 1 Year Cell */}
                      <td className="py-5 px-6 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Main Price:
                            </span>
                            <span className="text-sm sm:text-base font-extrabold text-slate-600 dark:text-slate-300 line-through decoration-rose-500 decoration-2">
                              {inr(m365)}
                            </span>
                            <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                              {off(p365, m365)}% OFF
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                              Offer:
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                              {inr(p365)}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {dy(p365, 365)}
                            </span>
                          </div>
                          <div className="pt-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStandalone(s.i, 365)}
                              className={`text-xs font-semibold px-4 py-1.5 rounded-lg border transition cursor-pointer ${
                                isAdded365
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                  : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-600 hover:text-indigo-600"
                              }`}
                            >
                              {isAdded365 ? "✓ Added" : "Add"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {/* ─── ROW 5: TOTAL (4 Standalone Services) ─── */}
                <tr className="bg-slate-50 dark:bg-slate-950/60 font-semibold border-t-2 border-slate-200 dark:border-slate-800">
                  <td className="py-5 px-6">
                    <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      Total · 4 Standalone Engines
                    </div>
                  </td>
                  <td className="py-5 px-6 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase text-slate-500">Main Total:</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-600 dark:text-slate-300 line-through decoration-rose-500 decoration-2">
                        {inr(standaloneMrpTot(180))}
                      </span>
                      <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px] px-2 py-0.5 rounded-full">
                        Save {inr(standaloneMrpTot(180) - standaloneTot(180))}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Offer: {inr(standaloneTot(180))} <span className="text-xs font-normal text-slate-500">{dy(standaloneTot(180), 180)}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase text-slate-500">Main Total:</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-600 dark:text-slate-300 line-through decoration-rose-500 decoration-2">
                        {inr(standaloneMrpTot(365))}
                      </span>
                      <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px] px-2 py-0.5 rounded-full">
                        Save {inr(standaloneMrpTot(365) - standaloneTot(365))}
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Offer: {inr(standaloneTot(365))} <span className="text-xs font-normal text-slate-500">{dy(standaloneTot(365), 365)}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Lifetime Deal Card (Smart Digital Business Card) ─── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-1">
                Permanent Cloud Ownership
              </div>
              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Smart Digital Business Card · Lifetime Deal
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pay once. Zero renewal fees forever. Includes permanent cloud hosting and counter QR kit.
              </p>
            </div>
          </div>
          <div className="text-right w-full sm:w-auto flex flex-col sm:flex-row items-center sm:items-center justify-between sm:justify-end gap-4">
            <div className="flex flex-col items-end justify-center w-full sm:w-auto space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Main Price:
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-600 dark:text-slate-300 line-through decoration-rose-500 decoration-2">
                  {inr(3999)}
                </span>
                <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-[11px] px-2 py-0.5 rounded-full">
                  62% OFF
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Offer: <span className="text-indigo-600 dark:text-indigo-400">{inr(1499)}</span>{" "}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({dy(1499, 3650)})</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSelectLifetimeDeal}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl shadow-xs transition shrink-0 cursor-pointer"
            >
              Get Lifetime Deal →
            </button>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner with Brand Logo Cyan-Sky-Indigo Gradient (Public Only) ─── */}
      {mode !== "merchant" && (
        <section
          className="rounded-3xl p-8 sm:p-14 text-center text-white relative overflow-hidden my-14 shadow-xl border border-cyan-400/30"
          style={{
            background: "radial-gradient(600px 320px at 80% 20%, rgba(255,255,255,0.22), transparent 70%), linear-gradient(135deg, #0284c7 0%, #0369a1 25%, #1e40af 70%, #4338ca 100%)"
          }}
        >
          {/* Subtle ambient light accents */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              Ready to turn Walk-in Customers into Repeat and Loyal ?
            </h2>
            <p className="text-cyan-100/90 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed font-medium">
              Start with one module, upgrade to Complete anytime. Transparent ROI from Day 1.
            </p>
            <div className="pt-2">
              <Link href={selectedList.length > 0 ? `/signup?module=${selectedList.map(s => s.i === "star" ? "reviews" : s.i === "chat" ? "autoreply" : s.i).join(",")}` : "/signup"}>
                <button
                  type="button"
                  className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm sm:text-base rounded-xl py-4 px-9 shadow-lg shadow-slate-950/20 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Get started today</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footnote */}
      <div className="text-center text-xs text-slate-400 pb-16">
        All prices in INR. Per-day cost = price ÷ plan days (Lifetime: 3,650 days).
      </div>

      {/* ─── Sticky Floating Bottom Selection Bar ─── */}
      <AnimatePresence>
        {selectedList.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed left-0 right-0 bottom-0 z-[60] p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-2 sm:pr-20">
              <div className="flex items-center gap-2.5 flex-wrap text-sm text-slate-700 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedList.length} selected
                </span>
                <span>·</span>
                <span className="text-xs font-bold uppercase text-slate-500">
                  Main Price:
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-500 dark:text-slate-400 line-through decoration-rose-500 decoration-2">
                  {inr(selectedOriginalSum)}
                </span>
                <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                  Offer:
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {inr(selectedTotalSum)}
                </span>
                <span className="text-xs text-slate-500">
                  (₹{selectedPerDaySum.toFixed(2)}/day)
                </span>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Save {inr(selectedOriginalSum - selectedTotalSum)}
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleClearStandalone}
                  className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCheckoutStandalone}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue →</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Checkout & Instant Account Activation Modal ─── */}
      <CheckoutActivationModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        selectedItems={checkoutModalItems}
        totalAmount={checkoutModalTotal}
        totalOriginalPrice={checkoutModalOriginalTotal}
      />
    </div>
  )
}
