"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, RefreshCw, Printer, Sparkles, CheckCircle2, Eye, Image as ImageIcon } from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────────
 * Design Definitions & Configurations (3 Shortlisted Standee Designs)
 * ─────────────────────────────────────────────────────────────────────────── */

export type StandeeDesignId = "bakery" | "retail" | "pizzeria"

interface PerkItem {
  icon: string
  title: string
}

interface StandeeConfig {
  id: StandeeDesignId
  number: string
  title: string
  badgeLabel: string
  categoryHint: string
  accentColor: string
  pillBg: string
  goldColor: string
  slogan: string
  tags: string
  bannerGradient: string
  badgeTitle: string
  badgeSub: string
  badgeHighlight: string
  unlockPillText: string
  unlockPillHighlight: string
  perks: PerkItem[]
  footerTags: string[]
  mockupImage: string
}

const STANDEE_CONFIGS: Record<StandeeDesignId, StandeeConfig> = {
  bakery: {
    id: "bakery",
    number: "Option 1",
    title: "Artisanal Bakery & Cafe",
    badgeLabel: "🎂 Bakery & Cake Studio",
    categoryHint: "Best for Bakeries, Cake Shops, Pastry Cafes & Dessert Studios",
    accentColor: "#991B1B",
    pillBg: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
    goldColor: "#D97706",
    slogan: "Good Food, Happier People ♡",
    tags: "CAKES  |  DESSERTS  |  SWEET MOMENTS",
    bannerGradient: "linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%)",
    badgeTitle: "SCAN",
    badgeSub: "TO EARN",
    badgeHighlight: "REWARDS",
    unlockPillText: "SCAN TO UNLOCK",
    unlockPillHighlight: "REWARDS",
    perks: [
      { icon: "🎁", title: "EXCLUSIVE OFFERS" },
      { icon: "⭐", title: "LOYALTY REWARDS" },
      { icon: "🍰", title: "BIRTHDAY SPECIALS" },
      { icon: "🏷️", title: "MEMBER DISCOUNTS" },
    ],
    footerTags: ["🎂 Cakes", "🧁 Desserts", "♡ Sweet Moments"],
    mockupImage: "/standees/standee_bakery_mockup.jpg",
  },
  retail: {
    id: "retail",
    number: "Option 2",
    title: "Royal Retail & Lifestyle",
    badgeLabel: "🛍️ Royal Retail & Lifestyle",
    categoryHint: "Best for Fashion Boutiques, Footwear, Electronics & Retail Stores",
    accentColor: "#1E3A8A",
    pillBg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    goldColor: "#F59E0B",
    slogan: "Shop More, Save More ♡",
    tags: "NEW ARRIVALS  |  PREMIUM COLLECTION  |  BEST DEALS",
    bannerGradient: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
    badgeTitle: "INSTANT",
    badgeSub: "₹100 ON",
    badgeHighlight: "FIRST SCAN!",
    unlockPillText: "SCAN FOR INSTANT",
    unlockPillHighlight: "₹100 OFF",
    perks: [
      { icon: "🎁", title: "₹100 OFF FIRST SCAN" },
      { icon: "🛍️", title: "1 STAMP / ₹500" },
      { icon: "💎", title: "BIRTHDAY GIFT CARD" },
      { icon: "🏷️", title: "5% VIP CASHBACK" },
    ],
    footerTags: ["🛍️ Shopping", "🎁 Rewards", "♡ Best Deals"],
    mockupImage: "/standees/standee_retail_mockup.jpg",
  },
  pizzeria: {
    id: "pizzeria",
    number: "Option 3",
    title: "Fast-Food & Pizzeria",
    badgeLabel: "🍕 Fast-Food & Pizzeria",
    categoryHint: "Best for Pizzerias, Burger Hubs, Fast-Casual Dining & Food Courts",
    accentColor: "#B91C1C",
    pillBg: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)",
    goldColor: "#CA8A04",
    slogan: "Bite Into Happiness ♡",
    tags: "WOOD-FIRED PIZZA  |  SIDES  |  REFRESHMENTS",
    bannerGradient: "linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)",
    badgeTitle: "1 STAMP",
    badgeSub: "ON EVERY",
    badgeHighlight: "VISIT!",
    unlockPillText: "SCAN FOR FREE",
    unlockPillHighlight: "GARLIC BREAD",
    perks: [
      { icon: "🍕", title: "STAMP EVERY ORDER" },
      { icon: "🎂", title: "FREE BIRTHDAY PIZZA" },
      { icon: "🥤", title: "FREE SOFT DRINK" },
      { icon: "🏷️", title: "15% MEMBER DISCOUNT" },
    ],
    footerTags: ["🍕 Wood-Fired", "🥖 Garlic Bread", "♡ Fresh Slices"],
    mockupImage: "/standees/standee_pizzeria_mockup.jpg",
  },
}

