"use client"
// CustomerPilot — Merchant GBP Status Page
// Dashboard: /dashboard/gbp-status
// Shows merchant their current GBP journey, review velocity meter, and checklist progress.
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin, TrendingUp, Rocket, CheckCircle2, Circle, Clock,
  AlertTriangle, Star, Zap, BarChart3, Loader2, ArrowUpRight,
  Shield, Phone, Navigation, Sparkles, Calendar, Edit3, RotateCcw, Check, X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Gbp10DaySprint } from "@/components/gbp-10day-sprint"

type GbpStatus = {
  merchant: {
    id: string
    name: string
    gbpServiceTrack: string | null
    gbpProfileStatus: string | null
    gbpOnboardingWeek: number | null
    gbpReviewCount: number | null
    gbpReviewVelocityCap: number | null
    gbpTrackStartedAt: string | null
  }
  checklist: Array<{
    id: string
    week: number
    taskKey: string
    taskLabel: string
    isDone: boolean
    doneAt: string | null
  }>
  stats: {
    totalItems: number
    doneItems: number
    pendingItems: number
    completionPct: number
  }
  report?: {
    metrics: {
      mapGrid: { current: number; baseline: number; outOf: number; status: string }
      reviewGrowth: { total: number; lifetimeTotal: number }
      mapsActions: { calls: number; directions: number; gbpConnected: boolean; note: string | null }
      repeatCustomers: { count: number }
    }
  }
}

const STATUS_INFO: Record<string, { label: string; desc: string; color: string; icon: typeof Shield }> = {
  UNVERIFIED: {
    label: "Verification Pending",
    desc: "Google verification abhi baaki hai. Video verification ka wait karo.",
    color: "text-red-400",
    icon: AlertTriangle,
  },
  SANDBOX: {
    label: "Google Sandbox Mode (30 Days)",
    desc: "Profile verified hai! Abhi 30-din ka trust period chal raha hai. Reviews SLOW rakho — max 3/hafte.",
    color: "text-amber-400",
    icon: Clock,
  },
  VERIFIED: {
    label: "Fully Verified ✅",
    desc: "Profile verified aur trusted hai. Full review automation chal raha hai.",
    color: "text-blue-400",
    icon: CheckCircle2,
  },
  TOP3_LOCKED: {
    label: "🏆 Top 3 Map Pack — LOCKED!",
    desc: "Congratulations! Aapki dukan Google Maps ke Top 3 me aa gayi hai.",
    color: "text-emerald-400",
    icon: Star,
  },
}

