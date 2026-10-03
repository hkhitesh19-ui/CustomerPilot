"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  XCircle,
  Copy,
  ShieldAlert,
  CheckCircle2,
  Store,
  Sparkles,
  Package
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const STANDEE_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "What is the AI Google Review QR Standee by CustomerPilot?",
    answerEn:
      "It is a premium acrylic counter display unit containing a smart QR code. When customers scan it at your billing counter, CustomerPilot AI auto-generates a personalized 5-star Google review draft in their WhatsApp for instant 1-tap submission to Google Maps — zero typing, zero app download.",
    questionHi: "CustomerPilot ka AI Google Review QR Standee kya hota hai?",
    answerHi:
      "Ye ek premium acrylic counter display hai jisme ek smart QR code laga hota hai. Jab customer billing counter par scan karta hai, CustomerPilot AI unke WhatsApp mein ek personalized 5-star Google review draft bhejta hai — 1 tap mein Google Maps par publish, koi typing nahi, koi app download nahi."
  },
  {
    id: 2,
    questionEn: "What material is the QR review standee made of and what are its dimensions?",
    answerEn:
      "CustomerPilot's counter standee is made of premium 5mm acrylic glass with UV-printed QR code, double-sided mounting tape for counter fixing, and comes in A5 size (14.8cm × 21cm) — ideal for restaurant tables, salon reception desks, and retail billing counters.",
    questionHi: "QR review standee kis material ka bana hota hai aur iska size kya hota hai?",
    answerHi:
      "CustomerPilot ka standee 5mm premium acrylic glass se bana hota hai, UV-printed QR code ke sath. Iska size A5 (14.8cm × 21cm) hota hai aur iske sath double-sided mounting tape aata hai — restaurant tables, salon counters aur retail billing counters ke liye perfect."
  },
  {
    id: 3,
    questionEn: "Does CustomerPilot filter or protect my business from negative reviews posted via the standee?",
    answerEn:
      "Yes! CustomerPilot features a Smart Sentiment Router (Private Feedback Shield). If a customer rates their experience 1 to 3 stars, they are routed to a private merchant feedback dialog where you can resolve their issue directly. Only 4 and 5-star ratings are directed to publish on Google Maps, safeguarding your public rating.",
    questionHi: "Kya standee se aane wale kharab reviews se business protect hota hai?",
    answerHi:
      "Haan! CustomerPilot mein Smart Sentiment Router hota hai. Agar koi customer 1 se 3 star deta hai, toh wo Google Maps par jane ke bajaye private owner feedback form par chala jata hai. Sirf 4 aur 5-star reviews hi Google Maps par publish hote hain."
  },
  {
    id: 4,
    questionEn: "Do customers need to download any app to use the QR standee?",
    answerEn:
      "Zero app download required. The review flow works 100% inside WhatsApp and mobile web browsers. The standee QR triggers a WhatsApp message with the AI review pre-drafted — customers just tap 'Send to Google Maps'.",
    questionHi: "Kya customer ko koi naya app download karna padega standee use karne ke liye?",
    answerHi:
      "Zero app download! QR standee scan karne par WhatsApp mein seedha AI-drafted review aa jata hai. Customer sirf 1 tap mein Google Maps par submit kar sakta hai — koi naya app install karne ki zaroorat nahi."
  },
  {
    id: 5,
    questionEn: "Can I reward customers with bonus stamps for giving a 5-star Google review via the standee?",
    answerEn:
      "Absolutely! You can configure CustomerPilot to automatically award +2 bonus loyalty stamps once a customer submits their verified Google Review via the standee QR. This powerful incentive loop triples monthly review volume.",
    questionHi: "Kya standee se review dene wale customer ko loyalty bonus milta hai?",
    answerHi:
      "Bilkul! Aap CustomerPilot configure kar sakte hain ki standee se review submit karne wale customers ko turant +2 bonus loyalty stamps auto-credit ho jayein. Is incentive loop se monthly Google reviews 3X speed se badhte hain."
  }
]

