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
  Users, QrCode as QrIcon, Download, ExternalLink, RefreshCw, Smartphone, Monitor,
  Share2, CheckCircle2, AlertCircle, Sparkles, Edit3, Save, Copy, Eye,
  ShieldCheck, Printer, ArrowRight, Store, FileSpreadsheet, MessageCircle, Search, Phone
} from "lucide-react"

export default function WAGroupBoosterProPage() {
  const { toast } = useToast()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<any>(null)
  const [destUrl, setDestUrl] = useState("")
  const [saving, setSaving] = useState(false)

  // Leads CRM State
  const [leads, setLeads] = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 1. Fetch current merchant, counter QR, and captured leads
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.authenticated && data.merchant) {
          setMerchantId(data.merchant.id)
          setMerchantProfile(data.merchant)
          fetchCounterQr(data.merchant.id)
          fetchLeads(data.merchant.id)
        } else {
          fetchCounterQr()
          fetchLeads()
        }
      } catch {
        fetchCounterQr()
        fetchLeads()
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
        const found = data.qrCodes[0]
        setQrCode(found)
        setDestUrl(found.currentDest || "https://chat.whatsapp.com/")
      }
    } catch {
      toast({ title: "Notice", description: "Loading QR data...", variant: "default" })
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
      console.warn("Failed to load booster leads")
    } finally {
      setLoadingLeads(false)
    }
  }

  // 2. Save Destination URL (locked to FORM_CAPTURE mode for Tier 2)
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
          redirectMode: "FORM_CAPTURE",
          note: "Updated WhatsApp Group Booster Pro (Lead Capture Mode)"
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Saved! ✅", description: "Destination updated. Customers will fill VIP form then redirect to this group." })
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

  // 3. Export Leads to CSV
  const handleExportCsv = () => {
    if (leads.length === 0) {
      toast({ title: "No Leads", description: "No customer leads captured yet to export." })
      return
    }

    const headers = ["ID", "Customer Name", "WhatsApp Phone", "Joined At", "Transactional Consent", "Marketing Consent"]
    const rows = leads.map(l => [
      l.id,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${new Date(l.joinedAt).toLocaleString("en-IN")}"`,
      l.hasTransactionalConsent ? "YES" : "NO",
      l.hasMarketingConsent ? "YES" : "NO"
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `whatsapp_booster_leads_${merchantProfile?.slug || "store"}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Export Started", description: "Leads CSV downloaded successfully." })
  }

  const downloadQrImage = () => {
    if (!qrCode?.qrDataUrl) return
    const a = document.createElement("a")
    a.href = qrCode.qrDataUrl
    a.download = `${qrCode.slug || "whatsapp-booster-pro"}-qr.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (l.name || "").toLowerCase().includes(q) || (l.phone || "").includes(q)
  })

  const storeName = merchantProfile?.name || "Your Store"
  const formSlug = qrCode?.slug || "cake-connection"
  const liveFormUrl = `/wg/${formSlug}`

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <Users className="w-5 h-5 text-teal-700" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">WhatsApp Group Booster Pro</h1>
            <Badge className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-2.5 py-0.5">
              Lead Capture Mode • Tier 2 (₹299/mo / ₹2,499/yr)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Customer fills a <strong>5-second branded VIP form</strong> before joining your WhatsApp group.
            Captures verified 10-digit mobile numbers &amp; legal transactional consent directly into your CRM database for WhatsApp marketing &amp; invoicing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => { fetchCounterQr(); fetchLeads(); }} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-slate-600">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={handleExportCsv} className="rounded-xl gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Leads CSV ({leads.length})
          </Button>
        </div>
      </div>

      {/* 2. Customer Journey Walkthrough & Live Form Demo Banner */}
      <Card className="border-teal-200 bg-gradient-to-r from-teal-50/60 via-emerald-50/40 to-slate-50 shadow-sm rounded-2xl overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-600 text-white text-[10px] font-bold">THE VIP JOURNEY</Badge>
              <span className="text-sm font-bold text-slate-900">How Walk-in Customers Become Lifetime CRM Contacts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Scans Counter Standee</div>
                  <div className="text-[11px] text-slate-500">Walk-in customer scans with any mobile camera</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">2</div>
                <div>
                  <div className="text-xs font-bold text-slate-800">5-Sec Branded VIP Form</div>
                  <div className="text-[11px] text-slate-500">Enters Name &amp; verified 10-digit WhatsApp number</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">3</div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Instant WhatsApp Group Join</div>
                  <div className="text-[11px] text-slate-500">Auto-redirects to community group; lead saved to CRM</div>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-2.5">
            <a
              href={liveFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Experience Live Customer Form Demo</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </Card>

      {/* 3. Destination Control & Counter Standee Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Acrylic Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-teal-600" />
                <span>Lead Capture Standee Preview</span>
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold">
                LEAD CAPTURE ACTIVE
              </Badge>
            </CardHeader>

            <CardContent className="p-6 flex flex-col items-center">
              {/* Acrylic Tabletop Mockup */}
              <div className="w-full max-w-[290px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-4 text-center relative">
                <div className="space-y-1">
                  <div className="text-base font-black text-slate-900 uppercase tracking-tight">{storeName}</div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-extrabold tracking-wider uppercase">
                    OFFICIAL VIP COMMUNITY
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
                  {qrCode?.qrDataUrl ? (
                    <img src={qrCode.qrDataUrl} alt="Counter QR" className="w-44 h-44 object-contain" />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-300">
                      <QrIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY CAMERA</div>
                  <div className="text-[10px] text-slate-500">Join VIP Club &amp; Get Exclusive Offers</div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[9px] font-medium text-slate-400">
                  Powered by CustomerPilot
                </div>
              </div>

              <div className="w-full space-y-3 pt-6">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {qrCode?.publicUrl || `https://customerpilot.in/wg/${formSlug}`}
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
                    onClick={() => window.print()}
                    className="rounded-xl text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Print Standee</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Destination Control & CRM Leads Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Final Destination Group URL</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  The WhatsApp Community link customers are redirected to after submitting their VIP form.
                </CardDescription>
              </div>
              <a
                href={destUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 border border-teal-200 bg-teal-50 px-2.5 py-1 rounded-xl"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Test Group Link
              </a>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">WhatsApp Group Invite URL</Label>
                <Input
                  value={destUrl}
                  onChange={(e) => setDestUrl(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="rounded-xl border-slate-200 font-mono text-xs py-2.5 focus:border-teal-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-teal-500 bg-teal-50/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Lead Capture Mode (Locked Active)</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Customers enter verified Name &amp; Phone number before joining. All submissions are automatically synced to the CRM table below.
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

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Leads Captured</div>
              <div className="text-2xl font-black text-teal-700">{leads.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Scans</div>
              <div className="text-2xl font-black text-slate-900">{qrCode?._count?.scanEvents || qrCode?.totalScans || 0}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Lead Conversion</div>
              <div className="text-2xl font-black text-emerald-600">
                {qrCode?.totalScans > 0 ? `${Math.round((leads.length / Math.max(1, qrCode.totalScans)) * 100)}%` : "100%"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Verified Customer Leads CRM Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Verified WhatsApp Group Leads ({leads.length})</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Customers who completed the VIP form before joining your WhatsApp group.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs rounded-xl border-slate-200 h-9"
              />
            </div>
            <Button
              onClick={handleExportCsv}
              size="sm"
              variant="outline"
              className="rounded-xl text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 h-9 shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadingLeads ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading verified customer leads...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                {searchQuery ? "No matching leads found" : "No Leads Captured Yet"}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching with a different name or phone number."
                  : "When customers scan your counter standee and fill the 5-second VIP form, their verified details will appear here immediately."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-6">Customer Name</th>
                    <th className="p-3.5">WhatsApp Mobile</th>
                    <th className="p-3.5">Joined Date</th>
                    <th className="p-3.5">Legal Consent</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const cleanPhone = lead.phone.replace(/\D/g, "")
                    const waLink = `https://wa.me/91${cleanPhone.slice(-10)}`

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3.5 pl-6 font-bold text-slate-900">
                          {lead.name || "Valued Customer"}
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">
                          +91 {cleanPhone.slice(-10)}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {new Date(lead.joinedAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="p-3.5 space-x-1.5">
                          <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
                            Transactional: YES
                          </Badge>
                          <Badge variant="outline" className="text-[10px] text-blue-700 border-blue-300 bg-blue-50">
                            Marketing: YES
                          </Badge>
                        </td>
                        <td className="p-3.5 pr-6 text-right">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Chat</span>
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
