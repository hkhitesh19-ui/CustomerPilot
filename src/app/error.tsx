"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Global Error Boundary Caught]:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white">Something went wrong</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page encountered an unexpected issue while loading data. Please try reloading or head over to settings.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Page</span>
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard/settings"
              className="h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Settings</span>
            </Link>

            <Link
              href="/dashboard?view=analytics"
              className="h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        <p className="text-[10px] text-slate-500">
          CustomerPilot V6.5 • Need immediate assistance? Contact WhatsApp Support
        </p>
      </div>
    </div>
  )
}
