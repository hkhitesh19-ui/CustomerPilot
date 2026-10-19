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

const GoogleGLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
)

const WhatsAppLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

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
    <div className="space-y-10 sm:space-y-12 w-full max-w-5xl mx-auto relative pb-16">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent dark:from-sky-950/20 dark:via-slate-950 dark:to-slate-950 -z-10 pointer-events-none" />
      
      {/* ─── Header ───────────────────────────────────────────────────── */}
      <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0284c7] dark:text-[#38bdf8] uppercase tracking-wider">
          <span>Merchant Control Center</span>
          <span>•</span>
          <span>All-In-One Store Settings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Settings &amp; Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Manage your counter standees, Google review AI automations, business details, loyalty stamp rules, WhatsApp device linking, and timers.
        </p>
      </div>

      {/* ─── Quick-Jump Anchor Bar ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800/80 -mx-1 px-1">
        <a 
          href="#sec-vip-qr" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <QrCode className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-black text-[#0284c7] dark:text-[#38bdf8]">01</span>
          <span>Standee Studio</span>
        </a>

        {isReviewsEnabled && (
          <a 
            href="#sec-google-reviews" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <div className="w-5 h-5 rounded-md bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 p-0.5 shadow-xs">
              <GoogleGLogo className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-[#0284c7] dark:text-[#38bdf8]">02</span>
            <span>Google Reviews</span>
          </a>
        )}

        <a 
          href="#sec-business" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Store className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-black text-[#0284c7] dark:text-[#38bdf8]">03</span>
          <span>Business Info</span>
        </a>

        {isLoyaltyEnabled && (
          <a 
            href="#sec-reward-setup" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Gift className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black text-[#0284c7] dark:text-[#38bdf8]">04</span>
            <span>Reward Setup</span>
          </a>
        )}

        {isLoyaltyEnabled && (
          <a 
            href="#sec-whatsapp-conn" 
            className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-500 via-[#25D366] to-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-xs">
              <WhatsAppLogo className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-black text-[#0284c7] dark:text-[#38bdf8]">05</span>
            <span>WhatsApp</span>
          </a>
        )}

        <a 
          href="#sec-automations" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-black text-[#0284c7] dark:text-[#38bdf8]">06</span>
          <span>Timers &amp; Templates</span>
        </a>

        <a 
          href="#sec-guides" 
          className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-[#0284c7]/50 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-black text-[#0284c7] dark:text-[#38bdf8]">07</span>
          <span>Operations Manual</span>
        </a>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: COUNTER QR STANDEE STUDIO                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section 
        id="sec-vip-qr" 
        className="rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-6 relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <QrCode className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#38bdf8] border border-[#0284c7]/30">
                  SECTION 01
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Bespoke Standee Studio
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8] tracking-tight mt-1">
                Counter QR Standee Studio
              </h2>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline max-w-xs text-right">
            Bespoke Standees: Google Reviews, Digital Card &amp; VIP Loyalty
          </span>
        </div>

        <div className="pt-1">
          <QRGenerator merchantId={merchant?.id || ""} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: SMART AI GOOGLE REVIEWS                                */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isReviewsEnabled && (
        <section 
          id="sec-google-reviews" 
          className="rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-6 relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md shadow-slate-200/50 dark:shadow-slate-950/50 shrink-0 p-2.5">
                <GoogleGLogo className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#38bdf8] border border-[#0284c7]/30">
                    SECTION 02
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Google Business &amp; Review QR
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8] tracking-tight mt-1">
                  Smart AI Google Reviews
                </h2>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline max-w-xs text-right">
              Google Business Profile &amp; Review QR Codes
            </span>
          </div>

          <div className="space-y-6 pt-1">
            {/* 2A: Smart AI Reviews QR Code & Posters */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-0.5 rounded-md border border-[#0284c7]/20">STEP A</span>
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 p-1 shadow-xs">
                    <GoogleGLogo className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Smart AI Review QR Code &amp; Posters</h3>
                </div>
              </div>
              <GoogleReviewQRGenerator 
                merchantId={merchant?.id || ""} 
                googleReviewUrl={merchant?.merchantGoogleConnections?.googleReviewUrl || (merchant as any)?.googleReviewLink} 
                placeName={merchant?.merchantGoogleConnections?.placeName} 
              />
            </div>

            {/* 2B: Google Business Profile 1-Click Connect (with Merged Review Prompt Timers) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-0.5 rounded-md border border-[#0284c7]/20">STEP B</span>
                  <div className="w-6 h-6 rounded-md bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 p-1 shadow-xs">
                    <GoogleGLogo className="w-4 h-4" />
                  </div>
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
      <section 
        id="sec-business" 
        className="rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-6 relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Store className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#38bdf8] border border-[#0284c7]/30">
                  SECTION 03
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Store Profile &amp; Category
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8] tracking-tight mt-1">
                Business Information
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {saveStatus === "saved" && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4"/> Saved
              </span>
            )}
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 shadow-xs space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Your store name, owner details, and business category printed on QR Codes and customer digital cards.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Store className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]"/> Business Name <span className="text-rose-500 font-bold">*</span>
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
                <User className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]"/> Owner Name
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
                <Tag className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]"/> Business Type <span className="text-rose-500 font-bold">*</span>
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
                <Globe className="w-3.5 h-3.5 text-[#0284c7] dark:text-[#38bdf8]"/> Category / Cuisine <span className="text-rose-500 font-bold">*</span>
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
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: REWARD CARD SETUP & LOYALTY LEVELS                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {isLoyaltyEnabled && (
        <section 
          id="sec-reward-setup" 
          className="rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-6 relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <Gift className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#38bdf8] border border-[#0284c7]/30">
                    SECTION 04
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Stamps, Bonuses &amp; Tiers
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8] tracking-tight mt-1">
                  Stamps Reward Card Rules Setup
                </h2>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline max-w-xs text-right">
              Digital Stamp Rules, Joining Bonus, Referrals &amp; 10 Loyalty Levels
            </span>
          </div>

          <div className="space-y-6 pt-1">
            {/* 4A: Stamps Reward Card Rules Setup */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-0.5 rounded-md border border-[#0284c7]/20">STEP A</span>
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Stamps Reward Card Rules Setup</h3>
                </div>
              </div>
              <RewardSetupCard merchantId={merchant?.id || ""} />
            </div>

            {/* 4B: Loyalty Cycle Categories (10 Levels) */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-0.5 rounded-md border border-[#0284c7]/20">STEP B</span>
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
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
        <section 
          id="sec-whatsapp-conn" 
          className="rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-6 relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-[#25D366] to-[#128C7E] flex items-center justify-center text-white shadow-md shadow-[#25D366]/30 shrink-0">
                <WhatsAppLogo className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#38bdf8] border border-[#0284c7]/30">
                    SECTION 05
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Store WhatsApp Device
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8] tracking-tight mt-1">
                  Your Business WhatsApp Connection
                </h2>
              </div>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline max-w-xs text-right">
              Device QR Pairing, Instance Linking &amp; Live Server Status
            </span>
          </div>

          <div className="pt-1">
            <WhatsAppVerification merchantId={merchant?.id || ""} />
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: AUTOMATION TIMERS & MESSAGE TEMPLATES                   */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section 
        id="sec-automations" 
        className="rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-6 relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 shrink-0">
              <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#38bdf8] border border-[#0284c7]/30">
                  SECTION 06
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Win-Back &amp; Message Journeys
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8] tracking-tight mt-1">
                Custom Automation Timers &amp; Reminder Days
              </h2>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline max-w-xs text-right">
            Day 30, 60, 90 Win-Backs &amp; Automated WhatsApp Journey Templates
          </span>
        </div>

        <div className="space-y-6 pt-1">
          {/* 6A: Win-Back & Retention Timers */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-0.5 rounded-md border border-[#0284c7]/20">STEP A</span>
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Custom Automation Timers &amp; Reminder Days</h3>
              </div>
            </div>
            <AutomationTimerSettings merchantId={merchant?.id || ""} />
          </div>

          {/* 6B: Message Templates */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-[#0284c7] dark:text-[#38bdf8] bg-[#0284c7]/10 px-2.5 py-0.5 rounded-md border border-[#0284c7]/20">STEP B</span>
                <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-emerald-500 via-[#25D366] to-[#128C7E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <WhatsAppLogo className="w-3.5 h-3.5" />
                </div>
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
      <section 
        id="sec-guides" 
        className="rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-md dark:shadow-2xl space-y-6 relative overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#0284c7]/10 text-[#0284c7] dark:bg-[#0284c7]/20 dark:text-[#38bdf8] border border-[#0284c7]/30">
                  SECTION 07
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Staff Guides &amp; SOPs
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] dark:text-[#38bdf8] tracking-tight mt-1">
                Staff &amp; Operations Manual
              </h2>
            </div>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline max-w-xs text-right">
            Staff training, cashier SOPs, and daily check-in workflows
          </span>
        </div>

        <div className="max-w-xl pt-1">
          <Link 
            href="/guide/operations"
            className="group block p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 hover:border-[#0284c7]/50 transition-all duration-200 shadow-xs relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 border border-[#0284c7]/20 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] transition-colors pt-1">
                  Operations Manual
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Complete staff cashier guide, daily check-in workflows, and step-by-step simulations.
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] group-hover:translate-x-1 transition-all mt-1" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
