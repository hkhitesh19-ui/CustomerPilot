"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, TrendingUp, Users, Clock, MessageSquare, Sparkles, RefreshCw, AlertTriangle } from "lucide-react"

export function MorningReportCard() {
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchReport() {
      try {
        const res = await fetch("/api/reports/morning")
        const json = await res.json()
        if (res.ok && isMounted) {
          setReport(json.report)
        }
      } catch (e) {
        console.error("Failed to load morning report", e)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchReport()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <Card className="border-border animate-pulse">
        <CardContent className="p-6 h-32 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!report) return null

  return (
    <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/40 via-background to-background dark:from-amber-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Sun className="w-5 h-5 text-amber-500" />
            Merchant Morning Report
          </CardTitle>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            {report.date}
          </span>
        </div>
        <CardDescription>
          Daily intelligence snapshot of your store's loyalty performance & AI suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="p-3 border rounded-xl bg-card">
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" /> Today's Revenue
            </p>
            <p className="text-xl font-bold text-foreground mt-1">₹{report.todayRevenue.toLocaleString()}</p>
          </div>

          <div className="p-3 border rounded-xl bg-card">
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" /> Repeat Customers
            </p>
            <p className="text-xl font-bold text-foreground mt-1">{report.repeatCustomers} / {report.totalCustomers}</p>
          </div>

          <div className="p-3 border rounded-xl bg-card">
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Live Queue
            </p>
            <p className="text-xl font-bold text-foreground mt-1">{report.waitingQueueCount} Waiting</p>
          </div>

          <div className="p-3 border rounded-xl bg-card">
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center justify-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-purple-500" /> Comm Health
            </p>
            <p className={`text-sm font-bold mt-2 ${report.communicationHealth === 'HEALTHY' ? 'text-green-600' : 'text-amber-600'}`}>
              {report.communicationHealth}
            </p>
          </div>
        </div>

        {report.aiSuggestions && report.aiSuggestions.length > 0 && (
          <div className="p-3.5 border rounded-xl bg-purple-500/5 border-purple-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <Sparkles className="w-4 h-4" /> AI Growth Suggestion
            </div>
            {report.aiSuggestions.map((sugg: string, idx: number) => (
              <p key={idx} className="text-xs text-muted-foreground leading-relaxed">• {sugg}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
