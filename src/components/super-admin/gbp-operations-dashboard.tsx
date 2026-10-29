"use client"
// CustomerPilot — GBP Operations Dashboard Component
// Used inside Super Admin panel to manage all GBP Track A & B clients.
// Ops Executive's daily command center — no coding required, just checkboxes.

import { useState, useEffect, useCallback } from "react"
import {
  MapPin, CheckCircle2, Circle, AlertTriangle, Zap, Clock, TrendingUp,
  RefreshCw, ChevronDown, ChevronRight, Loader2, Star, Shield, Rocket,
  ArrowUpRight, Users, MessageSquare, BarChart3, Copy, Check, ExternalLink,
  Calendar, Sparkles, Tag
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MerchantGbpPostQueue } from "./merchant-gbp-post-queue"

type ChecklistItem = {
  id: string
  merchantId: string
  track: string
  week: number
  taskKey: string
  taskLabel: string
  isDone: boolean
  doneAt: string | null
  doneByEmail: string | null
  notes: string | null
}

type MerchantGbpData = {
  id: string
  name: string
  gbpServiceTrack: string | null
  gbpProfileStatus: string | null
  gbpOnboardingWeek: number | null
  gbpReviewCount: number | null
  gbpReviewVelocityCap: number | null
  gbpCitationsReady: boolean | null
  gbpSurgeryCompleted: boolean | null
  gbpMapTrafficEnabled: boolean | null
  gbpTrackStartedAt: string | null
  checklist: ChecklistItem[]
  completionPct: number
  doneItems: number
  totalItems: number
}

type GbpPostItem = {
  id: string
  merchantId: string
  postType: string
  scheduledDay: string
  scheduledDate: string
  title: string | null
  caption: string
  imageUrl: string
  ctaType: string | null
  ctaUrl: string | null
  couponCode: string | null
  offerStartDate: string | null
  offerEndDate: string | null
  status: string
  postedAt: string | null
  postedBy: string | null
  gbpPostId: string | null
  errorMessage: string | null
}

