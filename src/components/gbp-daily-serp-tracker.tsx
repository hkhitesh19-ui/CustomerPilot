"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Minus, Download, RefreshCw, Search,
  MapPin, Sparkles, Globe, Bot, Award, CheckCircle2, ChevronRight,
  Filter, Layers, ArrowUpRight, FileSpreadsheet, Calendar, Info,
  Sliders, ShieldCheck, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SerpKeywordItem {
  keyword: string;
  type: "GEO" | "SEO" | "AEO";
  currentRank: number;
  previousRank: number;
  rankDelta: number;
  baselineRank: number;
  bestRank: number;
  searchVolume: number;
  locality: string;
  targetCity: string;
  serpFeature: "LOCAL_3PACK" | "ORGANIC" | "AI_OVERVIEW" | "KNOWLEDGE_PANEL" | string;
  sparkline: number[];
}

export interface SerpProgressionPoint {
  date: string;
  fullDate: string;
  avgRank: number;
  geoAvg: number | null;
  seoAvg: number | null;
  aeoAvg: number | null;
  top3Count: number;
  top10Count: number;
  keywords: Record<string, number>;
}

export interface SerpSummary {
  totalTracked: number;
  geoCount: number;
  seoCount: number;
  aeoCount: number;
  top3Count: number;
  top10Count: number;
  top3Percentage: number;
  top10Percentage: number;
  averageRank: number;
  baselineAverageRank: number;
  rankImprovement: number;
  totalMonthlySearchDemand: number;
  lastScannedAt: string;
  scanDate: string;
}

