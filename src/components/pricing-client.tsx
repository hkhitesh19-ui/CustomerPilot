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
  const [billingCycle, setBillingCycle] = useState<"1mo" | "6mo" | "1year">("1year")

  const outcomeCards = [
    {
      icon: "❤️",
      title: "WhatsApp Loyalty Rewards",
      subtitle: "Digital Loyalty Stamps & VIP Club",
      badge: "Repeat Visit Engine",
      description: "Perfect for bakeries, cafes, and salons wanting to convert single-time walk-ins into 10x repeat regulars.",
      price1Mo: "₹149",
      period1Mo: "for 1 month",
      price6Mo: "₹649",
      period6Mo: "for 6 months",
      price1Yr: "₹999",
      period1Yr: "for 1 year (₹3/day)",
      savings: "₹3/day (Billed yearly)",
      features: [
        "Digital WhatsApp Stamp Card",
        "VIP Club Engine & Tier Upgrades",
        "Birthday Rewards Engine",
        "14-Day Inactivity Win-Backs",
        "Cashier 1-Tap Counter Queue",
      ],
      btnText: "Start 7 Days Free Trial Today →",
      popular: false,
    },
    {
      icon: "⭐",
      title: "Magic AI Google Reviews",
      subtitle: "AI Draft & WhatsApp Review Flow",
      badge: "Local SEO Growth",
      description: "Automatically collect authentic 4 & 5-star Google reviews right after a customer purchase on WhatsApp.",
      price1Mo: "₹149",
      period1Mo: "for 1 month",
      price6Mo: "₹649",
      period6Mo: "for 6 months",
      price1Yr: "₹999",
      period1Yr: "for 1 year (₹3/day)",
      savings: "₹3/day (Billed yearly)",
      features: [
        "WhatsApp Post-Purchase Prompts",
        "Smart AI 5-Star Review Drafts",
        "1-Click Copy & Post to Google Maps",
        "Review Growth Analytics",
        "Organic Neighborhood SEO Booster",
      ],
      btnText: "Start 7 Days Free Trial Today →",
      popular: false,
    },
    {
      icon: "🤖",
      title: "1-Click AI AutoReply",
      subtitle: "Smart AI Draft & 1-Click Post",
      badge: "Owner Assistant Mode",
      description: "AI automatically drafts appreciative, context-aware owner responses. Store owners review & publish on Google Maps in 1-Click!",
      price1Mo: "₹149",
      period1Mo: "for 1 month",
      price6Mo: "₹649",
      period6Mo: "for 6 months",
      price1Yr: "₹999",
      period1Yr: "for 1 year (₹3/day)",
      savings: "₹3/day (Billed yearly)",
      features: [
        "Google Business Profile Connect",
        "Contextual AI Owner Replies",
        "1-Click Publish to Google Maps",
        "Bulk Reply Engine",
        "Smart Sentiment Adaptation",
      ],
      btnText: "Start 7 Days Free Trial Today →",
      popular: false,
    },
    {
      icon: "🚀",
      title: "CustomerPilot Complete",
      subtitle: "Loyalty + AI Reviews + 1-Click AutoReply",
      badge: "⭐ BEST VALUE BUNDLE",
      description: "All 3 outcome engines combined into one single unified AI customer retention & reputation system.",
      price1Mo: "₹399",
      period1Mo: "for 30 days (Trial)",
      price6Mo: "₹1,799",
      period6Mo: "for 6 months (₹10/day)",
      price1Yr: "₹2,899",
      period1Yr: "for 1 year (₹8/day)",
      savings: "₹8/day (Save ₹1,500+ Yearly)",
      features: [
        "Full WhatsApp Loyalty Stamp Engine",
        "Full AI Draft Google Review Flow",
        "Full 1-Click GoogleReview AutoReply",
        "VIP Customer CRM & Export",
        "Free Counter Standee Custom Poster",
        "Priority WhatsApp Founder Support",
      ],
      btnText: "Start 7 Days Free Trial Today →",
      popular: true,
    },
  ]

  const capacityPlans = [
    {
      name: "Complete Starter Trial",
      capacity: "Up to 500 VIP Customers",
      duration: "30 Days",
      price: "₹399",
      period: "for 30 days",
      badge: "Starter Trial",
      popular: false,
      features: [
        "Up to 500 VIP Customers",
        "All 3 Engines Included",
        "Basic WhatsApp Automation",
        "Counter Standee Printable PDF",
        "Daily Morning Intelligence",
      ],
    },
    {
      name: "Starter Growth Plan",
      capacity: "Up to 500 VIP Customers",
      duration: "6 Months",
      price: "₹1,799",
      period: "for 6 months (₹10/day)",
      badge: "Ideal for Growing Shops",
      popular: false,
      features: [
        "Up to 500 VIP Customers",
        "All 3 Engines Included",
        "Unlimited WhatsApp Stamps",
        "AI Google Review 5-Star Filter",
        "1-Click Google Maps AutoReply",
        "Automated 30/60/90 Day Win-Backs",
        "Printable Counter Standee",
      ],
    },
    {
      name: "Pro Scaling Plan",
      capacity: "Up to 1,500 VIP Customers",
      duration: "1 Year",
      price: "₹2,899",
      period: "per year (₹8/day)",
      badge: "⭐ Most Popular",
      popular: true,
      features: [
        "Up to 1,500 VIP Customers",
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
      name: "High-Volume / Enterprise",
      capacity: "Unlimited VIP Customers",
      duration: "1 Year",
      price: "₹4,999",
      period: "per year (₹14/day)",
      badge: "Busy Outlets & Chains",
      popular: false,
      features: [
        "Unlimited VIP Customers",
        "All 3 Engines Included",
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
            <Link href="/signup">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-xs">
                Start 7 Days Free Trial Today →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16 flex-1 w-full">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 7-Day Free Trial · No Credit Card Required
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
            <p className="text-xs text-slate-500">Deploy only the standalone modules your store requires today, or get the complete bundle.</p>

            {/* Billing Cycle Switcher */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
              <button
                onClick={() => setBillingCycle("1mo")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${billingCycle === "1mo" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                1 Month (₹149)
              </button>
              <button
                onClick={() => setBillingCycle("6mo")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${billingCycle === "6mo" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                6 Months (₹649)
              </button>
              <button
                onClick={() => setBillingCycle("1year")}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${billingCycle === "1year" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"}`}
              >
                <span>1 Year (₹999)</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">₹3/day</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outcomeCards.map((card, idx) => {
              const currentPrice = billingCycle === "1year" ? card.price1Yr : billingCycle === "6mo" ? card.price6Mo : card.price1Mo
              const currentPeriod = billingCycle === "1year" ? card.period1Yr : billingCycle === "6mo" ? card.period6Mo : card.period1Mo

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
                      <div className="text-2xl sm:text-3xl font-black text-slate-900">
                        {currentPrice}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {currentPeriod}
                      </p>
                      {billingCycle === "1year" && card.savings && (
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

                  <Link href="/signup" className="block pt-2">
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
                    <div className="text-3xl sm:text-4xl font-black text-slate-900">{plan.price}</div>
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
                      Start 7 Days Free Trial Today →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-slate-200 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Lock className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">No Credit Card Needed</h4>
            <p className="text-[11px] text-slate-500">7 days full access free</p>
          </div>
          <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <ShieldCheck className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">Cancel Anytime</h4>
            <p className="text-[11px] text-slate-500">Zero lock-in contracts</p>
          </div>
          <div className="space-y-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <RefreshCw className="w-5 h-5 text-amber-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-900">High ROI Guaranteed</h4>
            <p className="text-[11px] text-slate-500">Boosts repeat visits 40%</p>
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
