'use client'

import React, { useState, useId } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  CreditCard, 
  QrCode, 
  Gift, 
  Receipt, 
  Bot, 
  Compass, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Smartphone, 
  Layers, 
  Zap, 
  Flame, 
  Check, 
  ChevronRight,
  ExternalLink,
  MessageSquare,
  BadgePercent,
  Cpu,
  BarChart3,
  CheckCircle,
  XCircle,
  Sliders,
  DollarSign,
  HeartHandshake,
  Store,
  Clock,
  Sparkle,
  PhoneCall,
  MapPin,
  Share2,
  Award,
  ChevronDown
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ServicesInfographicPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'reviews' | 'retention' | 'pos'>('all')
  const [interactiveStep, setInteractiveStep] = useState<number>(1)
  const [dailyFootfall, setDailyFootfall] = useState<number>(50)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // ─── STRICT CANONICAL 8 CORE MODULES ───
  const coreModules = [
    {
      id: 1,
      category: 'reviews',
      name: 'Smart Digital Business Card',
      route: '/smart-digital-business-card',
      dashboardRoute: '/dashboard/digital-card',
      icon: Smartphone,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      hoverBorder: 'hover:border-cyan-400',
      gradient: 'from-cyan-500 to-blue-600',
      badge: '1-Tap Contact Save',
      badgeStyle: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      headline: 'Contactless Smart Visiting Card with 1-Tap Save',
      benefit: 'Customers save your phone number, address, and live digital menu directly into their contacts in 1 tap — without paper business cards.',
      howItWorks: [
        'Customer taps NFC card or scans your table QR code',
        'Your verified business profile opens with 1-tap "Save Contact"',
        'Direct WhatsApp chat, catalog links, and Google Maps directions built in'
      ],
      metric: '8.4x',
      metricSub: 'Higher contact saves vs paper visiting cards'
    },
    {
      id: 2,
      category: 'retention',
      name: 'WhatsApp Digital Loyalty Membership Club',
      route: '/whatsapp-digital-loyalty-card',
      dashboardRoute: '/dashboard/rewards',
      icon: Gift,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      hoverBorder: 'hover:border-amber-400',
      gradient: 'from-amber-500 to-orange-500',
      badge: 'App-Less Loyalty Stamps',
      badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
      headline: 'Digital Stamp Cards & VIP Perks Right on WhatsApp',
      benefit: 'Turn one-time walk-in buyers into lifelong regulars. Customers earn stamps on WhatsApp automatically — zero mobile apps to download.',
      howItWorks: [
        'Customer enters mobile number or scans counter QR at checkout',
        'Digital stamp card arrives on their WhatsApp with live milestone progress',
        'Automatic 30/60 day win-back cashback alerts bring dormant buyers back'
      ],
      metric: '+42%',
      metricSub: 'Increase in repeat customer visits within 30 days'
    },
    {
      id: 3,
      category: 'reviews',
      name: 'Smart AI Google Reviews',
      route: '/ai-google-review-qr-generator',
      dashboardRoute: '/dashboard/reviews',
      icon: Star,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      gradient: 'from-emerald-500 to-teal-600',
      badge: '5-Star Review Booster',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      headline: 'Zero-Typing 5-Star Google Reviews Powered by Gemini AI',
      benefit: 'Customers never have to struggle thinking what to write. Gemini AI drafts a genuine, keyword-rich 5-star review in 3 seconds for 1-tap posting.',
      howItWorks: [
        'Customer scans your custom acrylic tabletop standee',
        'Selects products or services purchased from your live store catalog',
        'AI drafts 3 authentic 5-star options with 1-click copy directly to Google Maps'
      ],
      metric: '5x',
      metricSub: 'Faster review velocity on Google Maps with 0 fake reviews'
    },
    {
      id: 4,
      category: 'reviews',
      name: '1-Click AI AutoReply',
      route: '/ai-google-review-autoreply',
      dashboardRoute: '/dashboard/reviews',
      icon: MessageSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-400',
      gradient: 'from-indigo-500 to-violet-600',
      badge: '1-Sec Google Reply',
      badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      headline: 'Instant Professional Owner Replies on Google Maps',
      benefit: 'Never leave a Google review unanswered. Gemini AI creates appreciative, context-aware responses with local SEO keywords and publishes in 1 click.',
      howItWorks: [
        'New customer review appears instantly on your CustomerPilot dashboard',
        'AI analyzes sentiment and mentions specific products reviewed',
        'Approve in 1 tap or set auto-pilot to publish via official Google API'
      ],
      metric: '100%',
      metricSub: 'Google Review response rate within 60 seconds'
    },
    {
      id: 5,
      category: 'reviews',
      name: 'GBP Optimization (RankPilot AI™)',
      route: '/rankpilot',
      dashboardRoute: '/dashboard/gbp-status',
      icon: Compass,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
      gradient: 'from-blue-600 to-cyan-500',
      badge: 'Top 3 Maps Guarantee',
      badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300',
      headline: 'Rank #1 on Google Maps for High-Intent "Near Me" Searches',
      benefit: 'Autonomous local SEO engine that optimizes your business categories, posts weekly updates, and pushes your store to Google Maps Top 3 ranking.',
      howItWorks: [
        'Multi-radius grid audit analyzes your competitors across 10 km',
        'Auto-schedules 3 weekly photo posts with localized geo-tagged keywords',
        '100% money-back SLA if your store does not reach top 3 positions'
      ],
      metric: '#1',
      metricSub: 'Position on Google Maps for local high-intent buyers'
    },
    {
      id: 6,
      category: 'retention',
      name: 'Dynamic QR Studio',
      route: '/dashboard/DynamicQRStudio',
      dashboardRoute: '/dashboard/DynamicQRStudio',
      icon: QrCode,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      hoverBorder: 'hover:border-emerald-400',
      gradient: 'from-emerald-600 to-teal-500',
      badge: 'Permanent Counter QR',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      headline: 'Self-Hosted QR Code Engine with Instant Destination Updates',
      benefit: 'Print once on your acrylic standees and counters. Change destination anytime to WhatsApp groups, festivals, or menus with zero re-printing costs.',
      howItWorks: [
        'Download high-resolution print-ready vector QR codes in PNG and SVG',
        'Switch target URL anytime from your dashboard with 0-second redirect lag',
        'Track daily, weekly, and monthly customer scan analytics in real time'
      ],
      metric: '₹0',
      metricSub: 'Zero paid third-party API fees or renewal traps forever'
    },
    {
      id: 7,
      category: 'retention',
      name: 'WhatsApp Group Booster & Lead Capture',
      route: '/whatsapp-group-booster',
      dashboardRoute: '/dashboard/WAGroupBoosterPro',
      icon: Users,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      hoverBorder: 'hover:border-teal-400',
      gradient: 'from-teal-500 to-emerald-600',
      badge: 'VIP Community Builder',
      badgeStyle: 'bg-teal-100 text-teal-800 border-teal-300',
      headline: 'Capture Customer Names & Phone Numbers Before Group Join',
      benefit: 'Turn counter scans into an owned VIP community. A fast mobile form collects customer name & WhatsApp number before redirecting to your WhatsApp group.',
      howItWorks: [
        'Customer scans QR code to claim an in-store offer or VIP community access',
        'Enters Name + Phone in a 3-second friction-free mobile form',
        'Customer is automatically saved to your CRM with transactional consent'
      ],
      metric: '95%+',
      metricSub: 'Visitor-to-community join conversion rate'
    },
    {
      id: 8,
      category: 'pos',
      name: 'Smart POS Billing & WhatsApp Invoicing Pro',
      route: '/dashboard/billing',
      dashboardRoute: '/dashboard/billing',
      icon: Receipt,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      hoverBorder: 'hover:border-indigo-400',
      gradient: 'from-indigo-600 to-purple-600',
      badge: '3-Sec Rapid POS',
      badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      headline: 'Lightning-Fast Billing with Automated WhatsApp PDF Invoices',
      benefit: 'Generate bills in 3 seconds from your mobile or tablet. Automatically delivers professional PDF bills to your customer on WhatsApp with zero paper waste.',
      howItWorks: [
        'Tap items from your visual touch menu with auto-GST calculations',
        '1-click print to Bluetooth thermal printer if physical receipt is needed',
        'Digital PDF invoice sent to customer WhatsApp with review link attached'
      ],
      metric: '100%',
      metricSub: 'Paper receipt cost saved with automated WhatsApp delivery'
    }
  ]

  const filteredModules = coreModules.filter(m => activeCategory === 'all' || m.category === activeCategory)

  // Interactive Phone Simulator Screens
  const simulatorScreens = [
    {
      step: 1,
      title: '1. In-Store Walk-in & Tap',
      desc: 'Customer arrives at your shop counter and taps the smart NFC acrylic standee with their phone.',
      phoneHeader: 'CustomerPilot Smart Standee',
      screenType: 'tap',
      content: {
        store: 'Shreenath Rajwadi Silk Palace',
        sub: 'Pethapur, Gandhinagar · Pure Silk Saree Showroom',
        badge: 'NFC & QR Connected',
        actionText: 'Welcome! Choose how you would like to connect:'
      }
    },
    {
      step: 2,
      title: '2. 1-Tap 5-Star AI Review',
      desc: 'Gemini AI automatically drafts a glowing 5-star review highlighting genuine store products.',
      phoneHeader: 'Google Review Generator',
      screenType: 'review',
      content: {
        rating: '★★★★★ 5.0 Rating',
        draft: '“Purchased a pure Banarasi bridal silk saree and matching blouse stitching. The fabric quality and royal showroom atmosphere were outstanding!”',
        subtext: 'Auto-seeded with 20 Local SEO keywords for Google Maps ranking'
      }
    },
    {
      step: 3,
      title: '3. WhatsApp VIP Stamp Card',
      desc: 'Digital loyalty card arrives directly on customer WhatsApp with zero apps to install.',
      phoneHeader: 'WhatsApp · VIP Loyalty Card',
      screenType: 'loyalty',
      content: {
        stamps: [true, true, true, true, false],
        reward: 'Collect 1 more stamp to unlock 15% VIP Discount!',
        validity: 'Valid across all branches'
      }
    },
    {
      step: 4,
      title: '4. Instant AI Owner AutoReply',
      desc: 'Your store automatically responds to Google reviews with gratitude and local SEO keywords.',
      phoneHeader: 'Google Maps · Owner Response',
      screenType: 'autoreply',
      content: {
        reviewer: 'Pooja Patel (Local Guide · 18 reviews)',
        reply: '“Thank you so much Pooja! We are thrilled you loved our Banarasi silk collection. Looking forward to welcoming you again soon at Shreenath Rajwadi!”'
      }
    }
  ]

  // ROI Calculator Math
  const calculatedReviewsPerMonth = Math.round(dailyFootfall * 30 * 0.12)
  const calculatedRepeatVisits = Math.round(dailyFootfall * 30 * 0.42)
  const calculatedMonthlyRevenue = Math.round(calculatedRepeatVisits * 450)
  const calculatedAnnualSavings = 114000

  const faqs = [
    {
      q: 'Do my customers need to download any mobile application?',
      a: 'Absolutely not! Everything runs 100% on WhatsApp and standard web browsers. When customers tap or scan your acrylic standee, their native WhatsApp or Google Maps opens instantly. No app downloads, no account registrations, zero friction.'
    },
    {
      q: 'Are all product and service names customizable for my specific business?',
      a: 'Yes, 100%! Whether you run a Silk Saree Showroom (Shreenath Rajwadi), an Optical Store (Alfa Opticals), a Live Cake Shop (Cake Connection), or a Veterinary Clinic (Maw & Paw), your specific products and services are mapped in your Dual Bestseller Studio so AI reviews and loyalty cards reflect your exact business.'
    },
    {
      q: 'Does CustomerPilot comply with Google Business Profile policies?',
      a: 'Yes, 100% compliant. We never generate fake reviews or use bots. Reviews are drafted for real physical walk-in customers on their own mobile devices, and published directly by them to Google Maps. AutoReplies use official Google Cloud OAuth APIs.'
    },
    {
      q: 'How does CustomerPilot replace 6 different tools?',
      a: 'Most retail store owners waste money paying separate monthly fees for Birdeye/review tools (₹1,500), WhatsApp marketing APIs (₹2,500), dynamic QR generators (₹1,000), loyalty apps (₹1,800), and billing POS systems (₹1,200). CustomerPilot bundles all 8 engines into one unified dashboard starting at just ₹1,499/mo.'
    },
    {
      q: 'How soon can my store go live with the acrylic standees?',
      a: 'Your account is live the moment you connect your Google Business Profile (under 60 seconds). Your custom high-resolution counter standee artwork (with your store logo, Google colors, and dynamic QR) is generated instantly for counter placement.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#FBFDFB] text-slate-900 selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* ─── AMBIENT PASTEL BLOOMS (SPOTBAY / VISITI LIGHT AESTHETIC) ─── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute top-96 -left-40 h-[32rem] w-[32rem] rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute bottom-40 right-20 h-[30rem] w-[30rem] rounded-full bg-amber-200/30 blur-3xl" />
        {/* Subtle dot mesh pattern */}
        <div 
          className="absolute inset-0 opacity-[0.25]" 
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* ─── NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo size="md" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition">How It Works</a>
            <a href="#modules" className="hover:text-emerald-600 transition">8 Core Modules</a>
            <a href="#roi-calculator" className="hover:text-emerald-600 transition">ROI Calculator</a>
            <a href="#comparison" className="hover:text-emerald-600 transition">Why Us vs 6 Tools</a>
            <a href="#faqs" className="hover:text-emerald-600 transition">FAQs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs sm:text-sm">
                View Pricing
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20">
                Merchant Login
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Pill */}
          <div className="flex justify-center mb-6">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200/90 shadow-sm text-xs font-semibold text-emerald-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Customer Growth Engine for Retail Stores, Showrooms & Restaurants</span>
            </motion.div>
          </div>

          {/* Main Benefit Headline */}
          <div className="text-center max-w-4xl mx-auto mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]"
            >
              Get More Customers. Keep Them for Life.{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent">
                Runs 100% on WhatsApp.
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-base sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal"
            >
              CustomerPilot replaces 6 expensive tools with one automated system. Collect 5-star Google reviews without begging, reward regulars with WhatsApp loyalty stamps, and send 3-second WhatsApp bills — with <strong>zero apps to download</strong>.
            </motion.p>

            {/* Quick Proof Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-700"
            >
              <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>350+ Active Merchants</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9★ Merchant Rating</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>0 Apps to Install (100% WhatsApp)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Official Google Maps API Partner</span>
              </div>
            </motion.div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-6 rounded-2xl shadow-lg shadow-emerald-600/25 text-base">
                Explore All-in-One Plans
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/90 border-slate-300 text-slate-800 hover:bg-slate-100 font-bold px-8 py-6 rounded-2xl text-base">
                See How It Works
              </Button>
            </a>
          </div>

        </div>
      </section>

      {/* ─── SECTION 2: THE 4-STAGE 3D INTERACTIVE INFOGRAPHIC JOURNEY ─── */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-white via-emerald-50/20 to-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300/80">
              Interactive 3D Walkthrough
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
              Every Stage of Your Customer Journey, Connected.
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Click any stage below to test the live phone simulator and experience what your customer sees on their mobile screen.
            </p>
          </div>

          {/* 4 Interactive Stages Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
            {simulatorScreens.map((step) => {
              const isSelected = interactiveStep === step.step
              return (
                <button
                  key={step.step}
                  onClick={() => setInteractiveStep(step.step)}
                  className={`relative p-4 sm:p-5 text-left rounded-2xl border-2 transition-all duration-300 ${
                    isSelected 
                      ? 'bg-white border-emerald-500 shadow-xl shadow-emerald-500/10 -translate-y-1' 
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      0{step.step}
                    </span>
                    {isSelected && (
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm sm:text-base text-slate-900">{step.title}</div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{step.desc}</div>
                </button>
              )
            })}
          </div>

          {/* Interactive 3D Showcase Split View */}
          <div className="grid lg:grid-cols-12 gap-10 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
            
            {/* Left: Detailed Explainer of Active Stage */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                <span>Stage 0{interactiveStep} of 04 · Live Customer Experience</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {simulatorScreens[interactiveStep - 1].title}
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                {simulatorScreens[interactiveStep - 1].desc}
              </p>

              {/* Stage Specific Highlights */}
              <div className="space-y-3 pt-2">
                {interactiveStep === 1 && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>Dual NFC + QR Technology:</strong> Works on all smartphones with instant camera tap.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>Custom Acrylic Standee:</strong> High-res branded counter displays tailored to your shop logo.</p>
                    </div>
                  </>
                )}

                {interactiveStep === 2 && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>Zero Typing Required:</strong> Customers pick products they purchased and AI writes the review.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>Local SEO Supercharge:</strong> Auto-seeds 20 high-intent keywords to push your store to Google Top 3.</p>
                    </div>
                  </>
                )}

                {interactiveStep === 3 && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>100% WhatsApp Native:</strong> Digital stamp card lives in their WhatsApp chat history.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>Dormant Win-Back Engine:</strong> Automatic WhatsApp notifications bring buyers back before 30 days.</p>
                    </div>
                  </>
                )}

                {interactiveStep === 4 && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>Official Google Maps API:</strong> Replies are posted in 1 click through verified Google Cloud OAuth.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <p className="text-sm text-slate-700"><strong>Zero Missed Reviews:</strong> Every single review is acknowledged with personalized appreciation.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Step Navigation Button */}
              <div className="pt-4 flex items-center gap-3">
                <Button 
                  onClick={() => setInteractiveStep((prev) => (prev % 4) + 1)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-5 rounded-xl"
                >
                  Next Stage (0{((interactiveStep % 4) + 1)})
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <span className="text-xs text-slate-500 font-medium">Click to cycle through the customer loop</span>
              </div>
            </div>

            {/* Right: 3D Animated Smartphone Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div 
                key={interactiveStep}
                initial={{ opacity: 0, scale: 0.95, rotateY: 8 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[340px] bg-slate-900 rounded-[2.8rem] p-3 shadow-2xl shadow-slate-900/30 border-[6px] border-slate-800 relative"
                style={{
                  perspective: '1000px'
                }}
              >
                {/* Phone Notch / Speaker */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-900/80 mr-2" />
                  <div className="w-10 h-1.5 rounded-full bg-slate-900/60" />
                </div>

                {/* Inner Screen */}
                <div className="bg-white rounded-[2.2rem] overflow-hidden pt-8 pb-5 px-4 min-h-[460px] flex flex-col justify-between border border-slate-100">
                  
                  {/* Screen Header */}
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CustomerPilot Live Demo</span>
                      </span>
                      <span className="text-emerald-600 font-extrabold">● Active</span>
                    </div>

                    {/* Step Screen 1: Digital Card */}
                    {interactiveStep === 1 && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white p-4 rounded-2xl text-center shadow-md">
                          <div className="w-12 h-12 bg-white text-cyan-800 font-black rounded-full mx-auto flex items-center justify-center text-lg shadow-sm">
                            SR
                          </div>
                          <div className="font-extrabold text-sm mt-2">Shreenath Rajwadi</div>
                          <div className="text-[10px] text-cyan-100">Silk Saree & Bridal Palace</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                          <button className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Save Contact (vCard)</span>
                          </button>
                          <button className="w-full py-2 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5">
                            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Store Catalog</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step Screen 2: 5-Star Review Draft */}
                    {interactiveStep === 2 && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                          <div className="text-amber-500 text-lg font-black tracking-widest">★★★★★</div>
                          <div className="text-[11px] font-bold text-amber-900 mt-1">Google Maps 5.0 Star Ready</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-relaxed italic">
                          {simulatorScreens[1].content.draft}
                        </div>
                        <button className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>1-Tap Copy & Post to Google Maps</span>
                        </button>
                      </div>
                    )}

                    {/* Step Screen 3: WhatsApp Stamp Card */}
                    {interactiveStep === 3 && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                          <div className="text-xs font-black text-emerald-900">VIP Loyalty Stamps (4/5)</div>
                          <div className="flex justify-center gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <div 
                                key={s} 
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                                  s <= 4 ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-400 border border-dashed border-slate-400'
                                }`}
                              >
                                {s <= 4 ? '★' : '🎁'}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 text-center">
                          1 stamp away from unlocking your <strong>15% VIP Flat Discount</strong>!
                        </div>
                      </div>
                    )}

                    {/* Step Screen 4: AI AutoReply */}
                    {interactiveStep === 4 && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                          <div className="font-bold text-slate-900">Pooja Patel ★★★★★</div>
                          <div className="text-slate-600 mt-0.5">“Best Banarasi silk collection in Gujarat!”</div>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-[11px] text-indigo-950">
                          <div className="font-black text-indigo-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>AI Owner Response (Auto-Published):</span>
                          </div>
                          <div className="mt-1 leading-relaxed">
                            “Thank you Pooja! Thrilled you loved our Banarasi silk. Looking forward to your next visit!”
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Phone Screen Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Powered by CustomerPilot</span>
                    <span>100% WhatsApp Verified</span>
                  </div>

                </div>
              </motion.div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 3: THE 8 CORE MODULES GRID (STRICT STANDARDIZED NAMES) ─── */}
      <section id="modules" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 bg-blue-100/80 px-3.5 py-1 rounded-full border border-blue-300/80">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
            The 8 Core Modules of CustomerPilot
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Every module works together seamlessly under one single dashboard, or can be used independently as your store expands.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All 8 Modules
            </button>
            <button
              onClick={() => setActiveCategory('reviews')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === 'reviews'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Google Reviews & Local SEO (3)
            </button>
            <button
              onClick={() => setActiveCategory('retention')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === 'retention'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              WhatsApp Loyalty & CRM (4)
            </button>
            <button
              onClick={() => setActiveCategory('pos')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === 'pos'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Smart POS Billing (1)
            </button>
          </div>
        </div>

        {/* 8 Core Modules Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredModules.map((module) => {
            const Icon = module.icon
            return (
              <motion.div
                key={module.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-white rounded-3xl p-6 sm:p-8 border-2 ${module.borderColor} ${module.hoverBorder} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group`}
              >
                <div>
                  {/* Top Bar: Icon + Badge + Metric */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${module.bgColor} ${module.color} flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Module 0{module.id}
                        </span>
                        <div className="text-xs font-semibold text-slate-500">Official CustomerPilot Core</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${module.badgeStyle} font-extrabold text-xs px-2.5 py-1 rounded-full`}>
                      {module.badge}
                    </Badge>
                  </div>

                  {/* STRICT CANONICAL NAME */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {module.name}
                  </h3>

                  {/* Headline & Benefit in Plain English */}
                  <p className="text-sm font-bold text-slate-800 mt-2">
                    {module.headline}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {module.benefit}
                  </p>

                  {/* 3 Step Visual Checklist */}
                  <div className="mt-5 space-y-2 pt-4 border-t border-slate-100">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">How It Works:</div>
                    {module.howItWorks.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Metric + Direct Links */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-slate-900">{module.metric}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{module.metricSub}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={module.route}>
                      <Button size="sm" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl">
                        Details
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button size="sm" className="bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

              </motion.div>
            )
          })}
        </div>

        {/* 9th Enterprise AI Assistant Callout */}
        <div className="mt-10 bg-gradient-to-r from-rose-50 via-white to-orange-50 border-2 border-rose-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Bot className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-md">Enterprise Add-on</span>
                <span className="text-xs text-slate-500 font-semibold">Gear 5 Enterprise Exclusive</span>
              </div>
              <h4 className="text-xl font-black text-slate-900 mt-1">24/7 AI WhatsApp ChatBot (Multilingual)</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Automatically answers customer queries about store timings, catalog prices, directions, and orders on WhatsApp 24 hours a day in English, Hindi, and Gujarati.
              </p>
            </div>
          </div>
          <Link href="/dashboard/chatbot">
            <Button className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm px-6 py-5 rounded-xl shadow-md shadow-rose-600/20 shrink-0">
              Explore AI ChatBot
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

      </section>

      {/* ─── SECTION 4: INTERACTIVE FOOTFALL & REVENUE CALCULATOR ─── */}
      <section id="roi-calculator" className="py-20 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300/80">
              Interactive ROI Simulator
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
              See How Much Growth CustomerPilot Generates for Your Store
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Slide your daily customer walk-ins below to see how many new Google reviews and repeat sales you unlock every month.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-200 shadow-xl shadow-slate-200/50">
            
            {/* Slider Control */}
            <div className="space-y-4 pb-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="footfall-slider" className="font-extrabold text-base sm:text-lg text-slate-900">
                  How many customers visit your store each day?
                </label>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-xl border border-emerald-200 w-fit">
                  {dailyFootfall} Walk-ins / Day
                </div>
              </div>
              <input
                id="footfall-slider"
                type="range"
                min="10"
                max="250"
                step="5"
                value={dailyFootfall}
                onChange={(e) => setDailyFootfall(Number(e.target.value))}
                className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-slate-400 font-semibold">
                <span>10 (Small Boutique / Salon)</span>
                <span>50 (Popular Retail Store)</span>
                <span>150 (Busy Cafe / Bakery)</span>
                <span>250+ (High-Footfall Showroom)</span>
              </div>
            </div>

            {/* Calculated Results 4-Card Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">+{calculatedReviewsPerMonth}</div>
                <div className="text-xs font-bold text-slate-800 mt-1">New 5-Star Reviews</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Every month on Google Maps</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-700">+{calculatedRepeatVisits}</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Repeat Visits</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Driven by WhatsApp stamps</div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 text-center">
                <div className="text-2xl sm:text-3xl font-black text-sky-700">+₹{calculatedMonthlyRevenue.toLocaleString('en-IN')}</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Extra Monthly Sales</div>
                <div className="text-[10px] text-slate-500 mt-0.5">From retained regulars</div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center">
                <div className="text-2xl sm:text-3xl font-black text-indigo-700">₹{calculatedAnnualSavings.toLocaleString('en-IN')}+</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Annual Tool Savings</div>
                <div className="text-[10px] text-slate-500 mt-0.5">vs 6 fragmented apps</div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-5 rounded-2xl shadow-md shadow-emerald-600/20 text-sm sm:text-base">
                  Start Unlocking This Growth Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ─── SECTION 5: WHY CUSTOMERPILOT WINS VS 6 FRAGMENTED TOOLS ─── */}
      <section id="comparison" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300/80">
            Cost & Efficiency Breakdown
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
            Stop Paying for 6 Disconnected Tools.
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Local business owners lose thousands every month paying multiple vendors for separate tools that don’t even talk to each other.
          </p>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Fragmented Traditional Way */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-rose-500" />
                  <h3 className="text-xl font-black text-slate-900">The Fragmented Way (6 Separate Vendors)</h3>
                </div>
                <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">Painful & Costly</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span>Google Review Tool (Birdeye / Podium)</span>
                  <strong className="text-slate-900">₹1,500 / mo</strong>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span>Local SEO / Google Maps Agency</span>
                  <strong className="text-slate-900">₹2,000 / mo</strong>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span>WhatsApp Marketing Software & API</span>
                  <strong className="text-slate-900">₹2,500 / mo</strong>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span>Digital Loyalty App Subscription</span>
                  <strong className="text-slate-900">₹1,800 / mo</strong>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span>AI WhatsApp Chatbot Engine</span>
                  <strong className="text-slate-900">₹2,000 / mo</strong>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 pb-2 border-b border-slate-100">
                  <span>Cloud POS Billing Terminal</span>
                  <strong className="text-slate-900">₹1,200 / mo</strong>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t-2 border-dashed border-rose-200 bg-rose-50/50 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Monthly Cost:</span>
                <span className="text-2xl font-black text-rose-600">₹11,000 / month</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">6 passwords, zero sync, and high customer friction.</p>
            </div>
          </div>

          {/* Card 2: CustomerPilot Unified Way */}
          <div className="bg-gradient-to-b from-white to-emerald-50/30 rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-2xl">
              Recommended
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl font-black text-slate-900">CustomerPilot All-in-One Engine</h3>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span><strong>Smart Digital Business Card:</strong> Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span><strong>WhatsApp Digital Loyalty Stamps & VIP Club:</strong> Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span><strong>Smart AI Google Reviews & Keyword Grounding:</strong> Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span><strong>1-Click AI AutoReply on Google Maps:</strong> Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span><strong>Permanent Dynamic QR Studio:</strong> Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span><strong>WhatsApp Group Booster & Lead Capture:</strong> Included</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span><strong>Smart POS Billing & WhatsApp Invoices:</strong> Included</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t-2 border-dashed border-emerald-300 bg-emerald-100/60 p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">Combo Packages Starting At:</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700">₹1,499 / month</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">
                    Save ₹1,14,000 / Yr
                  </span>
                  <div className="text-xs text-slate-600 mt-1 font-semibold">1 Login · 100% WhatsApp</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ─── SECTION 6: FREQUENTLY ASKED QUESTIONS (ACCORDION) ─── */}
      <section id="faqs" className="py-20 bg-slate-50/60 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-600 bg-slate-200/80 px-3.5 py-1 rounded-full">
              Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to know about setting up CustomerPilot for your business.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ─── SECTION 7: FINAL CTA BANNER ─── */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge className="bg-white/20 text-white border-white/30 text-xs font-bold px-3 py-1 mb-4 rounded-full">
            Ready to Accelerate Your Local Business?
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Start Collecting 5-Star Google Reviews & Retaining Regulars Today.
          </h2>
          <p className="text-base sm:text-lg text-emerald-100 mt-4 max-w-2xl mx-auto">
            Takes under 60 seconds to link your Google Business Profile. Custom acrylic standees shipped straight to your store.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold px-8 py-6 rounded-2xl shadow-xl text-base">
                View Pricing & Combos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-bold px-8 py-6 rounded-2xl text-base">
                Merchant Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" />
            <span>© {new Date().getFullYear()} CustomerPilot Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing Combos</Link>
            <a href="https://wa.me/919033304707" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition flex items-center gap-1">
              <span>Helpdesk: +91 90333 04707</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
