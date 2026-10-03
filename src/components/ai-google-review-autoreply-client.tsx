"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Send,
  Bot,
  Sparkles,
  MapPin,
  Zap
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const AUTOREPLY_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How does 1-Click AI AutoReply work with my Google Business Profile?",
    answerEn: "CustomerPilot connects securely to your Google Business Profile via official Google OAuth APIs. Whenever a new review is posted, our Gemini AI engine analyzes the sentiment, mentions specific products, and prepares a warm, professional owner response ready for 1-click approval.",
    questionHi: "1-Click AI AutoReply mere Google Business Profile ke sath kaise judhta hai?",
    answerHi: "CustomerPilot official Google OAuth ke zariye aapke Google Business Profile se judh jata hai. Jab bhi koi naya review aata hai, Gemini AI review ko padhkar context ke hisab se owner reply tayyar kar deta hai jise aap 1-click me publish kar sakte hain."
  },
  {
    id: 2,
    questionEn: "Does the AI reply sound robotic or does it mention specific customer details?",
    answerEn: "Zero robotic templates. The AI reads the actual text of the review—if the customer praised your 'Butter Croissant' or mentioned 'friendly staff at the counter', the AI contextualizes the response to thank them specifically for that exact dish and visit context.",
    questionHi: "Kya AI ka reply robot jaisa lagta hai ya customer ki specific baaton ka jawab deta hai?",
    answerHi: "Zero robot template! AI customer ke review ke word-to-word details ko samajhta hai. Agar customer ne 'Special Chai' ya 'quick billing' ki tareef ki hai, toh AI reply me unhi cheezon ka zikr karke natural aur warm owner reply banata hai."
  },
  {
    id: 3,
    questionEn: "Can I edit the AI reply before it gets published to Google Maps?",
    answerEn: "Yes! Every reply is placed in your Pre-Approval Queue with a 60-second safety delay. You can publish it in 1-click, customize the text in seconds, or let trusted auto-pilot post verified appreciative responses automatically.",
    questionHi: "Kya main Google Maps par publish hone se pehle AI reply ko edit kar sakta hoon?",
    answerHi: "Haan, bilkul! Sabhi replies aapke Pre-Approval Queue me aate hain jisme 60 second ka delay hota hai. Aap 1 click me approve kar sakte hain ya apni marzi se text edit karke publish kar sakte hain."
  },
  {
    id: 4,
    questionEn: "How does replying to all Google reviews boost my local Google ranking?",
    answerEn: "Google's official guidelines state that businesses that actively respond to customer reviews demonstrate higher trustworthiness. Consistent, fast review replies directly boost your Local 3-Pack rankings and result in 28% more direction requests.",
    questionHi: "Sabhi reviews ka jawab dene se Google Maps par local ranking kaise improve hoti hai?",
    answerHi: "Google ke official algorithm me owner response rate aur response time bahut zaroori ranking factor hai. 100% reviews ka timely jawab dene se Google aapki dukan ko search aur map directions me top par push karta hai."
  },
  {
    id: 5,
    questionEn: "Does this software violate Google Business Profile policies?",
    answerEn: "100% compliant. CustomerPilot operates strictly through official Google Cloud Console APIs and enterprise OAuth 2.0 authorization, without scraping or unauthorized automation bots.",
    questionHi: "Kya ye tool Google ki policies aur guidelines ke anusar safe hai?",
    answerHi: "100% safe aur policy compliant! CustomerPilot official Google Business Profile API aur verified OAuth 2.0 token ke zariye kaam karta hai, bina kisi bot ya scraping ke."
  }
]

// Real Live Google Maps Review & Context-Aware Reply Scenarios
const SIMULATED_REPLY_SCENARIOS = [
  {
    reviewer: "Amit Patel",
    rating: 5,
    time: "2 hours ago",
    customerText: "Ordered hot vadapav and dabeli at Tasty Vadapav Atladara. The garlic chutney was top-notch and service was lightning fast!",
    aiReply: "Thank you so much, Amit! We are delighted you enjoyed our authentic Mumbai-style Vadapav, Dabeli, and special garlic chutney at our Atladara-Padra Road counter. Looking forward to serving you again soon! — Owner, Tasty Vadapav",
    store: "Tasty Vadapav · Atladara Branch"
  },
  {
    reviewer: "Meera Shah",
    rating: 5,
    time: "Yesterday",
    customerText: "Bought a Godox flash and Sony camera lens from Gujarat Photo Goods. Great genuine guidance and friendly counter staff.",
    aiReply: "Thanks a lot for your wonderful feedback, Meera! We are thrilled our team could assist you with the right Godox flash and Sony lens setup. Wishing you fantastic photography sessions! — Gujarat Photo Goods",
    store: "Gujarat Photo Goods · Rajmahal Road"
  },
  {
    reviewer: "Dr. Kunal Sharma",
    rating: 5,
    time: "3 days ago",
    customerText: "Cake Connection made our daughter's birthday cake so special! Fresh cream, perfect sweetness, and delivered on time.",
    aiReply: "Warmest thanks, Dr. Kunal! It was a true pleasure baking your daughter's birthday cake. So glad the fresh cream and flavors made the celebration memorable! — Cake Connection",
    store: "Cake Connection · Alkapuri"
  }
]

