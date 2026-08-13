"use client"

import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Star, Clock, BrainCircuit, Activity, Crown, Calendar, Zap, ArrowRight } from "lucide-react"
import { RewardModal } from "@/components/dashboard/RewardModal"
import { useState } from "react"
import { CommunicationStatusCard } from "@/components/communication-status-card"
import { MorningReportCard } from "@/components/morning-report-card"
import Link from "next/link"

export default function DashboardHome() {
  const { data, isLoading, isError, refetch } = useDashboardState()
  const [selectedWaitingCustomer, setSelectedWaitingCustomer] = useState<any>(null)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="animate-pulse bg-muted/50 h-32" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">Failed to load dashboard data.</p>
        <Link href="/login" className="text-sm text-blue-600 underline">Click here to login</Link>
      </div>
    )
  }

  // Derived Metrics (REAL DATA)
  const repeatCustomers = data.customers.filter((c: any) => c.totalVisits > 1)
  const customersBroughtBack = repeatCustomers.length
  
  const repeatRevenue = repeatCustomers.reduce((acc: number, c: any) => acc + (c.lifetimeSpend || 0), 0)
  
  const totalReviews = data.reviews.length
  const avgGoogleRating = totalReviews > 0 
    ? (data.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : "N/A"

  const liveQueueCount = data.waitingCustomers.length
  
  const activeSubscription = data.subscriptions.find((s: any) => s.status === "active") || { planId: "FREE", status: "none" }
  const trialEndsAt = data.merchant?.trialEndsAt ? new Date(data.merchant.trialEndsAt) : null
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const aiSupportTickets = data.supportTickets.filter((t: any) => t.status === "open").length
  const recentActivities = data.auditLogs.slice(0, 5)

  // Onboarding resume banner
  const isOnboardingComplete = data.merchant.onboardingCompleted
  const currentStep = data.merchant.currentStep || 1

  return (
    <div className="space-y-6">
      {/* Onboarding Resume Banner */}
      {!isOnboardingComplete && (
        <div className="bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">⚡ Complete Your Setup to Go Live!</p>
              <p className="text-white/80 text-xs mt-0.5">You're on Step {currentStep} of 8 — finish setup to activate your loyalty system.</p>
            </div>
          </div>
          <Link
            href={`/onboarding?step=${currentStep}`}
            className="bg-white text-indigo-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-white/90 flex-shrink-0"
          >
            Resume Setup →
          </Link>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Crown className="h-4 w-4 text-amber-500" /> Plan: {activeSubscription.planId}</span>
          <span className="px-2">|</span>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Trial: {trialDaysLeft} days left</span>
        </div>
      </div>

      <MorningReportCard />

      {/* Top Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-300">Customers Brought Back</CardTitle>
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white">{customersBroughtBack}</div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Repeat visitors
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-300">Repeat Revenue</CardTitle>
            <div className="bg-indigo-500/20 p-2 rounded-lg">
              <CreditCard className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white">₹{repeatRevenue.toLocaleString()}</div>
            <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
              From returning customers
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-300">Average Google Rating</CardTitle>
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <Star className="h-4 w-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white">{avgGoogleRating}</div>
            <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
              {totalReviews} total reviews
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-pink-500/50 transition-colors duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-300">Live Queue Summary</CardTitle>
            <div className="bg-pink-500/20 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-pink-400" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white">{liveQueueCount}</div>
            <p className="text-xs text-pink-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
              Currently waiting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Queue Section */}
      <Card className="bg-slate-900/60 border-emerald-500/30 backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-gradient-x" />
        
        <CardHeader className="bg-slate-900/40 pb-4 border-b border-slate-800">
          <CardTitle className="flex items-center gap-2 text-emerald-400">
            <Clock className="h-5 w-5 animate-pulse" /> 
            Live Queue — Waiting Customers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          {data.waitingCustomers && data.waitingCustomers.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.waitingCustomers.map((wc: any) => (
                <div 
                  key={wc.id} 
                  onClick={() => {
                    setSelectedWaitingCustomer(wc);
                    setIsRewardModalOpen(true);
                  }}
                  className="flex flex-col p-4 rounded-xl border border-slate-700 bg-slate-800/50 shadow-inner hover:border-emerald-400 hover:shadow-[0_0_15px_-3px_rgba(52,211,153,0.4)] cursor-pointer transition-all duration-300 active:scale-95 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg text-slate-100 group-hover:text-emerald-300 transition-colors">{wc.customer?.name || "Guest"}</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse border border-emerald-500/30">
                      WAITING
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Joined {Math.floor((Date.now() - new Date(wc.scannedAt).getTime()) / 1000)} seconds ago
                  </span>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs font-semibold text-emerald-500 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                    Tap to Reward <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center relative">
              <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] rounded-full" />
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 relative shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]">
                <Users className="w-8 h-8 text-slate-500" />
                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <p className="text-slate-300 font-medium">Queue is empty</p>
              <p className="text-xs text-slate-500 mt-2 max-w-[250px]">When a customer scans your VIP QR code, they will magically appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity (Morning Report) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Morning Report & Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map((log: any) => (
                  <li key={log.id} className="flex items-center gap-4 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="flex-1">{log.action}</span>
                    <span className="text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity found.</p>
            )}
          </CardContent>
        </Card>

        {/* AI Status & Suggestions */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-purple-500" /> AI Engine</CardTitle>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 animate-pulse">
              Status: Learning...
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3">
              <h4 className="text-sm font-semibold">AI Auto-Reply</h4>
              <p className="text-xs text-muted-foreground mt-1">Monitoring {totalReviews} Google Reviews. No urgent replies needed.</p>
            </div>
            <div className="rounded-lg border p-3">
              <h4 className="text-sm font-semibold">Customer Support</h4>
              <p className="text-xs text-muted-foreground mt-1">{aiSupportTickets > 0 ? `${aiSupportTickets} tickets awaiting AI draft resolution.` : 'Inbox Zero. AI agent is standing by.'}</p>
            </div>
            <div className="rounded-lg border p-3 bg-primary/5">
              <h4 className="text-sm font-semibold text-primary">AI Suggestion</h4>
              <p className="text-xs text-muted-foreground mt-1">You have {data.customers.length} total customers. Consider launching a Win-Back campaign for the {data.customers.length - customersBroughtBack} one-time visitors to boost your repeat revenue.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CommunicationStatusCard />
      </div>

      <RewardModal 
        isOpen={isRewardModalOpen} 
        onClose={() => {
          setIsRewardModalOpen(false);
          setSelectedWaitingCustomer(null);
        }} 
        waitingCustomer={selectedWaitingCustomer}
        onSuccess={() => refetch()}
        merchantId={data?.merchant?.id || ""}
      />
    </div>
  )
}
