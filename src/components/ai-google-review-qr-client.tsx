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
  Sparkles
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"
import { LiveReviewReplyAnimation } from "@/components/live-review-reply-animation"

const REVIEW_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How does the Smart Ai Google Review QR work for local retail shops and cafes?",
    answerEn: "Place the CustomerPilot Smart Ai Google Review QR code on your billing counter. When customers scan it (or receive an automated post-visit WhatsApp prompt), our generative AI drafts an authentic, positive review highlighting their purchase. The customer taps once to open Google Maps directly to the review submission dialog with the text pre-filled.",
    questionHi: "Dukan ke liye AI Google Review QR code kaise kaam karta hai?",
    answerHi: "CustomerPilot ka Smart Ai Google Review QR apne billing counter par rakhein. Jab customer scan karta hai ya purchase ke baad WhatsApp receive karta hai, generative AI unke liye ek authentic 5-star review draft kar deta hai. Customer sirf 1 tap me Google Maps par review submit kar deta hai."
  },
  {
    id: 2,
    questionEn: "Does CustomerPilot filter or protect my business from negative reviews?",
    answerEn: "Yes! CustomerPilot features a Smart Sentiment Router (Private Feedback Shield). If a customer rates their experience 1 to 3 stars, they are routed to a private merchant feedback dialog where you can resolve their issue directly. Only 4 and 5-star satisfied ratings are directed to publish on Google Maps, safeguarding your public rating.",
    questionHi: "Kya ye software kharab reviews ko Google Maps par aane se rok sakta hai?",
    answerHi: "Haan! CustomerPilot me Smart Sentiment Router hota hai. Agar koi customer 1 se 3 star deta hai, toh wo Google Maps par jane ke bajaye private owner feedback form par chala jata hai jisse aap unki problem solve kar sakte hain. Sirf 4 aur 5-star reviews hi seedha Google Maps par publish hote hain."
  },
  {
    id: 3,
    questionEn: "Can I reward customers with bonus stamps for giving a 5-star Google review?",
    answerEn: "Absolutely! You can configure CustomerPilot to automatically award +2 bonus loyalty stamps (or exclusive reward discounts) once a customer submits their verified Google Review. This creates a powerful incentive loop that triples monthly review volume.",
    questionHi: "Kya review dene wale customer ko loyalty points ya bonus stamps milte hain?",
    answerHi: "Bilkul! CustomerPilot me aap review submit karne wale customers ko turant +2 bonus loyalty stamps ya reward coupon auto-credit kar sakte hain. Is incentive se monthly Google reviews 3X speed se badhte hain."
  },
  {
    id: 4,
    questionEn: "Does the customer need to download any app to post a Google review?",
    answerEn: "Zero app download required. The flow works 100% inside mobile web browsers and WhatsApp, connecting directly to the customer's native Google Maps app or browser account.",
    questionHi: "Kya grahak ko review dene ke liye koi naya app download karna padega?",
    answerHi: "Zero app download! Ye poori tarah browser aur WhatsApp par chalta hai aur customer ke phone me pehle se maujood Google Maps par 1-tap me review dialog open kar deta hai."
  },
  {
    id: 5,
    questionEn: "How does getting more Google reviews boost my store's local Google Maps ranking?",
    answerEn: "Google's local search algorithm places heavy weight on review velocity, recency, average star rating, and keyword-rich text. CustomerPilot reviews naturally include product keywords and location context, accelerating your position into Google Maps top-3 Local Pack.",
    questionHi: "Zyada Google reviews aane se Google Maps par dukan ki ranking kaise badhti hai?",
    answerHi: "Google ka algorithm un dukano ko top me dikhata hai jinke paas lagatar naye aur keyword-rich reviews aate hain. CustomerPilot ke AI reviews me business category aur product keywords auto-include hote hain, jisse aapki dukan Local Search me #1 rank karti hai."
  }
]

// Sample Real Review Options for Live AI Review Simulator
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

