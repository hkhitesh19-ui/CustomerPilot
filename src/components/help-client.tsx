"use client"

import React from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, MessageSquare, Award, BookOpen, ArrowLeft } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"

export function HelpClient() {
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-10 flex-1 w-full">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Knowledge Base &amp; Merchant Guide
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Help Center &amp; Documentation
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Everything you need to launch, train cashiers, and scale your merchant VIP club.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white border-slate-200 shadow-xs hover:shadow-xl transition-all rounded-3xl">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Printing &amp; Positioning QR Codes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Best practices for printing counter stands, table standees, and cake box seals for high customer scan rates.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-xs hover:shadow-xl transition-all rounded-3xl">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">WhatsApp Verification &amp; Flow</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connecting your merchant phone number for automated WhatsApp loyalty stamps and Google review reminders.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-xs hover:shadow-xl transition-all rounded-3xl">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Configuring Reward Cards &amp; Stamps</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Setting purchase thresholds, free reward descriptions, and Google review bonus stamps to maximize ROI.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-xs hover:shadow-xl transition-all rounded-3xl">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Cashier 5-Second Claim Tutorial</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Training cashiers to quickly tap and confirm customer stamps during checkout without replacing existing POS software.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Direct WhatsApp Assistance Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-slate-900 text-base">Need Live Onboarding Assistance?</h4>
            <p className="text-xs text-slate-600">Our merchant success team is available on WhatsApp to guide your shop setup.</p>
          </div>
          <a
            href="https://wa.me/919033304707?text=Hi%20CustomerPilot%20Team%2C%20I%20need%20help%20with%20my%20merchant%20account."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4" /> WhatsApp Support: +91 90333 04707
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
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
