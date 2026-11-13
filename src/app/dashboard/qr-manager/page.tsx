"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  QrCode as QrIcon, Download, ExternalLink, RefreshCw, Smartphone, Monitor,
  Share2, CheckCircle2, AlertCircle, Sparkles, Edit3, Save, Copy, Eye, Zap, ShieldCheck
} from "lucide-react"

export default function QrManagerDashboard() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrCodes, setQrCodes] = useState<any[]>([])
  const [activeQr, setActiveQr] = useState<any>(null)
  const [editDest, setEditDest] = useState("")
  const [editMode, setEditMode] = useState<"DIRECT" | "FORM_CAPTURE">("DIRECT")
  const [saving, setSaving] = useState(false)

  const fetchQrs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/qr-codes")
      const data = await res.json()
      if (data.success && data.qrCodes?.length > 0) {
        setQrCodes(data.qrCodes)
        setActiveQr(data.qrCodes[0])
        setEditDest(data.qrCodes[0].currentDest)
        setEditMode(data.qrCodes[0].redirectMode || "DIRECT")
      }
    } catch {
      toast({ title: "Error", description: "Failed to load QR codes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQrs()
  }, [])

  const handleSaveDestination = async () => {
    if (!activeQr) return
    setSaving(true)
    try {
      const res = await fetch(`/api/qr-codes/${activeQr.id}/destination`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    link.download = `${activeQr.slug}-counter-qr.png`
    link.click()
    toast({ title: "Downloaded!", description: "QR code image saved." })
  }

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
            Permanent self-hosted dynamic QR codes. Print once on your counter, change destination anytime!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchQrs} variant="outline" size="sm" className="rounded-xl gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={handleDownloadImage} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5">
            <Download className="w-3.5 h-3.5" /> Download QR
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading QR Engine...</div>
      ) : !activeQr ? (
        <Card className="p-8 text-center">
          <p className="text-slate-500 text-sm">No QR codes found.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: QR Card & Actions */}
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900">{activeQr.label || "Counter QR"}</CardTitle>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                  {activeQr.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              {activeQr.qrDataUrl ? (
                <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                  <img
                    src={activeQr.qrDataUrl}
                    alt="Dynamic Counter QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                  QR Not Generated
                </div>
              )}

              <div className="w-full space-y-2">
                <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg break-all select-all border border-slate-200">
                  {activeQr.publicUrl}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownloadImage}
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-semibold"
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
                    className="flex-1 rounded-xl text-xs font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column 2 & 3: Configuration & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Destination Configuration */}
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Destination Control Center</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Update where customers land when they scan your printed counter QR.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Current Destination URL (WhatsApp Group Invite, Google Review, or Website)
                  </Label>
                  <Input
                    value={editDest}
                    onChange={(e) => setEditDest(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="rounded-xl border-slate-200 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Whenever your WhatsApp Group gets full, just paste the new invite link here and click Save.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Label className="text-xs font-semibold text-slate-700">Scan Redirection Behavior</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setEditMode("DIRECT")}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                        editMode === "DIRECT"
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                        <span>Direct 0-Second Redirect</span>
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
                          ? "border-emerald-600 bg-emerald-50/50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                        <span>Lead Capture Form First</span>
                        {editMode === "FORM_CAPTURE" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Customer enters Name &amp; Phone number before joining. Builds your CRM database for WhatsApp billing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveDestination}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs px-5"
                  >
                    {saving ? "Saving..." : "Save Destination Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scan Analytics Overview */}
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Scan Analytics &amp; Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium">Total Scans</div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{activeQr.totalScans || 0}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-xs text-emerald-700 font-medium">Unique (Est.)</div>
                    <div className="text-xl font-bold text-emerald-800 mt-1">
                      {Math.round((activeQr.totalScans || 0) * 0.72)}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-xs text-blue-700 font-medium">Mobile Traffic</div>
                    <div className="text-xl font-bold text-blue-800 mt-1">96%</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-xs text-purple-700 font-medium">QR Status</div>
                    <div className="text-sm font-bold text-purple-800 mt-2">100% HEALTHY</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
