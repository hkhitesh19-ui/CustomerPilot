"use client"

import { useRef, useState } from "react"
import { Copy, Check, ExternalLink, Star, Camera, Image as ImageIcon, X, Sparkles, Gift } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [hasPhotoAttached, setHasPhotoAttached] = useState(false)

  const googleLink = merchant.googleReviewLink 
    || (merchant.googlePlaceId ? `https://search.google.com/local/writereview?placeid=${merchant.googlePlaceId}` : "https://maps.google.com")

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show instant local preview
    const localUrl = URL.createObjectURL(file)
    setPhotoPreview(localUrl)
    setHasPhotoAttached(true)
    setUploadingPhoto(true)

    // Upload to server — compress first using canvas to keep under 1MB
    try {
      let uploadBlob: Blob = file
      try {
        uploadBlob = await new Promise<Blob>((resolve) => {
          const img = new Image()
          img.onload = () => {
            const MAX = 1200
            let w = img.width, h = img.height
            if (w > MAX || h > MAX) {
              const ratio = Math.min(MAX / w, MAX / h)
              w = Math.round(w * ratio)
              h = Math.round(h * ratio)
            }
            const canvas = document.createElement("canvas")
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext("2d")!
            ctx.drawImage(img, 0, 0, w, h)
            canvas.toBlob((b) => resolve(b || file), "image/jpeg", 0.82)
          }
          img.src = localUrl
        })
      } catch { /* canvas failed, use original */ }

      const formData = new FormData()
      formData.append("photo", uploadBlob, file.name || "review_photo.jpg")
      const res = await fetch("/api/reviews/upload-photo", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setUploadedPhotoUrl(data.url)
      }
    } catch (err) {
      console.warn("[ReviewEditor] Photo upload failed, will still award photo bonus flag:", err)
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setUploadedPhotoUrl(null)
    setHasPhotoAttached(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCopyAndPostClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const ta = textareaRef.current
    const photoAttached = Boolean(uploadedPhotoUrl || photoPreview || hasPhotoAttached)

    // 1. Try modern Clipboard API (works on HTTPS + localhost)
    if (typeof window !== "undefined" && window.isSecureContext && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(draft)
        .then(() => setCopied(true))
        .catch(() => {})
      fetch('/api/reviews/record-google-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: customer.id, 
          merchantId: merchant.id, 
          reviewText: draft, 
          rating: 5,
          photoUrl: uploadedPhotoUrl,
          photoAttached,
          hasPhoto: photoAttached
        })
      }).catch(() => {})
      setSubmitted(true)
      return
    }

    // 2. HTTP fallback: execCommand on the VISIBLE, FOCUSED textarea ref
    if (ta) {
      try {
        ta.focus()
        ta.select()
        ta.setSelectionRange(0, ta.value.length)
        const ok = document.execCommand('copy')
        if (ok) setCopied(true)
      } catch { /* silent */ }
    }

    // 3. Record review (fire-and-forget)
    fetch('/api/reviews/record-google-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customerId: customer.id, 
        merchantId: merchant.id, 
        reviewText: draft, 
        rating: 5,
        photoUrl: uploadedPhotoUrl,
        photoAttached,
        hasPhoto: photoAttached
      })
    }).catch(() => {})

    setSubmitted(true)
    // Natural <a> href navigation fires after this returns
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
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-emerald-400" /> +{reviewBonus} Stamps
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="review-draft-textarea"
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all leading-relaxed"
              style={{ 
                fontSize: '16px',
                WebkitUserSelect: 'all',
                userSelect: 'all'
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label htmlFor="review-photo-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block cursor-pointer">
                Add Purchase Photo (Cake / Item)
              </label>
              <span className="text-[11px] text-teal-400 font-semibold flex items-center gap-1">
                <Camera className="w-3 h-3 text-teal-400" /> +{photoBonus} Extra Stamps
              </span>
            </div>

            <input 
              id="review-photo-input"
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture="environment"
              className="hidden" 
              onChange={handlePhotoSelect} 
            />

            {!photoPreview ? (
              <label 
                htmlFor="review-photo-input"
                className="w-full border-2 border-dashed border-slate-700 hover:border-teal-500/70 bg-slate-950/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-300">Tap to attach a Photo</p>
                  <p className="text-[10px] text-slate-500">Unlocks +{photoBonus} extra bonus stamps on your card</p>
                </div>
              </label>
            ) : (
              <div className="bg-slate-950 border border-teal-500/40 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={photoPreview} 
                    alt="Review preview" 
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs font-bold text-teal-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>{uploadingPhoto ? "Saving Photo... ⏳" : `Photo Saved! +${photoBonus} Stamps ✅`}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {uploadingPhoto ? "Please wait..." : "Stamps credited after you post to Google"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Tip for Google Maps photo */}
                {!uploadingPhoto && (
                  <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-amber-300/80 leading-relaxed">
                      💡 <strong>Tip:</strong> For extra Google Review impact, also attach this photo inside Google Maps when it opens. (Optional — your +{photoBonus} stamps are already saved here!)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 1-Click Copy & Open Google Button */}
          <a 
            href={googleLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCopyAndPostClick}
            style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
            className={`w-full h-14 text-base sm:text-lg font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer no-underline ${
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
          </a>

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

