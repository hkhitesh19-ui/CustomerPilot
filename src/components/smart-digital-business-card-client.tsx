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
  ShoppingBag,
  BadgeCheck,
  Bike,
  Instagram,
  Facebook,
  Navigation,
  Globe,
  Share2,
  Contact,
  ChevronRight,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Copy,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Store,
  Youtube
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

function OfficialWhatsAppIcon({ className = "w-5 h-5 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

const timesFont: React.CSSProperties = { fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }

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
    id: "cake-connection",
    name: "Cake Connection",
    slug: "cake-connection",
    tagline: "Cakes • Desserts • Flowers • Party Decor",
    logoUrl: "/uploads/1789267721286-IMG_20220502_WA0034.jpg",
    locationCol1: "Manjalpur",
    locationCol2: "Vadodara, Gujarat",
    hoursCol1: "Open Daily",
    hoursCol2: "9:00 AM – 12:00 AM",
    deliveryCol1: "Delivery",
    deliveryCol2: "Vadodara Only",
    phone: "+91 72038 24012",
    rawPhone: "917203824012",
    instagram: "CakeConnection.in",
    facebook: "CakeConnection.in",
    rating: "4.6",
    reviewCount: "689",
    isFood: true,
    icon: ShoppingBag,
    orderingPlatforms: [
      { label: "Website", color: "bg-blue-600", letter: "🌐" },
      { label: "WhatsApp", color: "bg-[#25D366]", letter: "💬" },
      { label: "Zomato", color: "bg-[#e23744]", letter: "z" },
      { label: "Swiggy", color: "bg-[#fc8019]", letter: "S" },
      { label: "EasyCater", color: "bg-[#232f3e]", letter: "EC" }
    ]
  },
  {
    id: "tasty-vadapav",
    name: "Tasty Vadapav",
    slug: "tasty-vadapav-atladara",
    tagline: "Fast Food • Vadapav Specialist • Atladara",
    logoUrl: "/uploads/tasty-vadapav-logo.png",
    locationCol1: "Atladara",
    locationCol2: "Padra Road, Vadodara",
    hoursCol1: "Open Daily",
    hoursCol2: "9:00 AM – 9:00 PM",
    deliveryCol1: "Takeaway",
    deliveryCol2: "Swiggy & Takeaway",
    phone: "+91 93281 12314",
    rawPhone: "919328112314",
    instagram: "tasty.vadapav",
    facebook: "tastyvadapav",
    rating: "4.0",
    reviewCount: "52",
    isFood: true,
    icon: Utensils,
    orderingPlatforms: [
      { label: "Website", color: "bg-blue-600", letter: "🌐" },
      { label: "WhatsApp", color: "bg-[#25D366]", letter: "💬" },
      { label: "Zomato", color: "bg-[#e23744]", letter: "z" },
      { label: "Swiggy", color: "bg-[#fc8019]", letter: "S" },
      { label: "Takeaway", color: "bg-[#059669]", letter: "🛍️" }
    ]
  },
  {
    id: "gujarat-photo",
    name: "Gujarat Photo Goods",
    slug: "gujarat-photo-goods",
    tagline: "Camera Store • Pro Lenses • Drones • Ahmedabad",
    logoUrl: "/uploads/gujarat-photo-goods-logo.svg",
    locationCol1: "Ashram Road",
    locationCol2: "Ahmedabad, Gujarat",
    hoursCol1: "Open Daily",
    hoursCol2: "10:30 AM – 7:30 PM",
    deliveryCol1: "Delivery",
    deliveryCol2: "Pan-India Shipping",
    phone: "+91 98250 37489",
    rawPhone: "919825037489",
    instagram: "gujaratphotogoods",
    facebook: "gujaratphotogoods",
    rating: "4.5",
    reviewCount: "406",
    isFood: false,
    icon: Camera,
    orderingPlatforms: [
      { label: "Nikon", color: "bg-[#eab308]", letter: "N" },
      { label: "Sony", color: "bg-[#0284c7]", letter: "α" },
      { label: "Canon", color: "bg-[#dc2626]", letter: "C" },
      { label: "DJI", color: "bg-[#0f766e]", letter: "DJI" },
      { label: "Store", color: "bg-blue-600", letter: "🌐" }
    ]
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

  // ⚡ 3-Day Free Trial Digital Card Generator State (Zero Signup)
  const [formData, setFormData] = useState({
    googleReviewLink: "",
    displayName: "",
    subCategories: "Cafe & Restaurant",
    phoneNumber: "",
    whatsappNumber: "",
    locationShort: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    zomatoUrl: "",
    swiggyUrl: "",
    websiteUrl: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdCard, setCreatedCard] = useState<{ success: boolean; slug: string; card?: any } | null>(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleAutofillDemo = () => {
    setFormData({
      googleReviewLink: "https://g.page/r/CbXxY-sample-review/review",
      displayName: "Sharma Sweets & Cafe",
      subCategories: "Cafe • Sweets & Snacks • Pure Veg",
      phoneNumber: "+91 90333 04707",
      whatsappNumber: "919033304707",
      locationShort: "Alkapuri, Vadodara, Gujarat",
      instagramUrl: "https://instagram.com/sharmasweetscafe",
      facebookUrl: "https://facebook.com/sharmasweetscafe",
      youtubeUrl: "https://youtube.com/@sharmasweets",
      zomatoUrl: "https://zomato.com/vadodara/sharma-sweets",
      swiggyUrl: "https://swiggy.com/restaurants/sharma-sweets-vadodara",
      websiteUrl: "https://sharmasweets.in",
    })
    setSubmitError(null)
  }

  const handleGenerateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.displayName.trim()) {
      setSubmitError("Please enter your Store / Business Name.")
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)

    // Helper to normalize social and platform links
    const normalizeSocial = (val: string, domain: string) => {
      const trimmed = val.trim()
      if (!trimmed) return undefined
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
      if (trimmed.includes(domain)) return `https://${trimmed}`
      return `https://${domain}/${trimmed.replace(/^@/, "")}`
    }

    try {
      const orderingLinks = []
      if (formData.websiteUrl.trim()) {
        const wUrl = formData.websiteUrl.trim().startsWith("http") ? formData.websiteUrl.trim() : `https://${formData.websiteUrl.trim()}`
        orderingLinks.push({ platform: "website", label: "Online Store", url: wUrl, color: "bg-blue-600" })
      }
      if (formData.whatsappNumber.trim()) {
        orderingLinks.push({ platform: "whatsapp", label: "WhatsApp Order", url: `https://wa.me/${formData.whatsappNumber.replace(/[^0-9]/g, "")}`, color: "bg-[#25D366]" })
      }
      if (formData.zomatoUrl.trim()) {
        orderingLinks.push({ platform: "zomato", label: "Zomato", url: normalizeSocial(formData.zomatoUrl, "zomato.com") || formData.zomatoUrl.trim(), color: "bg-[#e23744]" })
      }
      if (formData.swiggyUrl.trim()) {
        orderingLinks.push({ platform: "swiggy", label: "Swiggy", url: normalizeSocial(formData.swiggyUrl, "swiggy.com") || formData.swiggyUrl.trim(), color: "bg-[#fc8019]" })
      }

      const res = await fetch("/api/digital-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          subCategories: formData.subCategories.trim() || "Retail Store",
          phoneNumber: formData.phoneNumber.trim() || undefined,
          whatsappNumber: formData.whatsappNumber.trim() || undefined,
          locationShort: formData.locationShort.trim() || undefined,
          instagramUrl: normalizeSocial(formData.instagramUrl, "instagram.com"),
          facebookUrl: normalizeSocial(formData.facebookUrl, "facebook.com"),
          youtubeUrl: normalizeSocial(formData.youtubeUrl, "youtube.com"),
          googleReviewLink: formData.googleReviewLink.trim() || undefined,
          websiteUrl: formData.websiteUrl.trim() || undefined,
          orderingLinks,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate digital card. Please try again.")
      }

      setCreatedCard(data)
    } catch (err: any) {
      setSubmitError(err.message || "Failed to generate digital card.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyLiveLink = () => {
    if (!createdCard?.slug) return
    const fullUrl = `${typeof window !== "undefined" ? window.location.origin : "https://customerpilot.in"}/c/${createdCard.slug}`
    navigator.clipboard.writeText(fullUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

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
        .phone-mockup {
          width: 100%;
          max-width: 350px;
          border-radius: 50px;
          background: #0f172a;
          padding: 10px;
          box-shadow: 0 40px 90px -20px rgba(15,23,42,0.35), 0 0 0 1px rgba(255,255,255,0.12), 0 0 0 4px #1e293b;
          position: relative;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .phone-mockup:hover {
          transform: translateY(-4px);
          box-shadow: 0 50px 100px -25px rgba(6,182,212,0.28), 0 0 0 1px rgba(255,255,255,0.18), 0 0 0 4px #1e293b;
        }
      `}</style>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="#pricing"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Plans &amp; Pricing
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button asChild size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-transform hover:scale-105">
              <Link href="#create-card">Create Your Card →</Link>
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
                    href="#create-card"
                    className="btn-grad py-3.5 sm:py-4 px-6 sm:px-8 text-sm sm:text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto"
                  >
                    <span>Create Your Digital Card (3-Day Free Trial)</span>
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
                      onClick={() => {
                        setActiveCardIndex(idx)
                        setIsPaused(true)
                      }}
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

                {/* Phone Device Container */}
                <div className="phone-mockup">
                  <div className="rounded-[40px] overflow-hidden bg-gradient-to-b from-[#fbf8f2] via-[#f7f2e7] to-[#ede4d1] text-slate-900 shadow-inner flex flex-col border border-amber-200/50">
                    
                    {/* Top Phone Status Bar with Dynamic Island */}
                    <div className="pt-2.5 pb-2 px-5 flex items-center justify-between text-[11px] font-bold text-white bg-slate-950 select-none border-b border-white/10 shrink-0">
                      <span className="tracking-tight font-sans">9:41</span>
                      <div className="w-20 h-3.5 bg-black rounded-full flex items-center justify-end px-1.5 border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] opacity-90 font-sans">
                        <span>5G</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Authentic Live Digital Card Viewport (Scrollable inside Phone) */}
                    <div className="max-h-[530px] overflow-y-auto px-3.5 py-3 space-y-3 relative selection:bg-amber-200">
                      
                      {/* 1. Real Logo in White Box with Amber Border */}
                      <div className="flex justify-center pt-1">
                        <div className="w-36 h-18 sm:w-40 sm:h-20 rounded-2xl bg-white p-2 shadow-xs border-2 border-amber-300/80 flex items-center justify-center overflow-hidden">
                          {activeCard.logoUrl ? (
                            <img
                              src={activeCard.logoUrl}
                              alt={activeCard.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full rounded-xl bg-slate-900 text-amber-400 font-black text-xl flex items-center justify-center">
                              {activeCard.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Real Business Title with Verified Badge (Times New Roman) */}
                      <div className="text-center">
                        <div 
                          style={timesFont}
                          className="text-lg sm:text-[21px] font-bold text-slate-900 tracking-normal flex items-center justify-center gap-1.5 leading-tight"
                        >
                          <span data-testid="phone-store-name" className="phone-store-name">{activeCard.name}</span>
                          <BadgeCheck className="w-5 h-5 text-sky-500 fill-sky-500 text-white shrink-0" />
                        </div>
                        <p 
                          style={timesFont}
                          className="text-[11.5px] italic text-slate-700 tracking-normal mt-0.5"
                        >
                          {activeCard.tagline}
                        </p>
                      </div>

                      {/* 3. 3-Pill Status Bar (Times New Roman) */}
                      <div 
                        style={timesFont}
                        className="bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-xs p-2 grid grid-cols-3 divide-x divide-slate-100 text-center"
                      >
                        <div className="flex flex-col items-center px-1">
                          <div className="flex items-center gap-1 text-red-600 mb-0.5">
                            <MapPin className="w-3 h-3 fill-red-600 text-white shrink-0" />
                            <span className="font-bold text-[10.5px] text-slate-900 truncate max-w-full">
                              {activeCard.locationCol1}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-600 truncate max-w-full">
                            {activeCard.locationCol2}
                          </span>
                        </div>

                        <div className="flex flex-col items-center px-1">
                          <div className="flex items-center gap-1 text-red-600 mb-0.5">
                            <Clock className="w-3 h-3 text-red-600 stroke-[2.5] shrink-0" />
                            <span className="font-bold text-[10.5px] text-slate-900 truncate max-w-full">
                              {activeCard.hoursCol1}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-600 truncate max-w-full">
                            {activeCard.hoursCol2}
                          </span>
                        </div>

                        <div className="flex flex-col items-center px-1">
                          <div className="flex items-center gap-1 text-red-600 mb-0.5">
                            <Bike className="w-3 h-3 text-red-600 stroke-[2.5] shrink-0" />
                            <span className="font-bold text-[10.5px] text-slate-900 truncate max-w-full">
                              {activeCard.deliveryCol1}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-600 truncate max-w-full">
                            {activeCard.deliveryCol2}
                          </span>
                        </div>
                      </div>

                      {/* 4. Primary Action Buttons (2 cols + Location full width) */}
                      <div className="grid grid-cols-2 gap-1.5 font-sans">
                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/${activeCard.rawPhone}?text=Hello%20${encodeURIComponent(activeCard.name)}%2C%20I%20found%20your%20Digital%20Card`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs flex items-center justify-between group active:scale-[0.98] transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-xs">
                              <OfficialWhatsAppIcon className="w-4 h-4 fill-white" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="font-bold text-[11px] leading-tight text-slate-900">WhatsApp</div>
                              <div className="text-[9px] text-slate-500 truncate">Chat with Us</div>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>

                        {/* Call Now */}
                        <a
                          href={`tel:${activeCard.phone}`}
                          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs flex items-center justify-between group active:scale-[0.98] transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                              <Phone className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="font-bold text-[11px] leading-tight text-slate-900">Call Now</div>
                              <div className="text-[9px] text-slate-500 truncate font-mono">{activeCard.phone}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>

                        {/* Instagram */}
                        <a
                          href={`https://instagram.com/${activeCard.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs flex items-center justify-between group active:scale-[0.98] transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shrink-0 shadow-xs">
                              <Instagram className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="font-bold text-[11px] leading-tight text-slate-900">Instagram</div>
                              <div className="text-[9px] text-slate-500 truncate">Follow for Updates</div>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>

                        {/* Facebook */}
                        <a
                          href={`https://facebook.com/${activeCard.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs flex items-center justify-between group active:scale-[0.98] transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#1877F2] flex items-center justify-center shrink-0 shadow-xs">
                              <Facebook className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="font-bold text-[11px] leading-tight text-slate-900">Facebook</div>
                              <div className="text-[9px] text-slate-500 truncate">Like Our Page</div>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>

                        {/* Location (Full width 2 cols) */}
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(activeCard.name + " " + activeCard.locationCol1)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="col-span-2 p-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs flex items-center justify-between group active:scale-[0.98] transition"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center shrink-0 shadow-xs">
                              <Navigation className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="font-bold text-[11px] leading-tight text-slate-900">Location</div>
                              <div className="text-[9px] text-slate-500 truncate">Get Directions ({activeCard.locationCol1})</div>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </a>
                      </div>

                      {/* 5. Online Ordering Platforms / Store Catalog */}
                      <div className="pt-0.5">
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                          <div className="h-[1px] bg-amber-300/80 flex-1 max-w-[36px]" />
                          <div 
                            style={timesFont}
                            className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-800"
                          >
                            <ShoppingBag className="w-3 h-3 text-amber-600" />
                            <span>{activeCard.isFood ? "Online Ordering Platforms" : "Official Store & Catalog"}</span>
                          </div>
                          <div className="h-[1px] bg-amber-300/80 flex-1 max-w-[36px]" />
                        </div>

                        <div className="grid grid-cols-5 gap-1 font-sans">
                          {activeCard.orderingPlatforms.map((item) => (
                            <a
                              key={`${activeCard.id}-${item.label}`}
                              href={`/c/${activeCard.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-white/95 border border-amber-200/60 shadow-xs hover:shadow-sm transition flex flex-col items-center text-center group"
                            >
                              <div className={`w-7 h-7 rounded-full ${item.color} text-white flex items-center justify-center font-black text-[10px] shadow-xs mb-1 group-hover:scale-105 transition-transform`}>
                                {item.letter === "z" ? (
                                  <span className="font-black italic text-[10px]">z</span>
                                ) : item.letter === "S" ? (
                                  <span className="font-black text-[10px]">S</span>
                                ) : item.letter === "EC" ? (
                                  <span className="font-bold text-[8px] uppercase">EC</span>
                                ) : item.letter === "💬" ? (
                                  <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                                ) : item.letter === "🛍️" ? (
                                  <span className="text-[10px]">🛍️</span>
                                ) : typeof item.letter === "string" && item.letter.length <= 3 ? (
                                  <span className="font-black text-[9px] uppercase">{item.letter}</span>
                                ) : (
                                  <Globe className="w-3 h-3" />
                                )}
                              </div>
                              <span className="font-bold text-[8.5px] text-slate-800 leading-tight truncate w-full">
                                {item.label}
                              </span>
                              <span className="text-[7.5px] text-slate-500 mt-0.5 flex items-center justify-center">
                                Order &gt;
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>

                      {/* 6. Utility Cards (Google Reviews, Share Card, Scan QR) */}
                      <div style={timesFont} className="grid grid-cols-3 gap-1.5 pt-0.5">
                        {/* Google Reviews */}
                        <a
                          href={`/c/${activeCard.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-white/95 border border-amber-200/60 shadow-xs flex flex-col items-center text-center group hover:shadow-sm transition"
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center mb-0.5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                          </div>
                          <span className="font-bold text-[9px] text-slate-800 leading-tight">Google Reviews</span>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[9px] font-bold mt-0.5">
                            <span>{activeCard.rating}</span>
                            <Star className="w-2 h-2 fill-amber-500 text-amber-500" />
                          </div>
                          <span className="text-[7.5px] text-slate-500 font-medium">
                            {activeCard.reviewCount} Reviews &gt;
                          </span>
                        </a>

                        {/* Share Card */}
                        <a
                          href={`/c/${activeCard.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-white/95 border border-amber-200/60 shadow-xs flex flex-col items-center text-center group hover:shadow-sm transition"
                        >
                          <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-0.5">
                            <Share2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-[9px] text-slate-800 leading-tight">Share Card</span>
                          <span className="text-[7.5px] text-amber-700 font-medium mt-1">With Friends &gt;</span>
                        </a>

                        {/* Scan QR */}
                        <a
                          href={`/c/${activeCard.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-white/95 border border-amber-200/60 shadow-xs flex flex-col items-center text-center group hover:shadow-sm transition"
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center mb-0.5">
                            <QrCode className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-[9px] text-slate-800 leading-tight">Scan QR</span>
                          <span className="text-[7.5px] text-slate-500 font-medium mt-1">Save to Phone &gt;</span>
                        </a>
                      </div>

                      {/* 7. Sticky Save Contact Button */}
                      <div className="pt-1.5 sticky bottom-0 z-20 pb-0.5">
                        <Link
                          href={`/c/${activeCard.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3.5 rounded-xl bg-white/95 hover:bg-white active:scale-[0.98] text-slate-900 shadow-md border-2 border-amber-300 flex items-center justify-between font-bold text-xs tracking-wider uppercase transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                              <Contact className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-slate-900 font-black tracking-wider text-[11px]">
                              SAVE CONTACT
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-amber-600" />
                        </Link>
                      </div>

                    </div>

                    {/* Bottom Phone Home Indicator */}
                    <div className="py-2 bg-slate-50 flex justify-center border-t border-slate-200 shrink-0">
                      <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
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

        {/* ============ HOW IT WORKS WITH INFOGRAPHICS & ANIMATION ============ */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white via-cyan-50/30 to-white relative overflow-hidden border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 relative z-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-cyan-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200">
                Simple 3-Step Process
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                How Your Smart Digital Business Card Works
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                No apps to download. Zero re-printing costs. Here is how customers experience your store in 3 seamless steps:
              </p>
            </div>

            {/* 3-Step Infographics with Animated Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 -translate-y-8 z-0 opacity-40"></div>

              {/* Step 1 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-cyan-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      01
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      Step 1 • Touchpoint
                    </span>
                  </div>

                  {/* Infographic Visual: Counter QR & Phone Tap */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-50 to-slate-50 border border-cyan-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-20 rounded-xl bg-white border border-slate-300 shadow-sm p-2 flex flex-col items-center justify-center text-center">
                        <QrCode className="w-8 h-8 text-cyan-600" />
                        <span className="text-[8px] font-bold text-slate-700 mt-1">Scan Standee</span>
                      </div>
                      <div className="text-cyan-500 font-bold text-lg animate-pulse">➔</div>
                      <div className="w-16 h-20 rounded-xl bg-slate-900 border border-slate-700 shadow-md p-1.5 flex flex-col items-center justify-center text-white">
                        <Smartphone className="w-6 h-6 text-cyan-400 animate-bounce" />
                        <span className="text-[8px] font-bold text-slate-300 mt-1">Instant View</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    1. Tap NFC or Scan Counter QR
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Customer taps your smart NFC card or scans your billing counter acrylic QR standee with their phone camera. No mobile app download required.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-cyan-700 font-semibold">
                  <span>⚡ Opens in &lt; 1.5 seconds</span>
                  <span className="text-slate-400">Works on iOS &amp; Android</span>
                </div>
              </div>

              {/* Step 2 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      02
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Step 2 • 1-Tap Save
                    </span>
                  </div>

                  {/* Infographic Visual: vCard Syncing */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-slate-50 border border-emerald-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-sm w-full max-w-[200px] space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                          CC
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-900 truncate">Cake Connection</div>
                          <div className="text-[8px] text-slate-500">Contact Card (.vcf)</div>
                        </div>
                      </div>
                      <div className="bg-emerald-600 text-white rounded-lg py-1 px-2 text-[9px] font-bold flex items-center justify-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>Saved to Contacts</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    2. 1-Tap Save to Phone Contacts
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Customer taps &quot;Save Contact&quot;. Your store name, verified phone, address, and social links instantly download into their native phonebook (.vcf).
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>📱 100% Phonebook Sync</span>
                  <span className="text-slate-400">Zero typing errors</span>
                </div>
              </div>

              {/* Step 3 Infographic Card */}
              <div className="relative z-10 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      03
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Step 3 • Action
                    </span>
                  </div>

                  {/* Infographic Visual: Orders & Reviews */}
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50 to-slate-50 border border-indigo-100 flex items-center justify-center min-h-[120px] relative overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[200px]">
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
                        <MessageSquare className="w-4 h-4 text-emerald-600 mx-auto" />
                        <span className="text-[9px] font-bold text-slate-800 block">WhatsApp Order</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-center space-y-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                        <span className="text-[9px] font-bold text-slate-800 block">5★ Google Review</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-lg">
                    3. Direct WhatsApp Orders &amp; Reviews
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Customer connects directly via WhatsApp for orders and inquiries, or taps once to post a 5-star Google Review to boost your store ranking.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-indigo-700 font-semibold">
                  <span>⭐ 5X Review Conversion</span>
                  <span className="text-slate-400">Direct lifetime channel</span>
                </div>
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

        {/* ============ 3-DAY FREE TRIAL CARD GENERATOR & SCREENSHOT WALKTHROUGH ============ */}
        <section id="create-card" className="py-16 md:py-24 bg-gradient-to-b from-cyan-50/50 via-white to-slate-50/70 border-t border-slate-200/80 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
            
            {/* Header Badge & Title */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-1.5 text-cyan-800 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full bg-cyan-100/80 border border-cyan-300 shadow-xs">
                <Zap className="w-3.5 h-3.5 text-cyan-600 fill-cyan-600" /> Instant 3-Day Free Trial • Zero Signup Required
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Create Your Smart Digital Business Card in 60 Seconds
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                No complex signup or password needed. Simply enter your <strong>Google Review Short Link</strong>, Social Media profiles, and Online Ordering links. Your interactive digital card activates instantly with a <strong>3-Day Free Trial</strong>!
              </p>
            </div>

            {/* Step-by-Step Visual Screenshot Guide: Where to find your Google Review Short Link */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center font-black">
                    📍
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Step-by-Step Guide: How to Find Your Google Review Short Link
                    </h3>
                    <p className="text-xs text-slate-500">
                      Simple 3-step process to get your official review link from Google Business Profile
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Official Google Maps Method
                </div>
              </div>

              {/* 3 Visual Step Cards with Realistic Mockups */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Step 1 Visual Card */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800">
                        Step 1
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">Search on Google</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Search Your Store on Google
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Search your business or store name on Google Search or Maps using the registered Google account.
                    </p>
                  </div>

                  {/* Visual Mockup 1: Google Search Bar */}
                  <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2 text-[10px]">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium">
                      <span className="text-blue-500 font-bold">G</span>
                      <span className="truncate">Tasty Vadapav Atladara Vadodara</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50/80 px-2 py-1 rounded-md">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Your business on Google (Manager)</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 Visual Card */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Step 2
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">Manager Dashboard</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Click &quot;Ask for reviews&quot;
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      On your business profile dashboard, tap the <strong>&quot;Ask for reviews&quot;</strong> (or &quot;Get more reviews&quot;) button.
                    </p>
                  </div>

                  {/* Visual Mockup 2: Google Business Profile Actions */}
                  <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs grid grid-cols-2 gap-1.5 text-[9.5px]">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex flex-col items-center text-center">
                      <span>✏️ Edit profile</span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border-2 border-amber-400 text-amber-900 font-extrabold flex flex-col items-center text-center shadow-xs relative">
                      <span className="text-amber-500">⭐ Ask for reviews</span>
                      <span className="text-[8px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full mt-0.5 animate-pulse">Click Here 👈</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex flex-col items-center text-center">
                      <span>📢 Promote</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex flex-col items-center text-center">
                      <span>👥 Customers</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 Visual Card */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        Step 3
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">Instant Link</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Copy and Paste Your Short Review Link
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Click the <strong>&quot;Copy link&quot;</strong> button in the popup dialog and paste it in the form below.
                    </p>
                  </div>

                  {/* Visual Mockup 3: Google Review Modal Link */}
                  <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-xs space-y-2 text-[10px]">
                    <div className="text-slate-700 font-bold">Get more reviews</div>
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 font-mono text-[9px] text-slate-600 truncate">
                      https://g.page/r/CbXxY.../review
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 text-blue-700 font-bold text-[9.5px]">
                      <span>✓ Link Copied to clipboard</span>
                      <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8.5px]">Paste Below</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Dynamic Content: Created Success Card OR Generator Form */}
            {createdCard ? (
              <div className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center space-y-3 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                    🎉
                  </div>
                  <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs uppercase tracking-wider">
                    3-Day Free Trial Activated Successfully
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Your Smart Digital Business Card is Live!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Your digital business card is now live online. You can share this link with customers via WhatsApp, Instagram bio, or your counter QR code.
                  </p>
                </div>

                {/* Live Card Link & Action Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Live Digital Card Link
                    </span>
                    <a
                      href={`/c/${createdCard.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm sm:text-base font-bold text-cyan-700 hover:text-cyan-800 underline underline-offset-4 break-all"
                    >
                      {typeof window !== "undefined" ? `${window.location.origin}/c/${createdCard.slug}` : `https://customerpilot.in/c/${createdCard.slug}`}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                    <Button
                      onClick={handleCopyLiveLink}
                      variant="outline"
                      className="border-slate-300 hover:bg-white text-slate-800 font-bold text-xs rounded-xl flex-1 sm:flex-none"
                    >
                      {linkCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600 mr-1.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1.5 text-slate-500" /> Copy Link
                        </>
                      )}
                    </Button>
                    <Button
                      asChild
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl flex-1 sm:flex-none shadow-md"
                    >
                      <a href={`/c/${createdCard.slug}`} target="_blank" rel="noopener noreferrer">
                        Open Live Card <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* QR Code & Sharing Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                    <span className="text-xs font-bold text-slate-700">Scan or Print Your QR Code</span>
                    <div className="p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-md">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          typeof window !== "undefined" ? `${window.location.origin}/c/${createdCard.slug}` : `https://customerpilot.in/c/${createdCard.slug}`
                        )}`}
                        alt="Digital Business Card QR Code"
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Scan with any smartphone camera to open live card
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>3-Day Free Trial Notice</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Your card is 100% active and free for the next <strong>72 hours (3 days)</strong>. To keep this link live permanently after 3 days, simply subscribe starting at <strong>₹349 (6 Months)</strong> or <strong>₹499 (1 Year)</strong>. No automatic deductions or commitments.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Check out my new Smart Digital Business Card: ${typeof window !== "undefined" ? window.location.origin : "https://customerpilot.in"}/c/${createdCard.slug}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <OfficialWhatsAppIcon className="w-4 h-4 fill-white" /> Share on WhatsApp with Customers
                      </a>

                      <Button
                        onClick={() => {
                          setCreatedCard(null)
                          setFormData({
                            googleReviewLink: "",
                            displayName: "",
                            subCategories: "Cafe & Restaurant",
                            phoneNumber: "",
                            whatsappNumber: "",
                            locationShort: "",
                            instagramUrl: "",
                            facebookUrl: "",
                            youtubeUrl: "",
                            zomatoUrl: "",
                            swiggyUrl: "",
                            websiteUrl: "",
                          })
                        }}
                        variant="ghost"
                        className="w-full text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                      >
                        + Create Another Digital Card
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <form onSubmit={handleGenerateCard} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
                
                {/* Form Top Header with Demo Autofill */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      Merchant Digital Card Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter your store or brand details below — zero signup required
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAutofillDemo}
                    variant="outline"
                    size="sm"
                    className="border-cyan-300 bg-cyan-50/70 hover:bg-cyan-100/80 text-cyan-800 font-bold text-xs rounded-xl shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
                    Fill Demo Store (Try Instant)
                  </Button>
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>{submitError}</span>
                  </div>
                )}

                {/* PART 1: Google Review Link & Basic Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-700 font-bold">1</span>
                    <span>Google Review Link &amp; Business Name</span>
                  </div>

                  {/* Google Review Short Link (Highlighted) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Google Review Short Link
                      </span>
                      <span className="text-[11px] text-cyan-700 font-medium">Recommended for 5X Reviews</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                        ⭐
                      </div>
                      <input
                        type="url"
                        placeholder="e.g. https://g.page/r/CbXxY.../review or maps.app.goo.gl/..."
                        value={formData.googleReviewLink}
                        onChange={(e) => setFormData({ ...formData, googleReviewLink: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-amber-50/20 text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Copy your short link using the 3-step guide above and paste it here. This enables 1-tap 5-star review collection directly on your digital card.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Business Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Store / Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sharma Sweets &amp; Cafe"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Category / Business Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cafe • Bakery • Pure Veg"
                        value={formData.subCategories}
                        onChange={(e) => setFormData({ ...formData, subCategories: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Calling Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98250 12345"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>

                    {/* WhatsApp Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="919825012345 (with country code)"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>

                    {/* City / Location */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        Area &amp; City
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Alkapuri, Vadodara"
                        value={formData.locationShort}
                        onChange={(e) => setFormData({ ...formData, locationShort: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>
                  </div>
                </div>

                {/* PART 2: Social Media Links */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-700 font-bold">2</span>
                    <span>Social Media Links (Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Instagram */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Link / Username
                      </label>
                      <input
                        type="text"
                        placeholder="https://instagram.com/mybrand"
                        value={formData.instagramUrl}
                        onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>

                    {/* Facebook */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook Page Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://facebook.com/mybrand"
                        value={formData.facebookUrl}
                        onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>

                    {/* YouTube */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Channel Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/@mybrand"
                        value={formData.youtubeUrl}
                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>
                  </div>
                </div>

                {/* PART 3: Online Ordering & Catalog Links */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-700 font-bold">3</span>
                    <span>Online Ordering &amp; Delivery Links (Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Zomato */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-[#e23744] text-white text-[10px] font-black flex items-center justify-center">z</span>
                        <span>Zomato Link</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://zomato.com/..."
                        value={formData.zomatoUrl}
                        onChange={(e) => setFormData({ ...formData, zomatoUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>

                    {/* Swiggy */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded bg-[#fc8019] text-white text-[10px] font-black flex items-center justify-center">S</span>
                        <span>Swiggy Link</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://swiggy.com/..."
                        value={formData.swiggyUrl}
                        onChange={(e) => setFormData({ ...formData, swiggyUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>

                    {/* Website / Catalog */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-600" /> Website / Menu Catalog
                      </label>
                      <input
                        type="text"
                        placeholder="https://mywebsite.com or menu PDF"
                        value={formData.websiteUrl}
                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 bg-white text-slate-900 text-xs sm:text-sm font-medium transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Trial & Paywall Transparent Notice */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>100% Free for 3 Days:</strong> Your digital card goes live instantly upon generation. Continue uninterrupted after 3 days by subscribing to any flexible plan (starting from ₹349).
                    </span>
                  </div>
                  <span className="text-emerald-700 font-bold shrink-0">No Credit Card Needed</span>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full py-6 rounded-2xl btn-grad font-black text-sm sm:text-base shadow-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Generating Your Live Digital Card...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-white" /> Generate My 3-Day Free Trial Digital Card Now →
                    </>
                  )}
                </Button>

              </form>
            )}

          </div>
        </section>

        {/* ============ OFFICIAL PRICING PLANS SECTION ============ */}
        <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-white via-cyan-50/20 to-white relative overflow-hidden border-t border-b border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-cyan-700 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-200">
                Transparent &amp; Affordable Plans
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
                Simple, Honest Pricing for Every Business
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                No hidden charges. Instant setup in 2 minutes. Choose the plan that fits your retail store, clinic, cafe, or brand.
              </p>
            </div>

            {/* 3-Tier Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              
              {/* Plan 1: 6 Months (₹349) */}
              <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Starter Plan
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">6 Months Access</span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900">₹349</span>
                      <span className="text-sm font-semibold text-slate-400 line-through">₹699</span>
                    </div>
                    <div className="text-xs font-bold text-cyan-700 mt-1">
                      Just ~₹58 / month · Save 50%
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Ideal for new businesses and local stores wanting to test digital visiting cards and boost Google reviews.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>1-Tap Save Contact (vCard .vcf phonebook sync)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct 5-Star Google Reviews Submission Modal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>WhatsApp Chat &amp; Direct Calling Connect</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Google Maps Turn-by-Turn Navigation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>High-Resolution Printable QR Code (PNG &amp; SVG)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>6 Months Cloud Hosting with Real-Time Edits</span>
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full py-5 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm shadow-xs hover:bg-slate-50 transition">
                  <Link href="/signup">
                    Choose 6 Months (₹349) →
                  </Link>
                </Button>
              </div>

              {/* Plan 2: 1 Year (₹499) - HIGHLIGHTED / POPULAR */}
              <div className="p-7 sm:p-8 rounded-3xl bg-white border-2 border-cyan-500 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between space-y-6 relative transform md:-translate-y-2">
                {/* Popular Ribbon */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md whitespace-nowrap">
                  ⭐ Most Popular • Best Annual Value
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Pro Annual Plan
                    </span>
                    <span className="text-[11px] font-bold text-cyan-700">12 Months (1 Year)</span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900">₹499</span>
                      <span className="text-sm font-semibold text-slate-400 line-through">₹1,199</span>
                    </div>
                    <div className="text-xs font-extrabold text-emerald-600 mt-1">
                      Just ~₹41 / month · Billed Annually (Save 58%)
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      The complete commerce &amp; reputation hub for retail stores, cafes, bakeries, salons, and clinics.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2 font-bold text-cyan-800">
                      <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                      <span>Everything in 6 Months Plan +</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Online Ordering Links (Zomato / Swiggy / Catalog)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Social Media Links (Instagram, Facebook, YouTube)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Printable Counter Acrylic Standee Templates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>1 Full Year Cloud Hosting with Instant Edits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Priority WhatsApp &amp; Email Support</span>
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full py-5 rounded-2xl btn-grad font-black text-sm shadow-lg hover:scale-[1.02] transition">
                  <Link href="/signup">
                    Get 1 Year Plan (₹499) →
                  </Link>
                </Button>
              </div>

              {/* Plan 3: Lifetime Access (₹1499) - BEST VALUE */}
              <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      👑 Lifetime Deal
                    </span>
                    <span className="text-[11px] font-bold text-amber-600">Zero Renewal Fees</span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-slate-900">₹1499</span>
                      <span className="text-sm font-semibold text-slate-400 line-through">₹3,999</span>
                    </div>
                    <div className="text-xs font-bold text-amber-700 mt-1">
                      One-Time Payment · Pay Once, Use Forever
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      For established merchants who never want to worry about annual renewals or recurring costs ever again.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Unlimited Lifetime Cloud Hosting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Everything in 1 Year Plan Included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero Annual Renewal Fees Forever</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Unlimited Real-Time Profile &amp; Menu Updates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Vector Standee &amp; Smart NFC Tap Card Files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>VIP 1-on-1 Onboarding Assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All Future Card Features &amp; Upgrades Included</span>
                    </div>
                  </div>
                </div>

                <Button asChild size="lg" className="w-full py-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md hover:scale-[1.02] transition">
                  <Link href="/signup">
                    Claim Lifetime Deal (₹1499) →
                  </Link>
                </Button>
              </div>

            </div>

            {/* Reassurance Trust Strip */}
            <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Instant Activation in 2 Minutes</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Secure UPI &amp; Cards Payment</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>₹0 Re-Printing Costs Forever</span>
              </div>
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
