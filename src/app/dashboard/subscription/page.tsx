"use client"

import { useState, useEffect } from "react"
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
  AlertTriangle
} from "lucide-react"
import { TermsDialog } from "@/components/terms-dialog"

export interface PlanItem {
  id: string
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
}

export default function SubscriptionPage() {
  const { data, isLoading } = useDashboardState()
  const { toast } = useToast()

  const [plans, setPlans] = useState<PlanItem[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null)
  const [categoryTab, setCategoryTab] = useState<"complete" | "standalone">("complete")
  const [billingCycle, setBillingCycle] = useState<"1mo" | "6mo" | "1year">("1year")

  // Filter plans according to selected tab and billing cycle
  const displayedPlans = plans.filter((p) => {
    const isStandalone = p.planKey?.startsWith("loyalty_") || p.planKey?.startsWith("reviews_") || p.planKey?.startsWith("autoreply_")
    
    if (categoryTab === "complete") {
      // Show all Complete bundle capacity plans
      return !isStandalone
    } else {
      // Standalone services: filter by selected billing cycle (30 days for 1mo, 180 days for 6mo, 365 days for 1year)
      const targetDays = billingCycle === "1mo" ? 30 : billingCycle === "6mo" ? 180 : 365
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return
    setValidatingCoupon(true)
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
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

  const handleCheckout = async () => {
    if (!selectedPlan) {
      toast({
        title: "Plan Selection Required",
        description: "Please select a subscription plan first.",
        variant: "destructive",
      })
      return
    }

    if (!agreeTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please check the box agreeing to the Merchant Terms & Conditions.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const merchantId = merchant?.id || ""

      // 1. Create order on backend with plan & coupon
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-merchant-id": merchantId
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          couponCode: appliedCoupon?.code || undefined,
          merchantId: merchantId,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderData.ok) throw new Error(orderData.error || "Could not initialize order")

      // 2. Open Razorpay Checkout Window
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CustomerPilot",
        description: `${selectedPlan.name} Subscription`,
        order_id: orderData.orderId,
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
              planId: selectedPlan.id,
              durationDays: selectedPlan.days,
              merchantId: merchantId,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.ok) {
            toast({
              title: "Subscription Activated! 🚀",
              description: `Your ${selectedPlan.name} plan is now active.`,
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
          color: "#4f46e5", // Indigo 600
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Crown className="w-7 h-7" />
            </div>
            Subscription & Plans
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
            Upgrade or renew your plan to keep WhatsApp loyalty stamp automations, review auto-replies, and customer win-back engine running 24/7.
          </p>
        </div>

        {/* Current Active Plan Status Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4 shadow-lg flex-shrink-0">
          <div className={`p-3 rounded-xl flex items-center justify-center ${
            isExpired
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              : daysRemaining <= 3
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {isExpired ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Current Status:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isExpired
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : daysRemaining <= 3
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
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

      {/* Main Content */}
      {loadingPlans ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* 1. Plans Cards Grid */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 1: Select Your Plan</span>
                </h2>
                <p className="text-xs text-slate-400">Choose a full capacity scaling bundle or an individual standalone engine.</p>
              </div>

              {/* Category Switcher */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryTab("complete")
                      const defaultPlan = plans.find(p => p.planKey === "enterprise_365") || plans.find(p => !p.planKey?.startsWith("loyalty_") && !p.planKey?.startsWith("reviews_") && !p.planKey?.startsWith("autoreply_"))
                      setSelectedPlan(defaultPlan || null)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryTab === "complete" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
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
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryTab === "standalone" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                  >
                    🛠️ Standalone Services
                  </button>
                </div>
              </div>
            </div>

            {/* Standalone Billing Cycle Sub-Filter */}
            {categoryTab === "standalone" && (
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("1mo")
                      const matched = plans.find(p => p.days === 30 && (p.planKey?.startsWith("loyalty_") || p.planKey?.startsWith("reviews_") || p.planKey?.startsWith("autoreply_")))
                      if (matched) setSelectedPlan(matched)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === "1mo" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                  >
                    1 Month (₹149)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("6mo")
                      const matched = plans.find(p => p.days === 180 && (p.planKey?.startsWith("loyalty_") || p.planKey?.startsWith("reviews_") || p.planKey?.startsWith("autoreply_")))
                      if (matched) setSelectedPlan(matched)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === "6mo" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                  >
                    6 Months (₹649)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillingCycle("1year")
                      const matched = plans.find(p => p.days === 365 && (p.planKey?.startsWith("loyalty_") || p.planKey?.startsWith("reviews_") || p.planKey?.startsWith("autoreply_")))
                      if (matched) setSelectedPlan(matched)
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === "1year" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                  >
                    <span>1 Year (₹999)</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">₹3/day</span>
                  </button>
                </div>
              </div>
            )}

            <div className={`grid gap-6 ${categoryTab === "complete" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
              {displayedPlans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id
                const effectivePrice = getEffectivePrice(plan)

                return (
                  <div
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan)
                      // reset coupon if plan changed to re-validate
                      if (appliedCoupon && selectedPlan?.id !== plan.id) {
                        setAppliedCoupon(null)
                      }
                    }}
                    className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                      isSelected
                        ? "bg-gradient-to-b from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30 -translate-y-1"
                        : "bg-slate-900/60 hover:bg-slate-900 border-slate-800/90 hover:border-slate-700"
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
                        <h3 className="font-black text-xl text-white tracking-tight">{plan.name}</h3>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-600 bg-slate-800"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mb-6 min-h-[36px] leading-relaxed">{plan.description}</p>

                      {/* Price Section */}
                      <div className="mb-6 pb-6 border-b border-slate-800/80">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-4xl font-black text-white tracking-tight">
                            ₹{effectivePrice.toLocaleString()}
                          </span>
                          {plan.originalPrice && plan.originalPrice > effectivePrice && (
                            <span className="text-base text-slate-500 line-through">
                              ₹{plan.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded">
                            {plan.days} Days Validity
                          </span>
                          {plan.discountPercent && plan.discountPercent > 0 && (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                              {plan.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5 mb-6">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Features:</p>
                        <ul className="space-y-2">
                          {(plan.features || []).map((feat, idx) => (
                            <li key={idx} className="flex items-start text-xs text-slate-300 gap-2.5">
                              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60">
                      <div className={`w-full py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}>
                        {isSelected ? "✓ Plan Selected" : "Click to Select"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Coupon & Promo Code Section */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                Step 2: Have a Promo or Coupon Code?
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Apply a special promotional discount to your selected plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
                  <Input
                    placeholder="ENTER COUPON CODE"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="bg-slate-950 border-slate-700 text-xs font-mono uppercase tracking-wider h-10"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="h-10 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Code"}
                  </Button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Coupon "{appliedCoupon.code}" Applied: Saved ₹{appliedCoupon.discountAmount}!</span>
                    <button
                      onClick={handleRemoveCoupon}
                      className="hover:text-emerald-200 ml-2 p-0.5 rounded hover:bg-emerald-500/20"
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
          <Card className="bg-slate-900/60 border-slate-800 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Step 3: Agree to Merchant Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <Checkbox
                  id="page-terms-checkbox"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                  className="mt-0.5 w-5 h-5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <label
                    htmlFor="page-terms-checkbox"
                    className="cursor-pointer select-none font-semibold text-slate-100 text-sm"
                  >
                    I agree to the CustomerPilot Merchant Terms of Service & Agreement
                  </label>
                  <p className="text-slate-400 mt-1">
                    By checking this box, you confirm that you will honor earned customer rewards, maintain WhatsApp messaging compliance, and acknowledge the non-refundable digital service billing policy.{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsDialog(true)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 inline-flex items-center gap-1 ml-1"
                    >
                      Read Complete Terms & Conditions
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Final Checkout Summary Bar */}
          <div className="sticky bottom-4 z-30 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Selected Plan:</span>
                <span className="text-sm font-bold text-white">{selectedPlan?.name || "None Selected"}</span>
                {selectedPlan && (
                  <Badge variant="outline" className="text-[10px] font-mono border-indigo-400/40 text-indigo-300">
                    {selectedPlan.days} Days
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs text-slate-400">Total Payable:</span>
                <span className="text-3xl font-black text-emerald-400">
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
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>256-bit Razorpay Secure</span>
              </div>

              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing || !agreeTerms || !selectedPlan}
                className={`w-full sm:w-auto px-8 py-6 text-base font-black tracking-wide shadow-xl transition-all duration-200 ${
                  agreeTerms && selectedPlan
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 scale-100 hover:scale-[1.02]"
                    : "bg-slate-800 text-slate-400 opacity-60 cursor-not-allowed"
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