export default function GbpStatusPage() {
  const [status, setStatus] = useState<GbpStatus | null>(null)
  const [report, setReport] = useState<GbpStatus["report"] | null>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editCaption, setEditCaption] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const reloadPosts = async (merchantId: string) => {
    try {
      const res = await fetch(`/api/gbp/posts?merchantId=${merchantId}`)
      const data = await res.json()
      const payload = data.data || data
      if ((data.ok || data.success) && payload.posts) {
        setPosts(payload.posts)
      }
    } catch (e) {
      console.error("Reload posts error:", e)
    }
  }

  const handleApprove = async (postId: string) => {
    if (!status?.merchant?.id) return
    setActionLoadingId(postId)
    try {
      const res = await fetch(`/api/gbp/posts/${postId}/approve`, { method: "POST" })
      const data = await res.json()
      if (data.success || data.ok) {
        await reloadPosts(status.merchant.id)
      } else {
        alert("Error approving post: " + (data.error || "Unknown"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (postId: string) => {
    if (!status?.merchant?.id) return
    const feedback = prompt("What would you like changed? (e.g. 'Feature fresh pastry instead' or leave blank for automatic fresh option):")
    if (feedback === null) return

    setActionLoadingId(postId)
    try {
      const res = await fetch(`/api/gbp/posts/${postId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: feedback || "Merchant requested alternative option" }),
      })
      const data = await res.json()
      if (data.success || data.ok) {
        await reloadPosts(status.merchant.id)
      } else {
        alert("Error regenerating post: " + (data.error || "Unknown"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleStartEdit = (post: any) => {
    setEditingPostId(post.id)
    setEditTitle(post.title || "")
    setEditCaption(post.caption || "")
  }

  const handleSaveEdit = async (postId: string) => {
    if (!status?.merchant?.id) return
    setActionLoadingId(postId)
    try {
      const res = await fetch(`/api/gbp/posts/${postId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, caption: editCaption }),
      })
      const data = await res.json()
      if (data.success) {
        setEditingPostId(null)
        await reloadPosts(status.merchant.id)
      } else {
        alert("Error saving edits: " + (data.error || "Unknown"))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch merchant GBP checklist
        const meRes = await fetch("/api/auth/me")
        const meData = await meRes.json()
        if ((!meData.success && !meData.ok) || !meData.merchant?.id) return

        const merchantId = meData.merchant.id

        const [clRes, rpRes, postsRes] = await Promise.all([
          fetch(`/api/gbp/checklist?merchantId=${merchantId}`),
          fetch(`/api/gbp/monthly-report?merchantId=${merchantId}`),
          fetch(`/api/gbp/posts?merchantId=${merchantId}`),
        ])

        const clData = await clRes.json()
        const rpData = await rpRes.json()
        const postsData = await postsRes.json()

        const checklistPayload = clData.data || clData
        if ((clData.ok || clData.success) && checklistPayload.merchant) {
          setStatus({
            merchant: checklistPayload.merchant,
            checklist: checklistPayload.checklist || [],
            stats: checklistPayload.stats || {
              totalItems: 0,
              doneItems: 0,
              pendingItems: 0,
              completionPct: 0,
            },
          })
        }
        const reportPayload = rpData.data || rpData
        if ((rpData.ok || rpData.success) && reportPayload.metrics) {
          setReport({ metrics: reportPayload.metrics })
        }
        const postsPayload = postsData.data || postsData
        if ((postsData.ok || postsData.success) && postsPayload.posts) {
          setPosts(postsPayload.posts)
        }
      } catch (e) {
        console.error("[GbpStatus] Load error:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!status || !status.merchant.gbpServiceTrack || status.merchant.gbpServiceTrack === "NONE") {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <Card className="bg-slate-900/70 border-slate-800/80 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-white font-bold text-lg mb-2">GBP Service Not Active</h2>
            <p className="text-slate-400 text-sm">
              Aapke account mein abhi GBP Rank Service activate nahi hui hai.
              CustomerPilot se contact karein: <strong className="text-indigo-400">support@customerpilot.in</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { merchant, checklist, stats } = status
  const profileStatus = merchant.gbpProfileStatus ?? "UNVERIFIED"
  const statusInfo = STATUS_INFO[profileStatus] ?? STATUS_INFO.UNVERIFIED
  const StatusIcon = statusInfo.icon
  const isTrackA = merchant.gbpServiceTrack === "TRACK_A_NEW"
  const daysSinceStart = merchant.gbpTrackStartedAt
    ? Math.floor((Date.now() - new Date(merchant.gbpTrackStartedAt).getTime()) / 86400000)
    : 0
  const reviewsUsed = merchant.gbpReviewCount ?? 0
  const reviewsCap = merchant.gbpReviewVelocityCap ?? 3
  const velocityPct = Math.min(100, Math.round((reviewsUsed % reviewsCap) / reviewsCap * 100))

  // Group checklist by week
  const byWeek: Record<number, typeof checklist> = {}
  for (const item of checklist) {
    if (!byWeek[item.week]) byWeek[item.week] = []
    byWeek[item.week].push(item)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <MapPin className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-white font-extrabold text-xl">Google Maps Ranking Journey</h1>
          <p className="text-slate-400 text-xs">
            {isTrackA ? "New Business Launchpad" : "Top 3 Rank Accelerator"} — Day {daysSinceStart}
          </p>
        </div>
      </div>

      {/* 10-Day Local Top 3 Acceleration Sprint */}
      <Gbp10DaySprint
        merchantId={merchant.id}
        merchantName={merchant.name}
        currentRank={10}
        targetRank={3}
        locality="Eva The Mall, Manjalpur, Vadodara"
      />

      {/* Profile Status Card */}
      <Card className="bg-slate-900/70 border-slate-800/80">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-slate-950/80 border border-slate-800`}>
              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-extrabold ${statusInfo.color}`}>{statusInfo.label}</div>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{statusInfo.desc}</p>

              {/* Google Sandbox warning */}
              {profileStatus === "SANDBOX" && (
                <div className="mt-3 bg-amber-900/20 border border-amber-500/30 rounded-xl p-3">
                  <p className="text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Review Cap Active This Week
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Reviews used this week</span>
                      <span className="text-amber-300 font-bold">{reviewsUsed % reviewsCap}/{reviewsCap}</span>
                    </div>
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${velocityPct >= 80 ? "bg-red-500" : "bg-amber-500"}`}
                        style={{ width: `${velocityPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-semibold">Overall Journey Progress</span>
              <span className="text-white font-bold">{stats.completionPct}%</span>
            </div>
            <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stats.completionPct === 100 ? "bg-emerald-500" :
                  stats.completionPct >= 50 ? "bg-blue-500" : "bg-amber-500"
                }`}
                style={{ width: `${stats.completionPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{stats.doneItems} tasks complete</span>
              <span>{stats.pendingItems} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Report — 4 Numbers */}
      {report?.metrics && (
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Map Grid Score",
              value: `${report.metrics.mapGrid.current}/9`,
              sub: `Started at ${report.metrics.mapGrid.baseline}/9`,
              icon: MapPin,
              color: "from-indigo-500 to-purple-600",
              textColor: "text-indigo-400",
            },
            {
              label: "Reviews This Month",
              value: `+${report.metrics.reviewGrowth.total}`,
              sub: `${report.metrics.reviewGrowth.lifetimeTotal} total all-time`,
              icon: Star,
              color: "from-amber-500 to-orange-600",
              textColor: "text-amber-400",
            },
            {
              label: "Maps Calls",
              value: report.metrics.mapsActions.gbpConnected ? String(report.metrics.mapsActions.calls) : "—",
              sub: report.metrics.mapsActions.gbpConnected ? "from Google Maps" : "Connect GBP to see",
              icon: Phone,
              color: "from-emerald-500 to-teal-600",
              textColor: "text-emerald-400",
            },
            {
              label: "Repeat Customers",
              value: String(report.metrics.repeatCustomers.count),
              sub: "this month (loyalty)",
              icon: TrendingUp,
              color: "from-blue-500 to-cyan-600",
              textColor: "text-blue-400",
            },
          ].map((metric, i) => (
            <Card key={i} className="bg-slate-900/70 border-slate-800/80 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${metric.color}`} />
              <CardContent className="p-4">
                <div className="text-[10px] font-semibold text-slate-400">{metric.label}</div>
                <div className={`text-2xl font-black mt-1 ${metric.textColor}`}>{metric.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{metric.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Weekly Automated Google Updates Card */}
      <Card className="bg-slate-900/70 border-slate-800/80">
        <CardHeader className="border-b border-slate-800/60 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Weekly Google Business Updates (Zero-Touch Auto Engine)
            </CardTitle>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px]">
              3 Posts / Week
            </Badge>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            CustomerPilot automatically generates and publishes 3 high-converting updates every week to keep your Google Maps profile active and ranking at the top.
          </p>
        </CardHeader>
        <CardContent className="p-4">
          {posts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              Your weekly Google posts are scheduled and will appear here shortly.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {posts.map((post: any) => {
                const isPosted = post.status === "POSTED"
                const isApproved = post.status === "APPROVED"
                const isAwaiting = post.status === "AWAITING_APPROVAL"
                const isEditing = editingPostId === post.id
                const isLoading = actionLoadingId === post.id
                const dateStr = new Date(post.scheduledDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short"
                })
                const badgeText = post.postType === "PRODUCT_SPOTLIGHT" ? "Tuesday • Product Spotlight" :
                  post.postType === "SOCIAL_PROOF" ? "Thursday • 5-Star Social Proof" : "Saturday • Weekend Offer"

                return (
                  <div key={post.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {badgeText}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          isPosted ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
                          isApproved ? "text-blue-400 bg-blue-500/10 border-blue-500/30" :
                          "text-amber-400 bg-amber-500/10 border-amber-500/30"
                        }`}>
                          {isPosted ? "✓ Live on Maps" : isApproved ? "✓ Approved by You" : "⏳ Awaiting Approval"}
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-slate-800 relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.imageUrl} alt={post.title || "GBP Post"} className="w-full h-32 object-cover" loading="lazy" />
                        {post.revisionCount > 0 && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-amber-300 px-1.5 py-0.5 rounded border border-slate-700">
                            Rev #{post.revisionCount}
                          </span>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 pt-1">
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-semibold">Post Title</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-semibold">Caption</label>
                            <textarea
                              rows={4}
                              value={editCaption}
                              onChange={(e) => setEditCaption(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(post.id)}
                              disabled={isLoading}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 flex-1"
                            >
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPostId(null)}
                              className="border-slate-700 text-slate-400 text-xs h-7"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {post.title && <div className="text-xs font-bold text-white line-clamp-1">{post.title}</div>}
                          <p className="text-[11px] text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                            {post.caption}
                          </p>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/60">
                        <div className="text-[10px] text-slate-400 flex justify-between items-center">
                          <span>Scheduled: <strong className="text-slate-200">{dateStr}</strong></span>
                          <span className="font-semibold text-indigo-400">CTA: {post.ctaType || "INFO"}</span>
                        </div>

                        {!isPosted && (
                          <div className="space-y-1.5">
                            {isAwaiting && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(post.id)}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold h-7"
                              >
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                                Approve for Google Maps
                              </Button>
                            )}

                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartEdit(post)}
                                className="flex-1 border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-[11px] h-7"
                              >
                                <Edit3 className="w-3 h-3 mr-1 text-slate-400" />
                                Edit Text
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(post.id)}
                                disabled={isLoading}
                                className="flex-1 border-slate-700 bg-slate-900 text-amber-400 hover:text-amber-300 text-[11px] h-7"
                                title="Reject and regenerate a fresh alternative"
                              >
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                                Reject &amp; New
                              </Button>
                            </div>
                          </div>
                        )}

                        {isApproved && (
                          <div className="text-[10px] text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-800/40 text-center font-medium">
                            ✓ Post approved! Will be uploaded on {dateStr}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist — Read-only for merchant */}
      <Card className="bg-slate-900/70 border-slate-800/80">
        <CardHeader className="border-b border-slate-800/60 pb-4">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Your Ranking Journey Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {Object.entries(byWeek).map(([week, items]) => {
            const weekDone = items.filter(i => i.isDone).length
            return (
              <div key={week} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-300">
                    {isTrackA ? `Week ${week}` : `Phase ${week}`}
                  </span>
                  <span className="text-[10px] text-slate-500">({weekDone}/{items.length} complete)</span>
                </div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl ${
                      item.isDone
                        ? "bg-emerald-950/20 border border-emerald-800/20"
                        : "bg-slate-950/40 border border-slate-800/30"
                    }`}
                  >
                    {item.isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-xs leading-snug ${item.isDone ? "text-slate-500" : "text-slate-300"}`}>
                      {item.taskLabel}
                    </p>
                  </div>
                ))}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
