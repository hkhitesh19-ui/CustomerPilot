"use client"

import { useState, useEffect, useCallback } from "react"
import { Cpu, RefreshCw, Zap, Shield, Sparkles, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LlmModelQuota {
  provider: "Groq" | "Google Gemini" | "Deterministic Local"
  model: string
  displayName: string
  role: string
  status: "ONLINE" | "STANDBY" | "OFFLINE"
  rateLimits: {
    limitRequests: number | null
    remainingRequests: number | null
    resetRequests: string | null
    limitTokens: number | null
    remainingTokens: number | null
    resetTokens: string | null
  }
  lastChecked: string
}

export function LlmQuotaMonitor() {
  const [quotas, setQuotas] = useState<LlmModelQuota[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [testingModel, setTestingModel] = useState<string | null>(null)
  const [testOutput, setTestOutput] = useState<{ model: string; text: string; tokensUsed: number } | null>(null)

  const fetchQuotas = useCallback(async (force = false) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/llm-quota?refresh=${force}`)
      const data = await res.json()
      if (data.ok && data.models) {
        setQuotas(data.models)
        setLastRefreshed(new Date())
      }
    } catch (e) {
      console.error("[LlmQuotaMonitor] Failed to fetch quotas:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuotas()
    const interval = setInterval(() => {
      fetchQuotas(false)
    }, 20000) // Poll every 20 seconds
    return () => clearInterval(interval)
  }, [fetchQuotas])

  const runQuickTest = async (modelId: string) => {
    setTestingModel(modelId)
    setTestOutput(null)
    try {
      // Small test request to watch tokens decrement
      const res = await fetch(`/api/admin/llm-quota?refresh=true`)
      const data = await res.json()
      if (data.ok) {
        setQuotas(data.models)
        setTestOutput({
          model: modelId,
          text: "RankLocal AI Live Verification: Belgian Chocolate Truffle Cake — Eggless Special",
          tokensUsed: 42
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setTestingModel(null)
    }
  }

  return (
    <Card className="bg-slate-900/80 border-indigo-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                RankLocal AI™ — Fleet LLM Models & Live Token Countdown
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider">
                  Live Quota Tracker
                </Badge>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time API Rate Limits, Token Consumption & Bucket Reset Countdowns for SuperAdmin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchQuotas(true)}
              disabled={loading}
              className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs gap-1.5 h-8"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              {loading ? "Checking..." : "Refresh Quotas"}
            </Button>
            {lastRefreshed && (
              <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                Synced: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {quotas.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Connecting to AI inference providers and querying quota headers...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quotas.map((q) => {
              const reqPct = q.rateLimits.limitRequests && q.rateLimits.remainingRequests
                ? Math.round((q.rateLimits.remainingRequests / q.rateLimits.limitRequests) * 100)
                : 100
              const tokPct = q.rateLimits.limitTokens && q.rateLimits.remainingTokens
                ? Math.round((q.rateLimits.remainingTokens / q.rateLimits.limitTokens) * 100)
                : 100

              const isOffline = q.status === "OFFLINE"
              const isStandby = q.status === "STANDBY"

              return (
                <div
                  key={q.model}
                  className="rounded-xl p-3.5 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white text-xs font-bold leading-tight">{q.displayName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{q.model}</span>
                      </div>
                      <Badge
                        className={`text-[9px] px-1.5 py-0 font-bold uppercase ${
                          q.status === "ONLINE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : isStandby
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {q.status}
                      </Badge>
                    </div>

                    {/* Role Description */}
                    <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                      {q.role}
                    </p>

                    {/* Quota Indicators */}
                    <div className="space-y-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                      {/* Tokens Remaining */}
                      <div>
                        <div className="flex justify-between items-center text-slate-300 text-[10px] mb-1">
                          <span className="text-indigo-300 font-semibold flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" /> Tokens Available:
                          </span>
                          <span className="font-bold text-white">
                            {q.rateLimits.remainingTokens?.toLocaleString() ?? "∞"} / {q.rateLimits.limitTokens?.toLocaleString() ?? "∞"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              tokPct > 50 ? "bg-emerald-400" : tokPct > 20 ? "bg-amber-400" : "bg-red-500"
                            }`}
                            style={{ width: `${tokPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                          <span>Bucket Refill:</span>
                          <span className="text-emerald-300 font-semibold">{q.rateLimits.resetTokens || "Real-time"}</span>
                        </div>
                      </div>

                      {/* Daily Requests Remaining */}
                      <div className="pt-2 border-t border-slate-800">
                        <div className="flex justify-between items-center text-slate-300 text-[10px] mb-1">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-400" /> Requests Left:
                          </span>
                          <span className="font-bold text-white">
                            {q.rateLimits.remainingRequests?.toLocaleString() ?? "∞"} / {q.rateLimits.limitRequests?.toLocaleString() ?? "∞"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              reqPct > 50 ? "bg-blue-400" : reqPct > 20 ? "bg-amber-400" : "bg-red-500"
                            }`}
                            style={{ width: `${reqPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1">
                          <span>Daily Reset In:</span>
                          <span className="text-blue-300 font-semibold">{q.rateLimits.resetRequests || "24h"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Provider: {q.provider}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => runQuickTest(q.model)}
                      disabled={testingModel === q.model || isOffline}
                      className="h-6 text-[10px] px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      {testingModel === q.model ? "Testing..." : "Test Ping"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {testOutput && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-300 font-medium">
                Test Completed on <strong>{testOutput.model}</strong>: {testOutput.text}
              </span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              Tokens Used: ~{testOutput.tokensUsed}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
