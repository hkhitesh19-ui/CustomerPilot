"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ImpersonationBanner() {
  const [impersonation, setImpersonation] = useState<{ merchantName: string } | null>(null)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    try {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("cp_impersonation="))

      if (match) {
        const eqIdx = match.indexOf("=")
        if (eqIdx !== -1) {
          const rawValue = match.slice(eqIdx + 1).trim()
          if (rawValue) {
            const value = decodeURIComponent(rawValue).trim()
            if (value && (value.startsWith("{") || value.startsWith("["))) {
              const parsed = JSON.parse(value)
              if (parsed?.active) {
                setImpersonation(parsed)
              }
            }
          }
        }
      }
    } catch {
      // Ignored
    }
  }, [])

  if (!impersonation) return null

  const handleExit = async () => {
    setIsExiting(true)
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "exit" }),
      })
      const data = await res.json()
      if (data.redirectTo) {
        window.location.href = data.redirectTo
      } else {
        window.location.href = "/super-admin"
      }
    } catch {
      window.location.href = "/super-admin"
    }
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between border-b border-amber-400/40">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 animate-bounce text-amber-200" />
        <span>
          <strong className="uppercase tracking-wider font-extrabold text-amber-100">SuperAdmin Mode:</strong> You are currently viewing & managing{" "}
          <span className="underline font-bold text-white bg-black/20 px-1.5 py-0.5 rounded">
            {impersonation.merchantName}
          </span>
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleExit}
        disabled={isExiting}
        className="h-7 text-xs bg-white text-slate-900 hover:bg-slate-100 font-bold flex items-center gap-1.5 shadow-sm"
      >
        {isExiting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeft className="h-3 w-3" />}
        Return to SuperAdmin
      </Button>
    </div>
  )
}
