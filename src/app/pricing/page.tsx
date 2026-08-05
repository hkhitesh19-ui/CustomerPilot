"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Check, Sparkles, Shield, Crown, Zap, Gift, Star, Users, ArrowRight,
  Database, HelpCircle, CheckCircle2, Lock, Award, HeartHandshake, Flame,
  Download, FileSpreadsheet, Layers, ShieldCheck, Share2, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrandLogo } from "@/components/brand-logo"

export default function PricingPage() {
  const foundingCounters = {
    platinum: { total: 10, remaining: 7, claimed: 3, discount: "50%", freeDuration: "2 Years FREE", limit: "Unlimited VIP Members" },
    gold: { total: 40, remaining: 29, claimed: 11, discount: "35%", freeDuration: "1 Year FREE", limit: "Up to 25,000 VIP Members" },
    silver: { total: 50, remaining: 46, claimed: 4, discount: "20%", freeDuration: "6 Months FREE", limit: "Up to 10,000 VIP Members" },
  }

  const totalSeatsLeft = foundingCounters.platinum.remaining + foundingCounters.gold.remaining + foundingCounters.silver.remaining

  const outcomeCards = [
    {
      icon: "❤️",
      title: "Bring Customers Back",
      subtitle: "Digital Loyalty Stamps & VIP Club",
      badge: "Repeat Visit Engine",
      description: "Perfect for bakeries, cafes, and salons wanting to convert single-time walk-ins into 10x repeat regulars.",
      features: [
        "✔ Digital Loyalty Card",
        "✔ VIP Club Engine",
        "✔ Birthday Rewards Engine",
        "✔ Repeat Visit Tracking",
        "✔ Instant QR-based Membership",
      ],
      btnText: "Start FREE Trial ➔",
      popular: false,
    },
    {
      icon: "⭐",
      title: "Get More Google Reviews",
      subtitle: "AI Draft & WhatsApp Review Flow",
      badge: "Local SEO Growth",
      description: "Automatically collect authentic 5-star Google reviews right after a customer purchase on WhatsApp.",
      features: [
        "✔ AI Review Draft Engine",
        "✔ WhatsApp Review Flow",
        "✔ 1-Click Copy & Post",
        "✔ Live Review Analytics",
        "✔ Organic Rating Booster",
      ],
      btnText: "Start FREE Trial ➔",
      popular: false,
    },
    {
      icon: "🤖",
      title: "1-Click GoogleReview AutoReply",
      subtitle: "Gemini AI Draft & 1-Click Post",
      badge: "Pre-Approval Assistant Mode",
      description: "Gemini AI automatically drafts appreciative, context-aware owner responses. Store owners review & publish on Google Maps in 1-Click!",
      features: [
        "✔ Gemini AI Contextual Reply",
        "✔ 1-Click Copy & Post on Google Maps",
        "✔ Personalized Tone & Name Mention",
        "✔ Bulk Unreplied Review Handler",
        "✔ Dead-Letter Queue Quota Safety",
      ],
      btnText: "Start FREE Trial ➔",
      popular: false,
    },
    {
      icon: "🚀",
      title: "CustomerPilot Complete",
      subtitle: "Loyalty + AI Reviews + 1-Click AutoReply",
      badge: "⭐ MOST POPULAR",
      description: "All 3 outcome engines combined into one single unified AI customer retention system.",
      features: [
        "✔ Full Digital Loyalty Stamp Engine",
        "✔ Full AI Draft Google Review Flow",
        "✔ Full 1-Click GoogleReview AutoReply",
        "✔ VIP Customer Database Ownership",
        "✔ Priority Founder Support",
      ],
      btnText: "Start FREE Trial ➔",
      popular: true,
    },
  ]

  const capacityPlans = [
    {
      name: "Starter Growth Plan",
      capacity: "Up to 500 VIP Members",
      duration: "6 Months",
      price: "₹999",
      period: "for 6 months",
      badge: "Ideal for New Shops",
      popular: false,
      description: "Perfect for new bakeries, cafes, and salons starting their digital retention journey.",
      features: [
        "Capacity: 500 Unique VIP Members",
        "100% Features Included (No Locking)",
        "Loyalty Stamp Engine",
        "AI Draft Google Reviews",
        "Google Review Auto-Reply",
        "100% Customer CSV & Excel Export",
      ],
      link: "/signup?plan=starter",
    },
    {
      name: "Growth Plan",
      capacity: "Up to 2,000 VIP Members",
      duration: "1 Year",
      price: "₹2,499",
      period: "for 1 full year",
      badge: "⭐ MOST POPULAR",
      popular: true,
      description: "Best for growing local businesses wanting steady repeat visits and 5-star Google reviews.",
      features: [
        "Capacity: 2,000 Unique VIP Members",
        "100% Features Included (No Locking)",
        "Loyalty Stamp Engine",
        "AI Draft Google Reviews",
        "Google Review Auto-Reply",
        "Priority Customer Support",
        "100% Customer CSV & Excel Export",
      ],
      link: "/signup?plan=growth",
    },
    {
      name: "Business Plan",
      capacity: "Up to 10,000 VIP Members",
      duration: "1 Year",
      price: "₹5,999",
      period: "for 1 full year",
      badge: "High Footfall Shops",
      popular: false,
      description: "Designed for high-volume bakeries, busy restaurants, and high-footfall outlets.",
      features: [
        "Capacity: 10,000 Unique VIP Members",
        "100% Features Included (No Locking)",
        "Loyalty Stamp Engine",
        "AI Draft Google Reviews",
        "Google Review Auto-Reply",
        "Dedicated Account Manager",
        "100% Customer CSV & Excel Export",
      ],
      link: "/signup?plan=business",
    },
    {
      name: "Enterprise",
      capacity: "Unlimited VIP Members",
      duration: "Custom",
      price: "Custom",
      period: "tailored billing",
      badge: "Multi-Branch / Franchise",
      popular: false,
      description: "Built for franchises and multi-location business chains requiring central dashboards.",
      features: [
        "Capacity: Unlimited VIP Members",
        "100% Features Included (No Locking)",
        "Multi-Branch Central Dashboard",
        "Custom POS & API Integration",
        "Dedicated 24/7 Phone Support",
      ],
      link: "/help?topic=enterprise",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* ─── Glowing Aurora Orbs (Matches Homepage Theme) ─────────── */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-indigo-200/40 rounded-full blur-[140px] pointer-events-none" />

      {/* ─── Top Scarcity Bar ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 py-2.5 px-4 text-center text-xs font-extrabold text-white flex items-center justify-center gap-2 shadow-md relative z-10">
        <Flame className="w-4 h-4 animate-bounce text-amber-300" />
        <span>🔥 ONLY {totalSeatsLeft} FOUNDING MERCHANT SEATS REMAINING WORLDWIDE!</span>
        <Link href="#founding" className="underline hover:text-amber-200 ml-2 text-[11px] uppercase tracking-wider font-extrabold">
          Claim Benefits ➔
        </Link>
      </div>

      {/* ─── Navigation Bar (Clean White Glassmorphism) ───────────── */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 py-1">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="no-underline">
            <BrandLogo size="md" showTagline={true} />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs px-5 shadow-md shadow-emerald-500/20">
              <Link href="/signup">Start FREE Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────────────────────────────── */}
      <section className="pt-16 pb-12 px-6 text-center max-w-4xl mx-auto space-y-6 relative z-10">
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3.5 py-1 text-xs font-bold shadow-sm">
          ⚡ CustomerPilot Pricing & Plans V3.0
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Bring Customers Back. <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
            Automatically.
          </span>
        </h1>
        
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          CustomerPilot doesn't sell software. We deliver <strong className="text-slate-900">Repeat Customers, 5-Star Google Reviews, and Automated Growth</strong> for local retail businesses.
        </p>

        {/* 7-Day Trial Callout */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 shadow-xl shadow-slate-200/50">
          <span>🎁 <strong>7-Day FREE Trial:</strong> ₹0 • No Credit Card • Setup in 5 Mins</span>
          <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">Includes 100 VIP Members</span>
        </div>
      </section>

      {/* ─── Outcome-Based Solution Cards ("Choose the Result You Want") ─── */}
      <section className="py-10 px-6 max-w-7xl mx-auto w-full space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 font-bold">
            Solution-First Architecture
          </Badge>
          <h2 className="text-3xl font-black text-slate-900">Choose the Result You Want</h2>
          <p className="text-xs text-slate-600">Select your primary business objective — all plans include 100% AI capabilities</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {outcomeCards.map((card, idx) => (
            <Card
              key={idx}
              className={`bg-white border flex flex-col justify-between relative transition-all duration-300 shadow-lg ${
                card.popular ? "border-emerald-500 shadow-2xl shadow-emerald-500/15 ring-2 ring-emerald-500/20 scale-105" : "border-slate-200 hover:border-emerald-400/60"
              }`}
            >
              {card.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {card.badge}
                </div>
              )}

              <CardHeader className="p-6 pb-3">
                <div className="text-3xl mb-2">{card.icon}</div>
                <CardTitle className="text-base font-extrabold text-slate-900">{card.title}</CardTitle>
                <div className="text-xs font-bold text-emerald-600 mt-1">{card.subtitle}</div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4 flex-1 text-xs text-slate-600">
                <p className="text-slate-500 leading-relaxed text-[11px]">{card.description}</p>
                <ul className="space-y-2 pt-2 border-t border-slate-100">
                  {card.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 font-medium text-slate-700">
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-6 pt-0 mt-auto">
                <Button
                  asChild
                  className={`w-full font-bold text-xs py-5 ${
                    card.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <Link href="/signup">{card.btnText}</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 100 Founding Merchant Program Section ──────────────────── */}
      <section id="founding" className="py-14 px-6 max-w-6xl mx-auto w-full relative z-10">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 relative overflow-hidden shadow-2xl space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs px-3.5 py-1 font-extrabold">
              🏆 Permanent Exclusive Allocation
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Become One of the First 100 Founding Merchants
            </h2>
            <p className="text-xs text-slate-600">
              Only 100 businesses ever. This launch program will never be repeated.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Platinum */}
            <Card className="bg-slate-900 text-white border-amber-400/40 relative overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-300 to-amber-500" />
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👑</span>
                  <Badge className="bg-amber-400 text-slate-950 font-bold text-[10px]">Merchant #1 - #10</Badge>
                </div>
                <CardTitle className="text-base font-bold text-amber-300 mt-2">Founding Platinum</CardTitle>
                <div className="text-xs text-slate-400">Only 10 Businesses</div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span className="text-slate-300">Remaining Seats:</span>
                  <span className="font-extrabold text-amber-300 text-sm">{foundingCounters.platinum.remaining} / 10 Left</span>
                </div>
                <ul className="space-y-2 text-slate-200">
                  <li className="flex items-center gap-2">✅ <strong className="text-amber-300">2 Years FREE Access</strong></li>
                  <li className="flex items-center gap-2">✅ Customer Limit: <strong>Unlimited</strong> (during free period)</li>
                  <li className="flex items-center gap-2">✅ <strong>Lifetime 50% Discount</strong></li>
                  <li className="flex items-center gap-2">✅ 👑 Platinum Dashboard Founder Badge</li>
                  <li className="flex items-center gap-2">✅ Priority WhatsApp Support & Founder Community</li>
                </ul>
                <Button asChild className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-5">
                  <Link href="/signup?founding=platinum">Claim Platinum Seat</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Gold */}
            <Card className="bg-white border-emerald-500/40 relative overflow-hidden shadow-xl flex flex-col justify-between ring-1 ring-emerald-500/20">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥇</span>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Merchant #11 - #50</Badge>
                </div>
                <CardTitle className="text-base font-bold text-emerald-700 mt-2">Founding Gold</CardTitle>
                <div className="text-xs text-slate-500">Only 40 Businesses</div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-slate-600">Remaining Seats:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">{foundingCounters.gold.remaining} / 40 Left</span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">✅ <strong className="text-emerald-700">1 Year FREE Access</strong></li>
                  <li className="flex items-center gap-2">✅ Customer Limit: <strong>Up to 25,000 VIP Members</strong></li>
                  <li className="flex items-center gap-2">✅ <strong>Lifetime 35% Discount</strong></li>
                  <li className="flex items-center gap-2">✅ 🥇 Gold Dashboard Founder Badge</li>
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs py-5 shadow-md">
                  <Link href="/signup?founding=gold">Claim Gold Seat</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Silver */}
            <Card className="bg-white border-slate-200 relative overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-slate-400 to-slate-600" />
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🥈</span>
                  <Badge variant="outline" className="text-slate-700 border-slate-300 font-bold text-[10px]">Merchant #51 - #100</Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-800 mt-2">Founding Silver</CardTitle>
                <div className="text-xs text-slate-500">Only 50 Businesses</div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600">Remaining Seats:</span>
                  <span className="font-extrabold text-slate-800 text-sm">{foundingCounters.silver.remaining} / 50 Left</span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">✅ <strong className="text-slate-800">6 Months FREE Access</strong></li>
                  <li className="flex items-center gap-2">✅ Customer Limit: <strong>Up to 10,000 VIP Members</strong></li>
                  <li className="flex items-center gap-2">✅ <strong>Lifetime 20% Discount</strong></li>
                  <li className="flex items-center gap-2">✅ 🥈 Silver Dashboard Founder Badge</li>
                </ul>
                <Button asChild variant="outline" className="w-full border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs py-5">
                  <Link href="/signup?founding=silver">Claim Silver Seat</Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* ─── Customer Capacity Regular Growth Plans ─────────────────── */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full space-y-8 relative z-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 font-bold">
            Customer Capacity Pricing
          </Badge>
          <h2 className="text-3xl font-black text-slate-900">Simple VIP Capacity Plans</h2>
          <p className="text-xs text-slate-600">
            Pay strictly based on the size of your VIP Member Database. All plans include 100% of AI features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capacityPlans.map((plan, index) => (
            <Card
              key={index}
              className={`bg-white border flex flex-col justify-between relative transition-all duration-300 shadow-xl ${
                plan.popular ? "border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500/20 scale-105" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  ⭐ Most Popular
                </div>
              )}

              <CardHeader className="p-6 pb-4 border-b border-slate-100">
                <div className="text-xs font-bold text-emerald-600 mb-1">{plan.badge}</div>
                <CardTitle className="text-lg font-bold text-slate-900">{plan.name}</CardTitle>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500 ml-1">/ {plan.period}</span>
                </div>
                <div className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center">
                  🚀 {plan.capacity}
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4 flex-1 text-xs text-slate-600">
                <p className="text-slate-500 leading-relaxed text-[11px]">{plan.description}</p>
                <ul className="space-y-2 pt-1 border-t border-slate-100">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-6 pt-0 mt-auto">
                <Button
                  asChild
                  className={`w-full font-bold text-xs py-5 ${
                    plan.popular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  <Link href={plan.link}>Choose Plan ➔</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Customer Data Ownership Promise & Referral Banner ──────── */}
      <section className="py-8 px-6 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-6 relative z-10">
        
        {/* Ownership Guarantee */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Customer Ownership Promise</h3>
              <p className="text-[11px] text-slate-500">Every customer belongs 100% to YOUR business.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            CustomerPilot NEVER mixes or sells your customer records to competitors. 
            Download full backups in 1-Click anytime via <strong>CSV, Excel, or Database Export</strong>.
          </p>
        </div>

        {/* Referral Program Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-900 text-white border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Merchant Referral Program</h3>
              <p className="text-[11px] text-indigo-300">Invite a fellow shop owner & get rewarded!</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Refer another business to CustomerPilot ➔ <strong className="text-emerald-400">Both of you receive +30 Days Extra Validity</strong> for free! Unlimited referrals allowed.
          </p>
        </div>

      </section>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 CustomerPilot. All Rights Reserved. Empowering Indian Local Merchants with AI Customer Growth.</p>
      </footer>
    </div>
  )
}
