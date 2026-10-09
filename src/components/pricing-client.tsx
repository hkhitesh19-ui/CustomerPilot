"use client"

import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { PricingStudio } from "@/components/pricing/pricing-studio"
import { Lock, Users, Sparkles, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingClient() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs">
                Start 3 Days Free Trial Today →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-12 flex-1 w-full">
        {/* Limited Time 50% Discount Offer Alert Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-1 shadow-2xl shadow-orange-500/20">
          <div className="rounded-[22px] bg-slate-950 px-6 py-6 sm:py-7 flex flex-col md:flex-row items-center justify-between gap-5 text-white">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4 text-red-400 animate-pulse" /> Limited Time 50% Discount Offer
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Flat 50% OFF on All 1-Year Pro Plans
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Complete WhatsApp loyalty, 5★ Google reviews &amp; 1-click replies at half price. From just ₹6.1/day.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/30">
                  Claim 50% Discount Now →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Unified Clean Pricing Studio v4 */}
        <PricingStudio mode="public" theme="light" />

        {/* Trust Badges */}
        <div className="border-t border-slate-200 pt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <Lock className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">No Credit Card Needed</h4>
            <p className="text-[11px] text-slate-500">3 days full access free</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <Sparkles className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Zero App Download</h4>
            <p className="text-[11px] text-slate-500">100% WhatsApp &amp; Browser native</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <Flame className="w-5 h-5 text-amber-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">2-Minute Quick Setup</h4>
            <p className="text-[11px] text-slate-500">Self-serve instant activation</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">WhatsApp Helpdesk</h4>
            <p className="text-[11px] text-slate-500">+91 90333 04707</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-900 transition">Security</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
