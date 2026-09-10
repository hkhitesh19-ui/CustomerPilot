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
  TrendingUp,
  Smartphone,
  Store,
  Users,
  Check,
  Layers,
  Settings,
  Sliders,
  MessageSquare,
  Pencil,
  Copy,
  ChevronRight,
  ExternalLink,
  Flame,
  Award,
  Globe,
  BellRing
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MerchantSetupGuidePage() {
  const [activeTab, setActiveTab] = useState<"all" | "signup" | "rules" | "whatsapp" | "templates" | "other">("all")
  const [selectedIndustry, setSelectedIndustry] = useState<"bakery" | "cafe" | "salon" | "restaurant" | "retail">("bakery")
  const [activeTemplateTab, setActiveTemplateTab] = useState<"stamp" | "welcome" | "review" | "reward" | "winback">("stamp")
  const [templateLanguage, setTemplateLanguage] = useState<"hinglish" | "english">("hinglish")

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    profile: true,
    rules: false,
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

  const industryData = {
    bakery: {
      name: "Bakery & Cake Shop 🥐",
      defaultStamps: 10,
      minPurchase: "₹200",
      defaultReward: "Free Belgian Chocolate Pastry (Value: ₹150)",
      customTip: "Bake shops ke liye 8-10 stamps ideal hain. High-margin items jaise pastry ya donut ko reward rakhein taaki aapka real food cost sirf ₹30-40 ho lekin customer ko ₹150 ka value dikhe!",
      bonusStamp: "1 Bonus Stamp on 1st Scan",
      validity: "90 Days"
    },
    cafe: {
      name: "Cafe & Coffee Bar ☕",
      defaultStamps: 8,
      minPurchase: "₹150",
      defaultReward: "Free Signature Cappuccino / Cold Coffee",
      customTip: "Coffee drinks me margin 75%+ hota hai. 8 stamps ka target rakhein jisse customer hafte me 2-3 baar aaye aur jaldi reward unlock ho sake.",
      bonusStamp: "1 Instant Welcome Stamp",
      validity: "60 Days"
    },
    salon: {
      name: "Salon & Spa / Grooming 💇",
      defaultStamps: 6,
      minPurchase: "₹500",
      defaultReward: "Free Hair Spa Treatment / Beard Styling",
      customTip: "Salons me visit frequency mahine me 1-2 baar hoti hai, isliye yahan 6 stamps ka target rakhein (zyada stamps rakhenge toh customer demotivate ho jayega).",
      bonusStamp: "1 Welcome Stamp on Grooming",
      validity: "180 Days"
    },
    restaurant: {
      name: "Dine-in Restaurant & QSR 🍽️",
      defaultStamps: 10,
      minPurchase: "₹350",
      defaultReward: "Free Starter / Sizzling Brownie with Ice Cream",
      customTip: "Table dining ke liye ₹350 ya ₹500 ka minimum bill threshold zaroor set karein. Isse average order value (AOV) naturally 20-30% badhti hai!",
      bonusStamp: "1 Family Visit Stamp",
      validity: "120 Days"
    },
    retail: {
      name: "Retail & Apparel Store 🛍️",
      defaultStamps: 10,
      minPurchase: "₹500",
      defaultReward: "₹250 Flat Store Shopping Voucher",
      customTip: "Retail me flat rupee voucher (e.g. ₹200 off on next purchase) sabse zyada convert hota hai kyunki customer dubara aakar shopping karta hai.",
      bonusStamp: "1 Shopping Bonus Stamp",
      validity: "90 Days"
    },
  }

  const currentInd = industryData[selectedIndustry]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white text-xs py-2 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span>Complete Merchant Master Guide • 5-Minute Setup &amp; Customization Blueprint</span>
        <Link href="/dashboard/settings" className="underline hover:text-emerald-200 ml-2 font-black">
          Open Settings Dashboard →
        </Link>
      </div>

      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo variant="dark" size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/dashboard/settings" className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span>Live Settings</span>
            </Link>
            <Link href="#checklist" className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span>Setup Checklist</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button className="bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-4 shadow-lg shadow-indigo-500/20">
                Configure My Store
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            🛠️ Merchant Setup &amp; Customization Manual
          </Badge>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            5-Minute Complete <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Rules, Rewards &amp; WhatsApp</span> Setup
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            CustomerPilot me <strong>Default Rules &amp; Rewards</strong> pehle se set aate hain. Is guide me dekhiye ki kaise 5 minute me apne store ke hisaab se <strong>stamps, reward items, WhatsApp message templates aur Google review automations</strong> ko modify kiya jata hai.
          </p>

          {/* Quick Metrics Badges */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">5 Mins Total</div>
              <div className="text-[11px] text-slate-400">Complete Activation</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <Sliders className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">Default vs Custom</div>
              <div className="text-[11px] text-slate-400">Rules &amp; Reward Engine</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <MessageSquare className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">Editable Templates</div>
              <div className="text-[11px] text-slate-400">6 WhatsApp Automations</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <ShieldCheck className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">Zero POS Risk</div>
              <div className="text-[11px] text-slate-400">Standalone Counter QR</div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Filter Tabs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-3xl mx-auto shadow-inner">
          {[
            { key: "all", label: "Full Blueprint (All Steps)", icon: Layers },
            { key: "signup", label: "Step 1: 1-Min Signup", icon: Store },
            { key: "rules", label: "Step 2: Rules & Rewards", icon: Gift },
            { key: "whatsapp", label: "Step 3: Connect WhatsApp", icon: Smartphone },
            { key: "templates", label: "Step 4: WhatsApp Templates", icon: MessageSquare },
            { key: "other", label: "Step 5: Pro Features", icon: Settings },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Detailed Guide Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-16 pb-24">

        {/* ===================== STEP 1: QUICK SIGNUP & BUSINESS PROFILE ===================== */}
        {(activeTab === "all" || activeTab === "signup") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/30">
                  1
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Step 1 • 60 Seconds</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Merchant Registration &amp; Store Identity</h2>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 font-bold">
                No Credit Card Needed 🔒
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4 text-xs text-slate-300 leading-relaxed">
                <p className="text-sm text-white font-semibold">
                  Aapko sirf basic 4 cheezein enter karni hoti hain:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      A
                    </div>
                    <div>
                      <strong className="text-white text-xs">Business Name &amp; Owner Name:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">E.g., <em>Cake Connection, Vadodara</em> (Ye naam customer ke WhatsApp messages aur counter standee par print hota hai).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      B
                    </div>
                    <div>
                      <strong className="text-white text-xs">Business Category (Very Important!):</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Bakery, Cafe, Salon, Restaurant, ya Retail select karein. System aapke business ke hisaab se <strong>optimal default loyalty rules &amp; AI prompt auto-tune</strong> kar deta hai.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                      C
                    </div>
                    <div>
                      <strong className="text-white text-xs">Store WhatsApp Phone Number:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Jis phone se aap customers ko official loyalty points aur automated WhatsApp receipts bhejna chahte hain.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link href="/signup">
                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2">
                      Start Signup (Takes 1 Min) →
                    </Button>
                  </Link>
                  <span className="text-[11px] text-slate-500">Already registered? Check Step 2</span>
                </div>
              </div>

              {/* Visual Mockup */}
              <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Store Profile Preview</span>
                  </span>
                  <Badge className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">Auto Configured</Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Business Name:</span>
                    <span className="text-white font-bold">Cake Connection</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="text-amber-400 font-bold">Bakery &amp; Cake Shop 🥐</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-200">Vadodara, Gujarat</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">System Ready:</span>
                    <span className="text-emerald-400 font-bold">✅ Smart Defaults Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 2: RULES & REWARDS DEEP DIVE ===================== */}
        {(activeTab === "all" || activeTab === "rules") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
                  2
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Core Engine • Default vs Custom</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Rules &amp; Reward Setup: Apne Business ke Hisaab se Modify Karein</h2>
                </div>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/20">
                  Edit in Settings →
                </Button>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              CustomerPilot me har store category ke liye <strong>smart default rules pre-loaded</strong> hote hain. Lekin aap apne menu, ticket size aur margins ke mutabiq inhein 1-click me customize kar sakte hain.
            </p>

            {/* Industry Selector Tabs */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                Apna Business Type Select Karke Defaults &amp; Recommendations Dekhein:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "bakery", label: "🥐 Bakery" },
                  { id: "cafe", label: "☕ Cafe" },
                  { id: "salon", label: "💇 Salon" },
                  { id: "restaurant", label: "🍽️ Restaurant" },
                  { id: "retail", label: "🛍️ Retail" },
                ].map(ind => (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                      selectedIndustry === ind.id
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Industry Card */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{currentInd.name}</span>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Smart Industry Template
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Location: Dashboard ➔ Settings ➔ Rewards</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Stamps Required</div>
                  <div className="text-xl font-black text-amber-400 mt-1">{currentInd.defaultStamps} Visits / Stamps</div>
                  <div className="text-[10px] text-slate-500 mt-1">Can change from 4 to 15 in settings</div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Minimum Bill Per Stamp</div>
                  <div className="text-xl font-black text-emerald-400 mt-1">{currentInd.minPurchase}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Prevents low-bill stamp abuse</div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Stamp Card Validity</div>
                  <div className="text-xl font-black text-indigo-400 mt-1">{currentInd.validity}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Creates urgency to revisit</div>
                </div>
              </div>

              <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 rounded-xl border border-amber-500/30">
                <div className="text-xs font-bold text-amber-300">🎁 Recommended Reward Item:</div>
                <div className="text-sm font-black text-white mt-0.5">{currentInd.defaultReward}</div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  💡 <strong>Expert Strategy:</strong> {currentInd.customTip}
                </p>
              </div>
            </div>

            {/* 5 Parameters you should customize */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>What Parameters Can You Customize in Settings?</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="font-bold text-emerald-400 text-sm">1. Stamp Target (Visits)</div>
                  <p className="text-slate-400 mt-1">
                    Slider se 4 se 15 stamps ke beech set karein. Quick conversion ke liye <strong>8 to 10 stamps</strong> sabse zyada popular hai.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="font-bold text-indigo-400 text-sm">2. Minimum Bill Amount</div>
                  <p className="text-slate-400 mt-1">
                    E.g. Min ₹200. Agar customer ₹50 ka chhota item khareedega toh stamp nahi milega — isse ticket size increase hota hai!
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="font-bold text-amber-400 text-sm">3. Specific Reward Name &amp; Description</div>
                  <p className="text-slate-400 mt-1">
                    Generic &quot;Free Gift&quot; mat likhein. Apne store ka best seller item likhein: &quot;Free Dutch Truffle Pastry (₹150)&quot; ya &quot;Free Haircut&quot;.
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="font-bold text-purple-400 text-sm">4. Surprise Tier Progressions</div>
                  <p className="text-slate-400 mt-1">
                    Jab customer 1st card complete karta hai, system use automatically <strong>Silver / Gold VIP</strong> me upgrade karta hai aur 2 bonus advance stamps gift karta hai!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 3: CONNECT WHATSAPP ===================== */}
        {(activeTab === "all" || activeTab === "whatsapp") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/30">
                  3
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">WhatsApp Engine • 60-Second Scan</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Connect Store Phone WhatsApp: Zero API Setup</h2>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 font-bold">
                100% Brand Phone Number 📱
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4 text-xs text-slate-300">
                <p className="text-sm text-white font-semibold">
                  Aapko kisi Meta Developer account ya complex API approvals ki zaroorat nahi hai:
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-white text-xs">Settings ➔ WhatsApp Verification Par Jaayein:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Screen par live QR code appear hoga.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-white text-xs">Linked Devices se Scan Karein:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">Apne store phone par WhatsApp open karein ➔ Menu / Settings ➔ <strong>Linked Devices</strong> ➔ Link a Device ➔ Screen par dikh raha QR scan karein.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-white text-xs">Instant Cloud Instance Active:</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">5 seconds ke andar green badge aayega: <strong>&quot;Connected as +91 XXXXX XXXXX&quot;</strong>. Ab saare customer messages aapke store number se jayenge!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Card */}
              <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-2xl text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                  📱
                </div>
                <div className="text-sm font-bold text-white">Dedicated Cloud Instance</div>
                <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                  Status: Connected &amp; Webhook Synced
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Har store ka instance completely isolated aur encrypted rehta hai. Messages real human typing interval ke sath jate hain taaki koi spam flagging na ho.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 4: WHATSAPP MESSAGE TEMPLATES ===================== */}
        {(activeTab === "all" || activeTab === "templates") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/30">
                  4
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400">Complete Freedom • 100% Customizable</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">WhatsApp Message Templates: Kaise Modify Karein</h2>
                </div>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/20">
                  Edit Templates in Settings →
                </Button>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              CustomerPilot ke 6 core journey messages pre-configured hote hain. Aap <strong>Dashboard ➔ Settings ➔ WhatsApp Journey Templates</strong> me ja kar har message ka text, emojis, store greeting (jaise &quot;Radhe Radhe&quot;, &quot;Namaste&quot;) aur language customize kar sakte hain!
            </p>

            {/* Template Selector Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: "stamp", label: "1. Stamp Earned 🎁", type: "TRANSACTIONAL" },
                { id: "welcome", label: "2. Counter Welcome 👋", type: "MARKETING" },
                { id: "review", label: "3. Google Review AI ⭐", type: "MARKETING" },
                { id: "reward", label: "4. Reward Unlocked 🏆", type: "TRANSACTIONAL" },
                { id: "winback", label: "5. Win-Back Inactive 🔔", type: "ENGAGEMENT" },
              ].map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setActiveTemplateTab(tpl.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                    activeTemplateTab === tpl.id
                      ? "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30"
                      : "bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            {/* Live Template Preview Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Template Details & Supported Variables */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white">How to Edit This Template:</span>
                    <span className="text-[10px] text-emerald-400 font-mono">1-Click Live Sync</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal pl-4 leading-relaxed">
                    <li>Go to <strong>Dashboard ➔ Settings</strong>.</li>
                    <li>Scroll down to the <strong>&quot;WhatsApp Journey Templates&quot;</strong> card.</li>
                    <li>Find the template, click the <strong>&quot;Customize&quot;</strong> button.</li>
                    <li>Edit the wording, emojis, or language to match your brand tone.</li>
                    <li>Click <strong>&quot;Save Template&quot;</strong> — updates immediately!</li>
                  </ol>
                </div>

                {/* Variables reference */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="text-xs font-bold text-indigo-300 mb-2">Supported Dynamic Variables (Aap use kar sakte hain):</div>
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                    <span className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">&#123;&#123;customerName&#125;&#125;</span>
                    <span className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">&#123;&#123;businessName&#125;&#125;</span>
                    <span className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">&#123;&#123;stampCount&#125;&#125;</span>
                    <span className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">&#123;&#123;rewardName&#125;&#125;</span>
                    <span className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">&#123;&#123;remainingStamps&#125;&#125;</span>
                    <span className="bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">&#123;&#123;walletUrl&#125;&#125;</span>
                  </div>
                </div>
              </div>

              {/* Right: Simulated WhatsApp Chat with the Active Template */}
              <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      CC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Cake Connection</div>
                      <div className="text-[10px] text-emerald-400">WhatsApp Verified</div>
                    </div>
                  </div>
                  <Badge className="text-[10px] bg-slate-800 text-slate-300">Live Preview</Badge>
                </div>

                <div className="py-4 space-y-3 font-sans text-xs">
                  {/* Active template content */}
                  {activeTemplateTab === "stamp" && (
                    <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 space-y-2">
                      <p className="font-bold text-amber-300">🎉 Stamp Added!</p>
                      <p>
                        Hey <strong>Rahul</strong>! You received <strong>1 Stamp</strong> for your visit at <strong>Cake Connection</strong>.
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Status: <strong>4 of 10 Stamps Collected</strong> (6 stamps to go for <em>Free Belgian Truffle Pastry</em>).
                      </p>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-indigo-300 font-mono">
                        👉 Tap to view your live VIP Card: customerpilot.in/wallet/c102
                      </div>
                    </div>
                  )}

                  {activeTemplateTab === "welcome" && (
                    <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 space-y-2">
                      <p className="font-bold text-emerald-300">👋 Welcome to Cake Connection VIP Club!</p>
                      <p>
                        Thank you for visiting us today! Your VIP membership is now active.
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        ⭐ Every ₹200 bill = 1 Stamp<br />
                        🎁 10 Stamps = Free Belgian Truffle Pastry!
                      </p>
                    </div>
                  )}

                  {activeTemplateTab === "review" && (
                    <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 space-y-2">
                      <p className="font-bold text-amber-300">⭐ Hope you loved your visit yesterday!</p>
                      <p>
                        Would you like AI to draft a quick 2-line Google Review for you?
                      </p>
                      <p className="text-emerald-400 font-semibold text-[11px]">
                        🎁 Post review &amp; get +2 Surprise Bonus Stamps instantly!
                      </p>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-indigo-300 font-mono">
                        👉 Tap to review: customerpilot.in/review/m88
                      </div>
                    </div>
                  )}

                  {activeTemplateTab === "reward" && (
                    <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 space-y-2">
                      <p className="font-bold text-purple-300">🏆 Congratulations Rahul!</p>
                      <p>
                        You have collected all 10 stamps! Your <strong>Free Belgian Truffle Pastry</strong> is unlocked and ready to redeem at the counter.
                      </p>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-purple-300 font-mono">
                        👉 Show this WhatsApp at the billing counter to claim!
                      </div>
                    </div>
                  )}

                  {activeTemplateTab === "winback" && (
                    <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 space-y-2">
                      <p className="font-bold text-rose-300">❤️ We miss you at Cake Connection!</p>
                      <p>
                        It has been 30 days since your last sweet treat. Here is an exclusive VIP 15% discount for you this week!
                      </p>
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-emerald-300 font-mono">
                        Valid on your next visit till Sunday!
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  ✏️ Fully editable from your Settings dashboard
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 5: OTHER PRO FEATURES ===================== */}
        {(activeTab === "all" || activeTab === "other") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-500/30">
                  5
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">Pro Power Tools • Settings Tour</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Other Essential Features You Should Configure</h2>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-3 py-1 font-bold">
                Settings Highlights ⚡
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Feature 1 */}
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    ⭐
                  </div>
                  <h4 className="font-bold text-white text-sm">Google Business Profile (GBP) 1-Click Link</h4>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Apne Google Account se 1-click connect karein. Isse customer ke Google Reviews live sync hote hain aur AI automatically Google Maps par owner reply publish kar deta hai with local SEO keywords!
                </p>
                <div className="text-[10px] text-indigo-400 font-mono pt-1">
                  Location: Settings ➔ Google Business Integration
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🖨️
                  </div>
                  <h4 className="font-bold text-white text-sm">Branded Counter Standee QR Download</h4>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Apne store logo aur brand colors ke saath high-resolution PDF/PNG Standee QR download karein. Isse acrylic stand me laga kar billing desk par rakh dein.
                </p>
                <div className="text-[10px] text-indigo-400 font-mono pt-1">
                  Location: Settings ➔ Counter QR Generator
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    ⏱️
                  </div>
                  <h4 className="font-bold text-white text-sm">Google Review Follow-up Delay Settings</h4>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Review prompt kab jana chahiye? Testing ke liye aap <strong>5-minute interval</strong> choose kar sakte hain, aur live store ke liye <strong>24 hours</strong> choose kar sakte hain.
                </p>
                <div className="text-[10px] text-indigo-400 font-mono pt-1">
                  Location: Settings ➔ Google Review Delay Settings
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    🏢
                  </div>
                  <h4 className="font-bold text-white text-sm">Store Branding &amp; Powered By Footer</h4>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Customer ke mobile wallet page par &quot;Powered by CustomerPilot&quot; badge ko toggle kar sakte hain aur apna referral CTA on/off kar sakte hain.
                </p>
                <div className="text-[10px] text-indigo-400 font-mono pt-1">
                  Location: Settings ➔ Branding Settings
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== INTERACTIVE 5-MINUTE CHECKLIST ===================== */}
        <section id="checklist" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Interactive Store Launch Tracker</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">5-Minute Go-Live Checklist</h2>
              <p className="text-xs text-slate-400 mt-1">Check off each task as you configure your store in Settings:</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400">{progressPercent}%</div>
              <div className="text-[11px] text-slate-400">{completedCount} of {totalTasks} Completed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mb-6">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Tasks list */}
          <div className="space-y-3">
            {[
              { id: "profile", title: "Business Name, Owner Name & Category Saved", time: "1 Min", desc: "Category defines smart defaults for your industry." },
              { id: "rules", title: "Loyalty Stamp Target & Reward Name Configured", time: "1 Min", desc: "Set required stamps (e.g. 10) & free reward item." },
              { id: "whatsapp", title: "Store Phone WhatsApp Connected via QR Scan", time: "1 Min", desc: "Linked Devices scan binds cloud instance automatically." },
              { id: "templates", title: "Reviewed & Customized WhatsApp Message Templates", time: "1 Min", desc: "Greeting, Stamp Added, and Review Prompt reviewed." },
              { id: "standee", title: "Branded Counter Standee QR Downloaded & Printed", time: "1 Min", desc: "Ready to place at cash counter for customer scans." },
              { id: "testScan", title: "Ran 1 Test Customer Scan in Live Queue", time: "30 Sec", desc: "Approved 1st visit stamp & verified WhatsApp receipt." },
            ].map(task => {
              const isChecked = checklist[task.id]
              return (
                <div
                  key={task.id}
                  onClick={() => toggleCheck(task.id)}
                  className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-emerald-950/20 border-emerald-500/40 text-slate-200"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    isChecked ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 bg-slate-900"
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-bold ${isChecked ? "line-through text-slate-400" : "text-white"}`}>
                        {task.title}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                        {task.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{task.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {progressPercent === 100 && (
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/50 text-center animate-in zoom-in-95 duration-300 space-y-2">
              <div className="text-xl font-black text-emerald-300">🎉 Congratulations! Store 100% Configured &amp; Ready!</div>
              <p className="text-xs text-slate-300 max-w-xl mx-auto">
                Aapka counter standee QR ready hai, WhatsApp connected hai, aur reward rules perfectly customized hain.
              </p>
              <Link href="/dashboard" className="inline-block pt-2">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-6 py-2.5">
                  Launch Merchant Dashboard →
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* ===================== DIRECT ACTIONS & DASHBOARD JUMP ===================== */}
        <section className="border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 py-16 px-4 text-center rounded-3xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 font-bold">
              Quick Navigation
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Customize Your Store Right Now?
            </h2>

            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Seedha apne merchant dashboard me jaayein aur live rules, reward items, aur WhatsApp templates configure karein.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link href="/dashboard/settings">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm px-7 py-5 rounded-xl shadow-xl shadow-indigo-500/20">
                  Open Complete Setup Dashboard →
                </Button>
              </Link>
              <Link href="/dashboard/rewards">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  View Reward Catalog
                </Button>
              </Link>
              <Link href="/dashboard/queue">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  Open Live Queue
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 CustomerPilot. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-400">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms &amp; Privacy</Link>
            <Link href="/dashboard/settings" className="hover:text-slate-400">Settings</Link>
            <Link href="/guide/3-day-trial" className="text-emerald-400 font-bold">Setup Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
