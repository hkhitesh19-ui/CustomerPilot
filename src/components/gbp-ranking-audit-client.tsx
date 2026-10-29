"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Sparkles,
  MapPin,
  TrendingUp,
  Search,
  Star,
  Camera,
  Mic,
  Globe,
  Store,
  Layers,
  ChevronRight,
  Check,
  Clock,
  ShieldAlert,
  Loader2,
  ExternalLink,
  MessageSquare
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

const GBP_FAQS: DualLangFaqItem[] = [
  {
    id: 1,
    questionEn: "Why is a Brand New Google Business Profile (Track A) handled differently from an existing one (Track B)?",
    answerEn: "Brand new GBP listings face Google's strict 30-Day Sandbox Trust Barrier and video call verification hurdles. If a new profile receives 30 reviews in week one, Google immediately flags and suspends it for abnormal velocity. Existing profiles (#10-#50) are already verified and require aggressive 90-minute keyword optimization, category parity, and competitor spam purging.",
    questionHi: "Naye Google Business Profile (Track A) aur purane profile (Track B) ko alag tarike se kyu handle kiya jata hai?",
    answerHi: "Naye profile par Google ka 30 din ka Sandbox Trust Barrier hota hai. Agar pehle hi hafte me 30 reviews aa jayein toh Google account suspend kar deta hai. Jabki purana profile pehle se verified hota hai, use 90-minute surgery, category fix, aur competitor spam hatane ki zaroorat hoti hai."
  },
  {
    id: 2,
    questionEn: "How does the Zero-Ban WhatsApp Review Rule protect merchants from Google policy penalties?",
    answerEn: "Google strictly prohibits 'review gating' (filtering negative reviews before reaching Google) and bribing customers for 5-star ratings. CustomerPilot sends a direct Google review link asking for 'honest feedback with a photo' and awards loyalty stamps for the action itself. If a customer is displeased, a private 'HELP' reply keyword connects them directly to the owner before any public review is drafted.",
    questionHi: "CustomerPilot ka Zero-Ban WhatsApp Review Rule Google suspension se kaise bachata hai?",
    answerHi: "Google ki policy me 5-star mangna ya review gate karna illegal hai. CustomerPilot grahako se honest feedback aur order ki photo mangta hai. Saath hi agar grahak naraz ho, toh 'HELP' likhkar seedha dukan ke maalik se baat kar sakta hai, jisse negative review Google par jane se pehle hi solve ho jata hai."
  },
  {
    id: 3,
    questionEn: "What is the ₹500 Physical Signboard Upgrade rule for existing shops?",
    answerEn: "If an established store named 'Patel Clinic' suddenly edits its Google Maps title to 'Patel Clinic - Best Dental Implant Centre', Google detects unverified keyword stuffing and suspends the listing. Our SOP requires installing a permanent ₹500 acrylic sub-board with the keyword and updating the free Udyam MSME certificate first. Only with physical proof does the operator edit the title.",
    questionHi: "Purani dukan ke liye ₹500 Physical Signboard Upgrade rule kya hai?",
    answerHi: "Agar dukan ka asli board sirf 'Patel Clinic' hai aur aap GBP me 'Dental' jod doge toh account suspend ho jayega. Hamari SOP ke mutabiq merchant pehle ₹500 ka permanent acrylic sub-board lagwata hai aur Udyam certificate update karta hai, taaki Google ke verification bot ko physical proof mile."
  },
  {
    id: 4,
    questionEn: "How does the Competitor Spam Purge (Redressal Form) help my business rank higher?",
    answerEn: "In almost every Indian locality, top 5 competitors stuff unverified keywords into their Google listing titles (e.g., 'Aura Salon - Keratin Bridal Makeup Vadodara'). Normal 'Suggest an Edit' clicks are auto-rejected by Google bots. Our team photographs the competitor's actual storefront board and submits the official Google Business Redressal Complaint Form. Google strips their fake keywords in 5-7 days, moving your business 2-3 ranks higher effortlessly.",
    questionHi: "Competitor Spam Purge Form se meri dukan bina mehnat ke rank upar kaise aati hai?",
    answerHi: "Top 5 me jo competitors fake keywords laga kar baithe hote hain, unpar normal edit kaam nahi karta. Hamari team unke asli board ki photo lekar Google Business Redressal Form me submit karti hai. Google 5-7 din me unke fake keywords uda deta hai aur aapka business bina kisi extra kharche ke top 3 me aa jata hai."
  },
  {
    id: 5,
    questionEn: "How do Outside-GBP Mentions help my business get recommended by ChatGPT and Gemini AI (GEO)?",
    answerEn: "Generative AI engines (ChatGPT, Google Gemini, Perplexity) do not rank businesses based solely on Google Maps reviews; they scrape web discussions and authority articles. Our team publishes monthly 'Top 5 in [Locality]' specialty guides on Medium, Quora, and LinkedIn Pulse highlighting your best items, address, and mini-website, training AI models to recommend you as #1.",
    questionHi: "Outside-GBP Mentions se meri dukan ChatGPT aur Gemini AI search me kaise aati hai?",
    answerHi: "ChatGPT aur Gemini AI sirf Google Maps nahi, balki internet ke articles padhte hain. Hum mahine me ek baar Medium aur Quora par 'Top 5 in [Your Area]' guide post karte hain jisme aapki dukan #1 par hoti hai. Jab koi AI se recommendation mangta hai, toh AI aapka naam suggest karta hai."
  },
  {
    id: 6,
    questionEn: "What is the timeline to reach Top 3 Local Pack on Google Maps?",
    answerEn: "For Track B (Existing businesses #10 to #50), the 90-minute category surgery, competitor spam redressal, and WhatsApp photo review flywheel typically unlock Top 3 rankings within 30 to 45 days. For Track A (Brand new profiles), video verification takes 7 days followed by a 30-day safe sandbox warm-up, reaching Top 3 within 60 days.",
    questionHi: "Google Maps ke Top 3 Local Pack me aane me kitna time lagta hai?",
    answerHi: "Track B (Purani dukan jo #10-#50 par atki hai) 30 se 45 din me Top 3 me pahunchti hai. Track A (Nayi dukan) ko video verification aur 30-din ke safe sandbox warm-up ke baad 60 din ke andar Top 3 me lock kiya jata hai."
  }
]

