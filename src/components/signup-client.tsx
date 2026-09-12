"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Building2, User, Phone, Mail, Lock, ArrowRight, CheckCircle2, Sparkles, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get("ref") || ""
  const moduleParam = searchParams.get("module") || "" // "reviews", "loyalty", "autoreply"
  const isReviewsMode = moduleParam === "reviews"
  const isLoyaltyMode = moduleParam === "loyalty"
  const isAutoReplyMode = moduleParam === "autoreply"
  const isStandalone = isReviewsMode || isLoyaltyMode || isAutoReplyMode

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    whatsappPhone: "",
    email: "",
    password: "",
    businessType: "bakery",
    businessAddress: "",
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.businessName || !form.email || !form.password) {
      setError("All required fields must be filled.")
      return
    }
    if (!isReviewsMode && !isAutoReplyMode && !form.ownerName) {
      setError("Owner Name is required.")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...(moduleParam ? { module: moduleParam } : {}) }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.")
        return
      }

      // Track merchant referral if ref code present
      if (refCode && data.merchantId) {
        try {
          await fetch("/api/merchant-referrals/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ referralCode: refCode, merchantId: data.merchantId }),
          })
        } catch (e) {
          // Non-blocking: referral tracking failure should not block signup
          console.warn("Referral tracking failed:", e)
        }
      }

      // Success: JWT cookie is set, redirect based on module
      router.push(data.redirectTo || "/onboarding")
    } catch (e) {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  // Dynamic titles, copy & benefits per selected module
  let headerBadge = "3-Day FREE Trial • CustomerPilot Complete"
  let mainTitle = (
    <>
      CustomerPilot Complete : <br />
      <span className="bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
        Digital Loyalty + Smart AI GoogleReviews + 1-Click AutoReply.
      </span>
    </>
  )
  let description = "India's #1 WhatsApp-first AI Customer Retention Platform. Bring your customers back with loyalty rewards, 5-star Google reviews, and automated AI owner replies."
  let formTitle = "Start Free Trial - CustomerPilot Complete : Digital Loyalty + Smart AI GoogleReviews + 1-Click AutoReply"
  let formSubtitle = "Start 3-Day Complete Free Trial in under 2 minutes — no credit card required"
  let submitBtnText = "Start CustomerPilot Complete Free Trial →"

  let benefits = [
    "Digital Loyalty Stamps & VIP Club",
    "Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast",
    "Ai Drafted SEO Optimized 1-Click Reply to Google Reviews",
    "3-Day FREE trial, no credit card required",
  ]

  if (isReviewsMode) {
    headerBadge = "3-Day FREE Trial • Ai Drafted SEO Optimized Google Reviews"
    mainTitle = (
      <>
        Ai Drafted SEO Optimized <br />
        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
          Google Reviews - Increase GoogleReviews Very Fast.
        </span>
      </>
    )
    description = "Automatically collect authentic 4 & 5-star Google reviews right after a customer purchase on WhatsApp. AI drafts ready-to-post customer reviews in 1-Click."
    formTitle = "Start Free Trial - Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast"
    formSubtitle = "2 clicks to get started — instant setup!"
    submitBtnText = "Start Free Trial - Ai Drafted SEO Optimized Google Reviews →"
    benefits = [
      "AI-powered Google Review customer drafts",
      "Auto review collection via WhatsApp delay timer",
      "5-star review boost & local neighborhood SEO",
      "Setup in under 2 minutes, no card required",
    ]
  } else if (isLoyaltyMode) {
    headerBadge = "3-Day FREE Trial • Digital Loyalty Stamps & VIP Club"
    mainTitle = (
      <>
        Digital Loyalty Stamps &amp; <br />
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          VIP Club.
        </span>
      </>
    )
    description = "Convert single-time walk-ins into repeat regulars with WhatsApp digital stamp cards, VIP club tier upgrades, and automated birthday rewards."
    formTitle = "Start Free Trial - Digital Loyalty Stamps & VIP Club"
    formSubtitle = "Setup digital stamp cards & VIP rewards in 2 minutes"
    submitBtnText = "Start Free Trial - Digital Loyalty Stamps & VIP Club →"
    benefits = [
      "Digital WhatsApp Stamp Cards (No app download)",
      "VIP Club Engine & Tier Upgrades (Silver, Gold, Platinum)",
      "Automated Inactivity Win-Backs (14-day & 30-day)",
      "Cashier 1-Tap Counter Queue Terminal",
    ]
  } else if (isAutoReplyMode) {
    headerBadge = "3-Day FREE Trial • Ai Drafted SEO Optimized 1-Click Reply to Google Reviews"
    mainTitle = (
      <>
        Ai Drafted SEO Optimized <br />
        <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          1-Click Reply to Google Reviews.
        </span>
      </>
    )
    description = "Never miss a Google review reply again. AI drafts appreciative, SEO-optimized owner responses ready to publish on Google Maps in 1-Click."
    formTitle = "Start Free Trial - Ai Drafted SEO Optimized 1-Click Reply to Google Reviews"
    formSubtitle = "Connect Google Business Profile in 1-Click"
    submitBtnText = "Start Free Trial - Ai Drafted SEO Optimized 1-Click Reply →"
    benefits = [
      "AI Context-Aware Drafts in 1 Second",
      "1-Click Direct Publish to Google Maps",
      "Smart Sentiment & Local Keyword Adaptation",
      "Zero Missed Reviews Guarantee",
    ]
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-emerald-500 selection:text-stone-950">
      {/* Aurora Ambient Glow Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[300px] right-[-100px] w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[-50px] left-[-100px] w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[90px]" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-stone-200/80 bg-white/80 backdrop-blur-md py-2">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-9 sm:h-11 w-auto object-contain transition-transform hover:scale-105" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 hidden sm:inline">Already registered?</span>
            <Button asChild variant="outline" size="sm" className="border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Split Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 flex-1 flex items-start justify-center w-full">
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
          {/* Left Hero Column */}
          <div className="md:col-span-6 lg:col-span-5 space-y-6 text-left pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">{headerBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              {mainTitle}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed">
              {description}
            </p>

            <div className="space-y-2.5 pt-1">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-stone-700 text-xs sm:text-sm font-semibold">{b}</span>
                </div>
              ))}
            </div>

            {/* Social Proof Card */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-lg space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-stone-900">🍰 Cake Connection, Vadodara</span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">Verified Merchant</span>
              </div>
              <p className="text-xs text-stone-500 pt-1">
                &quot;Added ₹38,400 repeat revenue &amp; 19 Google 5-star reviews in just 7 days of onboarding.&quot;
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-6 lg:col-span-7 flex justify-center w-full">
            <div className="w-full max-w-lg bg-white/90 border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600 rounded-t-3xl" />

              <div className="mb-6">
                <h2 className="text-2xl font-black text-stone-900">
                  {formTitle}
                </h2>
                <p className="text-stone-500 text-xs mt-1">
                  {formSubtitle}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex flex-col gap-2 shadow-sm">
                  <div className="flex items-start gap-2 font-semibold">
                    <span className="text-sm">⚠️</span>
                    <span className="leading-snug">{error}</span>
                  </div>
                  {error.toLowerCase().includes("login") && (
                    <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">Already registered?</span>
                      <Link 
                        href="/login" 
                        className="text-xs bg-stone-900 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        Sign In Now <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Google One-Click Signup */}
              <a
                href={moduleParam ? `/api/auth/google?module=${moduleParam}` : "/api/auth/google"}
                className="w-full h-11 bg-stone-50 hover:bg-stone-100 text-stone-900 font-bold text-xs rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm border border-stone-200 mb-5 cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                Continue with Google Account
              </a>

              <div className="relative flex items-center gap-3 my-5">
                <div className="flex-1 border-t border-stone-200" />
                <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider">or sign up manually</span>
                <div className="flex-1 border-t border-stone-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`grid grid-cols-1 ${isReviewsMode ? '' : 'md:grid-cols-2'} gap-3`}>
                  <div>
                    <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Business Name *
                    </Label>
                    <Input
                      placeholder="e.g. Cake Connection"
                      value={form.businessName}
                      onChange={e => update("businessName", e.target.value)}
                      className="mt-1 text-xs bg-stone-50 border-stone-200 focus:bg-white"
                      required
                    />
                  </div>
                  {!isReviewsMode && (
                    <div>
                      <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-600" /> Owner Name *
                      </Label>
                      <Input
                        placeholder="e.g. Hitesh"
                        value={form.ownerName}
                        onChange={e => update("ownerName", e.target.value)}
                        className="mt-1 text-xs bg-stone-50 border-stone-200 focus:bg-white"
                        required
                      />
                    </div>
                  )}
                </div>

                {!isReviewsMode && !isAutoReplyMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Number *
                    </Label>
                    <Input
                      placeholder="e.g. 919876543210"
                      value={form.whatsappPhone}
                      onChange={e => update("whatsappPhone", e.target.value)}
                      className="mt-1 text-xs bg-stone-50 border-stone-200 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                      Business Category
                    </Label>
                    <Select value={form.businessType} onValueChange={v => update("businessType", v)}>
                      <SelectTrigger className="mt-1 text-xs bg-stone-50 border-stone-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bakery">🍰 Bakery &amp; Cake Shop</SelectItem>
                        <SelectItem value="cafe">☕ Cafe &amp; Coffee Shop</SelectItem>
                        <SelectItem value="restaurant">🍽️ Restaurant &amp; Dine-in</SelectItem>
                        <SelectItem value="salon">💇 Salon, Spa &amp; Beauty</SelectItem>
                        <SelectItem value="retail">🛍️ Retail &amp; Supermarket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                )}

                <div>
                  <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" /> Business Email *
                  </Label>
                  <Input
                    type="email"
                    placeholder="e.g. owner@cakeconnection.in"
                    value={form.email}
                    onChange={e => update("email", e.target.value)}
                    className="mt-1 text-xs bg-stone-50 border-stone-200 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Password *
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={e => update("password", e.target.value)}
                      className="text-xs bg-stone-50 border-stone-200 focus:bg-white pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  {loading ? "Setting up merchant account..." : submitBtnText}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-200/80 bg-white/50 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <span>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-stone-800">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-stone-800">Terms of Service</Link>
            <Link href="/security" className="hover:text-stone-800">Security</Link>
            <Link href="/contact" className="hover:text-stone-800">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function SignupClient() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-pulse">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
