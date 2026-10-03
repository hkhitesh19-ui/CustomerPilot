"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Store,
  Star,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  MessageSquare
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { DualLangFaq, DualLangFaqItem } from "@/components/dual-lang-faq"

type CategoryKey = "bakery" | "dental" | "cafe" | "salon" | "electronics" | "restaurant"

interface CategoryPreset {
  id: CategoryKey
  label: string
  icon: string
  sampleStore: string
  sampleHighlight: string
}

const CATEGORIES: CategoryPreset[] = [
  {
    id: "bakery",
    label: "Bakery & Cakes",
    icon: "🎂",
    sampleStore: "Cake Connection",
    sampleHighlight: "Fresh Dutch Chocolate Truffle cake, eggless options & super polite staff"
  },
  {
    id: "dental",
    label: "Dental & Clinic",
    icon: "🦷",
    sampleStore: "Smile Studio Dental",
    sampleHighlight: "Painless root canal treatment, doctor explained clearly & very hygienic setup"
  },
  {
    id: "cafe",
    label: "Cafe & Coffee",
    icon: "☕",
    sampleStore: "The Roast Room",
    sampleHighlight: "Hazelnut Cold Brew was amazing, quiet ambience with fast WiFi for work"
  },
  {
    id: "salon",
    label: "Salon & Spa",
    icon: "💇",
    sampleStore: "Looks Luxe Studio",
    sampleHighlight: "Keratin hair spa was soothing, stylist Ramesh gave great styling recommendations"
  },
  {
    id: "restaurant",
    label: "Food & Dining",
    icon: "🍽️",
    sampleStore: "Tasty Vadapav",
    sampleHighlight: "Hot crispy jumbo batata vada with garlic chutney, authentic Mumbai taste"
  },
  {
    id: "electronics",
    label: "Retail & Electronics",
    icon: "📱",
    sampleStore: "Gujarat Photo Goods",
    sampleHighlight: "Sony Alpha camera demo was very thorough, best genuine prices in Vadodara"
  }
]

interface ReviewVariation {
  title: string
  tag: string
  text: string
}

function generateReviews(category: CategoryKey, storeName: string, highlight: string): ReviewVariation[] {
  const name = storeName.trim() || "this store"
  const detail = highlight.trim() || "friendly customer service and top quality"

  return [
    {
      title: "Keyword-Rich SEO Champion",
      tag: "Best for Google Maps Ranking",
      text: `Had a wonderful experience at ${name}! Their ${detail}. The ambience was welcoming and the entire team was courteous and prompt. Highly recommend ${name} to anyone looking for genuine quality and dependable service in the area. 5 stars all the way!`
    },
    {
      title: "Warm Experience & Staff Compliment",
      tag: "High Trust & Authenticity",
      text: `Visited ${name} today on a friend's recommendation and they completely exceeded my expectations. ${detail}. What truly stands out is how warmly the staff treats every customer. Will definitely be a regular visitor here!`
    },
    {
      title: "Short, Punchy & High-Impact",
      tag: "Fastest 1-Tap Submission",
      text: `Top notch experience at ${name}! ${detail}. Clean setup, quick billing, and consistently great quality. 10/10 recommended!`
    }
  ]
}

