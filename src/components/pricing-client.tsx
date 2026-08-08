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

export function PricingClient() {
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
      features: [
        "500 active VIP members limit",
        "Unlimited WhatsApp stamps",
        "Counter QR standee printable",
        "Standard WhatsApp templates",
        "Basic morning report",
      ],
    },
    {
      name: "Pro Scaling Plan",
      capacity: "Up to 2,000 VIP Members",
      duration: "1 Year",
      price: "₹2,499",
      period: "per year",
      badge: "⚡ Best Value for Retail",
      popular: true,
      features: [
        "2,000 active VIP members limit",
        "Customizable WhatsApp templates",
        "Gemini AI review reply generator",
        "Live queue cashier tablet mode",
        "Priority WhatsApp support",
      ],
    },
    {
      name: "High-Volume / Enterprise",
      capacity: "Unlimited VIP Members",
      duration: "Multi-Year / Lifetime",
      price: "₹4,999",
      period: "per year",
      badge: "Busy Outlets & Chains",
      popular: false,
      features: [
        "Unlimited VIP customer capacity",
        "Multi-outlet store switcher",
        "Custom brand domain & logo",
        "Dedicated account manager",
        "Custom ERP/POS sync assistance",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/" className="no-underline">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                Start FREE Trial
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> 14-Day Free Trial · No Credit Card Required
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Transparent, High-ROI Pricing for Growing Merchants
          </h1>
          <p className="text-slate-400 text-base md:text-lg">
            Choose the outcome engine that fits your store. All plans include 100% WhatsApp-native digital stamp cards, cashier tap-to-claim terminals, and AI Google review automation.
          </p>
        </div>

        {/* Founding Merchant Seats Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">Founding Merchant Program</span>
            </div>
            <p className="text-white font-bold text-lg">Only {totalSeatsLeft} Lifetime Discount Seats Remaining</p>
            <p className="text-xs text-slate-400">Lock in 20% to 50% lifetime subscription discounts before public launch.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signup?founding=platinum">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
                Claim Platinum Seat (7 Left)
              </Button>
            </Link>
          </div>
        </div>

        {/* Outcome Cards Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Select by Desired Business Outcome</h2>
            <p className="text-xs text-slate-400">Deploy only the modules your store requires today.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outcomeCards.map((card, idx) => (
              <Card key={idx} className={`bg-slate-900 border-slate-800 flex flex-col justify-between ${card.popular ? "ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10" : ""}`}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{card.icon}</span>
                    <Badge variant={card.popular ? "default" : "secondary"} className="text-[10px]">
                      {card.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg text-white font-bold">{card.title}</CardTitle>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {card.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{feat.replace("✔ ", "")}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/signup" className="block pt-2">
                    <Button className={`w-full text-xs font-bold ${card.popular ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-800 hover:bg-slate-700 text-white"}`}>
                      {card.btnText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Capacity Scaling Plans */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">Full-Featured Capacity Plans</h2>
            <p className="text-xs text-slate-400">Scale smoothly from a single corner shop to high-volume multi-location brands.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capacityPlans.map((plan, idx) => (
              <Card key={idx} className={`bg-slate-900 border-slate-800 p-6 flex flex-col justify-between ${plan.popular ? "ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10" : ""}`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                      {plan.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">{plan.price}</div>
                    <p className="text-xs text-slate-400">{plan.period} · {plan.capacity}</p>
                  </div>

                  <div className="border-t border-slate-800 pt-4 space-y-2">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Plan Highlights:</p>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {plan.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/signup">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                      Start 14-Day Trial
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-slate-800 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <Lock className="w-5 h-5 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">No Credit Card Needed</h4>
            <p className="text-[11px] text-slate-400">14 days full access free</p>
          </div>
          <div className="space-y-1">
            <ShieldCheck className="w-5 h-5 text-blue-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Cancel Anytime</h4>
            <p className="text-[11px] text-slate-400">Zero lock-in contracts</p>
          </div>
          <div className="space-y-1">
            <RefreshCw className="w-5 h-5 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">High ROI Guaranteed</h4>
            <p className="text-[11px] text-slate-400">Boosts repeat visits 40%</p>
          </div>
          <div className="space-y-1">
            <Users className="w-5 h-5 text-purple-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">24/7 WhatsApp Helpdesk</h4>
            <p className="text-[11px] text-slate-400">Dedicated merchant onboarding</p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/security" className="hover:text-slate-300">Security</Link>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
