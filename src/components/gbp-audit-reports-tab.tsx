"use client"

import { useState, useEffect } from "react"
import {
  FileText, Camera, Download, ExternalLink, Calendar, CheckCircle2,
  TrendingUp, Star, ShieldCheck, Sparkles, AlertCircle, RefreshCw, Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AuditReportItem {
  id: string
  merchantId: string
  reportType: "DAY_0_BASELINE" | "MONTHLY_30_DAY"
  reportPeriod: string
  daysSinceOnboarding: number
  rankScore: number
  currentRank: number
  baselineRank: number
  totalReviews: number
  starRating: number
  gridScore: number
  primaryKeyword: string | null
  locality: string | null
  revenueLeakEst: number
  screenshotUrl: string | null
  reportSummary: string | null
  pdfDownloadUrl: string | null
  createdAt: string
}

export function GbpAuditReportsTab({ merchantId, merchantName }: { merchantId: string; merchantName: string }) {
  const [reports, setReports] = useState<AuditReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/gbp/audit-reports?merchantId=${merchantId}`)
      const data = await res.json()
      if (data.ok && data.data?.reports) {
        setReports(data.data.reports)
      }
    } catch (e) {
      console.error("[GbpAuditReportsTab] fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (merchantId) fetchReports()
  }, [merchantId])

  const handleGenerateReport = async (reportType: "DAY_0_BASELINE" | "MONTHLY_30_DAY", period: string) => {
    try {
      setGenerating(true)
      const res = await fetch("/api/gbp/audit-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          reportType,
          reportPeriod: period
        })
      })
      const data = await res.json()
      if (data.ok) {
        await fetchReports()
      } else {
        alert("Report generation failed: " + (data.error || "Unknown error"))
      }
    } catch (e: any) {
      alert("Error: " + e.message)
    } finally {
      setGenerating(false)
    }
  }

  const day0Report = reports.find(r => r.reportType === "DAY_0_BASELINE")
  const monthlyReports = reports.filter(r => r.reportType === "MONTHLY_30_DAY")

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Camera className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg">Google Maps Real-Time Audit &amp; Monthly Reports</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Automated Day 0 baseline audit certificates and 30-day recurring calendar ranking snapshots with verified screenshots.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!day0Report && (
            <Button
              size="sm"
              onClick={() => handleGenerateReport("DAY_0_BASELINE", "DAY_0")}
              disabled={generating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
              Generate Day-0 Baseline Report
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentMonth = new Date().toISOString().slice(0, 7)
              handleGenerateReport("MONTHLY_30_DAY", currentMonth)
            }}
            disabled={generating}
            className="border-slate-700 text-slate-300 hover:text-white text-xs font-bold"
          >
            {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Camera className="w-3.5 h-3.5 mr-1.5" />}
            Capture 30-Day Snapshot
          </Button>
        </div>
      </div>

      {/* SECTION 1: Day 0 Baseline Audit Card */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-4 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-black px-2.5 py-0.5">
                DAY ZERO BASELINE
              </Badge>
              <CardTitle className="text-sm font-extrabold text-white">
                Onboarding Status &amp; Initial Baseline Proof
              </CardTitle>
            </div>
            {day0Report && (
              <span className="text-slate-400 text-xs font-medium">
                Captured on {new Date(day0Report.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5">
          {!day0Report ? (
            <div className="text-center py-10 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              Day 0 Baseline Report abhi generate nahi hua hai. Click <strong>"Generate Day-0 Baseline Report"</strong> to capture your initial status.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Metrics */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Baseline Rank</span>
                    <div className="text-xl font-black text-amber-400 mt-1">#{day0Report.currentRank}</div>
                    <span className="text-[10px] text-slate-500">Google Local Pack</span>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Google Reviews</span>
                    <div className="text-xl font-black text-emerald-400 mt-1">{day0Report.totalReviews}</div>
                    <span className="text-[10px] text-slate-500">⭐ {day0Report.starRating.toFixed(1)} Stars</span>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Revenue Leak</span>
                    <div className="text-xl font-black text-rose-400 mt-1">₹{day0Report.revenueLeakEst.toLocaleString("en-IN")}</div>
                    <span className="text-[10px] text-slate-500">Estimated/mo</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                  {day0Report.reportSummary}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={`/api/gbp/audit-reports/export?merchantId=${merchantId}&period=DAY_0`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Baseline Certificate (PDF)
                  </a>
                  {day0Report.screenshotUrl && (
                    <button
                      onClick={() => setPreviewImage(day0Report.screenshotUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View High-Res Proof
                    </button>
                  )}
                </div>
              </div>

              {/* Right Screenshot Preview */}
              <div className="lg:col-span-5">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 group cursor-pointer" onClick={() => setPreviewImage(day0Report.screenshotUrl)}>
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-bold text-emerald-400 border border-slate-800">
                    Day-0 Live SERP Snapshot
                  </div>
                  <img
                    src={day0Report.screenshotUrl || "/cplogo_horizontal.png"}
                    alt="Day 0 Baseline Screenshot"
                    className="w-full h-48 object-cover object-top transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="text-white text-xs font-bold bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700">Click to Zoom 🔍</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: 30-Day Recurring Monthly Calendar Reports */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            30-Day Recurring Calendar Reports &amp; Growth Proofs
          </h3>
          <span className="text-xs text-slate-400">{monthlyReports.length} Reports Generated</span>
        </div>

        {monthlyReports.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-800 p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-white font-bold text-sm mb-1">Agle 30 Din Ka Report Schedule</div>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Jab aapka ranking sprint Day 30 par pahuchega, RankLocal AI automatically new Google Maps screenshot ke sath progress comparison report yahan post karega.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlyReports.map((report) => {
              const reviewGrowth = report.totalReviews - (day0Report?.totalReviews || 0)
              const rankGain = (day0Report?.currentRank || 10) - report.currentRank

              return (
                <Card key={report.id} className="bg-slate-900/80 border-slate-800 overflow-hidden">
                  <CardHeader className="bg-slate-950/40 border-b border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px] font-black">
                          MONTH {report.reportPeriod}
                        </Badge>
                        <span className="text-white font-extrabold text-xs">Day {report.daysSinceOnboarding} Milestone</span>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Visual Screenshot Thumbnail */}
                    {report.screenshotUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 h-36 cursor-pointer group" onClick={() => setPreviewImage(report.screenshotUrl)}>
                        <img
                          src={report.screenshotUrl}
                          alt="Monthly Snapshot"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-slate-300">
                          Rank #{report.currentRank} Verified
                        </div>
                      </div>
                    )}

                    {/* Progress Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] block font-bold">TOTAL REVIEWS</span>
                        <span className="font-black text-white text-base">{report.totalReviews}</span>
                        {reviewGrowth > 0 && (
                          <span className="text-emerald-400 text-[10px] font-bold block">+{reviewGrowth} since Day 0 🚀</span>
                        )}
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 text-[10px] block font-bold">MAPS RANK</span>
                        <span className="font-black text-emerald-400 text-base">#{report.currentRank}</span>
                        {rankGain > 0 && (
                          <span className="text-emerald-400 text-[10px] font-bold block">↑ {rankGain} positions jump ⭐</span>
                        )}
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs line-clamp-2">
                      {report.reportSummary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <a
                        href={`/api/gbp/audit-reports/export?merchantId=${merchantId}&period=${report.reportPeriod}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Report PDF
                      </a>

                      <span className="text-[10px] text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-white text-sm font-bold">Real-Time Google Maps Proof Screenshot</span>
              <Button size="sm" variant="ghost" onClick={() => setPreviewImage(null)} className="text-slate-400 hover:text-white">✕</Button>
            </div>
            <div className="p-4 bg-slate-950 flex justify-center">
              <img src={previewImage} alt="Enlarged Proof" className="max-h-[70vh] w-auto object-contain rounded-lg border border-slate-800" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
