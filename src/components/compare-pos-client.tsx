"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Check, X, Zap } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export function ComparePOSClient() {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10 flex-1 w-full">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <span className="px-3.5 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-bold border border-blue-200 shadow-xs inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-600" /> Technology Comparison
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            CustomerPilot vs. Traditional POS Loyalty
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Why modern merchants prefer a zero-hardware, WhatsApp-first retention system over complex and expensive POS hardware add-ons.
          </p>
        </div>

        <div className="border border-slate-200 rounded-3xl bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-extrabold">
                <tr>
                  <th className="p-5">Feature</th>
                  <th className="p-5 text-emerald-800 bg-emerald-50/50">CustomerPilot</th>
                  <th className="p-5">Traditional POS Add-on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr>
                  <td className="p-5 font-semibold text-slate-900">Hardware / POS Replacement</td>
                  <td className="p-5 font-bold text-emerald-700 bg-emerald-50/20">Zero hardware needed (Works with Cash/UPI/Card)</td>
                  <td className="p-5 text-rose-600">Requires proprietary thermal printers / costly hardware</td>
                </tr>
                <tr>
                  <td className="p-5 font-semibold text-slate-900">Customer App Download</td>
                  <td className="p-5 font-bold text-emerald-700 bg-emerald-50/20">Zero App (100% WhatsApp Native)</td>
                  <td className="p-5 text-rose-600">Requires customers to download an app (90% drop-off)</td>
                </tr>
                <tr>
                  <td className="p-5 font-semibold text-slate-900">Cashier Interaction Speed</td>
                  <td className="p-5 font-bold text-emerald-700 bg-emerald-50/20">5 Seconds (Tap-to-Claim)</td>
                  <td className="p-5 text-rose-600">45-60 Seconds (Manual customer phone typing)</td>
                </tr>
                <tr>
                  <td className="p-5 font-semibold text-slate-900">Magic SEO Google Review Engine</td>
                  <td className="p-5 font-bold text-emerald-700 bg-emerald-50/20">Included with AI Contextual AutoReply</td>
                  <td className="p-5 text-rose-600">Not Available</td>
                </tr>
                <tr>
                  <td className="p-5 font-semibold text-slate-900">VIP Member Database Ownership</td>
                  <td className="p-5 font-bold text-emerald-700 bg-emerald-50/20">100% Merchant Owned</td>
                  <td className="p-5 text-rose-600">Locked inside proprietary POS vendor database</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/signup">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-md">
              Start 3 Days Free Trial Today <ArrowRight className="w-4 h-4 ml-2" />
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
