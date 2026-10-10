"use client"

import React from "react"
import {
  PhoneCall, Star, Gift, MessageSquare, Award as Trophy,
  RefreshCw, QrCode, ShieldCheck, Database, Zap, MapPin, HeartHandshake
} from "lucide-react"

export const FEATURE_GRID_ITEMS = [
  {
    title: "1-Tap Phonebook Sync (.vcf)",
    desc: "Customers save your business phone, WhatsApp, location and brand in their mobile contacts with zero typing.",
    icon: PhoneCall,
    color: "bg-indigo-600",
    tag: "Digital Card"
  },
  {
    title: "Smart AI Google Review Modal",
    desc: "Post-purchase QR triggers 3 AI-crafted psychological review drafts. 1-Click copy to live Google Maps.",
    icon: Star,
    color: "bg-amber-500",
    tag: "Reviews Engine"
  },
  {
    title: "WhatsApp Digital Stamp Cards",
    desc: "Zero app download needed. Digital stamp card with cashier counter check-in to boost customer return rates.",
    icon: Gift,
    color: "bg-purple-600",
    tag: "Loyalty Engine"
  },
  {
    title: "1-Click AI AutoReply to Google Maps",
    desc: "Official Google Business Profile sync. Context-aware AI responses published live to Google Maps instantly.",
    icon: MessageSquare,
    color: "bg-blue-600",
    tag: "Google Sync"
  },
  {
    title: "Automated Birthday & VIP Rewards",
    desc: "Surprise loyal customers on birthdays & anniversaries with automated WhatsApp wishes and reward coupons.",
    icon: Trophy,
    color: "bg-rose-500",
    tag: "Automation"
  },
  {
    title: "30 / 60 / 90-Day Win-Back Alerts",
    desc: "Automatically detect churned customers and send personalized WhatsApp incentives before they switch.",
    icon: RefreshCw,
    color: "bg-emerald-600",
    tag: "Retention"
  },
  {
    title: "Counter QR Code Display",
    desc: "High-resolution printable vector counter display templates (PNG/SVG/PDF) for billing desks & tabletops.",
    icon: QrCode,
    color: "bg-sky-600",
    tag: "Hardware-Free"
  },
  {
    title: "Anti-AI Detection Filter",
    desc: "Natural human local reviews with 10-category SEO entities. Clean authentic tone trusted by Google algorithms.",
    icon: ShieldCheck,
    color: "bg-teal-600",
    tag: "Local SEO"
  },
  {
    title: "VIP Customer CRM & CSV Export",
    desc: "Full visibility of customer visit counts, lifetime spend, stamp progress, and one-click database export.",
    icon: Database,
    color: "bg-violet-600",
    tag: "Customer CRM"
  },
  {
    title: "Live Cashier Counter Queue",
    desc: "Lightning fast phone number search or QR scan. Cashiers award stamps in less than 3 seconds per shopper.",
    icon: Zap,
    color: "bg-orange-500",
    tag: "Speed POS"
  },
  {
    title: "Turn-by-Turn Google Navigation",
    desc: "Direct navigation deep-link brings local customers straight from WhatsApp or card to your retail doorstep.",
    icon: MapPin,
    color: "bg-cyan-600",
    tag: "Footfall"
  },
  {
    title: "Priority WhatsApp VIP Support",
    desc: "Direct concierge line (+91 90333 04707) with dedicated onboarding support for smooth store rollout.",
    icon: HeartHandshake,
    color: "bg-pink-600",
    tag: "Support"
  }
]

export function BusinessGrowthFeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 border border-cyan-200/60 px-3.5 py-1 rounded-full mb-3">
            Complete Feature Set
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            How CustomerPilot Helps You Grow Your Business
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl mx-auto leading-relaxed">
            Every feature engineered to turn one-time shoppers into repeat loyal regulars and 5-star Google promoters.
          </p>
        </div>

        {/* 12 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {FEATURE_GRID_ITEMS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Vibrant Square Icon Container */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${item.color}`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
