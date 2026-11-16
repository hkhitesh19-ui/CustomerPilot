"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Zap, QrCode as QrIcon, Download, ExternalLink, RefreshCw,
  Save, Copy, Printer, ArrowRight, Store, X, Wand2, AlertTriangle
} from "lucide-react"
import { sanitizeDestinationUrl, detectMultipleUrls } from "@/lib/url-sanitizer"

export default function WAGroupBoosterSimplePage() {
  const { toast } = useToast()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)
  const [merchantsList, setMerchantsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<any>(null)
  const [destUrl, setDestUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [qrStyle, setQrStyle] = useState<"whatsapp" | "clean">("whatsapp")
  const [standeeMessage, setStandeeMessage] = useState("Scan n Join Whatsapp Group")

  // 1. Fetch current merchant and counter QR
  useEffect(() => {
    async function init() {
      try {
        const queryMId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("merchantId") : null
        const res = await fetch("/api/auth/me")
        const data = await res.json()

        let targetId = queryMId
        if (!targetId && data.authenticated && data.merchant) {
          targetId = data.merchant.id
          setMerchantProfile(data.merchant)
        }

        if (targetId) {
          setMerchantId(targetId)
          fetchCounterQr(targetId)
        } else {
          fetchCounterQr()
        }

        // Fetch merchant list for admin selector
        try {
          const allRes = await fetch("/api/admin/merchants")
          const allData = await allRes.json()
          if (allData.merchants && allData.merchants.length > 0) {
            setMerchantsList(allData.merchants)
            if (targetId) {
              const matched = allData.merchants.find((m: any) => m.id === targetId)
              if (matched) setMerchantProfile(matched)
            }
          }
        } catch {}
      } catch {
        fetchCounterQr()
      }
    }
    init()
  }, [])

  const handleMerchantSwitch = (newMId: string) => {
    setMerchantId(newMId)
    const selected = merchantsList.find(m => m.id === newMId)
    if (selected) setMerchantProfile(selected)
    fetchCounterQr(newMId)
  }

  const activeQrDataUrl = (qrStyle === "clean" && qrCode?.cleanQrDataUrl) ? qrCode.cleanQrDataUrl : qrCode?.qrDataUrl

  const downloadQrImage = () => {
    if (!activeQrDataUrl) return
    const a = document.createElement("a")
    a.href = activeQrDataUrl
    a.download = `${qrCode?.slug || "whatsapp-booster"}-${qrStyle}-qr.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const fetchCounterQr = async (mId?: string) => {
    setLoading(true)
    const targetMId = mId || merchantId
    try {
      const headers: Record<string, string> = {}
      if (targetMId) headers["x-merchant-id"] = targetMId

      const url = targetMId ? `/api/qr-codes?merchantId=${targetMId}` : "/api/qr-codes"
      const res = await fetch(url, { headers })
      const data = await res.json()
      if (data.success && data.qrCodes?.length > 0) {
        const found = data.qrCodes[0]
        setQrCode(found)
        // Clean URL before setting state to avoid propagating historical concatenations
        const cleaned = sanitizeDestinationUrl(found.currentDest || "https://chat.whatsapp.com/", { requireWhatsApp: true })
        setDestUrl(cleaned.isValid ? cleaned.cleanUrl : found.currentDest)
      }
    } catch {
      toast({ title: "Notice", description: "Loading WhatsApp booster QR...", variant: "default" })
    } finally {
      setLoading(false)
    }
  }

  // 2. Smart Paste Handler (Prevents accidental concatenation)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text")
    if (pastedText && (pastedText.includes("http://") || pastedText.includes("https://") || pastedText.includes("chat.whatsapp.com"))) {
      e.preventDefault()
      const sanitized = sanitizeDestinationUrl(pastedText, { requireWhatsApp: true })
      const finalUrl = sanitized.isValid ? sanitized.cleanUrl : pastedText.trim()
      setDestUrl(finalUrl)
      if (sanitized.hadMultipleUrls) {
        toast({
          title: "Clean Link Pasted! ✨",
          description: "Detected multiple pasted links — automatically extracted the clean WhatsApp invite link."
        })
      }
    }
  }

  // 3. Save Destination URL (locked to DIRECT mode)
  const handleSaveDestination = async () => {
    if (!qrCode?.id) return
    if (!destUrl.trim()) {
      toast({ title: "Invalid URL", description: "WhatsApp Group Invite link is required.", variant: "destructive" })
      return
    }

    const validation = sanitizeDestinationUrl(destUrl, { requireWhatsApp: true })
    if (!validation.isValid) {
      toast({
        title: "Invalid WhatsApp Link",
        description: validation.error || "Please enter a valid WhatsApp Group link (e.g. https://chat.whatsapp.com/...)",
        variant: "destructive"
      })
      return
    }

    const cleanDest = validation.cleanUrl
    setDestUrl(cleanDest) // auto-update UI

    setSaving(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch(`/api/qr-codes/${qrCode.id}/destination`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          destination: cleanDest,
          redirectMode: "DIRECT",
          note: "Updated WhatsApp Group Booster Simple Mode"
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Saved! ✅",
          description: validation.hadMultipleUrls
            ? "Cleaned duplicate links & updated. Counter QR now redirects directly to this group."
            : "WhatsApp group link updated. Counter QR now redirects directly to this group."
        })
        fetchCounterQr()
      } else {
        toast({ title: "Error", description: data.error || "Failed to update link", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to update WhatsApp link", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleAutoClean = () => {
    const sanitized = sanitizeDestinationUrl(destUrl, { requireWhatsApp: true })
    if (sanitized.cleanUrl) {
      setDestUrl(sanitized.cleanUrl)
      toast({
        title: "URL Cleaned! ✨",
        description: `Cleaned to: ${sanitized.cleanUrl}`
      })
    }
  }

  const storeName = merchantProfile?.name || "Your Store"
  const hasMultiple = detectMultipleUrls(destUrl)
  const validation = sanitizeDestinationUrl(destUrl, { requireWhatsApp: true })

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Zap className="w-5 h-5 text-teal-700" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">WhatsApp Group Booster</h1>
            <Badge className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-2.5 py-0.5">
              Simple &amp; Fast Mode • Tier 1 (₹100/mo / ₹699/yr)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Permanent self-hosted dynamic QR code for <strong>Direct 0-Second Redirection</strong> into your WhatsApp community group.
            Zero friction, zero forms — customer scans your counter standee and immediately enters your WhatsApp community.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {merchantsList.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-3 py-1.5 transition-colors">
              <Store className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <select
                value={merchantId || ""}
                onChange={(e) => handleMerchantSwitch(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer pr-1"
              >
                {merchantsList.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.city || "Vadodara"})
                  </option>
                ))}
              </select>
            </div>
          )}
          <Button onClick={() => fetchCounterQr()} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-slate-600">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={() => window.print()} className="rounded-xl gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold">
            <Printer className="w-3.5 h-3.5" /> Print Standee (A4/A5)
          </Button>
        </div>
      </div>

      {/* 2. Upgrade Callout to Pro Lead Capture */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-indigo-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500 text-white text-[10px] font-bold">PRO UPGRADE</Badge>
            <span className="font-bold text-sm">Want customer phone numbers before they join?</span>
          </div>
          <p className="text-xs text-indigo-200">
            In Simple Mode, customers join directly with 0 seconds delay. In <strong>Lead Capture Mode (₹299/mo)</strong>, customers fill a 5-second branded VIP form, giving you verified mobile numbers for WhatsApp marketing.
          </p>
        </div>
        <Link
          href="/dashboard/WAGroupBoosterPro"
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition-all"
        >
          <span>View Lead Capture Mode</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3. Main Console: Standee Preview & Destination Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Counter Standee Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-teal-600" />
                <span>Counter Standee Preview</span>
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold">
                READY TO PRINT
              </Badge>
            </CardHeader>

            <CardContent className="p-6 flex flex-col items-center">
              {/* Acrylic Tabletop Mockup */}
              <div className="w-full max-w-[290px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-4 text-center relative">
                {/* Store Header */}
                <div className="space-y-1.5">
                  <div className="text-base font-black text-slate-900 uppercase tracking-tight">{storeName}</div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wide shadow-sm">
                    {standeeMessage}
                  </div>
                </div>

                {/* QR Container */}
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
                  {activeQrDataUrl ? (
                    <img src={activeQrDataUrl} alt="Counter QR" className="w-44 h-44 object-contain" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-300">
                      <QrIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Callout Footer */}
                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY CAMERA</div>
                  <div className="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[9px] font-medium text-slate-400">
                  CustomerPilot VIP Standee • A5 Tabletop Acrylic
                </div>
              </div>

              {/* QR Style Selector & Standee Message Editor */}
              <div className="w-full space-y-3 pt-5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600">QR Code Style:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQrStyle("whatsapp")}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        qrStyle === "whatsapp" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      WhatsApp Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrStyle("clean")}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        qrStyle === "clean" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Without Logo (Clean)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">Standee Banner Message:</label>
                  <Input
                    value={standeeMessage}
                    onChange={(e) => setStandeeMessage(e.target.value)}
                    placeholder="Scan n Join Whatsapp Group"
                    className="h-8 text-xs font-medium rounded-lg"
                  />
                </div>
              </div>

              {/* Dynamic URL + Actions */}
              <div className="w-full space-y-2.5 pt-4">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {qrCode?.publicUrl || "https://customerpilot.in/api/wg/..."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={downloadQrImage}
                    disabled={!activeQrDataUrl}
                    className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </Button>

                  <a
                    href={qrCode?.slug === "shreenath-rajwadi-silk-palace" ? (qrStyle === "whatsapp" ? "/standees/shreenath_rajwadi_whatsapp_standee.png" : "/standees/shreenath_rajwadi_clean_standee.png") : "#"}
                    download={`${qrCode?.slug || "standee"}-poster.png`}
                    onClick={(e) => {
                      if (qrCode?.slug !== "shreenath-rajwadi-silk-palace") {
                        e.preventDefault()
                        window.print()
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 px-3 py-2 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download Standee</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Destination Control + Scan Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Destination Control Center */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Destination Control Center</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Update where customers land when they scan your printed counter QR.
                </CardDescription>
              </div>
              <a
                href={validation.cleanUrl || destUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 border border-teal-200 bg-teal-50 px-2.5 py-1 rounded-xl"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test Link
              </a>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">
                    WhatsApp Group Invite URL
                  </Label>
                  {destUrl && (
                    <button
                      type="button"
                      onClick={() => setDestUrl("")}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" /> Clear Field
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Input
                    value={destUrl}
                    onChange={(e) => setDestUrl(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="https://chat.whatsapp.com/..."
                    className={`rounded-xl font-mono text-xs py-2.5 pr-8 transition-colors ${
                      hasMultiple
                        ? "border-amber-400 bg-amber-50/40 text-amber-950 focus:border-amber-500"
                        : "border-slate-200 focus:border-teal-500"
                    }`}
                  />
                  {destUrl && (
                    <button
                      type="button"
                      onClick={() => setDestUrl("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                      title="Clear field"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Multiple URLs Warning Banner & 1-Click Auto-Clean */}
                {hasMultiple && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Multiple URLs detected:</strong> Two links appear to be glued together.
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAutoClean}
                      className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] h-7 gap-1 shrink-0"
                    >
                      <Wand2 className="w-3 h-3" /> Auto-Clean to Latest Link
                    </Button>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  Whenever your WhatsApp Group gets full (1024 members) or you change community links, paste the new invite link here and click Save. Your printed counter QR never goes to waste!
                </p>
              </div>

              {/* Scan Behavior */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-700">Scan Redirection Behavior</Label>
                <div className="p-4 rounded-xl border border-teal-500 bg-teal-50/60 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Direct 0-Second Redirect (Simple &amp; Fast Mode)</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Zero friction. Customer immediately opens your WhatsApp community group invite on their phone camera. Maximum join conversion (95%+).
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSaveDestination}
                  disabled={saving || !destUrl.trim()}
                  className="rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? "Saving Changes..." : "Save Destination Link"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Physical Print Specifications */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recommended Print Formats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-xs font-bold text-slate-900">A5 Acrylic Tent Card</div>
                <div className="text-[11px] text-slate-500">Best for restaurant dining tables &amp; billing counters</div>
                <Badge variant="outline" className="text-[9px] text-teal-700 border-teal-200 bg-teal-50">Most Popular</Badge>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-xs font-bold text-slate-900">A4 Counter Standee</div>
                <div className="text-[11px] text-slate-500">Best for entrance standee, reception desk &amp; showcase</div>
                <Badge variant="outline" className="text-[9px] text-indigo-700 border-indigo-200 bg-indigo-50">High Visibility</Badge>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="text-xs font-bold text-slate-900">3x3" Sticker Decal</div>
                <div className="text-[11px] text-slate-500">Best for delivery food boxes, pastry bags &amp; takeaway</div>
                <Badge variant="outline" className="text-[9px] text-amber-700 border-amber-200 bg-amber-50">Takeaway Reach</Badge>
              </div>
            </div>
          </Card>

          {/* Scan Analytics & Trends */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Scan Analytics &amp; Health</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Scans</div>
                <div className="text-2xl font-black text-slate-900">{qrCode?._count?.scanEvents || qrCode?.totalScans || 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-1">
                <div className="text-[10px] text-blue-700 font-semibold uppercase">Mobile Traffic</div>
                <div className="text-2xl font-black text-blue-900">96%</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60 space-y-1">
                <div className="text-[10px] text-emerald-700 font-semibold uppercase">Engine Health</div>
                <div className="text-sm font-black text-emerald-800 mt-2">100% HEALTHY</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
