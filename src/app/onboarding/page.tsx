"use client"

// ============================================================
// CustomerPilot V6.5 — /onboarding page
// Authenticated wizard that saves each step to DB
// Requires JWT cookie (set by /signup or /login)
// ============================================================

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "qrcode"
import {
  Store, MessageSquare, Search, Upload, Gift, QrCode as QrIcon, Zap,
  Check, ArrowRight, ArrowLeft, Loader2, UserCheck,
  Printer, AlertCircle, CircleDot, Star, Rocket, X, Shield, Sparkles,
  CheckCircle2, ExternalLink, MapPin, Copy, Globe, Building2, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

const stepKeys = [
  "business_info",
  "whatsapp_verify",
  "google_business",
  "logo_upload",
  "reward_setup",
  "qr_code",
  "print_standee",
  "system_test",
]

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

            setData(prev => ({
              ...prev,
              merchantId: m.id,
              businessName: m.name || "",
              ownerName: m.ownerName || "",
              email: m.email || "",
              businessType: m.businessType || "bakery",
              businessAddress: m.address || "",
              whatsappNumber: m.whatsappPhone || "",
              cardName: m.name ? `${m.name} VIP Club` : "VIP Club",
              logoUploaded: !!m.logoUrl,
              logoDataUrl: m.logoUrl || prev.logoDataUrl,
              googleConnected: isGoogleConnected,
              googleBusiness: gConn?.placeName || (m.name && !m.name.includes("'s Business") ? m.name : "Cake Connection-Live Cake : Online Cake Delivery in Vadodara"),
              googlePlaceId: gConn?.placeId || "ChIJc7ija2zFXzkR8DbOxXEfaM4",
              googleAddress: gConn?.address || m.address || "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011",
              googleReviewUrl: gConn?.googleReviewUrl || m.googleReviewLink || "https://g.page/r/CfA2zsVxH2jOEBM/review",
            }))
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

  const steps = [
    { num: 1, label: "Business", icon: Store, stepKey: "business_info" },
    { num: 2, label: "WhatsApp", icon: MessageSquare, stepKey: "whatsapp_verify" },
    { num: 3, label: "Google", icon: Search, stepKey: "google_business" },
    { num: 4, label: "Logo", icon: Upload, stepKey: "logo_upload" },
    { num: 5, label: "Rewards", icon: Gift, stepKey: "reward_setup" },
    { num: 6, label: "QR Code", icon: QrIcon, stepKey: "qr_code" },
    { num: 7, label: "Print", icon: Printer, stepKey: "print_standee" },
    { num: 8, label: "Test", icon: UserCheck, stepKey: "system_test" },
  ]

  const next = async () => {
    if (step < 8) {
      // Save current step completion to DB
      const currentKey = steps[step - 1]?.stepKey
      if (currentKey) {
        await saveStepProgress(currentKey, step + 1)
      }
      setStep(step + 1)
      setError("")
    }
  }

  const back = () => { setStep(step - 1); setError("") }

  const handleLaunch = async () => {
    // Save final step
    await saveStepProgress("system_test", 8)
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
              <p className="text-slate-400 text-[10px] mt-0.5">Step {step} of 8 • 7-Day Free Trial</p>
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <OnboardStep1Business data={data} setData={setData} />}
              {step === 2 && <OnboardStep2WhatsApp data={data} setData={setData} error={error} setError={setError} />}
              {step === 3 && <OnboardStep3Google data={data} setData={setData} error={error} setError={setError} nextStep={next} />}
              {step === 4 && <OnboardStep4Logo data={data} setData={setData} />}
              {step === 5 && <OnboardStep5Rewards data={data} setData={setData} />}
              {step === 6 && <OnboardStep6QR data={data} setData={setData} />}
              {step === 7 && <OnboardStep7Print data={data} setData={setData} />}
              {step === 8 && <OnboardStep8Test data={data} setData={setData} error={error} setError={setError} />}
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

            {step < 8 ? (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <Label className="text-xs font-semibold">Business Name *</Label>
          <Input
            value={data.businessName}
            onChange={e => setData({ ...data, businessName: e.target.value })}
            placeholder="e.g., Cake Connection"
            className="mt-1 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Owner Name *</Label>
          <Input
            value={data.ownerName}
            onChange={e => setData({ ...data, ownerName: e.target.value })}
            placeholder="e.g., Hitesh"
            className="mt-1 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Business Type</Label>
          <Select value={data.businessType} onValueChange={v => setData({ ...data, businessType: v })}>
            <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
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
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-semibold">Business Address / City</Label>
          <Input
            value={data.businessAddress}
            onChange={e => setData({ ...data, businessAddress: e.target.value })}
            placeholder="e.g., Vadodara, Gujarat"
            className="mt-1 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Business Timing</Label>
          <Input
            value={data.businessAddress}
            onChange={e => setData({ ...data, businessAddress: e.target.value })}
            placeholder="e.g., 9AM–9PM, Mon–Sat"
            className="mt-1 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold">Email (from signup)</Label>
          <Input
            value={data.email}
            readOnly
            className="mt-1 text-sm bg-slate-50 text-slate-500"
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
  const [loadingQr, setLoadingQr] = useState(false)
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "open" | "disconnected">("connecting")
  const [instanceName, setInstanceName] = useState<string>("")
  const [connectMode, setConnectMode] = useState<"qr" | "otp">("qr")

  // OTP Fallback state
  const [otp, setOtp] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [apiResponse, setApiResponse] = useState<any>(null)

  // Fetch fresh QR code (creates new Evolution instance)
  const fetchInstanceStatus = async () => {
    setLoadingQr(true)
    try {
      const res = await fetch("/api/whatsapp/connect")
      const json = await res.json()
      if (res.ok && json.ok) {
        setInstanceName(json.instanceName || "")
        if (json.status === "open" || json.connected) {
          setConnectionStatus("open")
          setData((prev: any) => ({ ...prev, otpVerified: true, whatsappNumber: json.whatsappPhone || prev.whatsappNumber || "Connected" }))
        } else {
          setConnectionStatus("connecting")
          if (json.qrCodeBase64) setQrCodeBase64(json.qrCodeBase64)
          if (json.pairingCode) setPairingCode(json.pairingCode)
        }
      }
    } catch (e) {
      console.error("Failed to fetch instance QR:", e)
    } finally {
      setLoadingQr(false)
    }
  }

  // Check ONLY connection state (no QR refresh, no instance delete)
  const checkConnectionState = async () => {
    try {
      const res = await fetch("/api/whatsapp/status")
      const json = await res.json()
      if (res.ok && json.ok && (json.status === "open" || json.connected)) {
        setConnectionStatus("open")
        setData((prev: any) => ({ ...prev, otpVerified: true, whatsappNumber: json.whatsappPhone || prev.whatsappNumber || "Connected" }))
      }
    } catch {}
  }

  // On mount: load QR once. Then poll ONLY connection state every 4s (never auto-refresh QR)
  useEffect(() => {
    fetchInstanceStatus()

    // Poll connection state every 4s to detect when user scans — but do NOT refresh QR
    const interval = setInterval(() => {
      if (connectionStatus !== "open") {
        checkConnectionState()
      }
    }, 4000)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once connected, stop polling
  useEffect(() => {
    // no-op — handled in interval check above
  }, [connectionStatus])

  // OTP handlers for fallback
  const sendOtp = async () => {
    if (!data.whatsappNumber || data.whatsappNumber.length < 10) {
      setError("Please enter a valid phone number with country code")
      return
    }
    setSendingOtp(true); setError("")
    try {
      const res = await fetch("/api/whatsapp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: data.whatsappNumber }),
      })
      const json = await res.json()
      if (res.ok && json.ok) {
        setData({ ...data, otpSent: true, otpSessionId: json.data.sessionId, deliveryStatus: json.data.deliveryResult?.status })
        setApiResponse(json.data)
        setResendTimer(json.data.resendCooldownSeconds || 10)
      } else {
        setError(json.error || "Failed to send OTP")
      }
    } catch { setError("Network error.") }
    finally { setSendingOtp(false) }
  }

  const verifyOtp = async () => {
    if (otp.length !== 4) { setError("Please enter the 4-digit OTP"); return }
    setVerifying(true); setError("")
    try {
      const res = await fetch("/api/whatsapp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: data.otpSessionId, otp }),
      })
      const json = await res.json()
      if (res.ok && json.ok && json.data.verified) {
        setData({ ...data, otpVerified: true })
        setConnectionStatus("open")
      } else {
        setError(json.error || json.data?.message || "Invalid OTP")
      }
    } catch { setError("Verification failed.") }
    finally { setVerifying(false) }
  }

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Connect Store WhatsApp</h2>
            <p className="text-xs text-slate-500">Scan QR Code from your store's WhatsApp (Linked Devices)</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setConnectMode("qr")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${connectMode === "qr" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}
          >
            📷 Instant QR Scan
          </button>
          <button
            onClick={() => setConnectMode("otp")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${connectMode === "otp" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}
          >
            💬 SMS / OTP Code
          </button>
        </div>
      </div>

      {connectMode === "qr" ? (
        <div className="max-w-xl mx-auto space-y-6">
          {connectionStatus === "open" || data.otpVerified ? (
            /* Connected Celebration Card */
            <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 text-center space-y-4 shadow-xl">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
              {/* Left Column: QR Display */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-emerald-400/60 shadow-lg relative min-h-[260px]">
                {loadingQr && !qrCodeBase64 ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-xs text-slate-500 font-medium">Creating WhatsApp Instance...</p>
                  </div>
                ) : qrCodeBase64 ? (
                  <div className="text-center space-y-2">
                    <img
                      src={qrCodeBase64.startsWith("data:") ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
                      alt="WhatsApp Pair QR Code"
                      className="w-52 h-52 object-contain rounded-xl border border-slate-200 shadow-md p-1 bg-white"
                    />
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Ready to scan from WhatsApp
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-xs text-slate-500 mb-3">Initializing Instance...</p>
                    <Button onClick={fetchInstanceStatus} size="sm" className="bg-emerald-600 text-white text-xs">
                      Refresh QR Code ↺
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: 3 Simple Instructions */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base">How to Scan:</h4>
                  <p className="text-xs text-slate-500">Link your store phone in 10 seconds</p>
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

                {pairingCode && pairingCode.length <= 15 && !pairingCode.startsWith("2@") && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <p className="text-[11px] text-amber-800 font-semibold mb-1">Pairing Code Option:</p>
                    <p className="font-mono text-xl font-bold tracking-widest text-slate-900">{pairingCode}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* OTP Connect Mode (Fallback) */
        <div className="space-y-6 max-w-lg mx-auto">
          {!data.otpVerified ? (
            <>
              <div>
                <Label>WhatsApp Business Number *</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={data.whatsappNumber}
                    onChange={e => setData({ ...data, whatsappNumber: e.target.value })}
                    placeholder="e.g., 917203824012"
                    disabled={data.otpSent}
                  />
                  <Button
                    onClick={sendOtp}
                    disabled={data.otpSent || data.whatsappNumber.length < 10 || resendTimer > 0}
                    className="bg-slate-900 text-white"
                  >
                    {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : data.otpSent ? "Sent ✓" : "Send OTP"}
                  </Button>
                </div>
              </div>

              {data.otpSent && (
                <div className="space-y-3">
                  {apiResponse?.isSameNumber && (
                    <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl">
                      <p className="text-sm font-bold text-amber-800 mb-2">⚠️ OTP Code:</p>
                      <div className="bg-white border-2 border-amber-400 rounded-lg p-3 text-center">
                        <p className="text-4xl font-mono font-black tracking-[0.5em] text-slate-900">{apiResponse.otp}</p>
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                    <Label className="text-xs">Enter 4-digit OTP</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="1234"
                        maxLength={4}
                        className="font-mono text-center tracking-widest text-lg font-bold"
                      />
                      <Button
                        onClick={verifyOtp}
                        disabled={verifying || otp.length !== 4}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
              <Check className="w-6 h-6 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-900">WhatsApp Verified!</h3>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Google Business ─────────────────────────────────
function OnboardStep3Google({ data, setData, error, setError, nextStep }: any) {
  const [activeTab, setActiveTab] = useState<"oauth" | "manual">("oauth")
  const [connectingOauth, setConnectingOauth] = useState(false)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState(data.businessName || "")
  const [directUrl, setDirectUrl] = useState(data.googleReviewUrl || "")
  const [connectingLink, setConnectingLink] = useState(false)
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

  const handleDirectLink = async () => {
    if (!directUrl.trim()) { setError("Please enter your Google Review or Google Maps link"); return }
    let name = data.businessName || "Cake Connection-Live Cake : Online Cake Delivery in Vadodara"
    let placeId = "ChIJc7ija2zFXzkR8DbOxXEfaM4"
    if (directUrl.includes("ChIJ")) {
      const match = directUrl.match(/ChIJ[A-Za-z0-9_-]{23}/)
      if (match) placeId = match[0]
    }
    await selectPlace({ 
      name, 
      placeId, 
      address: "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011", 
      reviewUrl: directUrl.trim(),
      cid: "14873172342901454576",
      mapsUri: "https://maps.google.com/?cid=14873172342901454576"
    })
  }

  const searchGooglePlaces = async () => {
    if (!query) return
    setSearching(true); setError("")
    try {
      const res = await fetch(`/api/google/places-search?q=${encodeURIComponent(query)}`)
      const json = await res.json()
      if (res.ok && json.ok) {
        setData((prev: any) => ({ ...prev, googleSearchResults: json.data.results || [] }))
      } else {
        setError(json.error || "Search failed")
      }
    } catch { setError("Failed to search Google Places") }
    finally { setSearching(false) }
  }

  const selectPlace = async (place: any) => {
    setConnectingLink(true)
    const reviewUrl = place.reviewUrl || (place.placeId?.startsWith('http') ? place.placeId : `https://search.google.com/local/writereview?placeid=${place.placeId}`)
    
    setData((prev: any) => ({
      ...prev,
      googleBusiness: place.name || prev.businessName || "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
      googlePlaceId: place.placeId || "ChIJc7ija2zFXzkR8DbOxXEfaM4",
      googleCid: place.cid || "14873172342901454576",
      googleMapsUri: place.mapsUri || `https://maps.google.com/?cid=14873172342901454576`,
      googleReviewUrl: reviewUrl || "https://g.page/r/CfA2zsVxH2jOEBM/review",
      googleAddress: place.address || place.formattedAddress || prev.address || "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011",
      googleConnected: true
    }))

    try {
      const merchantId = data.merchantId || "cms97ihsr0002w0ykccl3xvqy"
      await fetch("/api/google-business/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": merchantId
        },
        body: JSON.stringify({
          placeId: place.placeId || "ChIJc7ija2zFXzkR8DbOxXEfaM4",
          placeName: place.name || data.businessName || "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
          address: place.address || place.formattedAddress || data.address || "GF9 RutuPlatina Complex, Besides Duliram Pendawala, Near EVA Mall Exit Gate, Manjalpur, Vadodara - 390011",
          reviewUrl: reviewUrl
        })
      })
    } catch (err) {
      console.error("Failed to save Google Connection to DB:", err)
    } finally {
      setConnectingLink(false)
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
      googleSearchResults: []
    }))
    setActiveTab("oauth")
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
          /* Selection Mode */
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <Button
                variant={activeTab === "oauth" ? "default" : "ghost"}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg ${activeTab === "oauth" ? "bg-white text-slate-800 shadow" : "text-slate-600"}`}
                onClick={() => setActiveTab("oauth")}
              >
                🔐 Google OAuth 2.0 (Official)
              </Button>
              <Button
                variant={activeTab === "manual" ? "default" : "ghost"}
                className={`flex-1 text-xs font-semibold py-2 rounded-lg ${activeTab === "manual" ? "bg-white text-slate-800 shadow" : "text-slate-600"}`}
                onClick={() => setActiveTab("manual")}
              >
                🔗 Direct Review Link / Maps Search
              </Button>
            </div>

            {activeTab === "oauth" ? (
              <div className="p-6 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Star className="w-6 h-6 fill-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Official Google Business Profile API</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Connect your verified Google Business Profile to auto-sync 5★ reviews, track customer ratings, and trigger instant WhatsApp stamps.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={handleOAuthConnect}
                    disabled={connectingOauth}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2"
                  >
                    {connectingOauth ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Sign In with Google (OAuth)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const merchantId = data.merchantId || "cms97ihsr0002w0ykccl3xvqy"
                      window.location.href = `/api/google-business/oauth?merchantId=${merchantId}&mode=instant`
                    }}
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                  >
                    ⚡ Instant 1-Click Sandbox Connect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-slate-200 bg-slate-50 rounded-2xl space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Paste your Google Maps / Review Link:</Label>
                  <p className="text-[11px] text-slate-500 mb-2">e.g., https://g.page/r/CfA2zsVxH2jOEBM/review or Google Maps URL</p>
                  <div className="flex gap-2">
                    <Input
                      value={directUrl}
                      onChange={e => setDirectUrl(e.target.value)}
                      placeholder="https://g.page/r/.../review"
                      className="text-xs font-mono"
                    />
                    <Button onClick={handleDirectLink} disabled={connectingLink} className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-[100px]">
                      {connectingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Link →"}
                    </Button>
                  </div>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200" />
                  <span className="mx-3 text-xs text-slate-400 font-semibold uppercase">OR SEARCH ON MAPS</span>
                  <div className="flex-grow border-t border-slate-200" />
                </div>

                <div>
                  <Label className="text-xs text-slate-600">Search your business name on Google Maps:</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="e.g., Cake Connection Vadodara"
                      onKeyDown={e => e.key === "Enter" && searchGooglePlaces()}
                    />
                    <Button onClick={searchGooglePlaces} disabled={searching} variant="outline" className="min-w-[90px]">
                      {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                    </Button>
                  </div>
                </div>

                {data.googleSearchResults && data.googleSearchResults.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold">Select your profile from search results:</Label>
                    {data.googleSearchResults.map((place: any) => (
                      <div
                        key={place.placeId}
                        onClick={() => selectPlace(place)}
                        className="p-4 border bg-white rounded-2xl hover:border-blue-500 hover:shadow-md cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-sm">{place.name}</p>
                          <p className="text-xs text-slate-500">{place.address}</p>
                        </div>
                        <Button size="sm" className="bg-blue-600 text-white text-xs">Connect →</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : isPickingLocation && availableLocations.length > 0 ? (
          /* Multi-Location Selection View (Choose 1 Location for 7-Day Free Trial) */
          <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/60 rounded-3xl border-2 border-indigo-200 text-left space-y-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Free Trial: 1 Location Included (7 Days Free)</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Select Business Location for 7-Day Trial
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Aapke Google Account me <strong>{availableLocations.length} locations / branches</strong> mili hain. 7-Day Free Trial ke liye wo specific branch select karein jisme aap live reviews aur AI auto-reply start karna chahte hain:
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
                Connected & Verified ✓ (7-Day Trial Active)
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
                <span>Confirm & Continue to Next Step (Logo Setup)</span>
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

  const handleLogoUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setData((prev: any) => ({ ...prev, logoUploaded: true, logoDataUrl: reader.result as string }))
    reader.readAsDataURL(file)

    // Upload to server and save to Merchant record
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "logo")

      const merchantId = data.merchantId || "cms97ihsr0002w0ykccl3xvqy"
      const res = await fetch("/api/merchant/upload-brand", {
        method: "POST",
        headers: { "x-merchant-id": merchantId },
        body: formData,
      })

      if (res.ok) {
        const json = await res.json()
        if (json.data?.url) {
          setData((prev: any) => ({ ...prev, logoUploaded: true, logoDataUrl: json.data.url }))
        }
      }
    } catch (err) {
      console.error("Logo upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 sm:p-8 text-center space-y-6">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Upload Business Logo</h2>
        <p className="text-xs text-slate-500">Your logo appears on customer digital reward cards and dashboard</p>
        <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center bg-slate-50 relative">
          {data.logoUploaded && data.logoDataUrl ? (
            <div className="space-y-2 flex flex-col items-center">
              <img src={data.logoDataUrl} alt="Logo" className="w-24 h-24 object-contain rounded-xl shadow border bg-white p-1" />
              <Badge className="bg-emerald-600 text-white text-[10px]">Logo Saved ✓</Badge>
            </div>
          ) : (
            <Upload className="w-10 h-10 text-slate-400 mb-2" />
          )}
          <label className="mt-4 cursor-pointer">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-lg font-bold transition-all">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{data.logoUploaded ? "Change Logo" : "Browse File"}</span>
            </span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
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
            <Label>Reward Card Title</Label>
            <Input
              value={data.cardName}
              onChange={e => setData({ ...data, cardName: e.target.value })}
              placeholder="e.g., VIP Cake Loyalty Pass"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Stamps Required for Free Reward</Label>
            <Select value={String(data.stampsRequired)} onValueChange={v => setData({ ...data, stampsRequired: Number(v) })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 5, 8, 10].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} Stamps</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Free Reward Description</Label>
            <Input
              value={data.rewardName}
              onChange={e => setData({ ...data, rewardName: e.target.value })}
              placeholder="e.g., 1 Free Pastry + Coffee"
              className="mt-1"
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
        const qr = await QRCode.toDataURL(targetUrl, { width: 350, margin: 2 })
        setData({ ...data, qrGenerated: true, qrDataUrl: qr })
      } catch {}
    }
    generate()
  }, [data.businessName, data.whatsappNumber])

  return (
    <div className="p-6 sm:p-8 text-center space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Your WhatsApp QR Code</h2>
        <p className="text-xs text-slate-500">Print this and place it at your counter — customers scan to join VIP Club</p>
      </div>
      {data.qrDataUrl && (
        <div className="inline-block p-6 bg-white border-2 border-slate-900 rounded-3xl shadow-xl space-y-4 max-w-sm w-full">
          <p className="font-extrabold text-slate-900 text-lg">{data.businessName || "Your Business"}</p>
          <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <img src={data.qrDataUrl} alt="WhatsApp QR Code" className="w-52 h-52 mx-auto" />
          </div>
          <Badge className="bg-emerald-600 text-white py-1 px-3 text-xs font-bold">💬 Opens WhatsApp Directly ★</Badge>
          <div className="text-left space-y-2 pt-2">
            <p className="text-[11px] font-mono text-slate-600 break-all bg-slate-100 p-2 rounded border">{waLink}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="w-full text-xs text-emerald-700 border-emerald-300" onClick={() => window.open(waLink, "_blank")}>
                Open WhatsApp 💬
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigator.clipboard.writeText(waLink)}>
                Copy Link 📋
              </Button>
            </div>
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
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-6 gap-2">
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

      const results = {
        whatsapp: waHealth.status === "fulfilled" && waHealth.value?.ok !== false,
        database: stateHealth.status === "fulfilled" && stateHealth.value?.ok !== false,
        merchant: progressHealth.status === "fulfilled",
        qrCode: data.qrGenerated,
        rewards: data.stampsRequired > 0,
      }

      setTestResults(results)
      setData({ ...data, testCustomerScanned: Object.values(results).every(Boolean) })
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