const SIMULATED_REVIEWS = [
  {
    store: "Tasty Vadapav · Atladara Branch",
    category: "Fast Food & Snacks",
    text: "Hot, crispy Vadapav with authentic Mumbai taste and spicy garlic chutney! The service at the counter was super fast and hygienic. Definitely the best vadapav in Atladara!",
    keywords: ["crispy Vadapav", "Mumbai taste", "fast service"]
  },
  {
    store: "Gujarat Photo Goods · Rajmahal Road",
    category: "Camera & Studio Equipment",
    text: "Outstanding collection of professional camera gear and lenses! The team gave genuine advice for my Sony setup and billing was instant. Highly recommended photography store in Vadodara!",
    keywords: ["camera gear", "genuine pricing", "expert advice"]
  },
  {
    store: "Cake Connection · Alkapuri",
    category: "Bakery & Desserts",
    text: "Ordered a custom birthday cake and it tasted absolutely divine! Fresh, moist, and beautifully decorated. Wonderful staff and prompt WhatsApp confirmation.",
    keywords: ["custom cake", "fresh & moist", "prompt service"]
  }
]

export function AiReviewStandeeClient() {
  const [activeReviewIdx, setActiveReviewIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReviewIdx((prev) => (prev + 1) % SIMULATED_REVIEWS.length)
      setCopied(false)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const currentReview = SIMULATED_REVIEWS[activeReviewIdx]

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(currentReview.text).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-500 selection:text-white flex flex-col justify-between">
      <style>{`
        :root {
          --em: #10b981; --em-d: #059669; --sky: #0ea5e9; --ind: #6366f1;
          --slate: #0f172a; --slate6: #475569; --slate5: #64748b; --slate4: #94a3b8;
          --line: #e2e8f0; --amber: #f59e0b;
        }
        .grad-txt { background: linear-gradient(90deg, #d97706, #f59e0b, #10b981); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .btn-grad { background: linear-gradient(90deg, #f59e0b, #10b981); color: #fff; box-shadow: 0 10px 25px -8px rgba(245,158,11,.5); }
        .btn-grad:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .aurora { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .aurora b { position: absolute; display: block; border-radius: 50%; filter: blur(80px); }
        .aurora b:nth-child(1) { width: 500px; height: 500px; left: 50%; top: -80px; transform: translateX(-50%); background: rgba(245,158,11,.15); animation: fl 14s ease-in-out infinite; }
        .aurora b:nth-child(2) { width: 360px; height: 360px; right: -40px; top: 180px; background: rgba(16,185,129,.12); animation: fl 16s ease-in-out infinite 3s; }
        .aurora b:nth-child(3) { width: 340px; height: 340px; left: -60px; top: 240px; background: rgba(217,119,6,.12); animation: fl 18s ease-in-out infinite 6s; }
        @keyframes fl { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-20px) scale(1.06)} }
        .dots { position: absolute; inset: 0; z-index: 0; opacity: .4; background-image: radial-gradient(circle, rgba(245,158,11,.15) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.9); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: var(--slate6); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .dot-live { position: relative; width: 8px; height: 8px; }
        .dot-live i { position: absolute; inset: 0; border-radius: 50%; background: #f59e0b; }
        .dot-live i:first-child { animation: ping 1.6s cubic-bezier(0,0,.2,1) infinite; opacity: .7; }
        @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }
        .phone-mockup {
          width: 100%;
          max-width: 350px;
          border-radius: 50px;
          background: #0f172a;
          padding: 10px;
          box-shadow: 0 40px 90px -20px rgba(15,23,42,0.35), 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 4px #1e293b;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .phone-mockup:hover {
          transform: translateY(-4px);
          box-shadow: 0 50px 100px -25px rgba(245,158,11,0.28), 0 0 0 1px rgba(255,255,255,0.18), 0 0 0 4px #1e293b;
        }
      `}</style>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/free-ai-google-review-generator"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Free Review Generator</span>
            </Link>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all">
              <Link href="/signup">Get Standee Free →</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">

        {/* ============ HERO SECTION ============ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          <div className="aurora"><b></b><b></b><b></b></div>
          <div className="dots"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="badge">
                  <span className="dot-live"><i></i><i></i></span> India&apos;s Best AI Google Review Acrylic QR Counter Standee
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  AI Google Review QR Standee: <span className="grad-txt">Acrylic Counter Display That Auto-Generates 5-Star Reviews</span>
                </h1>

                {/* Direct Answer Snippet for LLM Citation */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    <span>What Is It • AI Google Review QR Standee</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    CustomerPilot&apos;s AI Google Review QR Standee is a premium acrylic counter display that auto-generates personalized 5-star Google review drafts via WhatsApp when customers scan it — zero typing, zero app download, instant Google Maps submission for local retail stores.
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="btn-grad py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>Get Your Acrylic Review Standee Free</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href="/smart-ai-google-review"
                    className="py-3.5 sm:py-4 px-5 text-sm sm:text-base font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-2 transition w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>See AI Software Details ↗</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Free Standee Setup on Signup</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Premium 5mm Acrylic Build</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Private Feedback Shield Included</span>
                </div>
              </div>

              {/* Right Column: Phone Mockup */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                <div className="phone-mockup">
                  <div className="rounded-[40px] overflow-hidden bg-white text-slate-900 shadow-inner flex flex-col">
                    <div className="pt-2.5 pb-2 px-6 flex items-center justify-between text-[11px] font-bold text-white bg-slate-950 select-none border-b border-white/10">
                      <span className="tracking-tight">9:41</span>
                      <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2 border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] opacity-90">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] opacity-90 font-medium">
                        <span>AI Review QR Standee</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">Auto-Drafted</span>
                      </div>
                      <div className="font-black text-base text-white truncate">{currentReview.store}</div>
                      <div className="flex items-center gap-1 text-amber-200 text-xs">
                        ★★★★★ <span className="text-white text-[10px] ml-1 font-semibold">5.0 Star Rating Selected</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 bg-slate-50/60 text-xs">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>AI-Drafted via Counter Standee QR:</span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          SEO Optimized
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <p className="text-[11px] text-slate-700 leading-relaxed italic">
                          &quot;{currentReview.text}&quot;
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {currentReview.keywords.map((kw) => (
                            <span key={`${currentReview.store}-${kw}`} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[9px] font-bold border border-amber-200">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-slate-950" />
                            <span>Copied! Opening Google Maps...</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-slate-950" />
                            <span>1-Tap Copy & Post on Google Maps</span>
                          </>
                        )}
                      </button>

                      <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct deep-link to official Google review form</span>
                      </div>
                    </div>

                    <div className="py-2.5 bg-slate-50 flex justify-center border-t border-slate-200">
                      <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">
                  ✦ Counter Standee QR triggers this WhatsApp flow automatically
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============ STAT HIGHLIGHTS ============ */}
        <section className="py-12 bg-slate-50/70 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-amber-600">A5 Size</div>
                <div className="text-xs text-slate-600 font-medium">14.8cm × 21cm Premium Acrylic</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">5mm</div>
                <div className="text-xs text-slate-600 font-medium">Crystal Clear Acrylic Thickness</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-cyan-600">88%</div>
                <div className="text-xs text-slate-600 font-medium">Review Completion Rate</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-slate-900">Free</div>
                <div className="text-xs text-slate-600 font-medium">Included on Every Signup</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW THE STANDEE WORKS ============ */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-amber-50/30 to-white relative overflow-hidden border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                Frictionless 3-Step Flow
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                How the Acrylic QR Standee Works at Your Counter
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Place on counter. Customer scans. AI auto-drafts. Review published. That simple.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 -translate-y-8 z-0 opacity-40"></div>

              {[
                {
                  num: "01",
                  color: "bg-amber-500 text-slate-950",
                  tag: "Step 1 • Counter Scan",
                  tagColor: "bg-amber-50 text-amber-800 border-amber-200",
                  h3: "1. Customer Scans Acrylic Standee",
                  p: "Place our premium acrylic standee on your billing counter. Customers scan the QR with their camera in under 3 seconds. No app download required — works on every smartphone.",
                  foot: "⚡ 3-Second Contactless Scan",
                  footRight: "Works on all phones"
                },
                {
                  num: "02",
                  color: "bg-orange-500 text-white",
                  tag: "Step 2 • AI Draft via WhatsApp",
                  tagColor: "bg-orange-50 text-orange-800 border-orange-200",
                  h3: "2. AI Sends Review Draft to WhatsApp",
                  p: "CustomerPilot AI instantly crafts a personalized, keyword-optimized 5-star review referencing your store's specialties and sends it directly to the customer's WhatsApp — zero blank screen anxiety.",
                  foot: "🤖 AI Personalized in Real-Time",
                  footRight: "SEO Keywords Injected"
                },
                {
                  num: "03",
                  color: "bg-emerald-600 text-white",
                  tag: "Step 3 • 1-Tap Google Maps Post",
                  tagColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  h3: "3. Customer Taps Once → Google Maps",
                  p: "Customer taps the WhatsApp link to open Google Maps with the review pre-filled. 4-5★ ratings publish publicly to boost your Local Pack ranking. 1-3★ routes privately to your dashboard.",
                  foot: "🛡️ Private Shield Active",
                  footRight: "88% Publish Rate"
                }
              ].map((step) => (
                <div key={step.num} className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`w-10 h-10 rounded-2xl ${step.color} font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        {step.num}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${step.tagColor}`}>
                        {step.tag}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">{step.h3}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.p}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                    <span>{step.foot}</span>
                    <span className="text-slate-400">{step.footRight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ HEAD-TO-HEAD COMPARISON TABLE ============ */}
        <section className="py-16 bg-slate-50/70 border-t border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                Standee vs Standard QR
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                AI Review QR Standee vs. Standard Counter QR Sticker
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Why plain QR stickers get ignored while CustomerPilot&apos;s acrylic standee achieves an 88% review rate:
              </p>
            </div>

            {/* GEO 5-Dimension Table */}
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
                <caption className="sr-only">
                  Feature comparison: CustomerPilot AI Review QR Standee vs MagicReview/TapNConnect vs Normal QR Sticker
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th scope="col" className="p-4 sm:p-5 font-bold text-slate-900 w-1/4">Feature</th>
                    <th scope="col" className="p-4 sm:p-5 font-bold text-amber-900 bg-amber-50/70 border-x border-amber-200 w-1/3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">CustomerPilot AI Standee</span>
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full ml-auto uppercase tracking-wider">#1 Best</span>
                      </div>
                    </th>
                    <th scope="col" className="p-4 sm:p-5 font-semibold text-slate-700 w-1/5">
                      Standard QR Stands <span className="block text-[11px] font-normal text-slate-500">(MagicReview / TapNConnect)</span>
                    </th>
                    <th scope="col" className="p-4 sm:p-5 font-semibold text-slate-700 w-1/6">Plain QR Sticker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Review Drafting", "Instant AI-generated personalized text", "Generic template suggestions", "Manual typing required"],
                    ["WhatsApp Integration", "Direct billing-triggered review links", "Stand-alone QR scan only", "No integration"],
                    ["Negative Feedback Filter", "Private internal feedback gateway", "Basic web form gating", "Public negative review risk"],
                    ["Physical Build Quality", "5mm premium acrylic, UV-printed", "Plastic laminate or paper", "Paper sticker only"],
                    ["Conversion Rate", "Up to 4.2x higher walk-in reviews", "1.8x standard scan rate", "Less than 5% conversion"],
                  ].map(([feature, cp, std, plain], i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <th scope="row" className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/40">{feature}</th>
                      <td className="p-4 sm:p-5 font-semibold text-emerald-800 bg-amber-50/30 border-x border-amber-100">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          {cp}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-slate-600">{std}</td>
                      <td className="p-4 sm:p-5 text-rose-600 font-medium">{plain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ PRIVATE FEEDBACK SHIELD ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-emerald-200/80 shadow-sm grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Standee Negative Feedback Shield
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Your Standee Protects Your Rating — Not Just Collects Reviews
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  CustomerPilot&apos;s Smart Sentiment Filter ensures that satisfied 4 and 5-star customers are directed straight to Google Maps while unhappy 1 to 3-star feedback is captured privately into your merchant dashboard and WhatsApp — allowing you to resolve issues before your public score takes a hit.
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 4-5★ ➔ Published to Google Maps</span>
                  <span className="flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-amber-600" /> 1-3★ ➔ Private Owner WhatsApp Alert</span>
                </div>
              </div>
              <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-black">
                  4.8★
                </div>
                <div className="font-extrabold text-sm text-slate-900">Maintain Pristine Rating</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Keep your public Google score above 4.7 stars to stay in Google Maps top-ranked recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ DUAL-LANGUAGE FAQ ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={STANDEE_FAQS} accentColor="amber" theme="light" />
        </section>

        {/* ============ BOTTOM CTA ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Get Your Premium AI Review Acrylic Standee — Free on Signup
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Start your 3-day free trial today. Print your smart acrylic counter standee and watch customer reviews pour in on autopilot. Also explore our AI Software solution:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">
                <Link href="/signup">
                  Get Acrylic Standee Now <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-300 text-slate-800 font-bold text-sm px-6 py-6 rounded-2xl">
                <Link href="/smart-ai-google-review">
                  Explore AI Software →
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

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
