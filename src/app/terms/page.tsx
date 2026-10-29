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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl">
                Start 3 Days Free Trial Today →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8 flex-1 w-full">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900">Merchant Terms &amp; Conditions</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">CustomerPilot SaaS Agreement, Loyalty Guidelines &amp; Fair Use Policy</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50/70 border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-line shadow-xs">
            {content || `1. Acceptance of Terms: By registering a merchant account on CustomerPilot, you agree to comply with all applicable local business and consumer protection regulations.

2. WhatsApp Messaging Compliance: Messages sent through CustomerPilot must adhere strictly to opt-in transactional loyalty cards and review requests. Unsolicited marketing spam is strictly prohibited.

3. Subscription & Billing: All plans come with an initial 3-Day Free Trial. Paid renewals are processed based on your chosen VIP member capacity plan. Cancel anytime from your merchant settings.

4. Intellectual Property: CustomerPilot and all associated logos, software code, and loyalty engine algorithms remain the exclusive property of CustomerPilot Inc.

5. Support Desk: For merchant queries, contact support@customerpilot.in or WhatsApp +91 90333 04707.`}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/security" className="hover:text-slate-900 transition">Security</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact Support</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
