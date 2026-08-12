"use client"

import { useRef, useState } from "react"
import { Copy, Check, ExternalLink, Star, ChevronRight } from "lucide-react"
import { useSystemContent } from "@/hooks/useSystemContent"

export function ReviewEditor({ 
  merchant, 
  customer, 
  initialDraft,
  existingReviewText
}: { 
  merchant: any, 
  customer: any, 
  initialDraft?: string,
  existingReviewText?: string | null
}) {
  const { getContent } = useSystemContent()
  const defaultText = existingReviewText || initialDraft || `The products were fresh, beautiful, and absolutely delicious. Highly recommended!`
  const [draft, setDraft] = useState(defaultText)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [isEditingExisting, setIsEditingExisting] = useState(!!existingReviewText)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const googleLink = merchant.googleReviewLink 
    || (merchant.googlePlaceId ? `https://search.google.com/local/writereview?placeid=${merchant.googlePlaceId}` : "https://maps.google.com")

  // ✅ PERMANENT FIX (OtterMind "Additional Safeguard #2"):
  // On HTTP + Mobile, copying AND navigating in a single gesture is IMPOSSIBLE
  // because the browser's user-activation token is invalidated by navigation.
  // Solution: TWO SEPARATE user gestures — Step 1 ONLY copies, Step 2 ONLY opens Google.

  const fallbackCopy = (ta: HTMLTextAreaElement) => {
    try {
      ta.focus()
      ta.select()
      ta.setSelectionRange(0, ta.value.length)
      const success = document.execCommand('copy')
      setCopyStatus(success ? 'copied' : 'failed')
    } catch {
      setCopyStatus('failed')
    }
  }

  const handleCopyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // This button ONLY copies. No navigation. Full gesture token reserved for clipboard.
    e.preventDefault()
    const ta = textareaRef.current
    if (!ta) return

    // Try modern clipboard API first (works reliably on HTTPS)
    if (typeof window !== "undefined" && window.isSecureContext && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(ta.value)
        .then(() => setCopyStatus('copied'))
        .catch(() => fallbackCopy(ta))
      return
    }

    // HTTP fallback: execCommand on the VISIBLE, FOCUSED, LIVE textarea
    fallbackCopy(ta)
  }

  const handleGoogleOpen = () => {
    // Record the review submission (fire-and-forget)
    fetch('/api/reviews/record-google-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        merchantId: merchant.id,
        reviewText: draft,
        rating: 5
      })
    }).catch(err => console.error("Error recording review post:", err))
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
        
        <div className="p-8 text-center border-b border-slate-800">
          <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-700 mb-4 shadow-inner">
             {merchant.logoUrl ? (
                <img src={merchant.logoUrl} alt={merchant.name} className="w-full h-full rounded-full object-cover" />
             ) : (
                <span className="text-2xl text-emerald-400 font-bold">{merchant.name.charAt(0)}</span>
             )}
          </div>
          <h1 className="text-2xl font-bold text-slate-100">{merchant.name}</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Hi {customer?.name || "VIP"} ❤️<br/>
            {getContent('review_page_title', isEditingExisting ? "Edit & Update Your Google Review" : "AI has prepared your Google Review!")}
          </p>
        </div>

        <div className="p-8 space-y-5">
          {existingReviewText && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200 flex flex-col gap-2">
              <div>
                {getContent('review_policy_notice', '📌 Google Policy: Google allows 1 review per account. Clicking below will open your review in Edit mode — simply paste the text to update!')}
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

          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-8 h-8 text-amber-400 fill-amber-400" />
            ))}
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1 block">
              {isEditingExisting ? "Your Review (Edit to update)" : "AI DRAFT (FEEL FREE TO EDIT)"}
            </label>
            <textarea
              ref={textareaRef}
              id="review-draft-textarea"
              className="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all leading-relaxed"
              style={{ 
                fontSize: '16px',        // Prevents iOS Safari auto-zoom on focus
                WebkitUserSelect: 'all', // iOS: one-tap selects entire content
                userSelect: 'all'        // Android Chrome: same
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>

          {/* ── STEP 1: Copy button — ONLY copies, zero navigation ── */}
          <div className="space-y-1">
            <p className="text-xs text-slate-500 text-center font-medium">⬇ Step 1 of 2</p>
            <button
              type="button"
              onClick={handleCopyClick}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
              className={`w-full h-14 text-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border-0 ${
                copyStatus === 'copied'
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_-3px_rgba(16,185,129,0.7)]"
                  : copyStatus === 'failed'
                  ? "bg-amber-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-white"
              }`}
            >
              {copyStatus === 'copied' ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>✓ Review Text Copied!</span>
                </>
              ) : copyStatus === 'failed' ? (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy Failed — Long-press text to copy</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Tap to Copy Review Text</span>
                </>
              )}
            </button>
          </div>

          {/* ── STEP 2: Open Google — pure <a> tag, ONLY navigates ── */}
          <div className="space-y-1">
            <p className="text-xs text-slate-500 text-center font-medium">⬇ Step 2 of 2</p>
            <a
              href={googleLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGoogleOpen}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
              className={`w-full h-14 text-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 no-underline ${
                copyStatus === 'copied'
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.6)] cursor-pointer"
                  : "bg-slate-800 text-slate-500 pointer-events-none"
              }`}
            >
              <ExternalLink className="w-5 h-5" />
              <span>
                {copyStatus === 'copied' 
                  ? (isEditingExisting ? "Open Google → Update Review" : "Open Google → Paste & Post!")
                  : "Open Google  (Copy text first ↑)"}
              </span>
              {copyStatus === 'copied' && <ChevronRight className="w-4 h-4 opacity-80" />}
            </a>
          </div>

          {copyStatus === 'copied' && (
            <p className="text-center text-xs text-emerald-400 leading-relaxed">
              💡 Text copied! Tap "Open Google" above → long-press in the review box → Paste
            </p>
          )}

          {copyStatus === 'failed' && (
            <p className="text-center text-xs text-amber-400 leading-relaxed">
              💡 Auto-copy failed on this browser. Tap and hold the text box → Select All → Copy, then open Google.
            </p>
          )}

          <p className="text-center text-xs text-slate-600 leading-relaxed pt-1">
            {isEditingExisting 
              ? "After pasting your new review text, click Save on Google." 
              : "After posting, our system will automatically add Bonus Stamps to your VIP Wallet! 🎁"}
          </p>
        </div>
      </div>
    </div>
  )
}
