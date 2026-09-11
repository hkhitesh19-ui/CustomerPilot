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
  BellRing,
  UserCheck,
  Receipt,
  Send,
  ThumbsUp,
  Coffee,
  HeartHandshake,
  Activity,
  Eye,
  Repeat,
  Zap,
  Play,
  ArrowDown,
  CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function MerchantSetupGuidePage() {
  // Master Mode: "both" (All), "journeys" (Daily Operations), "setup" (Initial 5-Min Setup)
  const [guideMode, setGuideMode] = useState<"both" | "journeys" | "setup">("both")
  
  // Journey Sub-View
  const [journeyView, setJourneyView] = useState<"all" | "merchant" | "customer" | "simulation" | "matrix">("all")
  
  // Interactive Live Simulation Stage (1 to 5)
  const [simStage, setSimStage] = useState<1 | 2 | 3 | 4 | 5>(1)

  // Setup Step Tabs
  const [activeSetupTab, setActiveSetupTab] = useState<"all" | "signup" | "rules" | "whatsapp" | "templates" | "other">("all")
  const [selectedIndustry, setSelectedIndustry] = useState<"bakery" | "cafe" | "salon" | "restaurant" | "retail">("bakery")
  const [activeTemplateTab, setActiveTemplateTab] = useState<"stamp" | "welcome" | "review" | "reward" | "winback">("stamp")

  // Checklist State
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

  // Industry Defaults vs Custom Tips
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

  // Simulation Stage Details
  const simulationStages = [
    {
      stage: 1,
      title: "Stage 1: Walk-In & Counter Scan",
      short: "1. Scan QR",
      customerAction: "Customer bill counter par Standee QR ko apne phone camera ya WhatsApp se scan karta hai. Ek pre-typed WhatsApp message send karta hai.",
      customerScreen: {
        type: "whatsapp",
        title: "WhatsApp Message Sent",
        message: "Hi! Adding my visit at Cake Connection... 🥐",
        reply: "Welcome to Cake Connection VIP Club! 🎉 Aap queue me add ho gaye hain. Cashier bill confirm karte hi aapka digital stamp add ho jayega."
      },
      merchantAction: "Cashier ko customer ko sirf welcome karna hai. Koi registration form ya OTP nahi mangna.",
      merchantScreen: {
        type: "dashboard",
        title: "Live Queue Screen (/dashboard/queue)",
        badge: "1 Customer Waiting",
        content: "Rahul Sharma (+91 98765 43210) joined queue at 04:15 PM"
      },
      timeNeeded: "5 Seconds",
      automation: "Instant WhatsApp webhook response + live queue insertion"
    },
    {
      stage: 2,
      title: "Stage 2: Bill Payment & 3-Second Approval",
      short: "2. Approve Bill",
      customerAction: "Customer counter par payment karta hai (UPI, Cash ya Card se) - E.g. ₹320.",
      customerScreen: {
        type: "customer_view",
        title: "Customer Waiting at Counter",
        message: "Bill paid: ₹320. Waiting for receipt ping on WhatsApp..."
      },
      merchantAction: "Cashier apne phone/POS par Live Queue me customer ke samne '₹320' type karke green 'Approve Stamp (✓)' button dabata hai.",
      merchantScreen: {
        type: "dashboard_action",
        title: "Cashier Actions (Live Queue)",
        badge: "Action Required (Takes 3s)",
        content: "Amount: [ ₹320 ]  ➔  [ ✓ Approve Stamp (1 Stamp Awarded) ]"
      },
      timeNeeded: "3 Seconds",
      automation: "Instant stamp calculation & wallet balance update"
    },
    {
      stage: 3,
      title: "Stage 3: WhatsApp Receipt & Digital Wallet",
      short: "3. Digital Wallet",
      customerAction: "Customer ka phone vibrate hota hai. WhatsApp par official branded receipt aur digital animated stamp card link milta hai.",
      customerScreen: {
        type: "whatsapp",
        title: "Instant WhatsApp Receipt",
        message: "🎉 ₹320 Bill Confirmed! 1 Stamp Added.\n\nTotal: 1/10 Stamps collected 🥐\n9 more visits to unlock: Free Belgian Chocolate Pastry!\n\n👉 View Your Live VIP Card: customerpilot.in/q/wallet/c_9281"
      },
      merchantAction: "Zero kaam! Queue screen automatically clear ho jati hai aur next customer ready hota hai.",
      merchantScreen: {
        type: "dashboard",
        title: "Queue Cleared",
        badge: "Ready for Next Customer",
        content: "✅ Approved: Rahul Sharma (1 Stamp credited). Today's Total Stamps: 42"
      },
      timeNeeded: "0 Seconds (Auto)",
      automation: "Automated WhatsApp delivery with personalized dynamic wallet link"
    },
    {
      stage: 4,
      title: "Stage 4: AI-Crafted 5-Star Google Review",
      short: "4. Google Review",
      customerAction: "Visit ke thodi der baad customer ko WhatsApp message aata hai. Link tap karke AI-drafted review 1-click me Google Maps par post kar deta hai.",
      customerScreen: {
        type: "whatsapp",
        title: "WhatsApp Review Prompt",
        message: "Cake Connection me aapka experience kaisa raha? 🌟\n\nAI ne aapke liye ek shandar review draft kiya hai:\n\"Loved the fresh pastries at Cake Connection! Great ambiance and polite staff in Vadodara.\"\n\n👉 [ Post to Google Maps (1 Tap) ]"
      },
      merchantAction: "Zero kaam! Store owner ko kabhi customer ke piche nahi padna padta. Google Maps par 5★ review live hone par AI auto-reply bhi khud post ho jata hai!",
      merchantScreen: {
        type: "dashboard",
        title: "Google Review Dashboard",
        badge: "5★ New Review on Google Maps",
        content: "Rahul Sharma: 5 Stars ⭐⭐⭐⭐⭐\nAI Owner Reply Published: \"Thank you Rahul! So glad you loved our pastries. See you again soon! 💜\""
      },
      timeNeeded: "100% Automated",
      automation: "Gemini AI review draft + GBP auto-fetch + AI owner response publish"
    },
    {
      stage: 5,
      title: "Stage 5: Reward Unlock & Silver VIP Level-Up",
      short: "5. Free Reward",
      customerAction: "10 visits complete hone par customer ko Golden Voucher notification milta hai. Agli visit par cashier ko dikhata hai aur free treat claim karta hai!",
      customerScreen: {
        type: "whatsapp",
        title: "Golden Voucher Unlocked! 🎁",
        message: "👑 CONGRATULATIONS RAHUL!\n\nAapne 10 Stamps poore kar liye hain!\n🎁 Voucher: FREE BELGIAN CHOCOLATE PASTRY\nVoucher ID: #RD-9821\n\nShow this message at counter to redeem."
      },
      merchantAction: "Cashier customer ka voucher number match karke 'Redeem' click karta hai aur free item deliver karta hai.",
      merchantScreen: {
        type: "dashboard_action",
        title: "Reward Redemption Screen",
        badge: "Redemption Verified",
        content: "Voucher #RD-9821: Free Belgian Chocolate Pastry\n[ Mark as Redeemed ✓ ]\n➔ Customer upgraded to Silver VIP (+2 Advance Surprise Stamps Gifted!)"
      },
      timeNeeded: "5 Seconds",
      automation: "Voucher validation + Silver VIP tier upgrade + 2 surprise bonus stamps injection"
    }
  ]

  const currentSim = simulationStages[simStage - 1]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2 shadow-xs">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span>Complete Merchant Master Guide • 5-Minute Setup &amp; Live Counter Operations Blueprint</span>
        <Link href="/dashboard/settings" className="underline hover:text-emerald-200 ml-2 font-black">
          Open Settings Dashboard →
        </Link>
      </div>

      {/* Main Header / Navbar (Clean Light Theme matching Homepage) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <Link href="#journeys" className="text-emerald-700 font-bold flex items-center gap-1.5">
              <span>Live Journeys</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
            <Link href="#setup" className="text-slate-700 hover:text-slate-900 transition-colors">
              5-Min Setup
            </Link>
            <Link href="/dashboard/settings" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              <span>Live Settings</span>
            </Link>
            <Link href="#checklist" className="text-slate-700 hover:text-slate-900">
              Checklist
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-bold">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/queue">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 shadow-sm hover:shadow-md transition-all">
                Open Live Queue
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Light & Airy with Subtle Pastel Accents) */}
      <section className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white">
        {/* Soft Background Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-[400px] h-[300px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-2xs">
            🛠️ Complete Setup &amp; Live Counter Operations Manual
          </Badge>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Complete Setup Ke Baad <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">Kaise Kaam Karega?</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Setup hone ke baad dukaan par <strong>Merchant (Cashier) ko kya karna hoga</strong> aur <strong>Customer ko kya karna hoga</strong> — dekhiye step-by-step infographical flow aur real-time counter simulation.
          </p>

          {/* Master View Mode Switcher */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl max-w-2xl mx-auto shadow-inner">
            <button
              onClick={() => setGuideMode("both")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                guideMode === "both"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              📖 Full Guide (Journeys + Setup)
            </button>
            <button
              onClick={() => setGuideMode("journeys")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                guideMode === "journeys"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              🔄 Live Operations (Journeys)
            </button>
            <button
              onClick={() => setGuideMode("setup")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                guideMode === "setup"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              🛠️ 5-Min Setup Blueprint
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Clock className="w-5 h-5 text-amber-500 mb-1.5" />
              <div className="text-base font-black text-slate-900">3 Seconds</div>
              <div className="text-[11px] text-slate-500 font-medium">Cashier Effort Per Bill</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Smartphone className="w-5 h-5 text-emerald-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">Zero App Download</div>
              <div className="text-[11px] text-slate-500 font-medium">Customer Scans via WhatsApp</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Star className="w-5 h-5 text-indigo-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">100% Automated</div>
              <div className="text-[11px] text-slate-500 font-medium">AI 5★ Reviews &amp; Auto-Reply</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <Gift className="w-5 h-5 text-purple-600 mb-1.5" />
              <div className="text-base font-black text-slate-900">Silver VIP Tier</div>
              <div className="text-[11px] text-slate-500 font-medium">Surprise Bonus Stamps</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION A: LIVE DAILY OPERATIONS & JOURNEYS (MERCHANT VS CUSTOMER)        */}
      {/* ========================================================================= */}
      {(guideMode === "both" || guideMode === "journeys") && (
        <section id="journeys" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 pb-16">
          
          {/* Section Heading & Journey Navigation Tabs */}
          <div className="text-center space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Repeat className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dukaan Par Daily Routine Kaise Chalega</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Live Counter Journey: Merchant vs Customer
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Setup hone ke baad dukaan par <strong>Merchant</strong> ko sirf 3 second ka approve button dabana hota hai, baki sab kuch <strong>CustomerPilot AI Engine</strong> autonomously run karta hai.
            </p>

            {/* Journey View Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {[
                { id: "all", label: "Full Journey (Both Views)", icon: Layers },
                { id: "merchant", label: "👨‍💼 Merchant Ki Journey (Dukaan)", icon: Store },
                { id: "customer", label: "📱 Customer Ki Journey (Grahak)", icon: Users },
                { id: "simulation", label: "⚡ Side-by-Side Simulation", icon: Zap },
                { id: "matrix", label: "📊 Responsibility Matrix", icon: Sliders },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = journeyView === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setJourneyView(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUB-VIEW 1: SIDE-BY-SIDE INTERACTIVE COUNTER SIMULATION                  */}
          {/* ========================================================================= */}
          {(journeyView === "all" || journeyView === "simulation") && (
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-4">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] uppercase font-bold mb-1">
                    ⚡ Interactive Live Simulation
                  </Badge>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Counter Transaction Stepper</span>
                    <span className="text-xs font-normal text-slate-400">(Click any stage below)</span>
                  </h3>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800">
                  Total Cashier Effort: 3 Seconds
                </div>
              </div>

              {/* Stage Stepper Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {simulationStages.map(s => (
                  <button
                    key={s.stage}
                    onClick={() => setSimStage(s.stage as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center transition-all border ${
                      simStage === s.stage
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 scale-[1.02]"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {s.short}
                  </button>
                ))}
              </div>

              {/* Active Stage Split Screen */}
              <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                      {currentSim.stage}
                    </span>
                    <span className="font-bold text-base text-white">{currentSim.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Time Taken:</span>
                    <span className="text-amber-400 font-black">{currentSim.timeNeeded}</span>
                  </div>
                </div>

                {/* Side-by-Side View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                  {/* Left Column: Customer Side */}
                  <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4" />
                          <span>📱 Customer Experience (Phone Screen)</span>
                        </span>
                        <Badge className="text-[9px] bg-slate-800 text-slate-300">Grahak</Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                        {currentSim.customerAction}
                      </p>
                    </div>

                    {/* Customer Mock Phone Screen */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 text-xs font-sans space-y-2 mt-3">
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                        <span>WhatsApp Official Message</span>
                        <span className="text-emerald-400">Live</span>
                      </div>
                      <div className="bg-emerald-950/40 text-emerald-200 border border-emerald-900/60 p-2.5 rounded-lg whitespace-pre-line text-[11px] leading-relaxed">
                        {currentSim.customerScreen.message}
                      </div>
                      {currentSim.customerScreen.reply && (
                        <div className="bg-slate-900 text-slate-300 p-2 rounded-lg text-[10px] border border-slate-800">
                          {currentSim.customerScreen.reply}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Merchant Side */}
                  <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                        <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                          <Store className="w-4 h-4" />
                          <span>👨‍💼 Cashier / Merchant Screen (/queue)</span>
                        </span>
                        <Badge className="text-[9px] bg-indigo-950 text-indigo-300 border-indigo-800">Counter Desk</Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                        {currentSim.merchantAction}
                      </p>
                    </div>

                    {/* Cashier Mock Screen */}
                    <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 text-xs space-y-2 mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{currentSim.merchantScreen.title}</span>
                        <span className="text-amber-400">{currentSim.merchantScreen.badge}</span>
                      </div>
                      <div className="bg-slate-900 text-slate-200 p-3 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed">
                        {currentSim.merchantScreen.content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Automation Footer Banner */}
                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-900/50 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>System Automation:</strong> {currentSim.automation}</span>
                  </div>
                  {simStage < 5 && (
                    <button
                      onClick={() => setSimStage((simStage + 1) as any)}
                      className="text-[11px] text-white font-bold bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <span>Next Stage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 2: MERCHANT KI JOURNEY (STORE OWNER / CASHIER ROUTINE)          */}
          {/* ========================================================================= */}
          {(journeyView === "all" || journeyView === "merchant") && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                    👨‍💼
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700">Dukaan Par Daily Routine</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">Merchant Ki Journey: Dukaandar Ko Kya-Kya Karna Hoga?</h3>
                  </div>
                </div>
                <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 text-xs px-3 py-1 font-bold">
                  Zero POS Integration Risk 🛡️
                </Badge>
              </div>

              <div className="space-y-5">
                {/* Step M1 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Step M1 • Morning (1-Time Setup)
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Time: 0 Minutes Daily</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Counter Par Standee QR Rakhna</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dashboard se downloaded printable PDF QR Standee ko cash counter / billing desk par acrylic stand me rakh dein (UPI scanner ke bagal me). Isme koi wire ya electricity ki zaroorat nahi hoti.
                  </p>
                </div>

                {/* Step M2 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Step M2 • Store Open Hote Hi
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Time: 10 Seconds</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Counter Phone Ya Tablet Me Live Queue Kholna</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cashier apne phone, billing tablet ya computer browser me <strong>customerpilot.in/dashboard/queue</strong> open rakhta hai (ya phone screen par bookmark/Add to Home Screen kar leta hai).
                  </p>
                </div>

                {/* Step M3 */}
                <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Step M3 • Core Daily Duty (Per Customer)
                    </span>
                    <span className="text-[11px] text-emerald-800 font-bold font-mono">⏱️ Only 3 Seconds!</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Customer Bill Amount Daal Kar &quot;Approve&quot; Click Karna</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Customer ne counter QR scan kiya hai, toh cashier ke queue screen par customer ka naam aur phone number dikhta hai. Cashier bas bill amount type karta hai (e.g. <code>₹280</code>) aur green <strong>&quot;Approve Stamp (✓)&quot;</strong> button press kar deta hai.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs font-mono flex items-center justify-between">
                    <span className="text-slate-600">Rahul Sharma (+91 98765...)</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Amount: ₹280 [✓ Approve]</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    💡 Cashier ko bas itna hi karna hai! Stamp add karna, WhatsApp receipt bhejna, aur wallet update karna CustomerPilot khud karta hai.
                  </p>
                </div>

                {/* Step M4 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      Step M4 • Jab Customer 10 Stamps Poore Kare
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Time: 5 Seconds</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Free Reward Deliver Karna &amp; 1-Click Redeem</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Jab customer apna WhatsApp Golden Voucher dikhaye (e.g. &quot;Free Belgian Pastry&quot;), cashier customer ko free item deliver karta hai aur dashboard me voucher ID verify karke <strong>&quot;Redeem&quot;</strong> button daba deta hai. System customer ko automatically agle tier (Silver VIP) me upgrade kar deta hai.
                  </p>
                </div>

                {/* Step M5 */}
                <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Step M5 • 100% Zero-Effort Automation
                    </span>
                    <span className="text-[11px] text-amber-800 font-bold font-mono">Merchant Effort: 0%</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Google Reviews, Auto-Replies &amp; Win-backs Khud Chalte Hain</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <strong className="text-slate-900 block mb-1">⭐ Google 5★ Review:</strong>
                      Customer ko AI review link khud send hota hai. Merchant ko mangne ki zarurat nahi.
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <strong className="text-slate-900 block mb-1">🤖 AI Auto-Reply:</strong>
                      Google Maps par aane wale 5★ review ka appreciative reply Gemini AI khud publish karta hai.
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200">
                      <strong className="text-slate-900 block mb-1">💌 30-Day Win-Backs:</strong>
                      Jo customer 30 din se nahi aaya, system use automatic re-engagement offer bhejta hai.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 3: CUSTOMER KI JOURNEY (GRAHAK KA COMPLETE EXPERIENCE)          */}
          {/* ========================================================================= */}
          {(journeyView === "all" || journeyView === "customer") && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
                    📱
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Grahak Ka Experience</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">Customer Ki Journey: Grahak Ko Kya-Kya Karna Hoga?</h3>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                  Zero Form • Zero App Download 🚀
                </Badge>
              </div>

              <div className="space-y-5">
                {/* Step C1 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Step C1 • Billing Counter Par
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Friction: Zero</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Standee QR Scan Karna (Phone Camera Ya WhatsApp Se)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Customer bill counter par Standee dekhta hai: <em>&quot;Scan to Earn Free Pastry on Every Visit!&quot;</em>. Customer apne mobile camera ya WhatsApp scanner se QR scan karta hai. Use koi bhi Play Store app install nahi karni padti.
                  </p>
                </div>

                {/* Step C2 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Step C2 • 1-Tap Join
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Action: 1 Tap &quot;Send&quot;</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">WhatsApp Par Pre-Typed Message Send Karna</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Scan karte hi customer ka WhatsApp khulta hai jisme pehle se likha hota hai: <code>Hi! Adding my visit at Cake Connection...</code>. Customer bas &quot;Send&quot; dabata hai aur turant store ka personalized welcome card receive ho jata hai.
                  </p>
                </div>

                {/* Step C3 */}
                <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Step C3 • Bill Payment Ke Baad
                    </span>
                    <span className="text-[11px] text-emerald-800 font-bold font-mono">Live VIP Wallet</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">WhatsApp Par Live Stamp &amp; Bill Receipt Milna</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Cashier ke approve karte hi customer ke phone par notification aati hai: <em>&quot;🎉 ₹320 Bill Confirmed! 1 Stamp Added. Total: 1/10 Stamps.&quot;</em>. Saath me live digital wallet link hota hai jisme animated stamp card dikhta hai.
                  </p>
                </div>

                {/* Step C4 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Step C4 • 1-Click AI Review
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Effort: 5 Seconds</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">AI-Drafted 5-Star Review Google Maps Par Post Karna</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Visit ke baad customer ko WhatsApp message aata hai: <em>&quot;Aapka experience kaisa raha? AI ne aapke liye ek shandar review draft kiya hai!&quot;</em>. Customer link kholta hai, Gemini AI genuine 5★ review pre-fill kar deta hai, aur customer 1-tap me Google Maps par post kar deta hai.
                  </p>
                </div>

                {/* Step C5 */}
                <div className="p-5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      Step C5 • Reward Unlock
                    </span>
                    <span className="text-[11px] text-purple-800 font-bold font-mono">10 Stamps Complete</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Counter Par Golden Voucher Dikhakar Free Treat Enjoy Karna</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    10 stamps complete hote hi WhatsApp par Golden Voucher milta hai. Agli visit par customer counter par voucher dikha kar free reward collect karta hai. Saath hi agle card ke liye <strong>2 advance bonus stamps</strong> milte hain aur customer <strong>Silver VIP</strong> ban jata hai!
                  </p>
                </div>

                {/* Step C6 */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Step C6 • Referral Loop
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Viral Growth</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Friends Ko WhatsApp Par Invite Karke Extra Points Earn Karna</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Customer apne digital wallet me <em>&quot;Invite a Friend&quot;</em> button dabakar doston ko WhatsApp link bhejta hai. Friend ke first visit par friend ko bonus stamp milta hai aur customer ko extra wallet reward milta hai.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-VIEW 4: QUICK RESPONSIBILITY MATRIX TABLE                            */}
          {/* ========================================================================= */}
          {(journeyView === "all" || journeyView === "matrix") && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 overflow-hidden">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Kaam Ka Batwara</span>
                <h3 className="text-xl font-black text-slate-900">Summary Matrix: Kaun Kya Karega?</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Activity / Step</th>
                      <th className="py-3 px-4 text-indigo-700">👨‍💼 Merchant Ko Kya Karna Hai?</th>
                      <th className="py-3 px-4 text-emerald-700">📱 Customer Ko Kya Karna Hai?</th>
                      <th className="py-3 px-4 text-purple-700">🤖 AI Engine Kya Automate Karta Hai?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">1. Joining Loyalty</td>
                      <td className="py-3 px-4">Counter par standee QR rakhna</td>
                      <td className="py-3 px-4">Phone camera se scan &amp; send</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">Instant WhatsApp welcome &amp; digital wallet creation</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">2. Stamp Crediting</td>
                      <td className="py-3 px-4 font-bold text-indigo-700">Bill amount enter karke &quot;Approve&quot; click (3s)</td>
                      <td className="py-3 px-4">Sirf normal bill pay karna</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">WhatsApp bill receipt + animated stamp card update</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">3. Google 5★ Review</td>
                      <td className="py-3 px-4 text-slate-400">Zero work (kabhi mangna nahi padta)</td>
                      <td className="py-3 px-4">1-tap me AI review Google Maps pe post</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">Gemini AI contextual review draft + delayed dispatch</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">4. Review Response</td>
                      <td className="py-3 px-4 text-slate-400">Zero work (manual typing nahi)</td>
                      <td className="py-3 px-4 text-slate-400">N/A</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">Google Maps par AI owner reply autonomously published</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">5. Reward Claim</td>
                      <td className="py-3 px-4">Voucher dekh kar &quot;Redeem&quot; click (5s)</td>
                      <td className="py-3 px-4">Free item enjoy karna</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">Silver VIP tier upgrade + 2 surprise advance stamps</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">6. Customer Retention</td>
                      <td className="py-3 px-4">Dukaan chalana aur acche items bechna</td>
                      <td className="py-3 px-4">Personalized offers receive karna</td>
                      <td className="py-3 px-4 text-purple-700 font-semibold">30-day win-back offers, birthday treats &amp; referrals</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: 5-MINUTE INITIAL SETUP & RULES CUSTOMIZATION                   */}
      {/* ========================================================================= */}
      {(guideMode === "both" || guideMode === "setup") && (
        <section id="setup" className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 pb-24 border-t border-slate-200 pt-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Initial 5-Minute Setup Blueprint</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Rules, Rewards &amp; WhatsApp Customization Guide
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Store profile setup, default vs custom rules, WhatsApp connection aur 6 message templates ko customize karne ka process.
            </p>
          </div>

          {/* Navigation Filter Tabs for Setup */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl max-w-3xl mx-auto shadow-inner">
            {[
              { key: "all", label: "All Setup Steps", icon: Layers },
              { key: "signup", label: "Step 1: 1-Min Signup", icon: Store },
              { key: "rules", label: "Step 2: Rules & Rewards", icon: Gift },
              { key: "whatsapp", label: "Step 3: Connect WhatsApp", icon: Smartphone },
              { key: "templates", label: "Step 4: WhatsApp Templates", icon: MessageSquare },
              { key: "other", label: "Step 5: Pro Features", icon: Settings },
            ].map(tab => {
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
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Step 1 • 60 Seconds</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">Merchant Registration &amp; Store Identity</h3>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                  No Credit Card Needed 🔒
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4 text-xs text-slate-600 leading-relaxed">
                  <p className="text-sm text-slate-900 font-bold">
                    Aapko sirf basic 3-4 cheezein enter karni hoti hain:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        A
                      </div>
                      <div>
                        <strong className="text-slate-900 text-xs">Business Name &amp; Owner Name:</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">E.g., <em>Cake Connection, Vadodara</em> (Ye naam customer ke WhatsApp messages aur counter standee par print hota hai).</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0">
                        B
                      </div>
                      <div>
                        <strong className="text-slate-900 text-xs">Business Category (Very Important!):</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">Bakery, Cafe, Salon, Restaurant, ya Retail select karein. System aapke category ke mutabiq <strong>smart default loyalty rules &amp; AI prompt auto-tune</strong> kar deta hai.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                        C
                      </div>
                      <div>
                        <strong className="text-slate-900 text-xs">Store WhatsApp Phone Number:</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">Jis phone se aap customers ko official loyalty points aur automated WhatsApp receipts bhejna chahte hain.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <Link href="/signup">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 shadow-sm">
                        Start Signup (Takes 1 Min) →
                      </Button>
                    </Link>
                    <span className="text-[11px] text-slate-500">Already registered? Proceed to Step 2</span>
                  </div>
                </div>

                {/* Visual Mockup Card */}
                <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Store Profile Preview</span>
                    </span>
                    <Badge className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Auto Configured</Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
                      <span className="text-slate-400">Business Name:</span>
                      <span className="text-white font-bold">Cake Connection</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-amber-400 font-bold">Bakery &amp; Cake Shop 🥐</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-slate-200">Vadodara, Gujarat</span>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between">
                      <span className="text-slate-400">System Ready:</span>
                      <span className="text-emerald-400 font-bold">✅ Smart Defaults Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 2: RULES & REWARDS DEEP DIVE ===================== */}
          {(activeSetupTab === "all" || activeSetupTab === "rules") && (
            <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                    2
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-700">Core Engine • Default vs Custom</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">Rules &amp; Reward Setup: Apne Business ke Hisaab se Modify Karein</h3>
                  </div>
                </div>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    Edit in Settings →
                  </Button>
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                CustomerPilot me har store category ke liye <strong>smart default rules pre-loaded</strong> aate hain. Lekin aap apne menu, ticket size aur margins ke mutabiq inhein 1-click me customize kar sakte hain.
              </p>

              {/* Industry Selector Tabs */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
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
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Industry Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 mb-8">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{currentInd.name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                      Smart Industry Template
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Location: Dashboard ➔ Settings ➔ Rewards</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500 font-medium">Total Stamps Required</div>
                    <div className="text-xl font-black text-amber-600 mt-1">{currentInd.defaultStamps} Visits / Stamps</div>
                    <div className="text-[10px] text-slate-400 mt-1">Can change from 4 to 15 in settings</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500 font-medium">Minimum Bill Per Stamp</div>
                    <div className="text-xl font-black text-emerald-600 mt-1">{currentInd.minPurchase}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Prevents low-bill stamp abuse</div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500 font-medium">Stamp Card Validity</div>
                    <div className="text-xl font-black text-indigo-600 mt-1">{currentInd.validity}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Creates urgency to revisit</div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                  <div className="text-xs font-bold text-amber-800">🎁 Recommended Reward Item:</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{currentInd.defaultReward}</div>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    💡 <strong>Expert Strategy:</strong> {currentInd.customTip}
                  </p>
                </div>
              </div>

              {/* 4 Parameters you should customize */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>What Parameters Can You Customize in Settings?</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-emerald-800 text-sm">1. Stamp Target (Visits)</div>
                    <p className="text-slate-600 mt-1">
                      Slider se 4 se 15 stamps ke beech set karein. Quick conversion ke liye <strong>8 to 10 stamps</strong> sabse zyada popular hai.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-indigo-800 text-sm">2. Minimum Bill Amount</div>
                    <p className="text-slate-600 mt-1">
                      E.g. Min ₹200. Agar customer ₹50 ka chhota item khareedega toh stamp nahi milega — isse ticket size increase hota hai!
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-amber-800 text-sm">3. Specific Reward Name &amp; Description</div>
                    <p className="text-slate-600 mt-1">
                      Generic &quot;Free Gift&quot; mat likhein. Apne store ka best seller item likhein: &quot;Free Dutch Truffle Pastry (₹150)&quot; ya &quot;Free Haircut&quot;.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-bold text-purple-800 text-sm">4. Surprise Tier Progressions</div>
                    <p className="text-slate-600 mt-1">
                      Jab customer 1st card complete karta hai, system use automatically <strong>Silver / Gold VIP</strong> me upgrade karta hai aur 2 bonus advance stamps gift karta hai!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 3: CONNECT WHATSAPP ===================== */}
          {(activeSetupTab === "all" || activeSetupTab === "whatsapp") && (
            <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20">
                    3
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700">WhatsApp Engine • 60-Second Scan</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">Connect Store Phone WhatsApp: Zero API Setup</h3>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
                  100% Brand Phone Number 📱
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4 text-xs text-slate-600">
                  <p className="text-sm text-slate-900 font-bold">
                    Aapko kisi Meta Developer account ya complex API approvals ki zaroorat nahi hai:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <strong className="text-slate-900 text-xs">Settings ➔ WhatsApp Verification Par Jaayein:</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">Screen par live QR code appear hoga.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <strong className="text-slate-900 text-xs">Apne Business Phone Ka WhatsApp Kholein:</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">Settings ➔ <strong>Linked Devices</strong> ➔ <strong>Link a Device</strong> par tap karein.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                        3
                      </div>
                      <div>
                        <strong className="text-slate-900 text-xs">Screen Par QR Scan Karein:</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">Just like WhatsApp Web! 5 seconds me status <strong>&quot;Connected ✅&quot;</strong> ho jata hai.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Visual Mockup */}
                <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Instant WhatsApp Web Link</h4>
                    <p className="text-[11px] text-slate-400 mt-1">Official store phone number se direct automated messages jaate hain.</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Connection Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active &amp; Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 4: WHATSAPP MESSAGE TEMPLATES ===================== */}
          {(activeSetupTab === "all" || activeSetupTab === "templates") && (
            <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-500/20">
                    4
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-purple-700">Communication Engine • 100% Editable</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">WhatsApp Message Templates: Text &amp; Language Customize Karein</h3>
                  </div>
                </div>
                <Link href="/dashboard/settings">
                  <Button variant="outline" className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50">
                    Edit Templates in Settings →
                  </Button>
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                CustomerPilot me customer journey ke har point par automated WhatsApp notification jaati hai. Aap har message ki <strong>wording, emojis, regional language (Hindi / English / Gujarati / Hinglish)</strong> apne brand ke tone me edit kar sakte hain.
              </p>

              {/* Template Switcher Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
                {[
                  { id: "stamp", label: "Stamp Added Receipt" },
                  { id: "welcome", label: "New Member Welcome" },
                  { id: "review", label: "Google Review Request" },
                  { id: "reward", label: "Reward Unlocked" },
                  { id: "winback", label: "30-Day Win-Back" },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTemplateTab(t.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                      activeTemplateTab === t.id
                        ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Template Content Box */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900">Template Preview &amp; Variable Tags</span>
                  <span className="text-slate-500 font-mono">Location: Dashboard ➔ Settings ➔ Templates</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-6 space-y-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-line shadow-2xs">
                      {activeTemplateTab === "stamp" && (
                        `🎉 Hey {{customerName}}!\n\n₹{{billAmount}} ka bill add ho gaya hai Cake Connection par!\n\n🥐 Total Stamps: {{stampCount}}/{{totalStamps}}\nAur sirf {{stampsNeeded}} visits baki hain Free Pastry ke liye!\n\n👉 Live Stamp Card dekhein: {{walletLink}}`
                      )}
                      {activeTemplateTab === "welcome" && (
                        `👋 Welcome {{customerName}} to Cake Connection VIP Club!\n\nAapko pehli visit par 1 Welcome Bonus Stamp gift mila hai.\n\nHar visit par stamp collect karein aur paayein Free Belgian Chocolate Pastry!\n\n👉 Card: {{walletLink}}`
                      )}
                      {activeTemplateTab === "review" && (
                        `⭐ Hi {{customerName}}, Cake Connection me aapka experience kaisa raha?\n\nAI ne aapke liye ek quick Google Review tayar kiya hai:\n\"Loved the fresh bakery items and polite service at Cake Connection!\"\n\n👉 1-Click me post karein: {{googleReviewLink}}`
                      )}
                      {activeTemplateTab === "reward" && (
                        `🎁 BADHAI HO {{customerName}}!\n\nAapne 10 Stamps poore kar liye hain!\n\nAapka FREE BELGIAN CHOCOLATE PASTRY reward unlock ho chuka hai!\n\nAgli visit par counter par voucher dikha kar claim karein:\n👉 Voucher: {{walletLink}}`
                      )}
                      {activeTemplateTab === "winback" && (
                        `🥺 Hey {{customerName}}, we miss you at Cake Connection!\n\nAapko aaye hue 30 din ho gaye hain. Aapke liye ek special surprise wait kar raha hai: Agli visit par Payein 1 FREE BONUS STAMP!\n\n👉 Card dekhein: {{walletLink}}`
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-2 text-xs">
                    <div className="font-bold text-slate-800">Dynamic Variables Reference:</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-indigo-700">&#123;&#123;customerName&#125;&#125;</div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-indigo-700">&#123;&#123;businessName&#125;&#125;</div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-indigo-700">&#123;&#123;stampCount&#125;&#125;</div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-indigo-700">&#123;&#123;stampsNeeded&#125;&#125;</div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-indigo-700">&#123;&#123;rewardName&#125;&#125;</div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-indigo-700">&#123;&#123;walletLink&#125;&#125;</div>
                    </div>
                    <p className="text-slate-500 text-[11px] pt-2">
                      💡 Yeh variables real time me replace ho jaate hain. Aap text ko Hindi ya Gujarati me bhi translate karke save kar sakte hain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== STEP 5: OTHER PRO FEATURES ===================== */}
          {(activeSetupTab === "all" || activeSetupTab === "other") && (
            <div className="relative bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all overflow-hidden">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-amber-500/20">
                    5
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700">Advanced Features</span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">Other Pro Features: Jo Aapko Setup Karni Chahiye</h3>
                  </div>
                </div>
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs px-3 py-1 font-bold">
                  High Growth Addons 🚀
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Feature 1 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <strong className="text-sm text-slate-900">Google Business Profile (1-Click Link)</strong>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Settings me jaakar apna Google Maps business link paste karein. Isse customer ke review prompt me seedha aapke official Google listing ka 5-star link chala jata hai.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <strong className="text-sm text-slate-900">Counter Standee QR (PDF Download)</strong>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Onboarding Step 7 ya Dashboard QR section se ready-to-print high resolution PDF standee download karein aur cash counter par acrylic stand me lagayein.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <strong className="text-sm text-slate-900">Review Request Delay Timer</strong>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Default timing 24 hours hoti hai taaki customer dukan se nikalne ke baad aaram se review post kare. Testing ke liye aap isse 5 minutes ya 1 hour par set kar sakte hain.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <strong className="text-sm text-slate-900">Branding &amp; &quot;Powered By&quot; Controls</strong>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Settings ➔ Branding me aap customer wallet pages par apna business logo upload kar sakte hain aur &quot;Powered by CustomerPilot&quot; badge ko customize kar sakte hain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== SETUP CHECKLIST ===================== */}
          <div id="checklist" className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Go-Live Checklist</span>
                <h3 className="text-xl font-black text-slate-900">5-Minute Complete Setup Checklist</h3>
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
                { id: "profile", title: "1. Store Name & Category Profile", time: "1 Min", desc: "Select bakery, cafe, salon, restaurant or retail" },
                { id: "rules", title: "2. Rules & Rewards Tailored", time: "1 Min", desc: "Stamps target, min bill & high-margin free item" },
                { id: "whatsapp", title: "3. WhatsApp Web Connected", time: "1 Min", desc: "Scan QR code via Linked Devices in store phone" },
                { id: "templates", title: "4. Message Templates Reviewed", time: "1 Min", desc: "Customize text, language and emojis in settings" },
                { id: "standee", title: "5. Counter Standee QR Printed", time: "1 Min", desc: "Download PDF and place on acrylic stand at counter" },
                { id: "testScan", title: "6. Self Test Scan Completed", time: "1 Min", desc: "Scan counter QR with your phone and approve in /queue" },
              ].map(task => {
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
        </section>
      )}

      {/* ===================== DIRECT ACTIONS & DASHBOARD JUMP (Dark Accent Section) ===================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-slate-900 text-white py-14 px-6 text-center rounded-3xl shadow-xl">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 font-bold">
              Quick Navigation
            </Badge>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to See CustomerPilot Live in Action?
            </h2>

            <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Seedha apne merchant dashboard me jaayein aur live rules, reward items, aur WhatsApp templates configure karein ya Live Queue test karein.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link href="/dashboard/settings">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-sm px-7 py-5 rounded-xl shadow-lg shadow-indigo-500/20">
                  Open Complete Settings →
                </Button>
              </Link>
              <Link href="/dashboard/queue">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  Open Live Queue Desk
                </Button>
              </Link>
              <Link href="/dashboard/rewards">
                <Button variant="outline" className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm px-6 py-5 rounded-xl">
                  Reward Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Clean light theme matching homepage) */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms &amp; Privacy</Link>
            <Link href="/dashboard/settings" className="hover:text-slate-900">Settings</Link>
            <Link href="/guide/3-day-trial" className="text-emerald-700 font-bold">Setup &amp; Journey Guide</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
