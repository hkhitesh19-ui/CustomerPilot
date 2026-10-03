"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowLeft,
  Gift,
  Star,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Store
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const COMPLETE_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "What is CustomerPilot Complete and what modules are included?",
    answerEn: "CustomerPilot Complete is the all-in-one customer retention engine for Indian retail. It unifies all 4 flagship modules: (1) WhatsApp Digital Stamp Cards, (2) Smart AI Google Reviews QR, (3) 1-Click AI AutoReply on Google Maps, and (4) Luxury Digital Business Cards with 1-tap contact saving.",
    questionHi: "CustomerPilot Complete kya hai aur isme kaun kaun se features aate hain?",
    answerHi: "CustomerPilot Complete ek all-in-one software suite hai jisme 4 core tools ek sath aate hain: (1) WhatsApp Digital Loyalty Stamp Card, (2) AI Google Reviews QR standee, (3) 1-Click Google Maps AI AutoReply, aur (4) Smart Digital Business Card with 1-tap contact save."
  },
  {
    id: 2,
    questionEn: "Can I manage everything from a single unified merchant dashboard?",
    answerEn: "Yes! Everything connects seamlessly in one place. When a customer scans your counter QR, their loyalty stamps, review submissions, and contact interactions sync in real time under your unified VIP Customers CRM without logging into multiple tools.",
    questionHi: "Kya main sab kuch ek hi dashboard se manage kar sakta hoon?",
    answerHi: "Haan! Ek single dashboard se aap loyalty points, Google reviews, AI auto-replies, aur digital card analytics sab kuch live track aur manage kar sakte hain."
  },
  {
    id: 3,
    questionEn: "How much money does CustomerPilot Complete save compared to individual SaaS tools?",
    answerEn: "Buying individual tools costs over ₹49,000 to ₹75,000 annually (Stamp Me $49/mo, Birdeye $299/mo, and Linktree $5/mo). CustomerPilot Complete provides all 4 integrated modules starting at just ₹2,249/year (₹6.2/day) with zero hardware requirements.",
    questionHi: "Alag alag software lene ke muqable CustomerPilot Complete se kitni bachat hoti hai?",
    answerHi: "Alag software lene par saal ka ₹49,000 se ₹75,000 kharch hota hai. CustomerPilot Complete me ye sabhi 4 tools sirf ₹2,249/year (₹6.2/din) me mil jate hain — 95% direct cost bachat!"
  },
  {
    id: 4,
    questionEn: "How fast can my store go live with the complete retention suite?",
    answerEn: "You can go live in under 3 minutes! Simply sign up, connect your WhatsApp bot and Google Business Profile, print your auto-generated counter QR standee, and start rewarding customers immediately.",
    questionHi: "Meri dukan CustomerPilot Complete ke sath kitni der me live ho sakti hai?",
    answerHi: "Aap sirf 3 minute ke andar poori tarah live ho sakte hain! Signup karein, reward set karein, Google profile connect karein aur counter QR standee print karke rakh dein."
  },
  {
    id: 5,
    questionEn: "What is the pricing for the full CustomerPilot Complete suite?",
    answerEn: "CustomerPilot Complete is included in the Founding Merchant Pro Plan at ₹2,249/year (50% OFF discount locked for life), equivalent to just ₹6.2 per day with a 3-day risk-free free trial.",
    questionHi: "CustomerPilot Complete ka total pricing kitna hai?",
    answerHi: "Founding Merchant 50% discount ke sath poora complete suite sirf ₹2,249/year (₹6.2/din) me milta hai, jisme 3-day unrestricted free trial shamil hai."
  }
]

