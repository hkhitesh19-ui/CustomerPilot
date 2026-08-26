"use client"

import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, Users, Star, Gift, MessageCircle, BarChart3 } from "lucide-react"

export default function GrowthOverviewPage() {
  const { data, isLoading } = useDashboardState()

  if (isLoading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading Growth Data...</div>
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load growth data.
      </div>
    )
  }

  const customersCount = data.customers?.length || 0
  const stampsIssued = data.customers?.reduce((acc: number, c: any) => acc + (c.lifetimeStamps || 0), 0) || 0
  const rewardsRedeemed = data.redemptions?.length || 0
  const reviewsCount = data.merchant?.googleReviewsCount || 0 // Assuming from merchant

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-emerald-400" />
          Growth Overview
        </h1>
        <p className="text-slate-400 mt-2">Track the overall impact of CustomerPilot on your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400" /> Total Loyalty Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {customersCount}
            </div>
            <p className="text-sm text-indigo-400 mt-1 flex items-center gap-1">Growing steadily</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" /> Total Stamps Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {stampsIssued}
            </div>
            <p className="text-sm text-amber-400 mt-1 flex items-center gap-1">Customer engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <Gift className="h-4 w-4 text-emerald-400" /> Rewards Redeemed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {rewardsRedeemed}
            </div>
            <p className="text-sm text-emerald-400 mt-1 flex items-center gap-1">Value delivered</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-400" /> Google Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">
              {reviewsCount}
            </div>
            <p className="text-sm text-blue-400 mt-1 flex items-center gap-1">Online reputation</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl overflow-hidden mt-8">
        <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
          <CardTitle className="flex items-center gap-2 text-indigo-400">
            <BarChart3 className="h-5 w-5" /> 
            Growth Timeline
          </CardTitle>
          <CardDescription className="text-slate-400">Historical performance metrics over time.</CardDescription>
        </CardHeader>
        <CardContent className="p-12 text-center text-slate-400">
          <p>Charts and timeline data will be populated as your business gathers more data.</p>
        </CardContent>
      </Card>
    </div>
  )
}
