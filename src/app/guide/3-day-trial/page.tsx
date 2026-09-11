'use client'

import React, { useState } from "react"
import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import {
  Sparkles,
  QrCode,
  Gift,
  Star,
  CheckCircle2,
  ArrowRight,
  Clock,
  ShieldCheck,
  Smartphone,
  Store,
  Users,
  Check,
  Layers,
  Settings,
  Sliders,
  MessageSquare,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Receipt,
  Repeat,
  Hourglass
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Lang = "en" | "hi"

// --- MULTI-LANGUAGE CONTENT ---
const I18N = {
  en: {
    langBtn: "हिंग्लिश (Hinglish)",
    topBanner: "5-Minute Complete Setup Guide • Fast-Track Onboarding & Customization Blueprint",
    navHome: "Home",
    navOperations: "Daily Operations Manual",
    navSettings: "Live Settings",
    navChecklist: "Checklist",
    heroBadge: "⚡ 5-MINUTE COMPLETE SETUP BLUEPRINT",
    heroH1Part1: "🛠️ Complete Setup:",
    heroH1Part2: "5-Minute Restaurant/Shop Setup",
    heroSubtitle:
      "A step-by-step visual infographic guide to complete your merchant registration, tailor default loyalty rules & rewards to your business, link WhatsApp Web, configure Google Review time-delay, and go live.",
    btnOperationsCardTitle: "Want to see how it works on the counter AFTER setup?",
    btnOperationsCardSub:
      "Explore the Live Counter Operations Manual — step-by-step cashier and customer journeys with real-time counter simulation.",
    btnOperationsAction: "Open Operations Manual →",
    stat1Val: "5 Minutes",
    stat1Label: "Total Setup Time",
    stat2Val: "100% Free",
    stat2Label: "3-Day Full Access Trial",
    stat3Val: "Zero Tech Skills",
    stat3Label: "Works on Any Mobile Phone",
    stat4Val: "Free Standee",
    stat4Label: "Printable Desk QR Included",
    tabAll: "All Setup Steps",
    tabSignup: "Step 1: 1-Min Signup",
    tabRules: "Step 2: Rules, Rewards & Review Delay",
    tabWhatsapp: "Step 3: Connect WhatsApp",
    tabTemplates: "Step 4: WhatsApp Templates",
    tabOther: "Step 5: Pro Marketing Tools",
    industryLabel: "Select Your Business Type to See Recommended Rules:",
    customRuleHeading: "Default vs Recommended Custom Rules",
    customRuleTipLabel: "💡 Industry Optimization Tip:",
    step1Title: "Merchant Registration & Store Identity",
    step1Sub: "Step 1 • 60 Seconds",
    step2Title: "Default vs Custom Loyalty Rules, Rewards & Review Delay",
    step2Sub: "Step 2 • 90 Seconds",
    step3Title: "Connect WhatsApp (Linked Devices QR)",
    step3Sub: "Step 3 • 60 Seconds",
    step4Title: "Customize 5 WhatsApp Message Templates",
    step4Sub: "Step 4 • 60 Seconds",
    step5Title: "Pro Features, Counter Standee & Launch",
    step5Sub: "Step 5 • 30 Seconds",
    checklistTitle: "5-Minute Complete Setup Checklist",
    checklistBadge: "Go-Live Checklist",
    ctaTitle: "Ready to Setup Your Store Now?",
    ctaSub: "Jump straight to your merchant dashboard to set up live rules, rewards, and message templates.",
    ctaBtnSettings: "Open Complete Settings →",
    ctaBtnQueue: "Test Live Queue Desk",
    ctaBtnCatalog: "Reward Catalog",
  },
  hi: {
    langBtn: "English",
    topBanner: "5 Minute Complete Setup Guide • 5 Min Me Signup, Rules & Rewards Ka Setup",
    navHome: "Home",
    navOperations: "Daily Operations Manual",
    navSettings: "Live Settings",
    navChecklist: "Checklist",
    heroBadge: "⚡ 5 MINUTE COMPLETE SETUP GUIDE",
    heroH1Part1: "🛠️ Complete Setup:",
    heroH1Part2: "5 Min Me Restaurant/Shop Ka Setup",
    heroSubtitle:
      "Naye Restaurant/Shop ke liye 5 minute me complete signup, business ke hisaab se default rules & rewards modify karna, WhatsApp connect karna, Google Review time delay set karna aur counter QR lagane ka complete step-by-step guide.",
    btnOperationsCardTitle: "Setup hone ke baad Restaurant/Shop par kaise kaam karega?",
    btnOperationsCardSub:
      "Dekhiye Live Counter Operations Manual — Cashier aur Grahak ka complete step-by-step routine aur interactive simulation.",
    btnOperationsAction: "Operations Manual Kholein →",
    stat1Val: "5 Minutes",
    stat1Label: "Pura Setup Time",
    stat2Val: "100% Free",
    stat2Label: "3-Day Full Trial Access",
    stat3Val: "Zero Tech Skills",
    stat3Label: "Kisi Bhi Mobile Par Chalta Hai",
    stat4Val: "Free Standee",
    stat4Label: "Printable Counter QR PDF",
    tabAll: "Sabhi Steps",
    tabSignup: "Step 1: 1-Min Signup",
    tabRules: "Step 2: Rules, Rewards & Review Delay",
    tabWhatsapp: "Step 3: WhatsApp Connect",
    tabTemplates: "Step 4: WhatsApp Templates",
    tabOther: "Step 5: Pro Features",
    industryLabel: "Apne Business Ka Type Chunein (Tailored Rules Dekhne Ke Liye):",
    customRuleHeading: "Default Rules vs Aapke Business Ke Hisaab Se Custom Rules",
    customRuleTipLabel: "💡 Industry Profit Tip:",
    step1Title: "Merchant Registration & Store Profile",
    step1Sub: "Step 1 • 60 Seconds",
    step2Title: "Rules, Rewards & Google Review Delay Setup",
    step2Sub: "Step 2 • 90 Seconds",
    step3Title: "WhatsApp Web Connect Karna (QR Scan)",
    step3Sub: "Step 3 • 60 Seconds",
    step4Title: "WhatsApp Message Templates Customize Karna",
    step4Sub: "Step 4 • 60 Seconds",
    step5Title: "Counter QR Standee & Pro Marketing Setup",
    step5Sub: "Step 5 • 30 Seconds",
    checklistTitle: "5-Minute Complete Setup Checklist",
    checklistBadge: "Go-Live Checklist",
    ctaTitle: "Ready to Setup Your Store Now?",
    ctaSub: "Seedha merchant dashboard me jaakar rules, rewards, Google review delay aur WhatsApp templates ko live modify karein.",
    ctaBtnSettings: "Settings Dashboard Kholein →",
    ctaBtnQueue: "Live Queue Desk Test Karein",
    ctaBtnCatalog: "Reward Catalog",
  },
}

export default function FiveMinuteCompleteSetupGuidePage() {
  const [lang, setLang] = useState<Lang>("hi") // Default to Hinglish for local merchants
  const [activeSetupTab, setActiveSetupTab] = useState<"all" | "signup" | "rules" | "whatsapp" | "templates" | "other">("all")
  const [selectedIndustry, setSelectedIndustry] = useState<"bakery" | "cafe" | "salon" | "restaurant" | "retail">("bakery")
  const [activeTemplateTab, setActiveTemplateTab] = useState<"stamp" | "welcome" | "review" | "reward" | "winback">("stamp")

  // Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    profile: true,
    rules: false,
    reviewDelay: false,
    whatsapp: false,
    templates: false,
    standee: false,
    testScan: false,
  })

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalTasks = Object.keys(checklist).length
  const progressPercent = Math.round((completedCount / totalTasks) * 100)

  // Industry Defaults vs Custom Tips
  const industryData = {
    bakery: {
      name: "Bakery & Cake Shop 🥐",
      defaultStamps: 10,
      minPurchase: "₹200",
      defaultReward: "Free Belgian Chocolate Pastry (Value: ₹150)",
      recommendedReviewDelay: "20 Minutes",
      reviewDelayReason: "Customer cake ya pastry ghar le jakar ya counter par khakar turant enjoy karta hai, isliye 20-30 minute ka delay sabse best rehta hai.",
      customTip:
        "Bake shops ke liye 8-10 stamps ideal hain. High-margin items jaise pastry ya brownie ko reward rakhein taaki aapka real food cost sirf ₹30-40 ho lekin customer ko ₹150 ka value dikhe!",
      bonusStamp: "1 Bonus Stamp on 1st Scan",
      validity: "90 Days",
    },
    cafe: {
      name: "Cafe & Coffee Bar ☕",
      defaultStamps: 8,
      minPurchase: "₹150",
      defaultReward: "Free Signature Cappuccino / Cold Coffee",
      recommendedReviewDelay: "30 Minutes",
      reviewDelayReason: "Customer coffee drink finish karne ke dauran relaxed mood me hota hai, 30 minute baad WhatsApp prompt maximum 5★ conversion deta hai.",
      customTip:
        "Coffee drinks me margin 75%+ hota hai. 8 stamps ka target rakhein jisse customer hafte me 2-3 baar aaye aur jaldi reward unlock ho sake.",
      bonusStamp: "1 Instant Welcome Stamp",
      validity: "60 Days",
    },
    salon: {
      name: "Salon & Spa / Grooming 💇",
      defaultStamps: 6,
      minPurchase: "₹500",
      defaultReward: "Free Hair Spa Treatment / Beard Styling",
      recommendedReviewDelay: "2 Hours",
      reviewDelayReason: "Grooming session ke 2 ghante baad jab customer look settle ho jata hai aur log compliment dete hain, tab review mangne par sabse positive 5★ feedback milta hai.",
      customTip:
        "Salons me visit frequency mahine me 1-2 baar hoti hai, isliye yahan 6 stamps ka target rakhein (zyada stamps rakhenge toh customer demotivate ho sakta hai).",
      bonusStamp: "1 Welcome Stamp on Grooming",
      validity: "180 Days",
    },
    restaurant: {
      name: "Dine-in Restaurant & QSR 🍽️",
      defaultStamps: 10,
      minPurchase: "₹350",
      defaultReward: "Free Starter / Sizzling Brownie with Ice Cream",
      recommendedReviewDelay: "1 Hour",
      reviewDelayReason: "Customer meal complete karke ghar ya office pahunchta hai, 1-2 ghante baad fresh meal memory ke sath AI review link tap karna sabse convenient lagta hai.",
      customTip:
        "Table dining ke liye ₹350 ya ₹500 ka minimum bill threshold zaroor set karein. Isse average order value (AOV) naturally 20-30% badhti hai!",
      bonusStamp: "1 Family Visit Stamp",
      validity: "120 Days",
    },
    retail: {
      name: "Retail & Apparel Store 🛍️",
      defaultStamps: 10,
      minPurchase: "₹500",
      defaultReward: "₹250 Flat Store Shopping Voucher",
      recommendedReviewDelay: "3 Hours",
      reviewDelayReason: "Shopping ke baad ghar pahunchkar clothes/items unbox karne ke baad customer relaxed hota hai.",
      customTip:
        "Retail me flat rupee voucher (e.g. ₹250 off on next purchase) sabse zyada convert hota hai kyunki customer dubara aakar shopping karta hai.",
      bonusStamp: "1 Shopping Bonus Stamp",
      validity: "90 Days",
    },
  }

  const currentInd = industryData[selectedIndustry]
  const t = I18N[lang]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span>{t.topBanner}</span>
        <Link href="/guide/operations" className="underline hover:text-emerald-200 ml-2 font-black">
          {t.btnOperationsAction}
        </Link>
      </div>

      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              {t.navHome}
            </Link>
            <Link href="/guide/operations" className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5">
              <Repeat className="w-4 h-4" />
              <span>{t.navOperations}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
            <Link href="/dashboard/settings" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>{t.navSettings}</span>
            </Link>
            <Link href="#checklist" className="text-slate-700 hover:text-slate-900">
              {t.navChecklist}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLang(lang === "en" ? "hi" : "en")}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.langBtn}</span>
              </button>
            </div>

            <Link href="/dashboard/settings">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 shadow-sm hover:shadow-md transition-all">
                Open Settings
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6 shadow-2xs">
            {t.heroBadge}
          </Badge>

          {/* User Requested: BIGGER FONT SIZE FOR 🛠️ COMPLETE SETUP */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
            {t.heroH1Part1}{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              {t.heroH1Part2}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Prominent Callout Link Card to Operations Manual */}
          <div className="mt-8 max-w-2xl mx-auto bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 text-left shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  NEW PAGE LINK 🚀
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {t.btnOperationsCardTitle}
                </h3>
                <p className="text-xs text-slate-600">
                  {t.btnOperationsCardSub}
                </p>
              </div>
              <Link href="/guide/operations" className="shrink-0 w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20">
                  {t.btnOperationsAction}
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Clock className="w-5 h-5 text-amber-500 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat1Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat1Label}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat2Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat2Label}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Smartphone className="w-5 h-5 text-indigo-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat3Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat3Label}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <QrCode className="w-5 h-5 text-purple-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">{t.stat4Val}</div>
              <div className="text-[11px] text-slate-500 font-medium">{t.stat4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Setup Steps Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 pb-20">

        {/* Navigation Filter Tabs for Setup */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl max-w-3xl mx-auto shadow-inner">
          {[
            { key: "all", label: t.tabAll, icon: Layers },
            { key: "signup", label: t.tabSignup, icon: Store },
            { key: "rules", label: t.tabRules, icon: Gift },
            { key: "whatsapp", label: t.tabWhatsapp, icon: Smartphone },
            { key: "templates", label: t.tabTemplates, icon: MessageSquare },
            { key: "other", label: t.tabOther, icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeSetupTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSetupTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ===================== STEP 1: QUICK SIGNUP & BUSINESS PROFILE ===================== */}
        {(activeSetupTab === "all" || activeSetupTab === "signup") && (
          <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
                  1
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">{t.step1Sub}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.step1Title}</h3>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                No Credit Card Needed 🔒
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-black text-emerald-700">A. Basic Registration</div>
                <h4 className="font-bold text-slate-900 text-sm">Restaurant/Shop Name &amp; Owner Phone</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apna Restaurant/Shop name (e.g. <em>Cake Connection</em>), mobile number aur password daal kar 30 second me account activate karein.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-black text-emerald-700">B. Business Category</div>
                <h4 className="font-bold text-slate-900 text-sm">Industry Preset Select Karein</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bakery, Cafe, Salon, Restaurant ya Retail choose karein. System automatically us industry ke proven rules &amp; rewards set kar dega.
                </p>
              </div>

              {/* USER REQUESTED CHANGE FOR GOOGLE BUSINESS PROFILE EMAIL LOGIN */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                  <span>C. Google Business Profile Login</span>
                  <span className="bg-emerald-200/80 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded font-bold">Recommended</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Same Gmail Se 1-Click Connect</h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Aapne Google Business Profile jis Email Se banaya he us same Email se login karna he, CustomerPilot aapke Google review shortlink ko automatically integrate kar lega.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500 font-medium">📍 Live in Dashboard: Settings ➔ Business Profile</span>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm" className="text-xs font-bold border-slate-300 hover:bg-slate-50">
                  Open Profile Settings <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ===================== STEP 2: RULES, REWARDS & GOOGLE REVIEW DELAY ===================== */}
        {(activeSetupTab === "all" || activeSetupTab === "rules") && (
          <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                  2
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700">{t.step2Sub}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.step2Title}</h3>
                </div>
              </div>
              <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 text-xs px-3 py-1 font-bold">
                Fully Customizable ⚙️
              </Badge>
            </div>

            {/* Industry Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                {t.industryLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "bakery", label: "Bakery / Cakes", emoji: "🥐" },
                  { id: "cafe", label: "Cafe / Coffee", emoji: "☕" },
                  { id: "salon", label: "Salon / Spa", emoji: "💇" },
                  { id: "restaurant", label: "Restaurant / QSR", emoji: "🍽️" },
                  { id: "retail", label: "Retail / Apparel", emoji: "🛍️" },
                ].map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      selectedIndustry === ind.id
                        ? "bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-xs scale-[1.02]"
                        : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl">{ind.emoji}</span>
                    <span className="text-xs">{ind.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default vs Custom Rules Card */}
            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-700">{t.customRuleHeading}</span>
                <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                  {currentInd.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-500 font-medium block mb-1">Target Stamps to Unlock Reward</span>
                  <div className="text-lg font-black text-slate-900">{currentInd.defaultStamps} Stamps</div>
                  <span className="text-[11px] text-slate-400">Settings me 5 se 15 ke beech edit kar sakte hain</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-500 font-medium block mb-1">Minimum Bill Threshold</span>
                  <div className="text-lg font-black text-emerald-700">{currentInd.minPurchase}</div>
                  <span className="text-[11px] text-slate-400">Is amount se kam ke bill par stamp issue nahi hoga</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-slate-500 font-medium block mb-1">Default Reward Gift Item</span>
                  <div className="text-xs font-black text-indigo-700 line-clamp-1">{currentInd.defaultReward}</div>
                  <span className="text-[11px] text-slate-400">Aap kisi bhi custom menu item ko reward bana sakte hain</span>
                </div>
              </div>

              {/* USER REQUESTED ADDITION: GOOGLE REVIEW LINK TIME-DELAY CUSTOMIZATION */}
              <div className="bg-white rounded-2xl border-2 border-indigo-200 p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      Google Review WhatsApp Link Time-Delay Setting (Very Important) ⏱️
                    </span>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800 text-[11px] font-mono font-bold">
                    Recommended Delay: {currentInd.recommendedReviewDelay}
                  </Badge>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Jab customer counter par bill pay karke Restaurant/Shop se jaye, tab us customer ke WhatsApp par <strong>kitne time delay ke baad</strong> Google Review ki link jaye — ye Merchant apne business ke nature ke hisaab se <strong>Dashboard ➔ Settings ➔ Rules &amp; Automation</strong> me freely customize kar sakta hai!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-0.5">🥐 Bakery / Cafe / QSR:</strong>
                    <span className="text-slate-600 font-medium">15 - 30 Minutes delay</span> (customer pastry/beverage enjoy karte hi 5★ review deta hai).
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-0.5">🍽️ Dine-in Restaurant:</strong>
                    <span className="text-slate-600 font-medium">1 - 2 Hours delay</span> (jab dining complete ho chuki ho aur customer ghar/office pahunch chuka ho).
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="text-slate-900 block mb-0.5">💇 Salon / Spa / Retail:</strong>
                    <span className="text-slate-600 font-medium">2 - 4 Hours delay</span> (jab customer service ke results aur compliments notice karta hai).
                  </div>
                </div>

                <p className="text-[11px] text-indigo-700 italic">
                  💡 <strong>Kyu zaroori hai:</strong> Turant counter par review mangne se customer irritate ho sakta hai, lekin 20-60 min delay ke baad WhatsApp prompt aane par genuine 5★ reviews ka conversion 4X badh jata hai!
                </p>
              </div>

              {/* Expert Optimization Tip */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                <Flame className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>{t.customRuleTipLabel}</strong> {currentInd.customTip}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500 font-medium">📍 Live in Dashboard: Settings ➔ Rules &amp; Automation</span>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm" className="text-xs font-bold border-slate-300 hover:bg-slate-50">
                  Modify Rules &amp; Review Delay in Settings <Sliders className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ===================== STEP 3: WHATSAPP WEB CONNECTION ===================== */}
        {(activeSetupTab === "all" || activeSetupTab === "whatsapp") && (
          <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
                  3
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">{t.step3Sub}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.step3Title}</h3>
                </div>
              </div>
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                Zero WhatsApp API Cost 🟢
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  3.1 Open Settings
                </span>
                <h4 className="font-bold text-slate-900 text-sm">WhatsApp Connection Tab Kholein</h4>
                <p className="text-slate-600 leading-relaxed">
                  Merchant dashboard me Settings ➔ WhatsApp Connect tab me jaayein aur &quot;Generate Connection QR&quot; click karein.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  3.2 Scan Linked Devices
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Restaurant/Shop Phone Se QR Scan Karein</h4>
                <p className="text-slate-600 leading-relaxed">
                  Apne Restaurant/Shop ke phone me WhatsApp kholiye ➔ 3 dots ➔ <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong> par tap karke screen ka QR scan karein.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  3.3 Live Green Indicator
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Instant Ready &amp; Self-Test</h4>
                <p className="text-slate-600 leading-relaxed">
                  Scan hote hi screen par 🟢 <strong>Connected</strong> indicator aa jayega. Test message button click karke apne number par verification ping karein.
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-emerald-900">
                <strong>Anti-Ban Smart Human Pacing:</strong> CustomerPilot har message me randomized human intervals (4-8s) aur variable emojis use karta hai jisse aapka WhatsApp number 100% safe rehta hai.
              </div>
              <Link href="/dashboard/settings">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Connect WhatsApp Now →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ===================== STEP 4: WHATSAPP MESSAGE TEMPLATES ===================== */}
        {(activeSetupTab === "all" || activeSetupTab === "templates") && (
          <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-500/20">
                  4
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700">{t.step4Sub}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.step4Title}</h3>
                </div>
              </div>
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs px-3 py-1 font-bold">
                Hindi • English • Hinglish ✍️
              </Badge>
            </div>

            {/* Template Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "stamp", label: "1. Stamp Credited Receipt" },
                { id: "welcome", label: "2. VIP Welcome Card" },
                { id: "review", label: "3. 5★ Google Review Prompt" },
                { id: "reward", label: "4. Golden Reward Voucher" },
                { id: "winback", label: "5. 30-Day Win-Back Offer" },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setActiveTemplateTab(tpl.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTemplateTab === tpl.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Template Preview Box */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Smartphone className="w-3.5 h-3.5" /> WhatsApp Message Live Preview
                </span>
                <span className="text-slate-500">Variables like &#123;customer_name&#125; auto-replaced</span>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl text-slate-100 leading-relaxed whitespace-pre-line border border-slate-800/80">
                {activeTemplateTab === "stamp" && (
                  `🎉 ₹{bill_amount} Bill Confirmed! 1 Stamp Added.

Total: {current_stamps}/{target_stamps} Stamps collected 🥐
{stamps_left} more visits to unlock: {reward_name}!

👉 View Your Live VIP Card: {wallet_url}
- {store_name}, {store_city}`
                )}
                {activeTemplateTab === "welcome" && (
                  `Welcome to {store_name} VIP Club, {customer_name}! 🥐

Aapka digital loyalty card ready hai!
🎁 Welcome Perk: 1 Free Welcome Stamp Added.

👉 Track your rewards here: {wallet_url}`
                )}
                {activeTemplateTab === "review" && (
                  `{store_name} me aapka experience kaisa raha, {customer_name}? 🌟

AI ne aapke liye ek shandar review draft kiya hai:
"{ai_generated_review_draft}"

👉 1-Click me Google Maps par post karein: {google_review_url}`
                )}
                {activeTemplateTab === "reward" && (
                  `👑 CONGRATULATIONS {customer_name}!

Aapne {target_stamps} Stamps poore kar liye hain!
🎁 Voucher: {reward_name}
Voucher Code: #{voucher_code}

Show this message at counter on your next visit to redeem.`
                )}
                {activeTemplateTab === "winback" && (
                  `We miss you at {store_name}, {customer_name}! ❤️

Aapko dekhe 30 din ho gaye hain.
Agli visit par payein: Free Extra Treat with Your Bill!

👉 Click here to check your voucher: {wallet_url}`
                )}
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Aap har word, emoji, ya language ko Dashboard ➔ Settings ➔ Message Templates me jaakar edit kar sakte hain.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500 font-medium">📍 Live in Dashboard: Settings ➔ Message Templates</span>
              <Link href="/dashboard/settings">
                <Button variant="outline" size="sm" className="text-xs font-bold border-slate-300 hover:bg-slate-50">
                  Edit Templates in Settings <MessageSquare className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ===================== STEP 5: PRO FEATURES & MARKETING ===================== */}
        {(activeSetupTab === "all" || activeSetupTab === "other") && (
          <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20">
                  5
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-700">{t.step5Sub}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t.step5Title}</h3>
                </div>
              </div>
              <Badge className="bg-purple-50 text-purple-800 border-purple-200 text-xs px-3 py-1 font-bold">
                Growth Acceleration 🚀
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <QrCode className="w-5 h-5 text-indigo-600 mb-1" />
                <h4 className="font-bold text-slate-900 text-sm">Download Counter Standee QR</h4>
                <p className="text-slate-600 leading-relaxed">
                  Dashboard se high-resolution printable PDF download karein. Acrylic stand me daalkar UPI payment scanner ke bagal me rakh dein.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <Gift className="w-5 h-5 text-emerald-600 mb-1" />
                <h4 className="font-bold text-slate-900 text-sm">Birthday &amp; Anniversary Treats</h4>
                <p className="text-slate-600 leading-relaxed">
                  System customers se unka birthday month collect karta hai aur special day par customized celebratory discount voucher send karta hai.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <Users className="w-5 h-5 text-purple-600 mb-1" />
                <h4 className="font-bold text-slate-900 text-sm">WhatsApp Referral Loop</h4>
                <p className="text-slate-600 leading-relaxed">
                  Customers apne doston ko WhatsApp link bhejte hain. Friend ki first visit par friend ko bonus stamp aur original customer ko reward milta hai.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================== SETUP CHECKLIST ===================== */}
        <div id="checklist" className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">{t.checklistBadge}</span>
              <h3 className="text-xl font-black text-slate-900">{t.checklistTitle}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{completedCount} of {totalTasks} Completed</span>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono">
                {progressPercent}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { id: "profile", title: "1. Restaurant/Shop Profile & Google Business Connect", time: "1 Min", desc: "Select category & login with same Google Business Profile email" },
              { id: "rules", title: "2. Rules & Rewards Tailored", time: "1 Min", desc: "Stamps target, min bill & high-margin free item" },
              { id: "reviewDelay", title: "3. Google Review Link Time-Delay Set", time: "30 Sec", desc: "Configure delay (e.g. 15-30 min for cafe/bakery, 1-2h for dining)" },
              { id: "whatsapp", title: "4. WhatsApp Web Connected", time: "1 Min", desc: "Scan QR code via Linked Devices in store phone" },
              { id: "templates", title: "5. Message Templates Reviewed", time: "1 Min", desc: "Customize text, language and emojis in settings" },
              { id: "standee", title: "6. Counter Standee QR Printed", time: "1 Min", desc: "Download PDF and place on acrylic stand at counter" },
              { id: "testScan", title: "7. Self Test Scan Completed", time: "1 Min", desc: "Scan counter QR with your phone and approve in /queue" },
            ].map((task) => {
              const isChecked = checklist[task.id]
              return (
                <div
                  key={task.id}
                  onClick={() => toggleCheck(task.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? "bg-emerald-50/70 border-emerald-200 text-slate-900"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs mt-0.5 shrink-0 transition-colors ${
                    isChecked ? "bg-emerald-600 text-white" : "border border-slate-300 bg-white"
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold ${isChecked ? "line-through text-slate-500" : "text-slate-900"}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {task.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{task.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Jump to Operations Manual Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="bg-white/20 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full">
              NEXT STEP IN JOURNEY ➔
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Daily Counter Operations Manual
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Understand the complete day-to-day routine: 3-second cashier bill approval, customer WhatsApp receipts, automated 5★ Google reviews, and reward redemptions.
            </p>
          </div>
          <Link href="/guide/operations" className="shrink-0 w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-6 py-5 rounded-xl shadow-lg">
              Open Operations Manual →
            </Button>
          </Link>
        </div>

      </section>

      {/* Direct Actions & Dashboard Jump */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-slate-900 text-white py-14 px-6 text-center rounded-3xl shadow-xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 font-bold">
              Quick Navigation
            </Badge>

            {/* USER REQUESTED: Ready to Setup Your Store Now? */}
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {t.ctaTitle}
            </h2>

            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              {t.ctaSub}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link href="/dashboard/settings">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm px-7 py-5 rounded-xl shadow-lg shadow-indigo-500/20">
                  {t.ctaBtnSettings}
                </Button>
              </Link>
              <Link href="/dashboard/queue">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  {t.ctaBtnQueue}
                </Button>
              </Link>
              <Link href="/dashboard/rewards">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  {t.ctaBtnCatalog}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms &amp; Privacy</Link>
            <Link href="/guide/3-day-trial" className="text-indigo-600 font-bold hover:underline">5-Minute Setup Guide</Link>
            <Link href="/guide/operations" className="text-emerald-700 font-bold hover:underline">Operations Manual</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
