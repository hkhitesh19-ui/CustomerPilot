"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, RefreshCw, Printer, Sparkles, CheckCircle2, Gift, Star, Award, Heart, MapPin } from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────────
 * Category Theme Configurations for Option 1 (Themed Standee)
 * ─────────────────────────────────────────────────────────────────────────── */

interface ThemeConfig {
  accentColor: string
  pillBg: string
  goldColor: string
  slogan: string
  tags: string
  bannerGradient: string
  heroEmoji: string
  heroTitle: string
  perks: { icon: string; title: string }[]
  footerTags: string[]
}

const THEMES: Record<string, ThemeConfig> = {
  BAKERY: {
    accentColor: "#991B1B",
    pillBg: "linear-gradient(135deg, #E11D48 0%, #BE123C 100%)",
    goldColor: "#D97706",
    slogan: "Good Food, Happier People ♡",
    tags: "CAKES  |  DESSERTS  |  SWEET MOMENTS",
    bannerGradient: "linear-gradient(135deg, #881337 0%, #4C0519 100%)",
    heroEmoji: "🎂",
    heroTitle: "Fresh Cakes & Bakes",
    perks: [
      { icon: "🎁", title: "EXCLUSIVE OFFERS" },
      { icon: "⭐", title: "LOYALTY REWARDS" },
      { icon: "🍰", title: "BIRTHDAY SPECIALS" },
      { icon: "🏷️", title: "MEMBER DISCOUNTS" },
    ],
    footerTags: ["🎂 Cakes", "🧁 Desserts", "♡ Sweet Moments"],
  },
  RESTAURANT: {
    accentColor: "#9A3412",
    pillBg: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
    goldColor: "#F59E0B",
    slogan: "Good Taste, Great Vibes ♡",
    tags: "GOURMET FOOD  |  HOT BEVERAGES  |  DINING",
    bannerGradient: "linear-gradient(135deg, #7C2D12 0%, #431407 100%)",
    heroEmoji: "☕",
    heroTitle: "Artisanal Coffee & Dining",
    perks: [
      { icon: "🎁", title: "EXCLUSIVE OFFERS" },
      { icon: "⭐", title: "STAMP REWARDS" },
      { icon: "🍽️", title: "CHEF SPECIALS" },
      { icon: "🏷️", title: "MEMBER DISCOUNTS" },
    ],
    footerTags: ["☕ Coffee", "🍽️ Dining", "♡ Happy Bites"],
  },
  SALON: {
    accentColor: "#831843",
    pillBg: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
    goldColor: "#D97706",
    slogan: "Look Good, Feel Great ♡",
    tags: "HAIR CARE  |  SKIN GLOW  |  RELAXING SPA",
    bannerGradient: "linear-gradient(135deg, #701A75 0%, #3B0764 100%)",
    heroEmoji: "💇‍♀️",
    heroTitle: "Luxury Hair & Skincare",
    perks: [
      { icon: "🎁", title: "EXCLUSIVE OFFERS" },
      { icon: "⭐", title: "LOYALTY STAMPS" },
      { icon: "✨", title: "VIP MAKEOVER" },
      { icon: "🏷️", title: "MEMBER DISCOUNTS" },
    ],
    footerTags: ["💇 Hair Care", "✨ Skin Glow", "♡ Relaxing Spa"],
  },
  RETAIL: {
    accentColor: "#1E3A8A",
    pillBg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    goldColor: "#F59E0B",
    slogan: "Shop More, Save More ♡",
    tags: "NEW ARRIVALS  |  PREMIUM COLLECTION  |  BEST DEALS",
    bannerGradient: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
    heroEmoji: "🛍️",
    heroTitle: "Exclusive Retail Deals",
    perks: [
      { icon: "🎁", title: "EXCLUSIVE OFFERS" },
      { icon: "⭐", title: "SHOPPING STAMPS" },
      { icon: "💎", title: "VIP PRIVILEGES" },
      { icon: "🏷️", title: "MEMBER DISCOUNTS" },
    ],
    footerTags: ["🛍️ Shopping", "🎁 Rewards", "♡ Best Deals"],
  },
}

