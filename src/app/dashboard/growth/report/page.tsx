"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Share2 } from "lucide-react"

export default function GrowthReportPage() {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation this would fetch from /api/growth/monthly-report
    setReports([])
    setIsLoading(false)
  }, [])

  const generateReport = async () => {
    // POST to /api/growth/monthly-report
    alert("Generating report...")
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-indigo-400" />
            Monthly Growth Report
          </h1>
          <p className="text-slate-400 mt-2">Generate and view monthly summaries of your loyalty program performance.</p>
        </div>
        <Button onClick={generateReport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Generate Report
        </Button>
      </div>

      {isLoading ? (
        <div className="p-8 text-slate-400 animate-pulse">Loading reports...</div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report, idx) => (
            <Card key={idx} className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl">
              <CardHeader className="bg-slate-900/40 border-b border-slate-800/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-slate-200">{report.month}</CardTitle>
                </div>
                <Button variant="outline" className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
                  <Share2 className="w-4 h-4 mr-2" /> Share My Growth
                </Button>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-slate-400">New Customers</div>
                  <div className="text-2xl font-bold text-white">{report.newCustomers}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Stamps Issued</div>
                  <div className="text-2xl font-bold text-white">{report.stampsIssued}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Rewards Redeemed</div>
                  <div className="text-2xl font-bold text-white">{report.rewardsRedeemed}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Reviews Received</div>
                  <div className="text-2xl font-bold text-white">{report.reviewsReceived}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl text-center py-16">
          <CardContent>
            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-200 mb-2">No Reports Yet</h3>
            <p className="text-slate-400 mb-6">Generate your first report to track your monthly progress.</p>
            <Button onClick={generateReport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Generate your first report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
