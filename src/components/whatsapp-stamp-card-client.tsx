"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, QrCode, Sparkles, Check, Gift, Users, Award, ShieldCheck } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export function WhatsAppStampCardClient() {
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
                Start 7 Days Free Trial Today →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12 flex-1 w-full">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-xs inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Loyalty Card Engine
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Loyalty Rewards (Bring Customers Back)
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Perfect for bakeries, cafes, and salons wanting to convert single-time walk-ins into 10x repeat regulars.
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="space-y-6 border border-slate-200 p-6 sm:p-8 rounded-3xl bg-white shadow-xs">
          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold text-lg flex-shrink-0 border border-emerald-100">1</div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Customer Scans Store QR Standee</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Available on counter stands, dining tables, window posters, and packaging stickers. Works on every camera phone without downloading an app.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 font-extrabold text-lg flex-shrink-0 border border-blue-100">2</div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Instant Registration &amp; Queue Check-in</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">WhatsApp opens automatically with an opt-in message. Customer enters the merchant&apos;s live queue in &lt;5 seconds.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 font-extrabold text-lg flex-shrink-0 border border-purple-100">3</div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">5-Second Tap-to-Claim Billing</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Cashiers tap the customer name on their mobile or tablet screen. Stamps and reward progress are instantly sent to the customer&apos;s WhatsApp.</p>
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Key Capabilities Included:</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> Digital Loyalty Card
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> VIP Club Engine
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> Birthday Rewards Engine
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> Repeat Visit Tracking
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> Instant QR-based Membership
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/signup">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-md">
              Start 7 Days Free Trial Today <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
