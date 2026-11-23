"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImpersonationData {
  merchantId?: string
  merchantName: string
  active?: boolean
}

export function ImpersonationBanner() {
  const [impersonation, setImpersonation] = useState<ImpersonationData | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

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

  const handleResetCustomers = async () => {
    if (!impersonation?.merchantId) {
      alert("❌ Merchant ID not found in current impersonation session. Please re-login from SuperAdmin.")
      return
    }

    const confirmed = window.confirm(
      `⚠️ 1-CLICK FRESH TESTING RESET FOR: "${impersonation.merchantName}"\n\n` +
      `Kya aap is merchant ke saare test customers, stamps, reviews, aur WhatsApp queue ko permanently delete karna chahte hain?\n\n` +
      `• Customers, Visits, aur Stamps reset to 0\n` +
      `• WhatsApp Queue & Messages reset to 0\n` +
      `• Store Settings, Staff Logins, aur QR Codes 100% safe rahenge.\n\n` +
      `Fresh testing shuru karne ke liye OK press karein.`
    )
    if (!confirmed) return

    setIsResetting(true)
    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_customers",
          merchantId: impersonation.merchantId
        })
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.message || "Customer test data successfully reset to 0!"}`)
        window.location.reload()
      } else {
        alert(`❌ Error resetting customers: ${data.error || "Unknown error"}`)
      }
    } catch (err: any) {
      alert(`❌ Failed to reset customers: ${err.message}`)
    } finally {
      setIsResetting(false)
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

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={handleResetCustomers}
          disabled={isResetting || isExiting}
          className="h-7 text-xs bg-rose-700 hover:bg-rose-800 text-white font-bold flex items-center gap-1.5 shadow-sm border border-rose-400/40 transition-all cursor-pointer"
          title={`Delete all test customers, visits, stamps & queue for ${impersonation.merchantName}`}
        >
          {isResetting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          <span className="hidden sm:inline">Reset Test Customers (Fresh Testing)</span>
          <span className="sm:hidden">Reset Data</span>
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleExit}
          disabled={isExiting || isResetting}
          className="h-7 text-xs bg-white text-slate-900 hover:bg-slate-100 font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          {isExiting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeft className="h-3 w-3" />}
          <span className="hidden sm:inline">Return to SuperAdmin</span>
          <span className="sm:hidden">Exit</span>
        </Button>
      </div>
    </div>
  )
}
