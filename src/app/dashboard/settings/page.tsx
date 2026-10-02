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
  Star,
  QrCode
} from "lucide-react"
import { WhatsAppVerification } from "@/components/whatsapp-verification"
import { WhatsAppJourneyTemplates } from "@/components/whatsapp-journey-templates"
import { GoogleBusinessIntegration } from "@/components/google-business-integration"
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
    if (!formData.name?.trim()) {
      toast({
        title: "Mandatory Field Missing",
        description: "Please enter your Business Name.",
        variant: "destructive",
      })
      return
    }
    if (!formData.businessType?.trim()) {
      toast({
        title: "Mandatory Field Missing",
        description: "Please select your Business Type.",
        variant: "destructive",
      })
      return
    }
    if (!formData.category?.trim()) {
      toast({
        title: "Mandatory Field Missing",
        description: "Please enter your Category / Cuisine.",
        variant: "destructive",
      })
      return
    }

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
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent dark:from-indigo-900/20 dark:via-slate-950 dark:to-slate-950 -z-10 pointer-events-none" />
      
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="pb-1">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Settings &amp; Configuration
        </h1>
      </div>

      {/* ─── Mobile Quick-Jump Anchor Bar ───────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800/80 -mx-1 px-1">
        <a 
          href="#sec-vip-qr" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">01</span>
          <span>Loyalty Stamp QR</span>
        </a>

        {isReviewsEnabled && (
          <a 
            href="#sec-google-reviews" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">02</span>
            <span>Google Reviews</span>
          </a>
        )}

        <a 
          href="#sec-business" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">03</span>
          <span>Business Info</span>
        </a>

        {isLoyaltyEnabled && (
          <a 
            href="#sec-reward-setup" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded">04</span>
            <span>Reward Setup</span>
          </a>
        )}

        {isLoyaltyEnabled && (
          <a 
            href="#sec-whatsapp-conn" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">05</span>
            <span>WhatsApp Connection</span>
          </a>
        )}

        <a 
          href="#sec-automations" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-violet-500/40 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 px-1.5 py-0.2 rounded">06</span>
          <span>Timers &amp; Templates</span>
        </a>

        <a 
          href="#sec-guides" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">07</span>
          <span>Operations Manual</span>
        </a>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: WHATSAPP VIP LOYALTY & STAMP CHECK-IN QR STANDEE        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isLoyaltyEnabled && (
        <section id="sec-vip-qr" className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                01
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <QrCode className="w-6 h-6" />
                </div>
                Digital Loyalty Stamp QR
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Counter Standee, Table Tents &amp; Packaging QR Stickers
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
            <QRGenerator merchantId={merchant?.id || ""} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: SMART AI GOOGLE REVIEWS                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isReviewsEnabled && (
        <section id="sec-google-reviews" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                02
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2.5 tracking-tight">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                Smart Ai Google Reviews
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Google Business Profile &amp; Review Standees
            </span>
          </div>

          <div className="space-y-4">
            {/* 2A: Smart AI Reviews QR Standee & Posters */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">STEP A</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Smart Ai Google Reviews</h3>
                </div>
              </div>
              <GoogleReviewQRGenerator 
                merchantId={merchant?.id || ""} 
                googleReviewUrl={merchant?.merchantGoogleConnections?.googleReviewUrl || (merchant as any)?.googleReviewLink} 
                placeName={merchant?.merchantGoogleConnections?.placeName} 
              />
            </div>

            {/* 2B: Google Business Profile 1-Click Connect (with Merged Review Prompt Timers) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">STEP B</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Google Business Profile Integration</h3>
                </div>
              </div>
              <GoogleBusinessIntegration merchantId={merchant?.id || ""} />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: BUSINESS PROFILE & STORE DETAILS                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-business" className="space-y-3 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              03
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Store className="w-6 h-6" />
              </div>
              Business Information
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Store Name, Owner &amp; Business Category
          </span>
        </div>

        <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 backdrop-blur-xl shadow-sm dark:shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/60 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Business Information</CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Your store name, owner details, and business category printed on QR Standees.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {saveStatus === "saved" && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4"/> Saved
                  </span>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Store className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400"/> Business Name <span className="text-rose-500 font-bold">*</span>
                </Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="E.g., Cake Connection"
                  required
                  className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400"/> Owner Name
                </Label>
                <Input 
                  value={formData.ownerName} 
                  onChange={(e) => handleChange("ownerName", e.target.value)}
                  placeholder="E.g., Kiyaaan"
                  className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Tag className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400"/> Business Type <span className="text-rose-500 font-bold">*</span>
                </Label>
                <Select value={formData.businessType?.toUpperCase() || ""} onValueChange={(v) => handleChange("businessType", v)}>
                  <SelectTrigger className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
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
                <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400"/> Category / Cuisine <span className="text-rose-500 font-bold">*</span>
                </Label>
                <Input 
                  value={formData.category} 
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="E.g., Fresh Cakes, Italian Cuisine, Barber Shop"
                  required
                  className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: REWARD CARD SETUP & LOYALTY LEVELS                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isLoyaltyEnabled && (
        <section id="sec-reward-setup" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                04
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2.5 tracking-tight">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Gift className="w-6 h-6" />
                </div>
                Stamps Reward Card Rules Setup
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Digital Stamp Rules, Joining Bonus &amp; 10 Loyalty Levels
            </span>
          </div>

          <div className="space-y-4">
            {/* 4A: Stamps Reward Card Rules Setup */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">STEP A</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Stamps Reward Card Rules Setup</h3>
                </div>
              </div>
              <RewardSetupCard merchantId={merchant?.id || ""} />
            </div>

            {/* 4B: Loyalty Cycle Categories (10 Levels) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">STEP B</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Loyalty Cycle Categories (10 Levels)</h3>
                </div>
              </div>
              <LoyaltyCategoryCard merchantId={merchant?.id || ""} initialCategoryJson={(merchant as any)?.loyaltyCategoryNames} />
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: YOUR BUSINESS WHATSAPP CONNECTION                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isLoyaltyEnabled && (
        <section id="sec-whatsapp-conn" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                05
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 tracking-tight">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-[#25D366] border border-emerald-500/20">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    className="w-6 h-6 text-[#25D366]"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                Your Business WhatsApp Connection
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Store WhatsApp Device Linking &amp; Live Status
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
            <WhatsAppVerification merchantId={merchant?.id || ""} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: AUTOMATION TIMERS & MESSAGE TEMPLATES                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-automations" className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30">
              06
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-violet-600 dark:text-violet-400 flex items-center gap-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                <Clock className="w-6 h-6" />
              </div>
              Custom Automation Timers &amp; Reminder Days
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Day 30, 60, 90 Win-Backs &amp; Auto-Replies
          </span>
        </div>

        <div className="space-y-4">
          {/* 6A: Win-Back & Retention Timers */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-violet-600 dark:text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md">STEP A</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Custom Automation Timers &amp; Reminder Days</h3>
              </div>
            </div>
            <AutomationTimerSettings merchantId={merchant?.id || ""} />
          </div>

          {/* 6B: Message Templates */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm dark:shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-violet-600 dark:text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-md">STEP B</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Automated WhatsApp Journey Templates</h3>
              </div>
            </div>
            <WhatsAppJourneyTemplates merchantId={merchant?.id || ""} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: OPERATIONS MANUAL                                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section id="sec-guides" className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
              07
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <BookOpen className="w-6 h-6" />
              </div>
              Staff &amp; Operations Manual
            </h2>
          </div>
        </div>

        <div className="max-w-xl">
          {/* Operations Manual Card */}
          <Link 
            href="/guide/operations"
            className="group block p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-indigo-500/40 transition-all duration-200 shadow-sm dark:shadow-lg relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors pt-1">
                  Operations Manual
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Complete staff cashier guide, daily check-in workflows, and step-by-step simulations.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all mt-1" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