function detectDefaultDesign(businessType?: string | null, category?: string | null): StandeeDesignId {
  const typeStr = (businessType || "").toUpperCase()
  const catStr = (category || "").toUpperCase()

  if (typeStr.includes("RETAIL") || catStr.includes("SHOP") || catStr.includes("STORE") || catStr.includes("CLOTH") || catStr.includes("FURNIT") || catStr.includes("FASHION") || catStr.includes("OPTIC")) {
    return "retail"
  }
  if (typeStr.includes("PIZZA") || catStr.includes("PIZZA") || typeStr.includes("BURGER") || catStr.includes("BURGER") || typeStr.includes("FAST") || catStr.includes("FAST") || catStr.includes("DHABA") || catStr.includes("RESTAURANT")) {
    return "pizzeria"
  }
  return "bakery"
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Category Hero Graphic Components (Layered Vector Illustrations)
 * ─────────────────────────────────────────────────────────────────────────── */

function BakeryCakeHero() {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
      {/* Porcelain Plate */}
      <div className="absolute bottom-1 w-20 h-4 sm:w-24 sm:h-5 bg-gradient-to-r from-slate-200 via-white to-slate-200 rounded-full shadow-md border border-slate-300" />
      {/* Chocolate Layer Cake */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Cherries on top */}
        <div className="flex items-center gap-1 -mb-1 z-20">
          <span className="text-lg sm:text-xl filter drop-shadow">🍒</span>
        </div>
        {/* Top Cake Layer with Chocolate Drip */}
        <div className="w-16 h-8 sm:w-20 sm:h-10 bg-gradient-to-b from-[#3E2723] via-[#4E342E] to-[#2E1C14] rounded-t-xl shadow-lg relative overflow-hidden border border-[#5D4037]/60">
          {/* White Cream Frosting Dots */}
          <div className="absolute top-0 left-0 right-0 flex justify-around px-1 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
          </div>
          {/* Chocolate drips */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
            <div className="w-1.5 h-2.5 bg-[#26160F] rounded-b-full" />
            <div className="w-2 h-3.5 bg-[#26160F] rounded-b-full" />
            <div className="w-1.5 h-2 bg-[#26160F] rounded-b-full" />
            <div className="w-2.5 h-3 bg-[#26160F] rounded-b-full" />
          </div>
        </div>
        {/* Cream Middle Layer */}
        <div className="w-16 sm:w-20 h-1 bg-[#FFF3E0] shadow-inner" />
        {/* Bottom Cake Layer */}
        <div className="w-16 h-6 sm:w-20 sm:h-8 bg-gradient-to-b from-[#4E342E] to-[#2E1C14] rounded-b-md shadow-md border-b-2 border-[#1E100A]" />
      </div>
    </div>
  )
}

function RetailGiftHero() {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
      {/* Base Pedestal Shadow */}
      <div className="absolute bottom-1 w-20 h-4 sm:w-24 sm:h-5 bg-gradient-to-r from-blue-200 via-indigo-100 to-blue-200 rounded-full shadow-md border border-blue-300" />
      
      {/* Back Sapphire Shopping Bag */}
      <div className="absolute bottom-2 left-2 w-12 h-14 sm:w-14 sm:h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-lg shadow-lg flex flex-col items-center justify-center border border-blue-400">
        {/* Rope Handle */}
        <div className="absolute -top-2.5 w-6 h-4 border-2 border-amber-400 rounded-t-full" />
        <span className="text-lg sm:text-xl filter drop-shadow">🛍️</span>
        <span className="text-[6px] font-black text-amber-300 tracking-widest">VIP</span>
      </div>

      {/* Front Pastel Coral/Pink Gift Box */}
      <div className="relative z-10 -mr-4 mt-2 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-xl shadow-xl flex items-center justify-center border border-rose-300">
        {/* Yellow Ribbon Cross */}
        <div className="absolute inset-y-0 w-2 bg-gradient-to-b from-amber-300 to-yellow-400 shadow-xs" />
        <div className="absolute inset-x-0 h-2 bg-gradient-to-r from-amber-300 to-yellow-400 shadow-xs" />
        {/* Golden Bow Ribbon on Top */}
        <div className="absolute -top-2.5 z-20 text-base filter drop-shadow">🎀</div>
        <span className="relative z-10 text-[10px] font-black text-white bg-rose-700/80 px-1 py-0.2 rounded shadow">₹100</span>
      </div>

      {/* Golden Sparkles */}
      <div className="absolute top-1 right-2 text-amber-400 text-xs animate-pulse">✨</div>
      <div className="absolute top-5 left-1 text-amber-300 text-[10px]">⭐</div>
    </div>
  )
}

