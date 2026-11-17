'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
  XCircle
} from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ServicesInfographicPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'reviews' | 'retention' | 'pos'>('all')

  const services = [
    {
      id: 1,
      category: 'reviews',
      title: 'Smart AI Google Review Engine',
      subtitle: 'Keyword Grounding & Dual Bestseller Studio',
      icon: Star,
      color: 'from-amber-500 to-orange-500',
      badge: 'Local SEO Hero',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      tagline: 'Customer se 5-Star Reviews nikalne ka 100% Zero-Typing Solution',
      highlights: [
        'Dual Bestseller Studio: 10 Hero Products + 10 Hero Services per merchant',
        '20 Authentic Local Keywords auto-seeded to rank #1 on Google Maps',
        'Customer ko khud kuch type nahi karna padta — 1-Tap AI Draft ready',
        'Automated Review AutoReply Engine with merchant approval drafts',
        'Zero fake reviews: 100% genuine customer phone camera scan verification'
      ],
      metric: '+320%',
      metricLabel: 'Monthly Google Reviews Velocity',
      href: '/smart-ai-google-review'
    },
    {
      id: 2,
      category: 'retention',
      title: 'Smart Digital Business Card',
      subtitle: 'Contactless vCard & Digital Catalog Hub',
      icon: CreditCard,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Digital Contact Hub',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      tagline: 'Paper Visiting Card ko hamesha ke liye bye-bye kaho',
      highlights: [
        '1-Tap Save to Phone (.vcf): Store number, name & logo seedha customer ke phone me',
        'Direct WhatsApp chat, clickable call, email, Google Maps directions',
        'Digital Menu & Catalog: Live product showcase with direct inquiry buttons',
        'Social Media Aggregator: Instagram, Facebook, YouTube, Website ek hi link me',
        'Unlimited updates: Phone number ya address change hone par re-print ka kharcha ₹0'
      ],
      metric: '85%',
      metricLabel: 'Customer Contact Save Rate',
      href: '/smart-digital-business-card'
    },
    {
      id: 3,
      category: 'reviews',
      title: 'High-Definition QR Standees',
      subtitle: 'Custom Acrylic Stands & Dynamic QR Studio',
      icon: QrCode,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Hardware & QR Hub',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      tagline: 'Billing counter par rakhte hi customer ka attention kheechne wala premium design',
      highlights: [
        'Crystal clear acrylic standee tailored with Store Logo & brand theme',
        'Dynamic Routing: Physical standee re-print kiye bina destination link badlo anytime',
        'Real-time Scan Analytics: Total scans, unique devices, peak scan hours',
        'Ultra-thick bevel-edged crystal acrylic build with matte anti-glare finish',
        'Print-ready high-resolution PDF download for A4, A5, and table-tent sizes'
      ],
      metric: '3-Sec',
      metricLabel: 'Customer Scan & Action Time',
      href: '/dashboard/DynamicQRStudio'
    },
    {
      id: 4,
      category: 'retention',
      title: 'WhatsApp VIP Loyalty Stamp Card',
      subtitle: 'Zero-App Digital Stamp & Referral Rewards',
      icon: Gift,
      color: 'from-rose-500 to-pink-600',
      badge: 'Retention Engine',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      tagline: 'Customer ko bar bar aapki shop par bulane ka gamified secret weapon',
      highlights: [
        '10 / 15 Stamp Card seedha customer ke phone browser me — Zero app download',
        'Har visit par Instant WhatsApp Stamp Credit Alert with live balance',
        'Milestone Unlocks: 5th visit discount, 10th visit free gift, birthday surprises',
        'VIP Referral Engine: Customer apne dosto ko recommend karke bonus stamps kama sake',
        'Automated Inactivity Win-Back: 30 din na aane par automatic discount message'
      ],
      metric: '3.4x',
      metricLabel: 'Repeat Customer Frequency',
      href: '/whatsapp-digital-loyalty-card'
    },
    {
      id: 5,
      category: 'pos',
      title: 'Smart POS & WhatsApp Invoicing',
      subtitle: 'Paperless Billing & Instant Dynamic UPI QR',
      icon: Receipt,
      color: 'from-indigo-500 to-violet-600',
      badge: 'Billing & Payments',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      tagline: 'Thermal printer ke rolls ka kharcha bachao, branded PDF WhatsApp par bhejo',
      highlights: [
        'Instant Itemized GST & Non-GST invoice generation in 10 seconds',
        'Clean, branded PDF bill sent directly to customer WhatsApp',
        'Dynamic UPI QR: Bill ka exact amount QR me encoded — customer wrong payment na kare',
        'Zero SMS cost: All invoices delivered via official WhatsApp cloud gateway',
        'Automatic Customer CRM capture: Har billing par name & phone auto-save'
      ],
      metric: '₹18,000',
      metricLabel: 'Annual Paper & Thermal Roll Savings',
      href: '/dashboard/billing'
    },
    {
      id: 6,
      category: 'retention',
      title: '24/7 AI WhatsApp Chatbot',
      subtitle: 'Instant Customer Support & Lead Capture',
      icon: Bot,
      color: 'from-purple-500 to-indigo-600',
      badge: 'AI Automation',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      tagline: 'Raat ko 1 baje bhi customer ke inquiries ka reply seconds me dega',
      highlights: [
        'Shop timings, exact Google Maps location, delivery radius aur FAQs ka reply',
        'Product price list, service rate card aur catalog browsing directly on WhatsApp',
        'High-value inquiry auto-escalation: Big party orders par owner ko instant SMS/call alert',
        'Multilingual support: Gujarati, Hindi aur English teeno me fluent conversation',
        'Zero manual staff required to answer repetitive questions'
      ],
      metric: '100%',
      metricLabel: 'Instant Response Rate in 2 Seconds',
      href: '/features'
    },
    {
      id: 7,
      category: 'reviews',
      title: 'RankPilot AI — GBP SEO Radar',
      subtitle: '7x7 Geogrid Map Scanner & Ranking Accelerator',
      icon: Compass,
      color: 'from-blue-600 to-teal-500',
      badge: 'Local SEO Dominance',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      tagline: 'Google Maps par aapke area ke Top 3 me aane ka scientific road-map',
      highlights: [
        '7x7 Hyperlocal Geo-Grid Map: Har 500m radius me aapki ranking scan kare',
        'Competitor Battlecard: Pata lagao competitors kis keyword par ranking cheen rahe hain',
        'Category & Citation Health Audit: Missing NAP citations aur attribute suggestions',
        'Review Velocity Management: Google spam filter se bachate hue organic steady growth',
        '100% Moneyback Guarantee: Ranking improve nahi hui to full refund guarantee'
      ],
      metric: 'Top 3',
      metricLabel: 'Google 3-Pack Target Rank',
      href: '/rankpilot'
    },
    {
      id: 8,
      category: 'retention',
      title: 'WhatsApp Group Booster',
      subtitle: 'Customer Community & Direct Sales Funnel',
      icon: Users,
      color: 'from-teal-500 to-emerald-600',
      badge: 'Community Growth',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
      tagline: 'Ek baar aane wale customer ko permanent VIP Community member banao',
      highlights: [
        'Pre-redirect Name & Phone Capture: Group join karne se pehle lead database me save',
        'Zero dead group links: Community full hone par auto-switch to Next WhatsApp Group',
        'Weekly VIP Flash Drops: Naya stock, exclusive discount codes sirf group members ke liye',
        'Zero Algorithm dependency: Instagram/Facebook ads ke bina direct audience access',
        'High conversion repeat sales on festivals, weekends and sale days'
      ],
      metric: '4x',
      metricLabel: 'Customer Lifetime Value (LTV)',
      href: '/whatsapp-group-booster'
    }
  ]

  const filteredServices = activeTab === 'all' 
    ? services 
    : services.filter(s => s.category === activeTab)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> All Services
            </Link>
            <Link href="/pricing" className="text-sm font-semibold text-slate-300 hover:text-white transition">
              Pricing Plans
            </Link>
            <Link href="/rankpilot" className="text-sm font-semibold text-slate-300 hover:text-white transition">
              RankPilot AI
            </Link>
            <Link href="/free-ai-google-review-generator" className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition">
              Free AI Review Tool
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white text-xs font-bold rounded-xl h-10 px-4">
                Merchant Login
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 font-extrabold text-xs rounded-xl h-10 px-5 shadow-lg shadow-emerald-500/20">
                Start Free Trial <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Infographic Banner */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Cpu className="w-4 h-4" /> Full Infographic Service Blueprint
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              A Complete Operating System For <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Local Businesses</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 font-medium leading-relaxed">
              CustomerPilot aapke offline store ko ek unstoppable customer acquisition, Google Maps 5-Star reputation, WhatsApp loyalty aur paperless POS billing power-house banata hai.
            </p>

            {/* Quick Stats Pill */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">8 Core</div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Integrated Services</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-cyan-400">100% Free</div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Zero App Downloads</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">20 Keywords</div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">GBP Local SEO Grounding</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-indigo-400">WhatsApp</div>
                <div className="text-xs text-slate-400 mt-1 font-semibold">Native Cloud Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLYWHEEL INFOGRAPHIC: How It All Connects */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
              The CustomerPilot Flywheel
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Kese Kaam Karta Hai Ye Pura System?
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Ek naye customer ke pehle kadam se lekar lifetime loyal repeat customer banne ka 5-stage automated journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative hover:border-emerald-500/50 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-white text-base mb-1">Discovery & Walk-in</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                RankPilot AI aapki shop ko Google Maps Top 3 me rank karata hai. Customer Maps par dekh kar store me walk-in karta hai.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-blue-400">
                <Compass className="w-3.5 h-3.5" /> RankPilot GBP Radar
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative hover:border-emerald-500/50 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-white text-base mb-1">Billing & Data Capture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart POS se 10 second me WhatsApp PDF invoice banti hai. Customer ka phone number aur name system me automatic save ho jata hai.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-indigo-400">
                <Receipt className="w-3.5 h-3.5" /> Smart POS Billing
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative hover:border-emerald-500/50 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-white text-base mb-1">5-Star Google Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Counter par Acrylic Standee dekh kar customer scan karta hai. AI 20 authentic keywords ke sath 1-Tap 5-Star review post karwata hai.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                <Star className="w-3.5 h-3.5" /> Smart AI Review Engine
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative hover:border-emerald-500/50 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg mb-4">
                4
              </div>
              <h3 className="font-bold text-white text-base mb-1">Contact & Catalog Save</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart Digital Business Card se customer aapka official contact number aur digital catalog apne phone address book me 1-tap save karta hai.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
                <CreditCard className="w-3.5 h-3.5" /> Digital Business Card
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative hover:border-emerald-500/50 transition duration-300">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-lg mb-4">
                5
              </div>
              <h3 className="font-bold text-white text-base mb-1">Repeat Loyalty & VIPs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                WhatsApp VIP Stamp Card se repeat visit par reward milta hai. Inactive hone par automated win-back alert customer ko wapas bulata hai.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-[11px] font-bold text-rose-400">
                <Gift className="w-3.5 h-3.5" /> VIP Loyalty & Stamps
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER TABS & ALL 8 SERVICES GRID */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-black text-white">Explore All 8 CustomerPilot Services</h2>
            <p className="text-slate-400 text-sm mt-1">Har module independently kaam karta hai ya pure suite ke sath 100% sync hota hai.</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'all' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              All Services (8)
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'reviews' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Google Reviews & Standees (3)
            </button>
            <button
              onClick={() => setActiveTab('retention')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'retention' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              WhatsApp Retention & VIP (4)
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === 'pos' ? 'bg-indigo-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Smart POS Billing (1)
            </button>
          </div>
        </div>

        {/* 8 Pillar Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => {
            const IconComponent = service.icon
            return (
              <div 
                key={service.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 hover:bg-slate-900 transition-all duration-300 group hover:-translate-y-1 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-lg`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${service.badgeColor}`}>
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition mb-1">
                    {service.title}
                  </h3>
                  <div className="text-xs font-semibold text-slate-400 mb-3">{service.subtitle}</div>
                  
                  <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mb-4">
                    &ldquo;{service.tagline}&rdquo;
                  </p>

                  <ul className="space-y-2 mb-6">
                    {service.highlights.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-slate-400">{service.metricLabel}</span>
                    <span className="text-sm font-black text-emerald-400">{service.metric}</span>
                  </div>
                  <Link href={service.href} className="w-full">
                    <Button variant="outline" className="w-full border-slate-700 bg-slate-800/50 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500 text-xs font-bold rounded-xl h-9 transition">
                      View Details & Setup <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* WHY CUSTOMERPILOT WINS VS FRAGMENTED TOOLS */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              Unified Operating System
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-4">
              6 Alag-Alag Software lene ki jagah <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                CustomerPilot All-in-One Engine
              </span>
            </h2>
            <p className="text-slate-400 text-base mt-4">
              Bina CustomerPilot ke ek merchant ko har mahine hazaron rupaye alag alag apps par waste karne padte hain:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Old Fragmented Way */}
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-4">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  Old Fragmented Way (₹50,000+/year)
                </div>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Paper Visiting Cards</div>
                      <div className="text-slate-400">Lost or thrown away within 24 hours</div>
                    </div>
                    <span className="text-rose-400 font-bold">₹3,000/yr</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Thermal Paper Printer & Rolls</div>
                      <div className="text-slate-400">Fades away in 3 months, costly rolls</div>
                    </div>
                    <span className="text-rose-400 font-bold">₹15,000/yr</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">SMS Gateway & Marketing</div>
                      <div className="text-slate-400">High DLT friction, ignored in spam folder</div>
                    </div>
                    <span className="text-rose-400 font-bold">₹12,000/yr</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Local SEO Agency Fees</div>
                      <div className="text-slate-400">Manual fake reviews that Google deletes</div>
                    </div>
                    <span className="text-rose-400 font-bold">₹24,000/yr</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-rose-900/30 text-rose-300 text-xs font-semibold">
                ❌ Fragmented tools: Zero data sync, huge monthly recurring bills & high staff hassle.
              </div>
            </div>

            {/* The CustomerPilot Way */}
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-3xl p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  CustomerPilot Unified Architecture (Save 80%+)
                </div>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-800/40 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Smart Digital Business Card</div>
                      <div className="text-emerald-400">1-Tap save directly into phone address book</div>
                    </div>
                    <span className="text-emerald-400 font-bold">Included</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-800/40 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Smart POS WhatsApp PDF Invoices</div>
                      <div className="text-emerald-400">Paperless billing, auto GST & dynamic UPI</div>
                    </div>
                    <span className="text-emerald-400 font-bold">Included</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-800/40 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">WhatsApp VIP Loyalty Stamp Cards</div>
                      <div className="text-emerald-400">Zero-app gamified rewards & win-back alerts</div>
                    </div>
                    <span className="text-emerald-400 font-bold">Included</span>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-800/40 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">AI Google Reviews & AutoReply</div>
                      <div className="text-emerald-400">20 authentic keywords with 100% Google Maps safety</div>
                    </div>
                    <span className="text-emerald-400 font-bold">Included</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-900/30 text-emerald-300 text-xs font-semibold">
                ✅ Single subscription: 100% automated, zero app download for customers, instant setup.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CONVERSION CALL TO ACTION */}
      <section className="py-20 relative overflow-hidden bg-emerald-950/30 border-t border-emerald-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Ready To Upgrade Your Local Business?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Chahe aap bakery ho, optical store, saree palace, salon, clinic ya restaurant — CustomerPilot setup lene me sirf 2 minute lagte hain.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/pricing">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl h-12 px-8 shadow-xl shadow-emerald-500/20">
                View Pricing & Select Plan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20a%20live%20demo%20of%20all%20services" target="_blank">
              <Button variant="outline" className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm rounded-xl h-12 px-6">
                💬 Chat on WhatsApp (+91 9033304707)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span>© 2026 CustomerPilot Technologies. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-300">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
