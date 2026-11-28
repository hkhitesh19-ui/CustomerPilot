"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bot,
  Check,
  Compass,
  CreditCard,
  Globe,
  Gift,
  MessageSquare,
  QrCode,
  Receipt,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

type ServiceCategory = "all" | "reviews_gbp" | "loyalty_wa" | "pos_qr_web"

interface ServiceCardItem {
  num: string
  category: Exclude<ServiceCategory, "all">
  categoryLabel: string
  name: string
  tagline: string
  icon: React.ComponentType<{ className?: string }>
  accentClass: string
  badgeBgClass: string
  pricePrimary: string
  pricePrimaryLabel: string
  priceSecondary?: string
  priceNote?: string
  highlights: string[]
  ctaLabel: string
  ctaHref: string
}

const ALL_12_SERVICES: ServiceCardItem[] = [
  {
    num: "01",
    category: "loyalty_wa",
    categoryLabel: "Identity & QR",
    name: "Smart Digital Business Card",
    tagline: "Contactless NFC & QR visiting card with 1-tap .vcf save and catalog links.",
    icon: CreditCard,
    accentClass: "text-indigo-600 bg-indigo-50 border-indigo-200",
    badgeBgClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    pricePrimary: "₹549",
    pricePrimaryLabel: "/ 1 Year",
    priceSecondary: "₹349 (6 Months) · ₹1,499 Lifetime",
    priceNote: "From ₹1.50/day on 1-Year plan",
    highlights: [
      "1-Tap phonebook (.vcf) contact save",
      "Direct WhatsApp & Google Maps links",
      "Printable counter QR standee ready",
    ],
    ctaLabel: "Start 3-Day Free Trial",
    ctaHref: "/signup",
  },
  {
    num: "02",
    category: "reviews_gbp",
    categoryLabel: "Reviews & Maps",
    name: "Smart AI Google Review System",
    tagline: "Policy-safe counter QR flow with AI-assisted customer review prompts.",
    icon: Star,
    accentClass: "text-amber-600 bg-amber-50 border-amber-200",
    badgeBgClass: "bg-amber-50 text-amber-700 border-amber-200",
    pricePrimary: "₹999",
    pricePrimaryLabel: "/ 1 Year",
    priceSecondary: "₹649 (6 Months, up to 1,000 reviews)",
    priceNote: "Up to 2,500 reviews/year · ₹2.74/day",
    highlights: [
      "Zero-typing AI draft helper for guests",
      "Same public Google Maps link for all",
      "Instant counter QR & WhatsApp share",
    ],
    ctaLabel: "Start 3-Day Free Trial",
    ctaHref: "/signup",
  },
  {
    num: "03",
    category: "reviews_gbp",
    categoryLabel: "Reviews & Maps",
    name: "AutoReply to GoogleReview",
    tagline: "AI-drafted owner responses published to Google Maps via official Google OAuth.",
    icon: MessageSquare,
    accentClass: "text-blue-600 bg-blue-50 border-blue-200",
    badgeBgClass: "bg-blue-50 text-blue-700 border-blue-200",
    pricePrimary: "₹999",
    pricePrimaryLabel: "/ 1 Year",
    priceSecondary: "₹549 (6M DB) / ₹649 (6M Standard)",
    priceNote: "₹2.74/day billed yearly",
    highlights: [
      "Tailored SEO-aware reply drafts",
      "Official Google Business Profile OAuth",
      "1-Click approve & publish workflow",
    ],
    ctaLabel: "Start 3-Day Free Trial",
    ctaHref: "/signup",
  },
  {
    num: "04",
    category: "loyalty_wa",
    categoryLabel: "Loyalty & CRM",
    name: "WhatsApp Digital Loyalty VIP Club",
    tagline: "App-free WhatsApp stamp cards, milestone rewards, and repeat-visit triggers.",
    icon: Gift,
    accentClass: "text-purple-600 bg-purple-50 border-purple-200",
    badgeBgClass: "bg-purple-50 text-purple-700 border-purple-200",
    pricePrimary: "₹1,999",
    pricePrimaryLabel: "/ 1 Year",
    priceSecondary: "₹899 (6M DB) / ₹1,199 (6M Standard)",
    priceNote: "Zero app download for customers",
    highlights: [
      "Live WhatsApp stamp progress cards",
      "Automated milestone & reward alerts",
      "Customer visit CRM & tier tracking",
    ],
    ctaLabel: "Start 3-Day Free Trial",
    ctaHref: "/signup",
  },
  {
    num: "05",
    category: "pos_qr_web",
    categoryLabel: "QR Infrastructure",
    name: "Dynamic QR Studio",
    tagline: "Self-hosted permanent dynamic QR codes with instant destination updates.",
    icon: QrCode,
    accentClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
    badgeBgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pricePrimary: "₹699",
    pricePrimaryLabel: "/ 1 Year",
    priceSecondary: "₹100 / month · ₹499 (6M UI)",
    priceNote: "Zero third-party QR API fees",
    highlights: [
      "Change target URL anytime without reprinting",
      "Real-time scan analytics & device logs",
      "Custom branded QR standee exports",
    ],
    ctaLabel: "Activate Dynamic QR",
    ctaHref: "/signup",
  },
  {
    num: "06",
    category: "loyalty_wa",
    categoryLabel: "Lead Capture",
    name: "WhatsApp Group Booster & Lead Capture",
    tagline: "Pre-redirect customer registration capturing Name + WhatsApp before group join.",
    icon: Users,
    accentClass: "text-teal-600 bg-teal-50 border-teal-200",
    badgeBgClass: "bg-teal-50 text-teal-700 border-teal-200",
    pricePrimary: "₹2,499",
    pricePrimaryLabel: "/ 1 Year",
    priceSecondary: "₹299 / month · ₹1,499 (6M UI)",
    priceNote: "Verified opt-in lead database",
    highlights: [
      "Captures Name + WhatsApp before redirect",
      "Auto-syncs leads into Merchant CRM",
      "Works with WhatsApp Groups & Channels",
    ],
    ctaLabel: "Start Lead Capture",
    ctaHref: "/signup",
  },
  {
    num: "07",
    category: "pos_qr_web",
    categoryLabel: "Billing & POS",
    name: "Smart POS Billing & WA Invoicing Pro",
    tagline: "Mobile POS billing with auto GST, thermal print & instant WhatsApp PDF bills.",
    icon: Receipt,
    accentClass: "text-sky-600 bg-sky-50 border-sky-200",
    badgeBgClass: "bg-sky-50 text-sky-700 border-sky-200",
    pricePrimary: "₹4,999",
    pricePrimaryLabel: "/ 1 Year",
    priceSecondary: "₹599 / month · ₹2,999 (6M UI)",
    priceNote: "No heavy POS hardware needed",
    highlights: [
      "Auto CGST / SGST / IGST calculation",
      "1-Click thermal print + WhatsApp PDF",
      "Customer search & instant bill resend",
    ],
    ctaLabel: "Open Smart POS",
    ctaHref: "/signup",
  },
  {
    num: "08",
    category: "loyalty_wa",
    categoryLabel: "AI Automation",
    name: "24/7 AI WhatsApp ChatBot",
    tagline: "Multilingual AI assistant answering inquiries & qualifying leads around the clock.",
    icon: Bot,
    accentClass: "text-rose-600 bg-rose-50 border-rose-200",
    badgeBgClass: "bg-rose-50 text-rose-700 border-rose-200",
    pricePrimary: "₹999",
    pricePrimaryLabel: "/ Month",
    priceSecondary: "₹9,999 / Year (Gear 5 All-in-One)",
    priceNote: "Included in Gear 5 Enterprise suite",
    highlights: [
      "24/7 instant replies on WhatsApp",
      "Store FAQ & catalog knowledge base",
      "Automatic lead capture & handoff",
    ],
    ctaLabel: "Explore Gear 5 Suite",
    ctaHref: "/signup",
  },
  {
    num: "09",
    category: "reviews_gbp",
    categoryLabel: "GBP RankPilot AI™",
    name: "GBP Launchpad — Track A",
    tagline: "Complete Google Business Profile setup, sandbox monitoring & monthly report.",
    icon: Compass,
    accentClass: "text-cyan-600 bg-cyan-50 border-cyan-200",
    badgeBgClass: "bg-cyan-50 text-cyan-700 border-cyan-200",
    pricePrimary: "₹1,999",
    pricePrimaryLabel: "/ Month",
    priceSecondary: "+ ₹5,999 One-Time Setup",
    priceNote: "For new & unoptimized local stores",
    highlights: [
      "GBP category, service & entity setup",
      "WhatsApp review engine & monitoring",
      "Monthly 4-metric performance report",
    ],
    ctaLabel: "Book Track A Audit",
    ctaHref: "/rankpilot",
  },
  {
    num: "10",
    category: "reviews_gbp",
    categoryLabel: "GBP RankPilot AI™",
    name: "GBP Rank Accelerator — Track B",
    tagline: "High-intensity local SEO execution, geo-grid tracking & weekly GBP posts.",
    icon: TrendingUp,
    accentClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badgeBgClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    pricePrimary: "₹1,999",
    pricePrimaryLabel: "/ Month",
    priceSecondary: "+ ₹27,000 Setup & Execution",
    priceNote: "For competitive city-wide growth",
    highlights: [
      "Local geo-grid & daily SERP tracking",
      "Weekly AI GBP posts & checklist ops",
      "Keyword matrix & competitor gap audit",
    ],
    ctaLabel: "Book Track B Audit",
    ctaHref: "/rankpilot",
  },
  {
    num: "11",
    category: "pos_qr_web",
    categoryLabel: "Web & Commerce",
    name: "Conversion Website (Sales Machine)",
    tagline: "Fast mini-website, dynamic catalog, or e-commerce store built for local leads.",
    icon: Globe,
    accentClass: "text-violet-600 bg-violet-50 border-violet-200",
    badgeBgClass: "bg-violet-50 text-violet-700 border-violet-200",
    pricePrimary: "Custom",
    pricePrimaryLabel: "Quote",
    priceSecondary: "Mini Site · Dynamic · E-Commerce",
    priceNote: "Scoped by pages & store catalog size",
    highlights: [
      "1-Tap WhatsApp order & call triggers",
      "Mobile-first speed & local SEO schema",
      "Custom domain + CRM lead sync",
    ],
    ctaLabel: "Request Website Quote",
    ctaHref: "/contact",
  },
  {
    num: "12",
    category: "pos_qr_web",
    categoryLabel: "Digital Catalog",
    name: "Online Digital Menu (Live Catalog)",
    tagline: "Interactive QR mobile menu with photos, filters & 1-tap WhatsApp cart.",
    icon: Store,
    accentClass: "text-orange-600 bg-orange-50 border-orange-200",
    badgeBgClass: "bg-orange-50 text-orange-700 border-orange-200",
    pricePrimary: "Included",
    pricePrimaryLabel: "in Bundles",
    priceSecondary: "Bundled with Card / Loyalty / Smart POS",
    priceNote: "Zero app download for diners & shoppers",
    highlights: [
      "Category tabs & Veg / Eggless tags",
      "Live price & stock toggle anytime",
      "1-Tap itemized WhatsApp order cart",
    ],
    ctaLabel: "Launch Digital Menu",
    ctaHref: "/signup",
  },
]

