import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, TrendingUp, Star, Users, Award, CheckCircle2, ArrowUpRight } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

export const metadata: Metadata = {
  title: "Case Study: Cake Connection Vadodara — 895% Google Review Growth in 90 Days | CustomerPilot",
  description: "How Cake Connection bakery in Vadodara grew Google reviews from 42 to 418 (+895%), improved rating from 4.1 to 4.8 stars, and achieved 31.4% repeat visit rate in just 90 days using CustomerPilot.",
  keywords: [
    "CustomerPilot case study",
    "bakery loyalty program results",
    "Google review growth bakery India",
    "WhatsApp loyalty stamps case study",
    "customer retention bakery Vadodara",
    "local business Google reviews increase"
  ],
  alternates: { canonical: "/case-studies/cake-connection" },
  openGraph: {
    title: "Cake Connection: 895% More Google Reviews in 90 Days — CustomerPilot Case Study",
    description: "Real numbers from a real bakery. See how CustomerPilot turned 42 Google reviews into 418 and doubled repeat customers.",
    url: "https://customerpilot.ai/case-studies/cake-connection",
    type: "article"
  }
}

const METRICS = [
  { label: "Google Reviews", before: "42 reviews", after: "418 reviews", growth: "+895%", icon: Star, color: "from-amber-400 to-orange-400", bgColor: "bg-amber-50", textColor: "text-amber-800", borderColor: "border-amber-200" },
  { label: "Average Star Rating", before: "4.1 Stars", after: "4.8 Stars", growth: "+0.7 Stars", icon: TrendingUp, color: "from-emerald-400 to-teal-400", bgColor: "bg-emerald-50", textColor: "text-emerald-800", borderColor: "border-emerald-200" },
  { label: "Customer Profiles Captured", before: "0 (Lost Traffic)", after: "2,840 Profiles", growth: "100% Owned CRM", icon: Users, color: "from-blue-400 to-indigo-400", bgColor: "bg-blue-50", textColor: "text-blue-800", borderColor: "border-blue-200" },
  { label: "Repeat Visit Rate (30-Day)", before: "14%", after: "31.4%", growth: "+124% Lift", icon: Award, color: "from-violet-400 to-purple-400", bgColor: "bg-violet-50", textColor: "text-violet-800", borderColor: "border-violet-200" },
  { label: "Monthly Revenue (Reminders)", before: "₹0", after: "₹42,600/mo", growth: "Direct ROI", icon: TrendingUp, color: "from-rose-400 to-pink-400", bgColor: "bg-rose-50", textColor: "text-rose-800", borderColor: "border-rose-200" }
]

