"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, XCircle, RefreshCw, QrCode, Phone, Copy, Check, Info } from "lucide-react"
import { useDashboardState } from "@/hooks/use-dashboard-state"

export function WhatsAppVerification({ merchantId }: { merchantId: string }) {
  const { data, refetch } = useDashboardState()
  const { toast } = useToast()

  const [phone, setPhone] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mode: "qr" for camera scan, "pairing" for 8-character phone pairing code
  const [activeTab, setActiveTab] = useState<"qr" | "pairing">("qr")
  const [manualPhone, setManualPhone] = useState("")
  const [pairingCode, setPairingCode] = useState("")
  const [copied, setCopied] = useState(false)

  // QR state & countdown
  const [qrCode, setQrCode] = useState("")
  const [isPolling, setIsPolling] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (data?.merchant?.whatsappPhone) {
      setPhone(data.merchant.whatsappPhone)
      setManualPhone(data.merchant.whatsappPhone)
      setIsVerified(true)
    }
  }, [data?.merchant?.whatsappPhone])

  // Polling for QR / Pairing Code connection status
  useEffect(() => {
    if (!isPolling) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/whatsapp/status", {
          headers: { "x-merchant-id": merchantId }
        })
        if (res.ok) {
          const result = await res.json()
          if (result.connected) {
            clearInterval(interval)
            if (countdownRef.current) clearInterval(countdownRef.current)
            setIsPolling(false)
            setIsVerified(true)
            setQrCode("")
            setPairingCode("")
            if (result.whatsappPhone) {
              setPhone(result.whatsappPhone)
            }
            refetch()
            toast({ title: "Connected! 🎉", description: "WhatsApp Business number verified successfully!" })
          }
        }
      } catch (e: any) {
        if (e.name !== 'TypeError' && !e.message?.includes('Failed to fetch')) {
          console.error("Polling error", e)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPolling, merchantId, refetch, toast])

  // Countdown timer for QR code (WhatsApp Baileys QR expires every 30s)
  useEffect(() => {
    if (!qrCode || isVerified) {
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }

    setCountdown(30)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-refresh fresh QR before phone gets "couldn't link device"
          handleConnect(false)
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode, isVerified])

  const handleConnect = async (force: boolean = false, phoneOverride?: string) => {
    setLoading(true)
    try {
      const targetPhone = phoneOverride !== undefined ? phoneOverride : (activeTab === "pairing" ? manualPhone : "")
      const params = new URLSearchParams()
      if (force) params.append("force", "true")
      if (targetPhone) params.append("phone", targetPhone)

      const res = await fetch(`/api/whatsapp/connect?${params.toString()}`, {
        headers: { "x-merchant-id": merchantId }
      })
      const result = await res.json()

      if (!res.ok) throw new Error(result.error || "Failed to initiate WhatsApp connection.")

      if (result.connected) {
        setIsVerified(true)
        if (result.whatsappPhone) setPhone(result.whatsappPhone)
        toast({ title: "Success", description: "WhatsApp number is already connected!" })
      } else {
        if (result.qrCodeBase64) {
          setQrCode(result.qrCodeBase64)
        }
        if (result.pairingCode) {
          setPairingCode(result.pairingCode)
        }
        setIsPolling(true)
        setCountdown(30)
        toast({
          title: activeTab === "pairing" ? "Pairing Code Generated" : "Scan QR Code",
          description: activeTab === "pairing"
            ? "Enter this 8-digit code in WhatsApp Linked Devices."
            : "Point camera at the QR code on screen."
        })
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
      setPairingCode("")
      setIsPolling(false)
      if (countdownRef.current) clearInterval(countdownRef.current)
      refetch()
      toast({ title: "Disconnected", description: "WhatsApp session cleared and instance deleted." })
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const copyPairingCode = () => {
    if (!pairingCode) return
    const raw = pairingCode.replace("-", "")
    navigator.clipboard.writeText(raw)
    setCopied(true)
    toast({ title: "Copied!", description: `Code ${pairingCode} copied to clipboard.` })
    setTimeout(() => setCopied(false), 2500)
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
          /* Not Connected View — Dual Tab Method (QR + Pairing Code) */
          <div className="space-y-5">
            {/* Method Switcher Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => { setActiveTab("qr"); }}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "qr"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Option 1: Scan QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("pairing"); }}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "pairing"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Option 2: 8-Digit Code (No Scan) ⭐</span>
              </button>
            </div>

            {/* TAB 1: QR CODE SCAN */}
            {activeTab === "qr" && (
              <div className="space-y-4">
                {!qrCode ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Instant WhatsApp QR Code</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        Click below to generate a fresh high-resolution QR code and scan directly from your phone.
                      </p>
                    </div>
                    <Button onClick={() => handleConnect(true)} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                      Generate Fresh QR Code
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 border border-emerald-200 dark:border-emerald-800 rounded-2xl bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    {/* QR Image with live countdown badge */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative w-64 h-64 bg-white p-3 rounded-2xl shadow-md border-2 border-emerald-400/80 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                      </div>

                      {/* Live TTL Countdown */}
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active · Auto-refreshes in <strong className="text-emerald-600 font-mono">{countdown}s</strong></span>
                      </div>
                    </div>

                    {/* Instructions & Actions */}
                    <div className="space-y-4 max-w-sm">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">3 Steps to Link on Your Phone:</h4>
                        <p className="text-xs text-slate-500">Scan before the 30-second timer expires</p>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                          <span>Open <strong>WhatsApp</strong> on your phone.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                          <span>Tap <strong>Settings / 3-Dots</strong> ➔ <strong>Linked Devices</strong>.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                          <span>Tap <strong>Link a Device</strong> and point your camera at the QR code.</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConnect(true)}
                          disabled={loading}
                          className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                          Force Reset / New QR
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
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PAIRING CODE (PHONE NUMBER LINKING — ZERO SCAN REQUIRED) */}
            {activeTab === "pairing" && (
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/60 space-y-5">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-extrabold uppercase">
                    ⭐ Recommended · Works 100% Guaranteed
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Link WhatsApp with Phone Number (No Camera Needed)</h4>
                  <p className="text-xs text-slate-500">
                    If QR code scan ever says "Couldn't link device", use this official WhatsApp method. Enter your phone number and enter the 8-digit code directly inside WhatsApp.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                  <div className="flex-1">
                    <Label htmlFor="manualPhoneInput" className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">Your WhatsApp Number (with country code):</Label>
                    <Input
                      id="manualPhoneInput"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="e.g. 919033304707 or 9876543210"
                      className="font-mono bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="sm:self-end">
                    <Button
                      onClick={() => handleConnect(true, manualPhone)}
                      disabled={loading || !manualPhone || manualPhone.length < 10}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
                      Get Pairing Code
                    </Button>
                  </div>
                </div>

                {/* Pairing Code Display Card */}
                {pairingCode && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border-2 border-emerald-500 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Your 8-Digit Pairing Code:</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={copyPairingCode}
                        className="h-8 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                        {copied ? "Copied!" : "Copy Code"}
                      </Button>
                    </div>

                    <div className="text-center py-2">
                      <div className="inline-block px-6 py-3 rounded-xl bg-black/60 border border-emerald-500/50 font-mono text-3xl sm:text-4xl font-black tracking-[0.25em] text-emerald-300 shadow-inner">
                        {pairingCode}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-slate-300">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-emerald-400" />
                        How to enter on your phone in 10 seconds:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1 leading-relaxed">
                        <li>Open <strong>WhatsApp</strong> on your phone ➔ <strong>Settings</strong> ➔ <strong>Linked Devices</strong>.</li>
                        <li>Tap <strong>Link a Device</strong>.</li>
                        <li>At the bottom of the camera scan screen, tap <strong>"Link with phone number instead"</strong>.</li>
                        <li>Enter the 8 characters above: <strong className="text-emerald-400 font-mono">{pairingCode}</strong>.</li>
                      </ol>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Listening for phone confirmation...
                      </span>
                      <button
                        type="button"
                        onClick={() => handleConnect(true, manualPhone)}
                        className="underline hover:text-white"
                      >
                        Generate New Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Troubleshooting Note */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Phone saying "Couldn't link device"?</strong> WhatsApp QR codes expire every 30 seconds. If your scan fails, either click <strong>"Force Reset / New QR"</strong>, or switch to the <strong>"8-Digit Code (No Scan)"</strong> tab above to link reliably with zero camera issues.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