const QUICK_PRESETS = [
  { name: "Cake Connection", category: "Bakery & Cake Shop", locality: "Manjalpur, Vadodara", reviews: 156 },
  { name: "Aura Unisex Salon", category: "Hair & Beauty Salon", locality: "Alkapuri, Vadodara", reviews: 42 },
  { name: "Chai & Chill Cafe", category: "Cafe & Quick Bites", locality: "Sayajigunj, Vadodara", reviews: 26 },
  { name: "Smile Dental Clinic", category: "Dental Clinic", locality: "Gotri, Vadodara", reviews: 48 }
]

export function GbpRankingAuditClient() {
  const [businessName, setBusinessName] = useState("Cake Connection")
  const [category, setCategory] = useState("Bakery & Cake Shop")
  const [locality, setLocality] = useState("Manjalpur, Vadodara")
  const [currentReviews, setCurrentReviews] = useState(156)
  const [isLoading, setIsLoading] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)
  const [loadingStep, setLoadingStep] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRunAudit = async (
    e?: React.FormEvent,
    override?: { name?: string; category?: string; locality?: string; reviews?: number }
  ) => {
    if (e) e.preventDefault()
    const nameToAudit = (override?.name !== undefined ? override.name : businessName).trim()
    const categoryToAudit = (override?.category !== undefined ? override.category : category).trim()
    const localityToAudit = (override?.locality !== undefined ? override.locality : locality).trim()
    const reviewsToAudit = override?.reviews !== undefined ? override.reviews : (Number(currentReviews) || 15)

    if (!nameToAudit) {
      setErrorMessage("Please enter your Business / Store Name to run the audit.")
      return
    }

    setErrorMessage(null)
    setIsLoading(true)
    setAuditResult(null)

    // Animated loading steps for dramatic credibility
    setLoadingStep("Connecting to Google Maps & Local Pack index...")
    await new Promise((r) => setTimeout(r, 400))
    setLoadingStep("Checking Google Sandbox Trust Barrier & Review Velocity...")
    await new Promise((r) => setTimeout(r, 450))
    setLoadingStep("Scanning Top 3 Competitors for Keyword Title Spam...")
    await new Promise((r) => setTimeout(r, 400))
    setLoadingStep("Evaluating Voice Search (AEO) & Hidden Attributes...")
    await new Promise((r) => setTimeout(r, 400))

    try {
      const res = await fetch("/api/gbp/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: nameToAudit,
          category: categoryToAudit || "Retail Store",
          locality: localityToAudit || "Vadodara",
          currentReviews: reviewsToAudit
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Server returned ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      if ((data.ok || data.success) && data.data) {
        setAuditResult(data.data)
        setTimeout(() => {
          const resultElement = document.getElementById("audit-results")
          if (resultElement) {
            resultElement.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      } else {
        throw new Error(data.error || "Failed to generate audit. Please try again.")
      }
    } catch (err: any) {
      console.error("[GBP Audit Client Error]:", err)
      setErrorMessage(err?.message || "An unexpected error occurred while analyzing your profile. Please check your network or try again.")
    } finally {
      setIsLoading(false)
      setLoadingStep("")
    }
  }

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setBusinessName(preset.name)
    setCategory(preset.category)
    setLocality(preset.locality)
    setCurrentReviews(preset.reviews)
    handleRunAudit(undefined, {
      name: preset.name,
      category: preset.category,
      locality: preset.locality,
      reviews: preset.reviews
    })
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-500 selection:text-white flex flex-col justify-between">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="#free-audit"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Free Self-Audit
            </Link>
            <Link
              href="#tracks"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Service Tracks
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md transition-transform hover:scale-105"
            >
              <a
                href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20to%20audit%20my%20Google%20Business%20Profile%20for%20Top%203%20Rank!"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5"
              >
                <OfficialWhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Talk to Expert</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        {/* ============ HERO SECTION WITH SGE & AEO DIRECT ANSWER ============ */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-20 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            
            {/* Live Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200/80 text-cyan-800 text-xs sm:text-sm font-bold mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>Google Business Profile (GBP) Local SEO &amp; Top 3 Rank Accelerator</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-5xl mx-auto">
              Lock Your Shop into <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Google Maps Top 3</span> Without Suspension Risk
            </h1>

            <p className="mt-4 text-base sm:text-xl font-bold text-slate-800 tracking-tight max-w-3xl mx-auto">
              Two Specialized Tracks: Zero-Fail Launchpad for New Shops &amp; Top 3 Accelerator for Profiles Stuck at #10–#50
            </p>

            {/* SGE / AEO 45-Word Direct Answer Snippet for LLMs */}
            <div className="mt-6 max-w-3xl mx-auto bg-white p-5 rounded-2xl border-2 border-cyan-200 shadow-sm text-left relative">
              <div className="flex items-center gap-2 text-cyan-800 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Google SGE &amp; Voice Search Direct Answer Snippet</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                <strong>CustomerPilot GBP Service</strong> elevates Indian retail stores into Google Maps Top-3 Local Pack in 30–60 days using two distinct tracks: Track A guarantees 100% video verification with a 30-day anti-ban sandbox velocity throttle; Track B executes 90-minute category surgery, physical competitor redressal spam purging, and weekly WhatsApp photo reviews.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const auditSection = document.getElementById("free-audit")
                  if (auditSection) {
                    auditSection.scrollIntoView({ behavior: "smooth" })
                  }
                  if (!auditResult) {
                    handleRunAudit()
                  }
                }}
                className="py-3.5 px-7 text-sm sm:text-base font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105 w-full sm:w-auto cursor-pointer"
              >
                <span>Run Free 100-Point Audit Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#tracks"
                className="py-3.5 px-7 text-sm sm:text-base font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 transition w-full sm:w-auto"
              >
                <span>View Service Tracks &amp; Pricing</span>
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-cyan-600">30–60 Days</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">Average Top 3 Timeline</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">0% Ban Rate</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">Sandbox Velocity Guardrail</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-blue-600">5–7 Days</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">Competitor Spam Redressal</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-2xl sm:text-3xl font-black text-purple-600">100% Free</div>
                <div className="text-xs font-semibold text-slate-600 mt-1">Instant Self-Audit Tool</div>
              </div>
            </div>

          </div>
        </section>

        {/* ============ LIVE INTERACTIVE AUDIT TOOL ============ */}
        <section id="free-audit" className="py-16 md:py-24 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Live Interactive Diagnostic
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                Audit Your Google Business Profile in 10 Seconds
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Enter your shop details below to calculate your 100-Point Health Score, detect Google Sandbox ban risks, and uncover competitor keyword spam.
              </p>

              {/* Presets */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Quick Test Demo:</span>
                {QUICK_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 transition"
                  >
                    {p.name} ({p.locality.split(",")[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* Audit Form Box */}
            <div className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleRunAudit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Business / Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cake Connection, Sharma Sweets"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Primary Category *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bakery, Hair Salon, Cafe, Dental Clinic"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Area / Locality &amp; City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manjalpur, Vadodara"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Approx Current Reviews Count
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="e.g. 15, 80"
                      value={currentReviews}
                      onChange={(e) => setCurrentReviews(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 text-base font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{loadingStep || "Analyzing Google Maps Index..."}</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>Run Free 100-Point Audit &amp; Competitor Scan</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* ============ RENDERED AUDIT REPORT CARD ============ */}
            {auditResult && (
              <div id="audit-results" className="mt-10 space-y-8 animate-in fade-in duration-500 scroll-mt-24">
                
                {/* 1. Score Summary Header */}
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-2 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                          {auditResult.business.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${auditResult.audit.statusColor}`}>
                          {auditResult.audit.statusLabel}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{auditResult.business.locality}</span>
                        <span>•</span>
                        <span>{auditResult.business.category}</span>
                        <span>•</span>
                        <span>Estimated Maps Rank (Algorithmic): #{auditResult.business.detectedRank}</span>
                      </p>
                    </div>

                    {/* Overall Score Circle */}
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="text-center">
                        <div data-testid="audit-overall-score" className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                          {auditResult.audit.overallScore}
                          <span className="text-xl font-normal text-slate-400">/100</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                          Estimated Score
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Recommended Action Track Banner */}
                  <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 border border-cyan-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <div className="text-xs font-black uppercase tracking-wider text-cyan-800">
                        Prescribed Operations Strategy
                      </div>
                      <div className="text-lg sm:text-xl font-black text-slate-900">
                        {auditResult.trackDetails.name} ({auditResult.trackDetails.timeline})
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium">
                        {auditResult.trackDetails.focus}
                      </p>
                    </div>
                    <a
                      href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20completed%20my%20GBP%20Audit%20and%20want%20to%20activate%20my%20recommended%20track!"
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition-all whitespace-nowrap"
                    >
                      {auditResult.trackDetails.cta} →
                    </a>
                  </div>

                  {/* 3. Six Diagnostic Pillars Breakdown */}
                  <div className="mt-8 space-y-4">
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-600" />
                      <span>6-Pillar Deep Audit Breakdown</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {auditResult.audit.pillars.map((pillar: any, pIdx: number) => (
                        <div key={pIdx} data-testid="audit-pillar-item" className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">{pillar.title}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              pillar.status === "OPTIMAL" ? "bg-emerald-100 text-emerald-800" :
                              pillar.status === "WARNING" ? "bg-amber-100 text-amber-800" :
                              "bg-rose-100 text-rose-800"
                            }`}>
                              {pillar.score}/{pillar.maxScore} pts
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {pillar.finding}
                          </p>
                          <div className="text-xs font-semibold text-cyan-700 bg-white p-2 rounded-lg border border-slate-200/80">
                            <strong>Action:</strong> {pillar.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Local Pack Competitor Matrix */}
                  <div className="mt-10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                      <div>
                        <h4 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Store className="w-4 h-4 text-cyan-600" />
                          <span>Local Pack Competitor Benchmark ({auditResult.business.locality})</span>
                        </h4>
                        <div className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          auditResult.isLiveGoogleData
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          <span>
                            {auditResult.isLiveGoogleData
                              ? "🟢 Live Google Maps Places Index (100% Real Competitors & Reviews)"
                              : "ℹ️ Algorithmic Local Pack Benchmark"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                        {auditResult.isLiveGoogleData ? "Live Google Maps Standings" : "Simulated Local Pack Standings"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {auditResult.competitors.map((comp: any, cIdx: number) => (
                        <div
                          key={cIdx}
                          data-testid="competitor-row"
                          className={`p-4 rounded-xl border transition ${
                            comp.isUserBusiness
                              ? "bg-cyan-50/70 border-2 border-cyan-400"
                              : "bg-white border-slate-200"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                                comp.rank <= 3 ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-slate-200 text-slate-700"
                              }`}>
                                #{comp.rank}
                              </span>
                              <div>
                                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                  <span>{comp.name}</span>
                                  {comp.isUserBusiness && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-600 text-white">
                                      Your Shop
                                    </span>
                                  )}
                                  {comp.isSpamTitle && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-300">
                                      Keyword Spammer
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>⭐ {comp.rating} ({comp.reviews} reviews)</span>
                                  <span>•</span>
                                  <span>Photos Ratio: {comp.photosRatio}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Redressal Opportunity Alert */}
                          {comp.redressalOpportunity && (
                            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                                <ShieldAlert className="w-4 h-4 text-rose-600" />
                                <span>Fast-Track Rank Opportunity: Competitor Violates Google Signboard Policy</span>
                              </div>
                              <p className="leading-relaxed">
                                {comp.redressalAction}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </section>

        {/* ============ SERVICE TRACKS & PACKAGING ============ */}
        <section id="tracks" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider">
                Product Packaging &amp; Pricing
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 tracking-tight">
                Two Specialized Service Tracks
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                We never treat brand-new unverified shops and established profiles with the same playbook. Select the track engineered for your current status.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* TRACK A */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-sm flex flex-col justify-between hover:border-cyan-400 transition">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                      Track A • 0 to Top 3
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Timeline: 60 Days</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      &quot;New Business Launchpad&quot;
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Designed specifically for Brand New Shops, Unverified Listings, or Newly Installed Boards.
                    </p>
                  </div>

                  <div className="py-4 border-y border-slate-100">
                    <div className="text-3xl font-black text-slate-900">
                      ₹5,999 <span className="text-sm font-semibold text-slate-500">Setup</span>
                    </div>
                    <div className="text-sm font-semibold text-cyan-700 mt-1">
                      + ₹1,999 / month (WhatsApp Automation &amp; Velocity Engine)
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700">
                      What&apos;s Included:
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Pre-Verification Signboard Engineering</strong>: Keyword approval before permanent board printing.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Zero-Fail 90-Sec Video Script</strong>: Operator coaches merchant to record street, board &amp; cash counter.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>30-Day Anti-Ban Sandbox Drip</strong>: Capped at 2–3 reviews/week to clear Google spam filters safely.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Free Udyam &amp; Top 4 Citations</strong>: MSME + Justdial, Sulekha, FB created before GBP listing.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Full Velocity Push (Week 5–8)</strong>: WhatsApp Loyalty counter stamp flywheel unlocked once 10+ reviews hit.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <a
                    href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20to%20subscribe%20to%20Track%20A:%20New%20Business%20Launchpad!"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <span>Activate Track A Launchpad</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* TRACK B */}
              <div className="bg-white rounded-3xl border-2 border-cyan-400 p-8 shadow-lg flex flex-col justify-between relative">
                <div className="absolute -top-3.5 right-8 bg-cyan-600 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
                  Most Popular for Local Retail
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Track B • #10–#50 to Top 3
                    </span>
                    <span className="text-xs font-semibold text-slate-500">Timeline: 30–45 Days</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      &quot;Top 3 Rank Accelerator&quot;
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Designed for Running Stores Already Verified but Stuck on Google Maps Page 2 or Page 3.
                    </p>
                  </div>

                  <div className="py-4 border-y border-slate-100">
                    <div className="text-3xl font-black text-slate-900">
                      ₹4,999 <span className="text-sm font-semibold text-slate-500">Setup</span>
                    </div>
                    <div className="text-sm font-semibold text-cyan-700 mt-1">
                      + ₹1,999 / month (WhatsApp Daily Engine &amp; Weekend Booster)
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700">
                      What&apos;s Included:
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>90-Minute Surgery (Day 1–5)</strong>: Top 3 competitor category copy-paste + 20 products &amp; 15 Q&amp;As.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Competitor Redressal Purge</strong>: Official complaint filed to strip fake keywords from Top 5 competitors.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>₹500 Sub-Board SOP</strong>: Safe physical title upgrade before editing GBP to prevent sudden suspensions.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>WhatsApp Daily Flywheel (6–10 Reviews/Wk)</strong>: Honest feedback with customer photo for bonus stamps.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Weekend Map Traffic Booster</strong>: Friday/Saturday throttled offer broadcasts drive driving direction clicks.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <a
                    href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20to%20subscribe%20to%20Track%20B:%20Top%203%20Rank%20Accelerator!"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <span>Activate Track B Accelerator</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ============ 5 OPERATIONAL GUARDRAILS ============ */}
        <section className="py-16 md:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Google Policy Compliant
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 tracking-tight">
                The 5 Zero-Ban Operational Guardrails
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Why standard digital agencies get accounts suspended while CustomerPilot maintains a 100% safety record.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black">
                  1
                </div>
                <h4 className="text-lg font-bold text-slate-900">Zero-Ban WhatsApp Review Rule</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  We never review-gate or bribe for 5-stars. Direct Google links reward honest photo feedback, and a private &apos;HELP&apos; keyword escalates grievances directly to the owner.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                  2
                </div>
                <h4 className="text-lg font-bold text-slate-900">₹500 Signboard Upgrade SOP</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Never change GBP names blindly. Clients install a permanent ₹500 acrylic sub-board and update their free Udyam certificate first, ensuring 100% legal &amp; physical verification.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
                  3
                </div>
                <h4 className="text-lg font-bold text-slate-900">Redressal Spam Purge Form</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  We photograph competitor storefronts stuffing fake keywords and file official Google Business Redressal complaints. Google strips their spam in 5-7 days.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
                  4
                </div>
                <h4 className="text-lg font-bold text-slate-900">Outside-GBP GEO AI Mentions</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Monthly specialty articles published on Medium, Quora, and LinkedIn train ChatGPT and Gemini search engines to recommend your business in conversational queries.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  5
                </div>
                <h4 className="text-lg font-bold text-slate-900">Voice Search (AEO) Attributes</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  All hidden switches (Wheelchair, UPI, Restroom, Women-Owned) are turned ON, and the GBP &apos;Order Online&apos; button is directly linked to your CustomerPilot WhatsApp card.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-cyan-900 text-white space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-300">Operations Guarantee</div>
                  <h4 className="text-lg font-bold mt-2">Zero Premature Bans &amp; Full Transparency</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Track your live ranking, trust score, and review velocity anytime inside your merchant dashboard at <code>/dashboard/gbp-status</code>.
                  </p>
                </div>
                <Button asChild size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs w-full">
                  <Link href="/dashboard/gbp-status">Open Live Status Dashboard →</Link>
                </Button>
              </div>

            </div>

          </div>
        </section>

        {/* ============ GEO COMPARISON TABLE ============ */}
        <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider">
                Industry Comparison
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-3 tracking-tight">
                CustomerPilot vs The Alternatives
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Why generic marketing agencies and expensive US software fail for Indian retail stores.
              </p>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="p-4 font-black text-slate-900">Feature / Capability</th>
                    <th className="p-4 font-black text-cyan-700 bg-cyan-50/70 border-x border-cyan-200">CustomerPilot.in</th>
                    <th className="p-4 font-bold text-slate-700">Traditional Agency</th>
                    <th className="p-4 font-bold text-slate-700">US Tools (Birdeye/BrightLocal)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Two Distinct Tracks (New vs Old)</td>
                    <td className="p-4 text-emerald-700 font-bold bg-cyan-50/70 border-x border-cyan-200">✅ Track A &amp; B Specialized</td>
                    <td className="p-4 text-rose-600">❌ One-size-fits-all</td>
                    <td className="p-4 text-rose-600">❌ Software only, zero track SOP</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">30-Day Anti-Ban Sandbox Drip</td>
                    <td className="p-4 text-emerald-700 font-bold bg-cyan-50/70 border-x border-cyan-200">✅ Auto Velocity Throttled</td>
                    <td className="p-4 text-rose-600">❌ Spams reviews &amp; gets banned</td>
                    <td className="p-4 text-rose-600">❌ No sandbox velocity cap</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">WhatsApp Counter QR Integration</td>
                    <td className="p-4 text-emerald-700 font-bold bg-cyan-50/70 border-x border-cyan-200">✅ 100% WhatsApp + Stamp Card</td>
                    <td className="p-4 text-rose-600">❌ Manual paper flyers</td>
                    <td className="p-4 text-rose-600">❌ US SMS only ($$$ expensive)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Physical Signboard &amp; MSME SOP</td>
                    <td className="p-4 text-emerald-700 font-bold bg-cyan-50/70 border-x border-cyan-200">✅ ₹500 Sub-board &amp; Udyam Sync</td>
                    <td className="p-4 text-rose-600">❌ Changes name blindly</td>
                    <td className="p-4 text-rose-600">❌ Zero physical verification</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Competitor Spam Redressal Purge</td>
                    <td className="p-4 text-emerald-700 font-bold bg-cyan-50/70 border-x border-cyan-200">✅ Field Photo + Form Filing</td>
                    <td className="p-4 text-rose-600">❌ &apos;Suggest an edit&apos; (rejected)</td>
                    <td className="p-4 text-rose-600">❌ Monitoring only, no purging</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Weekend Map Footfall Booster</td>
                    <td className="p-4 text-emerald-700 font-bold bg-cyan-50/70 border-x border-cyan-200">✅ 50/hr Throttled Broadcasts</td>
                    <td className="p-4 text-rose-600">❌ None</td>
                    <td className="p-4 text-rose-600">❌ None</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-bold text-slate-900">Monthly Cost</td>
                    <td className="p-4 text-emerald-700 font-bold bg-cyan-50/70 border-x border-cyan-200">₹1,999 / mo</td>
                    <td className="p-4 text-slate-700">₹15,000–₹25,000 / mo</td>
                    <td className="p-4 text-slate-700">$299–$499 / mo (₹25,000+)</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </section>

        {/* ============ DUAL LANGUAGE FAQS ============ */}
        <section className="py-16 md:py-24 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
                Everything You Need to Know
              </h2>
            </div>

            <DualLangFaq items={GBP_FAQS} />
          </div>
        </section>

        {/* ============ BOTTOM CALL TO ACTION ============ */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Ready to Lock Your Shop into <span className="text-cyan-400">Google Maps Top 3</span>?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
              Join local merchants across Vadodara, Gujarat and India who tripled their walk-in footfall without fear of Google account suspensions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="#free-audit"
                className="py-4 px-8 text-base font-bold bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl shadow-lg transition-transform hover:scale-105 w-full sm:w-auto"
              >
                Run Free GBP Audit Now
              </a>
              <a
                href="https://wa.me/919033304707?text=Hi%20CustomerPilot,%20I%20want%20to%20get%20started%20with%20Google%20Business%20Profile%20Top%203%20Rank!"
                target="_blank"
                rel="noreferrer"
                className="py-4 px-8 text-base font-bold bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-md transition w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <OfficialWhatsAppIcon className="w-5 h-5 fill-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <BrandLogo size="sm" />
            <span className="text-slate-500">| Google Business Profile Local SEO &amp; Top 3 Rank Accelerator</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} CustomerPilot.in. All rights reserved. Built for Local Retailers in India.
          </div>
        </div>
      </footer>
    </div>
  )
}