function getCategoryTheme(businessType?: string | null, category?: string | null): ThemeConfig {
  const typeStr = (businessType || "").toUpperCase()
  const catStr = (category || "").toUpperCase()

  if (typeStr.includes("BAKERY") || catStr.includes("CAKE") || catStr.includes("BAKE") || catStr.includes("PASTRY")) {
    return THEMES.BAKERY
  }
  if (typeStr.includes("RESTAURANT") || typeStr.includes("CAFE") || catStr.includes("FOOD") || catStr.includes("DINING") || catStr.includes("PIZZA") || catStr.includes("BURGER")) {
    return THEMES.RESTAURANT
  }
  if (typeStr.includes("SALON") || typeStr.includes("SPA") || catStr.includes("BEAUTY") || catStr.includes("HAIR") || catStr.includes("SKIN")) {
    return THEMES.SALON
  }
  if (typeStr.includes("RETAIL") || catStr.includes("SHOP") || catStr.includes("STORE") || catStr.includes("CLOTH") || catStr.includes("FURNIT")) {
    return THEMES.RETAIL
  }
  return THEMES.BAKERY
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Category Hero Graphic Components (Layered Vector Illustrations)
 * ─────────────────────────────────────────────────────────────────────────── */

function BakeryCakeHero() {
  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
      {/* Porcelain Plate */}
      <div className="absolute bottom-1 w-24 h-5 sm:w-28 sm:h-6 bg-gradient-to-r from-slate-200 via-white to-slate-200 rounded-full shadow-md border border-slate-300" />
      {/* Chocolate Layer Cake */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Cherries on top */}
        <div className="flex items-center gap-1 -mb-1 z-20">
          <span className="text-xl sm:text-2xl filter drop-shadow">🍒</span>
        </div>
        {/* Top Cake Layer with Chocolate Drip */}
        <div className="w-20 h-10 sm:w-24 sm:h-12 bg-gradient-to-b from-[#3E2723] via-[#4E342E] to-[#2E1C14] rounded-t-2xl shadow-lg relative overflow-hidden border border-[#5D4037]/60">
          {/* White Cream Frosting Dots */}
          <div className="absolute top-0 left-0 right-0 flex justify-around px-1 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
            <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
          </div>
          {/* Chocolate drips */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
            <div className="w-2 h-3 bg-[#26160F] rounded-b-full" />
            <div className="w-2.5 h-4 bg-[#26160F] rounded-b-full" />
            <div className="w-2 h-2.5 bg-[#26160F] rounded-b-full" />
            <div className="w-3 h-4 bg-[#26160F] rounded-b-full" />
          </div>
        </div>
        {/* Cream Middle Layer */}
        <div className="w-20 sm:w-24 h-1.5 bg-[#FFF3E0] shadow-inner" />
        {/* Bottom Cake Layer */}
        <div className="w-20 h-8 sm:w-24 sm:h-10 bg-gradient-to-b from-[#4E342E] to-[#2E1C14] rounded-b-lg shadow-md border-b-2 border-[#1E100A]" />
      </div>
    </div>
  )
}

function CafeHero() {
  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
      <div className="absolute bottom-2 w-24 h-5 bg-gradient-to-r from-amber-200 via-white to-amber-200 rounded-full shadow-md border border-amber-300" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-4xl sm:text-5xl filter drop-shadow-md">☕</div>
        <div className="text-xl sm:text-2xl -mt-2 filter drop-shadow">🥐</div>
      </div>
    </div>
  )
}

function SalonHero() {
  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
      <div className="absolute bottom-2 w-24 h-5 bg-gradient-to-r from-pink-200 via-white to-pink-200 rounded-full shadow-md border border-pink-300" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-4xl sm:text-5xl filter drop-shadow-md">🌸</div>
        <div className="text-xl sm:text-2xl -mt-2 filter drop-shadow">💄</div>
      </div>
    </div>
  )
}

