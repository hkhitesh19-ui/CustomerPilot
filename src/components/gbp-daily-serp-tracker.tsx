"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp, TrendingDown, Minus, Download, RefreshCw, Search,
  MapPin, Sparkles, Globe, Bot, Award, CheckCircle2, ChevronRight,
  Filter, Layers, ArrowUpRight, FileSpreadsheet, Calendar, Info
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
  serpFeature: "LOCAL_3PACK" | "ORGANIC" | "AI_OVERVIEW" | "KNOWLEDGE_PANEL";
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
        setSummary(data.summary);
        setKeywords(data.keywords);
        setAllKeywords(data.allKeywords || data.keywords);
        setProgression(data.progression);
        if (data.keywords.length > 0 && selectedKeywords.length === 0) {
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
        k.locality.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [keywords, searchQuery]);

  // SVG Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Inverted Y-axis: Rank 1 is at top (padTop), Rank 15 is at bottom (padTop + chartH)
  const minRank = 1;
  const maxRank = 15;
  const getY = (rank: number) => {
    const clamped = Math.max(minRank, Math.min(maxRank, rank));
    return padTop + ((clamped - minRank) / (maxRank - minRank)) * chartH;
  };

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (total - 1)) * chartW;
  };

  // Helper smooth path generator
  const buildSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
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
          label: "Overall Average Rank",
          color: "#1a73e8", // Google Blue
          strokeWidth: 3,
          dash: "",
          points: overallPoints,
          path: buildSvgPath(overallPoints),
          currentVal: summary?.averageRank || 0,
        },
        {
          id: "geo",
          label: "GEO Proximity Average",
          color: "#0284c7", // Sky Blue
          strokeWidth: 2,
          dash: "",
          points: geoPoints,
          path: buildSvgPath(geoPoints),
          currentVal: progression[progression.length - 1]?.geoAvg || 0,
        },
        {
          id: "seo",
          label: "SEO Transactional Average",
          color: "#16a34a", // Emerald Green
          strokeWidth: 2,
          dash: "4,4",
          points: seoPoints,
          path: buildSvgPath(seoPoints),
          currentVal: progression[progression.length - 1]?.seoAvg || 0,
        },
        {
          id: "aeo",
          label: "AEO / AI Overview Average",
          color: "#9333ea", // Purple
          strokeWidth: 2.5,
          dash: "",
          points: aeoPoints,
          path: buildSvgPath(aeoPoints),
          currentVal: progression[progression.length - 1]?.aeoAvg || 0,
        },
      ];
    } else {
      // KEYWORD_COMPARISON MODE
      const colors = ["#1a73e8", "#16a34a", "#e11d48", "#d97706", "#9333ea"];
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
          strokeWidth: 2.5,
          dash: "",
          points: pts,
          path: buildSvgPath(pts),
          currentVal: currentK?.currentRank || 0,
        };
      });
    }
  }, [progression, chartMode, selectedKeywords, allKeywords, summary]);

  const toggleKeywordSelection = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      if (selectedKeywords.length > 1) {
        setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
      }
    } else {
      if (selectedKeywords.length < 5) {
        setSelectedKeywords([...selectedKeywords, kw]);
      } else {
        setSelectedKeywords([...selectedKeywords.slice(1), kw]);
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-slate-900 font-extrabold text-lg">
              Google SERP &amp; GEO Ranking Progression Engine
            </h2>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Daily 09:00 AM IST Crawl Active
            </Badge>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Real-time search positioning for <strong>{merchantName}</strong> across Google Maps 3-Pack, Organic Web, and AI Overviews.
          </p>
        </div>

        {/* Timeframe & Actions */}
        <div className="flex items-center flex-wrap gap-2 self-start md:self-auto">
          {/* Timeframe filter pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
            <button
              onClick={() => setPeriod("7D")}
              className={`px-2.5 py-1 rounded-lg transition ${
                period === "7D" ? "bg-white text-blue-600 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod("14D")}
              className={`px-2.5 py-1 rounded-lg transition ${
                period === "14D" ? "bg-white text-blue-600 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setPeriod("30D")}
              className={`px-2.5 py-1 rounded-lg transition ${
                period === "30D" ? "bg-white text-blue-600 shadow-xs" : "hover:text-slate-900"
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Download Daily CSV Button */}
          <a
            href={`/api/gbp/daily-serp/export?merchantId=${merchantId}&period=${period}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Download Daily CSV
          </a>

          {/* Trigger 09:00 AM Live Scan */}
          <Button
            size="sm"
            onClick={handleLiveScan}
            disabled={scanning}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs"
          >
            {scanning ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
            )}
            Run 09:00 AM Scan
          </Button>
        </div>
      </div>

      {/* 2. THE 4 GOOGLE SEARCH METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Top 3 Local Pack */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#d97706] rounded-t-xl" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>In Top 3 Local Pack</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {summary?.top3Count ?? 0} Keywords
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {summary?.top3Percentage ?? 0}% Share
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Appear directly in Google Maps 3-Pack pin</p>
        </div>

        {/* Metric 2: Top 10 Google SERP */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#16a34a] rounded-t-xl" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>In Top 10 SERP (Page 1)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {summary?.top10Count ?? 0} Keywords
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              {summary?.top10Percentage ?? 0}% Coverage
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Page 1 organic and map rankings</p>
        </div>

        {/* Metric 3: Average SERP Standing */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a73e8] rounded-t-xl" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Average SERP Rank</span>
            <TrendingUp className="w-4 h-4 text-[#1a73e8]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              #{summary?.averageRank ?? 0}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              ▲ +{summary?.rankImprovement ?? 0} Spots
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Improved from baseline #{summary?.baselineAverageRank ?? 0} at Day 0
          </p>
        </div>

        {/* Metric 4: Total Targeted Search Demand */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#9333ea] rounded-t-xl" />
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Monthly Search Demand</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {summary?.totalMonthlySearchDemand.toLocaleString() ?? 0}/mo
            </span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              High Intent
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {summary?.totalTracked ?? 0} tracked commercial search terms
          </p>
        </div>
      </div>

      {/* 3. PICTORIZED TIME-SERIES RANK PROGRESSION GRAPH */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Chart Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Daily Morning 09:00 AM Rank Progression Trajectory
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Inverted SEO Scale: Top of graph represents <strong>Rank #1</strong> (First Position on Google).
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setChartMode("CATEGORY_AVERAGES")}
              className={`px-3 py-1 rounded-lg transition ${
                chartMode === "CATEGORY_AVERAGES"
                  ? "bg-white text-blue-600 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Category Averages
            </button>
            <button
              onClick={() => setChartMode("KEYWORD_COMPARISON")}
              className={`px-3 py-1 rounded-lg transition ${
                chartMode === "KEYWORD_COMPARISON"
                  ? "bg-white text-blue-600 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Compare Keywords ({selectedKeywords.length})
            </button>
          </div>
        </div>

        {/* Legend / Keyword Selector Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {chartMode === "CATEGORY_AVERAGES" ? (
            chartLines.map((line) => (
              <div
                key={line.id}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              >
                <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: line.color }} />
                <span>{line.label}</span>
                <span className="font-bold text-slate-900 ml-1">#{line.currentVal}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-slate-500 font-medium text-xs">Select up to 5 to plot:</span>
              {allKeywords.slice(0, 10).map((k, i) => {
                const isSelected = selectedKeywords.includes(k.keyword);
                return (
                  <button
                    key={k.keyword}
                    onClick={() => toggleKeywordSelection(k.keyword)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition border ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-700"
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
        <div className="w-full overflow-x-auto">
          <div className="min-w-[650px] relative select-none">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              <defs>
                <linearGradient id="rank1Zone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Top 3 Local Pack Highlight Zone (Rank 1 to 3) */}
              <rect
                x={padLeft}
                y={getY(1)}
                width={chartW}
                height={getY(3) - getY(1)}
                fill="url(#rank1Zone)"
              />
              <line
                x1={padLeft}
                y1={getY(3)}
                x2={padLeft + chartW}
                y2={getY(3)}
                stroke="#16a34a"
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity={0.4}
              />
              <text
                x={padLeft + chartW - 5}
                y={getY(3) - 6}
                textAnchor="end"
                fontSize={10}
                fill="#16a34a"
                fontWeight="700"
              >
                ★ Top 3 Google 3-Pack Zone
              </text>

              {/* Horizontal Rank Grid Lines */}
              {[1, 3, 5, 8, 10, 15].map((r) => {
                const y = getY(r);
                return (
                  <g key={r}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + chartW}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={11}
                      fontWeight="600"
                      fill="#64748b"
                    >
                      #{r}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Date Grid Lines & Labels */}
              {progression.map((p, idx) => {
                const x = getX(idx, progression.length);
                return (
                  <g key={p.date}>
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
                      y={padTop + chartH + 20}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight="600"
                      fill="#64748b"
                    >
                      {p.date}
                    </text>
                  </g>
                );
              })}

              {/* Render Chart Lines */}
              {chartLines.map((line) => (
                <g key={line.id}>
                  <path
                    d={line.path}
                    fill="none"
                    stroke={line.color}
                    strokeWidth={line.strokeWidth}
                    strokeDasharray={line.dash}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {line.points.map((pt, pIdx) => (
                    <circle
                      key={pIdx}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPointIndex === pIdx ? 5 : 3}
                      fill="#ffffff"
                      stroke={line.color}
                      strokeWidth={2}
                    />
                  ))}
                </g>
              ))}

              {/* Hover Crosshair & Trigger Rectangles */}
              {progression.map((p, idx) => {
                const x = getX(idx, progression.length);
                const isHovered = hoveredPointIndex === idx;

                return (
                  <g key={`hit-${idx}`}>
                    {/* Invisible hover slice */}
                    <rect
                      x={x - (chartW / progression.length) / 2}
                      y={padTop}
                      width={chartW / progression.length}
                      height={chartH}
                      fill="transparent"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      className="cursor-pointer"
                    />

                    {/* Active vertical hover crosshair */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + chartH}
                        stroke="#1a73e8"
                        strokeWidth={1.5}
                        strokeDasharray="3,3"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Interactive Tooltip Card */}
            {hoveredPointIndex !== null && progression[hoveredPointIndex] && (
              <div
                className="absolute z-20 bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all"
                style={{
                  left: `${(getX(hoveredPointIndex, progression.length) / svgWidth) * 100}%`,
                  top: `${(padTop / svgHeight) * 100}%`,
                }}
              >
                <div className="font-extrabold text-slate-100 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between gap-3">
                  <span>{progression[hoveredPointIndex].fullDate}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {progression[hoveredPointIndex].top3Count} in Top 3
                  </span>
                </div>
                <div className="space-y-1">
                  {chartMode === "CATEGORY_AVERAGES" ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">Overall Average:</span>
                        <span className="font-bold text-blue-400">
                          #{progression[hoveredPointIndex].avgRank}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">GEO Average:</span>
                        <span className="font-bold text-sky-400">
                          #{progression[hoveredPointIndex].geoAvg ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">SEO Average:</span>
                        <span className="font-bold text-emerald-400">
                          #{progression[hoveredPointIndex].seoAvg ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-400">AEO Average:</span>
                        <span className="font-bold text-purple-400">
                          #{progression[hoveredPointIndex].aeoAvg ?? "—"}
                        </span>
                      </div>
                    </>
                  ) : (
                    selectedKeywords.map((kw) => (
                      <div key={kw} className="flex items-center justify-between gap-3">
                        <span className="text-slate-300 truncate max-w-[140px]">{kw}:</span>
                        <span className="font-bold text-amber-400">
                          #{progression[hoveredPointIndex].keywords[kw] ?? "—"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. KEYWORD TAXONOMY TABS & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All Keywords ({summary?.totalTracked ?? 0})
            </button>

            <button
              onClick={() => setActiveTab("GEO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "GEO"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              GEO Proximity &amp; Local Pack ({summary?.geoCount ?? 0})
            </button>

            <button
              onClick={() => setActiveTab("SEO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "SEO"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              SEO High-Intent Search ({summary?.seoCount ?? 0})
            </button>

            <button
              onClick={() => setActiveTab("AEO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "AEO"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AEO &amp; AI Overviews ({summary?.aeoCount ?? 0})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* 5. TELEMETRY TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Keyword &amp; Locality</th>
                <th className="py-2.5 px-2">Type</th>
                <th className="py-2.5 px-2 text-center">09:00 AM Rank</th>
                <th className="py-2.5 px-2 text-center">24h Shift</th>
                <th className="py-2.5 px-2 text-center">Day 0 ➔ Today</th>
                <th className="py-2.5 px-2 text-right">Search Volume</th>
                <th className="py-2.5 px-2">SERP Feature</th>
                <th className="py-2.5 px-3 text-center">14-Day Trajectory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKeywords.map((k) => {
                // Rank styling
                const isTop3 = k.currentRank <= 3;
                const rankColor =
                  k.currentRank === 1
                    ? "bg-amber-100 text-amber-800 border-amber-300 font-extrabold"
                    : k.currentRank === 2
                    ? "bg-slate-200 text-slate-800 border-slate-300 font-bold"
                    : k.currentRank === 3
                    ? "bg-amber-50 text-amber-700 border-amber-200 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 font-medium";

                // Delta styling
                const delta = k.rankDelta;
                const deltaBadge =
                  delta > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                      <TrendingUp className="w-3 h-3" /> +{delta}
                    </span>
                  ) : delta < 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                      <TrendingDown className="w-3 h-3" /> {delta}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded text-[10px]">
                      <Minus className="w-3 h-3" /> 0
                    </span>
                  );

                // Category Badge
                const typeBadge =
                  k.type === "GEO" ? (
                    <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-bold">
                      📍 GEO
                    </Badge>
                  ) : k.type === "SEO" ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                      🔍 SEO
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                      🤖 AEO
                    </Badge>
                  );

                // Feature Badge
                const featureBadge =
                  k.serpFeature === "LOCAL_3PACK" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      Local 3-Pack
                    </span>
                  ) : k.serpFeature === "AI_OVERVIEW" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      AI Overview
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                      <Globe className="w-3 h-3 text-slate-500" />
                      Organic SERP
                    </span>
                  );

                return (
                  <tr key={k.keyword} className="hover:bg-slate-50/80 transition-colors">
                    {/* Keyword */}
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 capitalize">{k.keyword}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {k.locality}, {k.targetCity}
                      </div>
                    </td>

                    {/* Category Type */}
                    <td className="py-2.5 px-2">{typeBadge}</td>

                    {/* Current Rank */}
                    <td className="py-2.5 px-2 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs border ${rankColor}`}>
                        #{k.currentRank}
                      </span>
                    </td>

                    {/* 24h Movement */}
                    <td className="py-2.5 px-2 text-center">{deltaBadge}</td>

                    {/* Day 0 vs Current */}
                    <td className="py-2.5 px-2 text-center">
                      <span className="text-slate-400 text-xs">
                        #{k.baselineRank} ➔{" "}
                        <strong className="text-slate-900">#{k.currentRank}</strong>
                      </span>
                    </td>

                    {/* Search Volume */}
                    <td className="py-2.5 px-2 text-right">
                      <span className="font-bold text-slate-700">
                        {k.searchVolume.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">/mo</span>
                    </td>

                    {/* Feature */}
                    <td className="py-2.5 px-2">{featureBadge}</td>

                    {/* Sparkline */}
                    <td className="py-2.5 px-3 text-center">
                      <svg className="w-20 h-5 inline-block" viewBox="0 0 80 20">
                        {(() => {
                          const pts = k.sparkline.map((val, idx) => {
                            const x = (idx / Math.max(1, k.sparkline.length - 1)) * 80;
                            // Rank 1 is top (y=2), Rank 15 is bottom (y=18)
                            const y = 2 + ((Math.min(15, Math.max(1, val)) - 1) / 14) * 16;
                            return { x, y };
                          });
                          const pathStr = pts.reduce(
                            (acc, pt, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
                            ""
                          );
                          return (
                            <>
                              <path
                                d={pathStr}
                                fill="none"
                                stroke={isTop3 ? "#16a34a" : "#1a73e8"}
                                strokeWidth={1.8}
                                strokeLinecap="round"
                              />
                              <circle
                                cx={pts[pts.length - 1]?.x ?? 0}
                                cy={pts[pts.length - 1]?.y ?? 0}
                                r={2.5}
                                fill={isTop3 ? "#16a34a" : "#1a73e8"}
                              />
                            </>
                          );
                        })()}
                      </svg>
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