const FILTER_TABS: { id: ServiceCategory; label: string }[] = [
  { id: "all", label: "All 12 Services" },
  { id: "reviews_gbp", label: "Reviews & GBP (4)" },
  { id: "loyalty_wa", label: "Loyalty & WhatsApp (4)" },
  { id: "pos_qr_web", label: "POS, QR & Web (4)" },
]

export function AllServicesPricingCards() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("all")

  const visibleServices =
    activeCategory === "all"
      ? ALL_12_SERVICES
      : ALL_12_SERVICES.filter((s) => s.category === activeCategory)

  return (
    <section id="all-12-services" className="space-y-8 pt-6">
      <div className="text-center max-w-3xl mx-auto space-y-2.5">
        <Badge
          variant="outline"
          className="text-xs font-bold border-indigo-200 bg-indigo-50/70 text-indigo-700 px-3 py-1"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
          Complete 12-Service India Pricing Directory
        </Badge>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
          All 12 CustomerPilot Services at a Glance
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Transparent standalone INR pricing across every growth, loyalty, billing, and local SEO engine. Pick any single module or bundle them in Gear 1–5 above.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = activeCategory === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 12-Service Professional Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleServices.map((service) => {
          const Icon = service.icon
          return (
            <div
              key={service.num}
              className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200"
            >
              <div>
                {/* Top Row: Number + Icon + Category Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${service.accentClass}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-400 tracking-wider">
                      #{service.num}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${service.badgeBgClass}`}
                  >
                    {service.categoryLabel}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h3 className="mt-4 text-lg font-extrabold text-slate-900 leading-snug">
                  {service.name}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed min-h-[34px]">
                  {service.tagline}
                </p>

                {/* Pricing Box */}
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">
                      {service.pricePrimary}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {service.pricePrimaryLabel}
                    </span>
                  </div>
                  {service.priceSecondary && (
                    <div className="mt-1 text-xs font-semibold text-slate-700">
                      {service.priceSecondary}
                    </div>
                  )}
                  {service.priceNote && (
                    <div className="mt-1 text-[11px] font-medium text-slate-500">
                      {service.priceNote}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <ul className="mt-4 space-y-2">
                  {service.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                    >
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={service.ctaHref}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{service.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
