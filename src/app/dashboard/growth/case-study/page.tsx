"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowRight } from "lucide-react"

export default function CaseStudyPage() {
  const [snapshots, setSnapshots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation this would fetch from /api/growth/snapshot
    setSnapshots([])
    setIsLoading(false)
  }, [])

  const takeSnapshot = async () => {
    // POST to /api/growth/snapshot
    alert("Taking snapshot...")
  }

  const createCaseStudy = async () => {
    alert("Creating case study summary...")
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <FileText className="h-8 w-8 text-emerald-400" />
            Before / After Case Study
          </h1>
          <p className="text-slate-400 mt-2">Track the transformational impact of your loyalty program.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={takeSnapshot} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
            Take Day-0 Snapshot
          </Button>
          <Button onClick={createCaseStudy} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Create Case Study
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-slate-400 animate-pulse">Loading snapshots...</div>
      ) : snapshots.length > 0 ? (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl">
            <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
              <CardTitle className="text-lg text-slate-200">Impact Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Metric</th>
                      <th className="px-6 py-4 font-semibold">Day 0</th>
                      <th className="px-6 py-4 font-semibold">Current</th>
                      <th className="px-6 py-4 font-semibold">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {/* Placeholder rows */}
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">Loyalty Members</td>
                      <td className="px-6 py-4">0</td>
                      <td className="px-6 py-4">150</td>
                      <td className="px-6 py-4 text-emerald-400 flex items-center gap-1">+150 <ArrowRight className="w-3 h-3"/></td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">Google Reviews</td>
                      <td className="px-6 py-4">20</td>
                      <td className="px-6 py-4">45</td>
                      <td className="px-6 py-4 text-emerald-400 flex items-center gap-1">+25 <ArrowRight className="w-3 h-3"/></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl text-center py-16">
          <CardContent>
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-200 mb-2">No Snapshots Found</h3>
            <p className="text-slate-400 mb-6">Take your first snapshot to start tracking growth.</p>
            <Button onClick={takeSnapshot} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Take Day-0 Snapshot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
