"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  Store, 
  User, 
  Tag, 
  Globe, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight,
  Gift,
  Star
} from "lucide-react"
import { WhatsAppVerification } from "@/components/whatsapp-verification"
import { WhatsAppJourneyTemplates } from "@/components/whatsapp-journey-templates"
import { GoogleBusinessIntegration } from "@/components/google-business-integration"
import { GoogleReviewDelaySettings } from "@/components/google-review-delay-settings"
import { GoogleReviewQRGenerator } from "@/components/google-review-qr-generator"
import { RewardSetupCard } from "@/components/reward-setup-card"
import { LoyaltyCategoryCard } from "@/components/loyalty-category-card"
import { QRGenerator } from "@/components/qr-generator"
import { AutomationTimerSettings } from "@/components/automation-timer-settings"
import { hasModule } from "@/lib/feature-gate"

export default function SettingsPage() {
  const { data, isLoading } = useDashboardState()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    businessType: "",
    address: "",
    businessTiming: "",
    category: "",
    timezone: "",
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const merchant = data?.merchant
  const isLoyaltyEnabled = hasModule(merchant, "LOYALTY")
  const isReviewsEnabled = hasModule(merchant, "REVIEWS") || hasModule(merchant, "AUTOREPLY")
  const isReviewsOnly = isReviewsEnabled && !isLoyaltyEnabled
  const isLoyaltyOnly = isLoyaltyEnabled && !isReviewsEnabled
  const isCompleteSuite = isLoyaltyEnabled && isReviewsEnabled

  useEffect(() => {
    if (data?.merchant) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: data.merchant.name || "",
        ownerName: data.merchant.ownerName || "",
        businessType: data.merchant.businessType || "",
        address: data.merchant.address || "",
        businessTiming: data.merchant.businessTiming || "",
        category: data.merchant.category || "",
        timezone: data.merchant.timezone || "Asia/Kolkata",
        vipUpgradeBonusStamps: data.merchant.vipUpgradeBonusStamps ?? 1,
      } as any)
    }
  }, [data?.merchant])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("saving")
    try {
      const res = await fetch("/api/merchant/update", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-merchant-id": data?.merchant?.id || ""
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Failed to save")
      
      setSaveStatus("saved")
      toast({
        title: "Settings Saved",
        description: "Your business information has been updated.",
      })
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not save settings.",
        variant: "destructive",
      })
      setSaveStatus("idle")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !merchant) return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto relative pb-16">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10 pointer-events-none" />
      
      {/* ─── Header & Plan Pill ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">Settings &amp; Configuration</h1>
          {isLoyaltyOnly ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
              🎁 Digital Loyalty Stamps &amp; VIP Club
            </span>
          ) : isReviewsOnly ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              ⭐ Smart Ai Google Reviews
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              🚀 CustomerPilot Complete : Loyalty + Reviews + AutoReply
            </span>
          )}
        </div>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
          Configure your business profile, Google Review QR Standees, and Digital Loyalty system.
        </p>
      </div>

      {/* ─── Mobile Quick-Jump Anchor Bar ───────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/80 -mx-1 px-1">
        <a 
          href="#sec-business" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">01</span>
          <span>Store Info</span>
        </a>

        {isReviewsEnabled && (
          <a 
            href="#sec-google-reviews" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">02</span>
            <span>Google Reviews</span>
          </a>
        )}

        {isLoyaltyEnabled && (
          <a 
            href="#sec-loyalty-club" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">03</span>
            <span>Loyalty Stamps</span>
          </a>
        )}

        <a 
          href="#sec-automations" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-1.5 py-0.2 rounded">04</span>
          <span>Timers &amp; Templates</span>
        </a>

        <a 
          href="#sec-guides" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">05</span>
          <span>Manuals &amp; Admin</span>
        </a>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: BUSINESS PROFILE & STORE DETAILS                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-business" className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            01
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-400" />
            Business Information
          </h2>
        </div>

        <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-900/40 border-b border-slate-800/60 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-200">Core Business Identity</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-0.5">
                  Your store name, owner details, and business category printed on QR Standees.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === "saved" && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4"/> Saved
                  </span>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Store className="w-3.5 h-3.5 text-emerald-400"/> Business Name
                </Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="E.g., Cake Connection"
                  className="bg-slate-950/70 border-slate-800 text-slate-100 rounded-xl text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <User className="w-3.5 h-3.5 text-emerald-400"/> Owner Name
                </Label>
                <Input 
                  value={formData.ownerName} 
                  onChange={(e) => handleChange("ownerName", e.target.value)}
                  placeholder="E.g., Kiyaaan"
                  className="bg-slate-950/70 border-slate-800 text-slate-100 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-emerald-400"/> Business Type
                </Label>
                <Select value={formData.businessType?.toUpperCase() || ""} onValueChange={(v) => handleChange("businessType", v)}>
                  <SelectTrigger className="bg-slate-950/70 border-slate-800 text-slate-100 rounded-xl text-sm">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                    <SelectItem value="BAKERY">Bakery 🥐</SelectItem>
                    <SelectItem value="RESTAURANT">Restaurant / Cafe ☕</SelectItem>
                    <SelectItem value="RETAIL">Retail Store 🛍️</SelectItem>
                    <SelectItem value="SALON">Salon / Spa 💇</SelectItem>
                    <SelectItem value="GYM">Gym / Fitness 💪</SelectItem>
                    <SelectItem value="CLINIC">Clinic 🏥</SelectItem>
                    <SelectItem value="OTHER">Other Local Retail 📦</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-emerald-400"/> Category / Cuisine
                </Label>
                <Input 
                  value={formData.category} 
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="E.g., Fresh Cakes, Italian Cuisine, Barber Shop"
                  className="bg-slate-950/70 border-slate-800 text-slate-100 rounded-xl text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: SMART AI GOOGLE REVIEWS                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isReviewsEnabled && (
        <section id="sec-google-reviews" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                02
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Smart Ai Google Reviews
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Google Business Profile &amp; Review Standees
            </span>
          </div>

          <div className="space-y-4">
            {/* 2A: Google Business Profile 1-Click Connect */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">STEP A</span>
                  <h3 className="text-sm font-bold text-slate-200">Google Business Profile Integration</h3>
                </div>
              </div>
              <GoogleBusinessIntegration merchantId={merchant?.id || ""} />
            </div>

            {/* 2B: Smart AI Reviews QR Standee & Posters (Renamed) */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">STEP B</span>
                  <h3 className="text-sm font-bold text-slate-200">Smart Ai Google Reviews QR Standee &amp; Posters</h3>
                </div>
              </div>
              <GoogleReviewQRGenerator 
                merchantId={merchant?.id || ""} 
                googleReviewUrl={merchant?.merchantGoogleConnections?.googleReviewUrl || (merchant as any)?.googleReviewLink} 
                placeName={merchant?.merchantGoogleConnections?.placeName} 
              />
            </div>

            {/* 2C: Google Review Delay Settings */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">STEP C</span>
                  <h3 className="text-sm font-bold text-slate-200">Google Review Prompt Timers</h3>
                </div>
              </div>
              <GoogleReviewDelaySettings merchantId={merchant?.id || ""} />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: DIGITAL LOYALTY STAMPS & VIP CLUB                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isLoyaltyEnabled && (
        <section id="sec-loyalty-club" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                03
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-indigo-400 flex items-center gap-2">
                <Gift className="w-5 h-5 text-indigo-400" />
                Digital Loyalty Stamps &amp; VIP Club
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              WhatsApp VIP Standees &amp; Stamp Rewards
            </span>
          </div>

          <div className="space-y-4">
            {/* 3A: WhatsApp Connection & VIP Club Phone Linking */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">STEP A</span>
                  <h3 className="text-sm font-bold text-slate-200">Store WhatsApp Linking</h3>
                </div>
              </div>
              <WhatsAppVerification merchantId={merchant?.id || ""} />
            </div>

            {/* 3B: Whatsapp VIP Loyalty & Stamp Check-in QR Standee */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">STEP B</span>
                  <h3 className="text-sm font-bold text-slate-200">WhatsApp VIP Loyalty &amp; Stamp Check-in QR Standee</h3>
                </div>
              </div>
              <QRGenerator merchantId={merchant?.id || ""} />
            </div>

            {/* 3C: Loyalty Cycle Categories (10 Levels) */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">STEP C</span>
                  <h3 className="text-sm font-bold text-slate-200">Loyalty Cycle Categories (10 Levels)</h3>
                </div>
              </div>
              <LoyaltyCategoryCard merchantId={merchant?.id || ""} initialCategoryJson={(merchant as any)?.loyaltyCategoryNames} />
            </div>

            {/* 3D: Reward Card Setup */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">STEP D</span>
                  <h3 className="text-sm font-bold text-slate-200">Reward Card Setup</h3>
                </div>
              </div>
              <RewardSetupCard merchantId={merchant?.id || ""} />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: AUTOMATION TIMERS & MESSAGE TEMPLATES                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-automations" className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 border border-violet-500/30">
              04
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-violet-300 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              Custom Automation Timers &amp; Message Templates
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Day 30, 60, 90 Win-Backs &amp; Auto-Replies
          </span>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
            <AutomationTimerSettings merchantId={merchant?.id || ""} />
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5 shadow-lg space-y-3">
            <WhatsAppJourneyTemplates merchantId={merchant?.id || ""} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: SUPER ADMIN CONTROL PANEL & OPERATIONS MANUAL           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-guides" className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-700/40 text-slate-300 border border-slate-700">
              05
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-400" />
              Admin Access &amp; Operations Manuals
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Operations Manual Card */}
          <Link 
            href="/guide/operations"
            className="group block p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-indigo-500/40 transition-all duration-200 shadow-lg relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors pt-1">
                  Operations Manual
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Complete staff cashier guide, daily check-in workflows, and step-by-step simulations.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-1" />
            </div>
          </Link>

          {/* Super Admin Control Panel Card */}
          <Link 
            href="/super-admin"
            className="group block p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 hover:border-amber-500/40 transition-all duration-200 shadow-lg relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors pt-1">
                  Super Admin Control Panel
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  System health monitor, merchant multi-tenant oversight, and platform telemetry.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all mt-1" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
