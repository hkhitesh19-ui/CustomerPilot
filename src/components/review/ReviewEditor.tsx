"use client"

import { useRef, useState } from "react"
import { Copy, Check, ExternalLink, Sparkles, Gift, ArrowLeft, Info, MapPin, Camera, ShoppingBag } from "lucide-react"

export function ReviewEditor({ 
  merchant, 
  customer, 
  initialDraft,
  existingReviewText,
  draftOptions: initialDraftOptions,
  bonusInfo,
  category,
  productName,
  isLoyaltyEnabled = true,
  heroChips = [],
  heroServices = [],
  heroProducts = []
}: { 
  merchant: any, 
  customer: any, 
  initialDraft?: string,
  existingReviewText?: string | null,
  draftOptions?: { draft1: string; draft2: string; draft3?: string } | null,
  bonusInfo?: {
    googleReviewBonus: number,
    photoBonus: number,
    hasPreviousPhoto?: boolean,
    rewardName?: string,
    stampsRequired?: number
  },
  category?: string,
  productName?: string,
  isLoyaltyEnabled?: boolean,
  heroChips?: string[],
  heroServices?: string[],
  heroProducts?: string[]
}) {
    const reviewBonus = bonusInfo?.googleReviewBonus ?? 2
  const photoBonus = bonusInfo?.photoBonus ?? 2
  const maxPossibleBonus = reviewBonus + photoBonus

  const defaultText = existingReviewText || initialDraft || `Ordered from ${merchant.name} today. Super fresh quality, loved the taste and packaging. Definitely recommended!`
  const [draft, setDraft] = useState(defaultText)
  const [draftOptions, setDraftOptions] = useState(initialDraftOptions)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [selectedOption, setSelectedOption] = useState<"draft1" | "draft2" | "draft3">("draft1")
  const [copied, setCopied] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(!!existingReviewText)
  const [activeProduct, setActiveProduct] = useState(productName || "")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleSelectChip = async (chip: string) => {
    const next = activeProduct.toLowerCase() === chip.toLowerCase() ? "" : chip
    setActiveProduct(next)
    if (isRegenerating) return
    setIsRegenerating(true)
    try {
      const pParam = next ? `&product=${encodeURIComponent(next)}` : ""
      const cParam = customer?.id ? `&c=${encodeURIComponent(customer.id)}` : ""
      const res = await fetch(`/api/reviews/dynamic-draft?m=${encodeURIComponent(merchant.id)}${cParam}${pParam}`)
      if (res.ok) {
        const data = await res.json()
        if (data.drafts) {
          setDraftOptions(data.drafts)
          if (selectedOption === "draft1") setDraft(data.drafts.draft1)
          else if (selectedOption === "draft2") setDraft(data.drafts.draft2)
          else if (selectedOption === "draft3" && data.drafts.draft3) setDraft(data.drafts.draft3)
          else setDraft(data.drafts.draft1)
        }
      }
    } catch (err) {
      console.warn("[ReviewEditor] Failed to fetch dynamic draft for chip:", err)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isRegenerating) return
    setIsRegenerating(true)
    try {
      const pParam = productName ? `&product=${encodeURIComponent(productName)}` : ""
      const cParam = customer?.id ? `&c=${encodeURIComponent(customer.id)}` : ""
      const res = await fetch(`/api/reviews/dynamic-draft?m=${encodeURIComponent(merchant.id)}${cParam}${pParam}`)
      if (res.ok) {
        const data = await res.json()
        if (data.drafts) {
          setDraftOptions(data.drafts)
          if (selectedOption === "draft1") setDraft(data.drafts.draft1)
          else if (selectedOption === "draft2") setDraft(data.drafts.draft2)
          else if (selectedOption === "draft3" && data.drafts.draft3) setDraft(data.drafts.draft3)
          else setDraft(data.drafts.draft1)
        }
      }
    } catch (err) {
      console.warn("[ReviewEditor] Failed to fetch dynamic draft:", err)
    } finally {
      setIsRegenerating(false)
    }
  }

  const fallbackSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${merchant.name || "Store"} ${merchant.address || ""}`.trim())}`
  let googleLink = merchant.googleReviewLink 
    || (merchant.googlePlaceId && merchant.googlePlaceId !== "ChIJnv3BJRZhpx5DLTbjrz7FNVdlt19" ? `https://search.google.com/local/writereview?placeid=${merchant.googlePlaceId}` : fallbackSearchUrl)
  if (googleLink.includes("ChIJnv3BJRZhpx5DLTbjrz7FNVdlt19")) {
    googleLink = fallbackSearchUrl
  }

  // Robust multi-layered clipboard copy with user-activation safety
  const performCopy = async (text: string): Promise<boolean> => {
    let success = false

    // 1. Direct synchronous selection of textarea FIRST (keeps user activation alive in browser)
    if (textareaRef.current) {
      try {
        textareaRef.current.focus()
        textareaRef.current.select()
        textareaRef.current.setSelectionRange(0, text.length)
        success = document.execCommand('copy')
      } catch (_) {}
    }

    // 2. Modern async Clipboard API
    if (typeof window !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        success = true
      } catch (err) {
        console.warn("[ReviewEditor] navigator.clipboard.writeText failed:", err)
      }
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

    // 2. Fire backend notification with keepalive so it completes even during tab navigation
    if (typeof fetch !== "undefined") {
      fetch('/api/reviews/record-google-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: customer?.id, 
          merchantId: merchant.id, 
          reviewText: draft, 
          rating: 5
        }),
        keepalive: true
      }).catch(() => {})
    }

    // 3. Reliable Redirection: Mobile deep-links directly, Desktop checks popup blocker
    const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)

    if (isMobile) {
      // Mobile browsers immediately open Google Maps app or direct review sheet
      window.location.href = googleLink
    } else {
      let win: Window | null = null
      try {
        win = window.open(googleLink, '_blank', 'noopener,noreferrer')
      } catch (_) {
        win = null
      }
      // If popup blocker trapped window.open or returned null, directly redirect current window!
      if (!win || win.closed || typeof win.closed === "undefined") {
        window.location.href = googleLink
      }
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

          {/* CustomerPilot VIP Bonus Pill (Only if Loyalty Enabled) */}
          {isLoyaltyEnabled ? (
            <div className="flex items-center gap-1.5 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#137333]" />
              <span>+{maxPossibleBonus} Bonus Stamps</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 shadow-2xs">
              <span className="text-amber-500 text-xs">⭐</span>
              <span>5-Star Verified</span>
            </div>
          )}
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

          {/* 1-Tap Dual Bestseller Selection: Services (Up to 10) + Products (Up to 10) */}
          {((heroServices && heroServices.length > 0) || (heroProducts && heroProducts.length > 0) || (heroChips && heroChips.length > 0)) && !isEditingExisting && (
            <div className="space-y-3 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>What did you visit / purchase today?</span>
                </span>
                {activeProduct && (
                  <button
                    type="button"
                    onClick={() => handleSelectChip("")}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Reset to General
                  </button>
                )}
              </div>

              {/* SECTION A: Services (if present) */}
              {heroServices && heroServices.length > 0 && (
                <div className="space-y-1">
                  {heroProducts && heroProducts.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <span>🩺 Services Received:</span>
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {heroServices.map((chip, idx) => {
                      const isSelected = activeProduct.toLowerCase() === chip.toLowerCase()
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectChip(chip)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3 text-white" /> : <span className="text-[10px] opacity-60">⭐</span>}
                          <span>{chip}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SECTION B: Products (if present) */}
              {heroProducts && heroProducts.length > 0 && (
                <div className="space-y-1">
                  {heroServices && heroServices.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <span>🛍️ Products Purchased:</span>
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {heroProducts.map((chip, idx) => {
                      const isSelected = activeProduct.toLowerCase() === chip.toLowerCase()
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectChip(chip)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                          }`}
                        >
                          {isSelected ? <Check className="w-3 h-3 text-white" /> : <ShoppingBag className="w-3 h-3 text-emerald-600 opacity-70" />}
                          <span>{chip}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* FALLBACK: If neither heroServices nor heroProducts were split, render heroChips */}
              {(!heroServices || heroServices.length === 0) && (!heroProducts || heroProducts.length === 0) && heroChips && heroChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {heroChips.map((chip, idx) => {
                    const isSelected = activeProduct.toLowerCase() === chip.toLowerCase()
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectChip(chip)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3 text-white" /> : <span className="text-[10px] opacity-60">⭐</span>}
                        <span>{chip}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Multi AI Draft Options Pills (Google-style Filter Chips - 3 Angles) */}
          {draftOptions && !isEditingExisting && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#5F6368] uppercase tracking-wider block">
                  Choose AI Review Angle:
                </span>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="text-[11px] text-[#1A73E8] hover:text-[#174EA6] font-semibold flex items-center gap-1 transition-all cursor-pointer py-0.5 px-2 rounded-lg hover:bg-[#E8F0FE]"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                  <span>{isRegenerating ? "Generating..." : "🔄 Try Another Idea"}</span>
                </button>
              </div>
              <div className={`grid ${draftOptions.draft3 ? "grid-cols-3" : "grid-cols-2"} gap-1.5 sm:gap-2`}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption("draft1")
                    setDraft(draftOptions.draft1)
                  }}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border text-center ${
                    selectedOption === "draft1"
                      ? "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8] shadow-xs font-bold"
                      : "bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]"
                  }`}
                >
                  <span className="truncate">🍰 Quality &amp; Taste</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOption("draft2")
                    setDraft(draftOptions.draft2)
                  }}
                  className={`py-2 px-1.5 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border text-center ${
                    selectedOption === "draft2"
                      ? "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8] shadow-xs font-bold"
                      : "bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]"
                  }`}
                >
                  <span className="truncate">⚡ Service &amp; Vibes</span>
                </button>
                {draftOptions.draft3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOption("draft3")
                      setDraft(draftOptions.draft3!)
                    }}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl font-semibold text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border text-center ${
                      selectedOption === "draft3"
                        ? "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8] shadow-xs font-bold"
                        : "bg-white text-[#3C4043] border-[#DADCE0] hover:bg-[#F1F3F4]"
                    }`}
                  >
                    <span className="truncate">💬 Short 1-Liner</span>
                  </button>
                )}
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

          {/* Photo Bonus Incentive Highlight Card (Only if Loyalty Enabled) */}
          {isLoyaltyEnabled && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50/90 via-emerald-50/80 to-amber-50/90 border-2 border-emerald-300 p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-emerald-500 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                      <span>🎁 +{photoBonus || 2} Bonus Stamps</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      Photo Reward
                    </span>
                  </div>
                  <p className="text-[11.5px] sm:text-xs text-slate-700 font-medium mt-0.5 leading-snug">
                    Upload a <strong>Product Photo</strong> or <strong>Shop Photo</strong> with your Google review to unlock <strong>+{photoBonus || 2} Extra Bonus Stamps</strong>! 📸
                  </p>
                </div>
              </div>
            </div>
          )}

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
                <span>{isEditingExisting ? "Copy & Update on Google Maps" : "Copy & Post on Google Maps"}</span>
                <ExternalLink className="w-5 h-5 opacity-80 ml-1" />
              </>
            )}
          </button>

          {/* Direct Tap Fallback Link (In case automated redirection was delayed) */}
          <div className="text-center pt-1">
            <a 
              href={googleLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => performCopy(draft)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A73E8] hover:text-[#1557B0] hover:underline transition-colors py-1 px-3 rounded-lg hover:bg-blue-50"
            >
              <span>Direct Google Review Link (Tap here if not opened automatically)</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          {/* Live Digital Wallet Button on Submitted (Only for Loyalty) */}
          {submitted && isLoyaltyEnabled && (
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

          <div className="text-center space-y-1">
            <p className="text-xs text-[#5F6368] leading-relaxed">
              {isEditingExisting 
                ? "💡 Google will open your previous review. Select the text, paste this new draft, and hit Post!" 
                : isLoyaltyEnabled
                ? "After posting, our system will automatically credit bonus stamps to your VIP Wallet! 🎁"
                : "Thank you for supporting our business! Your authentic Google review helps us grow. ⭐"}
            </p>
            {isLoyaltyEnabled && (
              <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                <Camera className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                <span>Attach a photo on Google Maps for +{photoBonus || 2} extra stamps!</span>
              </p>
            )}
          </div>
        </div>

        {/* Clean Google-style Footer */}
        <footer className="border-t border-[#E8EAED] bg-[#F8F9FA] p-4 text-center space-y-1">
          <p className="text-xs text-[#5F6368]">
            Powered by <a href="/for-business" className="text-[#1A73E8] hover:underline font-semibold">CustomerPilot</a> 🚀
          </p>
          <p className="text-[11px] text-[#80868B]">
            {isLoyaltyEnabled 
              ? "Automated Google Review & Loyalty System for Local Merchants"
              : "Automated Smart AI Google Review Engine for Local Merchants"}
          </p>
        </footer>
      </div>
    </div>
  )
}