const FREE_TOOL_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "Is this AI Google Review Generator really 100% free to use?",
    answerEn:
      "Yes! This generator is completely free with zero credit card required and no daily usage limits. Local retail shops, restaurants, salons, and healthcare clinics can use it to draft authentic, keyword-optimized review suggestions anytime.",
    questionHi: "Kya ye AI Google Review Generator sach me 100% free hai?",
    answerHi:
      "Haan! Ye tool bilkul 100% free hai, koi credit card ya login ki jarurat nahi hai. Aap jitni baar chahein free me 5-star Google review variations generate kar sakte hain."
  },
  {
    id: 2,
    questionEn: "How do keyword-rich reviews help my store rank #1 on Google Maps?",
    answerEn:
      "Google's local search algorithm indexes words inside user reviews. When customer reviews mention specific products (e.g., 'eggless chocolate cake' or 'painless root canal'), Google Maps displays your business higher when local buyers search for those exact items.",
    questionHi: "Keyword-rich reviews se meri dukan Google Maps par #1 kaise aati hai?",
    answerHi:
      "Google Maps ka algorithm reviews ke andar ke keywords ko read karta hai. Jab customer review me 'fresh cake' ya 'dental cleaning' likhta hai, toh Google Maps un keywords par aapki shop ko top local pack me show karta hai."
  },
  {
    id: 3,
    questionEn: "Can CustomerPilot generate reviews for my customers automatically at the billing counter?",
    answerEn:
      "Yes! While this online page is a manual test generator, CustomerPilot's Smart Acrylic Counter Standee does this completely on autopilot. When walk-in customers scan the standee with their phone camera, our AI drafts personalized reviews directly on their WhatsApp in 3 seconds.",
    questionHi: "Kya CustomerPilot billing counter par customers ke liye automatically reviews likh sakta hai?",
    answerHi:
      "Bilkul! Ye page manual testing ke liye hai, par CustomerPilot ka Smart Counter Standee yahi kaam billing counter par autopilot par karta hai. Customer QR scan karta hai aur AI 3 second me unke phone me review draft kar deta hai."
  },
  {
    id: 4,
    questionEn: "Does CustomerPilot protect my business from public negative reviews?",
    answerEn:
      "Absolutely. CustomerPilot includes an automated Private Feedback Shield. 4 and 5-star ratings are seamlessly directed to Google Maps, while 1 to 3-star ratings are routed to a private merchant feedback dialog on your WhatsApp so you can resolve the complaint directly.",
    questionHi: "Kya CustomerPilot meri dukan ko public 1-star negative reviews se protect karta hai?",
    answerHi:
      "Haan, CustomerPilot me Private Feedback Shield hota hai. 4 aur 5 star review seedhe Google Maps par jaate hain, aur 1 se 3 star ka feedback privately aapke WhatsApp par aata hai taaki aapka public Google score safe rahe."
  }
]

