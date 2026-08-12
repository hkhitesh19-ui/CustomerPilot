"use client"

import { useRef, useState } from "react"
import { Copy, Check, ExternalLink, Star } from "lucide-react"
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

  // OtterMind Fix: useRef to directly target the visible, live textarea element
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const googleLink = merchant.googleReviewLink 
    || (merchant.googlePlaceId ? `https://search.google.com/local/writereview?placeid=${merchant.googlePlaceId}` : "https://maps.google.com")

  const handleCopyAndPostClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // ✅ CRITICAL (OtterMind Fix): Do NOT call e.preventDefault()!
    // The <a> tag's natural navigation PRESERVES the user-gesture token,
    // which authorizes the clipboard write on iOS Safari & Android Chrome.
    // Calling preventDefault() breaks this shared gesture context.

    const ta = textareaRef.current
    if (!ta) return

    // 1. Focus + Select all text in the VISIBLE, ALREADY-IN-DOM textarea
    //    iOS Safari only allows execCommand('copy') on visible, focused elements.
    ta.focus()
    ta.select()
    ta.setSelectionRange(0, ta.value.length)

    // 2. Execute copy synchronously — SAME JS task as the click event
    //    No setTimeout, no async, no Promise — must be in the same execution context.
    let copied = false
    try {
      copied = document.execCommand('copy')
    } catch {
      copied = false
    }

    // 3. Set visual feedback state — this does NOT block the <a> navigation
    setCopyStatus(copied ? 'copied' : 'failed')

    // 4. Record review asynchronously (fire-and-forget)
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

    // 5. The <a> tag's default href navigation fires AFTER this handler returns.
    //    This is the key: navigation shares the user-activation token with the copy above.
  }

  const copied = copyStatus === 'copied'

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

        <div className="p-8 space-y-6">
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

          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-8 h-8 text-amber-400 fill-amber-400" />
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isEditingExisting ? "Your Review (Edit to update)" : "AI DRAFT (FEEL FREE TO EDIT)"}
              </label>
            </div>
            
            {/* OtterMind Fix: 
                - ref={textareaRef} for direct DOM access during click
                - fontSize 16px: prevents iOS auto-zoom on focus (which breaks selection)
                - WebkitUserSelect 'all': makes entire content a single tap-to-select region on iOS
                - userSelect 'all': same for Android Chrome */}
            <textarea
              ref={textareaRef}
              id="review-draft-textarea"
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all leading-relaxed"
              style={{ 
                fontSize: '16px', // Prevents iOS Safari auto-zoom on focus
                WebkitUserSelect: 'all', // iOS: makes full content one-tap selectable
                userSelect: 'all'  // Android Chrome
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>

          {/* OtterMind Fix:
              - This MUST be an <a> tag, NOT a <button>
              - No e.preventDefault() — let natural <a> navigation run
              - touchAction 'manipulation': removes 300ms tap delay on Android
              - WebkitTapHighlightColor transparent: prevents flash interrupting gesture */}
          <a 
            href={googleLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCopyAndPostClick}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
            className={`w-full h-14 text-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer no-underline ${
              copied 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_20px_-3px_rgba(16,185,129,0.7)]" 
                : copyStatus === 'failed'
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.7)]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                <span>Copied! Opening Google...</span>
              </>
            ) : copyStatus === 'failed' ? (
              <>
                <ExternalLink className="w-5 h-5" />
                <span>Open Google (copy manually if needed)</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>{getContent('review_copy_button', isEditingExisting ? "Copy & Update on Google" : "Copy & Post to Google")}</span>
                <ExternalLink className="w-5 h-5 opacity-75 ml-1" />
              </>
            )}
          </a>

          {/* Fallback instruction shown only when copy fails */}
          {copyStatus === 'failed' && (
            <p className="text-center text-xs text-amber-400 mt-1 leading-relaxed">
              💡 Tap the text above to select it, long-press → Copy, then paste in Google Review.
            </p>
          )}
          
          <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
            {isEditingExisting 
              ? "💡 Google will open your previous review. Select the text, paste this new draft, and hit Post!" 
              : "After posting, our system will automatically add Bonus Stamps to your VIP Wallet! 🎁"}
          </p>
        </div>
      </div>
    </div>
  )
}