export function AiGoogleReviewQrClient() {
  const [activeReviewIdx, setActiveReviewIdx] = useState(0)
  const [copied, setCopied] = useState(false)

  // Rotate simulated reviews in hero simulator
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
      {/* Global CSS Theme Styles matching Master Homepage */}
      <style>{`
        :root {
          --em: #10b981; --em-d: #059669; --sky: #0ea5e9; --ind: #6366f1; --ind-d: #4f46e5;
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
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1">
        
        {/* ============ HERO SECTION WITH LIVE AI REVIEW SIMULATOR ============ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          <div className="aurora"><b></b><b></b><b></b></div>
          <div className="dots"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Value Proposition in Indian English */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="badge">
                  <span className="dot-live"><i></i><i></i></span> India&apos;s #1 Smart Ai Google Review QR System for Local Retail
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  Smart AI Google Review: Scan, Auto-Write &amp; Boost <span className="grad-txt">5-Star Reviews in 1 Click</span>
                </h1>

                {/* Direct Answer Snippet for Google SGE, Perplexity & LLM Citation Extraction (Max 45 words) */}
                <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Direct Answer Definition • Smart AI Google Review</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                    CustomerPilot&apos;s Smart AI Google Review is an automated customer feedback engine that uses smart QR codes to generate keyword-rich, authentic 5-star Google review drafts for local merchants, eliminating customer typing effort and filtering negative feedback privately.
                  </p>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="btn-grad py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>Get Your Smart Ai Google Review QR Free</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <a
                    href="#live-animation"
                    className="py-3.5 sm:py-4 px-5 text-sm sm:text-base font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-2 transition w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Watch Live AI Reply Demo ↓</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> 100% Google Policy Compliant</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Zero App Download Needed</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Private Feedback Shield Included</span>
                </div>
              </div>

              {/* Right Column: Live Interactive Review Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                
                {/* Phone Mockup Screen */}
                <div className="phone-mockup">
                  <div className="rounded-[40px] overflow-hidden bg-white text-slate-900 shadow-inner flex flex-col">
                    
                    {/* Top Phone Status Bar with Dynamic Island */}
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

                    {/* Top App Header */}
                    <div className="p-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] opacity-90 font-medium">
                        <span>Google Review Assistant</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">AI Drafted</span>
                      </div>
                      <div className="font-black text-base text-white truncate">{currentReview.store}</div>
                      <div className="flex items-center gap-1 text-amber-200 text-xs">
                        ★★★★★ <span className="text-white text-[10px] ml-1 font-semibold">5.0 Star Rating Selected</span>
                      </div>
                    </div>

                    {/* Review Card Body */}
                    <div className="p-4 space-y-3 bg-slate-50/60 text-xs">
                      <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Choose Your Preferred AI Review:</span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          SEO Optimized
                        </span>
                      </div>

                      {/* AI Draft Bubble */}
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

                      {/* 1-Tap Copy & Post Button */}
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
                            <span>1-Tap Copy &amp; Post on Google Maps</span>
                          </>
                        )}
                      </button>

                      <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct deep-link to official Google review form</span>
                      </div>
                    </div>

                    {/* Bottom Phone Home Indicator */}
                    <div className="py-2.5 bg-slate-50 flex justify-center border-t border-slate-200">
                      <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
                    </div>

                  </div>
                </div>

                <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">
                  ✦ Live AI Review Assistant simulator · Instant copy &amp; post
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============ GEO SGE STATISTIC HIGHLIGHTS ============ */}
        <section className="py-12 bg-slate-50/70 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-amber-600">+312%</div>
                <div className="text-xs text-slate-600 font-medium">Review Velocity within 30 Days</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">&lt;5 Sec</div>
                <div className="text-xs text-slate-600 font-medium">Average Customer Submission Time</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-cyan-600">100%</div>
                <div className="text-xs text-slate-600 font-medium">Private Negative Feedback Protection</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-slate-900">#1 Rank</div>
                <div className="text-xs text-slate-600 font-medium">Google Maps Local 3-Pack Boost</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ LIVE 3-STEP REAL-TIME REVIEW & OWNER AUTO-REPLY ANIMATION ENGINE (REVIEWPILOT STYLE) ============ */}
        <section id="live-animation" className="py-16 md:py-24 bg-gradient-to-b from-white via-indigo-50/20 to-white relative overflow-hidden border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/90 px-4 py-1.5 shadow-xs backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">21,000+ Reviews Generated &amp; Replied Across India</span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Review Arrives. AI Drafts. You Approve, It Publishes.
              </h2>
              <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
                Watch how CustomerPilot auto-fetches incoming Google reviews, drafts human-level empathetic replies with Gemini Pro AI, and publishes directly to Google Maps in a continuous automated loop.
              </p>
            </div>

            {/* Live Interactive 3-Card Engine */}
            <LiveReviewReplyAnimation />
          </div>
        </section>

        {/* ============ HOW IT WORKS WITH INFOGRAPHICS & ANIMATION ============ */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-amber-50/30 to-white relative overflow-hidden border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                Frictionless 3-Step Flow
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                How the Smart AI Review QR Works
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Eliminate blank screen anxiety and awkward begging. Watch reviews flow in 3 simple steps:
              </p>
            </div>

            {/* 3-Step Infographics with Animated Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 -translate-y-8 z-0 opacity-40"></div>

              {/* Step 1 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      01
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Step 1 • QR Scan
                    </span>
                  </div>

                  {/* Infographic Visual: Counter QR Code */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-slate-50 border border-amber-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-18 h-22 rounded-xl bg-white border border-amber-300 shadow-md p-2 flex flex-col items-center justify-center text-center">
                        <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center text-white mb-1">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-black text-slate-900 leading-tight">Counter QR</span>
                        <span className="text-[7px] text-amber-700 font-semibold">QR Code</span>
                      </div>
                      <div className="text-amber-500 font-bold text-lg animate-pulse">➔</div>
                      <div className="w-16 h-22 rounded-xl bg-slate-900 border border-slate-700 shadow-md p-1.5 flex flex-col items-center justify-center text-white">
                        <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300 text-xs font-black animate-pulse">
                          5★
                        </div>
                        <span className="text-[8px] font-bold text-slate-200 mt-1">Tap Camera</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    1. Customer Scans Counter QR Code
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Display your branded QR Code on your counter. When checking out, happy customers scan with their camera in under 3 seconds. Zero app download.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span>⚡ 3-Second Contactless Scan</span>
                  <span className="text-slate-400">Works on all phones</span>
                </div>
              </div>

              {/* Step 2 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-orange-500 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      02
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                      Step 2 • AI Draft
                    </span>
                  </div>

                  {/* Infographic Visual: AI Engine Draft Generation */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-orange-50 to-slate-50 border border-orange-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-orange-200 shadow-sm w-full max-w-[210px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">AI Draft Ready</span>
                        <span className="text-[9px] text-amber-500">★★★★★</span>
                      </div>
                      <p className="text-[9px] text-slate-700 italic truncate">&quot;Authentic taste, great service!&quot;</p>
                      <div className="flex gap-1 text-[7px] text-orange-800 font-bold">
                        <span className="bg-orange-100 px-1 rounded">#fresh</span>
                        <span className="bg-orange-100 px-1 rounded">#fast</span>
                        <span className="bg-orange-100 px-1 rounded">#5star</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    2. AI Drafts Authentic 5-Star Text
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Our AI instantly generates personalized, keyword-optimized review text referencing your store&apos;s specialties. Zero blank screen anxiety.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-orange-700 font-semibold">
                  <span>🤖 Zero Blank Screen Anxiety</span>
                  <span className="text-slate-400">SEO Keywords Injected</span>
                </div>
              </div>

              {/* Step 3 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      03
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Step 3 • Verified Review
                    </span>
                  </div>

                  {/* Infographic Visual: Google Maps Submission */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-slate-50 border border-emerald-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-sm w-full max-w-[210px] space-y-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Google Maps Live</span>
                      </div>
                      <div className="text-[9px] text-slate-600">Review posted publicly with 5-star rating</div>
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded-full">
                        Local 3-Pack Boosted
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    3. 1-Tap Copy &amp; Post to Google Maps
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Customer taps once to copy the text and opens Google Maps directly. 4-5★ reviews publish publicly, while 1-3★ ratings route to private owner feedback.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>🛡️ Private Shield Protected</span>
                  <span className="text-slate-400">88% Conversion</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============ AGITATION: THE 3 BIG FRICTION POINTS (IN PURSUIT OF EXCELLENCE) ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-rose-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200">
                The Customer Friction Bottleneck
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                Why 90% of Happy Walk-In Customers Never Leave a Google Review
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                You provide exceptional service, fresh food, or great products. Your customers leave smiling. So why is your Google profile silent?
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-black text-lg shadow-xs">
                  01
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Customers Walk Out and Forget</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Even your most satisfied customers get distracted by phone notifications and daily traffic the second they step outside your shop. Without an immediate counter trigger, reviews never get posted.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-black text-lg shadow-xs">
                  02
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Blank Screen Anxiety</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a customer opens Google Maps, they freeze when faced with an empty text box. Thinking up articulate sentences feels like homework, causing over 85% of shoppers to close the tab without submitting.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-black text-lg shadow-xs">
                  03
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Begging Customers Feels Awkward</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your billing staff feels hesitant to verbally plead with every customer at the counter. Traditional requests feel intrusive and rarely yield results without a frictionless digital assistant.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HEAD-TO-HEAD: STANDARD QR VS CUSTOMERPILOT SMART AI QR ============ */}
        <section className="py-16 bg-slate-50/70 border-t border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                AI vs Normal QR
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                Standard QR Code vs. CustomerPilot Smart AI Review QR
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Why standard Google QR stickers get ignored while CustomerPilot achieves an 88% review completion rate:
              </p>
            </div>

            {/* Stage 4: Structured GEO 4-Column Comparison Table for Google SGE & Perplexity Snippet Extraction */}
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[620px]">
                <caption className="sr-only">
                  Feature and Metrics Comparison Table: CustomerPilot Smart AI Review vs Standard QR Stands (MagicReview / TapNConnect) vs Normal Google QR
                </caption>
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th scope="col" className="p-4 sm:p-5 font-bold text-slate-900 w-1/4">
                      Feature &amp; Metrics
                    </th>
                    <th scope="col" className="p-4 sm:p-5 font-bold text-amber-900 bg-amber-50/70 border-x border-amber-200 w-1/3">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="font-extrabold text-slate-900">CustomerPilot (Smart AI Review)</span>
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full ml-auto uppercase tracking-wider">
                          #1 Best
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="p-4 sm:p-5 font-semibold text-slate-700 w-1/5">
                      Standard QR Stands <span className="block text-[11px] font-normal text-slate-500">(MagicReview / TapNConnect)</span>
                    </th>
                    <th scope="col" className="p-4 sm:p-5 font-semibold text-slate-700 w-1/6">
                      Normal Google QR
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <th scope="row" className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/40">
                      Review Drafting
                    </th>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-800 bg-amber-50/30 border-x border-amber-100">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Instant AI-generated personalized text
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600">
                      Generic template suggestions
                    </td>
                    <td className="p-4 sm:p-5 text-rose-600 font-medium">
                      Manual typing required
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <th scope="row" className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/40">
                      WhatsApp Integration
                    </th>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-800 bg-amber-50/30 border-x border-amber-100">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Direct billing-triggered review links
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600">
                      Stand-alone QR scan only
                    </td>
                    <td className="p-4 sm:p-5 text-rose-600 font-medium">
                      No integration
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <th scope="row" className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/40">
                      Negative Feedback Filter
                    </th>
                    <td className="p-4 sm:p-5 font-semibold text-emerald-800 bg-amber-50/30 border-x border-amber-100">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Private internal feedback gateway
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600">
                      Basic web form gating
                    </td>
                    <td className="p-4 sm:p-5 text-rose-600 font-medium">
                      Public negative review risk
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <th scope="row" className="p-4 sm:p-5 font-bold text-slate-900 bg-slate-50/40">
                      Conversion Rate
                    </th>
                    <td className="p-4 sm:p-5 font-bold text-emerald-800 bg-amber-50/30 border-x border-amber-100">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Up to 4.2x higher walk-in reviews
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-slate-600">
                      1.8x standard scan rate
                    </td>
                    <td className="p-4 sm:p-5 text-rose-600 font-medium">
                      Less than 5% conversion
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Old Traditional QR */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Standard Printed Google QR Code</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Opens Empty Text Box &bull; 85% Drop-Off</h3>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Customer must manually brainstorm and type 3-4 sentences on keypad.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>No protection against angry 1-star reviews posted publicly in anger.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Generic reviews without local search keywords (&quot;Good store&quot; gives zero SEO boost).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Zero customer incentive or loyalty points linked to verified review submissions.</span>
                  </li>
                </ul>
              </div>

              {/* CustomerPilot Smart AI QR */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-400 shadow-md space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Recommended
                </div>
                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <span>CustomerPilot Smart AI Review System</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">3 AI Drafts in 3 Secs &bull; 88% Publish Rate</h3>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Generative AI drafts 3 personalized, positive reviews ready for 1-tap submission.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Private Feedback Shield routes 1-3 star feedback privately to owner WhatsApp.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Organic local keyword injection shoots your store to #1 on Google Maps Local 3-Pack.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Automatic +2 Bonus Loyalty Stamps credited immediately upon Google review verification.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ============ PRIVATE FEEDBACK SHIELD DEEP-DIVE ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-emerald-200/80 shadow-sm grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Negative Feedback Shield
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Protect Your Public Google Rating from Unfair 1-Star Reviews
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Mistakes happen in busy retail and food service. CustomerPilot incorporates a Smart Sentiment Filter: satisfied 4 and 5-star customers are directed straight to Google Maps. Any unhappy 1 to 3-star feedback is captured privately into your merchant dashboard and WhatsApp, allowing you to resolve complaints and retain the customer before your public score takes a hit.
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
                <div className="font-extrabold text-sm text-slate-900">Maintain Pristine Reputation</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Keep your public Google score above 4.7 stars to stay in Google Maps top-ranked local recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ DUAL-LANGUAGE FAQ SECTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={REVIEW_FAQS} accentColor="amber" theme="light" />
        </section>

        {/* ============ BOTTOM CALL TO ACTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Ready to Triple Your 5-Star Google Reviews This Month?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Start your 3-day free trial today. Print your smart counter QR Code and watch customer reviews pour in on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">
                <Link href="/signup">
                  Get Your Smart Ai Google Review QR Now <ArrowRight className="w-5 h-5 ml-2" />
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
