"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Award,
  CheckCircle2,
  Clock,
  Gift,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Smartphone,
  ArrowRight,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PoweredByCustomerPilot } from "@/components/powered-by-customerpilot"

interface StoreSummary {
  merchantId: string
  name: string
  shortName: string
  logoUrl: string | null
  whatsappPhone: string | null
  cardSlug: string | null
  isActive: boolean
  isTrialExpired: boolean
  fallbackWhatsappUrl: string | null
  stampCard: {
    id?: string
    name: string
    rewardName: string
    stampValue: number
    stampsRequired: number
    googleReviewBonus: number
  }
}

interface CheckinTicket {
  queueId: string
  customerId: string
  customerName: string
  phone: string
  position: number
  expiresAt: string
  alreadyWaiting: boolean
  isNewCustomer: boolean
  merchantId: string
  merchantName: string
  waConfirmUrl: string | null
}

const STORAGE_PHONE_KEY = "cp_checkin_phone"
const STORAGE_NAME_KEY = "cp_checkin_name"

function WebCheckinContent() {
  const searchParams = useSearchParams()
  const merchantId = searchParams.get("m") || ""
  const slug = searchParams.get("slug") || ""
  const source = searchParams.get("source") || "qr_web_hybrid"
  const referralCode = searchParams.get("ref") || ""

  const [store, setStore] = useState<StoreSummary | null>(null)
  const [loadingStore, setLoadingStore] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [savedPhone, setSavedPhone] = useState<string>("")
  const [savedName, setSavedName] = useState<string>("")
  const [showCustomForm, setShowCustomForm] = useState(false)

  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [ticket, setTicket] = useState<CheckinTicket | null>(null)

  useEffect(() => {
    let active = true
    async function loadStore() {
      if (!merchantId && !slug) {
        await Promise.resolve()
        if (active) {
          setLoadError("Invalid check-in link. Please scan the store QR code again.")
          setLoadingStore(false)
        }
        return
      }
      if (active) {
        setLoadingStore(true)
        setLoadError(null)
      }
      try {
        const qs = new URLSearchParams()
        if (merchantId) qs.set("m", merchantId)
        if (slug) qs.set("slug", slug)
        if (referralCode) qs.set("ref", referralCode)

        const res = await fetch(`/api/queue/web-checkin?${qs.toString()}`)
        const json = await res.json().catch(() => null)
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Could not load store loyalty details.")
        }
        if (active) {
          setStore(json.data as StoreSummary)
          try {
            const storedPhone = window.localStorage.getItem(STORAGE_PHONE_KEY) || ""
            const storedName = window.localStorage.getItem(STORAGE_NAME_KEY) || ""
            if (storedPhone.replace(/\D/g, "").length >= 10) {
              setSavedPhone(storedPhone)
              setSavedName(storedName)
            }
          } catch {
            // Ignore storage access errors in private mode
          }
        }
      } catch (err: unknown) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : "Failed to load check-in page.")
        }
      } finally {
        if (active) setLoadingStore(false)
      }
    }
    void loadStore()
    return () => {
      active = false
    }
  }, [merchantId, slug, referralCode])

  const submitCheckin = async (targetPhone: string, targetName: string) => {
    setSubmitError(null)
    const digits = targetPhone.replace(/\D/g, "")
    if (digits.length < 10) {
      setSubmitError("Please enter your 10-digit WhatsApp mobile number.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/queue/web-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: store?.merchantId || merchantId || undefined,
          slug: slug || store?.cardSlug || undefined,
          phone: targetPhone.trim(),
          name: targetName.trim() || undefined,
          scanSource: source,
          referralCode: referralCode || undefined,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Check-in failed. Please try again.")
      }

      const data = json.data as CheckinTicket
      setTicket(data)

      try {
        window.localStorage.setItem(STORAGE_PHONE_KEY, digits.slice(-10))
        const resolvedName = targetName.trim() || data.customerName
        if (resolvedName && !/^Customer\s+\d{4}$/i.test(resolvedName)) {
          window.localStorage.setItem(STORAGE_NAME_KEY, resolvedName)
        }
      } catch {
        // Ignore storage errors
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Network error. Please retry.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitCheckin(phone, name)
  }

  const handleHybridWhatsappFallback = () => {
    if (!store?.fallbackWhatsappUrl) return
    const payload = JSON.stringify({
      merchantId: store.merchantId,
      slug: store.cardSlug,
      source: source || "qr_counter",
    })
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" })
        navigator.sendBeacon("/api/queue/web-checkin/scan-ping", blob)
      } else {
        void fetch("/api/queue/web-checkin/scan-ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        })
      }
    } catch {
      // Never block user from opening WhatsApp
    }
    window.location.href = store.fallbackWhatsappUrl
  }

  if (loadingStore) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-emerald-50 via-white to-slate-50">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Opening VIP Loyalty Check-in...</p>
      </div>
    )
  }

  if (loadError || !store) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="max-w-md w-full border-rose-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-rose-700">Check-in Unavailable</CardTitle>
            <CardDescription>{loadError || "Store check-in link could not be verified."}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/" className="text-xs font-semibold text-emerald-700 underline">
              Visit CustomerPilot
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-[#fbf8f2] to-white p-4 sm:p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-5">
        {/* Store Identity Header */}
        <div className="text-center space-y-2">
          {store.logoUrl ? (
            <div className="w-24 h-14 mx-auto rounded-2xl bg-white border border-amber-200 shadow-sm p-1.5 flex items-center justify-center overflow-hidden">
              <img src={store.logoUrl} alt={store.shortName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" /> {store.shortName}
            </div>
          )}
          <h1 className="text-2xl font-black tracking-tight text-slate-900">{store.shortName}</h1>
          <p className="text-xs text-slate-600 font-medium">
            Instant VIP Counter Check-In &bull; Zero Message Drop
          </p>
        </div>

        {/* Active Loyalty Reward Summary */}
        <Card className="border-2 border-emerald-500/25 bg-white shadow-md overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                {store.stampCard.name}
              </p>
              <h2 className="text-lg font-extrabold leading-tight">{store.stampCard.rewardName}</h2>
            </div>
            <Award className="w-8 h-8 text-amber-300 shrink-0" />
          </div>
          <CardContent className="p-4 text-xs space-y-1.5 text-slate-600">
            <div className="flex items-center justify-between">
              <span>Earn Rate:</span>
              <span className="font-bold text-slate-900">
                ₹{store.stampCard.stampValue} = 1 VIP Stamp
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Reward Goal:</span>
              <span className="font-bold text-slate-900">
                {store.stampCard.stampsRequired} Stamps
              </span>
            </div>
            {referralCode && (
              <div className="flex items-center justify-between text-amber-700 font-bold pt-1">
                <span>Applied Invite Code:</span>
                <span>{referralCode.toUpperCase()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-in Form OR Confirmed Queue Ticket */}
        {!store.isActive ? (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-5 text-center text-sm font-medium text-amber-900">
              {store.shortName} loyalty check-in is temporarily paused. Please ask staff at the counter.
            </CardContent>
          </Card>
        ) : ticket ? (
          <Card className="border-2 border-emerald-500 bg-emerald-50/70 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <CardTitle className="text-xl font-black text-emerald-900">
                {ticket.alreadyWaiting ? "Already in Live Queue!" : "You're in the Live Queue!"}
              </CardTitle>
              <CardDescription className="text-emerald-800 font-semibold text-xs">
                {ticket.customerName} &bull; +{ticket.phone}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 flex items-center justify-around shadow-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Queue Position</p>
                  <p className="text-2xl font-black text-emerald-700">#{ticket.position}</p>
                </div>
                <div className="h-9 w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                  <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1 justify-center">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Ready for Billing
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Cashier screen par aapka naam turant aa gaya hai. Counter par payment ke saath aapke{" "}
                <strong>VIP Stamps</strong> credit ho jaenge.
              </p>

              <div className="space-y-2 pt-1">
                {ticket.waConfirmUrl && (
                  <a
                    href={ticket.waConfirmUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>Open WhatsApp Confirmation (Optional)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {store.cardSlug && (
                  <Link
                    href={`/c/${encodeURIComponent(store.cardSlug)}`}
                    className="block w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Back to {store.shortName} Digital Card
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-slate-200 bg-white shadow-xl">
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-lg font-extrabold text-slate-900 flex items-center justify-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                <span>Check In to Collect Stamps</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Instant counter queue entry — stamps delivered to your WhatsApp after billing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {submitError}
                </div>
              )}

              {savedPhone && !showCustomForm ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-emerald-950 truncate">
                          {savedName || "Saved VIP Number"}
                        </p>
                        <p className="text-xs font-mono text-emerald-700">+91 {savedPhone.slice(-10)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(true)}
                      className="text-[11px] font-bold text-emerald-800 underline shrink-0"
                    >
                      Change
                    </button>
                  </div>

                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => void submitCheckin(savedPhone, savedName)}
                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-md gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Checking In...</span>
                      </>
                    ) : (
                      <>
                        <span>1-Tap Join Live Queue</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="checkin-phone" className="text-xs font-bold text-slate-700">
                      WhatsApp Mobile Number <span className="text-rose-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
                        +91
                      </span>
                      <Input
                        id="checkin-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={12}
                        placeholder="10-digit WhatsApp mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ""))}
                        className="rounded-xl font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="checkin-name" className="text-xs font-bold text-slate-700">
                      Your Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      id="checkin-name"
                      type="text"
                      maxLength={60}
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md gap-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Joining Queue...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Check In &amp; Earn VIP Stamps</span>
                      </>
                    )}
                  </Button>

                  {savedPhone && (
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="w-full text-center text-[11px] font-semibold text-slate-500 underline"
                    >
                      Use saved number (+91 {savedPhone.slice(-10)})
                    </button>
                  )}
                </form>
              )}

              {store.fallbackWhatsappUrl && (
                <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleHybridWhatsappFallback}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Or skip &amp; send message directly on WhatsApp</span>
                  </button>
                  <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Your number is saved on your phone for 1-tap next visit</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <PoweredByCustomerPilot />
      </div>
    </div>
  )
}

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-6 text-sm text-slate-500 animate-pulse">
          Loading VIP Check-in...
        </div>
      }
    >
      <WebCheckinContent />
    </Suspense>
  )
}
