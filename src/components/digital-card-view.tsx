"use client"

import { useState, useMemo } from "react"

function sanitizeUrl(url?: string | null): string {
  if (!url) return "#"
  const trimmed = url.trim()
  const lowerTrimmed = trimmed.toLowerCase()
  if (lowerTrimmed.startsWith("javascript:") || lowerTrimmed.startsWith("data:")) {
    return "#"
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`
  }
  if (
    lowerTrimmed.startsWith("http://") || 
    lowerTrimmed.startsWith("https://") || 
    lowerTrimmed.startsWith("tel:") || 
    lowerTrimmed.startsWith("mailto:")
  ) {
    return trimmed
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed
  }
  return `https://${trimmed}`
}

const timesFont: React.CSSProperties = { fontFamily: '"Times New Roman", Times, "Liberation Serif", serif' }

function OfficialWhatsAppIcon({ className = "w-5 h-5 fill-current" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
import { 
  BadgeCheck, 
  MapPin, 
  Clock, 
  Bike, 
  Phone, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Youtube, 
  Navigation, 
  Globe, 
  ShoppingBag, 
  Share2, 
  QrCode, 
  Contact, 
  ChevronRight, 
  Star,
  Gift,
  Check,
  CheckCircle2,
  Copy,
  X
} from "lucide-react"

export interface DigitalCardData {
  id: string
  merchantId?: string | null
  slug: string
  displayName: string
  subCategories: string | null
  logoUrl: string | null
  coverUrl: string | null
  locationShort: string | null
  locationState: string | null
  businessHours: string | null
  deliveryInfo: string | null
  whatsappNumber: string | null
  phoneNumber: string | null
  instagramUrl: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  googleMapsUrl: string | null
  googleReviewUrl?: string | null
  websiteUrl: string | null
  orderingLinks: string | null
  googleRating: number | null
  googleReviewsCnt: number | null
  createdAt?: string | Date | null
  theme?: string | null
  googlePlaceId?: string | null
}

export function DigitalCardView({ card }: { card: DigitalCardData }) {
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savingContact, setSavingContact] = useState(false)
  const [contactToast, setContactToast] = useState<{
    open: boolean
    message: string
    submessage: string
    vcardUrl: string
    fileName: string
  } | null>(null)

  // 3-Day Free Trial Logic
  // Permanent seed cards or subscribed cards are exempt from expiration
  const isPermanent = card.slug === "cake-connection" || 
                      card.slug === "gujarat-photo-goods" || 
                      card.slug.startsWith("tasty-vadapav") || 
                      (typeof card.theme === "string" && card.theme.includes('"subscribed":true')) ||
                      (typeof card.theme === "string" && card.theme.includes("subscribed")) ||
                      card.googlePlaceId === "subscribed"

  let trialEndsAtTime = 0
  try {
    if (card.theme && typeof card.theme === "string" && card.theme.startsWith("{")) {
      const parsedTheme = JSON.parse(card.theme)
      if (parsedTheme.trialEndsAt) {
        trialEndsAtTime = new Date(parsedTheme.trialEndsAt).getTime()
      }
    }
  } catch (_) {}

  const createdTime = card.createdAt ? new Date(card.createdAt).getTime() : Date.now()
  if (!trialEndsAtTime) {
    trialEndsAtTime = createdTime + (3 * 24 * 60 * 60 * 1000)
  }

  const isExpired = !isPermanent && Date.now() > trialEndsAtTime
  const hoursRemaining = Math.max(0, Math.ceil((trialEndsAtTime - Date.now()) / (1000 * 60 * 60)))

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-inner">
            ⏳
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              3-Day Free Trial Expired
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {card.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Is Smart Digital Business Card ka <strong>3-Day Free Trial</strong> samapt ho chuka hai. Is link ko hamesha live rakhne aur customers ke sath share karte rehne ke liye, niche diye gaye plan me subscribe karein:
            </p>
          </div>

          {/* Pricing Options */}
          <div className="space-y-3 text-left">
            {/* Starter Plan */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white">Starter Plan (6 Months)</div>
                <div className="text-[11px] text-slate-400">₹349 · Save 50% (~₹58/mo)</div>
              </div>
              <a
                href={`https://wa.me/919033304707?text=${encodeURIComponent(`Hello CustomerPilot! I want to activate Starter Plan (₹349 / 6 Months) for my Smart Digital Business Card: ${card.displayName} (https://customerpilot.in/c/${card.slug})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition whitespace-nowrap"
              >
                Choose ₹349 →
              </a>
            </div>

            {/* Pro Annual Plan - Most Popular */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 to-slate-800 border-2 border-emerald-500 flex items-center justify-between relative shadow-lg">
              <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                ⭐ Most Popular
              </span>
              <div>
                <div className="font-bold text-sm text-white">Pro Annual Plan (1 Year)</div>
                <div className="text-[11px] text-emerald-300">₹499 · Save 58% (~₹41/mo)</div>
              </div>
              <a
                href={`https://wa.me/919033304707?text=${encodeURIComponent(`Hello CustomerPilot! I want to activate Pro Annual Plan (₹499 / 1 Year) for my Smart Digital Business Card: ${card.displayName} (https://customerpilot.in/c/${card.slug})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md whitespace-nowrap"
              >
                Choose ₹499 →
              </a>
            </div>

            {/* Lifetime Deal */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-white">Lifetime Deal (Forever)</div>
                <div className="text-[11px] text-slate-400">₹1,499 · Zero Renewal Fees</div>
              </div>
              <a
                href={`https://wa.me/919033304707?text=${encodeURIComponent(`Hello CustomerPilot! I want to claim Lifetime Deal (₹1499) for my Smart Digital Business Card: ${card.displayName} (https://customerpilot.in/c/${card.slug})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition whitespace-nowrap"
              >
                Choose ₹1499 →
              </a>
            </div>
          </div>

          {/* Quick Help & Activation */}
          <div className="pt-2 text-center text-xs text-slate-400 space-y-2">
            <p>Instant Activation in 2 minutes via WhatsApp Support</p>
            <a
              href="tel:+919033304707"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <Phone className="w-3.5 h-3.5" /> Call Support: +91 90333 04707
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Parse ordering platforms with useMemo to prevent redundant parsing on every keystroke
  const orderingList = useMemo(() => {
    let list: Array<{ platform: string; label: string; sublabel?: string; url: string; color?: string }> = []
    const isFood = (card.subCategories || "").toLowerCase().includes("cake") || 
                   (card.subCategories || "").toLowerCase().includes("food") ||
                   (card.subCategories || "").toLowerCase().includes("bakery") ||
                   (card.subCategories || "").toLowerCase().includes("dessert")

    try {
      if (card.orderingLinks) {
        const parsed = JSON.parse(card.orderingLinks)
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.map((item: any) => {
            const p = (item.platform || "website").toLowerCase()
            let defaultLabel = item.label
            let defaultSublabel = item.sublabel || "Order Now"
            let defaultColor = item.color

            if (p === "whatsapp") {
              defaultLabel = defaultLabel || "WhatsApp"
              defaultColor = defaultColor || "#16a34a"
            } else if (p === "zomato") {
              defaultLabel = defaultLabel || "Zomato"
              defaultColor = defaultColor || "#ef4444"
            } else if (p === "swiggy") {
              defaultLabel = defaultLabel || "Swiggy"
              defaultColor = defaultColor || "#f97316"
            } else if (p === "easycater") {
              defaultLabel = defaultLabel || "EasyCater"
              defaultColor = defaultColor || "#7c3aed"
            } else if (p === "website" || p === "store") {
              defaultLabel = defaultLabel || "Website"
              defaultColor = defaultColor || "#2563eb"
            } else if (p === "nikon") {
              defaultLabel = defaultLabel || "Nikon"
              defaultSublabel = item.sublabel || "Mirrorless"
              defaultColor = defaultColor || "#eab308"
            } else if (p === "sony") {
              defaultLabel = defaultLabel || "Sony α"
              defaultSublabel = item.sublabel || "Cinema & Lens"
              defaultColor = defaultColor || "#0284c7"
            } else if (p === "canon") {
              defaultLabel = defaultLabel || "Canon"
              defaultSublabel = item.sublabel || "Lenses"
              defaultColor = defaultColor || "#dc2626"
            } else if (p === "dji") {
              defaultLabel = defaultLabel || "DJI"
              defaultSublabel = item.sublabel || "Gimbals"
              defaultColor = defaultColor || "#0f766e"
            } else if (p === "catalog") {
              defaultLabel = defaultLabel || "Catalog"
              defaultSublabel = item.sublabel || "View All"
              defaultColor = defaultColor || "#7c3aed"
            } else if (p === "quotes") {
              defaultLabel = defaultLabel || "Get Quote"
              defaultSublabel = item.sublabel || "Pricing"
              defaultColor = defaultColor || "#059669"
            } else if (p === "directions") {
              defaultLabel = defaultLabel || "Store Visit"
              defaultSublabel = item.sublabel || "Find Us"
              defaultColor = defaultColor || "#d97706"
            }

            return {
              platform: p,
              label: defaultLabel || item.platform || "Visit",
              sublabel: defaultSublabel,
              url: item.url || "#",
              color: defaultColor || "#2563eb",
            }
          })
        }
      }
    } catch {
      list = []
    }

    // If food card is missing WhatsApp order or Website, ensure complete 5-channel presence
    if (isFood && list.length > 0) {
      const hasWhatsApp = list.some(i => i.platform === "whatsapp")
      if (!hasWhatsApp && card.whatsappNumber) {
        list.splice(1, 0, {
          platform: "whatsapp",
          label: "WhatsApp",
          sublabel: "Order Now",
          url: `https://wa.me/${card.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(card.displayName)}%2C%20I%20want%20to%20place%20an%20order`,
          color: "#16a34a"
        })
      }
      const hasEasyCater = list.some(i => i.platform === "easycater")
      if (!hasEasyCater && list.length < 5) {
        list.push({
          platform: "easycater",
          label: "EasyCater",
          sublabel: "Order Now",
          url: "https://www.easycater.com",
          color: "#7c3aed"
        })
      }
    }

    if (list.length === 0) {
      if (isFood) {
        list = [
          { platform: "website", label: "Website", sublabel: "Order Now", url: card.websiteUrl || "#", color: "#2563eb" },
          { platform: "whatsapp", label: "WhatsApp", sublabel: "Order Now", url: card.whatsappNumber ? `https://wa.me/${card.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(card.displayName)}%2C%20I%20want%20to%20place%20an%20order` : "#", color: "#16a34a" },
          { platform: "zomato", label: "Zomato", sublabel: "Order Now", url: "https://www.zomato.com", color: "#ef4444" },
          { platform: "swiggy", label: "Swiggy", sublabel: "Order Now", url: "https://www.swiggy.com", color: "#f97316" },
          { platform: "easycater", label: "EasyCater", sublabel: "Order Now", url: "https://www.easycater.com", color: "#7c3aed" }
        ]
      } else {
        list = [
          { platform: "website", label: "Online Store", sublabel: "Explore", url: card.websiteUrl || "#", color: "bg-blue-600" },
          { platform: "whatsapp", label: "WhatsApp", sublabel: "Inquire", url: card.whatsappNumber ? `https://wa.me/${card.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(card.displayName)}%2C%20I%20have%20an%20inquiry` : "#", color: "bg-[#25D366]" },
          { platform: "catalog", label: "Catalog", sublabel: "View All", url: card.websiteUrl || "#", color: "bg-purple-600" },
          { platform: "quotes", label: "Get Quote", sublabel: "Pricing", url: card.whatsappNumber ? `https://wa.me/${card.whatsappNumber.replace(/[^0-9]/g, "")}?text=Hello%2C%20please%20share%20quotation` : "#", color: "bg-emerald-600" },
          { platform: "directions", label: "Store Visit", sublabel: "Find Us", url: card.googleMapsUrl || "#", color: "bg-amber-600" }
        ]
      }
    }
    return list
  }, [card.orderingLinks, card.websiteUrl, card.whatsappNumber, card.displayName, card.subCategories, card.googleMapsUrl])

  // Dedicated Google Review link that triggers the review flow directly
  const effectiveReviewUrl = useMemo(() => {
    if (card.googleReviewUrl && card.googleReviewUrl.trim() !== "") {
      return card.googleReviewUrl
    }
    if (card.googlePlaceId && (card.googlePlaceId.startsWith("http://") || card.googlePlaceId.startsWith("https://"))) {
      return card.googlePlaceId
    }
    if (card.theme && typeof card.theme === "string" && card.theme.startsWith("{")) {
      try {
        const parsed = JSON.parse(card.theme)
        if (parsed.googleReviewLink && typeof parsed.googleReviewLink === "string") {
          return parsed.googleReviewLink
        }
      } catch (_) {}
    }
    if (!card.googleMapsUrl) {
      return `https://maps.google.com/?q=${encodeURIComponent(card.displayName + " reviews")}`
    }
    const placeIdMatch = card.googleMapsUrl.match(/place_?id[:=]([a-zA-Z0-9_-]+)/i)
    if (placeIdMatch && placeIdMatch[1]) {
      return `https://search.google.com/local/writereview?placeid=${placeIdMatch[1]}`
    }
    return card.googleMapsUrl
  }, [card.googleReviewUrl, card.googlePlaceId, card.theme, card.googleMapsUrl, card.displayName])

  // CustomerPilot Smart AI Google Review Module Link
  const smartAiReviewUrl = card.merchantId
    ? `/review?m=${encodeURIComponent(card.merchantId)}`
    : (effectiveReviewUrl ? sanitizeUrl(effectiveReviewUrl) : "#")

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://customerpilot.in/c/${card.slug}`

  // 📇 1-Tap Save Contact (Native Mobile Contacts Phonebook Integration)
  const handleSaveContact = async () => {
    setSavingContact(true)
    try {
      const cleanPhone = (card.phoneNumber || card.whatsappNumber || "").replace(/[^0-9+]/g, "")
      const cleanWhatsapp = (card.whatsappNumber || card.phoneNumber || "").replace(/[^0-9+]/g, "")
      const safeDisplayName = card.displayName.replace(/[\r\n]+/g, " ").trim()
      const safeSubCategories = (card.subCategories || "Business").replace(/[\r\n]+/g, " ").trim()
      const safeLocationShort = (card.locationShort || "").replace(/[\r\n]+/g, " ").trim()
      const safeLocationState = (card.locationState || "India").replace(/[\r\n]+/g, " ").trim()
      const fileName = `${safeDisplayName.replace(/\s+/g, "_")}.vcf`
      const vcardApiUrl = `/api/digital-card?slug=${encodeURIComponent(card.slug)}&format=vcard`

      let absoluteLogoUrl = ""
      if (card.logoUrl) {
        absoluteLogoUrl = card.logoUrl.startsWith("http")
          ? card.logoUrl
          : `https://customerpilot.in${card.logoUrl.startsWith("/") ? "" : "/"}${card.logoUrl}`
      }

      const nameParts = safeDisplayName.split(" ")
      const givenName = nameParts[0] || safeDisplayName
      const familyName = nameParts.slice(1).join(" ") || ""

      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "PRODID:-//CustomerPilot//Smart Digital Business Card//EN",
        `FN;CHARSET=UTF-8:${safeDisplayName}`,
        `N;CHARSET=UTF-8:${familyName};${givenName};;;`,
        `ORG;CHARSET=UTF-8:${safeDisplayName}`,
        `TITLE;CHARSET=UTF-8:${safeSubCategories}`,
        "ROLE:Business",
        cleanPhone ? `TEL;TYPE=CELL,VOICE,pref:${cleanPhone}` : "",
        cleanPhone ? `TEL;TYPE=WORK,VOICE:${cleanPhone}` : "",
        cleanWhatsapp ? `TEL;TYPE=WHATSAPP:${cleanWhatsapp}` : "",
        cleanWhatsapp ? `X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${cleanWhatsapp.replace(/[^0-9]/g, "")}` : "",
        card.instagramUrl ? `X-SOCIALPROFILE;TYPE=instagram:${card.instagramUrl}` : "",
        card.facebookUrl ? `X-SOCIALPROFILE;TYPE=facebook:${card.facebookUrl}` : "",
        (safeLocationShort || safeLocationState) ? `ADR;TYPE=WORK,POSTAL,PARCEL;CHARSET=UTF-8:;;${safeLocationShort};${safeLocationState};;;India` : "",
        `URL;TYPE=WORK:${currentUrl}`,
        card.websiteUrl ? `URL;TYPE=WEBSITE:${card.websiteUrl}` : "",
        `NOTE;CHARSET=UTF-8:${safeDisplayName} - ${safeSubCategories}\\n📍 ${safeLocationShort}, ${safeLocationState}\\n🕒 ${card.businessHours || "Open Daily"}\\n🔗 Digital Card: ${currentUrl}`,
        absoluteLogoUrl ? `PHOTO;VALUE=URI:${absoluteLogoUrl}` : "",
        "END:VCARD"
      ].filter(Boolean).join("\r\n")

      const isMobile = typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isIOS = typeof navigator !== "undefined" && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))

      // METHOD 1: Web Share API Level 2 (Files) — Native Contact Sheet on iOS & Android
      if (typeof navigator !== "undefined" && typeof File !== "undefined" && navigator.canShare) {
        try {
          const file = new File([vcard], fileName, { type: "text/vcard;charset=utf-8" })
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: safeDisplayName,
              text: `Save ${safeDisplayName} to phone contacts`,
            })
            setContactToast({
              open: true,
              message: "Opening Phone Contacts...",
              submessage: "Tap 'Save' or 'Done' in your phone to complete adding the contact.",
              vcardUrl: vcardApiUrl,
              fileName,
            })
            setSavingContact(false)
            return
          }
        } catch (err: any) {
          if (err?.name === "AbortError") {
            setSavingContact(false)
            return
          }
        }
      }

      // METHOD 2: Direct vCard Link Download + Interactive Guidance Modal
      const link = document.createElement("a")
      link.href = vcardApiUrl
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setContactToast({
        open: true,
        message: isMobile ? "Contact Ready to Save!" : "Contact File Downloaded!",
        submessage: isMobile
          ? "Tap the download notification or tap 'Open in Phone Contacts' below to save into your mobile phonebook."
          : "Open the downloaded file to add to your contacts address book.",
        vcardUrl: vcardApiUrl,
        fileName,
      })
    } finally {
      setSavingContact(false)
    }
  }

  // 🔗 Share Card
  const handleShareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.displayName} - Digital Business Card`,
          text: `Check out ${card.displayName} on their official Live Digital Card:`,
          url: currentUrl,
        })
      } catch (err) {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbf8f2] via-[#f7f2e7] to-[#ede4d1] text-slate-900 flex justify-center selection:bg-amber-200">
      
      {/* Mobile Card Viewport Frame */}
      <div className="w-full max-w-md min-h-screen flex flex-col justify-between px-4 sm:px-5 py-6 pb-28 relative">
        
        {/* Subtle Decorative Golden Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-5">
          
          {/* Active 3-Day Free Trial Notice Banner */}
          {!isPermanent && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center justify-between shadow-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span suppressHydrationWarning>3-Day Free Trial Active ({hoursRemaining}h left)</span>
              </span>
              <a
                href="/smart-digital-business-card#pricing"
                className="text-emerald-800 hover:text-emerald-950 underline font-extrabold text-[10px]"
              >
                Subscribe (from ₹349) →
              </a>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 1. TOP BRANDING: REAL LOGO + NAME + CATEGORIES                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col items-center text-center pt-2">
            
            {/* Real Logo Card Container */}
            <div className="relative mb-3">
              <div className="w-48 h-24 sm:w-52 sm:h-26 rounded-2xl bg-white p-2.5 shadow-md border-2 border-amber-300/80 flex items-center justify-center relative z-10 overflow-hidden">
                {card.logoUrl ? (
                  <img
                    src={card.logoUrl}
                    alt={card.displayName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-slate-900 text-amber-400 font-black text-3xl flex items-center justify-center">
                    {card.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Outer subtle glow ring */}
              <div className="absolute -inset-1 rounded-2xl border border-amber-500/20 pointer-events-none" />
            </div>

            {/* Business Display Name with Blue Verified Badge (Times New Roman) */}
            <h1 
              style={timesFont}
              className="text-2xl sm:text-[27px] font-bold text-slate-900 tracking-normal flex items-center justify-center gap-1.5 leading-tight"
            >
              <span>{card.displayName}</span>
              <BadgeCheck className="w-6 h-6 text-sky-500 fill-sky-500 text-white flex-shrink-0" />
            </h1>

            {/* Sub-categories / Tagline (Times New Roman) */}
            <p 
              style={timesFont}
              className="text-sm sm:text-[15px] italic text-slate-700 tracking-normal mt-1"
            >
              {card.subCategories || "Artisanal Bakery • Cakes • Desserts"}
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 2. 3-PILL QUICK STATUS BAR (Times New Roman Text)               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div 
            style={timesFont}
            className="bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-xs p-3 grid grid-cols-3 divide-x divide-slate-100 text-center"
          >
            
            {/* Pill 1: Location */}
            <div className="flex flex-col items-center px-1">
              <div className="flex items-center gap-1 text-red-600 mb-0.5">
                <MapPin className="w-3.5 h-3.5 fill-red-600 text-white flex-shrink-0" />
                <span className="font-bold text-[12px] text-slate-900 truncate max-w-full">
                  {card.locationShort ? card.locationShort.split(",")[0].trim() : "Manjalpur"}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 truncate max-w-full">
                {card.locationState || (card.locationShort?.includes(",") ? card.locationShort.split(",").slice(1).join(",").trim() : "Vadodara, Gujarat")}
              </span>
            </div>

            {/* Pill 2: Open Hours */}
            <div className="flex flex-col items-center px-1">
              <div className="flex items-center gap-1 text-red-600 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-red-600 stroke-[2.5] flex-shrink-0" />
                <span className="font-bold text-[12px] text-slate-900 truncate max-w-full">
                  Open Daily
                </span>
              </div>
              <span className="text-[11px] text-slate-600 truncate max-w-full">
                {card.businessHours ? card.businessHours.replace("Open Daily • ", "").replace("Open Daily: ", "") : "9:00 AM – 12:00 AM"}
              </span>
            </div>

            {/* Pill 3: Delivery */}
            <div className="flex flex-col items-center px-1">
              <div className="flex items-center gap-1 text-red-600 mb-0.5">
                <Bike className="w-3.5 h-3.5 text-red-600 stroke-[2.5] flex-shrink-0" />
                <span className="font-bold text-[12px] text-slate-900 truncate max-w-full">
                  Delivery
                </span>
              </div>
              <span className="text-[11px] text-slate-600 truncate max-w-full">
                {card.deliveryInfo
                  ? card.deliveryInfo.replace(/^Delivery\s*(Available)?\s*[•:]\s*/i, "")
                  : (card.locationState?.toLowerCase().includes("ahmedabad") ? "Gujarat & Pan-India" : "Available")}
              </span>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 2.5 CUSTOMERPILOT COMPLETE POWER ENGINES (LOYALTY + AI REVIEW)  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="pt-1 font-sans">
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Button 1: Digital Loyalty Stamp (WhatsApp Emerald Theme) */}
              <a
                href={`https://wa.me/${(card.whatsappNumber || "917203824012").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${card.displayName}! Checking in for my VIP Club stamps 🎁`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 hover:from-emerald-100 hover:to-white text-slate-900 border-2 border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    VIP Club
                  </span>
                </div>
                <div>
                  <div className="font-black text-xs sm:text-[13px] leading-tight text-slate-900">Loyalty Stamps</div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-0.5">
                    Collect Stamps <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </a>

              {/* Button 2: Smart AI Google Review */}
              <a
                href={smartAiReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 hover:from-amber-100 hover:to-white text-slate-900 border-2 border-amber-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    AI Review
                  </span>
                </div>
                <div>
                  <div className="font-black text-xs sm:text-[13px] leading-tight text-slate-900">Google Review</div>
                  <div className="text-[10px] text-amber-700 font-bold mt-0.5 flex items-center gap-0.5">
                    Auto-Write 5★ <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 3. PRIMARY ACTION BUTTONS (LIGHT CARDS + HIGHLIGHTED ICONS)     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 font-sans">
            
            {/* 1. WhatsApp Button */}
            {Boolean(card.whatsappNumber) && (
              <a
                href={`https://wa.me/${card.whatsappNumber!.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(card.displayName)}%2C%20I%20found%20your%20Digital%20Card`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <OfficialWhatsAppIcon className="w-5 h-5 fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-bold text-xs sm:text-[13px] leading-tight text-slate-900">WhatsApp</div>
                    <div className="text-[10px] text-slate-500 truncate">Chat with Us</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 2. Call Now Button */}
            {Boolean(card.phoneNumber || card.whatsappNumber) && (
              <a
                href={`tel:${(card.phoneNumber || (card.whatsappNumber ? `+${card.whatsappNumber}` : "")).replace(/[^0-9+]/g, "")}`}
                className="p-3 sm:p-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Phone className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-bold text-xs sm:text-[13px] leading-tight text-slate-900">Call Now</div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">
                      {card.phoneNumber || (card.whatsappNumber ? `+${card.whatsappNumber}` : "")}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 3. Instagram Button */}
            {Boolean(card.instagramUrl && card.instagramUrl.trim() !== "" && card.instagramUrl !== "https://instagram.com" && card.instagramUrl !== "https://www.instagram.com") && (
              <a
                href={sanitizeUrl(card.instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-bold text-xs sm:text-[13px] leading-tight text-slate-900">Instagram</div>
                    <div className="text-[10px] text-slate-500 truncate">Follow for Updates</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 4. Facebook Button */}
            {Boolean(card.facebookUrl && card.facebookUrl.trim() !== "" && card.facebookUrl !== "https://facebook.com" && card.facebookUrl !== "https://www.facebook.com") && (
              <a
                href={sanitizeUrl(card.facebookUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Facebook className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-bold text-xs sm:text-[13px] leading-tight text-slate-900">Facebook</div>
                    <div className="text-[10px] text-slate-500 truncate">Like Our Page</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 5. YouTube Button */}
            {Boolean(card.youtubeUrl && card.youtubeUrl.trim() !== "" && card.youtubeUrl !== "https://youtube.com" && card.youtubeUrl !== "https://www.youtube.com") && (
              <a
                href={sanitizeUrl(card.youtubeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Youtube className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-bold text-xs sm:text-[13px] leading-tight text-slate-900">YouTube</div>
                    <div className="text-[10px] text-slate-500 truncate">Watch Our Videos</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 6. Location / Directions Button */}
            <a
              href={sanitizeUrl(card.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(card.displayName + " " + (card.locationShort || "Vadodara"))}`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 sm:p-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98] ${
                Boolean(card.youtubeUrl && card.youtubeUrl.trim() !== "" && card.youtubeUrl !== "https://youtube.com" && card.youtubeUrl !== "https://www.youtube.com") ? "" : "col-span-2"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Navigation className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-bold text-xs sm:text-[13px] leading-tight text-slate-900">Location</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {card.locationShort ? `Get Directions (${card.locationShort.split(",")[0].trim()})` : "Get Directions on Google Maps"}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </a>

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 4. ONLINE ORDERING / STORE CATALOG                              */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="pt-2">
            
            {/* Section Header (Times New Roman) */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-[1px] bg-amber-300/80 flex-1 max-w-[50px]" />
              <div style={timesFont} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {card.subCategories?.toLowerCase().includes("cake") || card.subCategories?.toLowerCase().includes("food")
                    ? "Online Ordering Platforms"
                    : "Official Store & Catalog"}
                </span>
              </div>
              <div className="h-[1px] bg-amber-300/80 flex-1 max-w-[50px]" />
            </div>

            {/* 5 Platforms Row */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 font-sans">
              {orderingList.map((item, idx) => {
                const platKey = (item.platform || "").toLowerCase()
                let badgeColor = item.color || "#2563eb"
                let letter: string | React.ReactNode = "🌐"
                let label = item.label
                let sublabel = item.sublabel || "Order Now"

                if (platKey === "whatsapp") {
                  badgeColor = item.color || "#16a34a"
                  letter = "💬"
                  label = label || "WhatsApp"
                } else if (platKey === "zomato") {
                  badgeColor = item.color || "#e23744"
                  letter = "z"
                  label = label || "Zomato"
                } else if (platKey === "swiggy") {
                  badgeColor = item.color || "#fc8019"
                  letter = "S"
                  label = label || "Swiggy"
                } else if (platKey === "easycater") {
                  badgeColor = item.color || "#7c3aed"
                  letter = "E"
                  label = label || "EasyCater"
                } else if (platKey === "website" || platKey === "store") {
                  badgeColor = item.color || "#2563eb"
                  letter = "🌐"
                  label = label || "Website"
                } else if (platKey === "nikon") {
                  badgeColor = item.color || "#eab308"
                  letter = "N"
                  label = label || "Nikon"
                  sublabel = item.sublabel || "Mirrorless"
                } else if (platKey === "sony") {
                  badgeColor = item.color || "#0284c7"
                  letter = "α"
                  label = label || "Sony α"
                  sublabel = item.sublabel || "Cinema & Lens"
                } else if (platKey === "canon") {
                  badgeColor = item.color || "#dc2626"
                  letter = "C"
                  label = label || "Canon"
                  sublabel = item.sublabel || "Lenses"
                } else if (platKey === "dji") {
                  badgeColor = item.color || "#0f766e"
                  letter = "DJI"
                  label = label || "DJI"
                  sublabel = item.sublabel || "Gimbals"
                } else if (platKey === "catalog") {
                  badgeColor = item.color || "#7c3aed"
                  letter = "📖"
                  label = label || "Catalog"
                  sublabel = item.sublabel || "View All"
                } else if (platKey === "quotes") {
                  badgeColor = item.color || "#059669"
                  letter = "💬"
                  label = label || "Get Quote"
                  sublabel = item.sublabel || "Pricing"
                } else if (platKey === "directions") {
                  badgeColor = item.color || "#d97706"
                  letter = "📍"
                  label = label || "Store Visit"
                  sublabel = item.sublabel || "Find Us"
                } else {
                  label = label || item.platform || "Visit"
                  letter = label ? label.slice(0, 2).toUpperCase() : "★"
                }

                const isHexColor = badgeColor.startsWith("#") || badgeColor.startsWith("rgb")

                return (
                  <a
                    key={idx}
                    href={sanitizeUrl(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xs border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${!isHexColor ? badgeColor : ""} text-white flex items-center justify-center font-black text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform`}
                      style={isHexColor ? { backgroundColor: badgeColor } : undefined}
                    >
                      {letter === "z" ? (
                        <span className="font-black italic text-[11px]">z</span>
                      ) : letter === "S" ? (
                        <span className="font-black text-xs">S</span>
                      ) : letter === "E" ? (
                        <span className="font-bold text-[9px] uppercase">EC</span>
                      ) : letter === "💬" ? (
                        <OfficialWhatsAppIcon className="w-4 h-4 fill-white" />
                      ) : typeof letter === "string" && letter.length <= 3 ? (
                        <span className="font-black text-[10px] uppercase">{letter}</span>
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-bold text-[9.5px] text-slate-800 leading-tight text-center break-words line-clamp-2 w-full min-h-[20px] flex items-center justify-center">
                      {label}
                    </span>
                    <span className="text-[8px] font-medium text-slate-500 mt-0.5 flex items-center justify-center gap-0.5 w-full">
                      {sublabel} <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
                    </span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 5. BOTTOM UTILITY CARDS (Times New Roman Text)                  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div style={timesFont} className="grid grid-cols-3 gap-2 pt-1">
            
            {/* Google Reviews Card */}
            <a
              href={sanitizeUrl(effectiveReviewUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-2xl bg-white/95 border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <span className="font-bold text-[11px] text-slate-800 leading-tight">Google Reviews</span>
              <div className="flex items-center gap-0.5 mt-0.5 text-amber-500 text-[11px] font-bold">
                <span>
                  {Number.isFinite(Number(card.googleRating)) && Number(card.googleRating) > 0
                    ? Number(card.googleRating).toFixed(1)
                    : "4.5"}
                </span>
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              </div>
              <span className="text-[9px] text-slate-500 font-medium flex items-center justify-center gap-0.5">
                {card.googleReviewsCnt ?? 0} Reviews <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
              </span>
            </a>

            {/* Share Card */}
            <button
              onClick={handleShareCard}
              className="p-2.5 rounded-2xl bg-white/95 border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-1">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-[11px] text-slate-800 leading-tight">Share Card</span>
              <span className="text-[10px] text-amber-700 font-medium mt-1 flex items-center justify-center gap-0.5">
                {copied ? "Link Copied!" : <>With Friends <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" /></>}
              </span>
            </button>

            {/* Scan QR */}
            <button
              onClick={() => setQrModalOpen(true)}
              className="p-2.5 rounded-2xl bg-white/95 border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center mb-1">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="font-bold text-[11px] text-slate-800 leading-tight">Scan QR</span>
              <span className="text-[10px] text-slate-500 font-medium mt-1 flex items-center justify-center gap-0.5">
                Save to Phone <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
              </span>
            </button>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 6. STICKY FLOATING BOTTOM BAR: "SAVE CONTACT" (LIGHT LUXURY)    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button
            onClick={handleSaveContact}
            disabled={savingContact}
            className="w-full py-3.5 px-6 rounded-2xl bg-white/95 hover:bg-white active:scale-[0.98] text-slate-900 shadow-xl border-2 border-amber-300 flex items-center justify-between font-bold text-sm tracking-wider uppercase transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Contact className="w-4 h-4" />
              </div>
              <span className="text-slate-900 font-extrabold tracking-[0.15em] text-[13px]">
                {savingContact ? "Saving to Contacts..." : "Save Contact"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-600" />
          </button>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL: FULL QR CODE DIALOG                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setQrModalOpen(false)}
              aria-label="Close QR Code dialog"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-40 h-20 rounded-2xl bg-white shadow-md border-2 border-amber-300 mx-auto flex items-center justify-center p-2 overflow-hidden">
              {card.logoUrl ? (
                <img src={card.logoUrl} alt={card.displayName} className="w-full h-full object-contain" />
              ) : (
                <span className="font-black text-xl text-slate-900">{card.displayName.slice(0, 2)}</span>
              )}
            </div>

            <div>
              <h3 style={timesFont} className="font-bold text-xl text-slate-900">{card.displayName}</h3>
              <p style={timesFont} className="text-xs text-slate-500 mt-0.5">Scan to Open Live Digital Business Card</p>
            </div>

            {/* QR Code Canvas */}
            <div className="p-3 bg-slate-50 border-2 border-slate-900 rounded-2xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`}
                alt="Digital Card QR"
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>

            <div className="flex gap-2 font-sans">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(currentUrl)}`}
                download={`${card.slug}-digital-card-qr.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800"
              >
                Save QR
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MODAL / TOAST: NATIVE PHONE CONTACTS CONFIRMATION & GUIDANCE    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {contactToast?.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 text-center space-y-4 shadow-2xl relative border-2 border-amber-300 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            <button
              onClick={() => setContactToast(null)}
              aria-label="Close contact guidance"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Glowing Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Contact className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-slate-900 leading-tight">
                {contactToast.message}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {contactToast.submessage}
              </p>
            </div>

            {/* Mobile Instructions Card */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-700 leading-snug">
                  <strong>Android:</strong> Swipe down your notification shade &amp; tap <span className="font-mono text-[10px] bg-amber-100 px-1 py-0.5 rounded">{contactToast.fileName}</span> to save into Google Contacts.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-700 leading-snug">
                  <strong>iPhone:</strong> Tap the button below to view the Contact card, then tap <strong>&ldquo;Create New Contact&rdquo;</strong>.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 font-sans pt-1">
              <a
                href={contactToast.vcardUrl}
                download={contactToast.fileName}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Contact className="w-4 h-4 text-amber-400" />
                <span>Open in Phone Contacts</span>
              </a>

              <button
                onClick={() => setContactToast(null)}
                className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
