"use client"

import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Gift, Award, TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"

export default function RewardsPage() {
  const { data, isLoading } = useDashboardState()

  if (isLoading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading Rewards Data...</div>
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load rewards data.</p>
        <Link href="/login" className="text-sm text-indigo-400 underline">Login again</Link>
      </div>
    )
  }

  const redemptions = data.redemptions || []
  const rewards = data.rewards || []
  const stampCards = data.stampCards || []

  // Active config
  const activeCard = stampCards[0] || { name: "Loyalty Card", stampsRequired: 10, rewardName: "Free Item", stampValue: 500 }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Rewards Center</h1>
          <p className="text-slate-400 mt-2">Monitor reward claims and manage your loyalty strategy.</p>
        </div>
        <Link href="/dashboard/settings">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_-3px_rgba(79,70,229,0.5)]">
            <Sparkles className="w-4 h-4" /> Edit Reward Rules
          </button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Total Rewards Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white flex items-center gap-3">
              {redemptions.length}
              <Gift className="w-6 h-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Active Reward Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white truncate">{activeCard.rewardName}</div>
            <p className="text-sm text-amber-400 mt-1">Requires {activeCard.stampsRequired} Stamps</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium">Stamp Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">₹{activeCard.stampValue} <span className="text-sm text-slate-400 font-normal">per stamp</span></div>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Average ticket size</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl overflow-hidden mt-8">
        <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <Award className="h-5 w-5" /> 
            Recent Redemptions
          </CardTitle>
          <CardDescription className="text-slate-400">Log of customers who successfully claimed their free rewards.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {redemptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer ID</th>
                    <th className="px-6 py-4 font-semibold">Reward Claimed</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {redemptions.slice(0, 20).map((redemption: any) => (
                    <tr key={redemption.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{redemption.customerId}</td>
                      <td className="px-6 py-4 font-medium text-emerald-400">{redemption.rewardName || activeCard.rewardName}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(redemption.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-300 font-medium text-lg">No rewards claimed yet</p>
              <p className="text-sm text-slate-500 mt-2">When a customer reaches their stamp goal, their redemption will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
