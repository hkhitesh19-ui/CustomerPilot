"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Star,
  Check,
  ShieldCheck,
  Zap,
  TrendingUp,
  QrCode,
  ThumbsUp,
  MessageCircle,
  XCircle
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const REVIEW_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How does the AI Google Review QR code generator work for local retail shops?",
    answerEn: "Place the CustomerPilot acrylic QR standee on your billing counter. When customers scan it (or receive an automated post-visit WhatsApp message), our generative AI drafts an authentic, positive review highlighting their purchase. The customer taps once to open Google Maps directly to the review submission dialog with the text pre-filled.",
    questionHi: "Dukan ke liye AI Google Review QR code kaise kaam karta hai?",
    answerHi: "CustomerPilot ka acrylic QR standee apne billing counter par rakhein. Jab customer scan karta hai ya purchase ke baad WhatsApp receive karta hai, generative AI unke liye ek authentic 5-star review draft kar deta hai. Customer sirf 1 tap me Google Maps par review submit kar deta hai."
  },
  {
    id: 2,
    questionEn: "Does CustomerPilot filter or protect my business from negative reviews?",
    answerEn: "Yes! CustomerPilot features a Smart Sentiment Router. If a customer rates their experience 1 to 3 stars, they are routed to a private merchant feedback dialog where you can resolve their issue directly. Only 4 and 5-star satisfied ratings are directed to publish on Google Maps, safeguarding your public rating.",
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
    answerEn: "Google's local search algorithm places heavy weight on review velocity, recency, average star rating, and keyword-rich text. CustomerPilot reviews naturally include product keywords and location context, accelerating your position into Google Map's top-3 Local Pack.",
    questionHi: "Zyada Google reviews aane se Google Maps par dukan ki ranking kaise badhti hai?",
    answerHi: "Google ka algorithm un dukano ko top me dikhata hai jinke paas lagatar naye aur keyword-rich reviews aate hain. CustomerPilot ke AI reviews me business category aur product keywords auto-include hote hain, jisse aapki dukan Local Search me #1 rank karti hai."
  }
]

export function AiGoogleReviewQrClient() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-amber-500 selection:text-white flex flex-col justify-between">
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
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16 flex-1 w-full">
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold tracking-wide">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>AI Review QR Engine · 312% More 5-Star Reviews in 30 Days</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Turn Every Happy Customer into a Verified <span className="text-amber-600">5-Star Google Review</span> with Smart AI QR Codes.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop awkwardly begging customers for reviews. Place our Smart AI QR Standee on your counter. When customers scan, our generative AI drafts an authentic, high-converting review they can publish to Google Maps in 1 tap.
          </p>

          {/* SGE Statistic Callout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-amber-600">+312%</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Review Velocity</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">5 Seconds</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Submission Time</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-cyan-600">100%</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Negative Filter</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">#1 Rank</div>
              <div className="text-[11px] sm:text-xs text-slate-600 font-semibold mt-1">Google 3-Pack Boost</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">
              <Link href="/signup">
                Get Your AI Review QR Standee <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-base px-8 py-6 rounded-2xl shadow-xs">
              <Link href="/guide/operations">
                See How It Works in Live Counter
              </Link>
            </Button>
          </div>
        </section>

        {/* AGITATION SECTION */}
        <section className="p-6 sm:p-10 rounded-3xl bg-rose-50/50 border border-rose-200/80 shadow-xs space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 border border-rose-200">
              The Real Problem
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Kyun 90% Grahak Dukan Pasand Aane Par Bhi Google Review Nahi Dete?
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 pt-2 text-left">
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-black">1</div>
                <div className="text-sm font-bold text-slate-900">Review Likhna Mushkil Hai</div>
                <p className="text-xs text-slate-600">Mobile par 3-4 sentence likhna customer ke liye boring aur time-taking hota hai.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-black">2</div>
                <div className="text-sm font-bold text-slate-900">Google Maps Par Dukan Dhundna</div>
                <p className="text-xs text-slate-600">Grahak search me galat location ya competitor ki profile par pahunch jate hain.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-rose-100 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-black">3</div>
                <div className="text-sm font-bold text-slate-900">Ghar Jate Hi Bhool Jana</div>
                <p className="text-xs text-slate-600">Bina instant WhatsApp prompt aur reward incentive ke koi review post nahi karta.</p>
              </div>
            </div>
          </div>
        </section>

        {/* GEO / SGE 3-STEP BREAKDOWN */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              Generative Engine Blueprint (GEO)
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              How Our AI Google Review QR System Works in 3 Steps
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Engineered for seamless frictionless customer submissions in under 5 seconds
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Counter QR Scan or WhatsApp Trigger</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Customer scans the custom acrylic standee placed at your billing counter, or receives an automated post-purchase WhatsApp message after checkout.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Instant AI Draft Generation</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Generative AI crafts a personalized, authentic 5-star review draft including dish/service recommendations and local SEO keywords tailored to your store.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative overflow-hidden shadow-xs hover:border-slate-300 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">1-Tap Direct Publish to Google Maps</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Customer taps &quot;Publish to Google Maps&quot;. The review dialog opens directly on their phone with the AI draft pre-copied. 1 tap and it&apos;s live!
              </p>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              Direct Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              CustomerPilot AI Reviews vs Standard Google QR vs SMS Feedback
            </h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="py-4 px-4 sm:px-6">Feature</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 text-amber-900 bg-amber-50/80 border-x border-amber-200">
                    CustomerPilot AI Review QR
                  </th>
                  <th scope="col" className="py-4 px-4 sm:px-6 text-slate-600">Standard Google QR</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 text-slate-600">SMS Feedback Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">AI Pre-Drafted Review Content</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-amber-800 bg-amber-50/40 border-x border-amber-100">
                    Yes (Contextual AI drafts in 1-sec)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No (Blank text box)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Negative Feedback Protection</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-amber-800 bg-amber-50/40 border-x border-amber-100">
                    Yes (Private 1-3 star routing)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No (Direct public damage)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Partial</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Loyalty Stamp Bonus Loop</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-amber-800 bg-amber-50/40 border-x border-amber-100">
                    Yes (+2 bonus stamps on review)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No incentive</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">No incentive</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Customer Open / Conversion Rate</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-amber-800 bg-amber-50/40 border-x border-amber-100">
                    98% WhatsApp / 40%+ conversion
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">&lt;5% conversion</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">&lt;2% SMS open rate</td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Direct Review Modal URL</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-amber-800 bg-amber-50/40 border-x border-amber-100">
                    Direct Place ID review dialog
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">Generic Map search pin</td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500">External survey link</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* DUAL-LANGUAGE FAQ SECTION (ENGLISH DEFAULT + HINGLISH) */}
        <DualLangFaq items={REVIEW_FAQS} accentColor="amber" theme="light" />

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-amber-50 to-white border border-amber-200 shadow-sm space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
            Ready to Triple Your 5-Star Google Reviews?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Set up in 3 minutes. Print your high-resolution counter QR standee today and start collecting AI-assisted Google reviews on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">
              <Link href="/signup">
                Get Your Smart AI Review Standee <ArrowRight className="w-5 h-5 ml-2" />
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
