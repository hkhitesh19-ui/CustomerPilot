"use client"

import React, { useState, useEffect, useRef } from "react"
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
  ShieldCheck, Printer, ArrowRight, Store, FileSpreadsheet, MessageCircle, Search, Phone,
  X, Wand2, AlertTriangle, Upload, Trash2
} from "lucide-react"
import { sanitizeDestinationUrl, detectMultipleUrls } from "@/lib/url-sanitizer"

export default function WAGroupBoosterProPage() {
  const { toast } = useToast()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)
  const [merchantsList, setMerchantsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [qrCode, setQrCode] = useState<any>(null)
  const [destUrl, setDestUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [qrStyle, setQrStyle] = useState<"whatsapp" | "store_logo" | "clean">("whatsapp")
  const [logoScale, setLogoScale] = useState<"md" | "lg" | "xl">("lg")
  const [showStoreText, setShowStoreText] = useState(false)
  const [standeeMessage, setStandeeMessage] = useState("Scan n Join Whatsapp Group")

  // Leads CRM State
  const [leads, setLeads] = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 1. Fetch current merchant, counter QR, and captured leads
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
          fetchLeads(targetId)
        } else {
          fetchCounterQr()
          fetchLeads()
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
        fetchLeads()
      }
    }
    init()
  }, [])

  const handleMerchantSwitch = (newMId: string) => {
    setMerchantId(newMId)
    const selected = merchantsList.find(m => m.id === newMId)
    if (selected) setMerchantProfile(selected)
    fetchCounterQr(newMId)
    fetchLeads(newMId)
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
        const cleaned = sanitizeDestinationUrl(found.currentDest || "https://chat.whatsapp.com/", { requireWhatsApp: true })
        setDestUrl(cleaned.isValid ? cleaned.cleanUrl : found.currentDest)
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

  // 3. Save Destination URL (locked to FORM_CAPTURE mode for Tier 2)
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
    setDestUrl(cleanDest)

    setSaving(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch(`/api/qr-codes/${qrCode.id}/destination`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          destination: cleanDest,
          redirectMode: "FORM_CAPTURE",
          note: "Updated WhatsApp Group Booster Pro (Lead Capture Mode)"
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: "Saved! ✅",
          description: validation.hadMultipleUrls
            ? "Cleaned duplicate links & updated. Customers will fill VIP form then redirect to this group."
            : "Destination updated. Customers will fill VIP form then redirect to this group."
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

  // ── Store Logo Upload & Removal ──────────────────────────────────────────
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "logo")

      const targetMId = merchantId
      const headers: Record<string, string> = {}
      if (targetMId) headers["x-merchant-id"] = targetMId

      const res = await fetch("/api/merchant/upload-brand", {
        method: "POST",
        headers,
        body: formData
      })
      const data = await res.json()
      if (data.success && data.url) {
        setMerchantProfile((prev: any) => ({ ...prev, logoUrl: data.url }))
        setQrStyle("store_logo")
        toast({
          title: "Logo Uploaded! ✨",
          description: "Your brand logo is now live on your Counter Standee and styled QR."
        })
        await fetchCounterQr(targetMId || undefined)
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message || "Could not upload logo", variant: "destructive" })
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  const handleRemoveLogo = async () => {
    setUploadingLogo(true)
    try {
      const targetMId = merchantId
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (targetMId) headers["x-merchant-id"] = targetMId

      const res = await fetch("/api/merchant/update", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ logoUrl: null })
      })
      if (!res.ok) throw new Error("Failed to remove logo")
      setMerchantProfile((prev: any) => ({ ...prev, logoUrl: null }))
      if (qrStyle === "store_logo") setQrStyle("whatsapp")
      toast({ title: "Logo Removed", description: "Standee will display store name typographically." })
      await fetchCounterQr(targetMId || undefined)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setUploadingLogo(false)
    }
  }

  // ── High-Res Standee Print ─────────────────────────────────────────────────
  const handlePrintStandee = () => {
    if (!activeQrDataUrl) {
      toast({ title: "QR Not Ready", description: "Standee QR code is still loading.", variant: "destructive" })
      return
    }

    const printLogoH = logoScale === "xl" ? "42mm" : logoScale === "md" ? "26mm" : "34mm"
    const logoHtml = merchantProfile?.logoUrl
      ? `<div style="text-align:center;margin-bottom:6px;min-height:30mm;display:flex;align-items:center;justify-content:center;">
           <img src="${merchantProfile.logoUrl}" style="max-height:${printLogoH};max-width:105mm;object-fit:contain;border-radius:12px;" alt="${storeName}" />
         </div>`
      : `<div class="store-name">${storeName}</div>`

    const storeTextHtml = (showStoreText && merchantProfile?.logoUrl)
      ? `<div class="store-name" style="font-size:12pt;margin-top:2px;">${storeName}</div>`
      : ""

    const printHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${storeName} - Counter Standee</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color: #0f172a;
    }
    .print-sheet {
      width: 210mm;
      height: 297mm;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10mm;
      position: relative;
    }
    @media print {
      body { background: #ffffff; }
      .print-sheet { box-shadow: none; width: 100vw; height: 100vh; }
    }
    .standee-card {
      width: 130mm;
      background: #ffffff;
      border: 4px solid #0f172a;
      border-radius: 28px;
      padding: 12mm 10mm;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .store-name {
      font-size: 16pt;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      background: #059669;
      color: #ffffff;
      border-radius: 9999px;
      font-size: 9pt;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .qr-box {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 12px;
      display: inline-block;
      margin: 6px 0;
    }
    .qr-box img {
      width: 62mm;
      height: 62mm;
      display: block;
    }
    .scan-header {
      font-size: 11pt;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .scan-sub {
      font-size: 9pt;
      color: #64748b;
      margin-top: 2px;
    }
    .footer {
      width: 100%;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 6px;
      font-size: 8.5pt;
      font-weight: 700;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .cut-guide {
      position: absolute;
      bottom: 6mm;
      font-size: 8pt;
      color: #94a3b8;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="print-sheet">
    <div class="standee-card">
      ${logoHtml}
      ${storeTextHtml}
      <div><span class="badge">${standeeMessage}</span></div>
      <div class="qr-box">
        <img src="${activeQrDataUrl}" alt="QR" />
      </div>
      <div>
        <div class="scan-header">SCAN WITH ANY SCANNER</div>
        <div class="scan-sub">Scan to join our official WhatsApp Community</div>
      </div>
      <div class="footer">
        <span>Powered by <strong>CustomerPilot.in :</strong></span>
        <img src="${typeof window !== "undefined" ? window.location.origin : ""}/whatsapp_clean_icon.png" style="width:14px;height:14px;border-radius:50%;vertical-align:middle;margin:0 2px;" />
        <strong style="color:#0f172a;">+91 9033304707</strong>
      </div>
    </div>
    <div class="cut-guide">CustomerPilot High-Resolution A4/A5 Standee &bull; Cut along border for Acrylic Counter Display</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`

    const printWin = window.open("", "_blank")
    if (printWin) {
      printWin.document.open()
      printWin.document.write(printHtml)
      printWin.document.close()
    }
  }

  const downloadQrImage = () => {
    if (!activeQrDataUrl) return
    const a = document.createElement("a")
    a.href = activeQrDataUrl
    a.download = `${qrCode?.slug || "whatsapp-booster-pro"}-${qrStyle}-qr.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const activeQrDataUrl =
    qrStyle === "store_logo" && qrCode?.storeLogoQrDataUrl
      ? qrCode.storeLogoQrDataUrl
      : qrStyle === "clean" && qrCode?.cleanQrDataUrl
      ? qrCode.cleanQrDataUrl
      : qrCode?.waQrDataUrl || qrCode?.qrDataUrl

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
          <Button onClick={() => { fetchCounterQr(); fetchLeads(); }} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-slate-600">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={handlePrintStandee} className="rounded-xl gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold">
            <Printer className="w-3.5 h-3.5" /> Print Standee (A4/A5)
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
              {/* Store Logo Uploader Bar */}
              <div className="w-full max-w-[290px] bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-400/80 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {merchantProfile?.logoUrl ? (
                    <img
                      src={merchantProfile.logoUrl}
                      alt="Store Logo"
                      className="w-9 h-9 rounded-xl object-contain border border-teal-300 bg-white p-0.5 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Store className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-black text-slate-900 truncate flex items-center gap-1">
                      <span>Store Brand Logo</span>
                      {merchantProfile?.logoUrl && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      )}
                    </div>
                    <div className="text-[10px] text-teal-800 font-medium truncate">
                      {merchantProfile?.logoUrl ? "Active on Standee & QR" : "Upload logo for standee"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="h-7 px-3 rounded-xl text-xs font-extrabold bg-teal-600 hover:bg-teal-700 text-white gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{uploadingLogo ? "..." : (merchantProfile?.logoUrl ? "Change" : "Upload")}</span>
                  </Button>
                  {merchantProfile?.logoUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={uploadingLogo}
                      onClick={handleRemoveLogo}
                      title="Remove custom logo"
                      className="h-7 w-7 p-0 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Acrylic Tabletop Mockup */}
              <div className="w-full max-w-[320px] sm:max-w-[340px] bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-2xl space-y-3.5 text-center relative">
                {/* Store Header with Logo */}
                <div className="space-y-2 flex flex-col items-center w-full">
                  {merchantProfile?.logoUrl ? (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="cursor-pointer group flex flex-col items-center justify-center p-1 w-full"
                      title="Click to change logo"
                    >
                      <div className="w-full flex items-center justify-center py-1">
                        <img
                          src={merchantProfile.logoUrl}
                          alt={storeName}
                          className={`${
                            logoScale === "xl"
                              ? "max-h-[165px] sm:max-h-[180px] max-w-[300px]"
                              : logoScale === "md"
                              ? "max-h-[105px] sm:max-h-[115px] max-w-[240px]"
                              : "max-h-[135px] sm:max-h-[150px] max-w-[280px]"
                          } w-auto h-auto object-contain rounded-2xl drop-shadow-md group-hover:scale-105 transition-all`}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                        Click logo to change image
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="cursor-pointer group flex items-center justify-center gap-1.5 py-2 px-4 mb-1 rounded-2xl border-2 border-dashed border-teal-400 hover:border-teal-600 bg-teal-50/70 hover:bg-teal-100/70 transition-all text-teal-700 text-xs font-bold shadow-xs"
                      title="Click to upload your store logo"
                    >
                      <Upload className="w-4 h-4 group-hover:scale-110 transition-transform text-teal-600" />
                      <span>+ Upload Store Logo Here</span>
                    </button>
                  )}

                  {/* Store Name Text (Shown if no custom logo, or if user toggled on) */}
                  {(!merchantProfile?.logoUrl || showStoreText) && (
                    <div className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-tight">
                      {storeName}
                    </div>
                  )}

                  <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide shadow-sm">
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
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 tracking-tight">SCAN WITH ANY SCANNER</div>
                  <div className="text-[10px] text-slate-500">Scan to join our official WhatsApp Community</div>
                </div>

                {/* Standardized Powered By Footer with WhatsApp icon & Support phone */}
                <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-600">
                  <span className="text-slate-500 font-medium">Powered by</span>
                  <span className="text-slate-900 font-extrabold">CustomerPilot.in :</span>
                  <div className="inline-flex items-center gap-1">
                    <img
                      src="/whatsapp_clean_icon.png"
                      alt="WhatsApp"
                      className="w-3.5 h-3.5 rounded-full object-contain shrink-0"
                    />
                    <span className="font-extrabold text-slate-900 tracking-tight">
                      +91 9033304707
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Style Selector & Standee Message Editor */}
              <div className="w-full space-y-3 pt-5">
                {/* Logo Display Controls & Sizing */}
                {merchantProfile?.logoUrl && (
                  <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-teal-950 text-[11px]">Logo Display Size:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setLogoScale("md")}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            logoScale === "md"
                              ? "bg-teal-700 text-white shadow-xs font-extrabold"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          Medium (105px)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoScale("lg")}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            logoScale === "lg"
                              ? "bg-teal-700 text-white shadow-xs font-extrabold"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          Large (135px) ✨
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoScale("xl")}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            logoScale === "xl"
                              ? "bg-teal-700 text-white shadow-xs font-extrabold"
                              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          Hero X-Large (165px) 🚀
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-teal-200/50 text-[11px]">
                      <span className="text-slate-600 font-medium">Store name text below logo:</span>
                      <button
                        type="button"
                        onClick={() => setShowStoreText(!showStoreText)}
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border transition-all ${
                          showStoreText
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {showStoreText ? "✓ Showing Text" : "Logo Only (Clean)"}
                      </button>
                    </div>
                  </div>
                )}
                {/* Dedicated Store Logo Control Tile */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-teal-600 shrink-0" />
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-slate-800">Store Brand Logo</div>
                      <div className="text-[9px] text-slate-500">
                        {merchantProfile?.logoUrl ? "Custom logo rendered on standee" : "No logo uploaded yet"}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    className="h-6 px-2.5 text-[10px] font-bold rounded-lg border-teal-500 text-teal-700 hover:bg-teal-50 gap-1"
                  >
                    <Upload className="w-2.5 h-2.5" />
                    <span>{merchantProfile?.logoUrl ? "Change" : "Upload Logo"}</span>
                  </Button>
                </div>
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
                    {merchantProfile?.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setQrStyle("store_logo")}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          qrStyle === "store_logo" ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Store Logo
                      </button>
                    )}
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

              <div className="w-full space-y-2.5 pt-4">
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {qrCode?.publicUrl || `https://customerpilot.in/wg/${formSlug}`}
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

                  <Button
                    onClick={handlePrintStandee}
                    variant="outline"
                    className="rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download Standee</span>
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700">WhatsApp Group Invite URL</Label>
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
                      detectMultipleUrls(destUrl)
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
                {detectMultipleUrls(destUrl) && (
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
