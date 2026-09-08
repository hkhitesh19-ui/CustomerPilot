"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Sparkles, ArrowRight, Copy, CheckCircle2 } from "lucide-react"

const SAMPLE_REVIEWS = {
  five_star: {
    label: "5-Star Review (Positive)",
    emoji: "⭐⭐⭐⭐⭐",
    text: "Absolutely loved the chocolate truffle cake! It was fresh, moist, and the presentation was beautiful. My family was so happy. Will definitely order again from Cake Connection.",
    rating: 5,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    btnColor: "bg-amber-500 hover:bg-amber-600 text-white",
    selectedBg: "bg-amber-100 border-amber-400"
  },
  one_star: {
    label: "1-Star Review (Negative)",
    emoji: "⭐",
    text: "Ordered a chocolate truffle cake yesterday for my daughter's birthday. Delivery was late by 45 minutes and the frosting was completely melted. Very disappointed for such a special occasion.",
    rating: 1,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    btnColor: "bg-red-500 hover:bg-red-600 text-white",
    selectedBg: "bg-red-100 border-red-400"
  }
}

const TONES = [
  { key: "professional", label: "Empathetic & Professional" },
  { key: "warm", label: "Casual & Warm" },
  { key: "firm", label: "Formal & Resolution-Focused" },
]

const BUSINESS_TYPES = [
  { key: "bakery", label: "🎂 Bakery", category: "fresh cakes, pastries, and baked goods" },
  { key: "cafe", label: "☕ Cafe", category: "coffee, beverages, and light snacks" },
  { key: "restaurant", label: "🍽️ Restaurant", category: "food, dining experience, and hospitality" },
  { key: "salon", label: "💆 Salon", category: "hair styling, beauty treatments, and grooming services" },
]

export function AIReplySandbox() {
  const [selectedReview, setSelectedReview] = useState<"five_star" | "one_star">("five_star")
  const [customText, setCustomText] = useState(SAMPLE_REVIEWS.five_star.text)
  const [businessType, setBusinessType] = useState("bakery")
  const [generatedReply, setGeneratedReply] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [callsLeft, setCallsLeft] = useState<number | null>(null)

  const currentReview = SAMPLE_REVIEWS[selectedReview]

  const handleSelectReview = (key: "five_star" | "one_star") => {
    setSelectedReview(key)
    setCustomText(SAMPLE_REVIEWS[key].text)
    setGeneratedReply("")
    setError("")
  }

  const handleGenerate = async () => {
    if (!customText.trim()) return
    setLoading(true)
    setError("")
    setGeneratedReply("")

    try {
      const selectedBiz = BUSINESS_TYPES.find(b => b.key === businessType) || BUSINESS_TYPES[0]
      const res = await fetch("/api/demo/ai-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: currentReview.rating,
          comment: customText,
          businessName: "Cake Connection",
          businessCategory: selectedBiz.category
        })
      })

      const data = await res.json()
      if (data.ok) {
        setGeneratedReply(data.reply)
        if (typeof data.remaining === "number") setCallsLeft(data.remaining)
      } else if (res.status === 429) {
        setError("Demo limit reached! Sign up for unlimited AI replies.")
      } else {
        // Use fallback reply if available
        if (data.reply) setGeneratedReply(data.reply)
        else setError(data.error || "Generation failed. Please try again.")
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedReply) return
    await navigator.clipboard.writeText(generatedReply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200/80" id="ai-demo">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>🤖 Try It Live — No Signup Required</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            AI Review Reply Sandbox
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            See exactly what your customers see. Our Gemini AI doesn&apos;t write generic &quot;Thank you for your review&quot; — it reads the customer&apos;s specific words and crafts a contextual, SEO-optimized response in under 1 second.
          </p>
        </div>

        {/* Main Sandbox Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

          {/* Step 1 — Select Review Type */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">1</div>
              <span className="text-sm font-bold text-slate-800">Select Review Type</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {(Object.entries(SAMPLE_REVIEWS) as [("five_star" | "one_star"), typeof SAMPLE_REVIEWS.five_star][]).map(([key, review]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectReview(key)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${
                    selectedReview === key
                      ? `${review.selectedBg} border-opacity-100`
                      : `bg-white ${review.borderColor} border-opacity-40 hover:border-opacity-80`
                  }`}
                >
                  <div className={`text-lg mb-1`}>{review.emoji}</div>
                  <div className={`font-bold text-sm ${selectedReview === key ? review.color : "text-slate-700"}`}>{review.label}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{review.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Business Type + Review Text */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">2</div>
              <span className="text-sm font-bold text-slate-800">Your Business Type & Review Text</span>
              <span className="text-xs text-slate-400 font-medium">(Editable)</span>
            </div>
            <div className="grid sm:grid-cols-4 gap-2 mb-4">
              {BUSINESS_TYPES.map(biz => (
                <button
                  key={biz.key}
                  type="button"
                  onClick={() => setBusinessType(biz.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    businessType === biz.key
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {biz.label}
                </button>
              ))}
            </div>
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              rows={4}
              maxLength={600}
              placeholder="Paste any Google review here or edit the sample..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
            />
            <div className="flex justify-between mt-1.5">
              <span className={`text-xs ${currentReview.color} font-bold`}>
                Review type: {currentReview.label} ({currentReview.rating}/5 stars)
              </span>
              <span className="text-xs text-slate-400">{customText.length}/600</span>
            </div>
          </div>

          {/* Step 3 — Generate */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">3</div>
              <span className="text-sm font-bold text-slate-800">Generate with Gemini AI</span>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !customText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating AI Reply...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate with Gemini AI</span>
                </>
              )}
            </button>

            {callsLeft !== null && (
              <span className="ml-3 text-xs text-slate-400 font-medium">{callsLeft} demo generations remaining</span>
            )}

            {/* Output */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium"
                >
                  {error}{" "}
                  {error.includes("limit") && (
                    <Link href="/signup" className="font-black underline ml-1 hover:text-red-900">
                      Sign up free →
                    </Link>
                  )}
                </motion.div>
              )}

              {generatedReply && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5"
                >
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200/80 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-black text-indigo-800 uppercase tracking-wide">Gemini AI Generated Reply</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-50 transition"
                      >
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied!" : "Copy Reply"}
                      </button>
                    </div>
                    <p className="text-slate-800 text-sm leading-relaxed font-medium">{generatedReply}</p>
                    <div className="mt-4 pt-3 border-t border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-xs text-indigo-600 font-medium">
                        ✅ Context-aware · SEO-optimized · Issue-specific · Not a generic template
                      </p>
                      <Link
                        href="/signup"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all"
                      >
                        <span>Automate this for all reviews</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Trust Signal */}
        <div className="mt-8 text-center text-xs text-slate-500">
          <span className="font-bold text-slate-700">This exact AI engine</span> runs inside your dashboard for every Google review — automatically. No copy-paste needed.{" "}
          <Link href="/signup" className="text-indigo-600 font-bold hover:underline">Start your 3-day free trial →</Link>
        </div>
      </div>
    </section>
  )
}
