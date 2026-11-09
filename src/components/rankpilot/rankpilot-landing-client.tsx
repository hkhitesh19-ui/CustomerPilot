"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import {
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Star,
  Award,
  Phone,
  MessageSquare,
  Calendar,
  Flame,
  Coins,
  Lock,
  ChevronRight,
  Zap,
  Building2,
  UtensilsCrossed,
  Stethoscope,
  Scissors,
  Eye,
  Camera,
  Check,
  AlertTriangle,
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"
import { calculateRevenueLeak, getClickShareByRank } from "@/lib/auditCalculator"

// Multi-vertical 10+10 demonstration data
const VERTICAL_DATA = {
  bakery: {
    name: "Bakery & Confectionery",
    icon: UtensilsCrossed,
    exampleMerchant: "Cake Connection, Manjalpur",
    products: [
      "Belgian Chocolate Truffle Cake",
      "Rasmalai Pista Tres Leches Cake",
      "Fresh Dutch Chocolate Cake",
      "Red Velvet Cream Cheese Cake",
      "Dark Chocolate Walnut Brownies",
      "Fresh Seasonal Fruit Cake",
      "Lotus Biscoff Cold Cheesecake",
      "Pineapple Chunks Classic Cake",
      "Blueberry Glaze Cold Cheesecake",
      "Ferrero Rocher Luxury Cake"
    ],
    services: [
      "Same Day 2-Hour Express Delivery",
      "Midnight Birthday Cake Delivery",
      "Custom 3D Designer Theme Cakes",
      "100% Pure Veg Eggless Baking",
      "Multi-Tier Wedding Cake Setup",
      "Corporate Office Bulk Orders",
      "Personalized Photo Print Cakes",
      "Walk-in Pastry & Dessert Tasting",
      "Anniversary Fondant Customization",
      "Handcrafted Gift Hamper Packing"
    ]
  },
  vet: {
    name: "Pet Clinic & Vet Care",
    icon: Stethoscope,
    exampleMerchant: "Pet Clinic Manjalpur",
    products: [
      "Royal Canin Puppy & Kitten Food",
      "Prescription Gastro & Renal Diets",
      "Anti-Tick & Flea Chewable Tablets",
      "Medicated Skin Allergy Shampoos",
      "Joint Support Calcium Supplements",
      "Orthopedic Dog Collars & Leashes",
      "Herbal Ear Cleansers & Eye Drops",
      "Puppy Teething Sticks & Toys",
      "Multi-Vitamin Coat Shine Tonics",
      "Odor Control Clumping Cat Litter"
    ],
    services: [
      "Dog & Puppy 7-in-1 Vaccination",
      "Cat Anti-Rabies & Tricat Vaccines",
      "Laser Dental Scaling & Polishing",
      "Minor & Major Soft Tissue Surgery",
      "Spaying & Neutering Procedures",
      "In-House Digital CBC Blood Tests",
      "Emergency Traumatic First Aid",
      "Senior Pet Geriatric Checkup",
      "Medicated Bath & Flea Grooming",
      "Tick Infestation Demodex Treatment"
    ]
  },
  dental: {
    name: "Dental Clinic & Implant",
    icon: Building2,
    exampleMerchant: "Apex Smile Dental Studio",
    products: [
      "Custom Night Guards for Teeth Grinding",
      "Fluoride Anti-Cavity Enamel Rinse",
      "Medicated Sensitivity Toothpaste",
      "Orthodontic Wax & Aligners Cleaner",
      "Interdental Specialty Flossers",
      "Post-Extraction Surgical Gauze Kits",
      "Home Teeth Whitening Bleach Gel",
      "Electric Sonic Plaque Toothbrush",
      "Denture Adhesive Fixative Creams",
      "Chlorhexidine Gum Protection Wash"
    ],
    services: [
      "Painless Single-Sitting Root Canal",
      "Invisible Clear Aligners Treatment",
      "Permanent Titanium Dental Implants",
      "Laser Teeth Whitening in 45 Mins",
      "Impacted Wisdom Tooth Extraction",
      "Ceramic Zirconia Dental Crowns",
      "Cosmetic Porcelain Smile Veneers",
      "Ultrasonic Plaque Scaling & Polishing",
      "Pediatric Kids Preventive Dentistry",
      "Full Mouth Digital OPG X-Ray Scan"
    ]
  },
  salon: {
    name: "Luxury Salon & Spa",
    icon: Scissors,
    exampleMerchant: "Elegance Hair & Skin Lounge",
    products: [
      "Keratin Smooth Sulfate-Free Shampoo",
      "Moroccan Argan Hair Repair Oil",
      "Hyaluronic Acid Hydrating Serum",
      "Vitamin C Glow Face Night Cream",
      "Deep Cleansing Charcoal Clay Mask",
      "Salon Heat Protection Styling Spray",
      "Anti-Dandruff Tea Tree Scalp Scrub",
      "Botanical Cuticle Nourishing Oil",
      "Organic Shaving Balm & Beard Elixir",
      "SPF 50 Matte Non-Greasy Sunscreen"
    ],
    services: [
      "Cysteine & Keratin Hair Smoothing",
      "Hydra-Facial Deep Pore Extraction",
      "Luxury Bridal Airbrush Makeover",
      "Balayage & Global Ammonia-Free Color",
      "Aromatherapy Stress Relief Body Spa",
      "Ice-Cool Relaxing Head Massage",
      "Gel Nail Extensions with Nail Art",
      "Under-Eye Dark Circle Therapy",
      "Beard Styling & Charcoal Detox",
      "Collagen Anti-Aging Skin Tightening"
    ]
  }
}

const FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How does RankPilot AI move a Google Business Profile from Page 10 to the Top 3 in 30 days?",
    answerEn: "RankPilot AI executes Google's 2026 Local Ranking Algorithm through a 3-stage precision pipeline: (1) Foundation Surgery with 10+10 Product/Service entity lockdown and legal DBA signboard verification, (2) Fraud-Proof WhatsApp Review & Photo Velocity with Gemini Vision OCR, and (3) Dynamic Next.js SSR Micro-Pages with Triple Schema (LocalBusiness + FAQPage + OfferCatalog) and 500m nearby landmark ingestion.",
    questionHi: "RankPilot AI kisi bhi dukaan ke Google Business Profile ko Page 10 se 30 din me Top 3 me kaise laata hai?",
    answerHi: "RankPilot AI Google ke 2026 Local Algorithm ko 3 stages me execute karta hai: (1) 10+10 Products aur Services ka entity lockdown aur ₹500 ka legal DBA sub-board, (2) WhatsApp se real photo reviews ka flow with Gemini Vision fraud detection, aur (3) Fast SSR Micro-Page jisme LocalBusiness + FAQPage + OfferCatalog schema aur 500m local landmarks shamil hote hain."
  },
  {
    id: 2,
    questionEn: "Is RankPilot AI 100% compliant with Google's Business Profile Policies (Zero-Ban)?",
    answerEn: "Yes, 100% policy-clean. RankPilot operates strictly through official Google Cloud Console OAuth 2.0 APIs or standard Agency Manager invitations. We enforce an absolute prohibition against review gating (no filtering), artificial review burst throttling (natural 3-6 reviews/day), and zero keyword stuffing in business titles without real physical signboard evidence.",
    questionHi: "Kya RankPilot AI Google ke rules aur policies ko 100% follow karta hai? Account ban to nahi hoga?",
    answerHi: "Haan, bilkul 100% safe aur policy-clean hai. CustomerPilot official Google OAuth APIs aur Agency Manager access use karta hai. Isme review gating bilkul mana hai, achanak fake reviews ka blast nahi hota (daily natural 3-6 verified reviews), aur bina physical board ke title me keyword spamming nahi hoti."
  },
  {
    id: 3,
    questionEn: "What is the 10+10 Dual Bestseller SEO Architecture?",
    answerEn: "Instead of stuffing generic keywords, RankPilot AI extracts the exact 10 High-Volume Physical Products (e.g. Belgian Chocolate Truffle Cake) and 10 High-Intent Actionable Services (e.g. Midnight Birthday Cake Delivery) for your vertical. This triggers Google's 'Sold here' and 'Reviews mention' justification flags on Google Maps.",
    questionHi: "10+10 Dual Bestseller SEO Architecture kya hota hai?",
    answerHi: "Aam keywords bharne ke bajaye, RankPilot aapke business ke 10 sabse zyada bikne wale physical products aur 10 sabse demand wali services ko select karta hai. Jab customer review deta hai to wahi exact keywords automatically inject hote hain, jisse Google Maps par 'Sold here' aur 'Reviews mention' ke verified green badges aate hain."
  },
  {
    id: 4,
    questionEn: "How does the Zero-Gap Expiration Auto-Renewal Google Post engine work?",
    answerEn: "Google Maps automatically drops your 'Offer' badge the minute an offer post expires, causing an immediate 15% to 22% drop in user actions. RankPilot's automated background cron tracks offer end dates and schedules a fresh rotational offer post 12 hours before expiration, ensuring 365-day continuous Google Maps offer visibility.",
    questionHi: "Zero-Gap Offer Post Expiration Auto-Renewal kaise kaam karta hai?",
    answerHi: "Google Maps par jaise hi kisi offer ki end date khatam hoti hai, Google listing se 'Offer' ka badge hata deta hai jisse traffic gir jata hai. RankPilot ka auto-cron offer expire hone se 12 ghante pehle naya offer ready karke schedule kar deta hai, taaki Google Maps par offer badge 365 din bina kisi gap ke active rahe."
  },
  {
    id: 5,
    questionEn: "How does the Monthly Revenue Leak calculation prove the value to merchants?",
    answerEn: "Using Google's verified click-share dropoff curve (Rank 1: 24%, Rank 2: 15%, Rank 3: 10%, Rank 18: 1.2%), RankPilot mathematically calculates the exact missed customer actions and multiplying by average order value (AOV). For example, a store at Rank #18 with ₹500 AOV is losing ₹37,000 every single month (₹4,44,000 per year).",
    questionHi: "Monthly Revenue Leak calculator se merchant ko kya fayda hota hai?",
    answerHi: "Google ke official click share data ke mutabiq Rank 1 ko 24% clicks milte hain aur Rank 18 ko sirf 1.2%. RankPilot exact hisab nikal kar batata hai ki kitne orders chhoot rahe hain. Agar kisi bakery ka average order ₹500 hai to Rank 18 par rehne se use har mahine ₹37,000 aur saal ka ₹4,44,000 ka direct loss ho raha hai."
  },
  {
    id: 6,
    questionEn: "Do I need technical skills or coding knowledge to run RankPilot AI?",
    answerEn: "Zero technical skills required. RankPilot AI is an automated, hands-free engine inside CustomerPilot. Our onboarding wizard takes under 5 minutes to set up your 10+10 keywords, generates your tabletop acrylic QR standee, and automates your weekly 3-post schedule effortlessly.",
    questionHi: "Kya RankPilot AI chalane ke liye coding ya technical knowledge ki zaroorat hai?",
    answerHi: "Bilkul nahi. RankPilot AI poori tarah automated hai. Sirf 5 minute ke onboarding setup me aapke 10+10 keywords configure ho jaate hain, counter par lagane wala standee auto-generate ho jata hai, aur weekly posts automatic schedule ho jaati hain."
  }
]

