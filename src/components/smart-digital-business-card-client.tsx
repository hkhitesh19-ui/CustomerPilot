"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowLeft,
  QrCode,
  Star,
  Smartphone,
  MessageSquare,
  MapPin,
  Utensils,
  ExternalLink,
  Phone,
  Download,
  Clock,
  Camera,
  ShoppingBag
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

const CARD_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "How to create a smart digital visiting card with QR code for my business?",
    answerEn: "Go to your CustomerPilot dashboard, enter your store name, calling phone, Google Place ID, and online catalog links. In less than 2 minutes, your interactive digital business card and high-resolution printable QR code are ready for sharing.",
    questionHi: "Dukan ya business ke liye digital visiting card kaise banaye?",
    answerHi: "CustomerPilot dashboard par jayein, apni dukan ka naam, phone number, Google Place ID, aur digital menu link enter karein. System 2 minute me aapka unique digital card aur printable QR code tayyar kar deta hai."
  },
  {
    id: 2,
    questionEn: "What interactive features are included in a CustomerPilot digital business card?",
    answerEn: "It includes 1-Tap Save Contact (native VCF vCard phonebook download), Direct Google Reviews submission modal, WhatsApp quick chat, phone calling, Google Maps turn-by-turn navigation, and Online Ordering (Zomato/Swiggy/PDF menu) buttons.",
    questionHi: "CustomerPilot digital card me kya kya features hote hain?",
    answerHi: "CustomerPilot digital card me 1-Tap Save Contact (VCF vCard), Direct Google Reviews submission modal, WhatsApp quick chat, Phone calling, Google Maps navigation, aur Online Ordering links shamil hain."
  },
  {
    id: 3,
    questionEn: "How does this digital business card help increase 5-star Google Reviews?",
    answerEn: "The card connects directly to Google's official review modal (search.google.com/local/writereview?placeid=...). When customers tap 'Google Reviews', it bypasses map overviews and directly triggers the 5-star rating dialog on their phone, multiplying review conversions by 5X.",
    questionHi: "Digital visiting card se Google Reviews kaise badhte hain?",
    answerHi: "Humara card Google ke official direct review modal se judha hota hai. Customer ke tap karte hi seedha 5-star rating dialog khulta hai, jisse review likhne ka conversion 5X ho jata hai."
  },
  {
    id: 4,
    questionEn: "What happens if my shop phone number or address changes in the future?",
    answerEn: "Your card updates in real time on the cloud instantly. Your printed counter QR codes and NFC cards remain identical, saving you 100% of re-printing expenses.",
    questionHi: "Agar phone number ya address badal gaya toh kya naya card banana padega?",
    answerHi: "Bilkul nahi. Dashboard me change karte hi aapka digital card real-time me update ho jata hai. Aapka QR code wahi rehta hai, re-printing ka ek rupaya bhi kharch nahi hota."
  },
  {
    id: 5,
    questionEn: "Can I print the QR code on my counter standees, packaging boxes, and carry bags?",
    answerEn: "Absolutely yes! You get vector-grade printable QR codes in SVG and PNG formats, ready for counter acrylic stands, stickers, takeaway bags, and smart NFC tap cards.",
    questionHi: "Kya QR code ko counter standee, packaging aur carry bags par print kar sakte hain?",
    answerHi: "Haan, bilkul! Aapko high-resolution printable PNG aur SVG QR codes milte hain jo counter standees, delivery boxes, carry bags, aur NFC cards ke liye ready hote hain."
  }
]

