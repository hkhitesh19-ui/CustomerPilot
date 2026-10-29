"use client"

import { useState, useEffect } from "react"
import {
  ShieldCheck, Copy, Check, ExternalLink, Sparkles,
  Users, KeyRound, CheckCircle2, Clock, MessageSquare, AlertCircle, RefreshCw
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const AGENCY_EMAIL = "CustomerPilot1@gmail.com"

export function GbpManagerAccessCard({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<"NOT_INVITED" | "INVITED" | "CONNECTED">("NOT_INVITED")
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  const loadStatus = async () => {
    if (!merchantId) return
    try {
      const res = await fetch(`/api/merchant/gbp-manager-access?merchantId=${merchantId}`)
      const data = await res.json()
      if (data.ok && data.data) {
        setStatus(data.data.status || (data.data.isInvited ? "INVITED" : "NOT_INVITED"))
      }
    } catch (e) {
      console.error("Failed to load manager access status:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [merchantId])

  const copyEmail = () => {
    navigator.clipboard.writeText(AGENCY_EMAIL)
    setCopied(true)
    toast({
      title: "Agency Email Copied! 📋",
      description: `${AGENCY_EMAIL} copied to clipboard. Paste this into Google Business Profile users.`,
    })
    setTimeout(() => setCopied(false), 2500)
  }

  const handleOneClickGrantAccess = async () => {
    copyEmail()
    setShowGuide(true)
    try {
      await fetch("/api/merchant/gbp-manager-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          status: "INVITED",
          notes: `Merchant clicked 1-Click Grant Access on Google for ${AGENCY_EMAIL}`,
        }),
      })
      setStatus("INVITED")
    } catch (e) {
      console.error("Auto-record invite error:", e)
    }
    // Open Google Business Profile in new tab
    window.open("https://business.google.com/locations", "_blank", "noopener,noreferrer")
  }



  const handleConfirmInvite = async () => {
    setConfirming(true)
    try {
      const res = await fetch("/api/merchant/gbp-manager-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          status: "INVITED",
          notes: `Merchant confirmed manager invite sent to ${AGENCY_EMAIL} from settings dashboard`,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus("INVITED")
        toast({
          title: "Manager Invite Recorded! 🎉",
          description: `We have logged your invite to ${AGENCY_EMAIL}. CustomerPilot team will accept within 1 hour.`,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to record invite",
          variant: "destructive",
        })
      }
    } catch (e) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to server",
        variant: "destructive",
      })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-slate-950/70 dark:via-indigo-950/10 dark:to-slate-900/60 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-900/30 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
            STEP C
          </span>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                1-Click Google Business Profile Manager Access
              </h3>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] hidden md:inline-flex">
                Zero Password Needed
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Allow CustomerPilot to auto-post weekly Google Updates, sync products &amp; publish AI review replies.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="self-start sm:self-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={loadStatus}
            disabled={loading}
            className="h-7 px-2 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 gap-1 border border-slate-200 dark:border-slate-800 rounded-lg"
            title="Check Live Access Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
            <span className="hidden sm:inline text-[11px] font-medium">Check Live Status</span>
          </Button>
          {status === "CONNECTED" ? (
            <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 px-3 py-1 text-xs flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Agency Connected ({AGENCY_EMAIL})
            </Badge>
          ) : status === "INVITED" ? (
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 px-3 py-1 text-xs flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              Invite Sent • Awaiting Agency Acceptance
            </Badge>
          ) : (
            <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-semibold">
              Not Connected Yet
            </Badge>
          )}
        </div>
      </div>

      {/* Main Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Explanation */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            100% Safe &amp; Official Google Agency Method:
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li>
              Aapko apna <strong>Gmail password kisi ko nahi dena</strong>.
            </li>
            <li>
              Aap dukan ke <strong>100% Primary Owner</strong> rahenge.
            </li>
            <li>
              CustomerPilot ko sirf <strong>Manager</strong> role milta hai (Google Posts aur Review replies publish karne ke liye).
            </li>
            <li>
              Aap jab chahein 1-click me manager access revoke/hata sakte hain.
            </li>
          </ul>

          {/* Agency Email Box */}
          <div className="flex items-center gap-2 pt-1.5">
            <span className="text-xs font-semibold text-slate-500">Agency Email:</span>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-indigo-200 dark:border-indigo-900/60 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {AGENCY_EMAIL}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyEmail}
              className="text-xs h-7 px-2.5 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="lg:col-span-5 flex flex-col gap-2.5 bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
          <Button
            onClick={handleOneClickGrantAccess}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs py-5 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>1-Click Grant Access on Google</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </Button>

          <Button
            variant="outline"
            onClick={handleConfirmInvite}
            disabled={confirming || status === "CONNECTED"}
            className="w-full border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs py-2 rounded-xl font-bold flex items-center justify-center gap-1.5"
          >
            {confirming ? (
              <Clock className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>
              {status === "INVITED"
                ? "Invite Already Sent (Mark Again)"
                : "I Have Sent Invite to " + AGENCY_EMAIL}
            </span>
          </Button>

          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline text-center font-medium pt-1"
          >
            {showGuide ? "Hide 4-step visual guide ▲" : "Need help? View 4-step quick guide ▼"}
          </button>


        </div>
      </div>

      {/* 4-Step Quick Instructions Guide */}
      {showGuide && (
        <div className="bg-slate-100/80 dark:bg-slate-950/80 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-indigo-500" />
            4 Simple Steps to Add CustomerPilot as Manager in 60 Seconds:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-black text-indigo-600 dark:text-indigo-400">Step 1:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Google par apni dukan search karein ya <a href="https://business.google.com/locations" target="_blank" rel="noreferrer" className="text-indigo-500 underline font-semibold">business.google.com</a> kholein.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-black text-indigo-600 dark:text-indigo-400">Step 2:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                3 dots (⋮) par tap karke <strong>"Business Profile settings"</strong> ➔ <strong>"People and access"</strong> chunein.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-black text-indigo-600 dark:text-indigo-400">Step 3:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                <strong>"Add"</strong> dabayein aur email paste karein: <code className="text-indigo-500 font-bold">{AGENCY_EMAIL}</code>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-black text-indigo-600 dark:text-indigo-400">Step 4:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Role me <strong>"Manager"</strong> select karke <strong>"Invite"</strong> dabayein. Done! 🎉
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
