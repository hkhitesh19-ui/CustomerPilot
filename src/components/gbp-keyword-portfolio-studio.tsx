"use client";

import React, { useState, useEffect } from "react";
import {
  Target, Sparkles, TrendingUp, ShieldCheck, Lock, Award,
  CheckCircle2, ArrowUpRight, BarChart2, Flame, RefreshCw,
  Search, Sliders, ChevronDown, ChevronUp, Layers, HelpCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PortfolioKeyword {
  id?: string;
  keyword: string;
  keywordType: "GEO" | "SEO" | "AEO" | string;
  targetLocality: string | null;
  searchVolume: number;
  currentRank: number;
  baselineRank: number;
  rankDelta?: number;
  relevanceScore: number;
  intentScore: number;
  demandScore: number;
  opportunityScore: number;
  profitabilityScore: number;
  competitionScore: number;
  commercialScore: number;
  portfolioCategory: "OPPORTUNITY" | "HIGH_VALUE" | "STRATEGIC";
  isPortfolioTarget: boolean;
}

interface PortfolioData {
  ok: boolean;
  merchant: {
    id: string;
    name: string;
  };
  isLocked: boolean;
  lockedAt: string;
  portfolioCount: number;
  portfolioClusters: {
    opportunity: {
      count: number;
      target: number;
      label: string;
      keywords: PortfolioKeyword[];
    };
    highValue: {
      count: number;
      target: number;
      label: string;
      keywords: PortfolioKeyword[];
    };
    strategic: {
      count: number;
      target: number;
      label: string;
      keywords: PortfolioKeyword[];
    };
  };
  portfolio: PortfolioKeyword[];
  allKeywords?: PortfolioKeyword[];
}

export function GbpKeywordPortfolioStudio({
  merchantId,
  merchantName,
}: {
  merchantId: string;
  merchantName?: string;
}) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCluster, setActiveCluster] = useState<"ALL" | "OPPORTUNITY" | "HIGH_VALUE" | "STRATEGIC">("ALL");
  const [showFormula, setShowFormula] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/gbp/portfolio?merchantId=${merchantId}`);
      const json = await res.json();
      if (json.ok) {
        setData(json);
      }
    } catch (err) {
      console.error("[PORTFOLIO_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (merchantId) {
      fetchPortfolio();
    }
  }, [merchantId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-bold text-slate-800">Calculating 6-Pillar Weighted Portfolio...</p>
        <p className="text-xs text-slate-500 mt-1">Applying 25% Relevance + 25% Intent + 15% Demand formula</p>
      </div>
    );
  }

  if (!data || !data.portfolio) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-slate-700 font-bold">No portfolio data available for this merchant.</p>
        <Button onClick={fetchPortfolio} className="mt-4 bg-blue-600 text-white text-xs">
          Generate Portfolio Now
        </Button>
      </div>
    );
  }

  const { portfolioClusters, portfolio, lockedAt } = data;
  const oppKeywords = portfolioClusters.opportunity?.keywords || [];
  const highValueKeywords = portfolioClusters.highValue?.keywords || [];
  const strategicKeywords = portfolioClusters.strategic?.keywords || [];

  const avgCommercialScore = Math.round(
    portfolio.reduce((acc, k) => acc + (k.commercialScore || 0), 0) / (portfolio.length || 1)
  );

  const filteredPortfolio = portfolio.filter((k) => {
    const matchesCluster =
      activeCluster === "ALL" || k.portfolioCategory === activeCluster;
    const matchesSearch =
      !searchTerm ||
      k.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (k.targetLocality && k.targetLocality.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCluster && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: 30-Day Locked Portfolio Status */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-slate-900 font-extrabold text-lg">
                10-Keyword Weighted Selection &amp; Locked Portfolio
              </h2>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-600" />
                30-DAY CAMPAIGN LOCKED
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                100% REAL DATA
              </Badge>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Shortlisted from 30 initial keywords using the 6-pillar commercial weighting criteria. Locked throughout the 30-day optimization sprint.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFormula(!showFormula)}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            {showFormula ? "Hide Formula" : "6-Pillar Formula"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setRefreshing(true);
              fetchPortfolio();
            }}
            disabled={refreshing}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Sync Portfolio
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="bg-white border-slate-200/90 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Locked Focus</span>
              <Badge className="bg-slate-100 text-slate-700 text-[10px] font-mono">10 / 10</Badge>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">10 Keywords</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Portfolio Active</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/40 border-amber-200/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Opportunity</span>
              <Badge className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">50% Share</Badge>
            </div>
            <div className="text-2xl font-black text-amber-900 mt-1">5 Targets</div>
            <div className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Rank 4–8 Striking Distance</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/40 border-emerald-200/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">High-Value Core</span>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">30% Share</Badge>
            </div>
            <div className="text-2xl font-black text-emerald-900 mt-1">3 Services</div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>High Enquiry Intent</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/40 border-purple-200/80 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Strategic Anchor</span>
              <Badge className="bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">20% Share</Badge>
            </div>
            <div className="text-2xl font-black text-purple-900 mt-1">2 Long-Term</div>
            <div className="text-[11px] text-purple-700 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
              <span>City-Wide Authority</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/40 border-blue-200/80 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Commercial Score</span>
              <Badge className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold">100 Max</Badge>
            </div>
            <div className="text-2xl font-black text-blue-900 mt-1">{avgCommercialScore}<span className="text-xs text-blue-600 font-semibold">/100</span></div>
            <div className="text-[11px] text-blue-700 mt-1 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Executive Grade</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Blueprint 6-Pillar Formula Guide Card (Expandable) */}
      {showFormula && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-sm text-white">
                30-Day Blueprint 6-Pillar Weighting Algorithm
              </h3>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
              TOTAL = 100%
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>1. Service Relevance</span>
                <span className="text-emerald-400 font-mono">25% (25 pts)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Direct alignment with core business offerings (e.g. customized cakes, live baking, delivery).
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>2. Enquiry/Booking Intent</span>
                <span className="text-emerald-400 font-mono">25% (25 pts)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Commercial and transactional intent terms (e.g. "order", "online", "price", "near me").
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>3. Local Demand Evidence</span>
                <span className="text-blue-400 font-mono">15% (15 pts)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Monthly search volume bracket verified from Google Search Console &amp; Keyword Planner.
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>4. Ranking Opportunity</span>
                <span className="text-amber-400 font-mono">15% (15 pts)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Striking distance rankings (Rank #4 to #8) where optimization can produce fast Top 3 displacement.
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>5. Business Profitability</span>
                <span className="text-purple-400 font-mono">10% (10 pts)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                High-margin premium custom orders and bulk party requests.
              </p>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>6. Geographic Competition</span>
                <span className="text-pink-400 font-mono">10% (10 pts)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Proximity convertibility in landmark clusters with achievable 3-Pack capture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Portfolio Cluster Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCluster("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCluster === "ALL"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All 10 Locked ({portfolio.length})
          </button>

          <button
            onClick={() => setActiveCluster("OPPORTUNITY")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCluster === "OPPORTUNITY"
                ? "bg-amber-500 text-white shadow-xs font-extrabold"
                : "text-amber-800 hover:bg-amber-50"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            5 Opportunity Targets ({oppKeywords.length})
          </button>

          <button
            onClick={() => setActiveCluster("HIGH_VALUE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCluster === "HIGH_VALUE"
                ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                : "text-emerald-800 hover:bg-emerald-50"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            3 High-Value Services ({highValueKeywords.length})
          </button>

          <button
            onClick={() => setActiveCluster("STRATEGIC")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCluster === "STRATEGIC"
                ? "bg-purple-600 text-white shadow-xs font-extrabold"
                : "text-purple-800 hover:bg-purple-50"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            2 Strategic Anchors ({strategicKeywords.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search in portfolio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:w-48"
          />
        </div>
      </div>

      {/* 5. Detailed Cards Grid for Target Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPortfolio.map((kw, idx) => {
          const isOpp = kw.portfolioCategory === "OPPORTUNITY";
          const isHigh = kw.portfolioCategory === "HIGH_VALUE";
          const isStrat = kw.portfolioCategory === "STRATEGIC";

          const categoryBadge = isOpp ? (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
              ⚡ OPPORTUNITY TARGET (STRIKING DISTANCE)
            </Badge>
          ) : isHigh ? (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
              💰 HIGH-VALUE SERVICE (REVENUE CORE)
            </Badge>
          ) : (
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-bold">
              👑 STRATEGIC ANCHOR (CITY AUTHORITY)
            </Badge>
          );

          const borderColor = isOpp
            ? "border-amber-200 hover:border-amber-300"
            : isHigh
            ? "border-emerald-200 hover:border-emerald-300"
            : "border-purple-200 hover:border-purple-300";

          return (
            <Card
              key={idx}
              className={`bg-white border ${borderColor} shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden`}
            >
              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <h4 className="text-slate-900 font-extrabold text-base capitalize">
                        {kw.keyword}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {categoryBadge}
                      <Badge className="bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {kw.keywordType}
                      </Badge>
                      {kw.targetLocality && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          📍 {kw.targetLocality}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Commercial Score Badge */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {kw.commercialScore}
                      <span className="text-xs text-slate-400 font-medium">/100</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      6-Pillar Score
                    </span>
                  </div>
                </div>

                {/* Metrics Row: Current Rank, Baseline Rank, Search Volume */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Current Rank</span>
                    <span className="text-base font-extrabold text-emerald-600 font-mono">
                      #{kw.currentRank}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Baseline Rank</span>
                    <span className="text-base font-bold text-slate-600 font-mono">
                      #{kw.baselineRank}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">Monthly Demand</span>
                    <span className="text-base font-extrabold text-blue-600 font-mono">
                      {kw.searchVolume.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 6-Pillars Horizontal Mini Score Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span>6-Pillar Weight Allocation</span>
                    <span className="text-slate-400 text-[10px]">
                      Rel:{kw.relevanceScore}/25 • Int:{kw.intentScore}/25 • Dem:{kw.demandScore}/15 • Opp:{kw.opportunityScore}/15 • Prof:{kw.profitabilityScore}/10 • Comp:{kw.competitionScore}/10
                    </span>
                  </div>
                  
                  {/* Segmented Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      style={{ width: `${(kw.relevanceScore / 25) * 25}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Relevance: ${kw.relevanceScore}/25`}
                    />
                    <div
                      style={{ width: `${(kw.intentScore / 25) * 25}%` }}
                      className="bg-blue-500 h-full"
                      title={`Intent: ${kw.intentScore}/25`}
                    />
                    <div
                      style={{ width: `${(kw.demandScore / 15) * 15}%` }}
                      className="bg-indigo-500 h-full"
                      title={`Demand: ${kw.demandScore}/15`}
                    />
                    <div
                      style={{ width: `${(kw.opportunityScore / 15) * 15}%` }}
                      className="bg-amber-500 h-full"
                      title={`Opportunity: ${kw.opportunityScore}/15`}
                    />
                    <div
                      style={{ width: `${(kw.profitabilityScore / 10) * 10}%` }}
                      className="bg-purple-500 h-full"
                      title={`Profitability: ${kw.profitabilityScore}/10`}
                    />
                    <div
                      style={{ width: `${(kw.competitionScore / 10) * 10}%` }}
                      className="bg-pink-500 h-full"
                      title={`Competition: ${kw.competitionScore}/10`}
                    />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 6. Locked Portfolio Integrity Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600 flex items-start gap-3">
        <Lock className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">
            30-Day Campaign Integrity Protocol
          </p>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Per the 30-Day GBP Blueprint, the 10 selected commercial target keywords remain locked throughout the 30-day optimization cycle to establish an immutable scientific baseline. Any replacement requires manual SuperAdmin approval with documented rationale.
          </p>
        </div>
      </div>
    </div>
  );
}