function RetailHero() {
  return (
    <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
      <div className="absolute bottom-2 w-24 h-5 bg-gradient-to-r from-blue-200 via-white to-blue-200 rounded-full shadow-md border border-blue-300" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="text-4xl sm:text-5xl filter drop-shadow-md">🎁</div>
        <div className="text-xl sm:text-2xl -mt-2 filter drop-shadow">🛍️</div>
      </div>
    </div>
  )
}

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<"theme" | "classic">("theme")

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
          setQrData(json.data || json)
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
  const theme = getCategoryTheme(qrData?.merchant?.businessType, qrData?.merchant?.category)

  const handleDownloadPNG = () => {
    if (!qrData?.qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrData.qrDataUrl
    link.download = `${storeName.replace(/\s+/g, "_")}-VIP-Loyalty-QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded PNG", description: "VIP Loyalty QR Code downloaded successfully." })
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Print Standee (Option 1 Themed Standee or Option 2 Simple & Professional)
   * ─────────────────────────────────────────────────────────────────────── */
  const handlePrintPDF = () => {
    if (!qrData?.qrDataUrl) return

    let printHtml = ""

    if (selectedDesign === "theme") {
      // ── Option 1: As per attached image (Rich Category Themed Standee) ──
      printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print VIP Loyalty Standee - ${storeName}</title>
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
                width: 380px;
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
                color: #5c1d28;
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
                color: #2b0c14;
                line-height: 1.1;
                margin: 2px 0;
              }
              .branch-title {
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 2px;
                color: #5c1d28;
                text-transform: uppercase;
                margin: 2px 0 6px 0;
              }
              .tags-row {
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 1.5px;
                color: #78350f;
                text-transform: uppercase;
              }
              /* Hero & QR Middle */
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
                background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%);
                color: #ffffff;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 900;
                line-height: 1.1;
                text-transform: uppercase;
                box-shadow: 0 8px 16px rgba(225, 29, 72, 0.25);
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
                color: #BE123C;
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
                box-shadow: 0 10px 25px rgba(190, 18, 60, 0.12);
                border: 1px solid #fecdd3;
                display: inline-block;
              }
              .bracket {
                position: absolute;
                width: 28px;
                height: 28px;
                border: 4px solid #BE123C;
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
                background: linear-gradient(135deg, #BE123C 0%, #881337 100%);
                color: #ffffff;
                font-size: 9.5px;
                font-weight: 900;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                padding: 4px 14px;
                border-radius: 9999px;
                box-shadow: 0 4px 10px rgba(136, 19, 55, 0.2);
              }
              .unlock-pill span { color: #FEF08A; }
              /* Perks Row */
              .perks-row {
                display: flex;
                justify-content: space-around;
                padding: 10px 14px 12px 14px;
                background: #FFF8F6;
                border-top: 1px dashed #FECDD3;
              }
              .perk-circle {
                width: 44px;
                height: 44px;
                background: #ffffff;
                border: 2px solid #D97706;
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
                max-width: 65px;
              }
              /* Bottom Wavy Ribbon */
              .bottom-ribbon {
                background: linear-gradient(135deg, #7F1D1D 0%, #450A0A 100%);
                color: #ffffff;
                padding: 14px 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-top: 2px solid #D97706;
              }
              .store-info { text-align: left; }
              .store-name-white { font-size: 13px; font-weight: 900; color: #ffffff; }
              .store-branch-white { font-size: 8.5px; font-weight: 700; color: #fecdd3; letter-spacing: 1px; }
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
              <div class="top-slogan">${theme.slogan.replace('♡', '♥')}</div>
              
              <div class="standee-header">
                ${qrData?.merchant?.logoUrl ? `<img src="${qrData.merchant.logoUrl}" class="store-logo" alt="Logo" />` : ''}
                <div class="store-name-title">${storeName}</div>
                <div class="branch-title">― ${storeCity} ―</div>
                <div class="tags-row">${theme.tags}</div>
              </div>

              <div class="middle-section">
                <div class="left-hero">
                  <div class="brush-badge">
                    <span>SCAN</span>
                    <span style="font-size:9px">TO EARN</span>
                    <span class="highlight">REWARDS</span>
                  </div>
                  <div class="curved-arrow">⤵</div>
                  <div class="hero-emoji">${theme.heroEmoji}</div>
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
                    ⛶ SCAN TO UNLOCK <span>REWARDS</span>
                  </div>
                </div>
              </div>

              <div class="perks-row">
                ${theme.perks.map(p => `
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
                  <div class="store-tags-white">${theme.footerTags.join('  •  ')}</div>
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
    } else {
      // ── Option 2: Simple & Professional Standee ──
      printHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Professional VIP Standee - ${storeName}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              @page { size: A4 portrait; margin: 0; }
              * { box-sizing: border-box; }
              body {
                font-family: 'Poppins', -apple-system, sans-serif;
                background: #f8fafc;
                margin: 0;
                padding: 40px 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .standee-card {
                width: 380px;
                background: #ffffff;
                border-radius: 28px;
                border: 3px solid #6366f1;
                padding: 34px 26px 20px 26px;
                text-align: center;
                box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.2);
              }
              .vip-badge {
                display: inline-block;
                background: #6366f1;
                color: #ffffff;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                padding: 5px 18px;
                border-radius: 9999px;
                margin-bottom: 12px;
              }
              .store-logo {
                max-height: 65px;
                max-width: 200px;
                object-fit: contain;
                margin: 0 auto 8px auto;
                display: block;
              }
              .store-name {
                font-size: 26px;
                font-weight: 900;
                color: #0f172a;
                margin: 2px 0;
                line-height: 1.1;
              }
              .tagline {
                font-size: 12px;
                font-weight: 600;
                color: #64748b;
                margin-bottom: 18px;
              }
              .qr-box {
                background: #ffffff;
                padding: 16px;
                border-radius: 22px;
                border: 2px solid #e2e8f0;
                display: inline-block;
                box-shadow: 0 8px 20px rgba(0,0,0,0.06);
                margin-bottom: 18px;
              }
              .qr-img {
                width: 210px;
                height: 210px;
                display: block;
                border-radius: 12px;
              }
              .steps-box {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 14px;
                padding: 10px 14px;
                margin-bottom: 18px;
                display: flex;
                justify-content: space-between;
                font-size: 9.5px;
                font-weight: 700;
                color: #334155;
              }
              .step-item { display: flex; align-items: center; gap: 4px; }
              .step-num {
                width: 16px;
                height: 16px;
                background: #6366f1;
                color: #ffffff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 9px;
              }
              .footer-box {
                border-top: 1px solid #e2e8f0;
                padding-top: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              }
              .cp-logo-icon { width: 18px; height: 18px; object-fit: contain; }
              .footer-text { font-size: 10px; font-weight: 700; color: #475569; }
            </style>
          </head>
          <body>
            <div class="standee-card">
              <div class="vip-badge">👑 VIP Loyalty Club</div>
              ${qrData?.merchant?.logoUrl ? `<img src="${qrData.merchant.logoUrl}" class="store-logo" alt="Logo" />` : ''}
              <div class="store-name">${storeName}</div>
              <div class="tagline">Scan with WhatsApp • Collect Stamps & Claim Free Rewards!</div>

              <div class="qr-box">
                <img src="${qrData.qrDataUrl}" class="qr-img" alt="QR" />
              </div>

              <div class="steps-box">
                <div class="step-item"><span class="step-num">1</span> Scan with Camera</div>
                <div class="step-item"><span class="step-num">2</span> Open WhatsApp</div>
                <div class="step-item"><span class="step-num">3</span> Earn Stamps!</div>
              </div>

              <div class="footer-box">
                <img src="/cplogo_icon.png" class="cp-logo-icon" alt="CP" />
                <span class="footer-text">Powered by CustomerPilot • Turns Every Walkin into LifeTime Customers</span>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `
    }

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHtml)
      printWindow.document.close()
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300">
              <QrCode className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Digital Loyalty Stamp QR
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Generate and print high-converting WhatsApp VIP Club QR standees tailored to your store name &amp; business theme.
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleDownloadPNG} variant="outline" disabled={loading || !qrData} size="sm" className="rounded-xl">
              <Download className="w-4 h-4 mr-1.5" /> Download QR
            </Button>
            <Button onClick={handlePrintPDF} disabled={loading || !qrData} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md">
              <Printer className="w-4 h-4 mr-1.5" /> Print A4 Standee
            </Button>
          </div>
        </div>

        {/* ─── Two QR Code Design Style Selector ────────────────────────────── */}
        <div className="mt-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Choose Standee Design Style:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDesign("theme")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedDesign === "theme"
                  ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>🎨 Option 1: Category Themed Standee</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 rounded font-black">POPULAR</span>
            </button>
            <button
              onClick={() => setSelectedDesign("classic")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedDesign === "classic"
                  ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>✨ Option 2: Simple &amp; Professional</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          
          {/* ── Left Column: Standee Preview Mockup ─────────────────────────── */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            
            {selectedDesign === "theme" ? (
              /* ── OPTION 1: Category Themed Standee (As per attached image) ── */
              <div className="relative w-full max-w-[340px]">
                {/* Standee Body */}
                <div className="bg-gradient-to-b from-[#FFFDFD] via-white via-70% to-[#FFF8F6] text-slate-900 rounded-3xl pt-5 pb-0 shadow-2xl border-2 border-slate-200/90 text-center relative overflow-hidden">
                  
                  {/* Top Slogan Script */}
                  <div className="absolute top-3.5 right-4 font-serif italic text-xs font-bold text-[#881337] transform -rotate-3 select-none">
                    {theme.slogan}
                  </div>

                  {/* Merchant Logo */}
                  {qrData?.merchant?.logoUrl ? (
                    <div className="flex justify-center mb-1 max-h-12">
                      <img src={qrData.merchant.logoUrl} alt="Store Logo" className="max-h-11 max-w-[170px] object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 mx-auto rounded-full bg-rose-500/10 text-rose-600 font-bold flex items-center justify-center text-sm mb-1">
                      {theme.heroEmoji}
                    </div>
                  )}

                  {/* Store Name & Branch */}
                  <div className="font-serif italic text-2xl font-black text-[#2B0C14] tracking-tight leading-tight px-3">
                    {storeName}
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-[#881337] uppercase my-0.5">
                    ― {storeCity} ―
                  </div>
                  <div className="text-[8.5px] font-extrabold tracking-wider text-[#B45309] uppercase mb-2">
                    {theme.tags}
                  </div>

                  {/* Middle Hero + QR Section */}
                  <div className="flex items-center justify-between px-3 py-1">
                    {/* Left: Brush badge + Hero Visual */}
                    <div className="w-[42%] flex flex-col items-center relative">
                      <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black text-[9px] uppercase px-2.5 py-1.5 rounded-lg shadow-md transform -rotate-6 leading-tight">
                        <span>SCAN</span><br />
                        <span className="text-[7.5px]">TO EARN</span><br />
                        <span className="text-[#FEF08A] text-[10px]">REWARDS</span>
                      </div>
                      
                      {/* Curvy pointer arrow */}
                      <span className="text-rose-700 text-xl transform rotate-12 -mt-1 -mr-6 font-bold select-none">⤵</span>

                      {/* Category Hero Visual */}
                      <div className="mt-1">
                        {theme === THEMES.BAKERY && <BakeryCakeHero />}
                        {theme === THEMES.RESTAURANT && <CafeHero />}
                        {theme === THEMES.SALON && <SalonHero />}
                        {theme === THEMES.RETAIL && <RetailHero />}
                      </div>
                    </div>

                    {/* Right: QR Code with Curved Crimson Brackets */}
                    <div className="w-[55%] flex flex-col items-center">
                      <div className="relative inline-block p-2 bg-white rounded-2xl shadow-lg border border-rose-200">
                        {/* 4 Curved Corner Brackets */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-[4px] border-l-[4px] border-[#BE123C] rounded-tl-xl pointer-events-none" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-[4px] border-r-[4px] border-[#BE123C] rounded-tr-xl pointer-events-none" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-[4px] border-l-[4px] border-[#BE123C] rounded-bl-xl pointer-events-none" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-[4px] border-r-[4px] border-[#BE123C] rounded-br-xl pointer-events-none" />

                        {loading ? (
                          <div className="w-32 h-32 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
                          </div>
                        ) : qrData?.qrDataUrl ? (
                          <img src={qrData.qrDataUrl} alt="Store QR" className="w-32 h-32 object-contain rounded-lg" />
                        ) : null}
                      </div>

                      <div className="mt-2 bg-gradient-to-r from-rose-700 to-rose-900 text-white text-[8.5px] font-black tracking-wide uppercase px-3 py-1 rounded-full shadow-sm">
                        ⛶ SCAN TO UNLOCK <span className="text-[#FEF08A]">REWARDS</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Circular Perks Row */}
                  <div className="grid grid-cols-4 gap-1.5 px-3 py-2 bg-[#FFF8F6] border-t border-dashed border-rose-200 mt-2">
                    {theme.perks.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 rounded-full bg-white border border-[#D97706] flex items-center justify-center text-sm shadow-xs mb-0.5">
                          {p.icon}
                        </div>
                        <span className="text-[6.5px] font-black text-slate-800 tracking-tight leading-tight uppercase">
                          {p.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Wave Banner with CustomerPilot Branding */}
                  <div className="bg-gradient-to-r from-[#7F1D1D] to-[#450A0A] text-white p-2.5 border-t-2 border-[#D97706] flex items-center justify-between text-left">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-black text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span className="truncate max-w-[130px]">{storeName}</span>
                      </div>
                      <div className="text-[7.5px] font-bold text-rose-200">
                        {storeCity}
                      </div>
                      <div className="text-[7px] text-amber-200/90 font-medium">
                        {theme.footerTags.join(' • ')}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-1.5 px-2 flex items-center gap-1.5 shadow-md">
                      <img src="/cplogo_icon.png" alt="CustomerPilot" className="w-5 h-5 object-contain" />
                      <div className="flex flex-col">
                        <span className="text-[6px] text-slate-500 font-bold leading-none">Powered by</span>
                        <span className="text-[9px] font-black text-sky-700 leading-tight">CustomerPilot</span>
                        <span className="text-[5px] text-slate-600 font-semibold leading-none">Turns Every Walkin into LifeTime Customers</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acrylic 3D Base Shadow */}
                <div className="w-full h-4 bg-gradient-to-b from-slate-300 to-slate-200 rounded-b-2xl shadow-xl transform -skew-x-6 mx-auto -mt-1 opacity-90 border-t border-slate-300" />
              </div>
            ) : (
              /* ── OPTION 2: Simple & Professional Standee ── */
              <div className="relative w-full max-w-[320px]">
                <div className="w-full bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border-4 border-indigo-500 text-center relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-full mb-3 shadow-xs">
                    👑 VIP Loyalty Club
                  </div>

                  {/* Merchant Logo */}
                  {qrData?.merchant?.logoUrl && (
                    <div className="flex justify-center mb-1 max-h-12">
                      <img src={qrData.merchant.logoUrl} alt="Store Logo" className="max-h-11 max-w-[180px] object-contain" />
                    </div>
                  )}

                  <span className="font-black text-xl text-slate-900 mb-0.5 block tracking-tight">
                    {storeName}
                  </span>

                  <p className="text-xs text-slate-600 mb-3.5 font-semibold">
                    Scan with WhatsApp • Collect Stamps &amp; Claim Rewards!
                  </p>

                  {/* QR Image Container */}
                  <div className="relative p-3 bg-slate-50 rounded-2xl shadow-inner border-2 border-indigo-100 inline-block">
                    {loading ? (
                      <div className="w-44 h-44 flex items-center justify-center">
                        <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
                      </div>
                    ) : qrData?.qrDataUrl ? (
                      <img src={qrData.qrDataUrl} alt="Store QR Code" className="w-44 h-44 rounded-lg mx-auto" />
                    ) : null}
                  </div>

                  {/* 3 Step Cashier Check-in Box */}
                  <div className="mt-3 p-2 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between text-[9px] font-bold text-indigo-950">
                    <span>1. Scan with Phone</span>
                    <span>➔</span>
                    <span>2. Tap Send on WA</span>
                    <span>➔</span>
                    <span>3. Earn Stamps!</span>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-center gap-2">
                    <img src="/cplogo_icon.png" alt="CustomerPilot" className="w-4 h-4 object-contain" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Powered by CustomerPilot
                    </span>
                  </div>
                </div>

                {/* Acrylic 3D Base Shadow */}
                <div className="w-full h-4 bg-gradient-to-b from-slate-300 to-slate-200 rounded-b-2xl shadow-xl transform -skew-x-6 mx-auto -mt-1 opacity-90 border-t border-slate-300" />
              </div>
            )}
          </div>

          {/* ── Right Column: Features & Highlights ─────────────────────────── */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedDesign === "theme" ? "Option 1: Category Themed Standee" : "Option 2: Simple & Professional Standee"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {selectedDesign === "theme"
                  ? "Vibrant, full-color acrylic tabletop standee designed specifically for your store category, menu & brand aesthetic."
                  : "Clean, minimalist vector standee focusing on high-contrast QR visibility for fast checkout cashiers."}
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span><strong>Merchant Logo Embedded:</strong> Automatically placed in standee header and QR center badge.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span><strong>Zero App Install:</strong> Customers scan with standard phone camera &amp; check-in via WhatsApp.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span><strong>High-Resolution Vector A4:</strong> Ready to print or insert directly into acrylic tabletop standees.</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Printing &amp; Counter Tip:</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Click <strong>&quot;Print A4 Standee&quot;</strong> above to print the currently selected design on standard A4 or glossy photo paper. Place it in a clear L-shaped acrylic holder on your checkout counter.
              </p>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
