"use client"

// ============================================================
// CustomerPilot V6.5 — /onboarding page
// Authenticated wizard that saves each step to DB
// Requires JWT cookie (set by /signup or /login)
// ============================================================

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "qrcode"
import { createBrandedClientQR } from "@/lib/client-branded-qr"
import {
  Store, MessageSquare, Search, Upload, Gift, QrCode as QrIcon, Zap,
  Check, ArrowRight, ArrowLeft, Loader2, UserCheck,
  Printer, AlertCircle, CircleDot, Star, Rocket, X, Shield, Sparkles,
  CheckCircle2, ExternalLink, MapPin, Copy, Globe, Building2, RefreshCw, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { hasModule, type Module } from "@/lib/feature-gate"
import { getRecommendedCampaign, getIndustryLoyaltyRule } from "@/lib/industry-campaigns"

// ─── Types ────────────────────────────────────────────────────
interface WizardData {
  merchantId: string
  businessName: string
  ownerName: string
  email: string
  businessType: string
  businessAddress: string
  whatsappNumber: string
  otpVerified: boolean
  otpSessionId: string
  otpSent: boolean
  deliveryStatus?: string
  googleBusiness: string
  googlePlaceId: string
  googleConnected: boolean
  googleSearchResults: any[]
  logoUploaded: boolean
  logoDataUrl?: string
  cardName: string
  stampsRequired: number
  rewardName: string
  cardColor: string
  qrGenerated: boolean
  qrDataUrl: string
  qrPrinted: boolean
  testCustomerPhone: string
  testCustomerScanned: boolean
  testCustomerClaimed: boolean
  testStampsAwarded: number
}

const ALL_STEPS = [
  { stepKey: "business_info",   requiredModules: [] as Module[] },
  { stepKey: "whatsapp_verify", requiredModules: ["LOYALTY", "REVIEWS"] as Module[] },
  { stepKey: "google_business", requiredModules: ["REVIEWS", "AUTOREPLY"] as Module[] },
  { stepKey: "logo_upload",     requiredModules: ["LOYALTY"] as Module[] },
  { stepKey: "reward_setup",    requiredModules: ["LOYALTY"] as Module[] },
  { stepKey: "qr_code",         requiredModules: ["LOYALTY"] as Module[] },
  { stepKey: "print_standee",   requiredModules: ["LOYALTY"] as Module[] },
  { stepKey: "system_test",     requiredModules: ["LOYALTY"] as Module[] },
]

function getFilteredStepKeys(enabledModules: string): string[] {
  return ALL_STEPS
    .filter(s => s.requiredModules.length === 0 || s.requiredModules.some(m => hasModule({ enabledModules }, m)))
    .map(s => s.stepKey)
}

const stepKeys = ALL_STEPS.map(s => s.stepKey)

// ─── Helper: save step to DB ──────────────────────────────────
async function saveStepProgress(stepKey: string, currentStep: number) {
  try {
    await fetch("/api/onboarding/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepKey, completed: true, currentStep }),
    })
  } catch (e) {
    console.error("Failed to save step progress:", e)
  }
}

// ─── canProceedToNext ──────────────────────────────────────────
function canProceedToNext(step: number, data: WizardData): boolean {
  if (step === 1) return data.businessName.length > 2
  if (step === 2) return data.otpVerified
  if (step === 3) return true // Google optional
  if (step === 4) return true // Logo optional
  if (step === 5) return data.stampsRequired > 0 && data.rewardName.length > 2
  if (step === 6) return data.qrGenerated
  if (step === 7) return true
  if (step === 8) return true
  return true
}

// ─── calculateActivationScore ────────────────────────────────
function calculateActivationScore(data: WizardData): number {
  let score = 0
  if (data.businessName) score += 15
  if (data.otpVerified) score += 20
  if (data.googleConnected) score += 15
  if (data.logoUploaded) score += 10
  if (data.stampsRequired > 0 && data.rewardName) score += 15
  if (data.qrGenerated) score += 15
  if (data.qrPrinted) score += 5
  if (data.testCustomerScanned) score += 5
  return Math.min(score, 100)
}

