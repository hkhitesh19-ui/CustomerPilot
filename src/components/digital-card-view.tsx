"use client"

import { useState, useMemo } from "react"

function sanitizeUrl(url?: string | null): string {
  if (!url) return "#"
  const trimmed = url.trim()
  const lowerTrimmed = trimmed.toLowerCase()
  if (
    lowerTrimmed.startsWith("http://") || 
    lowerTrimmed.startsWith("https://") || 
    lowerTrimmed.startsWith("tel:") || 
    lowerTrimmed.startsWith("mailto:")
  ) {
    return trimmed
  }
  if (trimmed.startsWith("/")) {
    return trimmed
  }
  return `https://${trimmed}`
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
  Check,
  Copy,
  X
} from "lucide-react"

export interface DigitalCardData {
  id: string
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
  websiteUrl: string | null
  orderingLinks: string | null
  googleRating: number | null
  googleReviewsCnt: number | null
}

export function DigitalCardView({ card }: { card: DigitalCardData }) {
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savingContact, setSavingContact] = useState(false)

  // Parse ordering platforms with useMemo to prevent redundant parsing on every keystroke
  const orderingList = useMemo(() => {
    let list: Array<{ platform: string; label: string; sublabel?: string; url: string; color?: string }> = []
    try {
      if (card.orderingLinks) {
        list = JSON.parse(card.orderingLinks)
      }
    } catch {
      list = []
    }

    if (list.length === 0) {
      const isFood = (card.subCategories || "").toLowerCase().includes("cake") || 
                     (card.subCategories || "").toLowerCase().includes("food") ||
                     (card.subCategories || "").toLowerCase().includes("bakery") ||
                     (card.subCategories || "").toLowerCase().includes("dessert")

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

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://customerpilot.in/c/${card.slug}`

  // 📇 1-Tap Save Contact (VCF Download)
  const handleSaveContact = () => {
    setSavingContact(true)
    const cleanPhone = (card.phoneNumber || card.whatsappNumber || "").replace(/[^0-9+]/g, "")
    const safeDisplayName = card.displayName.replace(/[\r\n]+/g, " ").trim()
    const safeSubCategories = (card.subCategories || "Business").replace(/[\r\n]+/g, " ").trim()
    const safeLocationShort = (card.locationShort || "").replace(/[\r\n]+/g, " ").trim()
    const safeLocationState = (card.locationState || "").replace(/[\r\n]+/g, " ").trim()
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${safeDisplayName}
ORG:${safeDisplayName}
TITLE:${safeSubCategories}
TEL;TYPE=CELL,VOICE:${cleanPhone}
TEL;TYPE=WORK,VOICE:${cleanPhone}
ADR;TYPE=WORK:;;${safeLocationShort};${safeLocationState};;;India
URL:${currentUrl}
NOTE:${safeDisplayName} - ${safeSubCategories}. Contact & Details: ${currentUrl}
END:VCARD`

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `${card.displayName.replace(/\s+/g, "_")}.vcf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => setSavingContact(false), 1200)
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
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 1. TOP BRANDING: LOGO MEDALLION + NAME + CATEGORIES             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col items-center text-center pt-2">
            
            {/* Circular Logo Medallion with Gold Ring */}
            <div className="relative mb-3">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white p-1.5 shadow-xl border-2 border-amber-400/80 flex items-center justify-center relative z-10 overflow-hidden">
                {card.logoUrl ? (
                  <img
                    src={card.logoUrl}
                    alt={card.displayName}
                    className="w-full h-full object-contain rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-900 text-amber-400 font-black text-3xl flex items-center justify-center">
                    {card.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Outer soft golden ring */}
              <div className="absolute -inset-1.5 rounded-full border border-amber-500/30 pointer-events-none" />
            </div>

            {/* Business Display Name with Blue Verified Badge */}
            <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight flex items-center justify-center gap-1.5 leading-tight">
              <span>{card.displayName}</span>
              <BadgeCheck className="w-6 h-6 text-sky-500 fill-sky-500 text-white flex-shrink-0" />
            </h1>

            {/* Sub-categories / Tagline */}
            <p className="text-xs sm:text-[13px] font-semibold text-slate-600 tracking-wide mt-1">
              {card.subCategories || "Artisanal Bakery • Cakes • Desserts"}
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 2. 3-PILL QUICK STATUS BAR                                      */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-sm p-3 grid grid-cols-3 divide-x divide-slate-100 text-center">
            
            {/* Pill 1: Location (Split on comma to avoid ugly truncation) */}
            <div className="flex flex-col items-center px-1">
              <div className="flex items-center gap-1 text-red-600 mb-0.5">
                <MapPin className="w-3.5 h-3.5 fill-red-600 text-white flex-shrink-0" />
                <span className="font-extrabold text-[11px] text-slate-900 truncate max-w-full">
                  {card.locationShort ? card.locationShort.split(",")[0].trim() : "Manjalpur"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                {card.locationState || (card.locationShort?.includes(",") ? card.locationShort.split(",").slice(1).join(",").trim() : "Vadodara, Gujarat")}
              </span>
            </div>

            {/* Pill 2: Open Hours */}
            <div className="flex flex-col items-center px-1">
              <div className="flex items-center gap-1 text-red-600 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-red-600 stroke-[2.5] flex-shrink-0" />
                <span className="font-extrabold text-[11px] text-slate-900 truncate max-w-full">
                  Open Daily
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                {card.businessHours ? card.businessHours.replace("Open Daily • ", "").replace("Open Daily: ", "") : "9:00 AM – 12:00 AM"}
              </span>
            </div>

            {/* Pill 3: Delivery */}
            <div className="flex flex-col items-center px-1">
              <div className="flex items-center gap-1 text-red-600 mb-0.5">
                <Bike className="w-3.5 h-3.5 text-red-600 stroke-[2.5] flex-shrink-0" />
                <span className="font-extrabold text-[11px] text-slate-900 truncate max-w-full">
                  Delivery Available
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-full">
                {card.deliveryInfo
                  ? card.deliveryInfo.replace("Delivery Available • ", "").replace("Delivery Available: ", "")
                  : (card.locationState?.toLowerCase().includes("ahmedabad") ? "Gujarat & Pan-India" : "Available")}
              </span>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 3. PRIMARY ACTION BUTTONS (VERIFIED LINKS & CONTACTS)           */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            
            {/* 1. WhatsApp Button */}
            {Boolean(card.whatsappNumber) && (
              <a
                href={`https://wa.me/${card.whatsappNumber!.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(card.displayName)}%2C%20I%20found%20your%20Digital%20Card`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-black text-xs sm:text-[13px] leading-tight text-white">WhatsApp</div>
                    <div className="text-[10px] text-white/90 truncate">Chat with Us</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 2. Call Now Button */}
            {Boolean(card.phoneNumber || card.whatsappNumber) && (
              <a
                href={`tel:${card.phoneNumber || (card.whatsappNumber ? `+${card.whatsappNumber.replace(/[^0-9]/g, "")}` : "")}`}
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-black text-xs sm:text-[13px] leading-tight text-white">Call Now</div>
                    <div className="text-[10px] text-white/90 truncate font-mono">
                      {card.phoneNumber || (card.whatsappNumber ? `+${card.whatsappNumber}` : "")}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 3. Instagram Button */}
            {Boolean(card.instagramUrl && card.instagramUrl.trim() !== "" && card.instagramUrl !== "https://instagram.com" && card.instagramUrl !== "https://www.instagram.com") && (
              <a
                href={sanitizeUrl(card.instagramUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-black text-xs sm:text-[13px] leading-tight text-white">Instagram</div>
                    <div className="text-[10px] text-white/90 truncate">Follow for Updates</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 4. Facebook Button */}
            {Boolean(card.facebookUrl && card.facebookUrl.trim() !== "" && card.facebookUrl !== "https://facebook.com" && card.facebookUrl !== "https://www.facebook.com") && (
              <a
                href={sanitizeUrl(card.facebookUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#0a58ca] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                    <Facebook className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-black text-xs sm:text-[13px] leading-tight text-white">Facebook</div>
                    <div className="text-[10px] text-white/90 truncate">Like Our Page</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 5. YouTube Button (only rendered if a real custom YouTube channel URL is set) */}
            {Boolean(card.youtubeUrl && card.youtubeUrl.trim() !== "" && card.youtubeUrl !== "https://youtube.com" && card.youtubeUrl !== "https://www.youtube.com") && (
              <a
                href={sanitizeUrl(card.youtubeUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#FF0000] to-[#b30000] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-between group active:scale-[0.98]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                    <Youtube className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-black text-xs sm:text-[13px] leading-tight text-white">YouTube</div>
                    <div className="text-[10px] text-white/90 truncate">Watch Our Videos</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </a>
            )}

            {/* 6. Location / Directions Button */}
            <a
              href={sanitizeUrl(card.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(card.displayName + " " + (card.locationShort || "Vadodara"))}`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 sm:p-3.5 rounded-2xl bg-white border border-blue-500/20 text-slate-900 shadow-sm hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98] ${
                Boolean(card.youtubeUrl && card.youtubeUrl.trim() !== "" && card.youtubeUrl !== "https://youtube.com" && card.youtubeUrl !== "https://www.youtube.com") ? "" : "col-span-2"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-blue-600 fill-blue-600" />
                </div>
                <div className="text-left min-w-0">
                  <div className="font-black text-xs sm:text-[13px] leading-tight text-slate-900">Location</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {card.locationShort ? `Get Directions (${card.locationShort.split(",")[0].trim()})` : "Get Directions on Google Maps"}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </a>

          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 4. ONLINE ORDERING PLATFORMS (5 ICONS GRID)                     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="pt-2">
            
            {/* Cute Section Header */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-[1px] bg-amber-300/80 flex-1 max-w-[50px]" />
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-800">
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
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {orderingList.map((item, idx) => {
                let badgeColor = item.color || "bg-blue-600"
                let letter: string | React.ReactNode = "🌐"
                if (item.platform === "whatsapp") { badgeColor = "bg-[#25D366]"; letter = "💬" }
                else if (item.platform === "zomato") { badgeColor = "bg-[#e23744]"; letter = "z" }
                else if (item.platform === "swiggy") { badgeColor = "bg-[#fc8019]"; letter = "S" }
                else if (item.platform === "easycater") { badgeColor = "bg-[#232f3e]"; letter = "E" }
                else if (item.platform === "website") { badgeColor = "bg-blue-600"; letter = "🌐" }
                else if (item.platform === "nikon") { badgeColor = "bg-[#eab308]"; letter = "N" }
                else if (item.platform === "sony") { badgeColor = "bg-[#0284c7]"; letter = "α" }
                else if (item.platform === "canon") { badgeColor = "bg-[#dc2626]"; letter = "C" }
                else if (item.platform === "dji") { badgeColor = "bg-[#0f766e]"; letter = "DJI" }
                else {
                  letter = item.label ? item.label.slice(0, 2).toUpperCase() : "★"
                }

                return (
                  <a
                    key={idx}
                    href={sanitizeUrl(item.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
                  >
                    <div className={`w-8 h-8 rounded-full ${badgeColor} text-white flex items-center justify-center font-black text-xs shadow-xs mb-1.5 group-hover:scale-105 transition-transform`}>
                      {letter === "z" ? (
                        <span className="font-black italic text-[11px]">z</span>
                      ) : letter === "S" ? (
                        <span className="font-black text-xs">S</span>
                      ) : letter === "E" ? (
                        <span className="font-bold text-[9px] uppercase">EC</span>
                      ) : letter === "💬" ? (
                        <MessageCircle className="w-4 h-4 fill-white" />
                      ) : typeof letter === "string" && letter.length <= 3 ? (
                        <span className="font-black text-[10px] uppercase">{letter}</span>
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-extrabold text-[9.5px] text-slate-800 leading-tight text-center break-words line-clamp-2 w-full min-h-[20px] flex items-center justify-center">
                      {item.label}
                    </span>
                    <span className="text-[8px] font-bold text-slate-500 mt-0.5 flex items-center justify-center gap-0.5 w-full">
                      {item.sublabel || "Visit"} <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
                    </span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 5. BOTTOM UTILITY CARDS: GOOGLE REVIEWS | SHARE CARD | SCAN QR  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            
            {/* Google Reviews Card */}
            <a
              href={sanitizeUrl(card.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(card.displayName)}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-2xl bg-white/90 border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center mb-1">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <span className="font-extrabold text-[10px] text-slate-800 leading-tight">Google Reviews</span>
              <div className="flex items-center gap-0.5 mt-0.5 text-amber-500 text-[10px] font-black">
                <span>{card.googleRating || 4.6}</span>
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              </div>
              <span className="text-[8px] text-slate-500 font-medium flex items-center justify-center gap-0.5">
                {card.googleReviewsCnt || 406} Reviews <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
              </span>
            </a>

            {/* Share Card */}
            <button
              onClick={handleShareCard}
              className="p-2.5 rounded-2xl bg-white/90 border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mb-1">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-[10px] text-slate-800 leading-tight">Share Card</span>
              <span className="text-[9px] text-amber-700 font-bold mt-1 flex items-center justify-center gap-0.5">
                {copied ? "Link Copied!" : <>With Friends <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" /></>}
              </span>
            </button>

            {/* Scan QR */}
            <button
              onClick={() => setQrModalOpen(true)}
              className="p-2.5 rounded-2xl bg-white/90 border border-amber-200/60 shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center mb-1">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-[10px] text-slate-800 leading-tight">Scan QR</span>
              <span className="text-[9px] text-slate-500 font-medium mt-1 flex items-center justify-center gap-0.5">
                Save to Phone <ChevronRight className="w-2.5 h-2.5 flex-shrink-0" />
              </span>
            </button>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 6. STICKY FLOATING BOTTOM BAR: "SAVE CONTACT"                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button
            onClick={handleSaveContact}
            disabled={savingContact}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#3e2723] hover:bg-[#2b1b17] active:scale-[0.98] text-[#fff8e7] shadow-2xl border border-amber-500/30 flex items-center justify-between font-black text-sm tracking-wider uppercase transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <Contact className="w-4 h-4" />
              </div>
              <span className="text-white tracking-[0.15em] text-[13px]">
                {savingContact ? "Saving to Contacts..." : "Save Contact"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-300" />
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
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full bg-white shadow-md border-2 border-amber-400 mx-auto flex items-center justify-center overflow-hidden">
              {card.logoUrl ? (
                <img src={card.logoUrl} alt={card.displayName} className="w-full h-full object-contain" />
              ) : (
                <span className="font-black text-xl text-slate-900">{card.displayName.slice(0, 2)}</span>
              )}
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">{card.displayName}</h3>
              <p className="text-xs text-slate-500 font-semibold">Scan to Open Live Digital Business Card</p>
            </div>

            {/* QR Code Canvas */}
            <div className="p-3 bg-slate-50 border-2 border-slate-900 rounded-2xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}`}
                alt="Digital Card QR"
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>

            <div className="flex gap-2">
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

    </div>
  )
}
