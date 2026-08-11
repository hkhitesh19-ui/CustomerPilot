"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react"

export default function TermsPage() {
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetch("/api/legal/terms")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data?.content) {
          setContent(data.data.content)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center gap-2">
            <BrandLogo variant="dark" size="sm" />
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="border-slate-700 text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Merchant Terms & Conditions</h1>
            <p className="text-xs text-slate-400 mt-1">CustomerPilot SaaS Agreement, Loyalty Guidelines & Refund Policy</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-line shadow-xl">
            {content}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 CustomerPilot. All rights reserved. Secure Payments Powered by Razorpay.</p>
      </footer>
    </div>
  )
}