export default function CakeConnectionCaseStudy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/"><BrandLogo size="sm" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/case-studies" className="text-xs font-semibold text-slate-500 hover:text-slate-900 hidden sm:block">← All Case Studies</Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">Start Free Trial</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white py-20 sm:py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6">
              📊 Real Case Study · Verified 90-Day Results
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Cake Connection Grew Google Reviews
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400 mt-2">
                42 → 418 Reviews in 90 Days
              </span>
            </h1>
            <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              A single-outlet bakery in Vadodara, Gujarat turned walk-in foot traffic into a fully owned customer database, boosted its Google Maps rating, and unlocked ₹42,600/month in new revenue — all using CustomerPilot with one counter QR standee.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Business Type: Retail Bakery & Cafe</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Location: Vadodara, Gujarat</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />Daily Walk-ins: 80–120</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-400" />Study Period: 90 Days</span>
            </div>
          </div>
        </section>

        {/* Key Metrics Cards */}
        <section className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                ✅ Verified 90-Day Results
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4">The Numbers Don&apos;t Lie.</h2>
              <p className="text-slate-500 text-sm mt-2">All metrics measured from Day 0 (before CustomerPilot) vs. Day 90 (after implementation).</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {METRICS.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.label} className={`rounded-2xl border ${m.borderColor} ${m.bgColor} p-5 relative overflow-hidden`}>
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full bg-white border ${m.borderColor} ${m.textColor}`}>
                        {m.growth}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-wider">{m.label}</p>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-xs text-slate-400 line-through">{m.before}</span>
                      <span className={`text-xl font-black ${m.textColor}`}>{m.after}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Full Data Table */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Complete 90-Day Results Table</h2>
              <p className="text-slate-500 text-sm mt-2">Head-to-head comparison of every key operational metric</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left px-5 py-4 font-bold text-xs uppercase tracking-wider">Metric</th>
                    <th className="text-center px-4 py-4 font-bold text-xs uppercase tracking-wider text-slate-400">Before CustomerPilot</th>
                    <th className="text-center px-4 py-4 font-bold text-xs uppercase tracking-wider text-emerald-300">After 90 Days</th>
                    <th className="text-center px-4 py-4 font-bold text-xs uppercase tracking-wider text-amber-300">Net Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    ["Total Google Reviews", "42 reviews", "418 reviews", "+895% 🚀"],
                    ["Average Google Star Rating", "4.1 Stars", "4.8 Stars", "+0.7 Star Jump ⭐"],
                    ["Customer Phone Numbers (CRM)", "0 (Lost traffic)", "2,840 verified profiles", "100% Owned CRM 📱"],
                    ["Repeat Visit Rate (30 Days)", "14%", "31.4%", "+124% Repeat Lift 🔄"],
                    ["Monthly Revenue from Reminders", "₹0", "₹42,600", "Direct ROI 💰"],
                    ["Staff Training Time", "N/A", "< 15 minutes", "One standee, done ✅"],
                    ["Customer App Downloads Required", "N/A", "ZERO", "100% WhatsApp ✅"],
                  ].map(([metric, before, after, growth], i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 text-xs">{metric}</td>
                      <td className="px-4 py-3.5 text-center text-slate-400 text-xs line-through">{before}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-700 text-xs">{after}</td>
                      <td className="px-4 py-3.5 text-center font-black text-amber-700 text-xs">{growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3-Phase Story */}
        <section className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How It Was Done: 3-Phase Implementation</h2>
            </div>
            <div className="space-y-10">
              {/* Phase 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-black text-sm">01</div>
                  <h3 className="text-lg font-black text-slate-900">Baseline Context — The Problem Before CustomerPilot</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  {[
                    { icon: "🏪", title: "Single outlet, Vadodara", desc: "Daily walk-in traffic of 80–120 customers" },
                    { icon: "⭐", title: "Stagnant 4.1 Rating", desc: "Only 42 total reviews accumulated over 2 years" },
                    { icon: "💸", title: "70% First-Time Churn", desc: "No contact data captured at billing counter" },
                  ].map(item => (
                    <div key={item.title} className="bg-slate-50 rounded-xl p-4">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                      <div className="text-slate-500 text-xs mt-1">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase 2 */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-black text-sm">02</div>
                  <h3 className="text-lg font-black text-slate-900">CustomerPilot Implementation — What Was Set Up</h3>
                </div>
                <ul className="space-y-3 mt-4">
                  {[
                    "Countertop Acrylic QR Standee placed at billing counter: \"Scan to claim instant ₹50 welcome reward on WhatsApp\"",
                    "Zero POS friction — cashier only needs to scan-confirm each purchase (5-second action)",
                    "Automated post-purchase WhatsApp flow: 2 hours after billing, customer receives a soft review invitation",
                    "5-star customers: Instantly redirected to Google Maps with AI-drafted review pre-filled (just paste & post)",
                    "1-3 star customers: Routed to private feedback box — owner gets WhatsApp alert to resolve before it goes public",
                    "Win-back automation: 30-day inactive customers receive a \"We miss you! Here's ₹100 off\" WhatsApp message"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm">03</div>
                  <h3 className="text-lg font-black text-emerald-900">Verified 90-Day Outcomes — The Proof</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { metric: "+895%", label: "Google Review Growth (42 → 418)", emoji: "🚀" },
                    { metric: "4.8 ⭐", label: "New Average Rating (was 4.1)", emoji: "⭐" },
                    { metric: "2,840", label: "Customer Profiles Owned (was 0)", emoji: "📱" },
                    { metric: "₹42,600", label: "Monthly Revenue from Reminders", emoji: "💰" },
                  ].map(item => (
                    <div key={item.label} className="bg-white rounded-xl border border-emerald-200 p-4 flex items-center gap-4">
                      <div className="text-3xl">{item.emoji}</div>
                      <div>
                        <div className="text-2xl font-black text-emerald-700">{item.metric}</div>
                        <div className="text-xs text-slate-600 font-medium mt-0.5">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="text-5xl text-slate-200 font-black mb-4">&ldquo;</div>
            <blockquote className="text-lg sm:text-xl font-semibold text-slate-800 leading-relaxed italic">
              Pehle log cake leke chale jaate the — hume pata bhi nahi padta woh dubara aaye ya nahi. Ab har week 30+ customers khud message karte hain ki kab aayein naya offer lene. CustomerPilot ne humara CRM, Google reputation, sab kuch handle kar liya — without a single extra app.
            </blockquote>
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-lg">H</div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-sm">Hitesh</div>
                <div className="text-slate-500 text-xs">Founder, Cake Connection · Vadodara, Gujarat</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              Ready to Get Results Like Cake Connection?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-xl mx-auto">
              Start your 7-day free trial — no credit card, no app for customers, no POS dependency. Just one counter QR standee.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm shadow-lg transition-all hover:scale-[1.02]">
                Start 7-Day Free Trial Today <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all">
                View 50% Off Pricing Plans <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span>✓ No credit card required</span>
              <span>✓ No app for customers</span>
              <span>✓ Setup in 3 minutes</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
