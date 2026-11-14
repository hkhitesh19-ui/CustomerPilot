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
  ShieldCheck, Printer, Trash2, Globe, Plus, ArrowRight, Check, Image as ImageIcon
} from "lucide-react"

export default function DynamicQRStudioPage() {
  const { toast } = useToast()
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [merchantProfile, setMerchantProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [selectedQr, setSelectedQr] = useState<any>(null)

  // Creation State
  const [newLabel, setNewLabel] = useState("")
  const [newDestUrl, setNewDestUrl] = useState("")
  const [logoChoice, setLogoChoice] = useState<"store_logo" | "no_logo">("store_logo")
  const [customLogoUrl, setCustomLogoUrl] = useState("")
  const [creating, setCreating] = useState(false)
  const [previewQrDataUrl, setPreviewQrDataUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // In-line Edit Destination State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  // 1. Fetch current merchant and all dynamic QRs
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.authenticated && data.merchant) {
          setMerchantId(data.merchant.id)
          setMerchantProfile(data.merchant)
          fetchQrs(data.merchant.id)
        } else {
          fetchQrs()
        }
      } catch {
        fetchQrs()
      }
    }
    init()
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
      if (data.success && data.qrCodes) {
        setQrCodes(data.qrCodes)
        if (data.qrCodes.length > 0 && !selectedQr) {
          setSelectedQr(data.qrCodes[0])
        }
      }
    } catch {
      toast({ title: "Notice", description: "Loading QR codes...", variant: "default" })
    } finally {
      setLoading(false)
    }
  }

  // 2. Generate Live Preview on the fly
  const handleGeneratePreview = async () => {
    if (!newDestUrl.trim()) {
      toast({ title: "URL Required", description: "Please enter any destination URL first.", variant: "destructive" })
      return
    }
    setPreviewLoading(true)
    try {
      const res = await fetch("/api/qr-codes/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newDestUrl.trim(),
          noLogo: logoChoice === "no_logo",
          customLogoUrl: customLogoUrl.trim() || undefined
        })
      })
      const data = await res.json()
      if (data.success && data.qrDataUrl) {
        setPreviewQrDataUrl(data.qrDataUrl)
        toast({ title: "Preview Generated!", description: "High-resolution QR code preview rendered." })
      } else {
        toast({ title: "Error", description: data.error || "Failed to generate preview", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to generate QR preview", variant: "destructive" })
    } finally {
      setPreviewLoading(false)
    }
  }

  // 3. Create & Save New Dynamic QR
  const handleCreateQr = async () => {
    if (!newDestUrl.trim()) {
      toast({ title: "Destination URL Required", description: "Enter any valid URL (Website, Google Review, Instagram, Menu, etc.)", variant: "destructive" })
      return
    }

    setCreating(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch("/api/qr-codes", {
        method: "POST",
        headers,
        body: JSON.stringify({
          label: newLabel.trim() || "Dynamic QR",
          currentDest: newDestUrl.trim(),
          redirectMode: "DIRECT",
          noLogo: logoChoice === "no_logo"
        })
      })
      const data = await res.json()
      if (data.success && data.qrCode) {
        toast({ title: "Dynamic QR Created! 🚀", description: "Permanent self-hosted QR code is ready to print and use." })
        setNewLabel("")
        setNewDestUrl("")
        setPreviewQrDataUrl(null)
        await fetchQrs()
      } else {
        toast({ title: "Creation Failed", description: data.error || "Could not create QR code", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to create QR code", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  // 4. Update Destination URL for an existing Dynamic QR
  const handleSaveDestination = async (qrId: string, destUrl: string) => {
    if (!destUrl.trim()) {
      toast({ title: "Invalid URL", description: "Destination URL cannot be empty.", variant: "destructive" })
      return
    }
    setSavingEdit(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch(`/api/qr-codes/${qrId}/destination`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          destination: destUrl.trim(),
          note: "Updated from Dynamic QR Studio"
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Destination Updated! ✅", description: "Your printed QR code will now immediately redirect to this new URL." })
        setEditingId(null)
        fetchQrs()
      } else {
        toast({ title: "Update Failed", description: data.error || "Failed to update", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to update destination", variant: "destructive" })
    } finally {
      setSavingEdit(false)
    }
  }

  // 5. Delete Dynamic QR
  const handleDeleteQr = async (qrId: string) => {
    if (!confirm("Are you sure you want to delete this Dynamic QR code? Printed copies will stop redirecting.")) return
    try {
      const headers: Record<string, string> = {}
      if (merchantId) headers["x-merchant-id"] = merchantId

      const res = await fetch(`/api/qr-codes/${qrId}`, {
        method: "DELETE",
        headers
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Deleted", description: "Dynamic QR code removed." })
        fetchQrs()
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete QR code", variant: "destructive" })
    }
  }

  // Helper download
  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
              <QrIcon className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Dynamic QR Studio</h1>
            <Badge className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-2.5 py-0.5">
              Self-Hosted Dynamic QR Engine
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Generate permanent dynamic QR codes for <strong>ANY link</strong> (Website, Google Reviews, Instagram, PDF Menu, Offers).
            Print once on counter standees, table cards, or packaging — <strong>change the destination URL anytime</strong> without ever re-printing!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchQrs()} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs text-slate-600">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* 2. Top Section: Creator Console + Live Dynamic Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Creator Console (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50/70 via-slate-50 to-white border-b border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Create New Dynamic QR Code</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Enter any website, document, social profile, or review link below.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-teal-300 text-teal-700 bg-teal-50 text-[10px] font-bold">
                  Zero Third-Party APIs
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Field 1: Campaign / QR Label */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">QR Name / Campaign Label</Label>
                <Input
                  placeholder="e.g. Counter Google Review Standee, Table 4 Menu, Summer Promo"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs py-2.5 focus:border-teal-500"
                />
              </div>

              {/* Field 2: Target Destination URL (Core Edit Box) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-600" />
                    <span>Destination URL (Edit Box)</span>
                  </Label>
                  <span className="text-[11px] text-slate-400">Can be changed anytime later</span>
                </div>
                <Input
                  placeholder="https://maps.app.goo.gl/... or https://yourstore.com/menu.pdf"
                  value={newDestUrl}
                  onChange={(e) => setNewDestUrl(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs py-2.5 font-mono focus:border-teal-500"
                />
                <p className="text-[11px] text-slate-500">
                  Tip: Paste your Google Maps review link, Instagram page, food menu PDF, or WhatsApp chat link.
                </p>
              </div>

              {/* Field 3: Logo Style (With Logo vs Without Logo) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-700">Center Logo Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLogoChoice("store_logo")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      logoChoice === "store_logo"
                        ? "border-teal-500 bg-teal-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${logoChoice === "store_logo" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">With Store Logo</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Embeds your business logo in QR center for high trust</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoChoice("no_logo")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      logoChoice === "no_logo"
                        ? "border-teal-500 bg-teal-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${logoChoice === "no_logo" ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <QrIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Without Logo (Clean)</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Pure, high-density black &amp; white dynamic QR code</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <Button
                  onClick={handleGeneratePreview}
                  disabled={previewLoading || !newDestUrl.trim()}
                  variant="outline"
                  className="w-full sm:w-auto rounded-xl text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-600" />
                  <span>{previewLoading ? "Generating..." : "Generate Live Preview"}</span>
                </Button>

                <Button
                  onClick={handleCreateQr}
                  disabled={creating || !newDestUrl.trim()}
                  className="w-full sm:flex-1 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{creating ? "Creating Dynamic QR..." : "Create & Save Dynamic QR"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Dynamic Preview Card (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden sticky top-6">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">Active QR Preview</CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  {previewQrDataUrl ? "Instant Preview (Unsaved)" : selectedQr?.label || "Select or create a QR"}
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold">
                100% Dynamic
              </Badge>
            </CardHeader>

            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              {/* QR Image Display */}
              <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center">
                {previewQrDataUrl ? (
                  <img src={previewQrDataUrl} alt="Preview QR" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                ) : selectedQr?.qrDataUrl ? (
                  <img src={selectedQr.qrDataUrl} alt={selectedQr.label} className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                ) : (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center text-slate-400 gap-2 border border-dashed border-slate-300 rounded-xl">
                    <QrIcon className="w-10 h-10 opacity-40" />
                    <span className="text-xs">No QR Code Selected</span>
                  </div>
                )}
              </div>

              {/* Dynamic URL badge */}
              <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 text-left space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dynamic Redirect Endpoint</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-teal-700 font-semibold truncate">
                    {selectedQr?.publicUrl || (previewQrDataUrl ? "Preview (Save to activate URL)" : "—")}
                  </span>
                  {selectedQr?.publicUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedQr.publicUrl)
                        toast({ title: "Copied!", description: "Dynamic URL copied to clipboard." })
                      }}
                      className="h-7 px-2 text-[11px] text-slate-600 hover:text-teal-700"
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                  )}
                </div>
              </div>

              {/* Target Destination display */}
              <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-200 text-left space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Target Destination</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-800 font-medium truncate">
                    {previewQrDataUrl ? newDestUrl : selectedQr?.currentDest || "—"}
                  </span>
                  {(selectedQr?.currentDest || newDestUrl) && (
                    <a
                      href={previewQrDataUrl ? newDestUrl : selectedQr?.currentDest}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-700 text-xs flex items-center shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full pt-2">
                <Button
                  onClick={() => {
                    const imgUrl = previewQrDataUrl || selectedQr?.qrDataUrl
                    if (imgUrl) downloadDataUrl(imgUrl, `${selectedQr?.slug || "dynamic-qr"}.png`)
                  }}
                  disabled={!previewQrDataUrl && !selectedQr?.qrDataUrl}
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Merchant's Dynamic QR Library (Table / Manager) */}
      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Your Dynamic QR Library</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              All permanent dynamic QR codes created for your business. Update destinations in real-time.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-slate-300 text-slate-700 text-xs">
            {qrCodes.length} {qrCodes.length === 1 ? "QR Code" : "QR Codes"}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading dynamic QR codes...</div>
          ) : qrCodes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <QrIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No Dynamic QR Codes Yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Use the console above to create your first self-hosted dynamic QR code for any website, review link, or menu.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {qrCodes.map((qr) => {
                const isSelected = selectedQr?.id === qr.id
                const isEditing = editingId === qr.id
                const isNoLogo = qr.label?.startsWith("[NO_LOGO]") || false
                const cleanLabel = qr.label?.replace(/^\[NO_LOGO\]\s*/, "") || "Dynamic QR"

                return (
                  <div
                    key={qr.id}
                    className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                      isSelected ? "bg-teal-50/30" : "hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Left: Thumbnail + Info */}
                    <div className="flex items-center gap-4 min-w-[280px]">
                      {qr.qrDataUrl ? (
                        <img
                          src={qr.qrDataUrl}
                          alt={cleanLabel}
                          onClick={() => setSelectedQr(qr)}
                          className="w-14 h-14 rounded-xl border border-slate-200 p-1 bg-white cursor-pointer hover:shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <QrIcon className="w-6 h-6 text-slate-400" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 cursor-pointer" onClick={() => setSelectedQr(qr)}>
                            {cleanLabel}
                          </span>
                          {isNoLogo ? (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-300 text-slate-500">
                              Clean QR
                            </Badge>
                          ) : (
                            <Badge className="bg-teal-100 text-teal-800 text-[9px] px-1.5 py-0">
                              With Logo
                            </Badge>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-teal-700 flex items-center gap-1">
                          <span>{qr.publicUrl || `/api/wg/${qr.slug}`}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Scans: <strong>{qr._count?.scanEvents || qr.totalScans || 0}</strong> • Created: {new Date(qr.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Destination URL Editor */}
                    <div className="flex-1 max-w-xl">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            placeholder="Enter new destination URL"
                            className="text-xs rounded-xl font-mono border-teal-500"
                          />
                          <Button
                            size="sm"
                            disabled={savingEdit}
                            onClick={() => handleSaveDestination(qr.id, editUrl)}
                            className="rounded-xl text-xs bg-teal-600 hover:bg-teal-500 text-white shrink-0"
                          >
                            <Save className="w-3.5 h-3.5 mr-1" />
                            {savingEdit ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingId(null)}
                            className="rounded-xl text-xs text-slate-500 shrink-0"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Target:</span>
                            <span className="text-xs text-slate-700 font-mono truncate">{qr.currentDest}</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingId(qr.id)
                              setEditUrl(qr.currentDest)
                            }}
                            className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 shrink-0 ml-2"
                          >
                            <Edit3 className="w-3 h-3" /> Change
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedQr(qr)}
                        className={`rounded-xl text-xs ${isSelected ? "border-teal-500 text-teal-700 bg-teal-50" : "border-slate-200 text-slate-700"}`}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                      </Button>

                      {qr.qrDataUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadDataUrl(qr.qrDataUrl, `${qr.slug}.png`)}
                          className="rounded-xl text-xs text-slate-600 hover:text-slate-900"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteQr(qr.id)}
                        className="rounded-xl text-xs text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
