"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  QrCode as QrIcon, Download, ExternalLink, RefreshCw, Smartphone, Monitor,
  Share2, CheckCircle2, AlertCircle, Sparkles, Edit3, Save, Copy, Eye, Zap,
  ShieldCheck, Printer, Users, HelpCircle, FileSpreadsheet, ArrowRight, MessageSquare, Check, Layers
} from "lucide-react"

export default function DynamicQRStudioPage() {
  const { toast } = useToast()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [activeQr, setActiveQr] = useState<any>(null)
  const [editDest, setEditDest] = useState("")
  const [editMode, setEditMode] = useState<"DIRECT" | "FORM_CAPTURE">("DIRECT")
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)

  // Booster Leads State
  const [leads, setLeads] = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [activeTab, setActiveTab] = useState<"standee" | "destination" | "leads" | "guide">("standee")

  // 1. Fetch current authenticated merchant on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.authenticated && data.merchant) {
          setMerchantId(data.merchant.id)
          setMerchantProfile(data.merchant)
          fetchQrs(data.merchant.id)
          fetchLeads(data.merchant.id)
        } else {
          fetchQrs()
        }
      } catch {
        fetchQrs()
      }
    }
    initAuth()
  }, [])

  const fetchQrs = async (mId?: string) => {
    setLoading(true)
    const targetMId = mId || merchantId
    try {
      const headers: Record<string, string> = {}
      if (targetMId) headers["x-merchant-id"] = targetMId

      const url = targetMId ? `/api/qr-codes?merchantId=${targetMId}` : "/api/qr-codes"
      const res = await fetch(url, { headers })
      const data = await res.json()
      if (data.success && data.qrCodes?.length > 0) {
        setQrCodes(data.qrCodes)
        setActiveQr(data.qrCodes[0])
        setEditDest(data.qrCodes[0].currentDest)
        setEditMode(data.qrCodes[0].redirectMode || "DIRECT")
      } else {
        setQrCodes([])
        setActiveQr(null)
      }
    } catch {
      toast({ title: "Notice", description: "Loading QR codes...", variant: "default" })
    } finally {
      setLoading(false)
    }
  }

  const fetchLeads = async (mId?: string) => {
    setLoadingLeads(true)
    const targetMId = mId || merchantId
    try {
      const headers: Record<string, string> = {}
      if (targetMId) headers["x-merchant-id"] = targetMId

      const url = targetMId ? `/api/qr-codes/leads?merchantId=${targetMId}` : "/api/qr-codes/leads"
      const res = await fetch(url, { headers })
      const data = await res.json()
      if (data.success && data.leads) {
        setLeads(data.leads)
      }
    } catch {
      console.warn("Failed to load leads")
    } finally {
      setLoadingLeads(false)
    }
  }

  const handleCreateCounterQr = async () => {
    setCreating(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch("/api/qr-codes", {
        method: "POST",
        headers,
        body: JSON.stringify({
          label: "Main Counter QR",
          currentDest: "https://chat.whatsapp.com/",
          redirectMode: "DIRECT"
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: "Generated!", description: "Your permanent Dynamic QR code is ready." })
        fetchQrs()
      } else {
        toast({ title: "Error", description: data.error || "Failed to create QR code", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const handleSaveDestination = async () => {
    if (!activeQr) return
    if (!editDest || !editDest.trim()) {
      toast({ title: "Invalid URL", description: "Destination URL cannot be empty.", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch(`/api/qr-codes/${activeQr.id}/destination`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          destination: editDest.trim(),
          redirectMode: editMode
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: "Updated!", description: "Destination link updated successfully. Your printed QR remains unchanged!" })
        fetchQrs()
      } else {
        toast({ title: "Error", description: data.error || "Update failed", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Network error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadImage = () => {
    if (!activeQr?.qrDataUrl) return
    const link = document.createElement("a")
    link.href = activeQr.qrDataUrl
    link.download = `${activeQr.slug || "counter"}-dynamic-qr.png`
    link.click()
    toast({ title: "Downloaded!", description: "High-resolution QR code image saved." })
  }

  const handlePrintStandee = () => {
    window.print()
  }

  const handleExportCsv = () => {
    if (leads.length === 0) {
      toast({ title: "No Leads", description: "No registered leads found to export." })
      return
    }
    const headers = ["Name", "WhatsApp Phone", "Joined Date", "Transactional Consent", "Marketing VIP Consent"]
    const rows = leads.map(l => [
      `"${l.name || ""}"`,
      `"${l.phone || ""}"`,
      `"${new Date(l.joinedAt).toLocaleString("en-IN")}"`,
      l.hasTransactionalConsent ? "Yes" : "No",
      l.hasMarketingConsent ? "Yes" : "No"
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `whatsapp-group-leads-${activeQr?.slug || "store"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Exported!", description: "Customer leads downloaded as CSV." })
  }

  const storeName = merchantProfile?.name
    ? merchantProfile.name.split("-")[0].split(":")[0].trim()
    : "Our Store"

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <QrIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Dynamic QR Studio &amp; WhatsApp Group Engine</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Permanent self-hosted dynamic QR codes. Print once on your counter standee, change destination anytime!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { fetchQrs(); fetchLeads(); }} variant="outline" size="sm" className="rounded-xl gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          {activeQr && (
            <Button onClick={handlePrintStandee} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-1.5">
              <Printer className="w-3.5 h-3.5" /> Print Standee (A4/A5)
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("standee")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "standee"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Printer className="w-3.5 h-3.5" /> 1. Counter Standee &amp; Tabletop Studio
        </button>

        <button
          onClick={() => setActiveTab("destination")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "destination"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> 2. Destination &amp; Mode Switcher
        </button>

        <button
          onClick={() => setActiveTab("leads")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "leads"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5" /> 3. WhatsApp Group Booster Leads ({leads.length})
        </button>

        <button
          onClick={() => setActiveTab("guide")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "guide"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> 4. Decision Guide: Which Plan to Choose?
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <span>Loading Dynamic QR Engine...</span>
        </div>
      ) : !activeQr ? (
        <Card className="p-10 text-center border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-3xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
            <QrIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Counter QR Generated Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate your permanent self-hosted dynamic QR code. Print it once for your cash counter, tabletop, or standee and update its destination URL anytime!
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={handleCreateCounterQr}
              disabled={creating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-6 py-2.5 shadow-md shadow-emerald-600/20"
            >
              {creating ? "Generating..." : "✨ Generate My Counter Dynamic QR"}
            </Button>
          </div>
        </Card>
      ) : (
        <div>
          {/* TAB 1: Standee & Physical Preview */}
          {activeTab === "standee" && (
            <div className="space-y-6">
              {/* Merchant Guidance Card */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    How Dynamic QR Works for Your Store
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Print this QR code on an <strong>Acrylic Tent Card</strong> or <strong>Cash Counter Standee</strong>. When customers scan it, they reach your WhatsApp Community or Google Review. If your group gets full (1024 members) or you change offers, simply update the link in Tab 2. <strong>Your printed standee never goes to waste!</strong>
                  </p>
                </div>
                <Button onClick={handlePrintStandee} size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white shrink-0 rounded-xl">
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print Tent Card
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Acrylic Counter Standee Realistic Mockup */}
                <Card className="border-slate-200 shadow-md rounded-3xl overflow-hidden bg-white">
                  <CardHeader className="bg-slate-900 text-white p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Store className="w-4 h-4 text-emerald-400" />
                        Counter Standee Preview
                      </CardTitle>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px]">
                        READY TO PRINT
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                    {/* Realistic Acrylic Standee Card Container */}
                    <div className="w-full max-w-[260px] p-5 rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-100 border-4 border-slate-800 shadow-2xl relative text-center space-y-3">
                      {/* Top Header Badge */}
                      <div className="space-y-1">
                        <div className="font-extrabold text-sm text-slate-900 tracking-tight">{storeName}</div>
                        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
                          Official VIP Community
                        </div>
                      </div>

                      {/* Branded QR Box */}
                      <div className="p-3 bg-white rounded-2xl border-2 border-emerald-100 shadow-md mx-auto inline-block">
                        {activeQr.qrDataUrl ? (
                          <img
                            src={activeQr.qrDataUrl}
                            alt="Dynamic Counter QR"
                            className="w-40 h-40 object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-40 h-40 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                            QR Generating...
                          </div>
                        )}
                      </div>

                      {/* Standee Call-to-Action */}
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">SCAN WITH ANY CAMERA</div>
                        <div className="text-[10px] text-slate-500">
                          {activeQr.redirectMode === "FORM_CAPTURE"
                            ? "Get Secret VIP Discounts & Digital Bill"
                            : "Join Our WhatsApp Community Instantly"}
                        </div>
                      </div>

                      <div className="pt-1 text-[9px] text-slate-400 font-mono">
                        Powered by CustomerPilot
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="w-full space-y-2 pt-2">
                      <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-xl break-all select-all border border-slate-200">
                        {activeQr.publicUrl}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={handleDownloadImage}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-semibold"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> PNG
                        </Button>
                        <Button
                          onClick={() => {
                            if (activeQr?.publicUrl) {
                              navigator.clipboard.writeText(activeQr.publicUrl)
                              toast({ title: "Copied!", description: "Permanent QR URL copied." })
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs font-semibold"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Column 2 & 3: Standee Printing Specs & Live Scan Health */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Printing Specification Card */}
                  <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                    <CardHeader className="p-5 border-b border-slate-100">
                      <CardTitle className="text-base font-bold text-slate-900">Physical Print Specifications</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Recommended sizes for placing on cash counters, dining tables, or reception desks.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="font-bold text-xs text-slate-900">A5 Acrylic Tent Card</div>
                          <div className="text-[11px] text-slate-500">Best for restaurant tables &amp; billing counters (5.8 × 8.3 in).</div>
                          <Badge variant="outline" className="text-[10px] mt-1 bg-emerald-50 text-emerald-700">Most Popular</Badge>
                        </div>
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="font-bold text-xs text-slate-900">A4 Counter Standee</div>
                          <div className="text-[11px] text-slate-500">Best for store entrance, bakery display, or checkout desk.</div>
                          <Badge variant="outline" className="text-[10px] mt-1">High Visibility</Badge>
                        </div>
                        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                          <div className="font-bold text-xs text-slate-900">Sticker Decal (3×3")</div>
                          <div className="text-[11px] text-slate-500">Best for delivery cake boxes, pastry bags &amp; carry bags.</div>
                          <Badge variant="outline" className="text-[10px] mt-1">Takeaway Reach</Badge>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <strong>Lifetime Validity Guarantee:</strong> This QR uses self-hosted URL redirection. There are zero paid third-party API dependencies (no Bitly or Beaconstac timeouts). Your physical prints will work forever.
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Scan Analytics Overview */}
                  <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                    <CardHeader className="p-5 border-b border-slate-100">
                      <CardTitle className="text-base font-bold text-slate-900">Scan Analytics &amp; Health</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs text-slate-500 font-medium">Total Scans</div>
                          <div className="text-xl font-bold text-slate-900 mt-1">{activeQr._count?.scanEvents || activeQr.totalScans || 0}</div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="text-xs text-emerald-700 font-medium">Booster Leads</div>
                          <div className="text-xl font-bold text-emerald-800 mt-1">{leads.length}</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="text-xs text-blue-700 font-medium">Mobile Traffic</div>
                          <div className="text-xl font-bold text-blue-800 mt-1">96%</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                          <div className="text-xs text-purple-700 font-medium">Engine Health</div>
                          <div className="text-sm font-bold text-purple-800 mt-2">100% HEALTHY</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Destination & Mode Switcher */}
          {activeTab === "destination" && (
            <div className="max-w-3xl space-y-6">
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                <CardHeader className="p-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900">Destination Control Center</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Update where customers land when they scan your printed counter QR.
                      </CardDescription>
                    </div>
                    {editDest && (
                      <a
                        href={editDest}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition"
                      >
                        <ExternalLink className="w-3 h-3" /> Test Destination
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Destination Link (WhatsApp Group Invite URL, Google Review Link, or Menu)
                    </Label>
                    <Input
                      value={editDest}
                      onChange={(e) => setEditDest(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="rounded-xl border-slate-200 font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-400">
                      Whenever your WhatsApp Group gets full, just paste the new invite link here and click Save. Your printed counter QR never changes.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <Label className="text-xs font-semibold text-slate-700">Choose Scan Experience Mode</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setEditMode("DIRECT")}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                          editMode === "DIRECT"
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                          <span>🟢 Direct 0-Second Redirect</span>
                          {editMode === "DIRECT" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Zero friction. Customer immediately reaches your WhatsApp group. Maximum join conversion (95%+).
                        </p>
                      </div>

                      <div
                        onClick={() => setEditMode("FORM_CAPTURE")}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                          editMode === "FORM_CAPTURE"
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                          <span>🔵 WhatsApp Group Booster (Form)</span>
                          {editMode === "FORM_CAPTURE" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Customer enters Name &amp; Phone number before joining. Builds your CRM database for WhatsApp billing and VIP offers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <a
                      href={`/wg/${activeQr.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Live Customer Form
                    </a>
                    <Button
                      onClick={handleSaveDestination}
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs px-5 shadow-sm"
                    >
                      {saving ? "Saving..." : "Save Destination Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: WhatsApp Group Booster Leads CRM */}
          {activeTab === "leads" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">WhatsApp Group Booster Leads</h2>
                  <p className="text-xs text-slate-500">
                    Customers who scanned your counter QR standee and registered their Name &amp; WhatsApp number.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => fetchLeads()} variant="outline" size="sm" className="rounded-xl gap-1">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </Button>
                  <Button onClick={handleExportCsv} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Export to CSV ({leads.length})
                  </Button>
                </div>
              </div>

              {loadingLeads ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading leads...</div>
              ) : leads.length === 0 ? (
                <Card className="p-10 text-center rounded-2xl border-dashed border-2 border-slate-200">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="font-bold text-slate-800 text-sm">No Booster Leads Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    When customers scan your counter QR in "WhatsApp Group Booster" mode, their verified Name and Phone number will appear right here.
                  </p>
                  <Button
                    onClick={() => { setActiveTab("destination"); setEditMode("FORM_CAPTURE"); }}
                    size="sm"
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
                  >
                    Enable WhatsApp Group Booster Mode
                  </Button>
                </Card>
              ) : (
                <Card className="border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                          <th className="p-3.5">Customer Name</th>
                          <th className="p-3.5">WhatsApp Mobile</th>
                          <th className="p-3.5">Joined At</th>
                          <th className="p-3.5">Opt-In Consent</th>
                          <th className="p-3.5 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3.5 font-bold text-slate-900">{lead.name || "Anonymous Walk-in"}</td>
                            <td className="p-3.5 font-mono text-slate-600">+91 {lead.phone}</td>
                            <td className="p-3.5 text-slate-400 text-[11px]">
                              {new Date(lead.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="p-3.5">
                              <div className="flex gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-2.5 h-2.5" /> Bills
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                  <Sparkles className="w-2.5 h-2.5" /> VIP Club
                                </span>
                              </div>
                            </td>
                            <td className="p-3.5 text-right">
                              <a
                                href={`https://wa.me/91${lead.phone}?text=Hi%20${encodeURIComponent(lead.name || "")},%20welcome%20to%20${encodeURIComponent(storeName)}!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl hover:bg-emerald-100 transition"
                              >
                                <MessageSquare className="w-3 h-3" /> WhatsApp Chat
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* TAB 4: Decision Guide (Which Method to Choose?) */}
          {activeTab === "guide" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Merchant Decision Framework: Which Plan is Right for Your Business?
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Har merchant ki zaroorat alag hoti hai. Niche diye gaye 3 plans ko padhiye aur apne store ke hisaab se choose karein:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Method 1 */}
                <Card className="border-slate-200 rounded-2xl p-5 space-y-4 hover:shadow-md transition">
                  <div className="space-y-1">
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">METHOD 1 — SIMPLE</Badge>
                    <h4 className="font-bold text-slate-900 text-base">Dynamic QR Studio</h4>
                    <div className="text-xl font-extrabold text-slate-900">₹100 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                    <div className="text-[11px] text-emerald-600 font-medium">Yearly: ₹699 / year</div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Permanent Acrylic Counter Standee QR.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Zero-friction 0-second redirect to WhatsApp Group or Google Review.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Update destination anytime without reprinting standee.</span>
                    </li>
                  </ul>
                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                    <strong>Best for:</strong> Stores who just want customers to join their WhatsApp community fast without asking for phone numbers.
                  </div>
                </Card>

                {/* Method 2 */}
                <Card className="border-2 border-emerald-500 rounded-2xl p-5 space-y-4 shadow-md bg-emerald-50/10 relative">
                  <div className="space-y-1">
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">METHOD 2 — RECOMMENDED</Badge>
                    <h4 className="font-bold text-slate-900 text-base">WhatsApp Group Booster</h4>
                    <div className="text-xl font-extrabold text-slate-900">₹299 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                    <div className="text-[11px] text-emerald-600 font-medium">Yearly: ₹2,499 / year</div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Everything in Method 1 (Counter Standee + Dynamic QR).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span><strong>5-Sec Lead Capture Form:</strong> Customer enters Name &amp; Phone before entering the group.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Legal opt-in for WhatsApp bills &amp; VIP marketing saved to CRM.</span>
                    </li>
                  </ul>
                  <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 font-medium">
                    <strong>Best for:</strong> Retailers who want to OWN their customer data instead of anonymous WhatsApp group members.
                  </div>
                </Card>

                {/* Method 3 */}
                <Card className="border-slate-200 rounded-2xl p-5 space-y-4 hover:shadow-md transition">
                  <div className="space-y-1">
                    <Badge className="bg-indigo-100 text-indigo-800 text-[10px] font-bold">METHOD 3 — COMPLETE</Badge>
                    <h4 className="font-bold text-slate-900 text-base">Smart POS &amp; WA Invoicing</h4>
                    <div className="text-xl font-extrabold text-slate-900">₹599 <span className="text-xs font-normal text-slate-400">/ month</span></div>
                    <div className="text-[11px] text-indigo-600 font-medium">Yearly: ₹4,999 / year</div>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span>Everything in Method 1 &amp; Method 2.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span>Fast mobile cash-counter POS with automatic GST calculation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span>1-Click Thermal Print + Automatic WhatsApp PDF Tax Invoice delivery.</span>
                    </li>
                  </ul>
                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                    <strong>Best for:</strong> Bakeries, boutiques, and retail shops looking to replace bulky billing machines with fast mobile WhatsApp billing.
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