export function CustomerPilotCompleteClient() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Global CSS Theme Styles matching Master Homepage */}
      <style>{`
        :root {
          --em: #10b981; --em-d: #059669; --sky: #0ea5e9; --ind: #6366f1; --ind-d: #4f46e5;
          --slate: #0f172a; --slate6: #475569; --slate5: #64748b; --slate4: #94a3b8;
          --line: #e2e8f0;
        }
        .grad-txt { background: linear-gradient(90deg, #10b981, #0ea5e9, #6366f1); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .btn-grad { background: linear-gradient(90deg, #10b981, #6366f1); color: #fff; box-shadow: 0 10px 25px -8px rgba(16,185,129,.5); }
        .btn-grad:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .aurora { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .aurora b { position: absolute; display: block; border-radius: 50%; filter: blur(80px); }
        .aurora b:nth-child(1) { width: 500px; height: 500px; left: 50%; top: -80px; transform: translateX(-50%); background: rgba(16,185,129,.18); animation: fl 14s ease-in-out infinite; }
        .aurora b:nth-child(2) { width: 360px; height: 360px; right: -40px; top: 180px; background: rgba(99,102,241,.14); animation: fl 16s ease-in-out infinite 3s; }
        .aurora b:nth-child(3) { width: 340px; height: 340px; left: -60px; top: 240px; background: rgba(14,165,233,.14); animation: fl 18s ease-in-out infinite 6s; }
        @keyframes fl { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-20px) scale(1.06)} }
        .dots { position: absolute; inset: 0; z-index: 0; opacity: .4; background-image: radial-gradient(circle, rgba(16,185,129,.14) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.9); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: var(--slate6); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .dot-live { position: relative; width: 8px; height: 8px; }
        .dot-live i { position: absolute; inset: 0; border-radius: 50%; background: #10b981; }
        .dot-live i:first-child { animation: ping 1.6s cubic-bezier(0,0,.2,1) infinite; opacity: .7; }
        @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }
        .hub-mockup {
          width: 100%;
          max-width: 360px;
          border-radius: 48px;
          background: #0f172a;
          padding: 12px;
          box-shadow: 0 25px 60px -15px rgba(16,185,129,.35), 0 0 0 1px rgba(255,255,255,0.1), 0 0 0 6px #1e293b, 0 30px 60px rgba(0,0,0,0.25);
          position: relative;
        }
      `}</style>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1">
        
        {/* ============ HERO SECTION WITH 4-IN-1 UNIFIED SIMULATOR ============ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          <div className="aurora"><b></b><b></b><b></b></div>
          <div className="dots"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Value Proposition in Indian English */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="badge">
                  <span className="dot-live"><i></i><i></i></span> The Flagship All-in-One Retention Stack for Indian Retail
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  The Complete Autonomous Customer Retention Engine for <span className="grad-txt">Local Businesses</span>.
                </h1>

                <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  WhatsApp Loyalty Stamps. Smart AI Reviews. 1-Click AutoReply. Luxury Digital Visiting Card.
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Stop juggling 4 fragmented subscriptions. CustomerPilot Complete unifies WhatsApp loyalty, AI Google review collection, instant owner auto-reply, and smart digital business cards into a single high-impact dashboard.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="btn-grad py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>Start 3-Day Free Trial (All 4 Included)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="py-3.5 sm:py-4 px-5 text-sm sm:text-base font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-2 transition w-full sm:w-auto"
                  >
                    <span>Compare TCO Savings (₹45,000/yr)</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> All 4 Modules Under 1 Subscription</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Save ₹45,000/yr vs Separate Tools</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> 3-Minute Plug-and-Play Setup</span>
                </div>
              </div>

              {/* Right Column: Live Interactive 4-in-1 Ecosystem Hub Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                
                {/* Mobile Device Mockup */}
                <div className="relative">
                  {/* Hub Screen Mockup */}
                  <div className="hub-mockup">
                    {/* Luxury Dynamic Island Status Bar */}
                    <div className="flex items-center justify-between px-6 pt-2 pb-2 text-[11px] font-semibold text-white/90">
                      <span>9:41</span>
                      <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span>5G</span>
                        <span className="w-5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
                          <span className="w-full h-full bg-emerald-400 rounded-2xs"></span>
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[28px] overflow-hidden bg-white text-slate-900 shadow-inner flex flex-col">
                      
                      {/* Top Ecosystem Header */}
                      <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white space-y-1">
                        <div className="flex items-center justify-between text-[11px] opacity-90 font-medium">
                          <span>Unified Merchant Hub</span>
                          <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">ALL-IN-ONE</span>
                        </div>
                        <div className="font-black text-sm text-white truncate">Tasty Vadapav &bull; Atladara</div>
                        <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" /> 4 Active Growth Engines Synced
                        </div>
                      </div>

                      {/* 4 Connected Module Cards Inside Simulator */}
                      <div className="p-3.5 space-y-2.5 bg-slate-50/60 text-xs">
                        
                        {/* 1. WhatsApp Loyalty Tile */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                              <Gift className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[11px] text-slate-900">WhatsApp Loyalty</div>
                              <div className="text-[9px] text-slate-500">4,820 active stamps issued</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                            +34% Repeat
                          </span>
                        </div>

                        {/* 2. Smart AI Reviews Tile */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                              <Star className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[11px] text-slate-900">Smart AI Reviews</div>
                              <div className="text-[9px] text-slate-500">120+ verified 5★ reviews</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                            4.8 ★ Maps
                          </span>
                        </div>

                        {/* 3. 1-Click AutoReply Tile */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[11px] text-slate-900">AI AutoReply</div>
                              <div className="text-[9px] text-slate-500">0.8s Gemini response queue</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                            100% Rate
                          </span>
                        </div>

                        {/* 4. Smart Digital Card Tile */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-[11px] text-slate-900">Digital Visiting Card</div>
                              <div className="text-[9px] text-slate-500">1-Tap vCard + Menu QR</div>
                            </div>
                          </div>
                          <span className="text-[10px] bg-cyan-50 text-cyan-800 font-bold px-1.5 py-0.5 rounded border border-cyan-200">
                            Live vCard
                          </span>
                        </div>

                        {/* Direct CTA inside Mockup */}
                        <Link
                          href="/signup"
                          className="w-full mt-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                          <span>Launch Complete Retention Stack</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Bottom Home Indicator Bar */}
                      <div className="py-2.5 flex justify-center bg-slate-50/60 rounded-b-[24px]">
                        <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">
                  ✦ Unified 4-in-1 merchant cockpit · Real-time data synchronization
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============ STATISTIC HIGHLIGHTS SECTION ============ */}
        <section className="py-12 bg-slate-50/70 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">4-in-1</div>
                <div className="text-xs text-slate-600 font-medium">Unified Retention Architecture</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-amber-600">+34%</div>
                <div className="text-xs text-slate-600 font-medium">Repeat Walk-in Footfall Increase</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-indigo-600">95%</div>
                <div className="text-xs text-slate-600 font-medium">Cost Savings vs 4 Separate Tools</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-slate-900">₹6.2/day</div>
                <div className="text-xs text-slate-600 font-medium">All-Inclusive SME Flat Price</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS SECTION WITH INFOGRAPHICS & ANIMATION ============ */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 border-t border-b border-slate-200/80 relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-200/20 via-teal-200/20 to-indigo-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-emerald-800 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                How It Works • The Autonomous 4-Engine Stack
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                How CustomerPilot Complete Runs Your Shop on Autopilot in 3 Steps
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                One counter touchpoint automates your Google reputation, WhatsApp retention, and direct digital orders.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Energy Line for Desktop */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-indigo-300 -translate-y-12 -z-0 opacity-40" />

              {/* Step 1 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      01
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Step 1 • Standee Setup
                    </span>
                  </div>

                  {/* Infographic Visual: Standee & Scan */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-slate-50 border border-emerald-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-18 h-22 rounded-xl bg-white border border-emerald-200 shadow-md p-2 flex flex-col items-center justify-center text-center">
                        <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center text-white mb-1">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-black text-slate-900 leading-tight">1 Standee</span>
                        <span className="text-[7px] text-emerald-700 font-semibold">Powers All</span>
                      </div>
                      <div className="text-emerald-500 font-bold text-lg animate-pulse">➔</div>
                      <div className="w-18 h-22 rounded-xl bg-slate-900 border border-slate-700 shadow-md p-2 flex flex-col items-center justify-center text-white">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-900" />
                        </div>
                        <span className="text-[8px] font-black text-white leading-tight">Customer</span>
                        <span className="text-[7px] text-emerald-300 font-semibold">Taps &amp; Scans</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    1. One Smart Standee Powers Entire Counter
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Place a single acrylic QR standee on your billing desk. Customers tap with NFC or scan with camera in 3 seconds. Zero app downloads.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span>⚡ 3-Second Contactless Scan</span>
                  <span className="text-slate-400">Zero Apps Required</span>
                </div>
              </div>

              {/* Step 2 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      02
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      Step 2 • 4-Engine Sync
                    </span>
                  </div>

                  {/* Infographic Visual: 4 Modules Syncing */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-teal-50 to-slate-50 border border-teal-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="grid grid-cols-2 gap-1.5 w-full max-w-[210px]">
                      <div className="p-1 rounded bg-amber-50 border border-amber-200 text-center">
                        <span className="text-[7px] font-bold text-amber-800 block">WhatsApp Loyalty</span>
                        <span className="text-[6px] text-amber-600 font-semibold">+1 Stamp</span>
                      </div>
                      <div className="p-1 rounded bg-emerald-50 border border-emerald-200 text-center">
                        <span className="text-[7px] font-bold text-emerald-800 block">AI Reviews QR</span>
                        <span className="text-[6px] text-emerald-600 font-semibold">5★ Draft</span>
                      </div>
                      <div className="p-1 rounded bg-indigo-50 border border-indigo-200 text-center">
                        <span className="text-[7px] font-bold text-indigo-800 block">AI AutoReply</span>
                        <span className="text-[6px] text-indigo-600 font-semibold">0.8s Draft</span>
                      </div>
                      <div className="p-1 rounded bg-cyan-50 border border-cyan-200 text-center">
                        <span className="text-[7px] font-bold text-cyan-800 block">Digital Card</span>
                        <span className="text-[6px] text-cyan-600 font-semibold">1-Tap vCard</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    2. Autonomous 4-Engine Processing
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Stamps credit automatically to WhatsApp, 5★ reviews route to Google Maps, Gemini auto-drafts replies, and contact cards save with 1 tap.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                  <span>🤖 100% Autonomous</span>
                  <span className="text-slate-400">Zero Manual Work</span>
                </div>
              </div>

              {/* Step 3 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      03
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Step 3 • Unified ROI
                    </span>
                  </div>

                  {/* Infographic Visual: Merchant Growth Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50 to-slate-50 border border-indigo-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-indigo-200 shadow-sm w-full max-w-[210px] space-y-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-indigo-800 font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Unified VIP CRM Growth</span>
                      </div>
                      <div className="flex justify-around text-[8px] font-bold text-slate-700 py-0.5 bg-slate-50 rounded">
                        <span className="text-emerald-700">+34% Walk-ins</span>
                        <span className="text-indigo-700">₹45k Saved</span>
                      </div>
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-[8px] font-bold px-2 py-0.5 rounded-full">
                        1 Dashboard • Zero Fragility
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    3. Unified VIP CRM &amp; ₹45,000 Saved
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Track all customer visits, loyalty stamp points, and Google reviews in one centralized merchant cockpit. Save ₹45,000/yr vs separate SaaS tools.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-indigo-700 font-semibold">
                  <span>💰 ₹45,000/yr Saved</span>
                  <span className="text-slate-400">+34% Repeat Footfall</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 4-IN-1 ECOSYSTEM ARCHITECTURE CARDS ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                Unified Ecosystem
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                Everything Your Store Needs to Retain 100% of Customers
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold shadow-xs">
                  <Gift className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">1. WhatsApp Digital Stamp Cards</h3>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">VIP Club</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Say goodbye to lost paper cards. Customers collect digital stamps directly in WhatsApp in 5 seconds. Automated milestone celebrations and inactivity reminders bring them back 34% faster.
                </p>
                <Link href="/whatsapp-digital-loyalty-card" className="inline-flex items-center text-xs font-bold text-amber-700 hover:underline">
                  Explore WhatsApp Loyalty Pillar →
                </Link>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shadow-xs">
                  <Star className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">2. Smart AI Google Reviews QR</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">AI Drafts</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Smart counter QR standees that pre-draft authentic, keyword-rich 5-star reviews on customer phones. Triple your Google review velocity and shield your profile with private negative feedback filtering.
                </p>
                <Link href="/ai-google-review-qr-generator" className="inline-flex items-center text-xs font-bold text-emerald-700 hover:underline">
                  Explore AI Review QR Pillar →
                </Link>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-xs">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">3. 1-Click AI AutoReply on Google Maps</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">1-Sec Publish</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Never leave a review unanswered. Gemini AI crafts context-aware, personalized owner replies in 1 second. Boost your Google Maps Local 3-Pack rankings by 42% through consistent 100% response rates.
                </p>
                <Link href="/ai-google-review-autoreply" className="inline-flex items-center text-xs font-bold text-indigo-700 hover:underline">
                  Explore 1-Click AutoReply Pillar →
                </Link>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shadow-xs">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">4. Luxury Digital Business Card</h3>
                  <span className="text-xs bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">vCard + QR</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  A mobile-first micro-website with 1-tap contact saving (.vcf), direct Google Reviews submission, WhatsApp chat, and online ordering catalogs. Zero re-printing costs when your details change.
                </p>
                <Link href="/smart-digital-business-card" className="inline-flex items-center text-xs font-bold text-cyan-700 hover:underline">
                  Explore Smart Digital Card Pillar →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TOTAL COST OF OWNERSHIP (TCO) COMPARISON ============ */}
        <section className="py-16 bg-slate-50/70 border-t border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                Total Cost of Ownership (TCO)
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                CustomerPilot Complete vs. 4 Fragmented Apps
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Save over ₹45,000 every year while eliminating password headaches and disjointed customer records:
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="py-4 px-4 sm:px-6">Feature / Capability</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 text-emerald-900 bg-emerald-50/80 border-x border-emerald-200">
                      CustomerPilot Complete
                    </th>
                    <th scope="col" className="py-4 px-4 sm:px-6 text-slate-600">Separate Vendors (Stamp Me + Birdeye + Linktree)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">WhatsApp Digital Stamp Cards</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/40 border-x border-emerald-100">Included</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">₹4,100/mo (Stamp Me $49/mo)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">AI Google Reviews QR Standee</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/40 border-x border-emerald-100">Included</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">₹24,500/mo (Birdeye / Podium $299/mo)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">1-Click Google Maps AutoReply</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/40 border-x border-emerald-100">Included</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Extra addon charge</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Luxury Digital Business Card</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/40 border-x border-emerald-100">Included</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">₹400/mo (Linktree Pro $5/mo)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Single Login &amp; Unified CRM</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/40 border-x border-emerald-100">1 Unified Cockpit</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">4 Fragmented logins &amp; data silos</td>
                  </tr>

                  <tr className="bg-emerald-50/40 font-bold border-t-2 border-emerald-200">
                    <td className="py-4 px-4 sm:px-6 text-slate-900">Total Annual Cost</td>
                    <td className="py-4 px-4 sm:px-6 text-emerald-700 text-base border-x border-emerald-200">
                      ₹2,249 / year (₹6.2/day)
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-rose-600 text-sm">
                      ₹49,000 to ₹75,000+ / year
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ DUAL-LANGUAGE FAQ SECTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={COMPLETE_FAQS} accentColor="emerald" theme="light" />
        </section>

        {/* ============ BOTTOM CALL TO ACTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Transform Your Store Retention in Under 3 Minutes
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Get all 4 retention and growth engines in one unified subscription. Start your 3-day unrestricted free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all">
                <Link href="/signup">
                  Get Started Free (All 4 Included) <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

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
