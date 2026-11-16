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

// ─── CANONICAL GEAR TIERS ───
export const COMPLETE_TIERS = [
  { t: "6 Months", d: 180, s: 1899, m: 1899, planKey: "gear4_6mo", badge: "6 Months", isPostpaid: false },
  { t: "12 Months", d: 365, s: 2499, m: 2499, planKey: "gear4_yearly", badge: "Best Value", isPostpaid: false }
]

// Gear Combos Configuration
export interface GearComboDefinition {
  gearKey: string
  name: string
  subtitle: string
  badge: string
  iconBg: string
  modulesIncluded: string[] // keys matching standalone services
  isMonthly?: boolean
  tenures: {
    30?: { offer: number; regular: number; planKey: string }
    180?: { offer: number; regular: number; planKey: string }
    365?: { offer: number; regular: number; planKey: string }
  }
}

export const GEAR_COMBOS: GearComboDefinition[] = [
  {
    gearKey: "gear_1",
    name: "Gear 1 : Smart Digital Business Card + Smart AI Google Review System",
    subtitle: "Interactive digital business card plus autonomous AI Google review acceleration for local stores.",
    badge: "⭐ Gear 1 · Card + Reviews",
    iconBg: "bg-emerald-600",
    modulesIncluded: ["card", "star"],
    tenures: {
      180: { offer: 899, regular: 899, planKey: "gear1_6mo" },
      365: { offer: 1249, regular: 1249, planKey: "gear1_yearly" }
    }
  },
  {
    gearKey: "gear_2",
    name: "Gear 2 : Smart Digital Business Card + WhatsApp Digital Loyalty System",
    subtitle: "High-retention combo: WhatsApp automated loyalty stamps plus interactive digital business card.",
    badge: "🚀 Gear 2 · Card + Loyalty",
    iconBg: "bg-purple-600",
    modulesIncluded: ["card", "loyalty"],
    tenures: {
      180: { offer: 1499, regular: 1499, planKey: "gear2_6mo" },
      365: { offer: 2249, regular: 2249, planKey: "gear2_yearly" }
    }
  },
  {
    gearKey: "gear_3",
    name: "Gear 3 : WhatsApp Digital Loyalty + Smart AI Google Review System + Smart Digital Business Card",
    subtitle: "Trio retention suite: Digital card, WhatsApp loyalty stamps, and smart AI Google reviews.",
    badge: "⚡ Gear 3 · Power Trio",
    iconBg: "bg-blue-600",
    modulesIncluded: ["card", "loyalty", "star"],
    tenures: {
      180: { offer: 1799, regular: 1799, planKey: "gear3_6mo" },
      365: { offer: 3499, regular: 3499, planKey: "gear3_yearly" }
    }
  },
  {
    gearKey: "gear_4",
    name: "Gear 4 : All 4 Core Engines",
    subtitle: "Smart Digital Business Card + WhatsApp Digital Loyalty + Smart AI Google Review System + AutoReply to GoogleReview.",
    badge: "👑 Gear 4 · All 4 Core Engines",
    iconBg: "bg-indigo-600",
    modulesIncluded: ["card", "loyalty", "star", "chat"],
    tenures: {
      180: { offer: 1899, regular: 1899, planKey: "gear4_6mo" },
      365: { offer: 2499, regular: 2499, planKey: "gear4_yearly" }
    }
  },
  {
    gearKey: "gear_5",
    name: "Gear 5 : CustomerPilot All-in-One Enterprise",
    subtitle: "All 8 Engines: Card, Loyalty, Reviews, AutoReply, Dynamic QR Studio, WhatsApp Group Booster, Smart POS Billing & Invoicing, and 24/7 AI WhatsApp ChatBot.",
    badge: "💎 Gear 5 · All-in-One Enterprise",
    iconBg: "bg-rose-600",
    modulesIncluded: ["card", "loyalty", "star", "chat", "qr_lite", "wa_booster", "smart_billing", "chatbot"],
    tenures: {
      30: { offer: 999, regular: 999, planKey: "gear5_monthly" },
      365: { offer: 9999, regular: 9999, planKey: "gear5_yearly" }
    }
  }
]

export const getGearSavings1Yr = (combo: GearComboDefinition, getPlanByKeyFn?: (key: string) => PlanItem | undefined) => {
  if (!combo.tenures[365]) return 0
  const standalone1YrSum = combo.modulesIncluded.reduce((acc, modKey) => {
    const serv = STANDALONE_SERVICES.find((s) => s.i === modKey)
    if (!serv) return acc
    const sDbP = getPlanByKeyFn ? getPlanByKeyFn(serv.planKey1Yr) : null
    return acc + (sDbP?.price || serv.p[365][0])
  }, 0)
  return Math.max(0, standalone1YrSum - combo.tenures[365].offer)
}


