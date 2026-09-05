"use client"

import { useState, useEffect } from "react"
import { Star, Gift, Crown, ExternalLink, RefreshCw, Sparkles, CheckCircle2, Clock, Camera } from "lucide-react"

interface WalletData {
  customer: {
    id: string
    name: string
    phone: string
    vipTier: string
    lifetimeStamps: number
    walletCredit: number
  }
  merchant: {
    id: string
    name: string
    logoUrl: string | null
    address: string | null
    whatsappPhone: string | null
  }
  rule: {
    id: string
    title: string
    stampsRequired: number
    rewardName: string
    googleReviewBonus: number
    photoBonus: number
  }
  card: {
    id: string | null
    stampsCollected: number
    stampsRequired: number
    isCompleted: boolean
    isRewardReady: boolean
    rewardName: string
  }
  stampsHistory: Array<{
    id: string
    source: string
    label: string
    icon: string
    createdAt: string
  }>
  reviewStatus: {
    hasPostedReview: boolean
    hasPostedPhoto: boolean
    reviewUrl: string
  }
}

export function DigitalWalletClient({ initialData }: { initialData: WalletData }) {
  const [data, setData] = useState<WalletData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date())

  const fetchLatest = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true)
      const res = await fetch(`/api/wallet/${data.customer.id}`, { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setData(json)
          setLastRefreshedAt(new Date())
        }
      }
    } catch (err) {
      console.warn("[Wallet] Silent refresh failed:", err)
    } finally {
      if (!silent) setIsRefreshing(false)
    }
  }

  // Silent auto-poll every 12 seconds for real-time counter updates
  useEffect(() => {
    const timer = setInterval(() => {
      fetchLatest(true)
    }, 12000)
    return () => clearInterval(timer)
  }, [data.customer.id])

  const stampsCollected = data.card.stampsCollected
  const stampsRequired = data.card.stampsRequired || 10
  const progressPercent = Math.min(100, Math.round((stampsCollected / stampsRequired) * 100))
  const remaining = Math.max(0, stampsRequired - stampsCollected)

  const stampSlots = Array.from({ length: stampsRequired }, (_, i) => i < stampsCollected)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
      <div className="w-full max-w-md space-y-6">

        {/* Live Bar & Manual Refresh */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold tracking-wide uppercase text-emerald-400">
              Live Digital Wallet
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchLatest(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-full transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Store & Customer Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center p-1.5 shadow-xl overflow-hidden">
            {data.merchant.logoUrl ? (
              <img src={data.merchant.logoUrl} alt={data.merchant.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Crown className="w-8 h-8 text-emerald-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            Hi, {data.customer.name} <span className="inline-block animate-bounce origin-bottom">❤️</span>
          </h1>
          <p className="text-slate-400 text-xs">
            Official VIP Member at <strong className="text-slate-200">{data.merchant.name}</strong>
          </p>
        </div>

        {/* UNLOCKED REWARD BANNER (If Reward Ready) */}
        {data.card.isRewardReady && (
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-400/50 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-500 text-center space-y-2">
            <div className="inline-flex p-2.5 bg-amber-400 text-slate-950 rounded-full shadow-lg">
              <Gift className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                Reward Unlocked 🎉
              </span>
              <h2 className="text-xl font-black text-amber-300">
                FREE {data.card.rewardName}
              </h2>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Show this screen to our counter staff at <strong>{data.merchant.name}</strong> to claim your FREE treat!
              </p>
            </div>
          </div>
        )}

        {/* DIGITAL STAMP CARD */}
        <div className="relative group perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-700"></div>
          <div className="relative bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
            
            {/* Card Progress Header */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  VIP Loyalty Card
                </span>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                  Your Stamp Collection
                </h2>
              </div>
              <div className="text-right">
                <span className="inline-block bg-emerald-500/20 text-emerald-300 text-sm font-black px-3 py-1 rounded-full border border-emerald-500/30 shadow-inner">
                  {stampsCollected} / {stampsRequired}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>{progressPercent}% Complete</span>
                <span>{remaining > 0 ? `${remaining} stamp(s) to goal` : "Goal Achieved! 🏆"}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Stamp Grid (Interactive Visual Slots) */}
            <div className="grid grid-cols-5 gap-3 pt-2">
              {stampSlots.map((isFilled, index) => (
                <div key={index} className="flex flex-col items-center gap-1.5 relative">
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${
                      isFilled 
                        ? "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105 border border-amber-300" 
                        : "bg-slate-950 text-slate-600 border border-slate-800 border-dashed"
                    }`}
                  >
                    {isFilled ? "⭐" : <span className="text-xs font-bold text-slate-600">{index + 1}</span>}
                  </div>
                  {index === stampsRequired - 1 && (
                    <div className="absolute -bottom-5 w-max text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                      Goal 🎁
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next Reward Callout */}
            <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 flex items-center gap-3.5 mt-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Stamp Target Reward</p>
                <p className="font-bold text-slate-200 text-sm truncate">{data.card.rewardName}</p>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {remaining === 0 ? "Unlocked!" : `${remaining} left`}
              </span>
            </div>

          </div>
        </div>

        {/* BONUS STAMP EARNING OPPORTUNITIES */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            ⚡ Quick Bonus Stamps
          </h3>

          {/* Google Review + Photo Bonus Action */}
          <a 
            href={data.reviewStatus.reviewUrl} 
            className="block group no-underline"
          >
            <div className="bg-gradient-to-r from-blue-950/50 via-indigo-950/40 to-slate-900 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl p-4 flex items-center justify-between transition-all group-hover:shadow-lg group-hover:shadow-blue-500/10">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-sm text-slate-100">
                    Google Review Bonus
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    +{data.rule.googleReviewBonus || 2} Stamps
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-teal-400" />
                  <span>Attach photo for extra <strong>+{data.rule.photoBonus || 2} Photo Stamps</strong>!</span>
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 group-hover:scale-110 transition-transform flex-shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </a>

          {/* WhatsApp Invite Friend */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `Hi! Join me at ${data.merchant.name} VIP Club on CustomerPilot and get special welcome stamps! 🎁`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="block group no-underline"
          >
            <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl p-4 flex items-center justify-between transition-all">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-100">Refer a Friend</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    +₹50 / Bonus
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Invite your friends to earn rewards together on WhatsApp.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform flex-shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </a>
        </div>

        {/* STAMP ACTIVITY HISTORY */}
        {data.stampsHistory && data.stampsHistory.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
              <span>📜 Stamp Activity History</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Total Lifetime: {data.customer.lifetimeStamps} ⭐
              </span>
            </h3>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-lg">
              {data.stampsHistory.slice(0, 8).map((item) => (
                <div key={item.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="font-bold text-slate-200">{item.label}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    +1 Stamp
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRANDING FOOTER */}
        <div className="pt-6 pb-4 border-t border-slate-900 text-center space-y-1">
          <p className="text-[11px] text-slate-500">
            Powered by <a href="/for-business" className="text-indigo-400 hover:text-indigo-300 font-bold">CustomerPilot</a> 🚀
          </p>
          <p className="text-[10px] text-slate-600">
            Last updated: {lastRefreshedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>

      </div>
    </div>
  )
}