export function RankPilotLandingClient() {
  // Simulator State
  const [volume, setVolume] = useState<number>(2500)
  const [aov, setAov] = useState<number>(500)
  const [currentRank, setCurrentRank] = useState<number>(18)
  const [activeVertical, setActiveVertical] = useState<keyof typeof VERTICAL_DATA>("bakery")
  const [activePostTab, setActivePostTab] = useState<"tue" | "thu" | "sat">("tue")

  // Calculate Revenue Leak
  const leakData = useMemo(() => {
    return calculateRevenueLeak({
      monthlySearchVolume: volume,
      currentGridRankAvg: currentRank,
      averageOrderValueINR: aov,
      conversionRate: 0.20
    })
  }, [volume, currentRank, aov])

  const selectedVertical = VERTICAL_DATA[activeVertical]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. STICKY GLASSMORPHIC NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo size="sm" />
            <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              RankPilot AI™ v7.0
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-600 transition">How It Works</a>
            <a href="#revenue-calculator" className="hover:text-blue-600 transition">Revenue Leak</a>
            <a href="#dual-bestsellers" className="hover:text-blue-600 transition">10+10 Matrix</a>
            <a href="#post-engine" className="hover:text-blue-600 transition">3-Post Engine</a>
            <a href="#faqs" className="hover:text-blue-600 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/google-business-profile-ranking" className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2">
              Free 100-Pt Audit
            </Link>
            <Link href="/onboarding">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 shadow-md shadow-blue-500/20 rounded-xl cursor-pointer">
                Start 30-Day Sprint <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION — HIGH IMPACT VALUE PROPOSITION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-blue-50/25 to-slate-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f01a_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f01a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>RankPilot AI™ — Google Business Profile (GBP) Top-3 Local Domination Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Move Your Store from <span className="text-rose-600 line-through decoration-rose-400">Page 10</span> to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600">
                Google Maps Top 3
              </span>{" "}
              in 30 Days.
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto">
              Systematically lock into the Google Local 3-Pack for your <strong>Top 10 Products</strong> and <strong>Top 10 Services</strong>. Powered by 2026 Neural Matching, fraud-proof WhatsApp review verification, and dynamic SSR micro-pages with Triple Schema.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a href="#revenue-calculator">
                <Button size="lg" className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 cursor-pointer">
                  Calculate Your Revenue Leak <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <Link href="/onboarding">
                <Button size="lg" variant="outline" className="h-12 px-6 rounded-xl border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-base cursor-pointer">
                  Claim 30-Day Rank Accelerator
                </Button>
              </Link>
            </div>

            {/* TRUST BADGES ROW */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">100% Policy Clean</div>
                  <div className="text-[10px] text-slate-500">Zero-ban Google compliance</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2.5">
                <Award className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Top 3 Local Pack</div>
                  <div className="text-[10px] text-slate-500">30-day verified results</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">10+10 Dual Matrix</div>
                  <div className="text-[10px] text-slate-500">Products & services parity</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Zero-Gap Posts</div>
                  <div className="text-[10px] text-slate-500">365-day offer badge active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 60-SECOND REALITY CHECK: INTERACTIVE REVENUE LEAK CALCULATOR */}
      <section id="revenue-calculator" className="py-16 lg:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs px-3 py-1 font-bold">
              Playbook Section 4 — The Mathematical Proof
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              The 60-Second Reality Check: Monthly Revenue Leak
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Google Maps click-share drops from <strong>24% at Rank #1</strong> to just <strong>1.2% at Rank #18</strong>. See exactly how much money your current ranking is costing you every single month.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: SLIDERS & CONTROLS */}
            <div className="lg:col-span-5 bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700">Monthly Local Search Volume (V)</label>
                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {volume.toLocaleString("en-IN")} searches/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="250"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>500 (Niche Retail)</span>
                  <span>2,500 (Average City)</span>
                  <span>10,000 (Metro Hotspot)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700">Average Order Value (AOV)</label>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    ₹{aov.toLocaleString("en-IN")} per order
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={aov}
                  onChange={(e) => setAov(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>₹100 (Cafe / Quick Snack)</span>
                  <span>₹500 (Bakery / Gift)</span>
                  <span>₹3,000 (Clinic / Salon)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Your Current Google Maps Average Rank</label>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 7, 18, 25].map((r) => (
                    <button
                      key={r}
                      onClick={() => setCurrentRank(r)}
                      className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                        currentRank === r
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {r === 25 ? "#20+" : `#${r}`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Click share at <strong>Rank #{currentRank}</strong> is <strong>{(getClickShareByRank(currentRank) * 100).toFixed(1)}%</strong> (vs <strong>16.0% avg</strong> in Top 3).
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-snug">
                💡 <strong>The 20% Conversion Rule</strong>: 1 out of 5 customers who tap "Call", "Directions", or "Website" becomes a confirmed paying customer.
              </div>
            </div>

            {/* RIGHT: REAL-TIME REVENUE LEAK CARDS */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Top 3 Potential Monthly Actions</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{leakData.top3PotentialActionsMonthly}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">16.0% Click Share Average</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Your Current Monthly Actions</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{leakData.currentActionsMonthly}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">{(leakData.currentClickShare * 100).toFixed(1)}% Click Share</div>
                </div>
              </div>

              {/* CRITICAL REVENUE LEAK DISPLAY */}
              <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-600 text-white shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-5">
                  <div>
                    <span className="text-xs font-bold tracking-wider uppercase text-rose-100">
                      Monthly Walk-In & Order Loss
                    </span>
                    <div className="text-3xl sm:text-4xl font-black mt-1">
                      {leakData.lostOrdersMonthly} Lost Orders / Month
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold tracking-wider uppercase text-rose-100">
                      Missed Customer Actions
                    </span>
                    <div className="text-2xl font-black text-white mt-1">
                      {leakData.missedActionsMonthly} Actions
                    </div>
                  </div>
                </div>

                <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-rose-100 font-medium">Monthly Revenue Bleeding Out</span>
                    <div className="text-3xl font-extrabold mt-0.5 text-white">
                      ₹{leakData.monthlyRevenueLeakINR.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] text-rose-200">Lost every 30 days to competitors</span>
                  </div>

                  <div>
                    <span className="text-xs text-rose-100 font-medium">Annual Cumulative Revenue Loss</span>
                    <div className="text-3xl font-extrabold mt-0.5 text-amber-200">
                      ₹{leakData.annualRevenueLeakINR.toLocaleString("en-IN")}
                    </div>
                    <span className="text-[11px] text-rose-200">Total yearly revenue left on the table</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-rose-100">
                    {currentRank <= 3 ? "🎉 You are in the Top 3! Your revenue leak is ₹0." : "RankPilot AI can recover up to 100% of this revenue leak in 30 days."}
                  </span>
                  <Link href="/onboarding" className="w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto bg-white text-rose-700 hover:bg-slate-100 font-bold px-4 rounded-xl cursor-pointer shadow-md">
                      Plug This Leak Now <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 10+10 DUAL BESTSELLER ARCHITECTURE INTERACTIVE SHOWCASE */}
      <section id="dual-bestsellers" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-3 py-1 font-bold">
              Playbook Section 2 — 10+10 Dual Bestseller Matrix
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              The 10 Products + 10 Services Entity Parity
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Google Maps rewards listings that have high-density keyword coverage for both physical goods and actionable services. See how RankPilot AI maps your exact category:
            </p>

            {/* VERTICAL SELECTOR TABS */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {(Object.keys(VERTICAL_DATA) as Array<keyof typeof VERTICAL_DATA>).map((key) => {
                const vert = VERTICAL_DATA[key]
                const Icon = vert.icon
                return (
                  <button
                    key={key}
                    onClick={() => setActiveVertical(key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      activeVertical === key
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{vert.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* DUAL 10+10 DISPLAY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD A: 10 BESTSELLER PRODUCTS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">🛍️</span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Top 10 Bestseller Products</h3>
                    <div className="text-[11px] text-slate-500">Triggers Google "Sold here" justification badges</div>
                  </div>
                </div>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">10/10 Mapped</Badge>
              </div>

              <div className="space-y-2">
                {selectedVertical.products.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs hover:border-blue-300 transition">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold w-4">{idx + 1}.</span>
                      {p}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-white text-emerald-700 border-emerald-200">
                      High Volume
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD B: 10 HIGH-INTENT SERVICES */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm">🛠️</span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Top 10 High-Intent Services</h3>
                    <div className="text-[11px] text-slate-500">Triggers Google "Reviews mention" justification badges</div>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">10/10 Mapped</Badge>
              </div>

              <div className="space-y-2">
                {selectedVertical.services.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs hover:border-emerald-300 transition">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold w-4">{idx + 1}.</span>
                      {s}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-white text-blue-700 border-blue-200">
                      High Intent
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE GOOGLE BUSINESS POST DOMINANCE ENGINE SHOWCASE */}
      <section id="post-engine" className="py-16 lg:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-3 py-1 font-bold">
              Playbook Section 3.4 — Freshness Triad Engine
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Automated Weekly 3-Post Engine (Zero-Gap Continuity)
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              RankPilot AI generates and schedules 3 posts every week with real camera photos, 100–300 words SEO copy, and active CTAs. When an offer expires, our engine auto-renews it 12 hours prior so the Google Maps "Offer" badge stays active 365 days a year.
            </p>

            {/* POST TABS */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setActivePostTab("tue")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  activePostTab === "tue"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Tuesday: Product Spotlight
              </button>
              <button
                onClick={() => setActivePostTab("thu")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  activePostTab === "thu"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Thursday: Social Proof
              </button>
              <button
                onClick={() => setActivePostTab("sat")}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  activePostTab === "sat"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Saturday: Weekend VIP Offer
              </button>
            </div>
          </div>

          {/* ACTIVE POST INTERACTIVE PREVIEW */}
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
            {activePostTab === "tue" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                  <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-tr from-amber-900 to-amber-700 flex items-center justify-center text-4xl shadow-inner">
                    🎂
                  </div>
                  <div className="text-xs font-bold mt-3 text-amber-300">Fresh Belgian Chocolate Truffle Cake</div>
                  <div className="text-[11px] text-slate-400">₹650/- for 500g • 100% Pure Veg Eggless</div>
                </div>
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Auto-Generated Tuesday Product Spotlight (100–300 Words)</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <strong className="text-white">Craving authentic Belgian Chocolate Truffle Cake in Manjalpur, Vadodara?</strong>
                    <br /><br />
                    At Cake Connection (Opposite Eva The Mall), our signature Belgian Chocolate Truffle Cake is baked fresh daily using 54.5% rich imported cocoa, layered with velvety dark chocolate ganache, and crafted 100% pure veg eggless.
                    <br /><br />
                    📍 Near Darbar Chowkdi, Manjalpur. Open 10:00 AM – 11:30 PM. Same-day 2-hour delivery available across Vadodara!
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Word Count: 142 Words • 80-Char Hook Active</span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer">
                      CTA: ORDER VIA WHATSAPP
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activePostTab === "thu" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                  <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-tr from-blue-900 to-indigo-800 flex items-center justify-center text-4xl shadow-inner">
                    ⭐
                  </div>
                  <div className="text-xs font-bold mt-3 text-blue-300">5-Star Verified Google Review</div>
                  <div className="text-[11px] text-slate-400">Sneha Patel • Verified Customer via WhatsApp</div>
                </div>
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Auto-Generated Thursday Social Proof Post (Verified Review)</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <strong className="text-white">&quot;Best customized Rasmalai Cake in Manjalpur!&quot;</strong> — Sneha Patel
                    <br /><br />
                    &quot;Ordered a 2kg customized Rasmalai Pista cake for my son&apos;s 1st birthday at Eva The Mall banquet. The cake was super soft, not overly sweet, and delivered right on time. Every guest loved it!&quot;
                    <br /><br />
                    Thank you Sneha! We love baking happiness for your celebrations near GIDC Manjalpur.
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Word Count: 128 Words • Reverse-NLP Response Ready</span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer">
                      CTA: LEARN MORE
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activePostTab === "sat" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                  <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-tr from-rose-900 to-amber-800 flex items-center justify-center text-4xl shadow-inner">
                    🎁
                  </div>
                  <div className="text-xs font-bold mt-3 text-amber-300">Weekend VIP Celebration Offer</div>
                  <div className="text-[11px] text-slate-400">Coupon: WEEKENDVIP • Exp: Sunday 11:59 PM</div>
                </div>
                <div className="md:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Auto-Generated Saturday Limited Offer (Zero-Gap Auto Renewal)</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                    <strong className="text-white">Weekend VIP Special: Double Loyalty Stamps + Free Brownie!</strong>
                    <br /><br />
                    Pre-order any 1kg Designer Birthday Cake or Belgian Chocolate Cake this Saturday & Sunday and get <strong>Double Digital Stamps</strong> plus 1 complimentary Choco-Walnut Brownie!
                    <br /><br />
                    Use coupon code <code className="bg-slate-700 px-2 py-0.5 rounded text-amber-300">WEEKENDVIP</code> at counter or on WhatsApp. Valid till Sunday 11:59 PM!
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-rose-300 font-semibold">🔄 Auto-renews in 12h prior to expiry</span>
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer">
                      CTA: GET OFFER
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. THE 30-DAY STEP-BY-STEP ROADMAP TIMELINE */}
      <section id="how-it-works" className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-3 py-1 font-bold">
              Playbook Section 3 — 30-Day Day-by-Day Timeline
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              The 30-Day Top-3 Domination Pipeline
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              How RankPilot systematically transitions a low-ranking or brand new listing into an unshakeable Google Maps Local 3-Pack asset.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* STEP 1: DAYS 1 TO 7 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black">
                  DAYS 1 – 7
                </span>
                <span className="text-xs text-slate-400 font-bold">Stage 1</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Foundation Surgery & Entity Lockdown</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>100-Point Audit</strong> & Competitor Spy redressal purge against keyword spammers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Primary Category Lock</strong> + 4 high-relevance secondary categories.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>₹500 DBA Sub-Board</strong> physical verification to eliminate ban risk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>10+10 Catalog Seed</strong> into native Google Business Profile catalog.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Tabletop QR Standee</strong> deployment at billing counter.</span>
                </li>
              </ul>
            </div>

            {/* STEP 2: DAYS 8 TO 18 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                  DAYS 8 – 18
                </span>
                <span className="text-xs text-slate-400 font-bold">Stage 2</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Review Velocity & Fraud-Proof Flywheel</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>1-Tap Dual Chips</strong> on mobile review editor to guide customer keywords.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Gemini 2.5 Flash Vision OCR</strong> checks WhatsApp screenshots for draft button fraud.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>SHA-256 Hash Guard</strong> blocks duplicate image recycle scams.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Daily Velocity Pacing</strong> (3 to 6 reviews/day) to maintain sandbox trust.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>4-Part Reverse-NLP</strong> automated owner replies to reinforce entities.</span>
                </li>
              </ul>
            </div>

            {/* STEP 3: DAYS 19 TO 30 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  DAYS 19 – 30
                </span>
                <span className="text-xs text-slate-400 font-bold">Stage 3</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">SSR Micro-Pages, 500m Landmarks & CTR</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Next.js SSR Micro-Pages</strong> deployed at <code>/[city]/[slug]</code> in &lt;200ms.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Triple Schema Graph</strong>: LocalBusiness + FAQPage + OfferCatalog.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>500m Local Landmarks</strong> textual injection expands proximity radius to 5km+.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3-Post Weekly Engine</strong> active with zero-gap offer auto-renewal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>WhatsApp Driving Directions</strong> triggers genuine mobile Map engagement signals.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DUAL-LANGUAGE FREQUENTLY ASKED QUESTIONS */}
      <section id="faqs" className="py-16 lg:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <DualLangFaq
            items={FAQS}
            titleEn="Frequently Asked Questions (RankPilot AI)"
            titleHi="Frequently Asked Questions (RankPilot AI)"
            subtitleEn="Everything you need to know about locking into the Google Maps Top 3 in 30 days."
            subtitleHi="Dukaan ko 30 din me Google Maps Top 3 me laane ke baare me saare sawal aur jawab."
            accentColor="blue"
            theme="light"
          />
        </div>
      </section>

      {/* 8. ENTERPRISE CONVERSION FOOTER & CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs px-3 py-1 font-bold">
            Guaranteed Top 3 Local Pack Engine
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Ready to Stop Losing ₹37,000+ Every Month to Competitors?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join 450+ forward-thinking retailers and clinics dominating Google Maps Local 3-Pack with CustomerPilot&apos;s RankPilot AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/onboarding">
              <Button size="lg" className="h-13 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-500/30 cursor-pointer">
                Start Your 30-Day Rank Sprint <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/google-business-profile-ranking">
              <Button size="lg" variant="outline" className="h-13 px-8 rounded-xl border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-base cursor-pointer">
                Run Free 100-Point Audit
              </Button>
            </Link>
          </div>

          <div className="pt-8 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
            <span>✅ No Credit Card Required</span>
            <span>•</span>
            <span>✅ 5-Minute Fast Onboarding</span>
            <span>•</span>
            <span>✅ 100% Google Policy Compliant</span>
          </div>
        </div>
      </section>
    </div>
  )
}