// S: Standalone Services sorted highest 1Y price first
export const STANDALONE_SERVICES = [
  {
    i: "star",
    n: "Smart AI Google Review System",
    t: "Autonomous WhatsApp review collection with AI-drafted, SEO-optimized 5-star customer reviews.",
    planKey6Mo: "reviews_6mo",
    planKey1Yr: "reviews_yearly",
    p: { 180: [649, 1099], 365: [999, 999] } as Record<number, [number, number]>,
    iconBg: "bg-amber-500",
    colorText: "text-amber-500 dark:text-amber-400"
  },
  {
    i: "loyalty",
    n: "WhatsApp Digital Loyalty Membership Club",
    t: "Automated WhatsApp loyalty stamp cards, milestone rewards, and customer VIP tier progression club.",
    planKey6Mo: "loyalty_6mo",
    planKey1Yr: "loyalty_yearly",
    p: { 180: [1199, 1999], 365: [1999, 1999] } as Record<number, [number, number]>,
    iconBg: "bg-purple-600",
    colorText: "text-purple-600 dark:text-purple-400"
  },
  {
    i: "card",
    n: "Smart Digital Business Card",
    t: "Interactive Smart QR digital card with 1-tap contact saving, catalog links, and instant review collection.",
    planKey6Mo: "card_6mo",
    planKey1Yr: "card_yearly",
    p: { 180: [349, 699], 365: [549, 549] } as Record<number, [number, number]>,
    lt: [1499, 3999] as [number, number],
    planKeyLt: "card_lifetime",
    iconBg: "bg-indigo-600",
    colorText: "text-indigo-600 dark:text-indigo-400"
  },
  {
    i: "chat",
    n: "AutoReply to GoogleReview",
    t: "AI-drafted, SEO-rich owner replies published in 1-click to Google Maps via official Google OAuth.",
    planKey6Mo: "autoreply_6mo",
    planKey1Yr: "autoreply_yearly",
    p: { 180: [649, 1099], 365: [999, 999] } as Record<number, [number, number]>,
    iconBg: "bg-blue-600",
    colorText: "text-blue-600 dark:text-blue-400"
  },
  {
    i: "qr_lite",
    n: "Dynamic QR Studio (QR Tiger Alternative)",
    t: "Self-hosted permanent dynamic QR with unlimited destination updates, 0 paid APIs, and scan analytics.",
    planKey6Mo: "qr_lite_monthly",
    planKey1Yr: "qr_lite_yearly",
    p: { 180: [499, 999], 365: [699, 1499] } as Record<number, [number, number]>,
    iconBg: "bg-emerald-600",
    colorText: "text-emerald-600 dark:text-emerald-400"
  },
  {
    i: "wa_booster",
    n: "WhatsApp Group Booster & Lead Capture",
    t: "Dynamic QR with pre-redirect customer registration form, capturing Name + WhatsApp into CRM.",
    planKey6Mo: "wa_booster_monthly",
    planKey1Yr: "wa_booster_yearly",
    p: { 180: [1499, 2999], 365: [2499, 4999] } as Record<number, [number, number]>,
    iconBg: "bg-teal-600",
    colorText: "text-teal-600 dark:text-teal-400"
  },
  {
    i: "smart_billing",
    n: "Smart POS Billing & WhatsApp Invoicing Pro",
    t: "Mobile POS billing with auto GST, 1-click thermal print + automated WhatsApp PDF invoice delivery.",
    planKey6Mo: "smart_billing_monthly",
    planKey1Yr: "smart_billing_yearly",
    p: { 180: [2999, 5999], 365: [4999, 9999] } as Record<number, [number, number]>,
    iconBg: "bg-indigo-600",
    colorText: "text-indigo-600 dark:text-indigo-400"
  },
  {
    i: "chatbot",
    n: "24/7 AI WhatsApp ChatBot",
    t: "Multilingual AI assistant answering customer queries, qualifying leads, and routing inquiries 24/7.",
    planKey6Mo: "gear5_monthly",
    planKey1Yr: "gear5_monthly",
    p: { 180: [999, 999], 365: [999, 999] } as Record<number, [number, number]>,
    iconBg: "bg-rose-600",
    colorText: "text-rose-600 dark:text-rose-400"
  }
]

