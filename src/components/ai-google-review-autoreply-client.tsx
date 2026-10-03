"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Check,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  ThumbsUp,
  Cpu,
  CheckCircle2,
  XCircle
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

export function AiGoogleReviewAutoReplyClient() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16 flex-1 w-full">
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs sm:text-sm font-bold tracking-wide">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>1-Click AI AutoReply · Boost Local Pack Visibility by 42%</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Automate Google Review Replies in <span className="text-indigo-600">1-Click</span> with Context-Aware Generative AI.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Never leave a customer review unanswered again. Gemini AI automatically crafts personalized, dish-specific owner replies in 1 second. Approve with 1 click or let autopilot publish directly to Google Maps.
          </p>

          {/* SGE Statistic Callout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Response Rate</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">1 Second</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Draft Generation</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-cyan-600">+42%</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Local SEO Boost</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">0 Hours</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Manual Typing</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
              <Link href="/signup">
                Connect Google Profile &amp; Try Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-base px-8 py-6 rounded-2xl shadow-xs">
              <Link href="/pricing">
                View SME-Friendly Pricing (₹6.2/day)
              </Link>
            </Button>
          </div>
        </section>

        {/* AGITATION SECTION */}
        <section className="p-6 sm:p-10 rounded-3xl bg-rose-50/50 border border-rose-200/80 shadow-xs space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 border border-rose-200">
              The Merchant Bottleneck
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Why 85% of Local Businesses Fail to Reply to Google Reviews
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 pt-2 text-left">
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-black">1</div>
                <div className="text-sm font-bold text-slate-900">Roz Type Karne Ka Time Nahi</div>
                <p className="text-xs text-slate-600">Dukan chalane ke baad daily Google Maps kholkar 10 reviews ka answer likhna impossible lagta hai.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-black">2</div>
                <div className="text-sm font-bold text-slate-900">Copy-Paste Replies Harm Trust</div>
                <p className="text-xs text-slate-600">Har review par &quot;Thanks for visiting&quot; chipkane se customers ko lagta hai owner ko parwah nahi.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-black">3</div>
                <div className="text-sm font-bold text-slate-900">Unanswered Reviews Drop SEO</div>
                <p className="text-xs text-slate-600">Google un dukano ko Maps 3-Pack me neeche kar deta hai jinki response rate low hoti hai.</p>
              </div>
            </div>
          </div>
        </section>

        {/* GEO / SGE 3-STEP BREAKDOWN */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
              Generative Engine Blueprint (GEO)
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              How CustomerPilot 1-Click AI AutoReply Works in 3 Steps
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Powered by Google Business Profile OAuth 2.0 and Gemini Generative AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Real-Time Review Detection</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The instant a customer submits a review on Google Maps, CustomerPilot securely fetches it via the official GBP API.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Gemini AI Crafts Contextual Reply</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Gemini AI parses the customer&apos;s feedback, mentions the dishes or services they loved, and generates an authentic, appreciative response in 1 second.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">1-Click Publish or Auto-Pilot Queue</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Approve with 1 click from your mobile dashboard, or enable trusted auto-pilot to publish after a 60-second safety delay with quota protection.
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200">
              Direct Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              CustomerPilot AI AutoReply vs Manual Typing vs Marketing Agency
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
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">3 to 7 Days (Forgotten)</td>
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
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Requires sharing password</td>
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
        </section>

        {/* DUAL-LANGUAGE FAQ SECTION (ENGLISH DEFAULT + HINGLISH) */}
        <DualLangFaq items={AUTOREPLY_FAQS} accentColor="indigo" theme="light" />

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-indigo-50 to-white border border-indigo-200 shadow-sm space-y-6">
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
