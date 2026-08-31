"use client"

import { useState, useEffect } from "react"
import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Store, Clock, MapPin, User, Tag, Globe, CheckCircle2, Sparkles } from "lucide-react"
import { WhatsAppVerification } from "@/components/whatsapp-verification"
import { WhatsAppTemplateManager } from "@/components/whatsapp-template-manager"
import { GoogleBusinessIntegration } from "@/components/google-business-integration"
import { GoogleReviewDelaySettings } from "@/components/google-review-delay-settings"
import { GoogleReviewQRGenerator } from "@/components/google-review-qr-generator"
import { BrandingSettings } from "@/components/branding-settings"
import { RewardSetupCard } from "@/components/reward-setup-card"
import { LoyaltyCategoryCard } from "@/components/loyalty-category-card"
import { QRGenerator } from "@/components/qr-generator"
import { GoLiveValidator } from "@/components/go-live-validator"
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

  if (isLoading) return <div className="p-8 animate-pulse text-muted-foreground">Loading settings...</div>

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto relative pb-12">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10 pointer-events-none" />
      
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Merchant Settings</h1>
          {isLoyaltyOnly ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
              🎁 Digital Loyalty Stamps &amp; VIP Club
            </span>
          ) : isReviewsOnly ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              ⭐ Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              🚀 CustomerPilot Complete : Digital Loyalty + Smart AI GoogleReviews + 1-Click AutoReply
            </span>
          )}
        </div>
        <p className="text-slate-400 mt-1">Configure your business profile, Google Review QR Standees, and Digital Loyalty system.</p>
      </div>

      {/* ─── SECTION 1: CORE BUSINESS PROFILE ────────────────── */}
      <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-200">Business Information</CardTitle>
              <CardDescription className="text-slate-400">Core business identity displayed on QR standees and review pages.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === "saved" && <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Saved</span>}
              <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-semibold text-slate-300"><Store className="w-4 h-4 text-emerald-400"/> Business Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="E.g., Central Cafe"
                className="bg-slate-950/60 border-slate-800 text-slate-100"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-semibold text-slate-300"><User className="w-4 h-4 text-emerald-400"/> Owner Name</Label>
              <Input 
                value={formData.ownerName} 
                onChange={(e) => handleChange("ownerName", e.target.value)}
                placeholder="E.g., John Doe"
                className="bg-slate-950/60 border-slate-800 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-semibold text-slate-300"><Tag className="w-4 h-4 text-emerald-400"/> Business Type</Label>
              <Select value={formData.businessType?.toUpperCase() || ""} onValueChange={(v) => handleChange("businessType", v)}>
                <SelectTrigger className="bg-slate-950/60 border-slate-800 text-slate-100">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="BAKERY">Bakery 🥐</SelectItem>
                  <SelectItem value="RESTAURANT">Restaurant / Cafe ☕</SelectItem>
                  <SelectItem value="RETAIL">Retail Store 🛍️</SelectItem>
                  <SelectItem value="SALON">Salon / Spa 💇</SelectItem>
                  <SelectItem value="GYM">Gym 💪</SelectItem>
                  <SelectItem value="CLINIC">Clinic 🏥</SelectItem>
                  <SelectItem value="OTHER">Other 📦</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-semibold text-slate-300"><Globe className="w-4 h-4 text-emerald-400"/> Category / Cuisine</Label>
              <Input 
                value={formData.category} 
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="E.g., Italian Cuisine, Barber Shop"
                className="bg-slate-950/60 border-slate-800 text-slate-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 2: AI DRAFT & WHATSAPP REVIEW FLOW SECTION ─── */}
      {isReviewsEnabled && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-amber-400">⭐ Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Reviews &amp; Standee QR
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Google Business Profile + Standee QR</span>
          </div>

          <GoogleBusinessIntegration merchantId={merchant?.id || ""} />
          <GoogleReviewQRGenerator 
            merchantId={merchant?.id || ""} 
            googleReviewUrl={merchant?.merchantGoogleConnections?.googleReviewUrl || (merchant as any)?.googleReviewLink} 
            placeName={merchant?.merchantGoogleConnections?.placeName} 
          />
          <GoogleReviewDelaySettings merchantId={merchant?.id || ""} />
        </div>
      )}

      {/* ─── SECTION 3: DIGITAL LOYALTY STAMPS & VIP CLUB SECTION ─── */}
      {isLoyaltyEnabled && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-400">🎁 Digital Loyalty Stamps &amp; VIP Club</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                VIP Stamp Cards &amp; QR
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Loyalty Check-in QR + Stamp Rewards</span>
          </div>

          <WhatsAppVerification merchantId={merchant?.id || ""} />
          <QRGenerator merchantId={merchant?.id || ""} />
          <LoyaltyCategoryCard merchantId={merchant?.id || ""} initialCategoryJson={(merchant as any)?.loyaltyCategoryNames} />
          <RewardSetupCard merchantId={merchant?.id || ""} />
          <WhatsAppTemplateManager merchantId={merchant?.id || ""} />
        </div>
      )}

      {/* ─── SECTION 4: BRANDING & AUTOMATION CONTROLS ───────── */}
      <div className="space-y-6 pt-4">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xl font-bold text-slate-200">🏢 Branding &amp; Automation Diagnostics</span>
        </div>

        <BrandingSettings merchantId={merchant?.id || ""} />
        <AutomationTimerSettings merchantId={merchant?.id || ""} />
        <GoLiveValidator merchantId={merchant?.id || ""} />
      </div>
    </div>
  )
}