// 100% Verified Ground-Truth Live Digital Card Examples (Zero dummy data)
const LIVE_CARD_EXAMPLES = [
  {
    id: "tasty-vadapav",
    name: "Tasty Vadapav",
    branch: "Atladara-Padra Road Branch",
    category: "Fast Food • Vadapav Specialist • Atladara",
    address: "Shop No. GF-15, Tower-A, Samanvay Status, Padra Road, Atladara, Vadodara, Gujarat 391410",
    shortAddress: "Samanvay Status, Atladara, Vadodara",
    phone: "+91 93281 12314",
    rating: "4.8",
    reviewCount: "120+",
    hours: "Open Daily • 9:00 AM – 9:00 PM",
    slug: "tasty-vadapav-atladara",
    bgAccent: "from-amber-500 to-orange-600",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    icon: Utensils,
    initials: "TV",
    specialties: ["Vadapav", "Dabeli", "Masala Chaas", "Swiggy & Takeaway"]
  },
  {
    id: "gujarat-photo",
    name: "Gujarat Photo Goods",
    branch: "Pro Cameras & Studio Lighting",
    category: "Camera Store • Pro Lenses • Drones",
    address: "Shop 1-4, Jayendrapuri Bhavan, Ashram Road, Ellisbridge, Ahmedabad, Gujarat 380006",
    shortAddress: "Ashram Road, Ellisbridge, Ahmedabad",
    phone: "+91 98250 37489",
    rating: "4.5",
    reviewCount: "406+",
    hours: "Open · Closes 7:30 PM",
    slug: "gujarat-photo-goods",
    bgAccent: "from-cyan-600 to-blue-700",
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-300",
    icon: Camera,
    initials: "GP",
    specialties: ["Sony α Cinema", "Nikon Mirrorless", "DJI Gimbals", "Instant WhatsApp Catalog"]
  },
  {
    id: "cake-connection",
    name: "Cake Connection",
    branch: "Designer Birthday & Wedding Cakes",
    category: "Artisan Bakery & Dessert Cafe",
    address: "Opp. Shreyas School, Manjalpur, Vadodara, Gujarat 390011",
    shortAddress: "Opp. Shreyas School, Manjalpur, Vadodara",
    phone: "+91 72038 24012",
    rating: "4.6",
    reviewCount: "689+",
    hours: "Open Daily • 9:00 AM – 11:00 PM",
    slug: "cake-connection",
    bgAccent: "from-pink-500 to-rose-600",
    badgeColor: "bg-pink-100 text-pink-900 border-pink-300",
    icon: ShoppingBag,
    initials: "CC",
    specialties: ["Designer Cakes", "Cupcakes", "WhatsApp Ordering", "Loyalty Rewards"]
  }
]

