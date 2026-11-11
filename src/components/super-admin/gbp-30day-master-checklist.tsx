"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  BarChart3,
  Calendar,
} from "lucide-react"
import { MASTER_30DAY_SPRINT_CHECKLIST, MasterChecklistItem } from "@/lib/gbp-checklist-seed"

export function Gbp30DayMasterChecklist({
  merchantName = "Cake Connection",
  currentReviews = 689,
  targetKeyword = "cake shop in Manjalpur",
}: {
  merchantName?: string
  currentReviews?: number
  targetKeyword?: string
}) {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    s0_1: true,
    s0_2: true,
    s0_3: true,
    w1_1: true,
    w1_2: true,
    w1_3: true,
    w1_4: true,
    w2_1: true,
    w2_2: true,
    w2_3: true,
  })

  const [activeStage, setActiveStage] = useState<string>("ALL")

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const totalTasks = MASTER_30DAY_SPRINT_CHECKLIST.length
  const completedCount = Object.values(completedTasks).filter(Boolean).length
  const progressPercent = Math.round((completedCount / totalTasks) * 100)

  const stages = [
    { key: "ALL", label: "All Tasks (16)" },
    { key: "STEP_ZERO", label: "Day 0: Step Zero Audit" },
    { key: "WEEK_1", label: "Days 1–7: Foundations (51%)" },
    { key: "WEEK_2", label: "Days 8–15: Velocity (16%)" },
    { key: "WEEK_3", label: "Days 16–22: Media & NAP (22%)" },
    { key: "WEEK_4", label: "Days 23–30: Traffic & Top 3 (8%)" },
  ]

  const filteredTasks =
    activeStage === "ALL"
      ? MASTER_30DAY_SPRINT_CHECKLIST
      : MASTER_30DAY_SPRINT_CHECKLIST.filter((t) => t.stage === activeStage)

  return (
    <div className="space-y-6">
      {/* Header & Metric Banner */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
                <Target className="w-3.5 h-3.5" /> Module 4: Integrated 30-Day Master Execution Checklist
              </div>
              <h2 className="text-2xl font-black text-white">
                30-Day Google Maps Top 3 Sprint: {merchantName}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Algorithm-Weighted Execution Sprint · Target: <strong>{targetKeyword}</strong>
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Sprint Progress</div>
                <div className="text-2xl font-black text-emerald-400">
                  {completedCount} / {totalTasks} Tasks
                </div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-500 flex items-center justify-center font-bold text-sm text-white">
                {progressPercent}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Zero Baseline Intelligence Pillbox */}
        <CardContent className="p-6 space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                Step Zero Baseline Protocol: Multi-Pin GPS &amp; Deficit Calculation
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Audited Coordinates · Vadodara Micro-Zone
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <strong className="text-white block mb-0.5">Pin A (Hyper-Local 0.5 km)</strong>
                <span className="text-slate-400 block mb-1">EVA Mall, Manjalpur (22.2647° N, 73.1919° E)</span>
                <span className="text-emerald-400 font-bold">Daytime: Rank #4 · Midnight: Rank #3</span>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <strong className="text-white block mb-0.5">Pin B (Transit Node 2.0 km)</strong>
                <span className="text-slate-400 block mb-1">Manjalpur Naka / Darbar Chokdi</span>
                <span className="text-blue-400 font-bold">Daytime: Rank #7 · Midnight: Rank #6</span>
              </div>

              <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                <strong className="text-white block mb-0.5">Pin C (Outlying Sub-Area 3.5 km)</strong>
                <span className="text-slate-400 block mb-1">Kalali / Atladara Link Road</span>
                <span className="text-purple-400 font-bold">Daytime: Rank #12 · Midnight: Rank #9</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                ⚡ <strong>Time-Split Verification:</strong> 2:00 PM (Standard Daytime) vs 10:30 PM (Late-Night Peak / "Open Now" Algorithmic Boost Active).
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                Deficit to #3: 0 (Already in Top 3 late-night)
              </span>
            </div>
          </div>

          {/* Stage Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
            {stages.map((stg) => (
              <button
                key={stg.key}
                onClick={() => setActiveStage(stg.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeStage === stg.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {stg.label}
              </button>
            ))}
          </div>

          {/* Task Items Table / List */}
          <div className="space-y-3 pt-2">
            {filteredTasks.map((task) => {
              const isDone = !!completedTasks[task.id]
              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isDone
                      ? "bg-slate-950/40 border-emerald-900/40 text-slate-300"
                      : "bg-slate-950 border-slate-800 text-slate-100 hover:border-slate-700"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {task.id}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{task.daysRange}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                          {task.algorithmWeight}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          isDone
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/50"
                            : "bg-amber-950/60 text-amber-300 border border-amber-800/50"
                        }`}
                      >
                        {isDone ? "✅ Verified" : "⏳ In Progress"}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold ${isDone ? "line-through text-slate-400" : "text-white"}`}>
                      {task.actionItem}
                    </h4>

                    <p className="text-xs text-slate-400">
                      <strong>Verification Metric:</strong> {task.verificationMetric}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