// ─── Main Component ───────────────────────────────────────────
function OnboardingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialStep = parseInt(searchParams.get("step") || "1", 10)

  const [step, setStep] = useState(initialStep)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<WizardData>({
    merchantId: "",
    businessName: "",
    ownerName: "",
    email: "",
    businessType: "bakery",
    businessAddress: "",
    whatsappNumber: "",
    otpVerified: false,
    otpSessionId: "",
    otpSent: false,
    googleBusiness: "",
    googlePlaceId: "",
    googleConnected: false,
    googleSearchResults: [],
    logoUploaded: false,
    cardName: "VIP Club",
    stampsRequired: 10,
    rewardName: "FREE Special Treat",
    cardColor: "amber",
    qrGenerated: false,
    qrDataUrl: "",
    qrPrinted: false,
    testCustomerPhone: "",
    testCustomerScanned: false,
    testCustomerClaimed: false,
    testStampsAwarded: 0,
  })
  const [merchantModules, setMerchantModules] = useState("LOYALTY,REVIEWS,AUTOREPLY")

  // Load merchant data from API
  useEffect(() => {
    const loadMerchant = async () => {
      try {
        const res = await fetch("/api/onboarding/progress")
        if (res.status === 401) {
          router.push("/login")
          return
        }
        const json = await res.json()
        if (json.currentStep && json.currentStep > 1) {
          setStep(json.currentStep)
        }

        // Also load merchant data for pre-filling
        const stateRes = await fetch("/api/state")
        if (stateRes.ok) {
          const stateJson = await stateRes.json()
          if (stateJson.ok && stateJson.data?.merchant) {
            const m = stateJson.data.merchant
            const gConns = stateJson.data.merchantGoogleConnections || []
            const gConn = gConns[0]
            const isGoogleConnected = gConns.length > 0 || !!m.googleReviewLink
            const recRule = getIndustryLoyaltyRule(m.businessType || "bakery", m.name)

            setData(prev => ({
              ...prev,
              merchantId: m.id,
              businessName: m.name || "",
              ownerName: m.ownerName || "",
              email: m.email || "",
              businessType: m.businessType || "bakery",
              businessAddress: m.address || "",
              whatsappNumber: m.whatsappPhone || "",
              cardName: m.name ? `${m.name} VIP Club` : recRule.getCardTitle(m.name),
              stampsRequired: recRule.stampsRequired || 10,
              rewardName: recRule.rewardName || "500 Free Cake",
              stampValue: recRule.stampValue || 300,
              logoUploaded: !!m.logoUrl,
              logoDataUrl: m.logoUrl || prev.logoDataUrl,
              googleConnected: isGoogleConnected,
              googleBusiness: gConn?.placeName || (m.name && !m.name.includes("'s Business") ? m.name : "Cake Connection-Live Cake : Online Cake Delivery in Vadodara"),
              googlePlaceId: gConn?.placeId || "ChIJc7ija2zFXzkR8DbOxXEfaM4",
              googleAddress: gConn?.address || m.address || "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011",
              googleReviewUrl: gConn?.googleReviewUrl || m.googleReviewLink || "https://g.page/r/CfA2zsVxH2jOEBM/review",
            }))
            // Load merchant's enabled modules for conditional step filtering
            if (m.enabledModules) {
              setMerchantModules(m.enabledModules)
            }
          }
        }
      } catch (e) {
        console.error("Failed to load merchant:", e)
      } finally {
        setLoading(false)
      }
    }
    loadMerchant()
  }, [router])

  const activationScore = calculateActivationScore(data)

  // Filter steps based on merchant's enabled modules
  const filteredStepKeys = getFilteredStepKeys(merchantModules)

  const ALL_STEP_CONFIGS = [
    { label: "Business", icon: Store, stepKey: "business_info" },
    { label: "WhatsApp", icon: MessageSquare, stepKey: "whatsapp_verify" },
    { label: "Google", icon: Search, stepKey: "google_business" },
    { label: "Logo", icon: Upload, stepKey: "logo_upload" },
    { label: "Rewards", icon: Gift, stepKey: "reward_setup" },
    { label: "QR Code", icon: QrIcon, stepKey: "qr_code" },
    { label: "Print", icon: Printer, stepKey: "print_standee" },
    { label: "Test", icon: UserCheck, stepKey: "system_test" },
  ]

  const steps = ALL_STEP_CONFIGS
    .filter(s => filteredStepKeys.includes(s.stepKey))
    .map((s, i) => ({ ...s, num: i + 1 }))

  const totalSteps = steps.length
  const currentStepConfig = steps[step - 1]
  const currentStepKey = currentStepConfig?.stepKey || "business_info"

  const next = async () => {
    if (step < totalSteps) {
      // Save current step completion to DB
      if (currentStepKey) {
        await saveStepProgress(currentStepKey, step + 1)
      }

      // Step-specific saves based on stepKey (not step number)
      if (currentStepKey === "business_info" && data.merchantId) {
        try {
          await fetch("/api/merchant/update", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-merchant-id": data.merchantId,
            },
            body: JSON.stringify({
              name: data.businessName,
              ownerName: data.ownerName,
              businessType: data.businessType,
              address: data.businessAddress,
            }),
          })
        } catch (e) {
          console.error("Failed to save business info:", e)
        }
      }

      // If completing Rewards step, save card setup
      if (currentStepKey === "reward_setup") {
        try {
          const rule = getIndustryLoyaltyRule(data.businessType, data.businessName)
          await fetch("/api/cards/setup", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-merchant-id": data.merchantId 
            },
            body: JSON.stringify({
              name: data.cardName || rule.getCardTitle(data.businessName),
              stampsRequired: Number(data.stampsRequired) || rule.stampsRequired,
              rewardName: data.rewardName || rule.rewardName,
              stampValue: data.stampValue ? Number(data.stampValue) : rule.stampValue,
              validityDays: rule.validityDays,
              googleReviewBonus: rule.googleReviewBonus,
              photoBonus: rule.photoBonus,
              joiningBonusEnabled: rule.joiningBonusEnabled,
              joiningBonusStamps: rule.joiningBonusStamps,
              vipUpgradeBonusStamps: rule.vipUpgradeBonusStamps,
              color: rule.color,
            })
          })
        } catch (e) {
          console.error("Failed to save reward card setup:", e)
        }
      }

      setStep(step + 1)
      setError("")
    }
  }

  const back = () => { setStep(step - 1); setError("") }

  const handleLaunch = async () => {
    // Save final step (the last visible step for this merchant's plan)
    const lastStepKey = steps[steps.length - 1]?.stepKey || "system_test"
    await saveStepProgress(lastStepKey, totalSteps)
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-900/90 border-b border-white/10 backdrop-blur-xl px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">CustomerPilot Setup</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Step {step} of 8 • 3-Day Free Trial</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(step / 8) * 100}%` }}
                />
              </div>
              <span className="text-slate-400 text-xs font-medium">{activationScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-4xl mx-auto px-4 py-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => s.num <= step && setStep(s.num)}
                  disabled={s.num > step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                    step === s.num
                      ? "bg-gradient-to-br from-emerald-400 to-indigo-500 text-white scale-110 shadow-lg shadow-emerald-500/30"
                      : step > s.num
                        ? "bg-emerald-500 text-white"
                        : "bg-white/10 text-slate-400"
                  }`}
                >
                  {step > s.num ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <s.icon className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className={`text-[10px] font-medium ${
                  s.num === step ? "text-emerald-400 font-bold" : s.num < step ? "text-emerald-600" : "text-slate-500"
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-all ${s.num < step ? "bg-emerald-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStepKey === "business_info" && <OnboardStep1Business data={data} setData={setData} />}
              {currentStepKey === "whatsapp_verify" && <OnboardStep2WhatsApp data={data} setData={setData} error={error} setError={setError} />}
              {currentStepKey === "google_business" && <OnboardStep3Google data={data} setData={setData} error={error} setError={setError} nextStep={next} />}
              {currentStepKey === "logo_upload" && <OnboardStep4Logo data={data} setData={setData} />}
              {currentStepKey === "reward_setup" && <OnboardStep5Rewards data={data} setData={setData} />}
              {currentStepKey === "qr_code" && <OnboardStep6QR data={data} setData={setData} />}
              {currentStepKey === "print_standee" && <OnboardStep7Print data={data} setData={setData} />}
              {currentStepKey === "system_test" && <OnboardStep8Test data={data} setData={setData} error={error} setError={setError} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 1}
            className="text-slate-300 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </span>
            )}

            {step < totalSteps ? (
              <Button
                onClick={next}
                disabled={!canProceedToNext(step, data)}
                className="bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold shadow-lg px-6"
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleLaunch}
                className="bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold shadow-lg px-8"
              >
                🚀 Launch Merchant Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Business Info (read-only from signup, update allowed) ─────────────────────
function OnboardStep1Business({ data, setData }: any) {
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Store className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Business Information</h2>
          <p className="text-xs text-slate-500">Confirm and complete your business details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl">
        <div>
          <Label className="text-xs font-bold text-slate-800">Business Name *</Label>
          <Input
            value={data.businessName}
            onChange={e => setData({ ...data, businessName: e.target.value })}
            placeholder="e.g., Cake Connection"
            className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 font-medium shadow-xs"
          />
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-800">Owner Name *</Label>
          <Input
            value={data.ownerName}
            onChange={e => setData({ ...data, ownerName: e.target.value })}
            placeholder="e.g., Hitesh"
            className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 font-medium shadow-xs"
          />
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-800">Business Type</Label>
          <Select 
            value={data.businessType} 
            onValueChange={v => {
              const rule = getIndustryLoyaltyRule(v, data.businessName)
              setData({ 
                ...data, 
                businessType: v,
                cardName: rule.getCardTitle(data.businessName),
                stampsRequired: rule.stampsRequired,
                rewardName: rule.rewardName,
                stampValue: rule.stampValue,
              })
            }}
          >
            <SelectTrigger className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 font-medium focus:ring-emerald-500 shadow-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-xl">
              {[
                { value: "bakery", label: "Bakery 🥐" },
                { value: "cafe", label: "Cafe ☕" },
                { value: "restaurant", label: "Restaurant 🍽️" },
                { value: "salon", label: "Salon 💇" },
                { value: "gym", label: "Gym 💪" },
                { value: "retail", label: "Retail 🛍️" },
                { value: "clinic", label: "Clinic 🏥" },
                { value: "other", label: "Other 📦" },
              ].map(t => (
                <SelectItem key={t.value} value={t.value} className="text-slate-900 hover:bg-slate-100 font-medium">{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-800">Business Address / City</Label>
          <Input
            value={data.businessAddress}
            onChange={e => setData({ ...data, businessAddress: e.target.value })}
            placeholder="e.g., Vadodara, Gujarat"
            className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 font-medium shadow-xs"
          />
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-800">Store WhatsApp Number (for QR stamps & reviews)</Label>
          <Input
            value={data.whatsappNumber}
            onChange={e => setData({ ...data, whatsappNumber: e.target.value })}
            placeholder="e.g., 917203824012"
            className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 font-medium shadow-xs"
          />
        </div>
        <div>
          <Label className="text-xs font-bold text-slate-800">Email (from signup)</Label>
          <Input
            value={data.email}
            readOnly
            className="mt-1.5 text-sm bg-slate-100 text-slate-700 border-slate-300 font-mono font-medium"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-emerald-800">
          <strong>Account Created!</strong> Your merchant account is saved and secured. Complete these setup steps to activate.
        </p>
      </div>
    </div>
  )
}

// ─── Step 2: Dynamic Multi-Tenant WhatsApp Pairing ─────────────────────
function OnboardStep2WhatsApp({ data, setData, error, setError }: any) {
  const TOTAL_SESSION_SECONDS = 600 // 10 minutes

  const [loadingQr, setLoadingQr] = useState(false)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "open" | "disconnected">("connecting")
  const [instanceName, setInstanceName] = useState<string>("")
  const [sessionCountdown, setSessionCountdown] = useState(TOTAL_SESSION_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const silentRefreshRef = useRef<NodeJS.Timeout | null>(null)

  // Format seconds into MM:SS format (e.g. 09:45)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60)
    const secs = Math.max(0, totalSeconds) % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Fetch fresh QR code (creates/resets Evolution instance)
  const fetchInstanceStatus = async (force: boolean = false) => {
    setLoadingQr(true)
    try {
      const params = new URLSearchParams()
      if (force) params.append("force", "true")
      if (data.whatsappNumber) params.append("phone", data.whatsappNumber)
      if (data.merchantId) params.append("merchantId", data.merchantId)

      const res = await fetch(`/api/whatsapp/connect?${params.toString()}`, {
        headers: data.merchantId ? { "x-merchant-id": data.merchantId } : {},
      })
      const json = await res.json()
      if (res.ok && json.ok) {
        setInstanceName(json.instanceName || "")
        if (json.status === "open" || json.connected) {
          setConnectionStatus("open")
          setData((prev: any) => ({ ...prev, otpVerified: true, whatsappNumber: json.whatsappPhone || prev.whatsappNumber || "Connected" }))
        } else {
          setConnectionStatus("connecting")
          if (json.qrCodeBase64) setQrCodeBase64(json.qrCodeBase64)
          setSessionCountdown(TOTAL_SESSION_SECONDS) // Reset 10-minute timer
        }
      }
    } catch (e) {
      console.error("Failed to fetch instance QR:", e)
    } finally {
      setLoadingQr(false)
    }
  }

  // On mount: load QR once. Then poll connection state every 3s
  useEffect(() => {
    fetchInstanceStatus(false)

    const interval = setInterval(() => {
      if (connectionStatus !== "open") {
        // Simple polling for state if not yet connected
        const mParam = data.merchantId ? `?merchantId=${encodeURIComponent(data.merchantId)}` : ""
        fetch(`/api/whatsapp/status${mParam}`, {
          headers: data.merchantId ? { "x-merchant-id": data.merchantId } : {},
        })
          .then(r => r.json())
          .then(json => {
             if (json.ok && (json.status === "open" || json.connected)) {
               setConnectionStatus("open")
               setData((prev: any) => ({ ...prev, otpVerified: true, whatsappNumber: json.whatsappPhone || prev.whatsappNumber || "Connected" }))
             }
          })
          .catch(() => {})
      }
    }, 3000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.merchantId])

  // 10-Minute Live Session Countdown Timer
  useEffect(() => {
    if (connectionStatus === "open" || !qrCodeBase64) {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      return
    }

    sessionTimerRef.current = setInterval(() => {
      setSessionCountdown((prev) => {
        if (prev <= 1) {
          if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
          if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    }
  }, [connectionStatus, qrCodeBase64])

  // Automatic Silent Background Refresh every 20 seconds
  // Keeps Baileys QR code fresh on WhatsApp servers without disturbing the 10-minute timer
  useEffect(() => {
    if (connectionStatus === "open" || !qrCodeBase64 || sessionCountdown <= 0) {
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
      return
    }

    silentRefreshRef.current = setInterval(async () => {
      try {
        const phoneParam = data.whatsappNumber ? `&phone=${encodeURIComponent(data.whatsappNumber)}` : ""
        const mParam = data.merchantId ? `&merchantId=${encodeURIComponent(data.merchantId)}` : ""
        const res = await fetch(`/api/whatsapp/connect?silent=true${phoneParam}${mParam}`, {
          headers: data.merchantId ? { "x-merchant-id": data.merchantId } : {},
        })
        if (res.ok) {
          const json = await res.json()
          if (json.status === "open" || json.connected) {
            setConnectionStatus("open")
            setData((prev: any) => ({ ...prev, otpVerified: true, whatsappNumber: json.whatsappPhone || prev.whatsappNumber || "Connected" }))
          } else if (json.qrCodeBase64) {
            // Silently update the image without reloading the UI
            setQrCodeBase64(json.qrCodeBase64)
          }
        }
      } catch (e) {}
    }, 20000)

    return () => {
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
    }
  }, [connectionStatus, qrCodeBase64, sessionCountdown, setData, data.merchantId, data.whatsappNumber])

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Connect Store WhatsApp</h2>
            <p className="text-xs text-slate-500">Scan QR Code with your store's WhatsApp (Linked Devices)</p>
          </div>
        </div>

      </div>

      {connectionStatus === "open" || data.otpVerified ? (
        /* Connected Celebration Card */
        <div className="max-w-xl mx-auto p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 animate-bounce">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <div>
            <Badge className="bg-emerald-600 text-white px-3 py-1 text-xs mb-2">WhatsApp Connected ✓</Badge>
            <h3 className="font-extrabold text-2xl text-slate-900">Store WhatsApp Linked!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
              Your store phone is now linked to CustomerPilot. Automated stamp rewards will be sent directly from your WhatsApp number.
            </p>
          </div>
          {instanceName && (
            <p className="text-[11px] font-mono text-emerald-700 bg-emerald-100/60 inline-block px-3 py-1 rounded-full">
              Instance ID: {instanceName}
            </p>
          )}
        </div>
      ) : (
        /* QR Code Scan Pairing Interface */
        <div className="max-w-xl mx-auto space-y-4">
          {sessionCountdown <= 0 ? (
            /* Expired view */
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-3 bg-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-lg">10-Minute Session Expired</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The 10-minute linking window expired. Click below to generate a fresh QR code session.
              </p>
              <Button onClick={() => fetchInstanceStatus(true)} className="bg-emerald-600 text-white font-bold text-xs">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Fresh 10-Min QR Code
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
              {/* Left Column: QR Display */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-emerald-400/60 shadow-lg relative min-h-[260px]">
                {loadingQr && !qrCodeBase64 ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Generating Live QR...</p>
                  </div>
                ) : qrCodeBase64 ? (
                  <div className="text-center space-y-2">
                    <img
                      src={qrCodeBase64.startsWith("data:") ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                      alt="WhatsApp Pair QR Code"
                      className="w-52 h-52 object-contain rounded-xl border border-slate-200 shadow-md p-1 bg-white"
                    />
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 bg-emerald-50 py-1 px-2.5 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Valid For: <strong className="text-emerald-700 font-mono">{formatTime(sessionCountdown)}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs text-slate-500 mb-3">Initializing QR Code...</p>
                    <Button onClick={() => fetchInstanceStatus(true)} size="sm" className="bg-emerald-600 text-white text-xs">
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: 3 Simple Instructions */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">How to Scan on Phone:</h4>
                  <p className="text-xs text-slate-500">You have 10 full minutes to scan</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <p className="text-xs text-slate-700">Open <strong>WhatsApp</strong> on your store phone.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <p className="text-xs text-slate-700">Tap <strong>Settings / 3 Dots</strong> ➔ select <strong>Linked Devices</strong>.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <p className="text-xs text-slate-700">Tap <strong>Link a Device</strong> and point camera at the QR code on the left.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchInstanceStatus(true)}
                    disabled={loadingQr}
                    className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingQr ? "animate-spin" : ""}`} />
                    Reset 10-Min Session
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <span>Automatic silent refresh keeps the QR code fresh in the background, giving you 10 full minutes without timeout errors.</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Google Business ─────────────────────────────────
function OnboardStep3Google({ data, setData, error, setError, nextStep }: any) {
  const [connectingOauth, setConnectingOauth] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  // Multi-location selection state
  const [availableLocations, setAvailableLocations] = useState<any[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")
  const [isPickingLocation, setIsPickingLocation] = useState<boolean>(false)
  const [savingLocation, setSavingLocation] = useState<boolean>(false)

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Load locations and state when URL param google_connected=true or data.googleConnected
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const isConnectedParam = params.get("google_connected") === "true"

      if (isConnectedParam || data.googleConnected) {
        // 1. Fetch available locations for this account
        fetch("/api/google-business/locations", { headers: { "x-merchant-id": data.merchantId || "cms97ihsr0002w0ykccl3xvqy" } })
          .then(r => r.json())
          .then(json => {
            if (json.ok && json.data?.locations?.length > 0) {
              setAvailableLocations(json.data.locations)
              if (!selectedLocationId) {
                setSelectedLocationId(json.data.locations[0].id)
              }
            }
          })
          .catch(() => {})

        // 2. Fetch state
        fetch("/api/state", { headers: { "x-merchant-id": data.merchantId || "cms97ihsr0002w0ykccl3xvqy" } })
          .then(r => r.json())
          .then(json => {
            const conn = json.data?.merchantGoogleConnections?.[0]
            const m = json.data?.merchant
            if (conn || (isConnectedParam && m)) {
              setData((prev: any) => ({
                ...prev,
                googleConnected: true,
                googleBusiness: conn?.placeName || (m?.name && !m?.name.includes("'s Business") ? m.name : "Cake Connection-Live Cake : Online Cake Delivery in Vadodara"),
                googlePlaceId: conn?.placeId || "ChIJc7ija2zFXzkR8DbOxXEfaM4",
                googleCid: conn?.gbpAccountId?.replace("accounts/", "") || "14873172342901454576",
                googleMapsUri: `https://maps.google.com/?cid=14873172342901454576`,
                googleReviewUrl: conn?.googleReviewUrl || m?.googleReviewLink || "https://g.page/r/CfA2zsVxH2jOEBM/review",
                googleAddress: conn?.address || m?.address || prev.businessAddress || "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011"
              }))
            }
          })
          .catch(() => {})
      }
    }
  }, [setData, data.merchantId, data.googleConnected, selectedLocationId])

  const handleOAuthConnect = () => {
    setConnectingOauth(true)
    const merchantId = data.merchantId || "cms97ihsr0002w0ykccl3xvqy"
    window.location.href = `/api/google-business/oauth?merchantId=${merchantId}`
  }

  const handleSelectTrialLocation = async (location: any) => {
    setSavingLocation(true)
    setSelectedLocationId(location.id)

    setData((prev: any) => ({
      ...prev,
      googleBusiness: location.name,
      googlePlaceId: location.placeId,
      googleCid: location.cid,
      googleMapsUri: location.mapsUri,
      googleReviewUrl: location.reviewUrl,
      googleAddress: location.address,
      googleConnected: true
    }))

    try {
      const merchantId = data.merchantId || "cms97ihsr0002w0ykccl3xvqy"
      await fetch("/api/google-business/select-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": merchantId
        },
        body: JSON.stringify({
          placeId: location.placeId,
          placeName: location.name,
          address: location.address,
          googleReviewUrl: location.reviewUrl,
          cid: location.cid,
          mapsUri: location.mapsUri
        })
      })
      setIsPickingLocation(false)
    } catch (e) {
      console.error("Error saving trial location:", e)
    } finally {
      setSavingLocation(false)
    }
  }

  const disconnectPlace = async () => {
    setDisconnecting(true)
    setError("")

    // 1. Remove param from URL
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("google_connected")
      window.history.replaceState({}, "", url.toString())
    }

    // 2. Clear state immediately
    setData((prev: any) => ({
      ...prev,
      googleConnected: false,
      googleBusiness: "",
      googlePlaceId: "",
      googleReviewUrl: "",
      googleAddress: "",
      googleCid: "",
      googleMapsUri: "",
    }))
    setIsPickingLocation(false)

    // 3. Delete from backend database
    try {
      const merchantId = data.merchantId || "cms97ihsr0002w0ykccl3xvqy"
      await fetch("/api/google-business/disconnect", {
        method: "POST",
        headers: { "x-merchant-id": merchantId }
      })
    } catch (err) {
      console.error("Disconnect API error:", err)
    } finally {
      setDisconnecting(false)
    }
  }

  let rawPlaceName = data.googleBusiness || "Cake Connection-Live Cake : Online Cake Delivery in Vadodara"
  if (rawPlaceName.includes("'s Business")) {
    rawPlaceName = "Cake Connection-Live Cake : Online Cake Delivery in Vadodara"
  }
  const placeName = rawPlaceName.split(/[:;|]/)[0].trim()
  const storeAddress = data.googleAddress || "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011"
  const placeId = data.googlePlaceId || "ChIJc7ija2zFXzkR8DbOxXEfaM4"
  const mapsCid = data.googleCid || "14873172342901454576"
  const mapsUri = data.googleMapsUri || `https://maps.google.com/?cid=${mapsCid}`
  const reviewLink = data.googleReviewUrl || "https://g.page/r/CfA2zsVxH2jOEBM/review"

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Connect Google Business Profile</h2>
          <p className="text-sm text-slate-500">Authorize Google Account for Automated Google Reviews & AI Auto-Reply</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {!data.googleConnected ? (
          /* Official Google OAuth 2.0 Connect View */
          <div className="p-8 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-md shadow-blue-100">
              <Star className="w-7 h-7 fill-blue-600" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-slate-900">Official Google Business Profile (OAuth)</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Connect your verified Google Business Profile to auto-sync 5★ reviews, track customer ratings, and trigger instant WhatsApp stamps.
              </p>
            </div>

            {/* Prominent Helper Description Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3 max-w-lg mx-auto text-left shadow-xs">
              <span className="text-base shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="font-bold text-amber-950">Important Login Requirement:</p>
                <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                  Please click below and <strong>sign in with the exact Google / Gmail ID</strong> that is registered as Owner or Manager of your <strong>Google Business Profile</strong> on Google Maps.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <Button
                onClick={handleOAuthConnect}
                disabled={connectingOauth}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 text-sm"
              >
                {connectingOauth ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Sign In with Google (OAuth)
              </Button>
            </div>
          </div>
        ) : isPickingLocation && availableLocations.length > 0 ? (
          /* Multi-Location Selection View (Choose 1 Location for 3-Day Free Trial) */
          <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/60 rounded-3xl border-2 border-indigo-200 text-left space-y-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Free Trial: 1 Location Included (3 Days Free)</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Select Business Location for 3-Day Trial
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Aapke Google Account me <strong>{availableLocations.length} locations / branches</strong> mili hain. 3-Day Free Trial ke liye wo specific branch select karein jisme aap live reviews aur AI auto-reply start karna chahte hain:
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {availableLocations.map((loc: any) => {
                const isSelected = selectedLocationId === loc.id || data.googlePlaceId === loc.placeId
                return (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectTrialLocation(loc)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-400/20"
                        : "bg-white/80 border-slate-200 hover:border-blue-400 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{loc.name}</span>
                          {loc.branch && (
                            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 font-semibold">
                              {loc.branch}
                            </Badge>
                          )}
                          {isSelected && (
                            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                              Active Trial Target ⭐
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{loc.address}</span>
                        </p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono">
                          <span>Place ID: <strong className="text-slate-800">{loc.placeId?.slice(0, 15)}...</strong></span>
                          <span>•</span>
                          <span>CID: <strong className="text-slate-800">{loc.cid}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:shrink-0 flex items-center justify-end">
                      <Button
                        size="sm"
                        disabled={savingLocation}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectTrialLocation(loc)
                        }}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                          isSelected
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {savingLocation && selectedLocationId === loc.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isSelected ? (
                          "Selected ✓"
                        ) : (
                          "Activate Trial For This Branch →"
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPickingLocation(false)}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                ← Back to Verified Details
              </Button>
              <span className="text-[11px] text-slate-500">
                (Aap onboarding ke baad dashboard se aur branches upgrade kar sakte hain)
              </span>
            </div>
          </div>
        ) : (
          /* Verified Connected State Card - Full Details for Merchant Confirmation */
          <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 rounded-3xl border-2 border-emerald-300 text-center space-y-6 shadow-xl">
            {/* Header Badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white px-3.5 py-1 text-xs font-bold shadow-sm">
                Connected & Verified ✓ (3-Day Trial Active)
              </Badge>
              <h3 className="font-black text-2xl text-slate-900 mt-1 max-w-xl mx-auto leading-tight">
                {placeName}
              </h3>
              <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5 font-medium max-w-lg mx-auto">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{storeAddress}</span>
              </p>
            </div>

            {/* Merchant Confirmation Table of All 6 Key Details */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left max-w-2xl mx-auto divide-y divide-slate-100">
              {/* 1. Official Google Business Name */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-[170px]">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Google Business Name:</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-1">
                  <span className="text-xs font-bold text-slate-900 truncate">{placeName}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(placeName, "name")}
                    className="text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 shrink-0"
                    title="Copy Name"
                  >
                    {copiedField === "name" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2. Store Full Address */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-1 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-[170px] pt-0.5">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Store Address:</span>
                </div>
                <div className="flex items-start justify-between sm:justify-end gap-2 flex-1">
                  <span className="text-xs text-slate-800 font-medium leading-relaxed sm:text-right">{storeAddress}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(storeAddress, "address")}
                    className="text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 shrink-0 mt-0.5"
                    title="Copy Address"
                  >
                    {copiedField === "address" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 3. Google Place ID */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-[170px]">
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Google Place ID:</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-1">
                  <code className="text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-lg truncate max-w-[280px]">
                    {placeId}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(placeId, "placeId")}
                    className="text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 shrink-0"
                    title="Copy Place ID"
                  >
                    {copiedField === "placeId" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 4. Google Maps CID */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-[170px]">
                  <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Google Maps CID:</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-1">
                  <code className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-900 border border-indigo-200/60 px-2 py-0.5 rounded-lg">
                    {mapsCid}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(mapsCid, "cid")}
                    className="text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 shrink-0"
                    title="Copy CID"
                  >
                    {copiedField === "cid" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 5. Google Maps URI */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 min-w-[170px]">
                  <ExternalLink className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Google Maps URI:</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-1">
                  <a
                    href={mapsUri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-teal-700 hover:text-teal-900 font-mono font-semibold underline truncate max-w-[240px] sm:max-w-[300px] flex items-center gap-1"
                  >
                    <span>{mapsUri}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(mapsUri, "mapsUri")}
                    className="text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 shrink-0"
                    title="Copy Maps URI"
                  >
                    {copiedField === "mapsUri" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 6. Google Review Link */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-blue-50/40 transition-colors bg-blue-50/20">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 min-w-[170px]">
                  <Star className="w-4 h-4 text-blue-600 fill-blue-600 shrink-0" />
                  <span>Google Review Link:</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 flex-1">
                  <a
                    href={reviewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-700 hover:text-blue-900 font-mono font-bold underline truncate max-w-[240px] sm:max-w-[300px] flex items-center gap-1"
                  >
                    <span>{reviewLink}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(reviewLink, "reviewLink")}
                    className="text-[11px] text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 shrink-0"
                    title="Copy Review Link"
                  >
                    {copiedField === "reviewLink" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* AI Auto-Reply & Live Sync Status */}
              <div className="p-3.5 flex items-center justify-between text-xs bg-slate-50/50">
                <div className="flex items-center gap-2 font-semibold text-slate-500">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Auto-Reply & 5★ Sync:</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live & Automated
                </span>
              </div>
            </div>

            {/* Multi-Location Switcher Notice */}
            {availableLocations.length > 1 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-left max-w-2xl mx-auto">
                <div className="text-xs text-amber-900">
                  <p className="font-bold">📍 Multi-Branch Account Detected ({availableLocations.length} locations)</p>
                  <p className="text-[11px] text-amber-700">Currently active branch: <strong>{placeName}</strong></p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPickingLocation(true)}
                  className="border-amber-400 text-amber-900 hover:bg-amber-100 text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Switch Location
                </Button>
              </div>
            )}

            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ✨ Aapke Google Business Profile ki live details verify ho chuki hain. Confirm karke aage badhein!
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-3 max-w-md mx-auto">
              <Button
                onClick={nextStep}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-bold py-6 text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Confirm & Continue</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Button>

              <div className="flex items-center justify-center gap-3">
                {availableLocations.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPickingLocation(true)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    Change Trial Branch ({availableLocations.length})
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disconnectPlace}
                  disabled={disconnecting}
                  className="text-rose-600 hover:bg-rose-50 text-xs font-semibold py-2 rounded-xl"
                >
                  {disconnecting ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Disconnecting...
                    </span>
                  ) : (
                    "Disconnect Google ↺"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 4: Logo ──────────────────────────────────────────────
function OnboardStep4Logo({ data, setData }: any) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string>(data.logoDataUrl || "")

  const handleLogoUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError("")

    // 1. Show local preview immediately for instant visual feedback
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setPreviewUrl(base64)
      setData((prev: any) => ({ ...prev, logoUploaded: true, logoDataUrl: base64 }))
    }
    reader.readAsDataURL(file)

    // 2. Upload to server and save to Merchant record
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "logo")

      const headers: Record<string, string> = {}
      if (data.merchantId) {
        headers["x-merchant-id"] = data.merchantId
      }

      const res = await fetch("/api/merchant/upload-brand", {
        method: "POST",
        headers,
        body: formData,
      })

      const json = await res.json()
      if (res.ok && json.data?.url) {
        // Keep dataUrl synced with server URL while previewUrl maintains instant display
        setData((prev: any) => ({ ...prev, logoUploaded: true, logoDataUrl: json.data.url }))
      } else {
        console.warn("Server upload warning:", json.error)
      }
    } catch (err: any) {
      console.error("Logo upload error:", err)
      setUploadError("Saved locally. Will sync on next save.")
    } finally {
      setUploading(false)
    }
  }

  const activeLogo = previewUrl || data.logoDataUrl

  return (
    <div className="p-6 sm:p-8 text-center space-y-6">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Upload Business Logo</h2>
        <p className="text-xs text-slate-500">Your logo appears on customer digital reward cards and dashboard</p>
        <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center bg-slate-50 relative">
          {data.logoUploaded && activeLogo ? (
            <div className="space-y-2 flex flex-col items-center">
              <img
                src={activeLogo}
                alt="Logo Preview"
                className="w-28 h-28 object-contain rounded-xl shadow-md border-2 border-emerald-200 bg-white p-1"
                onError={(e: any) => {
                  // Fallback to placeholder if url fails
                  e.currentTarget.src = "/cplogo_horizontal.png"
                }}
              />
              <Badge className="bg-emerald-600 text-white text-[10px] shadow-sm">Logo Saved ✓</Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <Upload className="w-10 h-10 mb-2" />
              <p className="text-xs text-slate-400">PNG, JPG, SVG up to 5MB</p>
            </div>
          )}
          <label className="mt-4 cursor-pointer">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-lg font-bold transition-all shadow">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{data.logoUploaded ? "Change Logo" : "Browse File"}</span>
            </span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
        {uploadError && <p className="text-xs text-amber-600 font-medium">{uploadError}</p>}
        <p className="text-xs text-slate-400">(Optional — you can skip this step)</p>
      </div>
    </div>
  )
}

// ─── Step 5: Rewards ─────────────────────────────────────────
function OnboardStep5Rewards({ data, setData }: any) {
  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <Gift className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Configure Loyalty Rewards</h2>
          <p className="text-xs text-slate-500">Set how customers earn and what they get free</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-slate-800">Reward Card Title</Label>
            <Input
              value={data.cardName}
              onChange={e => setData({ ...data, cardName: e.target.value })}
              placeholder="e.g., VIP Cake Loyalty Pass"
              className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 font-medium shadow-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-800">Stamps Required for Free Reward</Label>
            <Select value={String(data.stampsRequired || 10)} onValueChange={v => setData({ ...data, stampsRequired: Number(v) })}>
              <SelectTrigger className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 font-medium focus:ring-emerald-500 shadow-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white text-slate-900 border-slate-200 shadow-xl">
                {[3, 5, 6, 8, 10, 11, 12, 15].map(n => (
                  <SelectItem key={n} value={String(n)} className="text-slate-900 hover:bg-slate-100 font-medium">{n} Stamps</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-800">Free Reward Description</Label>
            <Input
              value={data.rewardName}
              onChange={e => setData({ ...data, rewardName: e.target.value })}
              placeholder="e.g., 1 Free Pastry + Coffee"
              className="mt-1.5 text-sm bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 font-medium shadow-xs"
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl">
          <Badge className="bg-white/20 text-white border-0">Loyalty Pass Preview</Badge>
          <h3 className="font-bold text-lg mt-2">{data.cardName || "VIP Loyalty Pass"}</h3>
          <p className="text-xs text-amber-100 mt-1">Reward: {data.rewardName || "Free Gift"}</p>
          <div className="flex gap-2 flex-wrap mt-4">
            {Array.from({ length: data.stampsRequired || 5 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-xs font-bold">★</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 6: QR Code ─────────────────────────────────────────
function OnboardStep6QR({ data, setData }: any) {
  const [waLink, setWaLink] = useState("")

  useEffect(() => {
    const generate = async () => {
      try {
        const phone = (data.whatsappNumber || "").replace(/\D/g, "")
        const businessName = data.businessName || "our store"
        const text = `Hi ${businessName}! Checking in for my VIP Club stamps 🎁`
        const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
        setWaLink(targetUrl)
        const qr = await createBrandedClientQR(targetUrl, { width: 500 })
        setData((prev: any) => ({ ...prev, qrGenerated: true, qrDataUrl: qr }))
      } catch {}
    }
    generate()
  }, [data.businessName, data.whatsappNumber, setData])

  return (
    <div className="p-6 sm:p-8 text-center space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Your WhatsApp QR Code</h2>
        <p className="text-xs text-slate-500">Print this and place it at your counter — customers scan to join VIP Club</p>
      </div>
      {data.qrDataUrl && (
        <div className="inline-block p-6 bg-white border-2 border-slate-900 rounded-3xl shadow-xl space-y-4 max-w-sm w-full">
          {data.logoDataUrl && (
            <div className="flex justify-center items-center">
              <img
                src={data.logoDataUrl}
                alt={data.businessName || "Business Logo"}
                className="max-h-16 max-w-[200px] w-auto h-auto object-contain rounded-xl p-1 bg-white border border-slate-200 shadow-sm"
              />
            </div>
          )}
          <p className="font-extrabold text-slate-900 text-lg tracking-tight">{data.businessName || "Your Business"}</p>
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <img src={data.qrDataUrl} alt="WhatsApp QR Code" className="w-52 h-52 mx-auto" />
          </div>

          {/* CustomerPilot Branding with Logo */}
          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-center gap-2">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Powered by</span>
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-5 w-auto object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 7: Print ────────────────────────────────────────────
function OnboardStep7Print({ data, setData }: any) {
  const businessName = data.businessName || "Your Business"
  const qrUrl = data.qrDataUrl || ""
  const rewardOffer = data.rewardName || "FREE Special Treat"
  const logoUrl = data.logoDataUrl || ""

  const handlePrintStandeePDF = () => {
    if (!qrUrl) {
      alert("QR code is not generated yet. Please wait a moment.")
      return
    }

    const logoHtml = logoUrl
      ? `<div style="display:flex; justify-content:center; align-items:center; min-height:80px; margin:0 auto 16px auto;">
           <img src="${logoUrl}" style="max-height:85px; max-width:240px; width:auto; height:auto; object-fit:contain; filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.12)); border-radius:12px; background:#ffffff; padding:6px; border:1px solid #e2e8f0;" />
         </div>`
      : `<div style="width:70px; height:70px; border-radius:50%; background:#6366f1; color:white; font-size:24px; font-weight:bold; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto;">CP</div>`

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Counter Standee - ${businessName}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              background: #0f172a;
              margin: 0;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .standee-card {
              width: 380px;
              background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%) !important;
              color: #ffffff !important;
              border-radius: 28px;
              border: 4px solid #f59e0b !important;
              padding: 30px 24px;
              text-align: center;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .badge {
              display: inline-block;
              padding: 5px 16px;
              background: #f59e0b !important;
              color: #020617 !important;
              font-weight: 800;
              font-size: 12px;
              border-radius: 999px;
              margin-bottom: 14px;
              letter-spacing: 0.5px;
            }
            .store-name {
              font-size: 22px;
              font-weight: 900;
              color: #ffffff !important;
              margin: 2px 0 6px 0;
              letter-spacing: -0.5px;
            }
            .qr-box {
              background: #ffffff !important;
              padding: 14px;
              border-radius: 20px;
              border: 3px solid #fcd34d !important;
              display: inline-block;
              margin: 8px auto;
              box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }
            .qr-img {
              width: 205px;
              height: 205px;
              display: block;
              margin: 0 auto;
            }
            .qr-sub {
              font-size: 11px;
              font-weight: 800;
              color: #0f172a !important;
              margin: 8px 0 0 0;
              text-transform: uppercase;
              letter-spacing: 0.8px;
            }
            .offer-box {
              margin-top: 14px;
              padding: 12px 14px;
              background: rgba(255,255,255,0.1) !important;
              border-radius: 16px;
              border: 1px solid rgba(255,255,255,0.2) !important;
            }
            .offer-tag {
              font-size: 11px;
              color: #fde68a !important;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin: 0 0 3px 0;
            }
            .offer-main {
              font-size: 14px;
              font-weight: 900;
              color: #ffffff !important;
              margin: 0 0 3px 0;
            }
            .offer-sub {
              font-size: 10px;
              color: #cbd5e1 !important;
              margin: 0;
            }
            .footer-brand {
              margin-top: 14px;
              padding-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            }
            .powered-txt {
              font-size: 10px;
              color: #94a3b8 !important;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.2px;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            ${logoUrl ? `<img src="${logoUrl}" style="max-height:50px; max-width:180px; object-fit:contain; background:rgba(255,255,255,0.12); border-radius:12px; padding:5px; margin:0 auto 8px auto; display:block;" />` : ''}
            <div class="store-name">${businessName}</div>
            <div class="badge">VIP Loyalty Club 👑</div>
            
            <div class="qr-box">
              <img src="${qrUrl}" class="qr-img" />
              <p class="qr-sub">Scan with WhatsApp Camera</p>
            </div>

            <div class="offer-box">
              <p class="offer-tag">★ Exclusive Member Offer ★</p>
              <p class="offer-main">Earn Stamps & Get ${rewardOffer}!</p>
              <p class="offer-sub">No App Required • 5 Seconds on WhatsApp</p>
            </div>

            <div class="footer-brand">
              <span class="powered-txt">Powered by</span>
              <img src="/cplogo_horizontal.png" style="height:20px; width:auto; object-fit:contain; background:rgba(255,255,255,0.15); border-radius:4px; padding:2px 6px;" alt="CustomerPilot" />
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `

    const printWin = window.open("", "_blank", "width=600,height=850")
    if (printWin) {
      printWin.document.write(printContent)
      printWin.document.close()
    } else {
      alert("Please allow pop-ups for this site to print/save PDF.")
    }
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">Print Counter QR Standee</h2>
        <p className="text-xs text-slate-500">Preview and print your physical QR display</p>
      </div>

      <div className="flex justify-center">
        <div id="printable-standee" className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-2xl border-4 border-amber-400 space-y-4 text-center">
          <div className="flex flex-col items-center gap-2">
            {logoUrl && <img src={logoUrl} alt={businessName} className="h-12 object-contain bg-white/10 rounded-xl p-1.5" />}
            <h3 className="text-xl font-black">{businessName}</h3>
            <div className="px-3 py-1 bg-amber-400 text-slate-950 font-bold text-xs rounded-full">VIP Loyalty Club 👑</div>
          </div>
          <div className="p-4 bg-white rounded-2xl inline-block mx-auto border-2 border-amber-300">
            {qrUrl ? (
              <img src={qrUrl} alt="QR" className="w-48 h-48 mx-auto" />
            ) : (
              <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">QR Loading...</div>
            )}
            <p className="text-[11px] font-bold text-slate-900 mt-2 uppercase tracking-wide">Scan with WhatsApp Camera</p>
          </div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">
            <p className="text-xs text-amber-300 font-bold uppercase">★ Exclusive Member Offer ★</p>
            <p className="text-sm font-extrabold">Earn Stamps & Get {rewardOffer}!</p>
            <p className="text-[10px] text-slate-300">No App Required • 5 Seconds on WhatsApp</p>
          </div>

          {/* CustomerPilot Branding with Logo */}
          <div className="pt-3 border-t border-white/20 flex items-center justify-center gap-2">
            <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">Powered by</span>
            <img src="/cplogo_horizontal.png" alt="CustomerPilot" className="h-5 w-auto object-contain bg-white/15 rounded px-1.5 py-0.5" />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={handlePrintStandeePDF} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-6 gap-2 shadow-lg">
          <Printer className="w-5 h-5" /> Print Standee (PDF) 🖨️
        </Button>
      </div>

      <style>{`@media print { body > *:not(#printable-standee) { display: none; } }`}</style>
    </div>
  )
}

// ─── Step 8: System Test ──────────────────────────────────────
function OnboardStep8Test({ data, setData, error, setError }: any) {
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const runSystemTest = async () => {
    setTesting(true)
    setError("")
    try {
      // Real API health checks
      const checks = await Promise.allSettled([
        // 1. WhatsApp connectivity
        fetch("/api/whatsapp/health").then(r => r.json()),
        // 2. DB connectivity (state API)
        fetch("/api/state").then(r => r.json()),
        // 3. Onboarding progress
        fetch("/api/onboarding/progress").then(r => r.json()),
      ])

      const [waHealth, stateHealth, progressHealth] = checks

      let qrReady = !!data.qrDataUrl || !!data.qrGenerated
      if (!qrReady && (data.whatsappNumber || data.businessName)) {
        try {
          const phone = (data.whatsappNumber || "919033304707").replace(/\D/g, "")
          const businessName = data.businessName || "our store"
          const text = `Hi ${businessName}! Checking in for my VIP Club stamps 🎁`
          const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
          const qr = await createBrandedClientQR(targetUrl, { width: 500 })
          setData((prev: any) => ({ ...prev, qrGenerated: true, qrDataUrl: qr }))
          qrReady = true
        } catch {}
      }

      const results = {
        whatsapp: waHealth.status === "fulfilled" && waHealth.value?.ok !== false,
        database: stateHealth.status === "fulfilled" && stateHealth.value?.ok !== false,
        merchant: progressHealth.status === "fulfilled",
        qrCode: qrReady,
        rewards: data.stampsRequired > 0,
      }

      setTestResults(results)
      setData((prev: any) => ({ ...prev, testCustomerScanned: Object.values(results).every(Boolean) }))
    } catch (e: any) {
      setError("System test encountered an error: " + e.message)
    } finally {
      setTesting(false)
    }
  }

  const allPassed = testResults && Object.values(testResults).every(Boolean)

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live System Test</h2>
          <p className="text-xs text-slate-500">Run a real health check before going live</p>
        </div>
      </div>

      {!testResults ? (
        <div className="text-center space-y-4 py-8">
          <p className="text-slate-600 text-sm">Click below to run a real API health check across all systems.</p>
          <Button
            onClick={runSystemTest}
            disabled={testing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3"
          >
            {testing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Testing Systems...
              </span>
            ) : (
              "🔬 Run System Health Check"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {[
            { key: "whatsapp", label: "WhatsApp Business API", desc: "Evolution API connectivity" },
            { key: "database", label: "Database Connection", desc: "Merchant data & customers" },
            { key: "merchant", label: "Merchant Account", desc: "Onboarding progress saved" },
            { key: "qrCode", label: "QR Code Generated", desc: "WhatsApp deep link QR ready" },
            { key: "rewards", label: "Reward Card Ready", desc: "Loyalty program configured" },
          ].map(({ key, label, desc }) => (
            <div key={key} className={`flex items-center gap-4 p-4 rounded-xl border ${(testResults as any)[key] ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(testResults as any)[key] ? "bg-emerald-500" : "bg-red-500"}`}>
                {(testResults as any)[key] ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <Badge className={`ml-auto ${(testResults as any)[key] ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                {(testResults as any)[key] ? "PASS ✓" : "FAIL ✗"}
              </Badge>
            </div>
          ))}

          {allPassed && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
              <p className="text-emerald-700 font-bold text-sm">🎉 All Systems GO! Ready to launch your Merchant Dashboard.</p>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={() => setTestResults(null)}>
            Re-run Test
          </Button>
        </div>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>}>
      <OnboardingPageContent />
    </Suspense>
  )
}