export function FreeAiReviewGeneratorClient() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("bakery")
  const [storeName, setStoreName] = useState("Cake Connection")
  const [highlight, setHighlight] = useState(
    "Fresh Dutch Chocolate Truffle cake, eggless options & super polite staff"
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const [reviews, setReviews] = useState<ReviewVariation[]>(() =>
    generateReviews("bakery", "Cake Connection", "Fresh Dutch Chocolate Truffle cake, eggless options & super polite staff")
  )

  const handleApplyPreset = (preset: CategoryPreset) => {
    setSelectedCategory(preset.id)
    setStoreName(preset.sampleStore)
    setHighlight(preset.sampleHighlight)
    setIsGenerating(true)
    setTimeout(() => {
      setReviews(generateReviews(preset.id, preset.sampleStore, preset.sampleHighlight))
      setIsGenerating(false)
    }, 280)
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    setTimeout(() => {
      setReviews(generateReviews(selectedCategory, storeName, highlight))
      setIsGenerating(false)
    }, 320)
  }

  const handleCopy = (text: string, index: number) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Clipboard copy failed:", err)
      })
    }
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/smart-ai-google-review"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Smart Review Standee
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-all"
            >
              <Link href="/signup">Get Free Standee →</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        {/* ============ HERO SECTION ============ */}
        <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 bg-gradient-to-b from-amber-50/40 via-white to-white border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white px-4 py-1.5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">
                100% Free Online Tool • Zero Sign-Up Required
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Free AI Google Review Generator:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
                Create 5-Star Reviews in Seconds
              </span>
            </h1>

            {/* Direct Answer Snippet for SGE / Perplexity */}
            <div className="max-w-3xl mx-auto bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-xs text-left space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>AI Review Generator Snippet</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                CustomerPilot&apos;s Free AI Google Review Generator instantly drafts keyword-rich, authentic 5-star Google review variations for local shops, cafes, clinics, and salons. It eliminates blank screen anxiety for customers and boosts local Google Maps Local Pack ranking.
              </p>
            </div>
          </div>
        </section>

        {/* ============ INTERACTIVE GENERATOR WORKBENCH ============ */}
        <section className="py-10 sm:py-14 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Workbench Top Bar */}
            <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-600" />
                  <span>Customize Your Store &amp; Customer Experience</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick a retail category preset or enter your custom business details below:
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Maps Policy Safe</span>
              </div>
            </div>

            {/* Preset Buttons Strip */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/40">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Quick 1-Click Retail Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((preset) => {
                  const isActive = selectedCategory === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleGenerate} className="p-5 sm:p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="store-name-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Store / Brand Name
                  </label>
                  <input
                    id="store-name-input"
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Cake Connection, Smile Studio Dental"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    The name of your shop or service as it appears on Google Business Profile.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="experience-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Key Highlights / Experience Keywords
                  </label>
                  <input
                    id="experience-input"
                    type="text"
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    placeholder="e.g. Fresh Dutch chocolate cake, fast billing & polite staff"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    Specific specialties or services you want highlighted in the Google review.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Powered by Gemini Generative AI • Instant local SEO keyword injection</span>
                </div>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all w-full sm:w-auto"
                >
                  <RotateCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Drafting Reviews..." : "Generate 3 Review Variations"}</span>
                </Button>
              </div>
            </form>

            {/* Generated Review Output Cards */}
            <div className="p-5 sm:p-8 bg-slate-50/70 border-t border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ready-to-Copy 5-Star Google Review Variations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Copy Review&rdquo; to paste directly into your customer&apos;s Google review prompt:
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  3 Variations Ready
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {reviews.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Option {idx + 1}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900">{item.title}</h4>
                      <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {item.tag}
                      </span>

                      <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                        &ldquo;{item.text}&rdquo;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.text, idx)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                        copiedIndex === idx
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Review Text</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ AUTOMATION HOOK & UPSELL SECTION ============ */}
        <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-amber-50/30 to-white border-t border-b border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-2 border-amber-300 shadow-xl grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 inline-flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  Tired of Manually Generating Reviews?
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  Put This Entire Review Engine on Autopilot at Your Billing Counter.
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  With CustomerPilot&apos;s Smart Acrylic QR Standee, customers don&apos;t have to open websites or think of words. When they scan your counter QR or pay via UPI, our AI automatically crafts 3 personalized 5-star review drafts directly in their WhatsApp. They tap once, and it publishes directly to Google Maps!
                </p>

                <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Zero Customer Typing
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Private 1-3★ Negative Filter
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Free Counter Standee Included
                  </span>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm px-6 py-4 rounded-xl shadow-md w-full sm:w-auto transition-all"
                  >
                    <Link href="/smart-ai-google-review">
                      <span>Explore Smart Review Standee</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm px-6 py-4 rounded-xl w-full sm:w-auto shadow-xs"
                  >
                    <Link href="/signup">Start 3-Day Free Trial</Link>
                  </Button>
                </div>
              </div>

              <div className="md:col-span-4 bg-white p-6 rounded-2xl border border-amber-200 shadow-md space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center font-black text-2xl shadow-xs">
                  4.2x
                </div>
                <div className="font-extrabold text-base text-slate-900">
                  Average Review Growth
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Retail shops and restaurants using CustomerPilot collect an average of 42+ verified Google reviews every month compared to just 10 with ordinary QR stickers.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Policy Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ HOW IT HELPS LOCAL SEO ============ */}
        <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-amber-800 text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              Local SEO Science
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              How AI-Crafted Google Reviews Boost Your Store Ranking
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Why high-volume keyword-rich reviews outperform simple 5-star ratings on Google Maps:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Long-Tail Keyword Indexing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When customers mention items like &ldquo;custom birthday cake&rdquo; or &ldquo;teeth whitening&rdquo; in their reviews, Google Maps indexes those terms. Your store appears in search queries even when customers don&apos;t search for your brand name.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">Continuous Review Velocity</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google prioritizes businesses with consistent new reviews every week over stores that got 100 reviews two years ago and stopped. Consistent review flow signals an active, trusted business.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">High Conversion Trust Shield</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                93% of local consumers read Google reviews before visiting a new restaurant, dental clinic, or retail store. Descriptive 5-star reviews build instant consumer confidence.
              </p>
            </div>
          </div>
        </section>

        {/* ============ DUAL LANGUAGE FAQ ============ */}
        <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6">
          <DualLangFaq items={FREE_TOOL_FAQS} accentColor="amber" theme="light" />
        </section>
      </main>

      {/* Simple Clean Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CustomerPilot. All rights reserved. Made for Indian Retail Merchants.</p>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/smart-ai-google-review" className="hover:text-slate-900 transition">
              Smart AI Google Review
            </Link>
            <Link href="/ai-google-review-autoreply" className="hover:text-slate-900 transition">
              AI Auto-Reply
            </Link>
            <Link href="/smart-digital-business-card" className="hover:text-slate-900 transition">
              Digital Business Card
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
