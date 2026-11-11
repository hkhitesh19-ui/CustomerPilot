"use client";
import { GbpAuditReportsTab } from "@/components/gbp-audit-reports-tab";



// CustomerPilot — Merchant GMB Optimization Command Studio

// Dashboard: /dashboard/gbp-status

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import {

  MapPin, TrendingUp, Rocket, CheckCircle2, Circle, Clock,

  AlertTriangle, Star, Zap, BarChart3, Loader2, ArrowUpRight,

  Shield, Phone, Navigation, Sparkles, Calendar, Edit3, RotateCcw,

  Check, X, Compass, Palette, Camera

} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { Gbp10DaySprint } from "@/components/gbp-10day-sprint";

import { GbpAnalyticsPanel } from "@/components/gbp-analytics-panel";

import { GbpPostCardItem } from "@/components/gbp-post-card-item";

import { Gbp30DayMasterChecklist } from "@/components/super-admin/gbp-30day-master-checklist";



type GbpStatus = {

  merchant: {

    id: string;

    name: string;

    gbpServiceTrack: string | null;

    gbpProfileStatus: string | null;

    gbpOnboardingWeek: number | null;

    gbpReviewCount: number | null;

    gbpReviewVelocityCap: number | null;

    gbpTrackStartedAt: string | null;

    address?: string | null;

    city?: string | null;

  };

  checklist: Array<{

    id: string;

    week: number;

    taskKey: string;

    taskLabel: string;

    isDone: boolean;

    doneAt: string | null;

  }>;

  stats: {

    totalItems: number;

    doneItems: number;

    pendingItems: number;

    completionPct: number;

  };

  report?: {

    metrics: {

      mapGrid: { current: number; baseline: number; outOf: number; status: string };

      reviewGrowth: { total: number; lifetimeTotal: number };

      mapsActions: { calls: number; directions: number; gbpConnected: boolean; note: string | null };

      repeatCustomers: { count: number };

    };

  };

};



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

};



