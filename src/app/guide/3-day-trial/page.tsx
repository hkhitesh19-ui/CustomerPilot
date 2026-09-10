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
  MessageSquare,
  Check,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ThreeDayTrialGuidePage() {
  const [activeTab, setActiveTab] = useState<"all" | "day0" | "day1" | "day2" | "day3">("all")
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    signup: true,
    whatsapp: false,
    rules: false,
    qr: false,
    firstScan: false,
    reviewPrompt: false,
    autoReply: false,
  })

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = Object.values(checklist).filter(Boolean).length
  const totalTasks = Object.keys(checklist).length
  const progressPercent = Math.round((completedCount / totalTasks) * 100)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white text-xs py-2 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span>100% Free 3-Day Trial • No Credit Card Required • Zero POS Changes</span>
        <Link href="/signup" className="underline hover:text-emerald-200 ml-2 font-black">
          Start Free Trial →
        </Link>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo variant="dark" size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/case-studies/cake-connection" className="hover:text-white transition-colors">Case Study</Link>
            <Link href="#checklist" className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span>Interactive Checklist</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs sm:text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-4 shadow-lg shadow-indigo-500/20">
                Start 3-Day Trial
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            📘 Merchant Quick-Start Blueprint &amp; Infographic
          </Badge>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            How Your <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">3-Day Free Trial</span> Works
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Step-by-step dekhiye ki signup ke baad pehle 3 din me counter QR se le kar customer WhatsApp stamps, 
            AI Google reviews aur auto-replies kaise automatically kaam karte hain. <strong>No technical knowledge required!</strong>
          </p>

          {/* Quick Metrics Badges */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">5 Minutes</div>
              <div className="text-[11px] text-slate-400">Total Setup Time</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <Smartphone className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">No App Needed</div>
              <div className="text-[11px] text-slate-400">100% WhatsApp Based</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <Store className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">Zero POS Change</div>
              <div className="text-[11px] text-slate-400">Works With Any Billing</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
              <ShieldCheck className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-base font-black text-white">₹0 Risk</div>
              <div className="text-[11px] text-slate-400">No Credit Card Ever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Day Tabs */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-2xl mx-auto shadow-inner">
          {[
            { key: "all", label: "Overview: Full 3-Day Journey", icon: Layers },
            { key: "day0", label: "Day 0: 5-Min Setup", icon: Sparkles },
            { key: "day1", label: "Day 1: 1st Customer & Stamp", icon: Gift },
            { key: "day2", label: "Day 2: AI Google Reviews", icon: Star },
            { key: "day3", label: "Day 3: AI Reply & Scorecard", icon: TrendingUp },
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

      {/* Step-by-Step Infographic Timeline */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 pb-20">

        {/* ===================== DAY 0 ===================== */}
        {(activeTab === "all" || activeTab === "day0") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/30">
                  0
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Signup Day • 5-Minute Activation</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Day 0: Store Setup &amp; QR Standee Placement</h2>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1 font-bold">
                Takes Only 5 Mins ⏱️
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 0.1 */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-emerald-400 font-black flex items-center justify-center text-sm mb-3">
                    1
                  </div>
                  <h3 className="font-bold text-white text-base">Store Profile &amp; Rules</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Apna store name, category (Bakery, Cafe, Salon, Retail), aur simple reward rule set karein.
                  </p>
                  <div className="mt-3.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-mono">
                    💡 Example: <em>10 Stamps = Free ₹150 Pastry</em>
                  </div>
                </div>
              </div>

              {/* Step 0.2 */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-400 font-black flex items-center justify-center text-sm mb-3">
                    2
                  </div>
                  <h3 className="font-bold text-white text-base">Connect WhatsApp</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Onboarding screen par QR code aayega. Apne store phone ke WhatsApp ➔ Linked Devices se scan karein.
                  </p>
                  <div className="mt-3.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant automatic cloud bind</span>
                  </div>
                </div>
              </div>

              {/* Step 0.3 */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-purple-400 font-black flex items-center justify-center text-sm mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-white text-base">Print Counter Standee QR</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Dashboard se branded Counter QR download karke print karein aur billing counter par rakh dein.
                  </p>
                  <div className="mt-3.5 bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/30 text-xs text-indigo-300 font-bold flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Ready for 1st Customer Scan!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DAY 1 ===================== */}
        {(activeTab === "all" || activeTab === "day1") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
                  1
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400">The 1st Customer Visit</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Day 1: First Stamp &amp; VIP Digital Wallet</h2>
                </div>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs px-3 py-1 font-bold">
                Zero Customer Friction ⚡
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left explanation */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Customer Scans Counter Standee</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Customer counter pe camera open karke QR scan karta hai. Seedha WhatsApp open hota hai aur ek pre-typed message send ho jata hai. No app install required!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    B
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Cashier Approves in Live Queue (1 Click)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Merchant ke phone ya tablet screen par Live Queue me customer ka naam dikhta hai. Bill amount daal kar cashier &quot;Approve&quot; tap karta hai.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                    C
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Customer Receives Interactive VIP Stamp Card</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Customer ke WhatsApp par turant confirmation aur interactive Digital Stamp Card ka link aata hai. 1st Stamp lock ho gaya!
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Simulated WhatsApp Chat */}
              <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-2xl">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                    CP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Cake Connection Vadodara</div>
                    <div className="text-[10px] text-emerald-400">WhatsApp Verified Business</div>
                  </div>
                </div>

                <div className="py-4 space-y-3 font-sans text-xs">
                  {/* Bubble 1: Outbound to Merchant */}
                  <div className="bg-emerald-950/60 text-emerald-100 p-3 rounded-2xl rounded-tr-none max-w-[85%] ml-auto border border-emerald-800/40">
                    Hi! I want to join the VIP Club and collect visit stamps! 🍰
                  </div>
                  {/* Bubble 2: Inbound from System */}
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-2xl rounded-tl-none max-w-[90%] border border-slate-800">
                    <p className="font-bold text-amber-300">🎉 Congratulations Rahul!</p>
                    <p className="mt-1">
                      Aapko <strong>Stamp #1</strong> mil chuka hai Cake Connection me!
                    </p>
                    <div className="mt-2.5 p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-indigo-300 font-mono">
                      👉 Tap to open your VIP Stamp Card: customerpilot.in/wallet/c102
                    </div>
                  </div>
                </div>

                <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                  ⚡ 100% Automated via WhatsApp Cloud
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DAY 2 ===================== */}
        {(activeTab === "all" || activeTab === "day2") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-amber-500/30">
                  2
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">Automated Follow-Up</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Day 2: AI Google Review Collection</h2>
                </div>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-3 py-1 font-bold">
                Google NLP Anti-Detection Safe 🛡️
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">How CustomerPilot Collects Genuine 5-Star Reviews:</h3>
                
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Smart Delayed Prompt:</strong> 24 hours baad customer ko WhatsApp par friendly follow-up jata hai.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Dual Natural AI Options:</strong> Customer ko 2 realistic, human-style review drafts milte hain (zero spam footprints).
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>1-Click Copy &amp; Post:</strong> Customer &quot;Copy &amp; Post&quot; tap karta hai — Google Maps app direct 5-star rating window ke saath khulta hai.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Bonus Incentive:</strong> Review submit karne par customer ko automatically +1 ya +2 bonus stamps milte hain.
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Preview Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    {"★".repeat(5)}
                  </div>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-[10px]">
                    AI Generated Draft
                  </Badge>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-200 italic leading-relaxed">
                  &quot;Visited Cake Connection yesterday for my sister&apos;s birthday. The fresh Dutch Truffle cake was incredibly moist and not overly sweet. Quick service and loved the digital stamp system! Definitely coming back.&quot;
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Customer: <strong>Rahul S.</strong></span>
                  <span className="text-emerald-400 font-bold">+2 Bonus Stamps Credited!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DAY 3 ===================== */}
        {(activeTab === "all" || activeTab === "day3") && (
          <div className="relative bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-purple-500/30">
                  3
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-400">Owner Auto-Reply &amp; Scorecard</span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Day 3: AI Google Reply &amp; 3-Day ROI Summary</h2>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs px-3 py-1 font-bold">
                1-Sec Instant Publish ⚡
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Scorecard left */}
              <div className="lg:col-span-7 space-y-4">
                <h3 className="text-lg font-bold text-white">Aapka 3-Day Free Trial Scorecard:</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pehle 3 din me hi aap dekhenge ki CustomerPilot ne aapke store ko real growth engine me convert kar diya hai:
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                    <div className="text-2xl font-black text-emerald-400">10-25+</div>
                    <div className="text-xs text-slate-300 font-bold mt-1">New VIP Members</div>
                    <div className="text-[10px] text-slate-500">Phone numbers safely in CRM</div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                    <div className="text-2xl font-black text-amber-400">3-8+</div>
                    <div className="text-xs text-slate-300 font-bold mt-1">5-Star Google Reviews</div>
                    <div className="text-[10px] text-slate-500">Rankings boost on Google Maps</div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                    <div className="text-2xl font-black text-indigo-400">100%</div>
                    <div className="text-xs text-slate-300 font-bold mt-1">AI Owner Replies</div>
                    <div className="text-[10px] text-slate-500">Automatic SEO keyword injection</div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                    <div className="text-2xl font-black text-purple-400">0%</div>
                    <div className="text-xs text-slate-300 font-bold mt-1">Customer Drop-off</div>
                    <div className="text-[10px] text-slate-500">Next visit hooked with stamps</div>
                  </div>
                </div>
              </div>

              {/* Upgrade advice right */}
              <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-slate-950 border border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] mb-3">
                    Next Step After Trial
                  </Badge>
                  <h4 className="text-base font-bold text-white">Choose a Growth Plan</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    3 din ke baad aapka customer data aur VIP system bilkul safe rehta hai. Continuous automations chalte rehne ke liye 6-Month ya 1-Year subscription select karein (from ₹8/day).
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5">
                  <Link href="/dashboard/subscription" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs py-2.5">
                      Explore Subscription Plans →
                    </Button>
                  </Link>
                  <div className="text-[10px] text-slate-400 text-center">
                    🔒 Razorpay 256-bit Secure • UPI, GPay, Cards Accepted
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ===================== INTERACTIVE CHECKLIST WIDGET ===================== */}
      <section id="checklist" className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-5 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Interactive Merchant Progress Tracker</span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Aapka 3-Day Free Trial Checklist</h2>
              <p className="text-xs text-slate-400 mt-1">Click on each step as you complete it during your free trial:</p>
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
              { id: "signup", title: "Complete Merchant Account Signup", day: "Day 0", desc: "Business name, category, and phone number verified." },
              { id: "whatsapp", title: "Scan WhatsApp QR to connect Store Phone", day: "Day 0", desc: "Automated cloud instance binds with your number." },
              { id: "rules", title: "Configure Loyalty Stamp Rule", day: "Day 0", desc: "Set visits required for free reward (e.g. 10 stamps)." },
              { id: "qr", title: "Print and place Counter QR Standee", day: "Day 0", desc: "Placed at the cash counter for customers to scan." },
              { id: "firstScan", title: "First Customer scans QR & approves stamp", day: "Day 1", desc: "Live queue approval + WhatsApp VIP card delivery." },
              { id: "reviewPrompt", title: "AI Google Review request sent to customer", day: "Day 2", desc: "Customer receives 2 anti-detection draft choices." },
              { id: "autoReply", title: "First 5-Star review receives AI auto-reply", day: "Day 3", desc: "Contextual owner reply posted back to Google Maps." },
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
                        {task.day}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{task.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {progressPercent === 100 && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/50 text-center animate-in zoom-in-95 duration-300">
              <div className="text-xl font-black text-emerald-300">🎉 Champion! All 3-Day Milestones Reached!</div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto">
                Aapka store ab automated customer loyalty aur 5-star Google review autopilot par chal raha hai.
              </p>
              <Link href="/dashboard/subscription" className="inline-block mt-3">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5">
                  Unlock Full Annual Plan (₹8/day) →
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===================== CASHIER CHEAT SHEET ===================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Cashier &amp; Staff 3-Step Cheat Sheet (Billing Counter)</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Apne billing counter ke staff ya cashier ko yeh 3 simple instructions sikha dein:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-emerald-400 font-black text-sm mb-1">🗣️ Step 1: Customer Dialogue</div>
              <p className="text-xs text-slate-300 italic mt-2">
                &quot;Sir/Mam, counter par QR scan kijiye — bill points aur loyalty reward stamp WhatsApp par mil jayenge!&quot;
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-indigo-400 font-black text-sm mb-1">⌨️ Step 2: Open Queue</div>
              <p className="text-xs text-slate-300 mt-2">
                Merchant counter phone/tablet me CustomerPilot ka <strong>Live Queue</strong> open rakhein. Customer scan karte hi screen par appear hoga.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-purple-400 font-black text-sm mb-1">✅ Step 3: Enter &amp; Approve</div>
              <p className="text-xs text-slate-300 mt-2">
                Customer ka bill amount type karein aur <strong>&quot;Approve&quot;</strong> tap karein. Bas! 2 second ka kaam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center mb-10">
          <Badge className="bg-slate-800 text-slate-300 text-xs px-3 py-1 font-bold">Frequently Asked Questions</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">3-Day Free Trial FAQs</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Kya 3 din ke baad mere paise automatic katenge?",
              a: "Bilkul nahi! Signup karte waqt hum aapse koi Credit Card, Debit Card ya Bank details nahi maangte. Isliye trial khatam hone par koi auto-deduction nahi hoga. Aap satisfied honge tabhi manually plan buy karenge."
            },
            {
              q: "Kya mere customers ko koi app download karni padegi?",
              a: "Zero App Download! Sab kuch native WhatsApp aur lightweight mobile browser link par kaam karta hai. Customer counter QR scan karega aur direct WhatsApp pe stamp card mil jayega."
            },
            {
              q: "Kya mere store ke billing software / POS me koi change hoga?",
              a: "Bilkul nahi! CustomerPilot standalone counter QR standee aur lightweight merchant dashboard par chalta hai. Aapka current billing software (Tally, Petpooja, Vyapar, Excel) jaisa chal raha hai waisa hi chalega."
            },
            {
              q: "Trial ke 3 din baad mere collect kiye huye customers ka kya hoga?",
              a: "Aapke saare customer phone numbers, visit history aur stamps database me 100% safe rehte hain. Jaise hi aap subscription renew karenge, automations wahi se resume ho jayenge."
            },
            {
              q: "Google Reviews Google ke guidelines ke hisab se safe hain?",
              a: "Haan, 100% safe. Humara AI engine Google ke NLP anti-spam filters ko follow karta hai. Ye fake footprints (jaise bar-bar same city mention karna ya scripted boilerplate) ko eliminate karta hai aur real human psychology ke mutabiq reviews draft karta hai."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-start gap-2.5">
                <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{item.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2.5 pl-7.5 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== BOTTOM CTA ===================== */}
      <section className="border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-slate-900 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1 font-bold">
            No Risk • 3-Day Instant Free Trial
          </Badge>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Experience the 3-Day Magic at Your Store?
          </h2>

          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Aaj hi apna free trial shuru karein. 5 minute me counter QR standee generate karein aur pehle din se repeat customers badhayein.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/signup">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm px-7 py-5 rounded-xl shadow-xl shadow-indigo-500/20">
                Start 3-Day Free Trial (No Card Needed) →
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                Go to Merchant Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 CustomerPilot. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-400">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms &amp; Privacy</Link>
            <Link href="/case-studies/cake-connection" className="hover:text-slate-400">Case Study</Link>
            <Link href="/guide/3-day-trial" className="text-emerald-400 font-bold">3-Day Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
