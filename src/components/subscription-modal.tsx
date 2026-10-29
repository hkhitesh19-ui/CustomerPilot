"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

export function SubscriptionModal({
  open,
  onOpenChange,
  currentPlanName,
  daysRemaining,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlanName?: string
  daysRemaining?: number
}) {
  const { toast } = useToast()
  const [plans, setPlans] = useState<PlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null)

  // Coupon state
  const [couponCode, setCouponCode] = useState("")
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)

  // Terms state
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)

  // Razorpay processing state
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch("/api/pricing/plans")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && Array.isArray(data.data?.plans)) {
            setPlans(data.data.plans)
            // Default select the popular or 6-month plan
            const defaultPlan = data.data.plans.find((p: any) => p.popular) || data.data.plans[1] || data.data.plans[0]
            setSelectedPlan(defaultPlan || null)
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [open])

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

  const handleCheckout = async (plan: PlanItem) => {
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
      // 1. Create order on backend with plan & coupon
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          couponCode: appliedCoupon?.code || undefined,
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
        description: `${plan.name} Subscription`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              durationDays: plan.days,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.ok) {
            toast({
              title: "Subscription Activated! 🚀",
              description: `Your ${plan.name} plan is now active.`,
            })
            onOpenChange(false)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-slate-950 border-slate-800 text-slate-100 shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/40 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    Upgrade / Renew Subscription
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 mt-1">
                    Select a high-retention plan to keep your WhatsApp loyalty, review auto-reply & counter queue 100% active.
                  </DialogDescription>
                </div>
              </div>
              {daysRemaining !== undefined && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[11px] text-slate-400">Current Status</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    daysRemaining > 7
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : daysRemaining > 0
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}>
                    {daysRemaining > 0 ? `${daysRemaining} Days Left` : "Expired"}
                  </span>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <>
                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan?.id === plan.id
                    const effectivePrice = getEffectivePrice(plan)
                    const hasDiscount = effectivePrice < (plan.originalPrice || plan.price)

                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-200 border flex flex-col justify-between ${
                          isSelected
                            ? "bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                            : "bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        {/* Plan Header Badge */}
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-sm ${
                              plan.popular
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400/50"
                                : "bg-indigo-600 text-white border-indigo-400/40"
                            }`}>
                              {plan.badge}
                            </span>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-base text-white">{plan.name}</h3>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-600"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 mb-4 min-h-[32px]">{plan.description}</p>

                          {/* Price Tag */}
                          <div className="mb-4 pb-4 border-b border-slate-800">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-white">
                                ₹{effectivePrice.toLocaleString()}
                              </span>
                              {plan.originalPrice && plan.originalPrice > effectivePrice && (
                                <span className="text-sm text-slate-500 line-through">
                                  ₹{plan.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-400 font-medium">
                                for {plan.days} Days
                              </span>
                              {plan.discountPercent && plan.discountPercent > 0 && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  {plan.discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Features list */}
                          <ul className="space-y-2 mb-6">
                            {(plan.features || []).map((feat, idx) => (
                              <li key={idx} className="flex items-start text-xs text-slate-300 gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPlan(plan)
                            handleCheckout(plan)
                          }}
                          disabled={isProcessing || !agreeTerms}
                          className={`w-full font-bold shadow-md transition-all ${
                            isSelected
                              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                          } ${!agreeTerms ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {isProcessing && isSelected ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              Subscribe with Razorpay <ArrowRight className="w-4 h-4" />
                            </span>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>

                {/* Coupon Code Section */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Have a Promo or Coupon Code?</p>
                      <p className="text-[11px] text-slate-400">Enter discount code (e.g. WELCOME20, LAUNCH50)</p>
                    </div>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 w-full sm:w-auto justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Code "{appliedCoupon.code}" applied (-₹{appliedCoupon.discountAmount})
                      </span>
                      <button
                        onClick={handleRemoveCoupon}
                        className="hover:text-emerald-200 p-0.5"
                        title="Remove coupon"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Input
                        placeholder="ENTER CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-32 bg-slate-950 border-slate-700 text-xs font-mono uppercase tracking-wider"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white"
                      >
                        {validatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Terms Agreement Checkbox (Mandatory) */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
                  <Checkbox
                    id="terms-checkbox"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                    className="mt-0.5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <label
                      htmlFor="terms-checkbox"
                      className="cursor-pointer select-none font-medium text-slate-200"
                    >
                      I agree to the{" "}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTermsDialog(true)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 inline-flex items-center gap-1"
                    >
                      CustomerPilot Merchant Terms & Conditions
                    </button>
                    <span className="text-slate-400">
                      {" "}(including WhatsApp compliance, reward honoring responsibility, and non-refundable subscription policy).
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Full Document Dialog */}
      <TermsDialog open={showTermsDialog} onOpenChange={setShowTermsDialog} />
    </>
  )
}
