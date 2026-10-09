"use client"

import React, { useState } from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { PricingStudio } from "@/components/pricing/pricing-studio"
import {
  Lock, Users, Sparkles, ShieldCheck, Zap, ArrowRight,
  HelpCircle, ChevronDown, Check, Building2, Store, Clock, Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function PricingClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "How does the 3-day free trial work?",
      a: "You get full, unrestricted access to all 4 retention engines for 3 full days without paying a single rupee. No credit card is required to begin. If you decide to subscribe, simply activate your preferred tenure inside your merchant dashboard."
    },
    {
      q: "Do my customers need to download any mobile application?",
      a: "Zero app download is required. Everything runs 100% natively through WhatsApp and mobile browsers. Customers simply tap or scan your counter QR code to earn loyalty stamps, receive automated reward notifications, and draft 5-star Google reviews."
    },
    {
      q: "Can I choose just one standalone module instead of the full suite?",
      a: "Yes! Every single module — Smart Digital Business Card (from ₹1.37/day), Smart AI Google Reviews (from ₹2.19/day), AI 1-Click AutoReply (from ₹2.19/day), and WhatsApp Digital Loyalty Stamps (from ₹3.56/day) — can be subscribed to independently or bundled dynamically."
    },
    {
      q: "How does the Smart AI AutoReply to Google Reviews connect to Google Maps?",
      a: "CustomerPilot connects securely through official Google Business Profile (GBP) OAuth in 1-Click. Gemini AI generates appreciative, SEO-optimized owner responses that you review and publish live to Google Maps with one tap."
    },
    {
      q: "What is included with the Lifetime Deal for the Smart Digital Business Card?",
      a: "The Lifetime Deal (₹1,499 one-time) includes permanent cloud hosting, unlimited contact downloads (.vcf sync), review submission modals, catalog links, and printable counter QR codes with zero renewal or maintenance fees forever."
    },
    {
      q: "Can I upgrade or switch my plan later?",
      a: "Yes. You can upgrade from a standalone service to CustomerPilot Complete at any time from your merchant dashboard. Your remaining balance is automatically prorated toward your new plan."
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      {/* Sticky Refined Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs transition">
                Start 3 Days Free Trial →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-14 flex-1 w-full">
        {/* Sleek Hero Value Strip Banner */}
        <div className="rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="px-6 py-7 sm:px-8 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Transparent, ROI-Driven Retention Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Flat 50% OFF on All 1-Year Pro Plans
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Complete WhatsApp loyalty, 5★ Google reviews &amp; 1-click replies at half price. Starting from ₹1.37/day for standalone tools, or ₹13.42/day for Complete.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link href="/signup">
                <Button className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm cursor-pointer transition">
                  Claim 50% Discount Now →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing Studio Configurator, Comparison & Standalone Grid */}
        <PricingStudio mode="public" theme="light" />

        {/* Enterprise & Multi-Location Retail Chain Callout */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Operating Multiple Retail Stores or a Franchise Chain?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                Get centralized cross-outlet customer retention analytics, custom POS/billing integrations, multi-store review sync, and a dedicated retention engineer.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/919033304707?text=Hi%2C%20I%20run%20multiple%20retail%20stores%20and%20would%20like%20to%20discuss%20CustomerPilot%20Enterprise."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="outline" className="border-slate-300 hover:bg-slate-50 text-slate-900 font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl">
              Talk to Enterprise Concierge (+91 90333 04707) →
            </Button>
          </a>
        </div>

        {/* Professional FAQ Section */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <Badge variant="outline" className="text-xs font-semibold border-slate-300 text-slate-600">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Everything you need to know about our plans
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Transparent terms, zero hidden fees, and immediate self-serve onboarding.
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-200 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div key={index} className="transition">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-4 sm:py-5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-indigo-600 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Enterprise Trust Badges */}
        <div className="border-t border-slate-200/80 pt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
            <Lock className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">No Credit Card Needed</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">3 days full access free</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
            <Sparkles className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Zero App Download</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">100% WhatsApp &amp; Browser native</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
            <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">2-Minute Quick Setup</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Self-serve instant activation</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
            <Users className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">WhatsApp Helpdesk</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">+91 90333 04707</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 mt-10">
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

