"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, ShieldCheck, ArrowRight, Sparkles, Store, Loader2, CheckCircle2, Gift, Receipt } from "lucide-react"

export default function WhatsAppGroupRegistrationPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [transactionalConsent, setTransactionalConsent] = useState(true)
  const [marketingConsent, setMarketingConsent] = useState(true)
  const [redirectUrl, setRedirectUrl] = useState("")
  const [merchant, setMerchant] = useState<{ name: string; logoUrl?: string | null; category?: string } | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!slug) return
    async function loadInfo() {
      try {
        const res = await fetch(`/api/wg/${slug}?info=true`)
        const data = await res.json()
        if (data.success && data.merchant) {
          setMerchant(data.merchant)
        }
      } catch {
        // Fallback to graceful default
      } finally {
        setInitialLoading(false)
      }
    }
    loadInfo()
  }, [slug])

  const displayName = merchant?.name
    ? merchant.name.split("-")[0].split(":")[0].trim()
    : "Our Store"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!name.trim()) {
      setErrorMsg("Please enter your name.")
      return
    }

    const cleanDigits = phone.replace(/\D/g, "")
    if (cleanDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp phone number.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/wg/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanDigits,
          transactionalConsent,
          marketingConsent
        })
      })

      const data = await res.json()
      if (res.ok && data.redirectUrl) {
        setSubmitted(true)
        setRedirectUrl(data.redirectUrl)
        setTimeout(() => {
          window.location.href = data.redirectUrl
        }, 1200)
      } else {
        setErrorMsg(data.error || "Registration failed. Please try again.")
      }
    } catch {
      setErrorMsg("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    window.location.href = `/api/wg/${slug}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-emerald-100 shadow-xl rounded-3xl overflow-hidden bg-white">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative shadow-inner">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-white/20">
            {merchant?.logoUrl ? (
              <img src={merchant.logoUrl} alt={displayName} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <MessageSquare className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>{displayName}</span>
            <span className="text-emerald-200 text-xs font-normal bg-white/15 px-2 py-0.5 rounded-full">VIP Club</span>
          </CardTitle>
          <CardDescription className="text-emerald-100 text-xs mt-1 font-medium">
            Join our official WhatsApp community for member privileges
          </CardDescription>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* Member Perks Pill */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 font-medium">
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Secret VIP Discounts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Instant WhatsApp Bills</span>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="font-bold text-slate-900 text-lg">Welcome to the VIP Club!</h3>
              <p className="text-xs text-slate-500">Redirecting to your WhatsApp Group now...</p>
              <Button
                onClick={() => { if (redirectUrl) window.location.href = redirectUrl }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold mt-4 rounded-xl shadow-md shadow-emerald-600/20"
              >
                Join WhatsApp Group Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="cust-name" className="text-xs font-semibold text-slate-700">
                  Your Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cust-name"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border-slate-200 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cust-phone" className="text-xs font-semibold text-slate-700">
                  WhatsApp Mobile Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                    +91
                  </span>
                  <Input
                    id="cust-phone"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border-slate-200 focus:ring-emerald-500 font-mono text-sm tracking-wide"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transactionalConsent}
                    onChange={(e) => setTransactionalConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    I agree to receive official bills &amp; transaction receipts on WhatsApp.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-[11px] text-slate-600 leading-snug">
                    Send me exclusive VIP discounts &amp; special product drops.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining Group...
                  </>
                ) : (
                  <>
                    Continue to WhatsApp Group <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                >
                  Skip registration &amp; join group directly
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Privacy Protected · Zero Spam Guarantee</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
