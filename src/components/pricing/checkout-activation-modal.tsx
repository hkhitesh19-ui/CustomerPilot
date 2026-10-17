"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Lock,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  User,
  Phone,
  Mail,
  Building2,
  AlertCircle
} from "lucide-react"

export interface SelectedCheckoutItem {
  id: string
  name: string
  tenureDays: number
  price: number
  originalPrice: number
  planKey: string
  iconBg?: string
  moduleKey?: string
}

interface CheckoutActivationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: SelectedCheckoutItem[]
  totalAmount: number
  totalOriginalPrice: number
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false)
      return
    }
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function CheckoutActivationModal({
  isOpen,
  onClose,
  selectedItems,
  totalAmount,
  totalOriginalPrice
}: CheckoutActivationModalProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<"register" | "login">("register")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [loggedInMerchant, setLoggedInMerchant] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Registration Form State
  const [businessName, setBusinessName] = useState("")
  const [whatsappPhone, setWhatsappPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Check active merchant session when modal opens
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    async function checkSession() {
      setCheckingSession(true)
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        const data = await res.json()
        if (isMounted && data.ok && data.authenticated && data.merchant) {
          setLoggedInMerchant(data.merchant)
        } else if (isMounted) {
          setLoggedInMerchant(null)
        }
      } catch {
        if (isMounted) setLoggedInMerchant(null)
      } finally {
        if (isMounted) setCheckingSession(false)
      }
    }

    checkSession()
    // Preload Razorpay script
    loadRazorpayScript()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  // Map selected items to canonical module strings (e.g. LOYALTY, REVIEWS, AUTOREPLY, DIGITAL_CARD)
  const resolveEnabledModules = () => {
    const modules = new Set<string>()
    for (const item of selectedItems) {
      const k = (item.moduleKey || item.id || "").toLowerCase()
      if (k.includes("loyalty")) modules.add("LOYALTY")
      if (k.includes("review") || k.includes("star")) modules.add("REVIEWS")
      if (k.includes("auto") || k.includes("chat")) modules.add("AUTOREPLY")
      if (k.includes("card")) modules.add("DIGITAL_CARD")
      if (k.includes("complete") || item.planKey?.includes("growth") || item.planKey?.includes("enterprise")) {
        modules.add("LOYALTY")
        modules.add("REVIEWS")
        modules.add("AUTOREPLY")
        modules.add("DIGITAL_CARD")
      }
    }
    return modules.size > 0 ? Array.from(modules).join(",") : "LOYALTY,REVIEWS,AUTOREPLY"
  }

  // Primary plan key for database record
  const primaryPlanKey = selectedItems.length === 1 ? selectedItems[0].planKey : "custom_bundle"
  const maxDays = selectedItems.reduce((max, item) => Math.max(max, item.tenureDays || 365), 365)

  // Launch Razorpay Window
  const launchRazorpayPayment = async (merchantInfo?: any) => {
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.")
    }

    const effectiveMerchantId = merchantInfo?.id || loggedInMerchant?.id || ""
    const enabledModules = resolveEnabledModules()

    // 1. Create order on server
    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(effectiveMerchantId ? { "x-merchant-id": effectiveMerchantId } : {})
      },
      body: JSON.stringify({
        planId: primaryPlanKey,
        amount: totalAmount,
        durationDays: maxDays,
        merchantId: effectiveMerchantId,
        enabledModules
      })
    })

    const orderData = await orderRes.json()
    if (!orderRes.ok || !orderData.ok) {
      throw new Error(orderData.error || "Failed to initialize Razorpay order.")
    }

    // 2. Configure Razorpay checkout options
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "CustomerPilot",
      description: selectedItems.map((i) => i.name).join(", "),
      order_id: orderData.orderId,
      prefill: {
        name: merchantInfo?.name || loggedInMerchant?.name || businessName,
        email: merchantInfo?.email || loggedInMerchant?.email || email || loginEmail,
        contact: merchantInfo?.whatsappPhone || loggedInMerchant?.whatsappPhone || whatsappPhone
      },
      theme: {
        color: "#4f46e5"
      },
      modal: {
        ondismiss: function () {
          toast({
            title: "Payment Pending",
            description: "Your account is ready! You can complete payment anytime inside your merchant dashboard."
          })
          setLoading(false)
        }
      },
      handler: async function (response: any) {
        setLoading(true)
        try {
          // 3. Verify payment signature on server
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(effectiveMerchantId ? { "x-merchant-id": effectiveMerchantId } : {})
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: primaryPlanKey,
              durationDays: maxDays,
              enabledModules,
              merchantId: effectiveMerchantId
            })
          })

          const verifyData = await verifyRes.json()
          if (!verifyRes.ok || !verifyData.ok) {
            throw new Error(verifyData.error || "Payment verification failed. Please contact support.")
          }

          toast({
            title: "🎉 Payment Successful!",
            description: "Your subscription has been activated. Welcome to CustomerPilot!"
          })

          onClose()
          // Immediate redirect to merchant dashboard
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 800)
        } catch (vErr: any) {
          toast({
            title: "Verification Alert",
            description: vErr.message || "Please contact support with your payment ID.",
            variant: "destructive"
          })
          setLoading(false)
        }
      }
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  // Handle Registered / Logged In Merchant Checkout
  const handleLoggedInPay = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      await launchRazorpayPayment(loggedInMerchant)
    } catch (err: any) {
      setErrorMessage(err.message || "Payment initiation failed.")
      setLoading(false)
    }
  }

  // Handle New Merchant Registration + Razorpay Checkout
  const handleRegisterAndPay = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!businessName.trim()) {
      setErrorMessage("Please enter your Store / Business Name.")
      return
    }
    const cleanPhone = whatsappPhone.replace(/\D/g, "")
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit WhatsApp number.")
      return
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.")
      return
    }
    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.")
      return
    }

    setLoading(true)
    try {
      // 1. Create account on backend (returns token cookie)
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          ownerName: businessName.trim(),
          email: email.trim().toLowerCase(),
          whatsappPhone: cleanPhone,
          password: password,
          businessType: "retail",
          module: resolveEnabledModules()
        })
      })

      const regData = await regRes.json()

      if (!regRes.ok || regData.error) {
        const errText = regData.error || "Account creation failed."
        if (errText.toLowerCase().includes("already exists")) {
          setErrorMessage(errText + " Click 'Sign In & Pay' below to continue.")
          setLoginEmail(email.trim().toLowerCase())
        } else {
          setErrorMessage(errText)
        }
        setLoading(false)
        return
      }

      // 2. Account created successfully & cookie set! Now launch Razorpay
      await launchRazorpayPayment({
        id: regData.merchantId,
        name: businessName,
        email: email,
        whatsappPhone: cleanPhone
      })
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start payment. Please try again.")
      setLoading(false)
    }
  }

  // Handle Existing Merchant Login + Razorpay Checkout
  const handleLoginAndPay = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      setErrorMessage("Please enter your registered email address.")
      return
    }
    if (!loginPassword) {
      setErrorMessage("Please enter your password.")
      return
    }

    setLoading(true)
    try {
      // 1. Authenticate user
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword
        })
      })

      const loginData = await loginRes.json()
      if (!loginRes.ok || !loginData.success) {
        setErrorMessage(loginData.error || "Invalid credentials. Please check your password.")
        setLoading(false)
        return
      }

      // 2. Launch Razorpay
      await launchRazorpayPayment({
        id: loginData.merchantId,
        email: loginEmail
      })
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to proceed with payment.")
      setLoading(false)
    }
  }

  const savingsAmount = Math.max(0, totalOriginalPrice - totalAmount)
  const savingsPercent = totalOriginalPrice > 0 ? Math.round((savingsAmount / totalOriginalPrice) * 100) : 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl bg-white dark:bg-slate-950">
        {/* Header Strip */}
        <div className="p-6 bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 text-white rounded-t-3xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-white">
                Complete Order &amp; Activate Account
              </DialogTitle>
              <DialogDescription className="text-cyan-100/90 text-xs mt-0.5 font-medium">
                Official Razorpay 256-bit secure gateway · Instant activation
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ─── Selected Items Summary Card ─── */}
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Selected Services ({selectedItems.length})</span>
              <span>Price</span>
            </div>

            <div className="divide-y divide-slate-200/60 dark:divide-slate-800 space-y-2">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-slate-400 line-through ml-1.5">
                        ₹{item.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="font-black text-base text-slate-900 dark:text-white">
                  Total Payable Amount
                </span>
                <div className="text-[11px] text-slate-500">All taxes included · No hidden charges</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </div>
                {savingsAmount > 0 && (
                  <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 font-bold text-[11px] px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Save ₹{savingsAmount.toLocaleString("en-IN")} ({savingsPercent}% OFF)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* ─── State 1: Active Merchant Already Logged In ─── */}
          {checkingSession ? (
            <div className="py-8 text-center text-slate-500 flex items-center justify-center gap-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Verifying account status...</span>
            </div>
          ) : loggedInMerchant ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {loggedInMerchant.name?.charAt(0)?.toUpperCase() || "M"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Signed in as Active Merchant</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {loggedInMerchant.name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{loggedInMerchant.email}</div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleLoggedInPay}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base py-6 rounded-2xl shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Opening Razorpay Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{totalAmount.toLocaleString("en-IN")} via Razorpay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* ─── State 2: Visitor Not Logged In (Quick Register & Pay OR Sign In & Pay) ─── */
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register")
                    setErrorMessage("")
                  }}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === "register"
                      ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs"
                      : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Quick Signup &amp; Pay
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login")
                    setErrorMessage("")
                  }}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs"
                      : "hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Already Registered? Sign In
                </button>
              </div>

              {/* Tab 1: Quick Register & Pay Form */}
              {activeTab === "register" && (
                <form onSubmit={handleRegisterAndPay} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Business / Store Name *</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Royal Sweets & Bakers"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                      className="rounded-xl border-slate-300 dark:border-slate-700 text-sm h-11"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-indigo-600" />
                        <span>WhatsApp Number *</span>
                      </Label>
                      <Input
                        type="tel"
                        placeholder="10-digit mobile"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        maxLength={10}
                        required
                        className="rounded-xl border-slate-300 dark:border-slate-700 text-sm h-11"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Email ID *</span>
                      </Label>
                      <Input
                        type="email"
                        placeholder="store@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl border-slate-300 dark:border-slate-700 text-sm h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Create Account Password * (min 8 chars)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={8}
                        required
                        className="rounded-xl border-slate-300 dark:border-slate-700 text-sm h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-base py-6 rounded-2xl shadow-lg shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Setting up Account &amp; Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{totalAmount.toLocaleString("en-IN")} via Razorpay &amp; Open Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Tab 2: Existing Merchant Sign In & Pay Form */}
              {activeTab === "login" && (
                <form onSubmit={handleLoginAndPay} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Registered Email ID *</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="store@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="rounded-xl border-slate-300 dark:border-slate-700 text-sm h-11"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Account Password *</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="rounded-xl border-slate-300 dark:border-slate-700 text-sm h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base py-6 rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing in &amp; Launching Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In &amp; Pay ₹{totalAmount.toLocaleString("en-IN")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Trust Footer */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay Verified · UPI, Cards, NetBanking</span>
            </div>
            <span>Instant Auto-Login &amp; Dashboard Activation</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
