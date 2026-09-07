"use client"

import { useRef, useState } from "react"
import { Copy, Check, ExternalLink, Star, Camera, Sparkles, Gift } from "lucide-react"
import { useSystemContent } from "@/hooks/useSystemContent"

export function ReviewEditor({ 
  merchant, 
  customer, 
  initialDraft,
  existingReviewText,
  bonusInfo
}: { 
  merchant: any, 
  customer: any, 
  initialDraft?: string,
  existingReviewText?: string | null,
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

  const defaultText = existingReviewText || initialDraft || `The products were fresh, beautiful, and absolutely delicious. Highly recommended!`
  const [draft, setDraft] = useState(defaultText)
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
        
        {/* Merchant Header */}
        <div className="p-8 text-center border-b border-slate-800">
          <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700 mb-4 shadow-inner overflow-hidden">
             {merchant.logoUrl ? (
                <img src={merchant.logoUrl} alt={merchant.name} className="w-full h-full object-cover" />
             ) : (
                <span className="text-2xl text-emerald-400 font-bold">{merchant.name?.charAt(0) || "C"}</span>
             )}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{merchant.name}</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Hi {customer?.name || "VIP"} ❤️
          </p>

          {/* Stamp Rewards Banner */}
          <div className="mt-4 p-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-left">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Earn up to +{maxPossibleBonus} VIP Bonus Stamps!</span>
              </div>
              <p className="text-[11px] text-slate-400">
                ⭐ Review: <strong>+{reviewBonus} Stamps</strong> · 📸 Photo: <strong>+{photoBonus} Stamps</strong>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {existingReviewText && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200 flex flex-col gap-2">
              <div>
                {getContent('review_policy_notice', '📌 Google allows 1 review per account. Clicking below will open your review in Edit mode — simply paste the text to update!')}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setDraft(existingReviewText); setIsEditingExisting(true); }}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${isEditingExisting ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}
                >
                  {getContent('review_btn_previous', 'Use My Previous Review')}
                </button>
                {initialDraft && (
                  <button
                    type="button"
                    onClick={() => { setDraft(initialDraft); setIsEditingExisting(false); }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${!isEditingExisting ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300"}`}
                  >
                    {getContent('review_btn_fresh', 'Use Fresh AI Draft')}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-8 h-8 text-amber-400 fill-amber-400" />
            ))}
          </div>
          
          {/* Review Textarea */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {isEditingExisting ? "Your Review (Edit to update)" : "AI DRAFT (FEEL FREE TO EDIT)"}
              </label>

              {/* Quick 1-Click Copy Text Button */}
              <button
                type="button"
                onClick={handleManualCopy}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied! ✅</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              ref={textareaRef}
              id="review-draft-textarea"
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all leading-relaxed"
              style={{ fontSize: '16px' }}
              value={draft}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setDraft(e.target.value)}
            />

            {/* Visual Copy Feedback Alert */}
            {copied && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in duration-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Text copied to clipboard! Just tap <strong>Paste</strong> in Google Maps.</span>
              </div>
            )}
          </div>

          {/* Google Maps Photo Bonus Guidance (No Upload on CustomerPilot) */}
          <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-950 border border-teal-500/30 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
              <Camera className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-teal-300">
                  Want +{photoBonus} Extra Photo Bonus Stamps? 📸
                </span>
                <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-[10px] font-bold text-teal-400">
                  Total +{maxPossibleBonus}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When Google Maps opens, simply attach a photo of your purchase directly in your Google Review. Our AI automatically verifies it and adds your extra stamps!
              </p>
            </div>
          </div>

          {/* 1-Click Copy & Open Google Button */}
          <button 
            type="button"
            onClick={handleCopyAndPostClick}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
            className={`w-full h-14 text-base sm:text-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
              copied 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_-3px_rgba(16,185,129,0.7)]" 
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.7)]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Text Copied! Opening Google Maps...</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>{getContent('review_copy_button', isEditingExisting ? "Copy & Update on Google" : "Copy & Post to Google")}</span>
                <ExternalLink className="w-5 h-5 opacity-75 ml-1" />
              </>
            )}
          </button>

          {/* Post Feedback / Live Wallet Button */}
          {submitted && (
            <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-500">
              <div className="inline-flex p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Review Posted! Bonus Added 🎉</h3>
                <p className="text-xs text-emerald-300/80 mt-1">
                  We have credited your bonus stamps. Tap below to see your live collection status!
                </p>
              </div>
              <a
                href={walletUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition-colors no-underline"
              >
                <span>📱 View My Live Digital Wallet</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
          
          <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
            {isEditingExisting 
              ? "💡 Google will open your previous review. Select the text, paste this new draft, and hit Post!" 
              : "After posting, our system will automatically credit bonus stamps to your VIP Wallet! 🎁"}
          </p>
        </div>
      </div>
    </div>
  )
}