export function AiGoogleReviewAutoReplyClient() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0)
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveScenarioIdx((prev) => (prev + 1) % SIMULATED_REPLY_SCENARIOS.length)
      setIsPublished(false)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const currentScenario = SIMULATED_REPLY_SCENARIOS[activeScenarioIdx]

  const handlePublish = () => {
    setIsPublished(true)
    setTimeout(() => setIsPublished(false), 2500)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      {/* Global CSS Theme Styles matching Master Homepage */}
      <style>{`
        :root {
          --em: #10b981; --em-d: #059669; --sky: #0ea5e9; --ind: #6366f1; --ind-d: #4f46e5;
          --slate: #0f172a; --slate6: #475569; --slate5: #64748b; --slate4: #94a3b8;
          --line: #e2e8f0;
        }
        .grad-txt { background: linear-gradient(90deg, #4f46e5, #6366f1, #0ea5e9); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .btn-grad { background: linear-gradient(90deg, #4f46e5, #0ea5e9); color: #fff; box-shadow: 0 10px 25px -8px rgba(79,70,229,.5); }
        .btn-grad:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .aurora { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .aurora b { position: absolute; display: block; border-radius: 50%; filter: blur(80px); }
        .aurora b:nth-child(1) { width: 500px; height: 500px; left: 50%; top: -80px; transform: translateX(-50%); background: rgba(99,102,241,.15); animation: fl 14s ease-in-out infinite; }
        .aurora b:nth-child(2) { width: 360px; height: 360px; right: -40px; top: 180px; background: rgba(14,165,233,.12); animation: fl 16s ease-in-out infinite 3s; }
        .aurora b:nth-child(3) { width: 340px; height: 340px; left: -60px; top: 240px; background: rgba(16,185,129,.12); animation: fl 18s ease-in-out infinite 6s; }
        @keyframes fl { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-20px) scale(1.06)} }
        .dots { position: absolute; inset: 0; z-index: 0; opacity: .4; background-image: radial-gradient(circle, rgba(99,102,241,.14) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.9); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: var(--slate6); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .dot-live { position: relative; width: 8px; height: 8px; }
        .dot-live i { position: absolute; inset: 0; border-radius: 50%; background: #6366f1; }
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
          box-shadow: 0 50px 100px -25px rgba(99,102,241,0.28), 0 0 0 1px rgba(255,255,255,0.18), 0 0 0 4px #1e293b;
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
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1">
        
        {/* ============ HERO SECTION WITH LIVE AUTO-REPLY SIMULATOR ============ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          <div className="aurora"><b></b><b></b><b></b></div>
          <div className="dots"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Value Proposition in Indian English */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="badge">
                  <span className="dot-live"><i></i><i></i></span> India&apos;s #1 Gemini AI Google Review Auto-Reply Engine
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  Automate Google Review Replies in <span className="grad-txt">1-Click</span> with Context-Aware AI.
                </h1>

                <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  100% Response Rate. &lt;1 Sec Generation. Boost Local Google Maps Ranking by 42%.
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Never leave a customer review unanswered again. Gemini AI automatically crafts personalized, dish-specific owner responses in 1 second. Approve with 1 click or let autopilot publish directly to Google Maps.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="btn-grad py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>Connect Google Profile &amp; Try Free</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="py-3.5 sm:py-4 px-5 text-sm sm:text-base font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-2 transition w-full sm:w-auto"
                  >
                    <span>View SME Pricing (₹6.2/day)</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Official Google GBP API</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> 60-Sec Pre-Approval Delay</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Zero Robotic Templates</span>
                </div>
              </div>

              {/* Right Column: Live Interactive Google Maps Review Reply Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                
                {/* Phone Mockup Screen */}
                <div className="phone-mockup">
                  <div className="rounded-[40px] overflow-hidden bg-white text-slate-900 shadow-inner flex flex-col">
                    
                    {/* Top Phone Status Bar with Dynamic Island */}
                    <div className="pt-2.5 pb-2 px-6 flex items-center justify-between text-[11px] font-bold text-white bg-slate-950 select-none border-b border-white/10">
                      <span className="tracking-tight">9:41</span>
                      <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2 border border-slate-800">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] opacity-90">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Top App Header */}
                    <div className="p-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] opacity-90 font-medium">
                        <span>Google Review Reply Studio</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">Gemini AI</span>
                      </div>
                      <div className="font-black text-base text-white truncate">{currentScenario.store}</div>
                      <div className="text-[10px] text-indigo-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Connected via official Google GBP OAuth
                      </div>
                    </div>

                    {/* Review Card Body */}
                    <div className="p-4 space-y-3 bg-slate-50/60 text-xs">
                      
                      {/* Customer Review Bubble */}
                      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-900">{currentScenario.reviewer}</span>
                          <span className="text-[10px] text-slate-400">{currentScenario.time}</span>
                        </div>
                        <div className="text-amber-500 text-[11px] tracking-tight">★★★★★</div>
                        <p className="text-[11px] text-slate-600 leading-relaxed italic">
                          &quot;{currentScenario.customerText}&quot;
                        </p>
                      </div>

                      {/* AI Generated Reply Card */}
                      <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 shadow-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-indigo-800 font-bold">
                          <span className="flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5 text-indigo-600" /> Contextual AI Owner Draft
                          </span>
                          <span className="bg-indigo-100 px-1.5 py-0.5 rounded text-[9px] font-bold">0.8s</span>
                        </div>
                        <p className="text-[11px] text-slate-800 leading-relaxed font-medium">
                          {currentScenario.aiReply}
                        </p>
                      </div>

                      {/* 1-Click Action Button */}
                      <button
                        type="button"
                        onClick={handlePublish}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        {isPublished ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>Published to Google Maps!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>1-Click Publish to Google Maps</span>
                          </>
                        )}
                      </button>

                      <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 pt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>60-second safety delay &bull; Pre-approval mode</span>
                      </div>
                    </div>

                    {/* Bottom Phone Home Indicator */}
                    <div className="py-2.5 bg-slate-50 flex justify-center border-t border-slate-200">
                      <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
                    </div>

                  </div>
                </div>

                <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">
                  ✦ Live Gemini AI Review Reply simulator · Auto-rotating real reviews
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
                <div className="text-3xl font-black text-indigo-600">100%</div>
                <div className="text-xs text-slate-600 font-medium">Google Maps Owner Response Rate</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">1 Sec</div>
                <div className="text-xs text-slate-600 font-medium">Gemini AI Reply Generation Speed</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-cyan-600">+42%</div>
                <div className="text-xs text-slate-600 font-medium">Local 3-Pack SEO Visibility Boost</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-slate-900">0 Hours</div>
                <div className="text-xs text-slate-600 font-medium">Manual Owner Keypad Typing</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ AGITATION SECTION (100% INDIAN ENGLISH) ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-rose-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200">
                The Merchant Bottleneck
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                Why 85% of Local Businesses Fail to Reply to Google Reviews
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Managing store operations leaves zero time for manual typing. Here is why traditional review management falls apart:
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-black text-lg shadow-xs">
                  01
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">No Time for Daily Manual Typing</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  After managing billing, inventory, and staff all day, opening Google Maps every evening to type thoughtful responses feels impossible for store owners.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-black text-lg shadow-xs">
                  02
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Robotic Canned Replies Damage Trust</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pasting generic &quot;Thanks for visiting&quot; messages across every review makes your business appear uncaring and harms customer sentiment.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 font-black text-lg shadow-xs">
                  03
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Unanswered Reviews Drag Down SEO</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Google&apos;s local search algorithm demotes stores that have low owner response rates, directly lowering your footfall and direction requests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS SECTION WITH INFOGRAPHICS & ANIMATION ============ */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-t border-b border-slate-200/80 relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-200/20 via-blue-200/20 to-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-indigo-800 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 shadow-xs inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                How It Works • Official Google OAuth + Gemini AI
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                How 1-Click AI AutoReply Works in 3 Simple Steps
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Turn hours of manual typing into effortless 1-click approvals. Protect your Google Maps reputation with 100% policy-compliant AI responses.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Energy Line for Desktop */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-300 via-blue-300 to-emerald-300 -translate-y-12 -z-0 opacity-40" />

              {/* Step 1 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      01
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                      Step 1 • Instant Catch
                    </span>
                  </div>

                  {/* Infographic Visual: Google Maps Review Webhook Detection */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50 to-slate-50 border border-indigo-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-18 h-22 rounded-xl bg-white border border-indigo-200 shadow-md p-2 flex flex-col items-center justify-center text-center">
                        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-black text-slate-900 leading-tight">Google Maps</span>
                        <span className="text-[7px] text-indigo-700 font-semibold">New Review</span>
                      </div>
                      <div className="text-indigo-500 font-bold text-lg animate-pulse">➔</div>
                      <div className="w-18 h-22 rounded-xl bg-indigo-900 border border-indigo-700 shadow-md p-2 flex flex-col items-center justify-center text-white">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white mb-1">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[8px] font-black text-white leading-tight">Real-Time</span>
                        <span className="text-[7px] text-indigo-200 font-semibold">Detection</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    1. Real-Time Maps Detection
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    The second a customer leaves a review on Google Maps, CustomerPilot securely catches it via official Google Business Profile APIs. Zero manual monitoring needed.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-indigo-800 font-semibold">
                  <span>⚡ Instant API Webhook</span>
                  <span className="text-slate-400">Zero Delay</span>
                </div>
              </div>

              {/* Step 2 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      02
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      Step 2 • Gemini AI
                    </span>
                  </div>

                  {/* Infographic Visual: Contextual AI Draft Generation */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50 to-slate-50 border border-blue-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-blue-200 shadow-sm w-full max-w-[210px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Owner Reply Draft</span>
                        <Bot className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                      </div>
                      <p className="text-[9px] text-slate-700 italic truncate">&quot;Thank you for loving our Dutch Truffle Cake!&quot;</p>
                      <div className="flex gap-1 text-[7px] text-blue-800 font-bold">
                        <span className="bg-blue-100 px-1 rounded">100% Policy-Safe</span>
                        <span className="bg-blue-100 px-1 rounded">Personalized</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    2. Gemini Contextual Draft
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Gemini AI reads every word, mentions the specific food items or services praised, and crafts a warm, authentic owner reply in less than 1 second.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-blue-700 font-semibold">
                  <span>🤖 Dish &amp; Item Recognition</span>
                  <span className="text-slate-400">Zero Robotic Cliches</span>
                </div>
              </div>

              {/* Step 3 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      03
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Step 3 • 1-Click Post
                    </span>
                  </div>

                  {/* Infographic Visual: 1-Click Publish or Autopilot Buffer */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-slate-50 border border-emerald-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-sm w-full max-w-[210px] space-y-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live on Google Maps</span>
                      </div>
                      <div className="text-[9px] text-slate-600">60-second review buffer or 1-tap WhatsApp send</div>
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-[8px] font-bold px-2 py-0.5 rounded-full">
                        100% Response Rate Maintained
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    3. 1-Click Publish or Autopilot
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Review and approve directly from your smartphone with a single click, or let our safety-buffered autopilot respond automatically while keeping 100% control.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>🛡️ 60-Second Safety Window</span>
                  <span className="text-slate-400">100% Response Rate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ COMPARISON TABLE ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-indigo-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
                Direct Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                CustomerPilot AI AutoReply vs. Manual Owner Typing vs. Marketing Agency
              </h2>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th scope="col" className="py-4 px-4 sm:px-6">Feature</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 text-indigo-900 bg-indigo-50/80 border-x border-indigo-200">
                      CustomerPilot AI AutoReply
                    </th>
                    <th scope="col" className="py-4 px-4 sm:px-6 text-slate-600">Manual Owner Typing</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 text-slate-600">Marketing Agency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Response Speed</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-indigo-800 bg-indigo-50/40 border-x border-indigo-100">
                      1 Second (Real-time queue)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">3 to 7 Days (Delayed)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">24 to 48 Hours</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Response Personalization</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-indigo-800 bg-indigo-50/40 border-x border-indigo-100">
                      Context-aware (Specific dishes &amp; names)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Generic &quot;Thanks&quot;</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Templated canned text</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Official Google GBP API</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-indigo-800 bg-indigo-50/40 border-x border-indigo-100">
                      Yes (OAuth 2.0, 100% policy-safe)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Manual app login</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Requires sharing passwords</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Negative Review De-escalation</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-indigo-800 bg-indigo-50/40 border-x border-indigo-100">
                      Empathetic AI drafts + Owner phone redirect
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Emotional defensive arguments</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Slow canned corporate text</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Cost &amp; Pricing</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-indigo-800 bg-indigo-50/40 border-x border-indigo-100">
                      From ₹6.2/day (Included in Pro)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Free but burns owner time</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">₹15,000 to ₹30,000/month</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ DUAL-LANGUAGE FAQ SECTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={AUTOREPLY_FAQS} accentColor="indigo" theme="light" />
        </section>

        {/* ============ BOTTOM CALL TO ACTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Never Leave Another Google Review Unanswered
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Connect your Google Business Profile in 1-Click with Google OAuth. Start your 3-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
                <Link href="/signup">
                  Launch 1-Click AI AutoReply Free <ArrowRight className="w-5 h-5 ml-2" />
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
