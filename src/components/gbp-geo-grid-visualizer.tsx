"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin, Compass, Navigation, RefreshCw, ShieldCheck,
  TrendingUp, Award, Layers, Info, CheckCircle2, ChevronRight,
  Crosshair, Radio, Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GeoGridPoint {
  pointIndex: number;
  row: number;
  col: number;
  lat: number;
  lng: number;
  localityName: string;
  distanceKm: number;
  bearing: "NW" | "N" | "NE" | "W" | "CENTER" | "E" | "SW" | "S" | "SE";
  rank: number;
  isTop3: boolean;
  isTop10: boolean;
  top3Competitors: Array<{
    rank: number;
    name: string;
    rating: number;
    reviewsCount: number;
    distanceKm: number;
  }>;
}

interface GeoGridScan {
  merchantId: string;
  keyword: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  gridSize: number;
  top3CoveragePct: number;
  top10CoveragePct: number;
  avgRank: number;
  centerRank: number;
  points: GeoGridPoint[];
  scannedAt: string;
}

interface AvailableKeyword {
  keyword: string;
  type: string;
  searchVolume: number;
  isPortfolioTarget: boolean;
  portfolioCategory?: string;
}

export function GbpGeoGridVisualizer({
  merchantId,
  merchantName,
}: {
  merchantId: string;
  merchantName?: string;
}) {
  const [scan, setScan] = useState<GeoGridScan | null>(null);
  const [availableKeywords, setAvailableKeywords] = useState<AvailableKeyword[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const [selectedPoint, setSelectedPoint] = useState<GeoGridPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const fetchScan = async (kw?: string, force = false) => {
    try {
      if (force) setScanning(true);
      else setLoading(true);

      const targetKw = kw || selectedKeyword;
      const url = `/api/gbp/geo-grid?merchantId=${merchantId}${
        targetKw ? `&keyword=${encodeURIComponent(targetKw)}` : ""
      }${force ? "&forceRefresh=true" : ""}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && data.scan) {
        setScan(data.scan);
        setSelectedKeyword(data.scan.keyword);
        if (data.availableKeywords) {
          setAvailableKeywords(data.availableKeywords);
        }
        // Auto-select center node (pointIndex 12)
        const center = data.scan.points.find((p: GeoGridPoint) => p.bearing === "CENTER");
        setSelectedPoint(center || data.scan.points[12] || data.scan.points[0]);
      }
    } catch (err) {
      console.error("[GEO_GRID_FETCH_ERROR]", err);
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  useEffect(() => {
    if (merchantId) {
      fetchScan();
    }
  }, [merchantId]);

  const handleKeywordChange = (newKw: string) => {
    setSelectedKeyword(newKw);
    fetchScan(newKw, false);
  };

  const handleTriggerRescan = () => {
    fetchScan(selectedKeyword, true);
  };

  if (loading && !scan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-bold text-slate-800">Measuring 5×5 = 25 Coordinates Geo-Grid...</p>
        <p className="text-xs text-slate-500 mt-1">Collecting 25 geographical coordinate points within 5km radius</p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <p className="text-slate-700 font-bold">No Geo-Grid scan data available.</p>
        <Button onClick={() => fetchScan("", true)} className="mt-4 bg-blue-600 text-white text-xs">
          Run 25-Point Grid Scan
        </Button>
      </div>
    );
  }

  const { points, top3CoveragePct, top10CoveragePct, avgRank, centerRank, radiusKm } = scan;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Keyword Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-xs flex-shrink-0">
            <Crosshair className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-slate-900 font-extrabold text-lg">
                5×5 = 25 Coordinates Geo-Grid Ranking Visualizer
              </h2>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                5.0 KM RADIUS PROXIMITY MATRIX
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                100% REAL COORDINATES
              </Badge>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Measures Google Maps Local 3-Pack rank decay across 25 fixed coordinate points around your physical store epicenter.
            </p>
          </div>
        </div>

        {/* Keyword Selector & Rescan Button */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Keyword:</span>
            <select
              value={selectedKeyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              className="bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {availableKeywords.map((k, idx) => (
                <option key={idx} value={k.keyword}>
                  {k.keyword} ({k.searchVolume}/mo)
                </option>
              ))}
              {availableKeywords.length === 0 && (
                <option value={scan.keyword}>{scan.keyword}</option>
              )}
            </select>
          </div>

          <Button
            size="sm"
            onClick={handleTriggerRescan}
            disabled={scanning}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            Rescan 25 Points
          </Button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="bg-emerald-50/50 border-emerald-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Top 3 Coverage</span>
              <Badge className="bg-emerald-200 text-emerald-900 text-[10px] font-bold">Local 3-Pack</Badge>
            </div>
            <div className="text-3xl font-black text-emerald-700 mt-1 font-mono">
              {top3CoveragePct}%
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{Math.round((top3CoveragePct / 100) * 25)} / 25 Points in Top 3</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Top 10 Coverage</span>
              <Badge className="bg-blue-200 text-blue-900 text-[10px] font-bold">1st Page</Badge>
            </div>
            <div className="text-3xl font-black text-blue-700 mt-1 font-mono">
              {top10CoveragePct}%
            </div>
            <div className="text-[11px] text-blue-700 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>{Math.round((top10CoveragePct / 100) * 25)} / 25 Points in Top 10</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Average Rank</span>
              <Badge className="bg-slate-100 text-slate-700 text-[10px] font-bold">5km Radius</Badge>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1 font-mono">
              #{avgRank}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span>Center Rank: #{centerRank}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Store Epicenter</span>
              <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold">0.0 km</Badge>
            </div>
            <div className="text-sm font-extrabold text-slate-900 mt-2 truncate">
              Eva Mall, Manjalpur
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              {scan.centerLat.toFixed(4)}° N, {scan.centerLng.toFixed(4)}° E
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Grid Scope</span>
              <Badge className="bg-indigo-50 text-indigo-700 text-[10px] font-bold">Radius</Badge>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {radiusKm.toFixed(1)} km
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              25 Fixed Geo-Points
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Grid Visualizer & Point Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col (8 cols): 5x5 Matrix Lattice */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                5×5 Geo-Grid Ranking Matrix (Tap any node to inspect)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              North (Top) ➔ South (Bottom)
            </span>
          </div>

          {/* 5x5 Node Grid Container with Concentric Radial Guides */}
          <div className="relative p-6 sm:p-8 bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center">
            
            {/* Concentric Distance Rings overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[180px] h-[180px] rounded-full border border-blue-200/50 bg-blue-50/10" />
              <div className="absolute w-[300px] h-[300px] rounded-full border border-slate-300/40" />
              <div className="absolute w-[420px] h-[420px] rounded-full border border-dashed border-slate-300/30" />
            </div>

            {/* 5x5 Lattice */}
            <div className="grid grid-cols-5 gap-3 sm:gap-4.5 relative z-10">
              {points.map((point) => {
                const isSelected = selectedPoint?.pointIndex === point.pointIndex;
                const isCenter = point.bearing === "CENTER";

                // Color coding per rank
                let nodeBg = "bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20";
                if (point.rank <= 3) {
                  nodeBg = "bg-emerald-600 text-white border-emerald-300 shadow-md shadow-emerald-500/30";
                } else if (point.rank <= 5) {
                  nodeBg = "bg-teal-500 text-white border-teal-300 shadow-sm";
                } else if (point.rank <= 10) {
                  nodeBg = "bg-amber-500 text-white border-amber-300 shadow-sm";
                } else {
                  nodeBg = "bg-rose-500 text-white border-rose-300 shadow-sm";
                }

                return (
                  <button
                    key={point.pointIndex}
                    onClick={() => setSelectedPoint(point)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold transition-all duration-150 border-2 cursor-pointer ${nodeBg} ${
                      isSelected
                        ? "ring-4 ring-blue-500 ring-offset-2 scale-110 z-20"
                        : "hover:scale-105"
                    }`}
                    title={`${point.localityName} (${point.distanceKm}km) - Rank #${point.rank}`}
                  >
                    {isCenter && (
                      <span className="absolute -top-2 -right-1 text-[9px] bg-indigo-700 text-white px-1 py-0.2 rounded-full font-bold shadow-xs">
                        STORE
                      </span>
                    )}
                    <span className="text-base sm:text-lg font-black font-mono leading-none">
                      #{point.rank}
                    </span>
                    <span className="text-[9px] font-medium opacity-90 mt-0.5 leading-none">
                      {point.distanceKm === 0 ? "0 km" : `${point.distanceKm}k`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-lg bg-emerald-600 border border-emerald-400" />
              <span className="text-slate-700">Rank #1–3 (Local 3-Pack)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-lg bg-teal-500 border border-teal-300" />
              <span className="text-slate-700">Rank #4–5 (Striking)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-lg bg-amber-500 border border-amber-300" />
              <span className="text-slate-700">Rank #6–10 (Top 10)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-lg bg-rose-500 border border-rose-300" />
              <span className="text-slate-700">Rank &gt;10 (Out-of-Pack)</span>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Selected Node Inspector & Competitors */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Coordinate Point Inspector
              </h3>
            </div>
            {selectedPoint && (
              <Badge className="bg-slate-100 text-slate-800 text-[10px] font-mono">
                Point #{selectedPoint.pointIndex + 1} of 25
              </Badge>
            )}
          </div>

          {selectedPoint ? (
            <div className="space-y-4">
              {/* Selected Point Header */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      {selectedPoint.localityName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedPoint.distanceKm === 0 ? "Store Epicenter" : `${selectedPoint.distanceKm} km ${selectedPoint.bearing} from store`}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-emerald-600">
                      #{selectedPoint.rank}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">
                      Local Rank
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-mono">
                  <span>Lat: {selectedPoint.lat.toFixed(4)}° N</span>
                  <span>Lng: {selectedPoint.lng.toFixed(4)}° E</span>
                </div>
              </div>

              {/* Observed Top 3 Local Pack Competitors at this point */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Observed Top 3 Pack at this Coordinate:
                  </span>
                  <span className="text-[10px] text-slate-400">Real Google Maps Pack</span>
                </div>

                <div className="space-y-2">
                  {selectedPoint.top3Competitors.map((comp, cIdx) => {
                    const isUserStore =
                      comp.name.toLowerCase().includes("cake connection") ||
                      comp.name.toLowerCase().includes("you");

                    return (
                      <div
                        key={cIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isUserStore
                            ? "bg-emerald-50/70 border-emerald-200 font-bold text-emerald-950"
                            : "bg-slate-50/60 border-slate-200/70 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-black ${
                              comp.rank === 1
                                ? "bg-amber-500 text-white"
                                : comp.rank === 2
                                ? "bg-slate-400 text-white"
                                : "bg-amber-700 text-white"
                            }`}
                          >
                            {comp.rank}
                          </span>
                          <div>
                            <p className="font-extrabold flex items-center gap-1">
                              {comp.name}
                              {isUserStore && (
                                <Badge className="bg-emerald-200 text-emerald-900 text-[9px] px-1 py-0">
                                  YOU
                                </Badge>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              ⭐ {comp.rating} ({comp.reviewsCount} reviews) • {comp.distanceKm} km away
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          #{comp.rank}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proximity Analysis Advice */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  Local 3-Pack Proximity Insight
                </p>
                <p className="text-[11px] text-blue-800/90 leading-relaxed">
                  {selectedPoint.distanceKm <= 1.5
                    ? "In your core 1.5km zone, your listing firmly anchors the Top 3 Local Pack. Maintain weekly posts to defend against nearby rivals."
                    : selectedPoint.distanceKm <= 3.0
                    ? "At 1.5–3.0km, competition heats up. Increasing geotagged review velocity from customers in this locality will accelerate your displacement into the Top 3."
                    : "At outer 3.0–5.0km perimeter, high physical distance causes rank decay. Target locality-specific citations and GEO service keywords to extend your 3-Pack radius."}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select any node on the 5×5 grid to view detailed coordinates and competitor data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}