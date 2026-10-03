"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowLeft,
  Star,
  XCircle,
  CheckCircle2,
  Smartphone,
  Gift,
  Sparkles,
  Store
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const LOYALTY_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How does the WhatsApp Digital Punch Card system work for retail stores and cafes?",
    answerEn: "CustomerPilot replaces paper punch cards with an automated virtual loyalty card inside WhatsApp. Customers scan a smart QR code placed on your billing counter. The system instantly credits a digital stamp to their mobile number without requiring any mobile app download. When they reach their reward milestone (e.g., 5 stamps), they automatically receive a reward voucher on WhatsApp.",
    questionHi: "Shop ke liye digital loyalty card kaise banaye aur ye kaise kaam karta hai?",
    answerHi: "CustomerPilot paper punch cards ko WhatsApp virtual card se replace kar deta hai. Grahak counter par rakha QR scan karta hai aur uske number par turant digital stamp lag jata hai. 5 stamps poore hote hi WhatsApp par reward message mil jata hai — zero app download!"
  },
  {
    id: 2,
    questionEn: "Do my walk-in customers need to download an application from Play Store or App Store?",
    answerEn: "No app download required! Unlike Stamp Me or Loop Loyalty which force customers to install 3rd-party apps, CustomerPilot works 100% natively on WhatsApp, which every Indian smartphone user already has installed and uses daily.",
    questionHi: "Kya grahak ko koi naya app download karna padega?",
    answerHi: "Bilkul nahi! Kisi bhi app download ki zaroorat nahi hai. CustomerPilot poori tarah WhatsApp par chalta hai, jo har Indian customer ke phone me pehle se maujood hai."
  },
  {
    id: 3,
    questionEn: "How does this loyalty program increase repeat customer footfall?",
    answerEn: "Over 70% of first-time retail walk-ins never return because store owners have no way to re-engage them. CustomerPilot automatically captures customer visit recency and sends gentle, automated WhatsApp reminders (e.g., 'Only 1 stamp away from your free gift!') that increase 30-day repeat visits by 34%.",
    questionHi: "Grahak ko discount dene wala app dukan ki sales kaise badhata hai?",
    answerHi: "70% grahak pehli baar aane ke baad bhool jate hain. CustomerPilot automated WhatsApp reminder bhejta hai ('Aapka 1 stamp baki hai 20% discount ke liye'), jisse repeat walk-in 34% badh jata hai."
  },
  {
    id: 4,
    questionEn: "Can I customize the stamp rules and rewards for my shop?",
    answerEn: "Yes! You have complete control. Set rules like '1 Stamp per ₹200 bill', '1 Stamp per visit', or 'Buy 5 Coffees, Get 1 Free'. You can also define custom VIP tiers (Silver, Gold, Platinum) with exclusive birthday and anniversary rewards.",
    questionHi: "Kya main apne hisab se stamp ke niyam aur discount set kar sakta hoon?",
    answerHi: "Haan, poora control aapke paas hai! 'Har ₹200 par 1 stamp', '5 visit par 1 free item', ya 'Silver/Gold VIP' niyam aap dashboard se 1 minute me set kar sakte hain."
  },
  {
    id: 5,
    questionEn: "Does CustomerPilot require special POS hardware or a barcode scanner?",
    answerEn: "Zero hardware required. All you need is our high-resolution printed acrylic QR standee placed at your billing counter. Customers scan with their own smartphone cameras, making setup 100% plug-and-play in under 5 minutes.",
    questionHi: "Kya iske liye koi special machine ya POS scanner khareedna padega?",
    answerHi: "Zero machine kharch! Sirf humara diya gaya high-quality QR standee counter par rakhna hai. Grahak apne phone se scan karte hain, kisi extra device ki zaroorat nahi hoti."
  }
]

