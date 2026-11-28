"use client"

import { useDashboardState } from "@/hooks/use-dashboard-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Users, ArrowRight, UserCheck, Sparkles, Zap, AlertTriangle, X, Globe, MessageSquare } from "lucide-react"
import { useState } from "react"
import { RewardModal } from "@/components/dashboard/RewardModal"
import { ManualStampModal } from "@/components/dashboard/ManualStampModal"
import Link from "next/link"

export default function QueuePage() {
  const { data, isLoading, refetch } = useDashboardState()
  const [selectedWaitingCustomer, setSelectedWaitingCustomer] = useState<any>(null)
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
  const [isManualStampModalOpen, setIsManualStampModalOpen] = useState(false)
  const [dismissingScanId, setDismissingScanId] = useState<string | null>(null)

  const handleDismissPendingScan = async (scanId: string) => {
    setDismissingScanId(scanId)
    try {
      await fetch("/api/queue/dismiss-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      })
      await refetch()
    } catch {
      // Ignore network errors on dismiss
    } finally {
      setDismissingScanId(null)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-slate-400 animate-pulse">Loading Live Queue...</div>
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Failed to load queue data.</p>
        <Link href="/login" className="text-sm text-indigo-400 underline">Login again</Link>
      </div>
    )
  }

  const waitingCustomers = data.waitingCustomers || []
  const pendingScanAlerts = data.pendingScanAlerts || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Live Queue (Manual Approval)</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Customers below have scanned the QR. Tap a customer to verify their purchase amount and manually award stamps.</p>
      </div>

      <Card className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-emerald-500/30 backdrop-blur-xl shadow-md dark:shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)] overflow-hidden relative min-h-[60vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-gradient-x" />
        
        <CardHeader className="bg-slate-50/70 dark:bg-slate-900/40 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-5 w-5 animate-pulse" /> 
                {waitingCustomers.length} Customers Waiting
              </CardTitle>
              <button
                onClick={() => setIsManualStampModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 hover:opacity-95 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Manual Stamp Override</span>
              </button>
            </div>
            {waitingCustomers.some((wc: any) => wc.customer?.referredBy || wc.customer?.referralsReceived?.[0]?.referrer || wc.referrer) && (
              <span className="flex items-center gap-1.5 text-xs font-black px-3 py-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/40 rounded-full animate-pulse shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Referral Alert: Referred Customer Waiting for Bill!
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 relative z-10 space-y-6">
          {pendingScanAlerts.length > 0 && (
            <div className="space-y-2.5">
              {pendingScanAlerts.map((scan) => {
                const scanIst = new Date(scan.scannedAt).toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                const isDropSuspected = scan.status === "drop_suspected"
                return (
                  <div
                    key={scan.scanId}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDropSuspected
                        ? "bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
                        : "bg-sky-50/90 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isDropSuspected
                            ? "bg-amber-500 text-white"
                            : "bg-sky-600 text-white"
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                            {isDropSuspected
                              ? "Pending QR Scan (WhatsApp Message Not Received)"
                              : "QR Scanned — Awaiting WhatsApp Message"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {scanIst} IST ({scan.elapsedSeconds >= 60 ? `${Math.floor(scan.elapsedSeconds / 60)}m ago` : `${scan.elapsedSeconds}s ago`})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          Customer tapped WhatsApp without entering mobile number. Ask customer at counter or use Manual Stamp Override.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsManualStampModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        Add Stamp
                      </button>
                      <button
                        type="button"
                        disabled={dismissingScanId === scan.scanId}
                        onClick={() => void handleDismissPendingScan(scan.scanId)}
                        aria-label="Dismiss pending scan alert"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {waitingCustomers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {waitingCustomers.map((wc: any) => {
                const scanDate = new Date(wc.scannedAt);
                const timeStr = scanDate.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
                const diffMs = Date.now() - scanDate.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffSecs = Math.floor(diffMs / 1000);
                const durationStr = diffMins > 0 ? `${diffMins} min${diffMins > 1 ? 's' : ''} ago` : `${diffSecs}s ago`;
                const phoneStr = wc.customer?.phone ? `+${wc.customer.phone.replace(/^91/, "91 ")}` : "Unknown";
                const referrer = wc.customer?.referredBy || wc.customer?.referralsReceived?.[0]?.referrer || wc.referrer;
                const isFirstVisitReferred = !!referrer && (!wc.customer?.lifetimeStamps || wc.customer.lifetimeStamps === 0);

                return (
                <div 
                  key={wc.id} 
                  onClick={() => {
                    setSelectedWaitingCustomer(wc);
                    setIsRewardModalOpen(true);
                  }}
                  className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 active:scale-95 group relative overflow-hidden cursor-pointer ${
                    referrer 
                      ? "border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-800/60 dark:to-slate-800/60 shadow-md hover:border-amber-500 hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)]"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm hover:border-emerald-500 hover:shadow-[0_0_15px_-3px_rgba(52,211,153,0.4)]"
                  }`}
                >
                  {/* Subtle background glow on hover */}
                  <div className={`absolute inset-0 transition-colors pointer-events-none ${referrer ? 'bg-amber-500/0 group-hover:bg-amber-500/5' : 'bg-emerald-500/0 group-hover:bg-emerald-500/5'}`} />

                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex flex-col">
                      <span className={`font-bold text-xl transition-colors ${referrer ? 'text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-300' : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-300'}`}>
                        {wc.customer?.name || "Guest"}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{phoneStr}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse border border-emerald-500/30 shadow-[0_0_10px_0_rgba(16,185,129,0.2)] whitespace-nowrap">
                        WAITING
                      </span>
                      {wc.scanSource?.startsWith("qr_web") && (
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center gap-1 ${
                            wc.waConfirmStatus === "wa_verified"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : wc.waConfirmStatus === "pending_wa"
                              ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
                              : "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
                          }`}
                        >
                          {wc.waConfirmStatus === "wa_verified" ? (
                            <>
                              <MessageSquare className="w-2.5 h-2.5" /> Web + WA OK
                            </>
                          ) : wc.waConfirmStatus === "pending_wa" ? (
                            <>
                              <Globe className="w-2.5 h-2.5" /> Web (WA Pending)
                            </>
                          ) : (
                            <>
                              <Globe className="w-2.5 h-2.5" /> Web Check-In
                            </>
                          )}
                        </span>
                      )}
                      {referrer && (
                        <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-pulse whitespace-nowrap">
                          🤝 REFERRED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── REFERRAL ALERT: WHO REFERRED THIS CUSTOMER ── */}
                  {referrer && (
                    <div className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/40 border border-amber-300 dark:border-amber-700/80 shadow-xs relative z-10 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded border border-amber-400/50">
                            REFERRED BY
                          </span>
                          <span className="text-xs font-black text-amber-950 dark:text-amber-100 truncate">
                            {referrer?.name || "VIP Member"}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium truncate mt-0.5">
                          Referrer: {referrer.phone ? `+91 ${referrer.phone.replace(/^91/, '')}` : 'Store VIP'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 relative z-10 bg-slate-100/80 dark:bg-slate-900/50 rounded-lg p-2.5 border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500/70" />
                      <span>{timeStr} IST</span>
                    </div>
                    <div className="font-medium text-amber-600 dark:text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded">
                      {durationStr}
                    </div>
                  </div>

                  <div className={`mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/50 text-xs font-bold flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity relative z-10 ${isFirstVisitReferred ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                    <span>{isFirstVisitReferred ? '🤝 First Visit Dual Stamps' : '🎁 Reward Stamp'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center relative h-full">
              <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full max-w-lg mx-auto" />
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-6 relative shadow-[0_0_30px_-5px_rgba(0,0,0,0.1)]">
                <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              </div>
              <p className="text-slate-800 dark:text-slate-300 font-medium text-xl">Queue is completely empty</p>
              <p className="text-sm text-slate-500 mt-3 max-w-sm">When a customer scans your VIP QR code at the counter, they will instantly drop into this grid.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <RewardModal 
        isOpen={isRewardModalOpen} 
        onClose={() => {
          setIsRewardModalOpen(false);
          setSelectedWaitingCustomer(null);
        }} 
        waitingCustomer={selectedWaitingCustomer}
        onSuccess={() => refetch()}
        merchantId={data?.merchant?.id || ""}
        stampValue={data?.stampCards?.[0]?.stampValue || 300}
      />

      <ManualStampModal
        isOpen={isManualStampModalOpen}
        onClose={() => setIsManualStampModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