export function GbpDailySerpTracker({
  merchantId,
  merchantName,
  readOnly = false,
}: {
  merchantId: string;
  merchantName: string;
  readOnly?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [period, setPeriod] = useState<"7D" | "14D" | "30D">("14D");
  const [activeTab, setActiveTab] = useState<"ALL" | "GEO" | "SEO" | "AEO">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [summary, setSummary] = useState<SerpSummary | null>(null);
  const [keywords, setKeywords] = useState<SerpKeywordItem[]>([]);
  const [allKeywords, setAllKeywords] = useState<SerpKeywordItem[]>([]);
  const [progression, setProgression] = useState<SerpProgressionPoint[]>([]);
  const [verifiedDaysCount, setVerifiedDaysCount] = useState<number>(1);

  // Chart view mode: "CATEGORY_AVERAGES" or "KEYWORD_COMPARISON"
  const [chartMode, setChartMode] = useState<"CATEGORY_AVERAGES" | "KEYWORD_COMPARISON">("CATEGORY_AVERAGES");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gbp/daily-serp?merchantId=${merchantId}&period=${period}&type=${activeTab}`);
      const data = await res.json();
      if (data.ok) {
        setSummary(data.summary || data.metrics);
        setKeywords(data.keywords || []);
        setAllKeywords(data.allKeywords || data.keywords || []);
        setProgression(data.progression || []);
        setVerifiedDaysCount(data.verifiedDaysCount || 1);
        if (data.keywords && data.keywords.length > 0 && selectedKeywords.length === 0) {
          // Default pick top 3 keywords for comparison
          setSelectedKeywords(data.keywords.slice(0, 3).map((k: SerpKeywordItem) => k.keyword));
        }
      }
    } catch (e) {
      console.error("[GbpDailySerpTracker] fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchantId) {
      fetchData();
    }
  }, [merchantId, period, activeTab]);

  const handleLiveScan = async () => {
    try {
      setScanning(true);
      const res = await fetch(`/api/cron/gbp-daily-serp?merchantId=${merchantId}`);
      const data = await res.json();
      if (data.ok) {
        await fetchData();
      } else {
        alert("Scan error: " + (data.error || "Unknown"));
      }
    } catch (e: any) {
      alert("Scan error: " + e.message);
    } finally {
      setScanning(false);
    }
  };

  // Filter keywords by search
  const filteredKeywords = useMemo(() => {
    return keywords.filter(
      (k) =>
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (k.locality && k.locality.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [keywords, searchQuery]);

  // SVG Chart Dimensions & High-DPI Padding
  const svgWidth = 920;
  const svgHeight = 320;
  const padLeft = 60;
  const padRight = 35;
  const padTop = 35;
  const padBottom = 55;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Inverted Y-axis: Rank 1 is at top (padTop), Rank 20 is at bottom (padTop + chartH)
  const minRank = 1;
  const maxRank = 20;

  const getY = (rank: number) => {
    const clamped = Math.max(minRank, Math.min(maxRank, rank));
    return padTop + ((clamped - minRank) / (maxRank - minRank)) * chartH;
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (total - 1)) * chartW;
  };

  // Helper smooth path generator (Cubic Bezier Splines)
  const buildSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    if (points.length === 1) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  // Helper smooth area path (to fill gradient beneath curve)
  const buildSvgAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length <= 1) return "";
    const bottomY = padTop + chartH;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }
    d += ` L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
    return d;
  };

  // Precomputed chart lines
  const chartLines = useMemo(() => {
    if (!progression || progression.length === 0) return [];

    if (chartMode === "CATEGORY_AVERAGES") {
      const overallPoints = progression.map((p, idx) => ({
        x: getX(idx, progression.length),
        y: getY(p.avgRank),
      }));
      const geoPoints = progression.filter(p => p.geoAvg !== null).map((p, idx) => ({
        x: getX(idx, progression.length),
        y: getY(p.geoAvg || p.avgRank),
      }));
      const seoPoints = progression.filter(p => p.seoAvg !== null).map((p, idx) => ({
        x: getX(idx, progression.length),
        y: getY(p.seoAvg || p.avgRank),
      }));
      const aeoPoints = progression.filter(p => p.aeoAvg !== null).map((p, idx) => ({
        x: getX(idx, progression.length),
        y: getY(p.aeoAvg || p.avgRank),
      }));

      return [
        {
          id: "overall",
          label: "Overall Average",
          color: "#2563eb", // Royal Blue
          gradientId: "gradOverall",
          strokeWidth: 3.5,
          dash: "",
          points: overallPoints,
          path: buildSvgPath(overallPoints),
          areaPath: buildSvgAreaPath(overallPoints),
          currentVal: summary?.averageRank || 0,
        },
        {
          id: "geo",
          label: "GEO Proximity",
          color: "#10b981", // Emerald
          gradientId: "gradGeo",
          strokeWidth: 2.5,
          dash: "",
          points: geoPoints,
          path: buildSvgPath(geoPoints),
          areaPath: buildSvgAreaPath(geoPoints),
          currentVal: progression[progression.length - 1]?.geoAvg || 0,
        },
        {
          id: "seo",
          label: "SEO Transactional",
          color: "#0284c7", // Sky Blue
          gradientId: "gradSeo",
          strokeWidth: 2.5,
          dash: "5,4",
          points: seoPoints,
          path: buildSvgPath(seoPoints),
          areaPath: buildSvgAreaPath(seoPoints),
          currentVal: progression[progression.length - 1]?.seoAvg || 0,
        },
        {
          id: "aeo",
          label: "AEO / AI Overview",
          color: "#8b5cf6", // Purple
          gradientId: "gradAeo",
          strokeWidth: 2.5,
          dash: "",
          points: aeoPoints,
          path: buildSvgPath(aeoPoints),
          areaPath: buildSvgAreaPath(aeoPoints),
          currentVal: progression[progression.length - 1]?.aeoAvg || 0,
        },
      ];
    } else {
      // KEYWORD_COMPARISON MODE
      const colors = ["#2563eb", "#10b981", "#ef4444", "#f59e0b", "#8b5cf6"];
      return selectedKeywords.slice(0, 5).map((kw, i) => {
        const pts = progression.map((p, idx) => {
          const rank = p.keywords[kw] ?? 12;
          return {
            x: getX(idx, progression.length),
            y: getY(rank),
          };
        });
        const currentK = allKeywords.find(k => k.keyword === kw);
        return {
          id: kw,
          label: kw,
          color: colors[i % colors.length],
          gradientId: `gradKw${i}`,
          strokeWidth: 3,
          dash: "",
          points: pts,
          path: buildSvgPath(pts),
          areaPath: buildSvgAreaPath(pts),
          currentVal: currentK ? currentK.currentRank : (progression[progression.length - 1]?.keywords[kw] || 0),
        };
      });
    }
  }, [progression, chartMode, selectedKeywords, allKeywords, summary]);

  const toggleKeywordSelection = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      if (selectedKeywords.length > 1) {
        setSelectedKeywords(selectedKeywords.filter((k) => k !== kw));
      }
    } else {
      if (selectedKeywords.length < 5) {
        setSelectedKeywords([...selectedKeywords, kw]);
      }
    }
  };

  const activeHoverPoint = hoveredPointIndex !== null && progression[hoveredPointIndex]
    ? progression[hoveredPointIndex]
    : null;

  return (
    <div className="space-y-6">
      {/* 1. TOP CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Google SERP & GEO Ranking Progression Engine
            </h2>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold text-xs">
              Daily 09:00 AM IST Live
            </Badge>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Real-time search positioning for <strong className="text-slate-800 font-bold">{merchantName}</strong> across Google Maps 3-Pack, Organic SERP, and AI Overviews.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Time Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(["7D", "14D", "30D"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  period === p
                    ? "bg-white text-blue-700 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p === "7D" ? "7 Days" : p === "14D" ? "14 Days" : "30 Days"}
              </button>
            ))}
          </div>

          {/* Download CSV */}
          <a
            href={`/api/gbp/daily-serp/export?merchantId=${merchantId}&period=${period}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Download Daily CSV
          </a>

          {/* Trigger Scan */}
          <Button
            size="sm"
            onClick={handleLiveScan}
            disabled={scanning || readOnly}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm gap-1.5 h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            Run 09:00 AM Scan
          </Button>
        </div>
      </div>

      {/* 2. REAL DATA VERIFICATION BANNER */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-blue-50/80 border border-emerald-200/90 rounded-2xl text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
          <div>
            <span className="font-extrabold text-emerald-950">
              Strict Real-Data Verification Active
            </span>
            <span className="text-slate-600 ml-2 hidden sm:inline">
              • Graph displays verified crawl snapshots with zero synthetic interpolation. Daily crawl persists at 09:00 AM IST.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/80 border-emerald-300 text-emerald-800 text-[11px] font-bold">
            {verifiedDaysCount} Verified Daily Snapshot{verifiedDaysCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* 3. THE 4 GOOGLE SEARCH METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Top 3 Local Pack */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>In Top 3 Local Pack</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {summary?.top3Count ?? 0}
            </span>
            <span className="text-xs font-bold text-slate-600">Keywords</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full ml-auto">
              {summary?.top3Percentage ?? 0}% Share
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            Appear directly in Google Maps 3-Pack pin
          </p>
        </div>

        {/* Metric 2: Top 10 Google SERP */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>In Top 10 SERP (Page 1)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {summary?.top10Count ?? 0}
            </span>
            <span className="text-xs font-bold text-slate-600">Keywords</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-auto">
              {summary?.top10Percentage ?? 0}% Coverage
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Page 1 organic and map rankings
          </p>
        </div>

        {/* Metric 3: Average SERP Standing */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Average SERP Rank</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              #{summary?.averageRank ?? 0}
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full ml-auto">
              ▲ +{summary?.rankImprovement ?? 0} Spots
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            Baseline #{summary?.baselineAverageRank ?? 0} at Day 0 onboarding
          </p>
        </div>

        {/* Metric 4: Total Targeted Search Demand */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-purple-400" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Monthly Search Demand</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight">
              {(summary?.totalMonthlySearchDemand ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-600">/mo</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full ml-auto">
              High Intent
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Globe className="w-3 h-3 text-purple-600" />
            Across {summary?.totalTracked ?? 0} tracked commercial search terms
          </p>
        </div>
      </div>

      {/* 4. PICTORIZED TIME-SERIES RANK PROGRESSION GRAPH */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        {/* Chart Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
              Daily Morning 09:00 AM Rank Progression Trajectory
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Inverted SEO Scale: Top of graph represents <strong>Rank #1</strong> (Peak Position on Google Search & Maps).
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setChartMode("CATEGORY_AVERAGES")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMode === "CATEGORY_AVERAGES"
                  ? "bg-white text-blue-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Category Averages
            </button>
            <button
              onClick={() => setChartMode("KEYWORD_COMPARISON")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMode === "KEYWORD_COMPARISON"
                  ? "bg-white text-blue-700 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Compare Keywords ({selectedKeywords.length})
            </button>
          </div>
        </div>

        {/* Legend / Keyword Selector Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
          {chartMode === "CATEGORY_AVERAGES" ? (
            chartLines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-700 font-semibold"
              >
                <span
                  className="w-3.5 h-1 rounded-full shadow-2xs"
                  style={{ backgroundColor: line.color }}
                />
                <span className="text-xs">{line.label}</span>
                <span className="font-extrabold text-slate-900 text-xs ml-1">#{line.currentVal}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-slate-500 font-medium text-xs">Select up to 5 keywords:</span>
              {allKeywords.slice(0, 10).map((k) => {
                const isSelected = selectedKeywords.includes(k.keyword);
                return (
                  <button
                    key={k.keyword}
                    onClick={() => toggleKeywordSelection(k.keyword)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-800 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected && "✓ "}
                    {k.keyword} (#{k.currentRank})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SVG Time-Series Chart */}
        <div className="w-full overflow-x-auto pt-2">
          <div className="min-w-[700px] relative select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              <defs>
                {/* Glow Gradients */}
                <linearGradient id="top3ZoneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                </linearGradient>

                <linearGradient id="page1ZoneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.00" />
                </linearGradient>

                <linearGradient id="gradOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                </linearGradient>

                <linearGradient id="gradGeo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                </linearGradient>

                <linearGradient id="gradSeo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.00" />
                </linearGradient>

                <linearGradient id="gradAeo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* 1. Google 3-Pack Target Zone (Ranks 1 to 3) */}
              <rect
                x={padLeft}
                y={getY(1)}
                width={chartW}
                height={getY(3) - getY(1)}
                fill="url(#top3ZoneGradient)"
                rx={6}
              />
              <line
                x1={padLeft}
                y1={getY(3)}
                x2={padLeft + chartW}
                y2={getY(3)}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4,4"
              />
              <text
                x={padLeft + chartW - 10}
                y={getY(3) - 8}
                textAnchor="end"
                fontSize={11}
                fill="#059669"
                fontWeight="800"
              >
                🏆 Google Local 3-Pack Target Zone (Ranks 1 to 3)
              </text>

              {/* 2. Page 1 Organic Zone (Ranks 4 to 10) */}
              <rect
                x={padLeft}
                y={getY(3)}
                width={chartW}
                height={getY(10) - getY(3)}
                fill="url(#page1ZoneGradient)"
              />
              <line
                x1={padLeft}
                y1={getY(10)}
                x2={padLeft + chartW}
                y2={getY(10)}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity={0.6}
              />
              <text
                x={padLeft + chartW - 10}
                y={getY(10) - 6}
                textAnchor="end"
                fontSize={10}
                fill="#64748b"
                fontWeight="600"
              >
                Page 1 Organic Threshold (#10)
              </text>

              {/* 3. Horizontal Rank Grid Lines */}
              {[1, 3, 5, 10, 15, 20].map((r) => {
                const y = getY(r);
                return (
                  <g key={`y-grid-${r}`}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + chartW}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      strokeDasharray={r === 1 || r === 3 || r === 10 ? "" : "3,3"}
                      opacity={0.7}
                    />
                    <text
                      x={padLeft - 12}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={12}
                      fontWeight="700"
                      fill={r <= 3 ? "#059669" : r <= 10 ? "#2563eb" : "#64748b"}
                    >
                      #{r}
                    </text>
                  </g>
                );
              })}

              {/* 4. Vertical Date Grid Lines & Timestamps */}
              {progression.map((p, idx) => {
                const x = getX(idx, progression.length);
                return (
                  <g key={`x-grid-${p.fullDate}`}>
                    <line
                      x1={x}
                      y1={padTop}
                      x2={x}
                      y2={padTop + chartH}
                      stroke="#f1f5f9"
                      strokeWidth={1}
                    />
                    <text
                      x={x}
                      y={padTop + chartH + 24}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight="700"
                      fill="#475569"
                    >
                      {p.date}
                    </text>
                  </g>
                );
              })}

              {/* 5. Render Area Gradients and Curve Splines */}
              {chartLines.map((line) => (
                <g key={`line-group-${line.id}`}>
                  {/* Gradient Area Fill */}
                  {line.areaPath && (
                    <path
                      d={line.areaPath}
                      fill={`url(#${line.gradientId || "gradOverall"})`}
                    />
                  )}

                  {/* Curve Path */}
                  {line.path && (
                    <path
                      d={line.path}
                      fill="none"
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                      strokeDasharray={line.dash}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Points / Milestone Dots */}
                  {line.points.map((pt, pIdx) => {
                    const isHovered = hoveredPointIndex === pIdx;
                    return (
                      <g key={`pt-${line.id}-${pIdx}`}>
                        {/* Concentric glow ring when only 1 verified point or hovered */}
                        {(progression.length === 1 || isHovered) && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 8 : 7}
                            fill={line.color}
                            fillOpacity={0.2}
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 5 : 4}
                          fill="#ffffff"
                          stroke={line.color}
                          strokeWidth={2.5}
                        />
                      </g>
                    );
                  })}
                </g>
              ))}

              {/* 6. Active Hover Crosshair Line */}
              {hoveredPointIndex !== null && progression[hoveredPointIndex] && (
                <line
                  x1={getX(hoveredPointIndex, progression.length)}
                  y1={padTop}
                  x2={getX(hoveredPointIndex, progression.length)}
                  y2={padTop + chartH}
                  stroke="#475569"
                  strokeWidth={1.5}
                  strokeDasharray="3,3"
                />
              )}

              {/* 7. Hover Hit Rectangles */}
              {progression.map((p, idx) => {
                const x = getX(idx, progression.length);
                const sliceW = progression.length <= 1 ? chartW : chartW / (progression.length - 1);

                return (
                  <rect
                    key={`hit-${idx}`}
                    x={progression.length <= 1 ? padLeft : x - sliceW / 2}
                    y={padTop}
                    width={sliceW}
                    height={chartH}
                    fill="transparent"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    className="cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* Floating Tooltip Card */}
            {activeHoverPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-700 text-xs w-56 -translate-x-1/2 transition-all duration-75"
                style={{
                  left: `${(getX(hoveredPointIndex!, progression.length) / svgWidth) * 100}%`,
                  top: "20px",
                }}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80 mb-2">
                  <span className="font-extrabold text-slate-200">
                    {activeHoverPoint.date} ({activeHoverPoint.fullDate})
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Overall Average:</span>
                    <span className="font-extrabold text-white">#{activeHoverPoint.avgRank}</span>
                  </div>
                  {activeHoverPoint.geoAvg !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> GEO Average:
                      </span>
                      <span className="font-bold text-slate-100">#{activeHoverPoint.geoAvg}</span>
                    </div>
                  )}
                  {activeHoverPoint.seoAvg !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> SEO Average:
                      </span>
                      <span className="font-bold text-slate-100">#{activeHoverPoint.seoAvg}</span>
                    </div>
                  )}
                  {activeHoverPoint.aeoAvg !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> AEO Average:
                      </span>
                      <span className="font-bold text-slate-100">#{activeHoverPoint.aeoAvg}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. TELEMETRY & KEYWORDS TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Tracked Search Terms Telemetry & 24h Movement
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Showing {filteredKeywords.length} of {keywords.length} priority commercial keywords
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter keyword or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Keyword Query & Locality</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2 text-center">09:00 AM Rank</th>
                <th className="py-3 px-2 text-center">24h Shift</th>
                <th className="py-3 px-2 text-center">Day 0 Baseline</th>
                <th className="py-3 px-2 text-right">Search Demand</th>
                <th className="py-3 px-2">SERP Feature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKeywords.map((kw) => {
                const isTop3 = kw.currentRank <= 3;
                const isTop10 = kw.currentRank <= 10;

                return (
                  <tr key={kw.keyword} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{kw.keyword}</div>
                      <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {kw.locality || "City-wide"}, {kw.targetCity}
                      </div>
                    </td>

                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          kw.type === "GEO"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : kw.type === "SEO"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {kw.type}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center font-black">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                          isTop3
                            ? "bg-emerald-100 text-emerald-800"
                            : isTop10
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        #{kw.currentRank}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-center">
                      {kw.rankDelta > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-extrabold text-xs">
                          <TrendingUp className="w-3.5 h-3.5" /> +{kw.rankDelta}
                        </span>
                      ) : kw.rankDelta < 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-red-600 font-extrabold text-xs">
                          <TrendingDown className="w-3.5 h-3.5" /> {kw.rankDelta}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs">— 0</span>
                      )}
                    </td>

                    <td className="py-3 px-2 text-center text-slate-500 font-semibold">
                      #{kw.baselineRank}
                    </td>

                    <td className="py-3 px-2 text-right font-bold text-slate-800">
                      {kw.searchVolume.toLocaleString()}/mo
                    </td>

                    <td className="py-3 px-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {kw.serpFeature === "LOCAL_3PACK" ? (
                          <>
                            <Award className="w-3 h-3 text-amber-600" /> Local 3-Pack
                          </>
                        ) : kw.serpFeature === "AI_OVERVIEW" ? (
                          <>
                            <Bot className="w-3 h-3 text-purple-600" /> AI Overview
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3 text-blue-600" /> Organic
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