export function WhatsAppDigitalLoyaltyClient() {
  const [chatMessages, setChatMessages] = useState<Array<{ d: 'in' | 'out', t: string, time: string }>>([])

  useEffect(() => {
    const msgs = [
      { d: 'in' as const, t: "Hi Hitesh! 🎂 Thanks for visiting Tasty Vadapav today!", time: "4:15 PM" },
      { d: 'out' as const, t: "Scan complete at billing counter 😊", time: "4:15 PM" },
      { d: 'in' as const, t: "🏆 <b>1 Loyalty Stamp Added!</b><br/>Your Progress: <b>4 / 5 Stamps</b> collected ⭐️", time: "4:16 PM" },
      { d: 'in' as const, t: "🎁 Just 1 more visit to unlock your <b>FREE 20% Discount Voucher!</b>", time: "4:16 PM" }
    ]

    let currentIndex = 0
    let timer: NodeJS.Timeout

    const addNextMessage = () => {
      if (currentIndex >= msgs.length) {
        timer = setTimeout(() => {
          setChatMessages([])
          currentIndex = 0
          addNextMessage()
        }, 3800)
        return
      }

      const msg = msgs[currentIndex]
      setChatMessages((prev) => [...prev, msg])
      currentIndex++
      timer = setTimeout(addNextMessage, 1500)
    }

    addNextMessage()
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Global CSS Theme Styles matching Master Homepage */}
      <style>{`
        :root {
          --em: #10b981; --em-d: #059669; --sky: #0ea5e9; --ind: #6366f1; --ind-d: #4f46e5;
          --slate: #0f172a; --slate6: #475569; --slate5: #64748b; --slate4: #94a3b8;
          --line: #e2e8f0;
        }
        .grad-txt { background: linear-gradient(90deg, #059669, #10b981, #0ea5e9); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .btn-grad { background: linear-gradient(90deg, #10b981, #059669); color: #fff; box-shadow: 0 10px 25px -8px rgba(16,185,129,.5); }
        .btn-grad:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .aurora { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .aurora b { position: absolute; display: block; border-radius: 50%; filter: blur(80px); }
        .aurora b:nth-child(1) { width: 500px; height: 500px; left: 50%; top: -80px; transform: translateX(-50%); background: rgba(16,185,129,.18); animation: fl 14s ease-in-out infinite; }
        .aurora b:nth-child(2) { width: 360px; height: 360px; right: -40px; top: 180px; background: rgba(6,182,212,.12); animation: fl 16s ease-in-out infinite 3s; }
        .aurora b:nth-child(3) { width: 340px; height: 340px; left: -60px; top: 240px; background: rgba(99,102,241,.12); animation: fl 18s ease-in-out infinite 6s; }
        @keyframes fl { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-20px) scale(1.06)} }
        .dots { position: absolute; inset: 0; z-index: 0; opacity: .4; background-image: radial-gradient(circle, rgba(16,185,129,.14) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.9); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: var(--slate6); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .dot-live { position: relative; width: 8px; height: 8px; }
        .dot-live i { position: absolute; inset: 0; border-radius: 50%; background: #10b981; }
        .dot-live i:first-child { animation: ping 1.6s cubic-bezier(0,0,.2,1) infinite; opacity: .7; }
        @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }
        .phone-mockup {
          width: 100%;
          max-width: 350px;
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
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1">
        
        {/* ============ HERO SECTION WITH LIVE WHATSAPP CHAT SIMULATOR ============ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          <div className="aurora"><b></b><b></b><b></b></div>
          <div className="dots"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Value Proposition in Indian English */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="badge">
                  <span className="dot-live"><i></i><i></i></span> India&apos;s #1 WhatsApp Digital Loyalty &amp; Stamp Card Platform
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  Turn One-Time Walk-ins into Repeat Customers with <span className="grad-txt">WhatsApp Digital Loyalty Cards</span>.
                </h1>

                <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  No Apps to Download. No Paper Cards to Lose. 34% Higher Repeat Footfall.
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Replace lost paper punch cards with an automated virtual loyalty card directly inside WhatsApp. Customers scan your counter QR in 3 seconds to collect stamps and unlock milestone rewards.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="btn-grad py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>Start 3-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="py-3.5 sm:py-4 px-5 text-sm sm:text-base font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-2 transition w-full sm:w-auto"
                  >
                    <span>View Pricing (From ₹6.2/day)</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Zero App Download Needed</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Works on Cash, Card &amp; UPI</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> 85%+ Reward Redemption Rate</span>
                </div>
              </div>

              {/* Right Column: Live Interactive WhatsApp Loyalty Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                
                {/* Mobile Device Mockup */}
                <div className="relative">
                  {/* Phone Device Screen with WhatsApp Chat */}
                  <div className="phone-mockup">
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

                    <div className="rounded-[28px] overflow-hidden bg-[#0b141a] text-white shadow-inner flex flex-col">
                      
                      {/* WhatsApp Header */}
                      <div className="flex items-center gap-2.5 bg-[#202c33] p-3 border-b border-[#2a3942]">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs">
                          TV
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">Tasty Vadapav VIP Club</div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Official Verified Bot</span>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Chat Area */}
                      <div className="p-3 space-y-2 min-h-[260px] bg-[#0b141a] flex flex-col justify-end text-xs">
                        {chatMessages.map((m, idx) => (
                          <div
                            key={idx}
                            className={`max-w-[88%] rounded-xl p-2.5 shadow-sm text-[11px] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                              m.d === "in"
                                ? "bg-[#202c33] text-slate-100 self-start rounded-bl-xs border border-slate-700/40"
                                : "bg-[#005c4b] text-white self-end rounded-br-xs"
                            }`}
                          >
                            <span dangerouslySetInnerHTML={{ __html: m.t }} />
                            <div className="text-[9px] text-slate-400 flex justify-end gap-1 mt-1">
                              <span>{m.time}</span>
                              {m.d === "in" && <span className="text-cyan-400 font-bold">✓✓</span>}
                            </div>
                          </div>
                        ))}

                        {/* Stamp Card Progress Graphic inside Chat */}
                        <div className="p-2.5 rounded-xl bg-[#202c33] border border-emerald-500/30 text-center space-y-1.5 mt-1">
                          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                            Virtual Stamp Card (4 of 5 Collected)
                          </div>
                          <div className="flex items-center justify-center gap-1.5">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                                ⭐️
                              </div>
                            ))}
                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-amber-400 text-amber-300 font-bold text-[10px] flex items-center justify-center animate-pulse">
                              🎁
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* WhatsApp Input Field */}
                      <div className="p-2 bg-[#202c33] flex items-center gap-2 border-t border-[#2a3942]">
                        <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[10px] text-slate-400">
                          Scan QR at checkout to stamp
                        </div>
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                          ➤
                        </div>
                      </div>

                      {/* Bottom Home Indicator Bar */}
                      <div className="py-2.5 flex justify-center bg-[#0b141a]">
                        <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">
                  ✦ Live WhatsApp Loyalty chat simulation · Instant stamp allocation
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
                <div className="text-3xl font-black text-emerald-600">+34%</div>
                <div className="text-xs text-slate-600 font-medium">Higher Repeat Walk-ins for Indian Retail</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-cyan-600">0 Apps</div>
                <div className="text-xs text-slate-600 font-medium">100% Native on WhatsApp</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-amber-600">&lt;5 Sec</div>
                <div className="text-xs text-slate-600 font-medium">Instant Counter QR Scan Speed</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-purple-600">85%+</div>
                <div className="text-xs text-slate-600 font-medium">Reward Milestone Redemption Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ AGITATION SECTION (100% INDIAN ENGLISH) ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-rose-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200">
                The Real Problem with Old Methods
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                Why Paper Punch Cards and Expensive 3rd-Party Apps Fail Indian Retailers
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                If you are still relying on paper stamp cards or forcing customers to download bulky mobile apps, you are losing up to 70% of your repeat revenue:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span>70% of Paper Cards are Lost or Forgotten at Home</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Customers leave paper cards in another jacket, lose them in wallets, or ruin them in laundry. The promise of an earned discount is lost, destroying repeat visit momentum.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span>80%+ Customers Refuse App Downloads at Billing Counters</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Foreign loyalty apps like Stamp Me force shoppers to download heavy apps while standing in line. Customers refuse, causing billing bottlenecks and massive drop-off.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Zero Re-Engagement Channel on Paper</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paper punch cards never capture customer phone numbers. If a regular customer stops visiting for 30 days, you have zero way to reach out and bring them back.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Expensive POS Hardware &amp; Heavy Lock-Ins</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traditional enterprise loyalty software charges ₹35,000 to ₹50,000 annually and demands costly hardware upgrades. CustomerPilot runs on 100% zero hardware.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS SECTION WITH INFOGRAPHICS & ANIMATION ============ */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 border-t border-b border-slate-200/80 relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-200/20 via-teal-200/20 to-cyan-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-emerald-800 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 shadow-xs inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                How It Works • 100% WhatsApp Native
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                How Our WhatsApp Loyalty Engine Works in 3 Simple Steps
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                No cards to lose. No apps to download. Turn first-time shoppers into lifelong VIP regulars directly on India&apos;s favorite messaging app.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Energy Line for Desktop */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 -translate-y-12 -z-0 opacity-40" />

              {/* Step 1 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      01
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Step 1 • Standee Scan
                    </span>
                  </div>

                  {/* Infographic Visual: Counter QR Standee */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-slate-50 border border-emerald-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-18 h-22 rounded-xl bg-white border border-emerald-200 shadow-md p-2 flex flex-col items-center justify-center text-center">
                        <div className="w-6 h-6 bg-emerald-600 rounded-md flex items-center justify-center text-white mb-1">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-black text-slate-900 leading-tight">Counter QR</span>
                        <span className="text-[7px] text-emerald-700 font-semibold">Standee</span>
                      </div>
                      <div className="text-emerald-500 font-bold text-lg animate-pulse">➔</div>
                      <div className="w-18 h-22 rounded-xl bg-[#0b141a] border border-[#202c33] shadow-md p-2 flex flex-col items-center justify-center text-white">
                        <div className="w-6 h-6 rounded-full bg-[#005c4b] flex items-center justify-center text-white mb-1">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[8px] font-black text-white leading-tight">WhatsApp</span>
                        <span className="text-[7px] text-emerald-300 font-semibold">Opens in 3s</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    1. Customer Scans Counter Standee
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Place our acrylic QR standee at your billing counter. The customer scans with their phone camera to instantly connect with your WhatsApp bot. Zero app downloads.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                  <span>⚡ 3-Second Counter Scan</span>
                  <span className="text-slate-400">Zero Friction</span>
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
                      Step 2 • Digital Stamp
                    </span>
                  </div>

                  {/* Infographic Visual: Virtual Punch Card Progress */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-teal-50 to-slate-50 border border-teal-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-teal-200 shadow-sm w-full max-w-[210px] space-y-1.5 text-center">
                      <div className="text-[9px] font-bold text-teal-700 uppercase tracking-wider">
                        Virtual Stamp Progress
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                            ⭐️
                          </div>
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-amber-400 text-amber-500 font-bold text-[10px] flex items-center justify-center animate-pulse">
                          🎁
                        </div>
                      </div>
                      <span className="inline-block text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        +1 Stamp Added Automatically
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    2. Instant Digital Stamp Credited
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Cashier stamps with 1 tap or cashier billing syncs automatically. The customer immediately receives an updated visual stamp progress card on their WhatsApp.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
                  <span>📲 Instant WhatsApp Notification</span>
                  <span className="text-slate-400">100% Paperless</span>
                </div>
              </div>

              {/* Step 3 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-cyan-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      03
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Step 3 • VIP Reward
                    </span>
                  </div>

                  {/* Infographic Visual: Reward Voucher & Re-engagement */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-50 to-slate-50 border border-cyan-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-cyan-200 shadow-sm w-full max-w-[210px] space-y-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-cyan-800 font-bold text-[10px]">
                        <Gift className="w-3.5 h-3.5 text-amber-500" />
                        <span>FREE 20% Voucher Unlocked!</span>
                      </div>
                      <div className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 py-0.5 rounded border border-amber-200">
                        VOUCHER: VIP-REWARD-20
                      </div>
                      <span className="inline-block bg-cyan-100 text-cyan-800 text-[8px] font-bold px-2 py-0.5 rounded-full">
                        Automated 21-Day Recall
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    3. Milestone Rewards &amp; Smart Recall
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    When the card fills up, CustomerPilot issues a digital voucher on WhatsApp. If a customer hasn&apos;t visited in 21 days, an automated reminder brings them back.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-cyan-700 font-semibold">
                  <span>🔥 +34% Repeat Walk-Ins</span>
                  <span className="text-slate-400">Zero Churn</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ BONUS CROSS-SELL SECTION ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 border border-amber-200/80 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300 inline-flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> Dual-Growth Retaining Engine
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Bonus: In-Built AI Google Review QR Generator Included
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-3xl">
                CustomerPilot features a built-in <strong>SEO-friendly AI Google review assistant</strong>. Along with collecting loyalty stamps, the system prompts happy customers to leave a 5-star Google review with pre-drafted AI options. You achieve: <strong>WhatsApp Customer Retention + #1 Google Maps Local Ranking</strong> from a single counter standee!
              </p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-800 font-semibold">
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Official Google GBP API Integration</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Private Feedback Gate for Negative Ratings</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> +2 Bonus Stamps on Verified Google Review</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ COMPARISON TABLE ============ */}
        <section className="py-16 bg-slate-50/70 border-t border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                Unbiased Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                CustomerPilot vs. Traditional Punch Cards vs. Stamp Me
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                See why modern Indian retailers, bakeries, cafes, and salons are replacing outdated apps and paper stamps with CustomerPilot.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th scope="col" className="py-4 px-4 sm:px-6 font-bold">Feature</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-extrabold text-emerald-800 bg-emerald-50/80 border-x border-emerald-200">
                      CustomerPilot (WhatsApp)
                    </th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-600">Stamp Me / Loop Loyalty</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-600">Paper Punch Cards</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">App Download Required?</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                      No (Works 100% on WhatsApp)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Yes (Play Store / App Store)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">No (Physical card)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Customer Drop-off Rate</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                      &lt;5% (Frictionless 3-sec QR scan)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">&gt;80% (Refuse app download)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">&gt;70% (Lost / Forgotten at home)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Automated Reminders</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                      Yes (Automated WhatsApp Alerts)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Push Notifications (Ignored)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">None (Paper can&apos;t message)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">In-Built AI Google Reviews</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                      Yes (Built-in QR + AI Drafts)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">No (Separate software needed)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">No</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Indian Retail &amp; UPI Focus</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                      Yes (Hinglish API, INR Pricing)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Western Focus ($ Pricing)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Local Only</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Pricing &amp; Cost</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-700 bg-emerald-50/40 border-x border-emerald-100">
                      From ₹6.2/day (₹2,249/year)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">$49+/month (~₹4,100/mo)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Recurring Printing Costs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ DUAL-LANGUAGE FAQ SECTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={LOYALTY_FAQS} accentColor="emerald" theme="light" />
        </section>

        {/* ============ BOTTOM CALL TO ACTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Ready to Replace Paper Punch Cards with WhatsApp Automation?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Start your 3-day unrestricted free trial today. Set up in 3 minutes, print your QR standee, and watch repeat walk-ins increase.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
                <Link href="/signup">
                  Get Your Counter QR Standee Now <ArrowRight className="w-5 h-5 ml-2" />
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
