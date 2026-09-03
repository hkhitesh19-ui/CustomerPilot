"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, QrCode, Clock, Info } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"

const TOTAL_SESSION_SECONDS = 600 // 10 minutes

export function WhatsAppVerification({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [phone, setPhone] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  // QR state & 10-minute live countdown
  const [qrCode, setQrCode] = useState("")
  const [isPolling, setIsPolling] = useState(false)
  const [sessionCountdown, setSessionCountdown] = useState(TOTAL_SESSION_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const silentRefreshRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (data?.merchant?.whatsappPhone) {
      setPhone(data.merchant.whatsappPhone)
      setIsVerified(true)
    }
  }, [data?.merchant?.whatsappPhone])

  // Format seconds into MM:SS format (e.g. 09:45)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60)
    const secs = Math.max(0, totalSeconds) % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Polling for WhatsApp connection status every 3 seconds
  useEffect(() => {
    if (!isPolling || isVerified) return

    const statusInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/whatsapp/status", {
          headers: { "x-merchant-id": merchantId }
        })
        if (res.ok) {
          const result = await res.json()
          if (result.connected) {
            clearInterval(statusInterval)
            if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
            if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
            setIsPolling(false)
            setIsVerified(true)
            setQrCode("")
            if (result.whatsappPhone) {
              setPhone(result.whatsappPhone)
            }
            refetch()
            toast({ title: "Connected! 🎉", description: "WhatsApp Business number verified and connected successfully!" })
          }
        }
      } catch (e: any) {
        if (e.name !== "TypeError" && !e.message?.includes("Failed to fetch")) {
          console.error("Status polling error", e)
        }
      }
    }, 3000)

    return () => clearInterval(statusInterval)
  }, [isPolling, isVerified, merchantId, refetch, toast])

  // 10-Minute Live Session Countdown Timer
  useEffect(() => {
    if (!qrCode || isVerified) {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      return
    }

    sessionTimerRef.current = setInterval(() => {
      setSessionCountdown((prev) => {
        if (prev <= 1) {
          // 10 minutes expired
          if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
          if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
          setIsPolling(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    }
  }, [qrCode, isVerified])

  // Automatic Silent Background Refresh every 20 seconds
  // This keeps the underlying Baileys cryptographic QR token active on WhatsApp servers
  // without disrupting the user's 10-minute session countdown.
  useEffect(() => {
    if (!qrCode || isVerified || sessionCountdown <= 0) {
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
      return
    }

    silentRefreshRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/whatsapp/connect", {
          headers: { "x-merchant-id": merchantId }
        })
        if (res.ok) {
          const result = await res.json()
          if (result.connected) {
            setIsVerified(true)
            setQrCode("")
            setIsPolling(false)
            if (result.whatsappPhone) setPhone(result.whatsappPhone)
            refetch()
          } else if (result.qrCodeBase64) {
            // Silently update QR code image
            setQrCode(result.qrCodeBase64)
          }
        }
      } catch (e) {
        // Silent failure - background retry next cycle
      }
    }, 20000)

    return () => {
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
    }
  }, [qrCode, isVerified, sessionCountdown, merchantId, refetch])

  // User triggers initial or forced connect
  const handleConnect = async (force: boolean = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (force) params.append("force", "true")

      const res = await fetch(`/api/whatsapp/connect?${params.toString()}`, {
        headers: { "x-merchant-id": merchantId }
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Failed to initiate WhatsApp connection.")

      if (result.connected) {
        setIsVerified(true)
        if (result.whatsappPhone) setPhone(result.whatsappPhone)
        toast({ title: "Success", description: "WhatsApp number is already connected!" })
      } else if (result.qrCodeBase64) {
        setQrCode(result.qrCodeBase64)
        setIsPolling(true)
        setSessionCountdown(TOTAL_SESSION_SECONDS) // Reset 10-minute countdown
        toast({
          title: "Scan QR Code",
          description: "QR Code is live and active for 10 minutes with automatic silent refresh."
        })
      } else {
        throw new Error("No QR code received from WhatsApp server.")
      }
    } catch (e: any) {
      toast({ title: "Connection Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/whatsapp/disconnect", {
        method: "DELETE",
        headers: { "x-merchant-id": merchantId }
      })
      if (!res.ok) throw new Error("Failed to disconnect.")

      setPhone("")
      setIsVerified(false)
      setQrCode("")
      setIsPolling(false)
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
      refetch()
      toast({ title: "Disconnected", description: "WhatsApp session cleared and instance deleted." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-[#25D366]"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp Business Connection
            </CardTitle>
            <CardDescription>
              Connect your official store WhatsApp number to send automated digital stamp cards, AI review requests, and reward notifications.
            </CardDescription>
          </div>
          <div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full dark:bg-amber-950 dark:text-amber-400 border border-amber-300">
                <AlertCircle className="w-3.5 h-3.5" /> Not Connected
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connected View */}
        {isVerified ? (
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">WhatsApp Linked & Operational</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Linked Phone: <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">+{phone || "Active"}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
              onClick={handleDisconnect}
              disabled={loading}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Disconnect
            </Button>
          </div>
        ) : (
          /* Not Connected View — 10-Minute Live QR Session */
          <div className="space-y-4">
            {!qrCode || sessionCountdown <= 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <QrCode className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                    {sessionCountdown <= 0 ? "Session Expired (10 Minutes)" : "Connect via WhatsApp QR Code"}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    {sessionCountdown <= 0
                      ? "The 10-minute linking window expired. Click below to generate a fresh QR code."
                      : "Click below to generate a live QR code. You have 10 full minutes to scan, with automatic silent background refresh."}
                  </p>
                </div>
                <Button
                  onClick={() => handleConnect(true)}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-emerald-600/20"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                  {sessionCountdown <= 0 ? "Generate Fresh 10-Min QR Code" : "Generate WhatsApp QR Code"}
                </Button>
              </div>
            ) : (
              <div className="p-6 border border-emerald-200 dark:border-emerald-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                {/* QR Image with 10-Minute Live Countdown */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-64 h-64 bg-white p-3 rounded-2xl shadow-md border-2 border-emerald-400/80 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                  </div>

                  {/* 10-Minute Live Session Badge */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-700 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Session Valid For: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{formatTime(sessionCountdown)}</strong></span>
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Auto-refreshing silently in background
                  </p>
                </div>

                {/* 3 Simple Scan Steps & Force Reset */}
                <div className="space-y-4 max-w-sm">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Scan on Your Phone in 10 Seconds:</h4>
                    <p className="text-xs text-slate-500">Your session stays active for 10 full minutes</p>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                      <span>Open <strong>WhatsApp</strong> on your store mobile phone.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                      <span>Tap <strong>Settings / 3-Dots</strong> ➔ select <strong>Linked Devices</strong>.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                      <span>Tap <strong>Link a Device</strong> and point your camera at the QR code on the left.</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnect(true)}
                      disabled={loading}
                      className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                      Reset 10-Min Session
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setQrCode(""); setIsPolling(false); }}
                      className="text-xs text-slate-500"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Automatic silent refresh keeps the QR code fresh in the background, preventing WhatsApp's "couldn't link device" timeout.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
