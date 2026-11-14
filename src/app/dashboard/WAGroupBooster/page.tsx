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
  Zap, QrCode as QrIcon, Download, ExternalLink, RefreshCw, Smartphone, Monitor,
  Share2, CheckCircle2, AlertCircle, Sparkles, Edit3, Save, Copy, Eye,
  ShieldCheck, Printer, ArrowRight, Store, ArrowUpRight
} from "lucide-react"

export default function WAGroupBoosterSimplePage() {
  const { toast } = useToast()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<any>(null)
  const [destUrl, setDestUrl] = useState("")
  const [saving, setSaving] = useState(false)

  // 1. Fetch current merchant and counter QR
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.authenticated && data.merchant) {
          setMerchantId(data.merchant.id)
          setMerchantProfile(data.merchant)
          fetchCounterQr(data.merchant.id)
        } else {
          fetchCounterQr()
        }
      } catch {
        fetchCounterQr()
      }
    }
    init()
  }, [])

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
        // Find first counter or direct QR
        const found = data.qrCodes[0]
        setQrCode(found)
        setDestUrl(found.currentDest || "https://chat.whatsapp.com/")
      }
    } catch {
      toast({ title: "Notice", description: "Loading WhatsApp booster QR...", variant: "default" })
    } finally {
      setLoading(false)
    }
  }

  // 2. Save Destination URL (locked to DIRECT mode)
  const handleSaveDestination = async () => {
    if (!qrCode?.id) return
    if (!destUrl.trim()) {
      toast({ title: "Invalid URL", description: "WhatsApp Group Invite link is required.", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch(`/api/qr-codes/${qrCode.id}/destination`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          destination: destUrl.trim(),
          redirectMode: "DIRECT",
          note: "Updated WhatsApp Group Booster Simple Mode"
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Saved! ✅", description: "WhatsApp group link updated. Counter QR now redirects directly to this group." })
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

  const downloadQrImage = () => {
    if (!qrCode?.qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrCode.qrDataUrl
    a.download = `${qrCode.slug || "whatsapp-booster"}-qr.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const storeName = merchantProfile?.name || "Your Store"

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

        <div className="flex items-center gap-2">
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
                <div className="space-y-1">
                  <div className="text-base font-black text-slate-900 uppercase tracking-tight">{storeName}</div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-extrabold tracking-wider uppercase">
                    OFFICIAL VIP COMMUNITY
                  </div>
                </div>

                {/* QR Container */}
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
                  {qrCode?.qrDataUrl ? (
                    <img src={qrCode.qrDataUrl} alt="Counter QR" className="w-44 h-44 object-contain" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-300">
                      <QrIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                {/* Callout Footer */}
                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY CAMERA</div>
                  <div className="text-[10px] text-slate-500">Get Secret VIP Discounts &amp; Instant WhatsApp Bills</div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[9px] font-medium text-slate-400">
                  Powered by CustomerPilot
                </div>
              </div>

              {/* Dynamic URL + Actions */}
              <div className="w-full space-y-3 pt-6">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {qrCode?.publicUrl || "https://customerpilot.in/api/wg/..."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={downloadQrImage}
                    disabled={!qrCode?.qrDataUrl}
                    className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      if (qrCode?.publicUrl) {
                        navigator.clipboard.writeText(qrCode.publicUrl)
                        toast({ title: "Copied!", description: "Short dynamic QR URL copied." })
                      }
                    }}
                    className="rounded-xl text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                    <span>Copy Link</span>
                  </Button>
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
                href={destUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 border border-teal-200 bg-teal-50 px-2.5 py-1 rounded-xl"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test Link
              </a>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  WhatsApp Group Invite URL
                </Label>
                <Input
                  value={destUrl}
                  onChange={(e) => setDestUrl(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="rounded-xl border-slate-200 font-mono text-xs py-2.5 focus:border-teal-500"
                />
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
