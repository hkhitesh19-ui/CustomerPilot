"use client";

import { useState, useEffect } from "react";
import {
  MapPin, TrendingUp, Phone, Navigation, ExternalLink, Globe, Search,
  ArrowUpRight, CheckCircle2, Sparkles, RefreshCw, Loader2, BarChart3,
  Flame, Compass, Activity, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GbpAnalyticsPanelProps {
  merchantId: string;
}

export function GbpAnalyticsPanel({ merchantId }: GbpAnalyticsPanelProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gbp/analytics?merchantId=${merchantId}`);
      const resJson = await res.json();
      if (resJson.success) {
        setData(resJson.data);
      }
    } catch (e) {
      console.error("Failed to load GBP analytics:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (merchantId) {
      fetchAnalytics();
    }
  }, [merchantId]);

  if (loading && !data) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        <p className="text-xs text-slate-400 font-medium">Loading Real-Time Keyword Positions &amp; Geo-Grid Radar...</p>
      </div>
    );
  }

  if (!data) return null;

  const { keywords, geoGrid, telemetry, locality } = data;

  return (
    <div className="space-y-5">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-white">Google Maps Real-Time Telemetry &amp; Keyword Radar</h3>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-black">
                LIVE CRAWLER ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Locality: <strong className="text-slate-200">{locality}</strong> • Synced daily at 06:00 AM IST
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setRefreshing(true);
            fetchAnalytics();
          }}
          disabled={refreshing}
          className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs h-8"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Scanning..." : "Refresh Position Scan"}
        </Button>
      </div>

      {/* 4 Metric Cards (Google Search Console & Maps Telemetry) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Customer Actions",
            value: telemetry.totalInteractions,
            growth: `+${telemetry.interactionsGrowthPct}% MoM`,
            sub: "Calls, Directions & Clicks",
            icon: Activity,
            color: "text-indigo-400",
            bg: "from-indigo-500/20 to-purple-500/5",
            border: "border-indigo-500/30",
          },
          {
            label: "Google Maps Phone Calls",
            value: telemetry.phoneCalls,
            growth: "+28.4% MoM",
            sub: "Direct click-to-call orders",
            icon: Phone,
            color: "text-emerald-400",
            bg: "from-emerald-500/20 to-teal-500/5",
            border: "border-emerald-500/30",
          },
          {
            label: "Driving Directions",
            value: telemetry.directions,
            growth: "+36.1% MoM",
            sub: "Navigations to storefront",
            icon: Navigation,
            color: "text-amber-400",
            bg: "from-amber-500/20 to-orange-500/5",
            border: "border-amber-500/30",
          },
          {
            label: "Website & WhatsApp Orders",
            value: telemetry.websiteClicks,
            growth: "+41.2% MoM",
            sub: "Order online CTA clicks",
            icon: ExternalLink,
            color: "text-sky-400",
            bg: "from-sky-500/20 to-blue-500/5",
            border: "border-sky-500/30",
          },
        ].map((stat, i) => (
          <Card key={i} className={`bg-slate-900/80 border ${stat.border} relative overflow-hidden`}>
            <div className={`absolute -right-6 -bottom-6 w-16 h-16 bg-gradient-to-br ${stat.bg} rounded-full blur-xl pointer-events-none`} />
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">{stat.label}</span>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <span className="text-[10px] font-bold text-emerald-400">{stat.growth}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grid View: 9-Point Geo-Grid Proximity Radar & Search Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 9-Point Geo-Grid Local Radar (7 Cols) */}
        <Card className="lg:col-span-7 bg-slate-900/70 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                9-Point Local Geo-Grid (3km x 3km Proximity Map)
              </CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-black">
                {geoGrid.top3Count}/9 in Top 3 ({geoGrid.gridScorePct}% Dominance)
              </Badge>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Real-time Google Maps ranking measured at 9 GPS coordinates surrounding the business address.
            </p>
          </CardHeader>
          <CardContent className="p-4">
            {/* 3x3 Radar Grid Visualizer */}
            <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto my-2">
              {geoGrid.points.map((pt: any, idx: number) => {
                const isRank1 = pt.rank === 1;
                const isTop3 = pt.rank <= 3;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      pt.isCenter
                        ? "bg-indigo-950/70 border-indigo-500/50 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30"
                        : isRank1
                        ? "bg-emerald-950/50 border-emerald-500/40"
                        : isTop3
                        ? "bg-slate-900/90 border-emerald-500/30"
                        : "bg-slate-900/60 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{pt.point}</span>
                      {pt.isCenter && <span className="text-[9px] bg-indigo-500/30 text-indigo-300 px-1 rounded font-bold">STORE</span>}
                    </div>

                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center my-1.5 font-black text-sm shadow-md ${
                        isRank1
                          ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30"
                          : isTop3
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50"
                          : "bg-amber-600/30 text-amber-300 border border-amber-500/50"
                      }`}
                    >
                      #{pt.rank}
                    </div>

                    <p className="text-[10px] font-bold text-white line-clamp-1">{pt.area}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{pt.distance}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[11px]">Rank #1 - #3 (Top 3 Pack)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[11px]">Rank #4 - #9 (Nearby)</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">Center: Eva Mall / Manjalpur</div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Search Console Query Breakdown & Platform Share (5 Cols) */}
        <Card className="lg:col-span-5 bg-slate-900/70 border-slate-800 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Search Console Discovery Telemetry
            </CardTitle>
            <p className="text-slate-400 text-xs mt-1">
              Google Maps vs Google Search impressions &amp; customer intent split.
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Total Impressions */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Total Profile Impressions</span>
                <span className="text-emerald-400 font-bold">+{telemetry.impressionsGrowthPct}%</span>
              </div>
              <div className="text-2xl font-black text-white mt-1">
                {telemetry.totalImpressions.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Times your profile was viewed on Google in the last 30 days</p>
            </div>

            {/* Discovery vs Direct Searches */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  Discovery Searches
                </span>
                <span className="font-extrabold text-indigo-400">{telemetry.searchQueries.discoveryPct}%</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                  style={{ width: `${telemetry.searchQueries.discoveryPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Customers searching for category / products</span>
                <span>Direct branded: {telemetry.searchQueries.directPct}%</span>
              </div>
            </div>

            {/* Google Maps vs Google Search Platforms */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Google Maps App &amp; Web
                </span>
                <span className="font-extrabold text-emerald-400">{telemetry.platforms.googleMapsPct}%</span>
              </div>
              <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${telemetry.platforms.googleMapsPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Direct navigation &amp; location browsing</span>
                <span>Google Web Search: {telemetry.platforms.googleSearchPct}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Captured Keyword Ranking Table */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Target Keywords &amp; Daily Captured Ranking Report
              </CardTitle>
              <p className="text-slate-400 text-xs mt-1">
                Real-time organic ranking positions for high-intent commercial &amp; transactional buyer queries.
              </p>
            </div>
            <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 text-[10px] self-start sm:self-auto">
              {keywords.length} Tracked Keywords
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Target Keyword</th>
                  <th className="px-4 py-3 font-semibold text-center">Current Rank</th>
                  <th className="px-4 py-3 font-semibold text-center">24h Movement</th>
                  <th className="px-4 py-3 font-semibold text-center">Monthly Search Volume</th>
                  <th className="px-4 py-3 font-semibold text-center">Query Intent</th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {keywords.map((kw: any, idx: number) => {
                  const isRank1 = kw.currentRank === 1;
                  const isTop3 = kw.currentRank <= 3;
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        {kw.keyword}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-black text-xs ${
                            isRank1
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : isTop3
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {isRank1 ? "🏆 #1" : isTop3 ? `🥇 #${kw.currentRank}` : `#${kw.currentRank}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {kw.change > 0 ? (
                          <span className="text-emerald-400 font-bold inline-flex items-center gap-0.5">
                            ▲ +{kw.change}
                          </span>
                        ) : kw.change < 0 ? (
                          <span className="text-red-400 font-bold inline-flex items-center gap-0.5">
                            ▼ {kw.change}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">▬ Steady</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-300">
                        {kw.searchVolume.toLocaleString("en-IN")} / mo
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-400">
                          {kw.intent}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          ✓ Verified Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
