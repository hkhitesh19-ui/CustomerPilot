"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Gift,
  Star,
  MessageSquare,
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  TrendingUp,
  Layers,
  Crown,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const COMPLETE_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "What modules are included in CustomerPilot Complete?",
    answerEn: "CustomerPilot Complete bundles all 4 core growth engines: (1) 100% App-Free WhatsApp Digital Stamp Cards, (2) Smart AI Google Review QR Generator with 5-second submissions, (3) 1-Click AI AutoReply for Google Maps via official GBP APIs, and (4) Smart Digital Business Cards with 1-tap contact saving and catalog links.",
    questionHi: "CustomerPilot Complete me kaun kaun se modules shamil hain?",
    answerHi: "CustomerPilot Complete me charon core modules shamil hain: (1) WhatsApp Digital Loyalty Stamp Card, (2) Smart AI Google Review QR Generator, (3) 1-Click Google Maps AI AutoReply, aur (4) Luxury Smart Digital Business Card."
  },
  {
    id: 2,
    questionEn: "Can I use CustomerPilot without buying any expensive billing POS machine?",
    answerEn: "Zero special hardware required! CustomerPilot operates 100% in the cloud. You can run the cashier queue on any smartphone, iPad, tablet, or desktop, or simply place our printable counter QR standee for customer self-checkin.",
    questionHi: "Kya CustomerPilot bina kisi mehenge POS machine ke chal sakta hai?",
    answerHi: "Zero special machine required! CustomerPilot poori tarah cloud-based hai. Aap standard smartphone, tablet, ya laptop se Cashier Queue chala sakte hain ya customer counter ka QR khud scan kar sakte hain."
  },
  {
    id: 3,
    questionEn: "How does CustomerPilot Complete compare to separate tools like Birdeye or Stamp Me?",
    answerEn: "Buying point solutions separately (Stamp Me for loyalty at $49/mo, Birdeye for reviews at $299/mo, and Linktree for links) costs over ₹3,00,000/year and leaves your customer data fragmented. CustomerPilot gives you all four modules unified inside WhatsApp at just ₹2,249/year (₹6.2/day).",
    questionHi: "Birdeye ya Stamp Me ke mukable CustomerPilot Complete kaise behtar hai?",
    answerHi: "Alag-alag tools kharidne par saal ka ₹3,00,000+ kharch hota hai aur data alag-alag rehta hai. CustomerPilot me chaaron tools direct WhatsApp ke sath milte hain sirf ₹2,249/saal (₹6.2/din) me."
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg transition-all">
              <Link href="/signup">Start Free Trial →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16 flex-1 w-full">
        {/* HERO SECTION */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold tracking-wide">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span>CustomerPilot Complete · All-in-One Customer Retention Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            The <span className="text-emerald-400">All-In-One</span> Retention, Loyalty &amp; Google Reputation Stack for Indian Retail.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop juggling 4 fragmented apps. CustomerPilot unifies WhatsApp Digital Stamp Cards, Smart AI Google Reviews, 1-Click AutoReply on Google Maps, and Luxury Digital Business Cards in one intuitive cloud dashboard.
          </p>

          {/* SGE Statistic Callout */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">4-in-1</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">Unified Platform</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">+34%</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">Repeat Footfall</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">95%</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">Cost Savings</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="text-2xl sm:text-3xl font-black text-white">₹6.2/day</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-1">All-Inclusive Price</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <Link href="/signup">
                Get Complete Stack Free — 3 Days <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-slate-700 text-slate-200 hover:bg-slate-800 font-bold text-base px-8 py-6 rounded-2xl">
              <Link href="/pricing">
                View 50% Off Pro Pricing
              </Link>
            </Button>
          </div>
        </section>

        {/* 4-IN-1 ARCHITECTURE CARDS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Unified Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Everything Your Store Needs to Retain 100% of Customers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold">
                <Gift className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">1. WhatsApp Digital Stamp Cards</h3>
                <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full">VIP Club</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Say goodbye to paper cards. Customers collect digital stamps directly in WhatsApp in 5 seconds. Automated milestone celebrations and inactivity reminders bring them back 34% faster.
              </p>
              <Link href="/whatsapp-digital-loyalty-card" className="inline-flex items-center text-xs font-bold text-amber-400 hover:underline">
                Explore WhatsApp Loyalty Pillar →
              </Link>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                <Star className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">2. Smart AI Google Reviews QR</h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">AI Drafts</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Smart counter QR standees that pre-draft authentic, keyword-rich 5-star reviews on customer phones. Triple your Google review velocity and shield your profile with private negative feedback filtering.
              </p>
              <Link href="/ai-google-review-qr-generator" className="inline-flex items-center text-xs font-bold text-emerald-400 hover:underline">
                Explore AI Review QR Pillar →
              </Link>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">3. 1-Click AI AutoReply on Google Maps</h3>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full">1-Sec Publish</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Gemini AI connects to your Google Business Profile to generate warm, appreciative owner responses in 1 second. Boost local Google 3-Pack visibility by 42% with a 100% response rate.
              </p>
              <Link href="/ai-google-review-autoreply" className="inline-flex items-center text-xs font-bold text-indigo-400 hover:underline">
                Explore 1-Click AutoReply Pillar →
              </Link>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">4. Smart Digital Business Cards</h3>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full">vCard + QR</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Next-generation mobile visiting cards with 1-Tap Save Contact to phonebook (.vcf), direct Google Reviews submission dialog, WhatsApp chat, and online ordering delivery links.
              </p>
              <Link href="/smart-digital-business-card" className="inline-flex items-center text-xs font-bold text-cyan-400 hover:underline">
                Explore Digital Card Pillar →
              </Link>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE VS SEPARATE POINT TOOLS */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Total Cost of Ownership
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              CustomerPilot Complete vs Buying 4 Separate Tools
            </h2>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="py-4 px-4 sm:px-6">Feature / Capability</th>
                  <th scope="col" className="py-4 px-4 sm:px-6 text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    CustomerPilot Complete
                  </th>
                  <th scope="col" className="py-4 px-4 sm:px-6">Buying 4 Separate Tools (Stamp Me + Birdeye + Reelo + Linktree)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Annual Subscription Cost</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    ₹2,249/year (₹6.2/day)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">₹3,40,000+/year ($588 + $2,400 + ₹24,000)</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">App Download Friction for Customers</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    Zero — 100% Inside WhatsApp
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">High (&gt;80% drop-off due to app stores)</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Unified Customer CRM</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    Single Database (Stamps + Reviews + Contacts)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Fragmented across 4 logins</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Indian Retail &amp; UPI Localization</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    100% (INR pricing, Hinglish, UPI)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Western focus (USD credit cards only)</td>
                </tr>

                <tr className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold">Hardware Setup Required</td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-400 bg-emerald-950/20 border-x border-emerald-500/20">
                    Zero — Simple Acrylic Counter QR
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-400">Beacons, complex POS integrations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* DUAL-LANGUAGE FAQ SECTION (ENGLISH DEFAULT + HINGLISH) */}
        <DualLangFaq items={COMPLETE_FAQS} accentColor="emerald" />

        {/* BOTTOM CALL TO ACTION */}
        <section className="text-center p-8 sm:p-12 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            Unlock the Complete Customer Retention Engine Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Get instant access to WhatsApp Loyalty, AI Google Reviews, 1-Click AutoReply, and Smart Digital Cards with our 3-day unrestricted free trial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base px-8 py-6 rounded-2xl shadow-xl hover:scale-105 transition-all">
              <Link href="/signup">
                Start 3-Day Free Trial (CustomerPilot Complete) <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition">Contact</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
