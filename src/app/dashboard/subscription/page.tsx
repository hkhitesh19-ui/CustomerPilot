"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Script from "next/script"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Crown,
  Check,
  Sparkles,
  Tag,
  ShieldCheck,
  Loader2,
  Zap,
  ArrowRight,
  X,
  Lock,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame
} from "lucide-react"
import { TermsDialog } from "@/components/terms-dialog"
import { PricingStudio, type PlanItem } from "@/components/pricing/pricing-studio"

// PlanItem imported from PricingStudio

export default function SubscriptionPage() {
  const { data, isLoading } = useDashboardState()
  const { toast } = useToast()

  const [plans, setPlans] = useState<PlanItem[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null)
  const [categoryTab, setCategoryTab] = useState<"complete" | "standalone">("complete")
  const [billingCycle, setBillingCycle] = useState<"6mo" | "1year">("1year")
  const [viewMode, setViewMode] = useState<"studio" | "grid">("studio")

  // Filter plans according to selected tab and billing cycle (Exclude 30-day plans)
  const displayedPlans = plans.filter((p) => {
    // Strictly exclude 30-day plans
    if (p.days === 30) return false

    const isStandalone = p.planKey?.startsWith("loyalty_") || p.planKey?.startsWith("reviews_") || p.planKey?.startsWith("autoreply_") || p.planKey?.startsWith("card_")
    
    if (categoryTab === "complete") {
      // Show all Complete bundle capacity plans (6 Months & 1 Year)
      return !isStandalone
    } else {
      // Standalone services: filter by selected billing cycle (180 days for 6mo, 365 days for 1year)
      const targetDays = billingCycle === "6mo" ? 180 : 365
      return isStandalone && p.days === targetDays
    }
  })

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Terms state
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)

  // Razorpay processing state
  const [isProcessing, setIsProcessing] = useState(false)

  const merchant = data?.merchant
  const trialEndsAt = merchant?.trialEndsAt ? new Date(merchant.trialEndsAt) : null
  const now = new Date()

  let daysRemaining = 0
  let isExpired = false
  if (trialEndsAt) {
    const diffTime = trialEndsAt.getTime() - now.getTime()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (daysRemaining <= 0) {
      daysRemaining = 0
      isExpired = true
    }
  }

  // Load plans from API
  useEffect(() => {
    setLoadingPlans(true)
    fetch("/api/pricing/plans")
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (data?.ok && Array.isArray(data.data?.plans)) {
          setPlans(data.data.plans)
          // Default select the popular or 6-month plan
          const defaultPlan = data.data.plans.find((p: any) => p.popular) || data.data.plans[1] || data.data.plans[0]
          setSelectedPlan(defaultPlan || null)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPlans(false))
  }, [])

  const handleApplyCoupon = async (overrideCode?: string) => {
    const targetCode = (overrideCode || couponCode).trim().toUpperCase()
    if (!targetCode || !selectedPlan) return
    setValidatingCoupon(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: targetCode,
          amount: selectedPlan.price,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Invalid coupon code")
      }

      setAppliedCoupon(data.data)
      toast({
        title: "Coupon Applied! 🎉",
        description: `Saved ₹${data.data.discountAmount} with code ${data.data.code}`,
      })
    } catch (e: any) {
      toast({
        title: "Coupon Error",
        description: e.message,
        variant: "destructive",
      })
      setAppliedCoupon(null)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
  }

  const getEffectivePrice = (plan: PlanItem) => {
    if (appliedCoupon && selectedPlan?.id === plan.id) {
      return appliedCoupon.finalAmount
    }
    return plan.price
  }

  const handleCheckout = async (planOverride?: PlanItem) => {
    const targetPlan = planOverride || selectedPlan
    if (!targetPlan) {
      toast({
        title: "Plan Selection Required",
        description: "Please select a subscription plan first.",
        variant: "destructive",
      })
      return
    }

    if (!agreeTerms) {
      setAgreeTerms(true)
    }

    setIsProcessing(true)
    try {
      const merchantId = merchant?.id || ""
      const planAmount = planOverride ? planOverride.price : getEffectivePrice(targetPlan)

      // 1. Create order on backend with plan & coupon
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-merchant-id": merchantId
        },
        body: JSON.stringify({
          planId: targetPlan.id || targetPlan.planKey,
          amount: planAmount,
          durationDays: targetPlan.days,
          couponCode: appliedCoupon?.code || undefined,
          merchantId: merchantId,
          enabledModules: targetPlan.enabledModules || (targetPlan as any).moduleKey
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.ok) throw new Error(orderData.error || "Could not initialize order")

      // 2. Open Razorpay Checkout Window
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "CustomerPilot",
        description: `${targetPlan.name} Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: merchant?.name,
          email: merchant?.email,
          contact: merchant?.whatsappPhone
        },
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-merchant-id": merchantId
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: targetPlan.id || targetPlan.planKey,
              durationDays: targetPlan.days,
              merchantId: merchantId,
              enabledModules: targetPlan.enabledModules || (targetPlan as any).moduleKey
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.ok) {
            toast({
              title: "Subscription Activated! 🚀",
              description: `Your ${targetPlan.name} plan is now active.`,
            })
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          } else {
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if your money was deducted.",
              variant: "destructive",
            })
          }
        },
        theme: {
          color: "#0284c7", // CustomerPilot Sky/Indigo
        },
      }

      // Check if Razorpay script is present
      if (typeof (window as any).Razorpay === "undefined") {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => {
          const rzp = new (window as any).Razorpay(options)
          rzp.open()
        }
        document.body.appendChild(script)
      } else {
        const rzp = new (window as any).Razorpay(options)
        rzp.open()
      }
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message || "Failed to launch Razorpay",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const effectiveFinalPrice = selectedPlan ? getEffectivePrice(selectedPlan) : 0

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Crown className="w-7 h-7" />
            </div>
            Subscription &amp; Plans
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Upgrade or renew your plan to keep WhatsApp loyalty stamp automations, review auto-replies, and customer win-back engine running 24/7.
          </p>
        </div>

        {/* Current Active Plan Status Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-4 shadow-xs flex-shrink-0">
          <div className={`p-3 rounded-xl flex items-center justify-center ${
            isExpired
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : daysRemaining <= 3
              ? "bg-amber-50 text-amber-600 border border-amber-200"
              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
          }`}>
            {isExpired ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Current Status:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isExpired
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : daysRemaining <= 1
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {isExpired ? "Subscription Expired" : `${daysRemaining} Days Left`}
              </span>
            </div>
            {trialEndsAt && (
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                {isExpired ? "Expired on:" : "Valid till:"} {trialEndsAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Link to 3-Day Trial Infographic Guide */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg shrink-0">
            📘
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Understand Your 3-Day Free Trial Journey</p>
            <p className="text-xs text-slate-600 mt-0.5">Step-by-step infographic on how customer stamps, AI reviews, and auto-replies work risk-free.</p>
          </div>
        </div>
        <Link 
          href="/guide/5-minute-setup-guide" 
          target="_blank" 
          className="shrink-0 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-300 transition flex items-center gap-1.5 shadow-xs"
        >
          <span>View Setup Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Content */}
      {loadingPlans ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Limited Time 50% Discount Offer Banner - Prominent Light Version */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-2 border-amber-400/60 p-5 sm:p-7 shadow-xs">
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
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                    All Plans Locked at Flat Half Price!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                    Complete WhatsApp Loyalty, Smart AI Google Reviews &amp; 1-Click AutoReply. 
                    Original MRP ₹4,499 ➔ <span className="text-emerald-700 font-bold">Now ₹2,249/yr</span> (₹6.1/day). Standalone from <span className="text-amber-700 font-bold">₹799/yr</span> (₹2.1/day).
                  </p>
                </div>
              </div>

              {/* Right Biggest Font Highlight */}
              <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center justify-center px-8 py-5 rounded-2xl bg-white/95 border-2 border-amber-400 shadow-md text-center">
                <span className="text-xs font-black uppercase tracking-widest text-amber-700">FLAT DISCOUNT</span>
                <div className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 drop-shadow-xs">
                  50% OFF
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-extrabold tracking-wide">
                  ⚡ INSTANT SAVINGS LOCKED
                </div>
              </div>
            </div>
          </div>

          {/* Plan Selection Experience Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-700">Plan Selector Mode:</span>
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("studio")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "studio"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pricing Plans</span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/20 text-emerald-700 border-none font-bold">Interactive</Badge>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Classic Cards</span>
                </button>
              </div>
            </div>

            {selectedPlan && (
              <div className="text-xs text-emerald-800 font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Selected: {selectedPlan.name} (₹{selectedPlan.price})</span>
              </div>
            )}
          </div>

          {viewMode === "studio" ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <PricingStudio
                mode="merchant"
                theme="light"
                initialPlans={plans}
                selectedPlanId={selectedPlan?.id}
                onSelectPlan={(plan) => {
                  setSelectedPlan(plan)
                  if (appliedCoupon) setAppliedCoupon(null)
                }}
                onCheckout={(plan) => {
                  setSelectedPlan(plan)
                  handleCheckout(plan)
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Step 1: Select Your Plan</span>
                </h2>
                <p className="text-xs text-slate-500">Choose a full capacity scaling bundle or an individual standalone engine.</p>
              </div>

              {/* Category Switcher */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryTab("complete")
                      const defaultPlan = plans.find(p => p.planKey === "enterprise_365") || plans.find(p => !p.planKey?.startsWith("loyalty_") && !p.planKey?.startsWith("reviews_") && !p.planKey?.startsWith("autoreply_"))
                      setSelectedPlan(defaultPlan || null)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${categoryTab === "complete" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    ⭐ Complete Bundle Plans
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryTab("standalone")
                      const defaultStandalone = plans.find(p => p.planKey === "loyalty_yearly") || plans.find(p => p.planKey?.startsWith("loyalty_"))
                      setSelectedPlan(defaultStandalone || null)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${categoryTab === "standalone" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    🛠️ Standalone Services
                  </button>
                </div>
              </div>
            </div>

            {/* Standalone Billing Cycle Sub-Filter */}
            {categoryTab === "standalone" && (
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("6mo")
                      const matched = plans.find(p => p.days === 180 && (p.planKey?.startsWith("loyalty_") || p.planKey?.startsWith("reviews_") || p.planKey?.startsWith("autoreply_")))
                      if (matched) setSelectedPlan(matched)
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${billingCycle === "6mo" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    6 Months (₹549)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("1year")
                      const matched = plans.find(p => p.days === 365 && (p.planKey?.startsWith("loyalty_") || p.planKey?.startsWith("reviews_") || p.planKey?.startsWith("autoreply_")))
                      if (matched) setSelectedPlan(matched)
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${billingCycle === "1year" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <span>1 Year (₹799)</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">₹2.2/day</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              {displayedPlans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id
                const effectivePrice = getEffectivePrice(plan)

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan)
                      if (appliedCoupon && selectedPlan?.id !== plan.id) {
                        setAppliedCoupon(null)
                      }
                    }}
                    className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-50/60 border-indigo-600 shadow-xl shadow-indigo-600/10 ring-2 ring-indigo-600/30 -translate-y-1"
                        : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    {/* Top Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border shadow-md ${
                          plan.popular
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50"
                            : "bg-indigo-600 text-white border-indigo-400/40"
                        }`}>
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-black text-xl text-slate-900 tracking-tight">{plan.name}</h3>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-slate-100"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mb-6 min-h-[36px] leading-relaxed">{plan.description}</p>

                      {/* Price Section */}
                      <div className="mb-6 pb-6 border-b border-slate-200">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-4xl font-black text-slate-900 tracking-tight">
                            ₹{effectivePrice.toLocaleString()}
                          </span>
                          {plan.originalPrice && plan.originalPrice > effectivePrice && (
                            <span className="text-base text-slate-400 line-through">
                              ₹{plan.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                            {plan.days} Days Validity
                          </span>
                          {plan.discountPercent && plan.discountPercent > 0 && (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {plan.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5 mb-6">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Included Features:</p>
                        <ul className="space-y-2">
                          {(plan.features || []).map((feat, idx) => (
                            <li key={idx} className="flex items-start text-xs text-slate-700 gap-2.5">
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200">
                      <div className={`w-full py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                        {isSelected ? "✓ Plan Selected" : "Click to Select"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          )}

          {/* 2. Coupon & Promo Code Section */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                Step 2: Have a Promo or Coupon Code?
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Apply a special promotional discount to your selected plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
                  <Input
                    placeholder="ENTER PROMO CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-mono uppercase tracking-wider h-10"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="h-10 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Code"}
                  </Button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Coupon "{appliedCoupon.code}" Applied: Saved ₹{appliedCoupon.discountAmount}!</span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="hover:text-emerald-900 ml-2 p-0.5 rounded hover:bg-emerald-100 cursor-pointer"
                      title="Remove coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. Mandatory Terms & Conditions Agreement */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Step 3: Agree to Merchant Terms &amp; Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Checkbox
                  id="page-terms-checkbox"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                  className="mt-0.5 w-5 h-5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <label
                    htmlFor="page-terms-checkbox"
                    className="cursor-pointer select-none font-semibold text-slate-900 text-sm"
                  >
                    I agree to the CustomerPilot Merchant Terms of Service &amp; Agreement
                  </label>
                  <p className="text-slate-600 mt-1">
                    By checking this box, you confirm that you will honor earned customer rewards, maintain WhatsApp messaging compliance, and acknowledge the non-refundable digital service billing policy.{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsDialog(true)}
                      className="text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-4 inline-flex items-center gap-1 ml-1 cursor-pointer"
                    >
                      Read Complete Terms &amp; Conditions
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Final Checkout Summary Bar */}
          <div className="sticky bottom-4 z-30 p-6 rounded-2xl bg-white/95 border-2 border-indigo-200/90 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Selected Plan:</span>
                <span className="text-sm font-bold text-slate-900">{selectedPlan?.name || "None Selected"}</span>
                {selectedPlan && (
                  <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-700 bg-indigo-50">
                    {selectedPlan.days} Days
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs text-slate-500 font-medium">Total Payable:</span>
                <span className="text-3xl font-black text-indigo-600">
                  ₹{effectiveFinalPrice.toLocaleString()}
                </span>
                {appliedCoupon && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{selectedPlan?.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>256-bit Razorpay Secure</span>
              </div>

              <Button
                size="lg"
                onClick={() => handleCheckout()}
                disabled={isProcessing || !selectedPlan}
                className={`w-full sm:w-auto px-8 py-6 text-base font-black tracking-wide shadow-xl transition-all duration-200 cursor-pointer ${
                  selectedPlan
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 scale-100 hover:scale-[1.02]"
                    : "bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing Order...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Subscribe with Razorpay <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Dialog */}
      <TermsDialog open={showTermsDialog} onOpenChange={setShowTermsDialog} />
    </div>
    </>
  )
}