function PizzeriaPizzaHero() {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
      {/* Wooden Peel / Cutting Board */}
      <div className="absolute bottom-1 w-20 h-4 sm:w-24 sm:h-5 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-full shadow-md border border-amber-950/60" />

      {/* Sizzling Wood-Fired Pizza Slice Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Steam / Sizzle indicator */}
        <div className="flex items-center gap-1 -mb-1 z-20">
          <span className="text-[10px] text-amber-500 font-black animate-pulse">♨️</span>
          <span className="text-[10px] text-rose-500 font-black">🔥</span>
        </div>

        {/* Crust & Melty Pizza Slice */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex flex-col items-center">
          {/* Crust (Curved bread) */}
          <div className="w-14 h-3 sm:w-16 sm:h-3.5 bg-gradient-to-b from-[#A0522D] via-[#8B4513] to-[#5C2E0B] rounded-t-xl shadow-md border border-[#D2691E]/60 flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-[#3E1F0B] mx-0.5 opacity-70" />
            <span className="w-1 h-1 rounded-full bg-[#3E1F0B] mx-0.5 opacity-70" />
            <span className="w-1 h-1 rounded-full bg-[#3E1F0B] mx-0.5 opacity-70" />
          </div>

          {/* Triangular Cheesy Pizza Body with Toppings */}
          <div 
            className="w-14 h-11 sm:w-16 sm:h-12 bg-gradient-to-b from-[#F59E0B] via-[#FBBF24] to-[#F59E0B] relative shadow-lg flex items-center justify-center overflow-hidden"
            style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
          >
            {/* Pepperoni Discs */}
            <div className="absolute top-1 left-1.5 w-2.5 h-2.5 rounded-full bg-[#991B1B] border border-[#7F1D1D] shadow-xs" />
            <div className="absolute top-1 right-1.5 w-3 h-3 rounded-full bg-[#991B1B] border border-[#7F1D1D] shadow-xs" />
            <div className="absolute top-4 left-3 w-2.5 h-2.5 rounded-full bg-[#991B1B] border border-[#7F1D1D] shadow-xs" />

            {/* Fresh Basil Leaf Green Dots */}
            <div className="absolute top-1.5 left-4 w-1 h-1.5 rounded-full bg-emerald-600 rotate-45" />
            <div className="absolute top-3 right-3 w-1 h-1.5 rounded-full bg-emerald-600 -rotate-30" />
          </div>

          {/* Cheese Drips at the Point */}
          <div className="flex items-center gap-0.5 -mt-0.5">
            <span className="w-1 h-2.5 bg-[#FBBF24] rounded-b-full shadow-xs" />
            <span className="w-1.5 h-3 bg-[#F59E0B] rounded-b-full shadow-xs" />
            <span className="w-1 h-2 bg-[#FBBF24] rounded-b-full shadow-xs" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main QR Generator Component: 3 Shortlisted Designs Displayed Together
 * ─────────────────────────────────────────────────────────────────────────── */

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<StandeeDesignId>("bakery")
  const [viewModes, setViewModes] = useState<Record<StandeeDesignId, "standee" | "photo">>({
    bakery: "standee",
    retail: "standee",
    pizzeria: "standee",
  })

  useEffect(() => {
    let isMounted = true
    async function loadQR() {
      if (!merchantId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/qr/generate?type=counter`, {
          headers: { "x-merchant-id": merchantId }
        })
        const json = await res.json().catch(() => null)
        if (res.ok && json && isMounted) {
          const data = json.data || json
          setQrData(data)
          // Pre-select the best matching design based on merchant category
          const defaultDesign = detectDefaultDesign(data?.merchant?.businessType, data?.merchant?.category)
          setSelectedDesign(defaultDesign)
        } else if (!res.ok && isMounted) {
          toast({ title: "Error", description: json?.error || "Failed to generate QR", variant: "destructive" })
        }
      } catch (e: any) {
        if (isMounted) toast({ title: "Error", description: e.message, variant: "destructive" })
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadQR()
    return () => { isMounted = false }
  }, [toast, merchantId])

  const storeName = qrData?.merchant?.name || "Merchant Store"
  const storeCity = qrData?.merchant?.city ? `${qrData.merchant.city.toUpperCase()} BRANCH` : "EXCLUSIVE VIP STORE"
  const recommendedDesign = detectDefaultDesign(qrData?.merchant?.businessType, qrData?.merchant?.category)

  const handleDownloadPNG = (designId?: StandeeDesignId) => {
    if (!qrData?.qrDataUrl) return
    const cfg = STANDEE_CONFIGS[designId || selectedDesign]
    const link = document.createElement("a")
    link.href = qrData.qrDataUrl
    link.download = `${storeName.replace(/\s+/g, "_")}-VIP-Loyalty-QR-${cfg.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded QR", description: `VIP Loyalty QR Code for ${cfg.title} downloaded.` })
  }

  const toggleViewMode = (id: StandeeDesignId) => {
    setViewModes(prev => ({
      ...prev,
      [id]: prev[id] === "standee" ? "photo" : "standee",
    }))
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Print Standee (Generates A4 Printable HTML for the chosen style)
   * ─────────────────────────────────────────────────────────────────────── */
  const handlePrintPDF = (designId: StandeeDesignId) => {
    if (!qrData?.qrDataUrl) return
    const cfg = STANDEE_CONFIGS[designId]

    // Style specifics for print
    const bracketColor = designId === "bakery" ? "#BE123C" : designId === "retail" ? "#2563EB" : "#B91C1C"
    const heroEmoji = designId === "bakery" ? "🎂" : designId === "retail" ? "🛍️" : "🍕"
    const pillGradient = cfg.pillBg
    const ribbonGradient = cfg.bannerGradient

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Standee - ${cfg.title} - ${storeName}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Montserrat:wght@500;600;700;800;900&family=Playfair+Display:ital,wght@1,700&family=Poppins:wght@600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { box-sizing: border-box; }
            body {
              font-family: 'Montserrat', 'Poppins', sans-serif;
              background: #f1f5f9;
              margin: 0;
              padding: 30px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .standee-card {
              width: 390px;
              background: #ffffff;
              border-radius: 28px;
              border: 1px solid #cbd5e1;
              box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
              overflow: hidden;
              position: relative;
              text-align: center;
            }
            .top-slogan {
              position: absolute;
              top: 18px;
              right: 20px;
              font-family: 'Caveat', cursive;
              font-size: 17px;
              font-weight: 700;
              color: ${cfg.accentColor};
              line-height: 1.1;
              text-align: right;
              transform: rotate(-3deg);
            }
            .standee-header {
              padding: 24px 20px 10px 20px;
            }
            .store-logo {
              max-height: 60px;
              max-width: 180px;
              object-fit: contain;
              margin: 0 auto 6px auto;
              display: block;
            }
            .store-name-title {
              font-family: 'Playfair Display', Georgia, serif;
              font-style: italic;
              font-size: 34px;
              font-weight: 700;
              color: #1e1b4b;
              line-height: 1.1;
              margin: 2px 0;
            }
            .branch-title {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 2px;
              color: ${cfg.accentColor};
              text-transform: uppercase;
              margin: 2px 0 6px 0;
            }
            .tags-row {
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 1.5px;
              color: ${cfg.goldColor};
              text-transform: uppercase;
            }
            .middle-section {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 16px 12px 16px;
              position: relative;
            }
            .left-hero {
              width: 42%;
              display: flex;
              flex-direction: column;
              align-items: center;
              position: relative;
            }
            .brush-badge {
              background: ${pillGradient};
              color: #ffffff;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 900;
              line-height: 1.1;
              text-transform: uppercase;
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
              transform: rotate(-6deg);
              margin-bottom: 8px;
            }
            .brush-badge .highlight {
              color: #FEF08A;
              display: block;
              font-size: 12px;
            }
            .curved-arrow {
              position: absolute;
              right: -10px;
              top: 40px;
              font-size: 24px;
              color: ${bracketColor};
              transform: rotate(20deg);
            }
            .hero-emoji {
              font-size: 64px;
              margin-top: 6px;
              filter: drop-shadow(0 10px 15px rgba(0,0,0,0.15));
            }
            .qr-box-wrapper {
              width: 55%;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-container {
              position: relative;
              background: #ffffff;
              padding: 10px;
              border-radius: 18px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
              border: 1px solid #e2e8f0;
              display: inline-block;
            }
            .bracket {
              position: absolute;
              width: 28px;
              height: 28px;
              border: 4px solid ${bracketColor};
              pointer-events: none;
            }
            .b-tl { top: -2px; left: -2px; border-right: none; border-bottom: none; border-top-left-radius: 12px; }
            .b-tr { top: -2px; right: -2px; border-left: none; border-bottom: none; border-top-right-radius: 12px; }
            .b-bl { bottom: -2px; left: -2px; border-right: none; border-top: none; border-bottom-left-radius: 12px; }
            .b-br { bottom: -2px; right: -2px; border-left: none; border-top: none; border-bottom-right-radius: 12px; }
            .qr-image {
              width: 170px;
              height: 170px;
              display: block;
              border-radius: 8px;
            }
            .unlock-pill {
              margin-top: 8px;
              background: ${pillGradient};
              color: #ffffff;
              font-size: 9.5px;
              font-weight: 900;
              letter-spacing: 0.5px;
              text-transform: uppercase;
              padding: 4px 14px;
              border-radius: 9999px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            }
            .unlock-pill span { color: #FEF08A; }
            .perks-row {
              display: flex;
              justify-content: space-around;
              padding: 10px 14px 12px 14px;
              background: #FFFDFB;
              border-top: 1px dashed #cbd5e1;
            }
            .perk-circle {
              width: 44px;
              height: 44px;
              background: #ffffff;
              border: 2px solid ${cfg.goldColor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 19px;
              margin: 0 auto 4px auto;
              box-shadow: 0 4px 10px rgba(0,0,0,0.06);
            }
            .perk-label {
              font-size: 7.5px;
              font-weight: 900;
              color: #1e293b;
              letter-spacing: 0.3px;
              text-transform: uppercase;
              line-height: 1.1;
              max-width: 68px;
            }
            .bottom-ribbon {
              background: ${ribbonGradient};
              color: #ffffff;
              padding: 14px 18px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-top: 2px solid ${cfg.goldColor};
            }
            .store-info { text-align: left; }
            .store-name-white { font-size: 13px; font-weight: 900; color: #ffffff; }
            .store-branch-white { font-size: 8.5px; font-weight: 700; color: #e2e8f0; letter-spacing: 1px; }
            .store-tags-white { font-size: 8px; color: #fde68a; margin-top: 2px; }
            .cp-badge {
              background: #ffffff;
              border-radius: 12px;
              padding: 6px 12px;
              display: flex;
              align-items: center;
              gap: 6px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              text-align: left;
            }
            .cp-logo-img { height: 22px; width: 22px; object-fit: contain; }
            .cp-text-col { display: flex; flex-direction: column; }
            .cp-powered { font-size: 7px; color: #64748b; font-weight: 700; }
            .cp-brand { font-size: 11px; font-weight: 900; color: #0284c7; line-height: 1; }
            .cp-tagline { font-size: 5.5px; color: #475569; font-weight: 700; margin-top: 1px; }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="top-slogan">${cfg.slogan.replace('♡', '♥')}</div>
            
            <div class="standee-header">
              ${qrData?.merchant?.logoUrl ? `<img src="${qrData.merchant.logoUrl}" class="store-logo" alt="Logo" />` : ''}
              <div class="store-name-title">${storeName}</div>
              <div class="branch-title">― ${storeCity} ―</div>
              <div class="tags-row">${cfg.tags}</div>
            </div>

            <div class="middle-section">
              <div class="left-hero">
                <div class="brush-badge">
                  <span>${cfg.badgeTitle}</span>
                  <span style="font-size:9px">${cfg.badgeSub}</span>
                  <span class="highlight">${cfg.badgeHighlight}</span>
                </div>
                <div class="curved-arrow">⤵</div>
                <div class="hero-emoji">${heroEmoji}</div>
              </div>

              <div class="qr-box-wrapper">
                <div class="qr-container">
                  <div class="bracket b-tl"></div>
                  <div class="bracket b-tr"></div>
                  <div class="bracket b-bl"></div>
                  <div class="bracket b-br"></div>
                  <img src="${qrData.qrDataUrl}" class="qr-image" alt="QR" />
                </div>
                <div class="unlock-pill">
                  ⛶ ${cfg.unlockPillText} <span>${cfg.unlockPillHighlight}</span>
                </div>
              </div>
            </div>

            <div class="perks-row">
              ${cfg.perks.map(p => `
                <div>
                  <div class="perk-circle">${p.icon}</div>
                  <div class="perk-label">${p.title}</div>
                </div>
              `).join('')}
            </div>

            <div class="bottom-ribbon">
              <div class="store-info">
                <div class="store-name-white">📍 ${storeName}</div>
                <div class="store-branch-white">${storeCity}</div>
                <div class="store-tags-white">${cfg.footerTags.join('  •  ')}</div>
              </div>

              <div class="cp-badge">
                <img src="/cplogo_icon.png" class="cp-logo-img" alt="CP" />
                <div class="cp-text-col">
                  <span class="cp-powered">Powered by</span>
                  <span class="cp-brand">CustomerPilot</span>
                  <span class="cp-tagline">Turns Every Walk-in into LifeTime Customers</span>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHtml)
      printWindow.document.close()
    }
  }

  const designsList: StandeeDesignId[] = ["bakery", "retail", "pizzeria"]

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <QrCode className="w-5 h-5 text-indigo-500" />
              Digital Loyalty Stamp QR Standees
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              All 3 shortlisted tabletop standee designs displayed side-by-side with your store name, logo &amp; dynamic WhatsApp QR code.
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => handleDownloadPNG(selectedDesign)} variant="outline" disabled={loading || !qrData} size="sm" className="rounded-xl border-slate-300 dark:border-slate-700">
              <Download className="w-4 h-4 mr-1.5" /> Download QR
            </Button>
            <Button onClick={() => handlePrintPDF(selectedDesign)} disabled={loading || !qrData} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">
              <Printer className="w-4 h-4 mr-1.5" /> Print Selected Standee ({STANDEE_CONFIGS[selectedDesign].title})
            </Button>
          </div>
        </div>

        {/* ─── Informative Header Callout ───────────────────────────────────── */}
        <div className="mt-3 p-3 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Compare all 3 designs below side-by-side. Print directly from any card or toggle to view photorealistic 3D tabletop studio photos.
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            Auto-Recommended: {STANDEE_CONFIGS[recommendedDesign].title}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SIDE-BY-SIDE 3-COLUMN STANDEE GRID ("ek sath unsko sho karna he") */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {designsList.map((designId) => {
            const cfg = STANDEE_CONFIGS[designId]
            const isSelected = selectedDesign === designId
            const isRecommended = recommendedDesign === designId
            const viewMode = viewModes[designId]

            return (
              <div
                key={designId}
                className={`relative rounded-3xl transition-all duration-200 border-2 p-4 flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-500 shadow-xl bg-indigo-50/20 dark:bg-indigo-950/10 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* ── Card Top Bar: Badge, Recommendation & View Toggle ── */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs">
                      {cfg.number}
                    </span>
                    {isRecommended && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Recommended
                      </span>
                    )}
                    {isSelected && !isRecommended && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        Selected
                      </span>
                    )}
                  </div>

                  {/* Toggle between Live Standee & 3D Photo */}
                  <button
                    onClick={() => toggleViewMode(designId)}
                    title="Toggle between Live Standee & 3D Photo Mockup"
                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                  >
                    {viewMode === "standee" ? (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>3D Photo</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Live Standee</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ── Standee Title & Category Hint ── */}
                <div className="mb-3 text-left">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {cfg.badgeLabel}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {cfg.categoryHint}
                  </p>
                </div>

                {/* ── Preview Body: Either 3D Photo Mockup OR Live Standee ── */}
                <div className="flex-1 flex flex-col items-center justify-center my-2">
                  {viewMode === "photo" ? (
                    /* ── Photorealistic Studio Mockup ── */
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg w-full max-w-[320px] aspect-[4/5] bg-slate-900 flex items-center justify-center group">
                      <img
                        src={cfg.mockupImage}
                        alt={`${cfg.title} Studio Mockup`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg text-center">
                        📸 3D Studio Mockup (Click &quot;Live Standee&quot; to preview with your store data)
                      </div>
                    </div>
                  ) : (
                    /* ── Live Interactive Tabletop Standee (With Real Merchant Data & QR) ── */
                    <div className="relative w-full max-w-[320px] mx-auto select-none">
                      {/* Standee Body */}
                      <div className="bg-gradient-to-b from-[#FFFDFD] via-white via-70% to-[#FFFDFB] text-slate-900 rounded-2xl pt-4 pb-0 shadow-xl border-2 border-slate-200/90 text-center relative overflow-hidden">
                        
                        {/* Top Slogan Script */}
                        <div 
                          className="absolute top-2.5 right-3 font-serif italic text-[11px] font-bold transform -rotate-3 select-none"
                          style={{ color: cfg.accentColor }}
                        >
                          {cfg.slogan}
                        </div>

                        {/* Merchant Logo */}
                        {qrData?.merchant?.logoUrl ? (
                          <div className="flex justify-center mb-1 max-h-10">
                            <img src={qrData.merchant.logoUrl} alt="Store Logo" className="max-h-9 max-w-[150px] object-contain" />
                          </div>
                        ) : (
                          <div 
                            className="w-8 h-8 mx-auto rounded-full font-bold flex items-center justify-center text-xs mb-1"
                            style={{ backgroundColor: `${cfg.accentColor}15`, color: cfg.accentColor }}
                          >
                            {designId === "bakery" ? "🎂" : designId === "retail" ? "🛍️" : "🍕"}
                          </div>
                        )}

                        {/* Store Name & Branch */}
                        <div className="font-serif italic text-xl font-black text-slate-900 tracking-tight leading-tight px-2 truncate">
                          {storeName}
                        </div>
                        <div 
                          className="text-[9px] font-black tracking-widest uppercase my-0.5"
                          style={{ color: cfg.accentColor }}
                        >
                          ― {storeCity} ―
                        </div>
                        <div 
                          className="text-[7.5px] font-extrabold tracking-wider uppercase mb-1.5"
                          style={{ color: cfg.goldColor }}
                        >
                          {cfg.tags}
                        </div>

                        {/* Middle Hero + QR Section */}
                        <div className="flex items-center justify-between px-2 py-1">
                          {/* Left: Brush badge + Hero Visual */}
                          <div className="w-[42%] flex flex-col items-center relative">
                            <div 
                              className="text-white font-black text-[8px] uppercase px-2 py-1 rounded-md shadow-md transform -rotate-6 leading-tight"
                              style={{ background: cfg.pillBg }}
                            >
                              <span>{cfg.badgeTitle}</span><br />
                              <span className="text-[7px]">{cfg.badgeSub}</span><br />
                              <span className="text-[#FEF08A] text-[9px]">{cfg.badgeHighlight}</span>
                            </div>
                            
                            {/* Curvy pointer arrow */}
                            <span 
                              className="text-base transform rotate-12 -mt-1 -mr-4 font-bold select-none"
                              style={{ color: cfg.accentColor }}
                            >
                              ⤵
                            </span>

                            {/* Category Hero Visual */}
                            <div className="mt-0.5">
                              {designId === "bakery" && <BakeryCakeHero />}
                              {designId === "retail" && <RetailGiftHero />}
                              {designId === "pizzeria" && <PizzeriaPizzaHero />}
                            </div>
                          </div>

                          {/* Right: QR Code with Curved Corner Brackets */}
                          <div className="w-[55%] flex flex-col items-center">
                            <div className="relative inline-block p-1.5 bg-white rounded-xl shadow-md border border-slate-200">
                              {/* 4 Curved Corner Brackets */}
                              <div 
                                className="absolute -top-1 -left-1 w-5 h-5 border-t-[3px] border-l-[3px] rounded-tl-lg pointer-events-none"
                                style={{ borderColor: cfg.accentColor }}
                              />
                              <div 
                                className="absolute -top-1 -right-1 w-5 h-5 border-t-[3px] border-r-[3px] rounded-tr-lg pointer-events-none"
                                style={{ borderColor: cfg.accentColor }}
                              />
                              <div 
                                className="absolute -bottom-1 -left-1 w-5 h-5 border-b-[3px] border-l-[3px] rounded-bl-lg pointer-events-none"
                                style={{ borderColor: cfg.accentColor }}
                              />
                              <div 
                                className="absolute -bottom-1 -right-1 w-5 h-5 border-b-[3px] border-r-[3px] rounded-br-lg pointer-events-none"
                                style={{ borderColor: cfg.accentColor }}
                              />

                              {loading ? (
                                <div className="w-28 h-28 flex items-center justify-center">
                                  <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                                </div>
                              ) : qrData?.qrDataUrl ? (
                                <img src={qrData.qrDataUrl} alt="Store QR" className="w-28 h-28 object-contain rounded-md" />
                              ) : null}
                            </div>

                            <div 
                              className="mt-1.5 text-white text-[7.5px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full shadow-xs"
                              style={{ background: cfg.pillBg }}
                            >
                              ⛶ {cfg.unlockPillText} <span className="text-[#FEF08A]">{cfg.unlockPillHighlight}</span>
                            </div>
                          </div>
                        </div>

                        {/* 4 Circular Perks Row */}
                        <div className="grid grid-cols-4 gap-1 px-2 py-1.5 bg-[#FFFDFB] border-t border-dashed border-slate-200 mt-1">
                          {cfg.perks.map((p, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center">
                              <div 
                                className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs shadow-xs mb-0.5"
                                style={{ border: `1.5px solid ${cfg.goldColor}` }}
                              >
                                {p.icon}
                              </div>
                              <span className="text-[6px] font-black text-slate-800 tracking-tight leading-tight uppercase max-w-[55px] line-clamp-2">
                                {p.title}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Wave Banner with CustomerPilot Branding */}
                        <div 
                          className="text-white p-2 border-t-2 flex items-center justify-between text-left"
                          style={{ background: cfg.bannerGradient, borderColor: cfg.goldColor }}
                        >
                          <div className="space-y-0.5 max-w-[50%]">
                            <div className="text-[8.5px] font-black text-white truncate">
                              📍 {storeName}
                            </div>
                            <div className="text-[6.5px] font-bold text-slate-200 truncate">
                              {storeCity}
                            </div>
                            <div className="text-[6px] text-amber-200/90 font-medium truncate">
                              {cfg.footerTags.join(' • ')}
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-1 px-1.5 flex items-center gap-1 shadow-md">
                            <img src="/cplogo_icon.png" alt="CustomerPilot" className="w-4 h-4 object-contain" />
                            <div className="flex flex-col">
                              <span className="text-[5px] text-slate-500 font-bold leading-none">Powered by</span>
                              <span className="text-[8px] font-black text-sky-700 leading-tight">CustomerPilot</span>
                              <span className="text-[4.5px] text-slate-600 font-semibold leading-none">Turns Every Walkin into LifeTime Customers</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acrylic 3D Base Shadow */}
                      <div className="w-full h-3.5 bg-gradient-to-b from-slate-300 to-slate-200 rounded-b-xl shadow-lg transform -skew-x-6 mx-auto -mt-1 opacity-90 border-t border-slate-300" />
                    </div>
                  )}
                </div>

                {/* ── Card Bottom Actions (1-Click Print & Download for THIS Design) ── */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePrintPDF(designId)}
                      disabled={loading || !qrData}
                      size="sm"
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl shadow-xs text-xs"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print A4 Standee
                    </Button>
                    <Button
                      onClick={() => handleDownloadPNG(designId)}
                      variant="outline"
                      disabled={loading || !qrData}
                      size="sm"
                      className="rounded-xl px-2.5 border-slate-300 dark:border-slate-700"
                      title="Download QR Image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDesign(designId)
                      toast({
                        title: `${cfg.title} Selected`,
                        description: "Set as your active standee template for top print action.",
                      })
                    }}
                    className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Active Selected Template</span>
                      </>
                    ) : (
                      <span>Select as Default</span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Bottom Information & Printing Guidelines ─────────────────────── */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Counter Setup &amp; Material Recommendations:
            </span>
            <p>
              Print on 250+ GSM glossy photo paper or coated art-card. Insert into a clear acrylic A4/A5 tabletop standee on your billing counter or cash desk for maximum scan conversion.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> High-Resolution 600 DPI Vector QR
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
