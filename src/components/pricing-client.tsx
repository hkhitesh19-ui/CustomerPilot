"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Check, Sparkles, Shield, Crown, Zap, Gift, Star, Users, ArrowRight,
  Database, HelpCircle, CheckCircle2, Lock, Award, HeartHandshake, Flame,
  ShieldCheck, RefreshCw, MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrandLogo } from "@/components/brand-logo"

export function PricingClient() {
  const [billingCycle, setBillingCycle] = useState<"6mo" | "1year">("1year")

  const outcomeCards = [
    {
      icon: "🎁",
      title: "Digital Loyalty Stamps & VIP Club",
      subtitle: "WhatsApp VIP Loyalty & Digital Stamp Cards",
      badge: "Repeat Visit Engine",
      description: "Convert single-time walk-ins into repeat regulars with WhatsApp digital stamp cards, VIP club, and automated birthday rewards.",
      price6Mo: "₹549",
      mrp6Mo: "₹1,099",
      period6Mo: "for 6 months (₹3/day)",
      price1Yr: "₹799",
      mrp1Yr: "₹1,599",
      period1Yr: "for 1 year (₹2.2/day)",
      savings: "50% OFF (Save ₹800)",
      features: [
        "Digital WhatsApp Stamp Card",
        "VIP Club Engine & Tier Upgrades",
        "Birthday Rewards Engine",
        "14-Day Inactivity Win-Backs",
        "Cashier 1-Tap Counter Queue",
      ],
      btnText: "Start Free Trial - Digital Loyalty Stamps & VIP Club →",
      module: "loyalty",
      popular: false,
    },
    {
      icon: "⭐",
      title: "Smart Ai (SEO Optimized) Google Reviews",
      subtitle: "upto 1000 Reviews (6Mo) / 2500 Reviews (1Yr)",
      badge: "Local SEO Growth",
      description: "Automatically collect authentic 4 & 5-star Google reviews right after a customer purchase on WhatsApp.",
      price6Mo: "₹549",
      mrp6Mo: "₹1,099",
      period6Mo: "for 6 months (₹3/day)",
      price1Yr: "₹799",
      mrp1Yr: "₹1,599",
      period1Yr: "for 1 year (₹2.2/day)",
      savings: "50% OFF (Save ₹800)",
      features: [
        "WhatsApp Post-Purchase Prompts",
        "Smart AI 5-Star Review Drafts",
        "1-Click Copy & Post to Google Maps",
        "Review Growth Analytics",
        "Organic Neighborhood SEO Booster",
      ],
      btnText: "Start Free Trial - Smart Ai Google Reviews →",
      module: "reviews",
      popular: false,
    },
    {
      icon: "💬",
      title: "Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews",
      subtitle: "Smart AI Context Drafts & 1-Click Publish",
      badge: "Owner Assistant Mode",
      description: "AI automatically drafts appreciative, context-aware owner responses. Store owners review & publish on Google Maps in 1-Click!",
      price6Mo: "₹549",
      mrp6Mo: "₹1,099",
      period6Mo: "for 6 months (₹3/day)",
      price1Yr: "₹799",
      mrp1Yr: "₹1,599",
      period1Yr: "for 1 year (₹2.2/day)",
      savings: "50% OFF (Save ₹800)",
      features: [
        "Google Business Profile Connect",
        "Contextual AI Owner Replies",
        "1-Click Publish to Google Maps",
        "Bulk Reply Engine",
        "Smart Sentiment Adaptation",
      ],
      btnText: "Start Free Trial - 1-Click AutoReply →",
      module: "autoreply",
      popular: false,
    },
    {
      icon: "🚀",
      title: "CustomerPilot Complete",
      subtitle: "Digital Loyalty + Smart AI GoogleReviews + 1-Click AutoReply",
      badge: "⭐ BEST VALUE BUNDLE",
      description: "All 3 outcome engines combined into one single unified AI customer retention & reputation system.",
      price6Mo: "₹1,749",
      mrp6Mo: "₹3,499",
      period6Mo: "for 6 months (₹10/day)",
      price1Yr: "₹2,249",
      mrp1Yr: "₹4,499",
      period1Yr: "for 1 year (₹6.2/day)",
      savings: "50% OFF (Save ₹2,250)",
      features: [
        "Full WhatsApp Loyalty Stamp Engine",
        "Full AI Draft Google Review Flow",
        "Full 1-Click GoogleReview AutoReply",
        "VIP Customer CRM & Export",
        "Free Counter Standee Custom Poster",
        "Priority WhatsApp Founder Support",
      ],
      btnText: "Start CustomerPilot Complete Free Trial →",
      module: "",
      popular: true,
    },
  ]

  const capacityPlans = [
    {
      name: "Starter Growth Plan (CustomerPilot Complete)",
      capacity: "Up to 1,000 VIP Customers",
      duration: "6 Months",
      price: "₹1,749",
      originalPrice: "₹3,499",
      period: "for 6 months (₹10/day)",
      badge: "Complete (6 Mo)",
      popular: false,
      features: [
        "Up to 1,000 VIP Customers",
        "All 3 Engines Included",
        "Unlimited WhatsApp Stamps",
        "AI Google Review 5-Star Filter",
        "1-Click Google Maps AutoReply",
        "Automated 30/60/90 Day Win-Backs",
        "Printable Counter Standee",
      ],
    },
    {
      name: "Pro Scaling Plan (CustomerPilot Complete)",
      capacity: "Up to 2,500 VIP Customers",
      duration: "1 Year",
      price: "₹2,249",
      originalPrice: "₹4,499",
      period: "per year (₹6.2/day)",
      badge: "⭐ Most Popular",
      popular: true,
      features: [
        "Up to 2,500 VIP Customers",
        "All 3 Engines Included",
        "365-Day Unlimited Automation",
        "AI Review Reply Generator",
        "Customizable WhatsApp Templates",
        "VIP Tier Upgrades & Bonus Stamps",
        "Live Queue Cashier Tablet Mode",
        "Priority WhatsApp Helpdesk (+91 90333 04707)",
      ],
    },
    {
      name: "Enterprise / upto 5-Outlets",
      capacity: "Up to 5 Outlets Supported",
      duration: "1 Year",
      price: "₹4,999",
      originalPrice: "₹9,999",
      period: "per year (₹14/day)",
      badge: "upto 5 Outlets",
      popular: false,
      features: [
        "Up to 5 Retail Outlets Supported",
        "Unlimited VIP Customers",
        "Multi-Outlet Store Switcher",
        "Custom Brand Domain & Logo",
        "Dedicated Account Manager",
        "Custom ERP/POS Sync Assistance",
        "Maximum ROI Guarantee",
      ],
    },
  ]




  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Glassmorphic Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/login" className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 transition">
              Sign In
            </Link>
            <Link href="/#comparison">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs">
                Start 3 Days Free Trial Today →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16 flex-1 w-full">
        {/* Limited Time 50% Discount Offer Alert Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-1 shadow-2xl shadow-orange-500/20">
          <div className="rounded-[22px] bg-slate-950 px-6 py-6 sm:py-7 flex flex-col md:flex-row items-center justify-between gap-5 text-white">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4 text-red-400 animate-pulse" /> Limited Time 50% Discount Offer
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Flat 50% OFF on All 6-Month &amp; 1-Year Plans
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Get full automated WhatsApp loyalty, 5★ Google review collection &amp; 1-click replies at half the regular MRP price.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/30">
                  Claim 50% Discount Now →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 3-Day Free Trial · No Credit Card Required
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Transparent, High-ROI Pricing for Growing Merchants
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Choose the outcome engine that fits your store. All plans include 100% WhatsApp-native digital stamp cards, cashier tap-to-claim terminals, and AI Google review automation.
          </p>
        </div>

        {/* Outcome Cards Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Select by Desired Business Outcome</h2>
            <p className="text-xs text-slate-500">Deploy only the standalone modules your store requires today, or get the complete bundle with our 50% discount offer.</p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
              <button
                onClick={() => setBillingCycle("6mo")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${billingCycle === "6mo" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                6 Months (₹549)
              </button>
              <button
                onClick={() => setBillingCycle("1year")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === "1year" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                <span>1 Year (₹799)</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">50% OFF · ₹2.2/day</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outcomeCards.map((card, idx) => {
              const currentPrice = billingCycle === "1year" ? card.price1Yr : card.price6Mo
              const currentMrp = billingCycle === "1year" ? card.mrp1Yr : card.mrp6Mo
              const currentPeriod = billingCycle === "1year" ? card.period1Yr : card.period6Mo

              return (
                <Card key={idx} className={`bg-white border-slate-200 shadow-xs hover:shadow-xl transition-all rounded-3xl flex flex-col justify-between ${card.popular ? "ring-2 ring-emerald-500 shadow-emerald-500/10" : ""}`}>
                  <CardHeader className="space-y-3 p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{card.icon}</span>
                      <Badge variant={card.popular ? "default" : "secondary"} className={`text-[10px] ${card.popular ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                        {card.badge}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg text-slate-900 font-bold leading-snug">{card.title}</CardTitle>
                      <p className="text-[11px] text-slate-400 font-medium">{card.subtitle}</p>
                    </div>

                    {/* Dynamic Pricing Tag */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                          {currentPrice}
                        </span>
                        {currentMrp && (
                          <span className="text-sm font-semibold text-slate-400 line-through">
                            {currentMrp}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {currentPeriod}
                      </p>
                      {card.savings && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          {card.savings}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed pt-1">{card.description}</p>
                  </CardHeader>

                <CardContent className="space-y-4 p-6 pt-0">
                  <ul className="space-y-2 text-xs text-slate-700">
                    {card.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 font-bold" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={card.module ? `/signup?module=${card.module}` : "/signup"} className="block pt-2">
                    <Button className={`w-full text-xs font-bold rounded-xl py-2.5 ${card.popular ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>
                      {card.btnText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )})}
          </div>
        </div>

        {/* Capacity Scaling Plans */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Full-Featured Capacity Plans</h2>
            <p className="text-xs text-slate-500">Scale smoothly from a single corner shop to high-volume multi-location brands.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capacityPlans.map((plan, idx) => (
              <Card key={idx} className={`bg-white border-slate-200 shadow-xs hover:shadow-xl transition-all rounded-3xl p-6 sm:p-8 flex flex-col justify-between ${plan.popular ? "ring-2 ring-emerald-500 shadow-emerald-500/10" : ""}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-lg">{plan.name}</h3>
                    <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-700 bg-slate-50">
                      {plan.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900">{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-base font-semibold text-slate-400 line-through">
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{plan.period} · {plan.capacity}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Plan Highlights:</p>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {plan.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/signup">
                    <Button className={`w-full font-bold text-xs rounded-xl py-3 ${plan.popular ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>
                      Start 3 Days Free Trial Today →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Master 50% Discount Offer Master Pricing Table */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 font-extrabold text-xs">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Limited Time 50% Discount Offer
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Updated 50% Discount Offer Master Pricing Table
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Transparent, locked-in pricing with flat 50% OFF across all standalone services and all-in-one complete bundles.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-xl bg-white">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-900 text-white">
                  <th className="p-4 sm:p-5 text-xs sm:text-sm font-extrabold w-[34%]">Service / Plan Name</th>
                  <th className="p-4 text-center text-xs sm:text-sm font-extrabold w-[14%]">Plan Duration</th>
                  <th className="p-4 text-center text-xs sm:text-sm font-extrabold w-[13%]">Main MRP</th>
                  <th className="p-4 text-center text-xs sm:text-sm font-extrabold text-amber-300 w-[14%]">Final Offer Price</th>
                  <th className="p-4 text-center text-xs sm:text-sm font-extrabold w-[12%]">Discount</th>
                  <th className="p-4 text-center text-xs sm:text-sm font-extrabold w-[13%]">Daily Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">🎁</span>
                    <div>
                      <div>Digital Loyalty Stamps &amp; VIP Club</div>
                      <div className="text-[11px] text-slate-500 font-normal">WhatsApp digital loyalty stamp card &amp; VIP rewards</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold">6 Months</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹1,099</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-base">₹549</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-600">₹3/day</td>
                </tr>

                <tr className="hover:bg-slate-50 transition bg-emerald-50/30">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">🎁</span>
                    <div>
                      <div>Digital Loyalty Stamps &amp; VIP Club</div>
                      <div className="text-[11px] text-slate-500 font-normal">Full year loyalty automation + VIP CRM export</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-bold">1 Year</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹1,599</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-base">₹799</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-700">₹2.2/day</td>
                </tr>

                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <div>
                      <div>Smart Ai (SEO Optimized) Google Reviews [upto 1000 Reviews]</div>
                      <div className="text-[11px] text-slate-500 font-normal">Automated WhatsApp 5★ review collection up to 1,000 reviews</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold">6 Months</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹1,099</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-base">₹549</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-600">₹3/day</td>
                </tr>

                <tr className="hover:bg-slate-50 transition bg-emerald-50/30">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <div>
                      <div>Smart Ai (SEO Optimized) Google Reviews [upto 2500 Reviews]</div>
                      <div className="text-[11px] text-slate-500 font-normal">365-Day automated review prompts &amp; AI drafts up to 2,500 reviews</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-bold">1 Year</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹1,599</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-base">₹799</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-700">₹2.2/day</td>
                </tr>

                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <div>Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews</div>
                      <div className="text-[11px] text-slate-500 font-normal">Context-aware owner replies &amp; 1-Click GBP post</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold">6 Months</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹1,099</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-base">₹549</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-medium text-slate-600">₹3/day</td>
                </tr>

                <tr className="hover:bg-slate-50 transition bg-emerald-50/30">
                  <td className="p-4 sm:p-5 font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <div>Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews</div>
                      <div className="text-[11px] text-slate-500 font-normal">Full year AI reply generator &amp; bulk studio</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-bold">1 Year</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹1,599</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-base">₹799</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-700">₹2.2/day</td>
                </tr>

                <tr className="hover:bg-slate-50 transition bg-indigo-50/30">
                  <td className="p-4 sm:p-5 font-black text-slate-900 flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    <div>
                      <div className="text-indigo-950 font-black">Starter Growth Plan (CustomerPilot Complete)</div>
                      <div className="text-[11px] text-indigo-700 font-normal">All 3 Engines combined for up to 1,000 VIP customers</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-md text-xs font-bold">6 Months</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹3,499</td>
                  <td className="p-4 text-center font-black text-indigo-600 text-base">₹1,749</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-indigo-100 text-indigo-900 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-bold text-indigo-700">₹10/day</td>
                </tr>

                <tr className="hover:bg-amber-50/40 transition bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 border-2 border-amber-300">
                  <td className="p-4 sm:p-5 font-black text-slate-900 flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    <div>
                      <div className="text-slate-950 font-black flex items-center gap-1.5">
                        <span>Pro Scaling Plan (CustomerPilot Complete)</span>
                        <span className="text-[10px] uppercase font-black px-2 py-0.2 rounded-full bg-amber-500 text-white">Most Popular</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-normal">Full 3-in-1 Suite for up to 2,500 VIP customers + Priority Support</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-amber-500 text-white px-2.5 py-1 rounded-md text-xs font-black shadow-xs">1 Year</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-bold text-base">₹4,499</td>
                  <td className="p-4 text-center font-black text-amber-700 text-lg">₹2,249</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-black text-amber-800">₹6.2/day</td>
                </tr>

                <tr className="hover:bg-slate-50 transition">
                  <td className="p-4 sm:p-5 font-black text-slate-900 flex items-center gap-2">
                    <span className="text-xl">🏢</span>
                    <div>
                      <div className="text-slate-900 font-black">Enterprise / upto 5-Outlets</div>
                      <div className="text-[11px] text-slate-500 font-normal">Up to 5 outlets supported, multi-outlet switcher &amp; dedicated manager</div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-medium">
                    <span className="bg-slate-900 text-white px-2.5 py-1 rounded-md text-xs font-bold">1 Year</span>
                  </td>
                  <td className="p-4 text-center text-slate-400 line-through font-semibold">₹9,999</td>
                  <td className="p-4 text-center font-black text-slate-900 text-base">₹4,999</td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-black px-2 py-0.5 rounded-full">50% OFF</span>
                  </td>
                  <td className="p-4 text-center font-bold text-slate-700">₹14/day</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Full Feature Comparison Matrix */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-xs">
              📊 Side-by-Side Plan Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">Compare All 4 Free Trial Options</h2>
            <p className="text-xs sm:text-sm text-slate-600">See why <strong className="text-emerald-700">94% of merchants choose the Complete Suite</strong> to unlock the entire customer retention flywheel.</p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-700/80 shadow-2xl bg-slate-950 text-white">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90">
                  <th className="p-5 text-sm font-extrabold text-slate-200 w-[31%]">Capabilities</th>
                  <th className="p-4 text-center w-[17%] border-l border-slate-800 bg-slate-900/40">
                    <div className="text-xl mb-1">🎁</div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-100">Digital Loyalty Stamps &amp; VIP Club</div>
                    <div className="mt-0.5 flex items-baseline justify-center gap-1">
                      <span className="text-[10px] line-through text-slate-500">₹1,599</span>
                      <span className="text-sm font-black text-amber-400">₹799</span>
                      <span className="text-[9px] text-slate-300">/yr</span>
                    </div>
                    <div className="text-[9px] text-emerald-400 font-bold">50% OFF · ₹2.2/day</div>
                  </th>
                  <th className="p-4 text-center w-[17%] border-l border-slate-800 bg-slate-900/40">
                    <div className="text-xl mb-1">⭐</div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-100">Smart Ai Google Reviews [upto 2500 Reviews]</div>
                    <div className="mt-0.5 flex items-baseline justify-center gap-1">
                      <span className="text-[10px] line-through text-slate-500">₹1,599</span>
                      <span className="text-sm font-black text-emerald-400">₹799</span>
                      <span className="text-[9px] text-slate-300">/yr</span>
                    </div>
                    <div className="text-[9px] text-emerald-400 font-bold">50% OFF · ₹2.2/day</div>
                  </th>
                  <th className="p-4 text-center w-[17%] border-l border-slate-800 bg-slate-900/40">
                    <div className="text-xl mb-1">💬</div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-100">Ai Drafted 1-Click AutoReply</div>
                    <div className="mt-0.5 flex items-baseline justify-center gap-1">
                      <span className="text-[10px] line-through text-slate-500">₹1,599</span>
                      <span className="text-sm font-black text-indigo-400">₹799</span>
                      <span className="text-[9px] text-slate-300">/yr</span>
                    </div>
                    <div className="text-[9px] text-emerald-400 font-bold">50% OFF · ₹2.2/day</div>
                  </th>
                  <th className="p-4 text-center w-[18%] border-l-2 border-emerald-500 bg-gradient-to-b from-emerald-950/90 to-slate-900 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                      🔥 94% CHOOSE THIS
                    </div>
                    <div className="text-2xl mb-1 mt-1">🚀</div>
                    <div className="font-black text-sm text-white">CustomerPilot Complete</div>
                    <div className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider mt-0.5">Digital Loyalty + Smart AI GoogleReviews + 1-Click AutoReply</div>
                    <div className="mt-0.5 flex items-baseline justify-center gap-1">
                      <span className="text-[10px] line-through text-slate-500">₹4,499</span>
                      <span className="text-base font-black text-emerald-400">₹2,249</span>
                      <span className="text-[9px] text-slate-300">/yr</span>
                    </div>
                    <div className="text-[9px] text-emerald-300 font-bold">50% OFF · ₹6.2/day</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                <tr className="bg-amber-950/20 font-bold">
                  <td colSpan={5} className="py-2.5 px-5 text-[10px] uppercase tracking-wider text-amber-300 bg-amber-900/30 font-black">
                    🎁 1. Digital Loyalty Stamps &amp; VIP Club
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">Digital WhatsApp Stamp Card (No App for Customer)</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">VIP Club Tier System (Silver / Gold / Platinum)</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">Birthday Treats &amp; Milestone Bonus Automations</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">14 &amp; 30-Day Inactive Customer Win-Back Campaigns</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>

                <tr className="bg-emerald-950/20 font-bold">
                  <td colSpan={5} className="py-2.5 px-5 text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-900/30 font-black">
                    ⭐ 2. Ai Drafted SEO Optimized Google Reviews - Increase GoogleReviews Very Fast
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">Instant AI Customer Review Draft Assistant</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">Post-Purchase WhatsApp 5★ Review Prompts</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">5-Star Golden Review QR Standees &amp; Table Tents</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>

                <tr className="bg-indigo-950/20 font-bold">
                  <td colSpan={5} className="py-2.5 px-5 text-[10px] uppercase tracking-wider text-indigo-300 bg-indigo-900/30 font-black">
                    💬 3. Ai Drafted SEO Optimized 1-Click Reply to Google Reviews
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">Google Business Profile Connect &amp; Auto-Sync</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">AI Context-Aware Owner Reply Drafts in 1s</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">1-Click Direct Publish to Google Maps</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-[11px]">✓</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/30 font-bold text-emerald-400">✓ Unlocked</td>
                </tr>

                {/* Exclusive Synergies */}
                <tr className="bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-slate-900 font-bold">
                  <td colSpan={5} className="py-2.5 px-5 text-[10px] uppercase tracking-wider text-emerald-300 bg-emerald-900/50 font-black flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>🚀 4. CustomerPilot Complete : Digital Loyalty + Smart AI GoogleReviews + 1-Click AutoReply</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-bold text-emerald-300">
                    <div>AI Review-to-Loyalty Multiplier</div>
                    <div className="text-[9px] text-slate-400 font-normal">Review post karne par customer ko automatic +2 Bonus Stamps</div>
                  </td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/40 font-bold">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">👑 Exclusive</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-bold text-emerald-300">
                    <div>Unified 360° Customer SuperCRM</div>
                    <div className="text-[9px] text-slate-400 font-normal">Visits, spend, stamps &amp; Google review status in 1 single view</div>
                  </td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/40 font-bold">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">👑 Exclusive</span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 pl-5 font-semibold text-slate-200">Print-Ready Store Marketing Kit</td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-[9px] text-slate-400">1 Standee</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-[9px] text-slate-400">1 Standee</span></td>
                  <td className="p-3.5 text-center border-l border-slate-800"><span className="text-slate-600 font-bold">✕</span></td>
                  <td className="p-3.5 text-center border-l-2 border-emerald-500 bg-emerald-950/40 font-bold text-emerald-300">✓ All Standees</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-900/90">
                  <td className="p-4 font-bold text-slate-200 text-xs">Start 3-Day Free Trial:</td>
                  <td className="p-3 text-center border-l border-slate-800">
                    <Link href="/signup?module=loyalty" className="inline-flex w-full py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-[11px] items-center justify-center transition">
                      Trial Loyalty Stamps →
                    </Link>
                  </td>
                  <td className="p-3 text-center border-l border-slate-800">
                    <Link href="/signup?module=reviews" className="inline-flex w-full py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] items-center justify-center transition">
                      Trial AI Reviews →
                    </Link>
                  </td>
                  <td className="p-3 text-center border-l border-slate-800">
                    <Link href="/signup?module=autoreply" className="inline-flex w-full py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold text-[11px] items-center justify-center transition">
                      Trial AutoReply →
                    </Link>
                  </td>
                  <td className="p-3 text-center border-l-2 border-emerald-500 bg-gradient-to-b from-emerald-950/80 to-slate-950">
                    <Link href="/signup" className="inline-flex w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs items-center justify-center shadow-lg shadow-emerald-500/20 transition">
                      Start CustomerPilot Complete →
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-slate-200 pt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center max-w-2xl mx-auto">
          <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Lock className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">No Credit Card Needed</h4>
            <p className="text-[11px] text-slate-500">3 days full access free</p>
          </div>
          <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Users className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">24/7 WhatsApp Helpdesk</h4>
            <p className="text-[11px] text-slate-500">+91 90333 04707</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-900 transition">Security</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
