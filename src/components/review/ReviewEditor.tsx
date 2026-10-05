"use client"

import { useRef, useState } from "react"
import { Copy, Check, ExternalLink, Sparkles, Gift, ArrowLeft, Info, MapPin } from "lucide-react"
import { useSystemContent } from "@/hooks/useSystemContent"

export function ReviewEditor({ 
  merchant, 
  customer, 
  initialDraft,
  existingReviewText,
  draftOptions,
  bonusInfo
}: { 
  merchant: any, 
  customer: any, 
  initialDraft?: string,
  existingReviewText?: string | null,
  draftOptions?: { draft1: string; draft2: string } | null,
  bonusInfo?: {
    googleReviewBonus: number,
    photoBonus: number,
    hasPreviousPhoto?: boolean,
    rewardName?: string,
    stampsRequired?: number
  }
}) {
  const { getContent } = useSystemContent()
  const reviewBonus = bonusInfo?.googleReviewBonus ?? 2
  const photoBonus = bonusInfo?.photoBonus ?? 2
  const maxPossibleBonus = reviewBonus + photoBonus

  const defaultText = existingReviewText || initialDraft || `Ordered from ${merchant.name} today. Super fresh quality, loved the taste and packaging. Definitely recommended!`
  const [draft, setDraft] = useState(defaultText)
  const [selectedOption, setSelectedOption] = useState<"draft1" | "draft2">("draft1")
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(!!existingReviewText)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const googleLink = merchant.googleReviewLink 
    || (merchant.googlePlaceId ? `https://search.google.com/local/writereview?placeid=${merchant.googlePlaceId}` : "https://maps.google.com")

  // Robust multi-layered clipboard copy
  const performCopy = async (text: string): Promise<boolean> => {
    let success = false

    // 1. Try modern async Clipboard API FIRST while document is 100% focused
    if (typeof window !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        success = true
      } catch (err) {
        console.warn("[ReviewEditor] navigator.clipboard.writeText failed:", err)
      }
    }

    // 2. Direct synchronous selection of textarea fallback
    if (!success && textareaRef.current) {
      try {
        textareaRef.current.focus()
        textareaRef.current.select()
        textareaRef.current.setSelectionRange(0, text.length)
        success = document.execCommand('copy')
      } catch (_) {}
    }

    // 3. Off-screen temporary textarea fallback
    if (!success) {
      try {
        const temp = document.createElement('textarea')
        temp.value = text
        temp.setAttribute('readonly', '')
        temp.style.position = 'fixed'
        temp.style.top = '-9999px'
        temp.style.left = '-9999px'
        temp.style.opacity = '0'
        document.body.appendChild(temp)
        temp.focus()
        temp.select()
        temp.setSelectionRange(0, text.length)
        success = document.execCommand('copy')
        document.body.removeChild(temp)
      } catch (_) {}
    }

    setCopied(true)
    setTimeout(() => setCopied(false), 8000)
    return success
  }

  const handleManualCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    await performCopy(draft)
  }

  const handleCopyAndPostClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    // 1. MUST COPY FIRST before any navigation occurs
    await performCopy(draft)

    setSubmitted(true)

    // 2. Fire backend notification (records post + enqueues automated photo verification)
    fetch('/api/reviews/record-google-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customerId: customer?.id, 
        merchantId: merchant.id, 
        reviewText: draft, 
        rating: 5
      })
    }).catch(() => {})

    // 3. Open Google Maps in a new tab now that text is safely in clipboard
    try {
      window.open(googleLink, '_blank', 'noopener,noreferrer')
    } catch (_) {
      window.location.href = googleLink
    }
  }

  const walletUrl = `/q/wallet/${customer?.id || ""}`

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] flex flex-col items-center justify-start sm:py-8 sm:px-4 font-sans selection:bg-[#E8F0FE] selection:text-[#1A73E8]">
      {/* Google Review Native Modal Container */}
      <div className="w-full max-w-lg bg-white sm:border sm:border-[#DADCE0] sm:rounded-3xl shadow-xs overflow-hidden">
        
        {/* Top Google Native App Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-[#E8EAED] px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back()
                } else {
                  window.location.href = googleLink
                }
              }}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-[#F1F3F4] text-[#5F6368] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-medium text-[#202124] truncate tracking-tight">
                {merchant.name || "Cake Connection"}
              </h1>
              <p className="text-[11px] text-[#5F6368] truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#1A73E8]" />
                Google Business Profile Review
              </p>
            </div>
          </div>

          {/* CustomerPilot VIP Bonus Pill */}
          <div className="flex items-center gap-1.5 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#137333]" />
            <span>+{maxPossibleBonus} Bonus Stamps</span>
          </div>
        </header>

        <div className="p-5 sm:p-7 space-y-6">

          {/* Existing Review Warning (if editing) */}
          {existingReviewText && (
            <div className="bg-[#FEF7E0] border border-[#FEEFC3] rounded-xl p-3.5 text-xs text-[#7A4B04] space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#B06000] shrink-0 mt-0.5" />
                <span>Google allows 1 review per account. Clicking below will open your review in Edit mode — paste this text to update!</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setDraft(existingReviewText); setIsEditingExisting(true); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${isEditingExisting ? "bg-[#F4B400] text-slate-900" : "bg-white border border-[#FEEFC3] text-[#7A4B04]"}`}
                >
                  Use My Previous Review
                </button>
                {initialDraft && (
                  <button
                    type="button"
                    onClick={() => { setDraft(initialDraft); setIsEditingExisting(false); }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${!isEditingExisting ? "bg-[#1A73E8] text-white" : "bg-white border border-[#FEEFC3] text-[#7A4B04]"}`}
                  >
                    Use Fresh AI Draft
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dual AI Draft Options Pills (Google-style Filter Chips) */}
          {draftOptions && !isEditingExisting && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider block">
                Choose AI Review Angle:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption("draft1")
                    setDraft(draftOptions.draft1)
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    selectedOption === "draft1"
                      ? "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8] shadow-xs"
                      : "bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]"
                  }`}
                >
                  <span>🍰 Option 1: Product & Taste</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption("draft2")
                    setDraft(draftOptions.draft2)
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    selectedOption === "draft2"
                      ? "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8] shadow-xs"
                      : "bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]"
                  }`}
                >
                  <span>⚡ Option 2: Service & Packaging</span>
                </button>
              </div>
            </div>
          )}

          {/* Review Text Input Box (Google-style Rounded Box) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="google-review-textarea" className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider">
                {isEditingExisting ? "Your Review (Edit to update)" : "AI Generated Review (Tap to Edit)"}
              </label>

              {/* Quick 1-Click Copy Text Button */}
              <button
                type="button"
                onClick={handleManualCopy}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  copied 
                    ? "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]" 
                    : "bg-white hover:bg-[#F1F3F4] text-[#1A73E8] border-[#DADCE0]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#137333]" />
                    <span>Copied! ✅</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#1A73E8]" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative border border-[#DADCE0] rounded-2xl p-4 bg-white focus-within:border-[#1A73E8] focus-within:ring-2 focus-within:ring-[#1A73E8]/20 transition-all shadow-xs">
              <textarea
                ref={textareaRef}
                id="google-review-textarea"
                rows={5}
                className="w-full bg-transparent border-none p-0 text-[#202124] placeholder-[#80868B] focus:outline-none resize-none font-sans text-sm sm:text-base leading-relaxed"
                value={draft}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>

            {/* Visual Copy Feedback Alert */}
            {copied && (
              <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] rounded-xl flex items-center gap-2.5 text-xs text-[#137333] animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-[#137333] shrink-0" />
                <span>Text copied to clipboard! Just tap <strong>Paste</strong> when Google Maps opens.</span>
              </div>
            )}
          </div>

          {/* 1-Click Copy & Open Google Button (Google Blue Primary CTA) */}
          <button 
            type="button"
            onClick={handleCopyAndPostClick}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
            className={`w-full h-14 text-base font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-md ${
              copied 
                ? "bg-[#137333] hover:bg-[#0D652D] text-white shadow-[#137333]/20" 
                : "bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-[#1A73E8]/30 hover:shadow-lg"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Text Copied! Opening Google Maps...</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-white" />
                <span>{getContent('review_copy_button', isEditingExisting ? "Copy & Update on Google Maps" : "Copy & Post on Google Maps")}</span>
                <ExternalLink className="w-5 h-5 opacity-80 ml-1" />
              </>
            )}
          </button>

          {/* Live Digital Wallet Button on Submitted */}
          {submitted && (
            <div className="p-4 bg-[#E6F4EA] border border-[#CEEAD6] rounded-2xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex p-2 bg-white rounded-full text-[#137333] shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-[#137333] text-sm">Review Submitted! Bonus Added 🎉</h3>
                <p className="text-xs text-[#3C4043] mt-1">
                  We have credited your bonus stamps to your mobile VIP Wallet!
                </p>
              </div>
              <a
                href={walletUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#137333] hover:bg-[#0D652D] text-white font-bold text-sm shadow-md transition-colors no-underline"
              >
                <span>📱 View My Live Digital Wallet</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          <p className="text-center text-xs text-[#5F6368] leading-relaxed">
            {isEditingExisting 
              ? "💡 Google will open your previous review. Select the text, paste this new draft, and hit Post!" 
              : "After posting, our system will automatically credit bonus stamps to your VIP Wallet! 🎁"}
          </p>
        </div>

        {/* Clean Google-style Footer */}
        <footer className="border-t border-[#E8EAED] bg-[#F8F9FA] p-4 text-center space-y-1">
          <p className="text-xs text-[#5F6368]">
            Powered by <a href="/for-business" className="text-[#1A73E8] hover:underline font-semibold">CustomerPilot</a> 🚀
          </p>
          <p className="text-[11px] text-[#80868B]">
            Automated Google Review & Loyalty System for Local Merchants
          </p>
        </footer>
      </div>
    </div>
  )
}