// Formatting helpers
export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN")
export const dy = (n: number, d: number) => `(₹${Math.round(n / d)}/day)`
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

  // Interactive tenure tab for CustomerPilot Complete Prepaid: 0=6 Months, 1=12 Months (Default 12 Months)
  const [activePrepaidIndex, setActivePrepaidIndex] = useState<number>(1)

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
  const activePrepaidTier = COMPLETE_TIERS[activePrepaidIndex] || COMPLETE_TIERS[0]
  const prepaidDbPlan = activePrepaidTier ? getPlanByKey(activePrepaidTier.planKey) : undefined
  const prepaidPrice = prepaidDbPlan?.price || activePrepaidTier?.s || 3499
  const prepaidMrp = prepaidDbPlan?.originalPrice || activePrepaidTier?.m || 3499
  const prepaidDays = activePrepaidTier?.d || 365

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
        enabledModules: s.i === "loyalty" ? "LOYALTY" : s.i === "star" ? "REVIEWS" : s.i === "chat" ? "AUTOREPLY" : s.i === "card" ? "DIGITAL_CARD" : s.i === "qr_lite" ? "DYNAMIC_QR" : s.i === "wa_booster" ? "DYNAMIC_QR,LEAD_CAPTURE" : s.i === "smart_billing" ? "DYNAMIC_QR,LEAD_CAPTURE,SMART_BILLING" : s.i
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

  // Handle Combo plan checkout (Gear 1 through Gear 6)
  const handleSelectGearCombo = (combo: GearComboDefinition, tenureDays: 30 | 180 | 365) => {
    const tenureData = combo.tenures[tenureDays]
    if (!tenureData) return
    const dbP = getPlanByKey(tenureData.planKey)
    const price = dbP?.price || tenureData.offer
    const originalPrice = dbP?.originalPrice || tenureData.regular

    const moduleMapping: Record<string, string> = {
      card: "DIGITAL_CARD",
      star: "REVIEWS",
      loyalty: "LOYALTY",
      chat: "AUTOREPLY",
      qr_lite: "DYNAMIC_QR",
      wa_booster: "LEAD_CAPTURE",
      smart_billing: "SMART_BILLING",
      chatbot: "CHATBOT"
    }
    const enabledModules = combo.modulesIncluded.map((m) => moduleMapping[m] || m).join(",")
    const tenureLabel = tenureDays === 30 ? "Monthly" : tenureDays === 180 ? "6 Months" : "1 Year"

    if (mode === "merchant" && onCheckout) {
      const p: PlanItem = dbP || {
        id: tenureData.planKey,
        planKey: tenureData.planKey,
        name: `${combo.name} (${tenureLabel})`,
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
      name: `${combo.name} (${tenureLabel})`,
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
    const tier = COMPLETE_TIERS[tierIndex] || COMPLETE_TIERS[0]
    const dbP = getPlanByKey(tier.planKey)
    const p: PlanItem = dbP || {
      id: tier.planKey,
      planKey: tier.planKey,
      name: `Gear 5 : CustomerPilot Complete (${tier.t})`,
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
    const tier = COMPLETE_TIERS[tierIndex] || COMPLETE_TIERS[0]
    const dbP = getPlanByKey(tier.planKey)
    const item: SelectedCheckoutItem = {
      id: "complete_" + tier.d,
      name: `Gear 5 : CustomerPilot Complete (${tier.t})`,
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Transparent, Flat Pricing · Zero Hidden Fees
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Simple, Flexible{" "}
          <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
            Growth Gears
          </span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-xl max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
          Choose the exact capability stack your business needs. 100% transparent pricing with zero commission cuts or percentage fees.
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

      {/* ─── OFFICIAL GEAR COMBOS (Gear 1 to Gear 6) ─── */}
      <section className="space-y-6 mb-16">
        <div className="text-center max-w-2xl mx-auto space-y-2 pb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Pre-Configured Retention Engines
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Official Gear Combos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered bundles designed for maximum retention velocity and Google Maps domination.
          </p>
        </div>

        {/* 3-Column Responsive Modern Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch pt-2">
          {GEAR_COMBOS.map((combo) => {
            const isMonthly = combo.isMonthly || !combo.tenures[365]

            // 1 Year Plan
            const tenure1Y = combo.tenures[365]
            const dbPlan1Y = tenure1Y ? getPlanByKey(tenure1Y.planKey) : undefined
            const p365 = dbPlan1Y?.price || tenure1Y?.offer || 0

            // 6 Months Plan
            const tenure6M = combo.tenures[180]
            const dbPlan6M = tenure6M ? getPlanByKey(tenure6M.planKey) : undefined
            const p180 = dbPlan6M?.price || tenure6M?.offer || 0

            // Monthly Plan (Gear 6)
            const tenureMonthly = combo.tenures[30]
            const dbPlanMonthly = tenureMonthly ? getPlanByKey(tenureMonthly.planKey) : undefined
            const p30 = dbPlanMonthly?.price || tenureMonthly?.offer || 999

            // Card thematic design styles
            const cardBorder =
              combo.gearKey === "gear_5"
                ? "border-2 border-rose-500/70 dark:border-rose-500/80 shadow-md hover:shadow-xl hover:shadow-rose-500/10 ring-1 ring-rose-500/20"
                : combo.gearKey === "gear_4"
                ? "border-2 border-indigo-600 dark:border-indigo-500 shadow-md hover:shadow-xl hover:shadow-indigo-500/10"
                : combo.gearKey === "gear_3"
                ? "border-2 border-blue-500/50 dark:border-blue-600/70 shadow-sm hover:shadow-lg hover:shadow-blue-500/10"
                : combo.gearKey === "gear_2"
                ? "border-2 border-purple-500/50 dark:border-purple-600/70 shadow-sm hover:shadow-lg hover:shadow-purple-500/10"
                : "border-2 border-emerald-500/50 dark:border-emerald-600/70 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10"

            const badgeTheme =
              combo.gearKey === "gear_5"
                ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800"
                : combo.gearKey === "gear_4"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800"
                : combo.gearKey === "gear_3"
                ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                : combo.gearKey === "gear_2"
                ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"

            const primaryBtnTheme =
              combo.gearKey === "gear_5"
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                : combo.gearKey === "gear_4"
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                : combo.gearKey === "gear_3"
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                : combo.gearKey === "gear_2"
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"

            const primaryBoxBg =
              combo.gearKey === "gear_5"
                ? "bg-rose-50/50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/60"
                : combo.gearKey === "gear_4"
                ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800/60"
                : combo.gearKey === "gear_3"
                ? "bg-blue-50/50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/60"
                : combo.gearKey === "gear_2"
                ? "bg-purple-50/50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/60"
                : "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/60"

            return (
              <div
                key={combo.gearKey}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full transition-all duration-300 relative overflow-hidden ${cardBorder}`}
              >
                <div>
                  {/* Top Badge Header */}
                  <div className="flex items-center justify-between gap-1.5 mb-3.5">
                    <span className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full truncate ${badgeTheme}`}>
                      {combo.badge}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {isMonthly ? "Monthly" : "Prepaid"}
                    </span>
                  </div>

                  {/* Title & Subtitle with fixed min-height for uniform alignment */}
                  <div className="min-h-[56px] flex items-center">
                    <h3 className="text-base sm:text-lg font-black leading-snug text-slate-900 dark:text-white">
                      {combo.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-4 leading-relaxed min-h-[44px]">
                    {combo.subtitle}
                  </p>

                  {/* Included Engines Checklist */}
                  <div className="mb-5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                      Included Modules:
                    </span>
                    <div className="space-y-2 min-h-[105px]">
                      {combo.modulesIncluded.map((modKey) => {
                        const serv = STANDALONE_SERVICES.find((s) => s.i === modKey)
                        return (
                          <div key={modKey} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <span className="truncate">{serv?.n || modKey}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Pricing Tiers Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {combo.gearKey === "gear_5" ? (
                    /* ─── Gear 5 Enterprise (1 Year + Monthly) ─── */
                    <>
                      {/* 1 Year Enterprise */}
                      <div className={`p-4 rounded-2xl border transition-all ${primaryBoxBg}`}>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            1 Year Enterprise Plan
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">
                            365 Days
                          </span>
                        </div>

                        {/* Price Line */}
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {inr(p365)}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto">
                            {dy(p365, 365)}
                          </span>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 365)}
                          className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-black shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 ${primaryBtnTheme}`}
                        >
                          <span>Choose 1 Year Enterprise ({inr(p365)}/yr)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Monthly Enterprise Option */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            Monthly Enterprise
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {inr(p30)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              / month
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 30)}
                          className="w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Choose Monthly ({inr(p30)}/mo)</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* ─── 1 Year Plan (Featured Primary Offer) ─── */}
                      <div className={`p-4 rounded-2xl border transition-all ${primaryBoxBg}`}>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            1 Year Plan
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-700">
                            365 Days
                          </span>
                        </div>

                        {/* Price Line */}
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {inr(p365)}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-auto">
                            {dy(p365, 365)}
                          </span>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 365)}
                          className={`w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-black shadow-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-1.5 ${primaryBtnTheme}`}
                        >
                          <span>Choose 1 Year Plan ({inr(p365)})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* ─── 6 Months Plan (Secondary Option) ─── */}
                      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            6 Months Plan
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {inr(p180)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {dy(p180, 180)}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectGearCombo(combo, 180)}
                          className="w-full mt-2.5 py-2 px-3 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Choose 6 Months Plan ({inr(p180)})</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
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
              Start with any growth gear, upgrade anytime. Transparent ROI from Day 1.
            </p>
            <div className="pt-2">
              <Link href="/signup">
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
        All prices in INR. Per-day cost = price ÷ plan days. Transparent flat pricing with zero hidden fees.
      </div>

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