export function SmartDigitalBusinessCardClient() {
  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-rotate examples every 4.5 seconds unless hovered/paused
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % LIVE_CARD_EXAMPLES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused])

  const activeCard = LIVE_CARD_EXAMPLES[activeCardIndex]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between">
      {/* Dynamic Global Keyframe & Visual Styling matching Master Homepage */}
      <style>{`
        :root {
          --em: #10b981; --em-d: #059669; --sky: #0ea5e9; --ind: #6366f1; --ind-d: #4f46e5;
          --slate: #0f172a; --slate6: #475569; --slate5: #64748b; --slate4: #94a3b8;
          --line: #e2e8f0;
        }
        .grad-txt { background: linear-gradient(90deg, #0284c7, #06b6d4, #059669); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .btn-grad { background: linear-gradient(90deg, #0284c7, #059669); color: #fff; box-shadow: 0 10px 25px -8px rgba(2,132,199,.5); }
        .btn-grad:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .aurora { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
        .aurora b { position: absolute; display: block; border-radius: 50%; filter: blur(80px); }
        .aurora b:nth-child(1) { width: 500px; height: 500px; left: 50%; top: -80px; transform: translateX(-50%); background: rgba(6,182,212,.15); animation: fl 14s ease-in-out infinite; }
        .aurora b:nth-child(2) { width: 360px; height: 360px; right: -40px; top: 180px; background: rgba(16,185,129,.12); animation: fl 16s ease-in-out infinite 3s; }
        .aurora b:nth-child(3) { width: 340px; height: 340px; left: -60px; top: 240px; background: rgba(14,165,233,.12); animation: fl 18s ease-in-out infinite 6s; }
        @keyframes fl { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(25px,-20px) scale(1.06)} }
        .dots { position: absolute; inset: 0; z-index: 0; opacity: .4; background-image: radial-gradient(circle, rgba(6,182,212,.14) 1px, transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(180deg, #000 60%, transparent); pointer-events: none; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.9); border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; font-size: 13px; font-weight: 600; color: var(--slate6); box-shadow: 0 2px 8px rgba(0,0,0,.04); }
        .dot-live { position: relative; width: 8px; height: 8px; }
        .dot-live i { position: absolute; inset: 0; border-radius: 50%; background: #06b6d4; }
        .dot-live i:first-child { animation: ping 1.6s cubic-bezier(0,0,.2,1) infinite; opacity: .7; }
        @keyframes ping { 75%,100%{transform:scale(2.2);opacity:0} }
        .float-card { position: absolute; z-index: 20; background: rgba(255,255,255,.94); backdrop-filter: blur(12px); border-radius: 16px; padding: 10px 14px; box-shadow: 0 12px 30px -10px rgba(15,23,42,.18); display: flex; align-items: center; gap: 10px; animation: bob 5s ease-in-out infinite; border: 1px solid rgba(226,232,240,.9); pointer-events: none; user-select: none; }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fl1 { top: 20px; left: -20px; }
        .fl2 { bottom: 50px; right: -20px; animation-delay: 1.5s; }
        .fl3 { top: 48%; right: -25px; animation-delay: 2.8s; }
        @media(max-width:640px){ .fl1{left:-5px; top:10px} .fl2{right:-5px; bottom:20px} .fl3{display:none} }
        .phone-mockup { width: 310px; border-radius: 36px; background: #0f172a; padding: 10px; box-shadow: 0 25px 50px -12px rgba(6,182,212,.28), 0 0 0 1px rgba(255,255,255,0.1); }
        @media(min-width:640px){ .phone-mockup { width: 330px; } }
      `}</style>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
              <Link href="/signup">Create Your Card →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex-1">
        
        {/* ============ HERO SECTION WITH LIVE ROTATING EXAMPLES ============ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/80">
          <div className="aurora"><b></b><b></b><b></b></div>
          <div className="dots"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Value Proposition */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="badge">
                  <span className="dot-live"><i></i><i></i></span> India&apos;s #1 Smart Digital Business Card &amp; NFC Platform
                </span>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                  Smart Digital Business Card with QR Code &amp; <span className="grad-txt">Instant Google Reviews</span>
                </h1>

                <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                  Replace Paper Visiting Cards. Boost 5-Star Reviews. Direct WhatsApp Orders.
                </p>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Give every customer an interactive digital visiting card with 1-tap contact saving (.vcf), direct Google Reviews submission, and online menu catalogs — with zero app download required.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                  <Link
                    href="/signup"
                    className="btn-grad py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>Create Your Digital Card Free</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link
                    href={`/c/${activeCard.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 sm:py-4 px-5 text-sm sm:text-base font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center justify-center gap-2 transition w-full sm:w-auto"
                  >
                    <ExternalLink className="w-4 h-4 text-cyan-600" />
                    <span>Open Live Card: {activeCard.name}</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> 1-Tap Save to Phone Contacts</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> ₹0 Re-Printing Costs</span>
                  <span className="inline-flex items-center gap-1.5"><span className="text-emerald-600 font-bold">✓</span> Real-Time Cloud Updates</span>
                </div>
              </div>

              {/* Right Column: Live Rotating Interactive Phone Simulator */}
              <div 
                className="lg:col-span-5 flex flex-col items-center justify-center relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Rotating Example Selector Tabs with Accessible ARIA roles */}
                <div 
                  role="tablist"
                  aria-label="Live business card examples"
                  className="flex items-center gap-1.5 mb-5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs max-w-full overflow-x-auto"
                >
                  {LIVE_CARD_EXAMPLES.map((ex, idx) => (
                    <button
                      key={ex.id}
                      role="tab"
                      aria-selected={activeCardIndex === idx}
                      type="button"
                      onClick={() => setActiveCardIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                        activeCardIndex === idx
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <ex.icon className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{ex.name}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile Mockup with Floating Badges */}
                <div className="relative">
                  {/* Floating Badge 1: Top Left */}
                  <div className="float-card fl1">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-black shadow-xs">
                      ★
                    </div>
                    <div>
                      <small className="font-extrabold text-slate-900 block text-xs">{activeCard.rating} ★ Rating Synced</small>
                      <div className="text-[10px] text-slate-500 font-medium">Google Business Profile</div>
                    </div>
                  </div>

                  {/* Floating Badge 2: Bottom Right */}
                  <div className="float-card fl2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <small className="font-extrabold text-slate-900 block text-xs">1-Tap Save Contact</small>
                      <div className="text-[10px] text-slate-500 font-medium">Added to Phonebook (.vcf)</div>
                    </div>
                  </div>

                  {/* Floating Badge 3: Center Right */}
                  <div className="float-card fl3">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <small className="font-extrabold text-slate-900 block text-xs">Direct WhatsApp Chat</small>
                      <div className="text-[10px] text-slate-500 font-medium">Instant Orders &amp; Inquiry</div>
                    </div>
                  </div>

                  {/* Phone Device Container */}
                  <div className="phone-mockup">
                    <div className="rounded-[28px] overflow-hidden bg-white text-slate-900 shadow-inner flex flex-col">
                      
                      {/* Top Phone Status & Card Header */}
                      <div className={`p-4 bg-gradient-to-r ${activeCard.bgAccent} text-white space-y-2`}>
                        <div className="flex items-center justify-between text-[11px] opacity-90 font-medium">
                          <span>Live Digital Card</span>
                          <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">100% Real</span>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <div className="w-12 h-12 rounded-2xl bg-white text-slate-900 font-black text-lg flex items-center justify-center shadow-md">
                            {activeCard.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-base leading-tight truncate text-white">{activeCard.name}</h3>
                            <p className="text-[11px] text-white/90 truncate">{activeCard.branch}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                {activeCard.rating} ★ ({activeCard.reviewCount})
                              </span>
                              <span className="text-[10px] text-white/90">Verified Merchant</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Body Buttons & Details */}
                      <div className="p-4 space-y-3 bg-slate-50/60 text-xs">
                        {/* Quick 2-Column Action Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
                            <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-[11px] text-slate-900 truncate">Save Contact</div>
                              <div className="text-[9px] text-slate-500">1-Tap vCard</div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
                            <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-[11px] text-slate-900 truncate">Call Direct</div>
                              <div className="text-[9px] text-slate-500">{activeCard.phone}</div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-[11px] text-slate-900 truncate">WhatsApp</div>
                              <div className="text-[9px] text-slate-500">Direct order</div>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 shrink-0" />
                            <div className="min-w-0">
                              <div className="font-bold text-[11px] text-slate-900 truncate">Google Review</div>
                              <div className="text-[9px] text-slate-500">5-Star modal</div>
                            </div>
                          </div>
                        </div>

                        {/* Location Pill with shortAddress to prevent ellipsis clipping */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-[11px] text-slate-900">{activeCard.shortAddress}</div>
                            <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{activeCard.hours}</span>
                            </div>
                          </div>
                        </div>

                        {/* Specialties Chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {activeCard.specialties.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Click to open full card */}
                        <Link
                          href={`/c/${activeCard.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                        >
                          <span>Open Full Live Card</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">
                  ✦ Auto-rotating live cards · Hover to pause
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============ STATISTIC HIGHLIGHTS SECTION ============ */}
        <section className="py-12 bg-slate-50/70 border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-rose-600">88%</div>
                <div className="text-xs text-slate-600 font-medium">Paper Cards Thrown Away in 7 Days</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-cyan-600">1-Tap</div>
                <div className="text-xs text-slate-600 font-medium">Native vCard Phonebook Sync</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-amber-600">5X</div>
                <div className="text-xs text-slate-600 font-medium">Higher Google Review Conversion</div>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">₹0</div>
                <div className="text-xs text-slate-600 font-medium">Re-Printing Cost on Detail Updates</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 6 KEY CAPABILITIES GRID ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-cyan-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200">
                Everything on One Screen
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                6 Powerful Features That Paper Visiting Cards Can Never Do
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Your digital business card is not just a visiting card — it is an active sales, reputation, and ordering hub for your store.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 shadow-xs">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">1-Tap Save Contact (vCard)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Customers tap &quot;Save Contact&quot; and your store name, phone, address, and website download straight into their mobile phonebook without manual typing.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Direct Google Review Modal</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct integration with Google Place ID. Opens the official 5-star rating dialog directly on mobile screens, bypassing confusing search overviews.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">WhatsApp &amp; Call Quick Connect</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connect in 1 second. Customers start a WhatsApp chat or phone call with a pre-filled greeting message without having to save your phone number first.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
                  <Utensils className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Digital Menu &amp; Catalog Links</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Embed direct ordering touchpoints: Zomato, Swiggy, direct catalog links, or high-res PDF product menu catalogs for instant food and item browsing.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">GPS Directions &amp; Live Hours</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Turn-by-turn navigation via Google Maps deep linking, plus real-time business opening hours so customers never visit a closed store.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs hover:shadow-xl transition">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center text-pink-700 shadow-xs">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">Printable QR &amp; NFC Ready</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download high-resolution printable vector QR codes for counter acrylic stands, takeout bags, and smart NFC tap cards for effortless offline sharing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ COMPARISON TABLE ============ */}
        <section className="py-16 bg-slate-50/70 border-t border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-cyan-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200">
                Smart Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                CustomerPilot Smart Card vs. Traditional Paper Cards vs. Linktree
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Why Indian local retail stores, cafes, and professional services prefer a purpose-built commerce card over generic bio-link tools:
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                    <th scope="col" className="py-4 px-4 sm:px-6 font-bold">Feature</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-extrabold text-cyan-800 bg-cyan-50/80 border-x border-cyan-200">
                      CustomerPilot Smart Card
                    </th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-600">Paper Visiting Cards</th>
                    <th scope="col" className="py-4 px-4 sm:px-6 font-semibold text-slate-600">Linktree / Bio-Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">1-Tap Save Contact (vCard)</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-700 bg-cyan-50/40 border-x border-cyan-100">
                      Yes (Native VCF phonebook sync)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">No (Manual typing required)</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Partial / 3rd party tool</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Direct Google Review Modal</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-700 bg-cyan-50/40 border-x border-cyan-100">
                      Yes (Auto-opens 5-star dialog)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">No</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Basic external web link</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Digital Menu &amp; Food Ordering</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-700 bg-cyan-50/40 border-x border-cyan-100">
                      Yes (Zomato/Swiggy/PDF Catalog)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">No</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Generic text buttons</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Re-Printing Cost on Updates</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-700 bg-cyan-50/40 border-x border-cyan-100">
                      ₹0 (Updates in real-time online)
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">₹1,500 – ₹5,000 per print batch</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">₹0</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold">Brand Identity &amp; Modern Typography</td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-cyan-700 bg-cyan-50/40 border-x border-cyan-100">
                      Customized store logo &amp; colors
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Static paper print</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">Standardized layout</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ============ DUAL-LANGUAGE FAQ SECTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={CARD_FAQS} accentColor="cyan" theme="light" />
        </section>

        {/* ============ BOTTOM CALL TO ACTION ============ */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-cyan-50 to-white border border-cyan-200 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Upgrade Your Business to a Smart Digital Card Today
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              Get your interactive digital card link, download your printable QR code, and start sharing professional links on WhatsApp in 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white font-black text-base px-8 py-6 rounded-2xl shadow-xl shadow-cyan-600/20 hover:scale-105 transition-all">
                <Link href="/signup">
                  Create My Digital Card <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} CustomerPilot Inc. · Autonomous Merchant Retention SaaS · support@customerpilot.in</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-900 transition">Contact</Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