const TRACK_LABELS: Record<string, { label: string; color: string; icon: typeof Rocket }> = {
  TRACK_A_NEW: { label: "New Business Launchpad", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: Rocket },
  TRACK_B_EXISTING: { label: "Top 3 Rank Accelerator", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: TrendingUp },
  NONE: { label: "No Track", color: "text-slate-400 bg-slate-500/10 border-slate-500/30", icon: Circle },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  UNVERIFIED: { label: "Unverified", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  SANDBOX: { label: "Sandbox (30-day)", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  VERIFIED: { label: "Verified", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  TOP3_LOCKED: { label: "🏆 Top 3 Locked!", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
}

export function GbpOperationsDashboard() {
  const [merchants, setMerchants] = useState<MerchantGbpData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [trackFilter, setTrackFilter] = useState<"ALL" | "TRACK_A_NEW" | "TRACK_B_EXISTING">("ALL")
  const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null)
  const [completingItem, setCompletingItem] = useState<string | null>(null)
  const [assigningTrack, setAssigningTrack] = useState<string | null>(null)
  const [execEmail, setExecEmail] = useState("ops@customerpilot.in")
  const [dossierMerchantId, setDossierMerchantId] = useState<string | null>(null)
  const [dossiers, setDossiers] = useState<any[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const loadDossiers = async (mId: string) => {
    if (dossierMerchantId === mId) {
      setDossierMerchantId(null)
      return
    }
    setDossierMerchantId(mId)
    try {
      const res = await fetch(`/api/gbp/redressal-dossier?merchantId=${mId}`)
      const data = await res.json()
      if (data.ok && data.data?.dossiers) {
        setDossiers(data.data.dossiers)
      }
    } catch (e) {
      console.error("Failed to load dossiers:", e)
    }
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const loadMerchants = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all merchants with GBP track assigned
      const res = await fetch("/api/admin/merchants")
      const data = await res.json()
      if (!data.success) return

      const gbpMerchants: MerchantGbpData[] = []
      for (const m of data.merchants ?? []) {
        if (!m.gbpServiceTrack || m.gbpServiceTrack === "NONE") continue
        // Fetch checklist for each GBP merchant
        const clRes = await fetch(`/api/gbp/checklist?merchantId=${m.id}`)
        const clData = await clRes.json()
        if (clData.success) {
          gbpMerchants.push({
            ...m,
            checklist: clData.checklist ?? [],
            completionPct: clData.stats?.completionPct ?? 0,
            doneItems: clData.stats?.doneItems ?? 0,
            totalItems: clData.stats?.totalItems ?? 0,
          })
        }
      }
      setMerchants(gbpMerchants)
    } catch (e) {
      console.error("[GbpOps] Load error:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMerchants() }, [loadMerchants])

  const handleCompleteItem = async (itemId: string) => {
    setCompletingItem(itemId)
    try {
      const res = await fetch("/api/gbp/checklist/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, doneByEmail: execEmail }),
      })
      const data = await res.json()
      if (data.success) await loadMerchants()
    } catch (e) {
      console.error("[GbpOps] Complete item error:", e)
    } finally {
      setCompletingItem(null)
    }
  }

  const handleAssignTrack = async (merchantId: string, track: string) => {
    setAssigningTrack(merchantId)
    try {
      const res = await fetch("/api/gbp/assign-track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, track }),
      })
      const data = await res.json()
      if (data.success) await loadMerchants()
      else alert("Error: " + (data.error ?? "Unknown"))
    } catch (e) {
      console.error("[GbpOps] Assign track error:", e)
    } finally {
      setAssigningTrack(null)
    }
  }

  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase())
    const matchesTrack = trackFilter === "ALL" || m.gbpServiceTrack === trackFilter
    return matchesSearch && matchesTrack
  })

  const sandboxWarnings = merchants.filter(
    (m) => m.gbpProfileStatus === "SANDBOX" && (m.gbpReviewCount ?? 0) >= (m.gbpReviewVelocityCap ?? 3) - 1
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-slate-400 text-sm font-medium">Loading GBP Operations Data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total GBP Clients", value: merchants.length, icon: MapPin, color: "from-indigo-500 to-purple-600" },
          { label: "Track A (New Launchpad)", value: merchants.filter(m => m.gbpServiceTrack === "TRACK_A_NEW").length, icon: Rocket, color: "from-blue-500 to-indigo-600" },
          { label: "Track B (Rank Accelerator)", value: merchants.filter(m => m.gbpServiceTrack === "TRACK_B_EXISTING").length, icon: TrendingUp, color: "from-emerald-500 to-teal-600" },
          { label: "Sandbox Warnings ⚠️", value: sandboxWarnings.length, icon: AlertTriangle, color: "from-amber-500 to-orange-600" },
        ].map((kpi, i) => (
          <Card key={i} className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.color}`} />
            <CardContent className="p-4">
              <div className="text-[11px] font-semibold text-slate-400">{kpi.label}</div>
              <div className="text-2xl font-black text-white mt-1">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sandbox Warnings */}
      {sandboxWarnings.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-bold text-sm">Sandbox Alert — Review Cap Almost Reached</p>
            <p className="text-amber-400/80 text-xs mt-1">
              {sandboxWarnings.map(m => m.name).join(", ")} — approaching weekly review limit.
              DO NOT send more review requests this week. Google Sandbox is active.
            </p>
          </div>
        </div>
      )}

      {/* Exec Email + Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2">
          {["ALL", "TRACK_A_NEW", "TRACK_B_EXISTING"].map((f) => (
            <button
              key={f}
              onClick={() => setTrackFilter(f as typeof trackFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                trackFilter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              {f === "ALL" ? "All Tracks" : f === "TRACK_A_NEW" ? "Track A" : "Track B"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Search merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-200 text-xs w-48"
          />
          <Input
            placeholder="Your exec email..."
            value={execEmail}
            onChange={(e) => setExecEmail(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-200 text-xs w-52"
          />
          <Button size="sm" variant="outline" onClick={loadMerchants} className="border-slate-700 text-slate-300">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Merchant Checklist Cards */}
      {filteredMerchants.length === 0 ? (
        <Card className="bg-slate-900/70 border-slate-800/80">
          <CardContent className="p-12 text-center">
            <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No GBP clients found.</p>
            <p className="text-slate-500 text-xs mt-1">Assign a GBP Track to merchants from the Merchants Fleet section.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMerchants.map((merchant) => {
            const trackInfo = TRACK_LABELS[merchant.gbpServiceTrack ?? "NONE"]
            const statusInfo = STATUS_CONFIG[merchant.gbpProfileStatus ?? "UNVERIFIED"]
            const isExpanded = expandedMerchant === merchant.id
            const daysSinceStart = merchant.gbpTrackStartedAt
              ? Math.floor((Date.now() - new Date(merchant.gbpTrackStartedAt).getTime()) / 86400000)
              : 0
            const isSandboxWarning = merchant.gbpProfileStatus === "SANDBOX" &&
              (merchant.gbpReviewCount ?? 0) >= (merchant.gbpReviewVelocityCap ?? 3) - 1

            return (
              <Card
                key={merchant.id}
                className={`bg-slate-900/70 border-slate-800/80 transition-all ${
                  isSandboxWarning ? "border-amber-500/40" : ""
                }`}
              >
                <CardHeader
                  className="pb-3 cursor-pointer"
                  onClick={() => setExpandedMerchant(isExpanded ? null : merchant.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-bold text-white">{merchant.name}</CardTitle>
                          {isSandboxWarning && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className={`text-[10px] px-2 py-0.5 border ${trackInfo.color}`}>
                            {trackInfo.label}
                          </Badge>
                          <Badge className={`text-[10px] px-2 py-0.5 border ${statusInfo?.color ?? ""}`}>
                            {statusInfo?.label ?? merchant.gbpProfileStatus}
                          </Badge>
                          <span className="text-[10px] text-slate-500">Day {daysSinceStart}</span>
                          {merchant.gbpReviewCount != null && (
                            <span className="text-[10px] text-slate-500">
                              {merchant.gbpReviewCount} reviews
                              {merchant.gbpReviewVelocityCap != null && ` (cap: ${merchant.gbpReviewVelocityCap}/week)`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-3">
                      <div className="hidden md:block">
                        <div className="text-xs font-bold text-white text-right">{merchant.completionPct}%</div>
                        <div className="text-[10px] text-slate-500">{merchant.doneItems}/{merchant.totalItems} tasks</div>
                      </div>
                      <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            merchant.completionPct === 100
                              ? "bg-emerald-500"
                              : merchant.completionPct >= 50
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${merchant.completionPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-3">
                    {/* Status flags */}
                    <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-800/60">
                      <span className={`text-[10px] px-2 py-1 rounded-lg border font-semibold ${merchant.gbpCitationsReady ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-slate-500 bg-slate-800/40 border-slate-700"}`}>
                        {merchant.gbpCitationsReady ? "✅" : "⬜"} NAP Citations
                      </span>
                      <span className={`text-[10px] px-2 py-1 rounded-lg border font-semibold ${merchant.gbpSurgeryCompleted ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-slate-500 bg-slate-800/40 border-slate-700"}`}>
                        {merchant.gbpSurgeryCompleted ? "✅" : "⬜"} Surgery Done
                      </span>
                      <span className={`text-[10px] px-2 py-1 rounded-lg border font-semibold ${merchant.gbpMapTrafficEnabled ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-slate-500 bg-slate-800/40 border-slate-700"}`}>
                        {merchant.gbpMapTrafficEnabled ? "✅" : "⬜"} Map Traffic On
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          loadDossiers(merchant.id)
                        }}
                        className="text-[10px] h-6 px-2.5 bg-red-950/40 border-red-800 text-red-300 hover:bg-red-900/50 flex items-center gap-1 ml-auto"
                      >
                        ⚖️ Redressal Dossiers (Atul & TCR)
                      </Button>
                    </div>

                    {/* Redressal Dossiers Drawer */}
                    {dossierMerchantId === merchant.id && (
                      <div className="bg-red-950/10 border border-red-900/40 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            Pre-Filled Google Redressal Complaints for Competitor Spam
                          </span>
                          <a
                            href="https://support.google.com/business/contact/business_redressal_form"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-red-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            Open Google Form <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {dossiers.map((d, idx) => (
                            <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs">{d.competitorName}</span>
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/30 text-[9px]">{d.violationType}</Badge>
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-1.5 rounded">
                                {d.googleMapsTitle}
                              </div>
                              <div className="text-[10px] text-emerald-400">
                                <strong>Actual Board:</strong> "{d.actualStorefrontName}"
                              </div>
                              <div className="flex gap-1.5 pt-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => copyText(d.prefilledFormFields.issueDescriptionEnglish, `adm-en-${idx}`)}
                                  className="w-full text-[10px] h-6"
                                >
                                  {copiedKey === `adm-en-${idx}` ? "Copied!" : "Copy English"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyText(d.prefilledFormFields.issueDescriptionHinglish, `adm-hi-${idx}`)}
                                  className="w-full text-[10px] h-6 border-slate-700"
                                >
                                  {copiedKey === `adm-hi-${idx}` ? "Copied!" : "Copy Hindi"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checklist grouped by week */}
                    {(() => {
                      const byWeek: Record<number, ChecklistItem[]> = {}
                      for (const item of merchant.checklist) {
                        if (!byWeek[item.week]) byWeek[item.week] = []
                        byWeek[item.week].push(item)
                      }
                      const weekLabels: Record<string, Record<number, string>> = {
                        TRACK_A_NEW: { 1: "Week 1: Pre-Verification", 2: "Week 2: Video Verification", 3: "Week 3: Sandbox Warm-Up", 4: "Week 4: Sandbox (cont.)", 5: "Weeks 5–8: Full Velocity" },
                        TRACK_B_EXISTING: { 1: "Phase 1: 90-Min Surgery (Day 1–5)", 2: "Phase 2: WhatsApp Engine (Day 6–30)", 3: "Phase 3: Map Traffic Booster (Day 31–45)" },
                      }
                      return Object.entries(byWeek).map(([week, items]) => {
                        const weekLabel = weekLabels[merchant.gbpServiceTrack ?? ""]?.[Number(week)] ?? `Week ${week}`
                        const weekDone = items.filter(i => i.isDone).length
                        return (
                          <div key={week} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-300">{weekLabel}</span>
                              <span className="text-[10px] text-slate-500">({weekDone}/{items.length})</span>
                            </div>
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                                  item.isDone
                                    ? "bg-emerald-950/30 border border-emerald-800/30"
                                    : "bg-slate-950/60 border border-slate-800/40 hover:border-slate-700"
                                }`}
                              >
                                <button
                                  onClick={() => !item.isDone && handleCompleteItem(item.id)}
                                  disabled={item.isDone || completingItem === item.id}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {completingItem === item.id ? (
                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                  ) : item.isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-slate-600 hover:text-indigo-400 transition-colors" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-medium leading-snug ${item.isDone ? "text-slate-500 line-through" : "text-slate-200"}`}>
                                    {item.taskLabel}
                                  </p>
                                  {item.isDone && item.doneAt && (
                                    <p className="text-[10px] text-emerald-600 mt-0.5">
                                      ✓ Done by {item.doneByEmail ?? "exec"} on {new Date(item.doneAt).toLocaleDateString("en-IN")}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })
                    })()}

                    {/* Map Traffic Broadcast Button (Track B only) */}
                    {merchant.gbpServiceTrack === "TRACK_B_EXISTING" && (
                      <div className="pt-3 border-t border-slate-800/60">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                          onClick={() => {
                            const offer = prompt("Enter weekend offer text (e.g., 'Aaj Chocolate Truffle pe 15% off!'):")
                            const mapsUrl = prompt("Enter Google Maps Profile URL:")
                            if (offer && mapsUrl) {
                              fetch("/api/gbp/map-traffic-broadcast", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ merchantId: merchant.id, offerText: offer, mapsProfileUrl: mapsUrl }),
                              })
                                .then(r => r.json())
                                .then(d => alert(d.success ? `✅ ${d.queued} messages queued!` : `❌ ${d.error}`))
                            }
                          }}
                        >
                          <Zap className="w-3.5 h-3.5 mr-1.5" />
                          Send Weekend Map Traffic Broadcast
                        </Button>
                      </div>
                    )}
                    {/* Weekly 3-Post Engine (1-Click Queue) */}
                    <div className="pt-4 border-t border-slate-800/80">
                      <MerchantGbpPostQueue merchantId={merchant.id} execEmail={execEmail} />
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
