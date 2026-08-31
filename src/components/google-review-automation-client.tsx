"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Award, ArrowRight, ArrowLeft, Star, MessageSquare, CheckCircle2, TrendingUp, Check } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export function GoogleReviewAutomationClient() {
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
          <span className="px-3.5 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200 shadow-xs inline-flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Ai Drafted SEO Optimized Google Reviews
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            After a purchase, your customer gets a gentle WhatsApp reminder to share their experience and earn bonus stamps. Automatically collect authentic 4 and 5-star Google reviews right after a customer purchase on WhatsApp.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">AI Review Draft Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assists customers by drafting authentic review outlines based on what they enjoyed, making 5-star submissions effortless in 5 seconds.
            </p>
          </div>

          <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">WhatsApp Review Flow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Timely, polite WhatsApp messages triggered automatically after checkout. No spam, 100% compliant with high open rates.
            </p>
          </div>

          <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">1-Click Copy &amp; Post</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customer taps once to copy their personalized review and immediately opens Google Maps directly on their mobile device.
            </p>
          </div>

          <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-white shadow-xs hover:shadow-xl transition-all space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Organic Rating Booster</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skyrockets local Google Maps SEO ranking, attracting high-intent foot traffic from neighborhood searchers.
            </p>
          </div>
        </div>

        {/* Bullet summary */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Key Capabilities Included:</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> AI Review Draft Engine
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> WhatsApp Review Flow
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> 1-Click Copy &amp; Post
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> Live Review Analytics
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 font-bold" /> Organic Rating Booster
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
