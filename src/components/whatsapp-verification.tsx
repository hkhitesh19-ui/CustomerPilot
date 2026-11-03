"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, QrCode, Clock, Copy, Check, Smartphone, ShieldCheck, Sparkles } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"

const TOTAL_SESSION_SECONDS = 600 // 10 minutes

export function WhatsAppVerification({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [phone, setPhone] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialChecking, setInitialChecking] = useState(true)

  // Dual-linking modes: "pairing" (8-digit code - 100% reliable) vs "qr" (camera scan)
  const [connectMode, setConnectMode] = useState<"pairing" | "qr">("pairing")
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)

  // QR state & 10-minute live countdown
  const [qrCode, setQrCode] = useState("")
  const [isPolling, setIsPolling] = useState(false)
  const [sessionCountdown, setSessionCountdown] = useState(TOTAL_SESSION_SECONDS)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const silentRefreshRef = useRef<NodeJS.Timeout | null>(null)

  // Verify real live socket state with Evolution API on mount
  useEffect(() => {
    let isMounted = true
    const checkLiveStatus = async () => {
      try {
        const queryParam = merchantId ? `?merchantId=${encodeURIComponent(merchantId)}` : ""
        const res = await fetch(`/api/whatsapp/status${queryParam}`, {
          headers: merchantId ? { "x-merchant-id": merchantId } : {}
        })
        if (res.ok) {
          const result = await res.json()
          if (!isMounted) return
          if (result.connected) {
            setIsVerified(true)
            setPhone(result.whatsappPhone || data?.merchant?.whatsappPhone || "")
          } else {
            setIsVerified(false)
            if (data?.merchant?.whatsappPhone) {
              setPhone(data.merchant.whatsappPhone)
            }
          }
        } else {
          if (!isMounted) return
          setIsVerified(false)
          if (data?.merchant?.whatsappPhone) {
            setPhone(data.merchant.whatsappPhone)
          }
        }
      } catch (err) {
        if (!isMounted) return
        setIsVerified(false)
        if (data?.merchant?.whatsappPhone) {
          setPhone(data.merchant.whatsappPhone)
        }
      } finally {
        if (isMounted) setInitialChecking(false)
      }
    }

    checkLiveStatus()
    return () => {
      isMounted = false
    }
  }, [merchantId, data?.merchant?.whatsappPhone])

  // Format seconds into MM:SS format (e.g. 09:45)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60)
    const secs = Math.max(0, totalSeconds) % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Polling for WhatsApp connection status every 2.5 seconds when active
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
            setPairingCode(null)
            if (result.whatsappPhone) {
              setPhone(result.whatsappPhone)
            }
            refetch()
            toast({ title: "WhatsApp Connected! 🎉", description: "Store WhatsApp number verified and connected successfully!" })
          }
        }
      } catch (e: any) {
        if (e.name !== "TypeError" && !e.message?.includes("Failed to fetch")) {
          console.error("Status polling error", e)
        }
      }
    }, 2500)

    return () => clearInterval(statusInterval)
  }, [isPolling, isVerified, merchantId, refetch, toast])

  // 10-Minute Live Session Countdown Timer
  useEffect(() => {
    if ((!qrCode && !pairingCode) || isVerified) {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      return
    }

    sessionTimerRef.current = setInterval(() => {
      setSessionCountdown((prev) => {
        if (prev <= 1) {
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
  }, [qrCode, pairingCode, isVerified])

  // Automatic Silent Background Refresh every 25 seconds for QR mode
  useEffect(() => {
    if (connectMode !== "qr" || !qrCode || isVerified || sessionCountdown <= 0) {
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
      return
    }

    silentRefreshRef.current = setInterval(async () => {
      try {
        const phoneParam = phone ? `&phone=${encodeURIComponent(phone)}` : ""
        const res = await fetch(`/api/whatsapp/connect?silent=true${phoneParam}`, {
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
            setQrCode(result.qrCodeBase64)
          }
        }
      } catch (e) {}
    }, 25000)

    return () => {
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current)
    }
  }, [connectMode, qrCode, isVerified, sessionCountdown, merchantId, refetch, phone])

  // Trigger Connect in either Pairing Code mode or QR Scan mode
  const handleConnect = async (mode: "pairing" | "qr", force: boolean = false) => {
    setLoading(true)
    setConnectMode(mode)
    try {
      const params = new URLSearchParams()
      if (force) params.append("force", "true")
      params.append("mode", mode)
      if (phone) params.append("phone", phone)

      const res = await fetch(`/api/whatsapp/connect?${params.toString()}`, {
        headers: { "x-merchant-id": merchantId }
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Failed to initiate WhatsApp connection.")

      if (result.connected) {
        setIsVerified(true)
        if (result.whatsappPhone) setPhone(result.whatsappPhone)
        toast({ title: "Connected! 🎉", description: "WhatsApp number is already connected!" })
      } else if (mode === "pairing" && result.pairingCode) {
        setPairingCode(result.pairingCode)
        setQrCode("")
        setIsPolling(true)
        setSessionCountdown(TOTAL_SESSION_SECONDS)
        toast({
          title: "8-Digit Code Generated! 📱",
          description: "Enter this code in WhatsApp > Linked Devices > Link with phone number."
        })
      } else if (result.qrCodeBase64) {
        setQrCode(result.qrCodeBase64)
        setPairingCode(null)
        setIsPolling(true)
        setSessionCountdown(TOTAL_SESSION_SECONDS)
        toast({
          title: "Scan QR Code 📷",
          description: "Point your WhatsApp scanner at the screen to link."
        })
      } else {
        throw new Error(result.error || "No connection credential received. Please check phone number and retry.")
      }
    } catch (e: any) {
      toast({ title: "Connection Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPairingCode = () => {
    if (!pairingCode) return
    navigator.clipboard.writeText(pairingCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
    toast({ title: "Copied!", description: "8-digit code copied to clipboard." })
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
      setPairingCode(null)
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
            <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-slate-900 dark:text-slate-100 tracking-tight">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-[#25D366] border border-emerald-500/20">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  className="w-6 h-6 text-[#25D366]"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              Your Business WhatsApp Connection
            </CardTitle>
          </div>
          <div>
            {initialChecking ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 rounded-full dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> Checking Status
              </span>
            ) : isVerified ? (
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
        {initialChecking ? (
          <div className="p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-slate-500 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Verifying live WhatsApp connection...</span>
          </div>
        ) : isVerified ? (
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
          /* Not Connected View — Dual-Linking: 8-Digit Pairing Code (Recommended) vs Camera QR */
          <div className="space-y-5">
            {/* Dual Linking Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setConnectMode("pairing")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  connectMode === "pairing"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 8-Digit Code (Recommended · 100% Guaranteed)</span>
              </button>
              <button
                type="button"
                onClick={() => setConnectMode("qr")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  connectMode === "qr"
                    ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>📷 Scan QR Code</span>
              </button>
            </div>

            {/* Phone Number Input */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Store WhatsApp Number (with country code, e.g. 919099773781)
              </label>
              <div className="flex gap-2">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="919099773781"
                  className="bg-white dark:bg-slate-800 text-sm font-mono font-bold"
                />
                <Button
                  onClick={() => handleConnect(connectMode, true)}
                  disabled={loading || !phone || phone.length < 10}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                  ) : connectMode === "pairing" ? (
                    <Sparkles className="w-4 h-4 mr-1.5" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-1.5" />
                  )}
                  {connectMode === "pairing" ? "Get 8-Digit Code" : "Generate QR"}
                </Button>
              </div>
            </div>

            {/* TAB 1: 8-DIGIT PAIRING CODE DISPLAY */}
            {connectMode === "pairing" && (
              <div className="space-y-4">
                {pairingCode ? (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-500/30 text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                      <Clock className="w-3.5 h-3.5" />
                      Active for {formatTime(sessionCountdown)} · Auto-linking enabled
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-extrabold mb-1">
                        Your WhatsApp Pairing Code
                      </div>
                      <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 py-3 px-6 rounded-2xl border-2 border-dashed border-emerald-400 inline-block shadow-inner select-all">
                        {pairingCode}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <Button
                        size="sm"
                        onClick={handleCopyPairingCode}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        {copiedCode ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                        {copiedCode ? "Copied to Clipboard!" : "Copy 8-Digit Code"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect("pairing", true)}
                        disabled={loading}
                        className="text-xs font-semibold"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Fresh Code
                      </Button>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="text-left bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        3 Simple Steps on Your Phone (Zero Camera / Scan Required):
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                        <li>Open <strong>WhatsApp</strong> on your store phone.</li>
                        <li>Tap <strong>Settings (or ⋮ menu) ➔ Linked Devices ➔ Link a Device</strong>.</li>
                        <li>At the bottom of the scanner, tap <strong>"Link with phone number instead"</strong> and enter <strong className="font-mono text-emerald-600">{pairingCode}</strong>.</li>
                      </ol>
                      <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                        ⚠️ <strong>Phone Number Match Rule:</strong> This code is cryptographically locked to <strong>{phone ? `+${phone}` : "your entered phone number"}</strong>. You must enter it inside WhatsApp on the phone running that exact SIM/account. If you enter it on a different number, WhatsApp will reject it with <em>"Check the phone number is correct on your device"</em>.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <Smartphone className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      100% Reliable Official WhatsApp Pairing
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      No camera focus issues, no glare, and zero QR timeouts. Enter your store phone number above and click <strong>"Get 8-Digit Code"</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CAMERA QR CODE SCAN */}
            {connectMode === "qr" && (
              <div className="space-y-4">
                {!qrCode || sessionCountdown <= 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <QrCode className="w-12 h-12 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      {sessionCountdown <= 0 ? "Session Expired" : "Connect via Camera QR Scan"}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Click below to generate an active QR code on screen.
                    </p>
                    <Button
                      onClick={() => handleConnect("qr", true)}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                      Generate QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 border border-indigo-200 dark:border-indigo-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="relative w-60 h-60 bg-white p-3 rounded-2xl shadow-md border-2 border-indigo-400/80 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        Expires in: {formatTime(sessionCountdown)}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 text-xs">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">
                        How to Scan:
                      </h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                        <li>Open WhatsApp on your phone.</li>
                        <li>Go to <strong>Settings (or ⋮) ➔ Linked Devices</strong>.</li>
                        <li>Tap <strong>Link a Device</strong> and point your camera at the QR code.</li>
                      </ol>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConnect("qr", true)}
                        disabled={loading}
                        className="text-xs mt-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Reload QR Code
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