export default function GbpStatusPage() {

  const [status, setStatus] = useState<GbpStatus | null>(null);

  const [report, setReport] = useState<GbpStatus["report"] | null>(null);

  const [posts, setPosts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"posts" | "analytics" | "sprint" | "reports">("posts");

  const router = useRouter();



  const reloadPosts = async (merchantId: string) => {

    try {

      const res = await fetch(`/api/gbp/posts?merchantId=${merchantId}`);

      const data = await res.json();

      const payload = data.data || data;

      if ((data.ok || data.success) && payload.posts) {

        setPosts(payload.posts);

      }

    } catch (e) {

      console.error("Reload posts error:", e);

    }

  };



  useEffect(() => {

    const load = async () => {

      try {

        const meRes = await fetch("/api/auth/me");

        const meData = await meRes.json();

        if ((!meData.success && !meData.ok) || !meData.merchant?.id) return;



        const merchantId = meData.merchant.id;



        const [clRes, rpRes, postsRes] = await Promise.all([

          fetch(`/api/gbp/checklist?merchantId=${merchantId}`),

          fetch(`/api/gbp/monthly-report?merchantId=${merchantId}`),

          fetch(`/api/gbp/posts?merchantId=${merchantId}`),

        ]);



        const clData = await clRes.json();

        const rpData = await rpRes.json();

        const postsData = await postsRes.json();



        const checklistPayload = clData.data || clData;

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

          });

        }

        const reportPayload = rpData.data || rpData;

        if ((rpData.ok || rpData.success) && reportPayload.metrics) {

          setReport({ metrics: reportPayload.metrics });

        }

        const postsPayload = postsData.data || postsData;

        if ((postsData.ok || postsData.success) && postsPayload.posts) {

          setPosts(postsPayload.posts);

        }

      } catch (e) {

        console.error("[GbpStatus] Load error:", e);

      } finally {

        setLoading(false);

      }

    };

    load();

  }, []);



  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 flex items-center justify-center">

        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />

      </div>

    );

  }



  if (!status || !status.merchant.gbpServiceTrack || status.merchant.gbpServiceTrack === "NONE") {

    return (

      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">

        <Card className="bg-slate-900/70 border-slate-800/80 max-w-md w-full">

          <CardContent className="p-8 text-center">

            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />

            <h2 className="text-white font-bold text-lg mb-2">GBP Service Not Active</h2>

            <p className="text-slate-400 text-sm">

              Aapke account mein abhi GMB Optimization Service activate nahi hui hai.

              CustomerPilot se contact karein: <strong className="text-indigo-400">support@customerpilot.in</strong>

            </p>

          </CardContent>

        </Card>

      </div>

    );

  }



  const { merchant, checklist, stats } = status;

  const profileStatus = merchant.gbpProfileStatus ?? "UNVERIFIED";

  const statusInfo = STATUS_INFO[profileStatus] ?? STATUS_INFO.UNVERIFIED;

  const StatusIcon = statusInfo.icon;

  const isTrackA = merchant.gbpServiceTrack === "TRACK_A_NEW";

  const daysSinceStart = merchant.gbpTrackStartedAt

    ? Math.floor((Date.now() - new Date(merchant.gbpTrackStartedAt).getTime()) / 86400000)

    : 0;

  const reviewsUsed = merchant.gbpReviewCount ?? 0;

  const reviewsCap = merchant.gbpReviewVelocityCap ?? 3;

  const velocityPct = Math.min(100, Math.round(((reviewsUsed % reviewsCap) / reviewsCap) * 100));



  // Group checklist by week

  const byWeek: Record<number, typeof checklist> = {};

  for (const item of checklist) {

    if (!byWeek[item.week]) byWeek[item.week] = [];

    byWeek[item.week].push(item);

  }



  return (

    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 p-4 md:p-6 space-y-5 max-w-5xl mx-auto">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-md">

            <MapPin className="w-6 h-6 text-indigo-400" />

          </div>

          <div>

            <div className="flex items-center gap-2">

              <h1 className="text-white font-extrabold text-xl">GMB Optimization Command Studio</h1>

              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-black">

                {isTrackA ? "TRACK A • NEW LAUNCHPAD" : "TRACK B • TOP 3 ACCELERATOR"}

              </Badge>

            </div>

            <p className="text-slate-400 text-xs mt-0.5">

              {merchant.name} • Ranking Journey: Day {daysSinceStart}

            </p>

          </div>

        </div>



        {/* Tab Switcher */}

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">

          <button

            onClick={() => setActiveTab("posts")}

            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${

              activeTab === "posts"

                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"

                : "text-slate-400 hover:text-white"

            }`}

          >

            <Sparkles className="w-3.5 h-3.5" />

            1. Weekly 3-Post Engine ({posts.length})

          </button>

          <button

            onClick={() => setActiveTab("analytics")}

            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${

              activeTab === "analytics"

                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"

                : "text-slate-400 hover:text-white"

            }`}

          >

            <Compass className="w-3.5 h-3.5" />

            2. Keywords &amp; Geo-Grid

          </button>

          <button

            onClick={() => setActiveTab("sprint")}

            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${

              activeTab === "sprint"

                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"

                : "text-slate-400 hover:text-white"

            }`}

          >

            <CheckCircle2 className="w-3.5 h-3.5" />

            3. Sprint &amp; Checklist

          </button>

        </div>

      </div>



      {/* TAB 4: Audit & Monthly Reports (Day 0 & 30-Day Calendar Proofs) */}
      {activeTab === "reports" && (
        <GbpAuditReportsTab
          merchantId={merchant.id}
          merchantName={merchant.name}
        />
      )}

      {/* TAB 1: Weekly 3-Post Engine */}

      {activeTab === "posts" && (

        <div className="space-y-4">

          <Card className="bg-slate-900/70 border-slate-800/80">

            <CardHeader className="border-b border-slate-800/60 pb-3">

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

                View auto-generated updates, edit caption copy, 🎨 regenerate card images if you want a fresh design, customize weekday/time schedule, and approve for auto-posting.

              </p>

            </CardHeader>

            <CardContent className="p-4">

              {posts.length === 0 ? (

                <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">

                  <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />

                  Your weekly Google posts are scheduled and will appear here shortly.

                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {posts.map((post) => (

                    <GbpPostCardItem

                      key={post.id}

                      post={post}

                      onPostUpdated={() => reloadPosts(merchant.id)}

                    />

                  ))}

                </div>

              )}

            </CardContent>

          </Card>

        </div>

      )}



      {/* TAB 2: Keywords & 9-Point Geo-Grid Telemetry */}

      {activeTab === "analytics" && (

        <div className="space-y-4">

          <GbpAnalyticsPanel merchantId={merchant.id} />

        </div>

      )}



      {/* TAB 3: 10-Day Sprint & SOP Checklist */}

      {activeTab === "sprint" && (

        <div className="space-y-5">

          {/* 30-Day Master Execution Sprint Checklist */}

          <Gbp30DayMasterChecklist

            merchantName={merchant.name}

            currentReviews={merchant.gbpReviewCount || 689}

            targetKeyword="cake shop in Manjalpur"

          />



          {/* 10-Day Local Top 3 Acceleration Sprint */}

          <Gbp10DaySprint

            merchantId={merchant.id}

            merchantName={merchant.name}

            currentRank={10}

            targetRank={3}

            locality={merchant.address || "Vadodara"}

          />



          {/* Profile Status Card */}

          <Card className="bg-slate-900/70 border-slate-800/80">

            <CardContent className="p-5">

              <div className="flex items-start gap-4">

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">

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

                          <span className="text-amber-300 font-bold">

                            {reviewsUsed % reviewsCap}/{reviewsCap}

                          </span>

                        </div>

                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">

                          <div

                            className={`h-full rounded-full transition-all ${

                              velocityPct >= 80 ? "bg-red-500" : "bg-amber-500"

                            }`}

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

                      stats.completionPct === 100

                        ? "bg-emerald-500"

                        : stats.completionPct >= 50

                        ? "bg-blue-500"

                        : "bg-amber-500"

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



          {/* Checklist */}

          <Card className="bg-slate-900/70 border-slate-800/80">

            <CardHeader className="border-b border-slate-800/60 pb-4">

              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">

                <CheckCircle2 className="w-4 h-4 text-emerald-400" />

                Your Ranking Journey Checklist

              </CardTitle>

            </CardHeader>

            <CardContent className="p-4 space-y-4">

              {Object.entries(byWeek).map(([week, items]) => {

                const weekDone = items.filter((i) => i.isDone).length;

                return (

                  <div key={week} className="space-y-2">

                    <div className="flex items-center gap-2">

                      <span className="text-[11px] font-bold text-slate-300">

                        {isTrackA ? `Week ${week}` : `Phase ${week}`}

                      </span>

                      <span className="text-[10px] text-slate-500">

                        ({weekDone}/{items.length} complete)

                      </span>

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

                );

              })}

            </CardContent>

          </Card>

        </div>

      )}

    </div>

  );

}

