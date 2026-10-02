"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, RefreshCw, Printer, Sparkles, CheckCircle2, ZoomIn, Layers } from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────────
 * Industry Categories & Adaptation Themes
 * ─────────────────────────────────────────────────────────────────────────── */

export type IndustryCategoryId = "bakery" | "dining" | "retail" | "salon" | "pharmacy" | "auto" | "general"
export type StandeeDesignId = "bakery" | "royal" | "celebration"

export interface PerkItem {
  icon: string
  title: string
  desc: string
}

export interface IndustryConfig {
  id: IndustryCategoryId
  label: string
  icon: string
  subtitle: string
  tagline: string
  badgeText: string
  primary: string
  secondary: string
  accent: string
  cardBg: string
  perks: [PerkItem, PerkItem, PerkItem, PerkItem]
  option1Title: string
  option1Badge: string
  option1Highlight: string
}

export const INDUSTRY_CONFIGS: Record<IndustryCategoryId, IndustryConfig> = {
  bakery: {
    id: "bakery",
    label: "Bakery & Desserts",
    icon: "🎂",
    subtitle: "Artisanal Cakes, Fresh Bakes & Confectionery",
    tagline: "FRESH BAKES, PASTRIES & SWEET CELEBRATIONS",
    badgeText: "🎂 VIP CAKE LOVERS CLUB",
    primary: "#7f1d1d", // ruby crimson
    secondary: "#991b1b",
    accent: "#b45309", // warm gold
    cardBg: "#fffbeb",
    perks: [
      { icon: "🪙", title: "1 Stamp Every ₹300+", desc: "Collect stamps to unlock free bakery delights" },
      { icon: "🎁", title: "Instant Welcome Treat", desc: "Special sweet discount coupon on your first visit" },
      { icon: "🎂", title: "Free Birthday Cake", desc: "Complimentary handcrafted cake on your birthday" },
      { icon: "⭐", title: "5% VIP Store Credit", desc: "Automatic loyalty balance credited on every order" },
    ],
    option1Title: "Artisanal Bakery & Cake Studio",
    option1Badge: "🎂 Artisanal Bakery & Cake Studio",
    option1Highlight: "Photorealistic Chocolate Drip Cake with Cherries + Golden Crown & Brush Badge",
  },
  dining: {
    id: "dining",
    label: "Cafe & Dining",
    icon: "☕",
    subtitle: "Gourmet Coffee, Bistro & Artisanal Dining",
    tagline: "GOURMET COFFEE, BISTRO & ARTISANAL DINING",
    badgeText: "☕ ARTISANAL CAFE & DINING CLUB",
    primary: "#451a03", // rich espresso
    secondary: "#78350f",
    accent: "#d97706", // warm amber
    cardBg: "#fffbeb",
    perks: [
      { icon: "🪙", title: "1 Stamp on Every Visit", desc: "Earn loyalty stamps with every beverage & meal" },
      { icon: "☕", title: "Free Beverage on 5th Visit", desc: "Complimentary handcrafted coffee or mocktail" },
      { icon: "🍕", title: "Birthday Dining Treat", desc: "Celebrate with special chef dessert on your birthday" },
      { icon: "⚡", title: "Priority Table & 10% Off", desc: "Skip the queue with instant VIP counter privileges" },
    ],
    option1Title: "Artisanal Cafe & Bistro Lounge",
    option1Badge: "☕ Artisanal Cafe & Bistro Lounge",
    option1Highlight: "Warm Roasted Espresso & Rich Timber Aesthetics with Counter Presentation",
  },
  retail: {
    id: "retail",
    label: "Retail & Fashion",
    icon: "🛍️",
    subtitle: "Apparel, Boutiques, Supermarkets & Jewelry",
    tagline: "EXCLUSIVE PRIVILEGE MEMBERSHIP & REWARDS",
    badgeText: "🛍️ VIP SHOPPERS CLUB",
    primary: "#0f2942", // sapphire navy
    secondary: "#1e3a8a",
    accent: "#d97706", // gold amber
    cardBg: "#f8fafc",
    perks: [
      { icon: "🪙", title: "1 Stamp Every ₹1000", desc: "Accumulate stamps towards massive bill discounts" },
      { icon: "🏷️", title: "Instant ₹100 Off Today", desc: "Applied directly to your billing counter invoice" },
      { icon: "🎉", title: "Birthday VIP Hamper", desc: "Exclusive luxury gift box on your special month" },
      { icon: "💎", title: "Early Sale Previews", desc: "Shop seasonal collections 48 hours before the public" },
    ],
    option1Title: "Luxury Retail & Fashion Boutique",
    option1Badge: "🛍️ Luxury Retail & Fashion Boutique",
    option1Highlight: "High-Fashion Editorial Style with Metallic Accents & Premium Pedestal",
  },
  salon: {
    id: "salon",
    label: "Salon & Wellness",
    icon: "💇",
    subtitle: "Hair Studios, Beauty Parlours, Spas & Grooming",
    tagline: "LUXURY BEAUTY, GROOMING & SPA PRIVILEGES",
    badgeText: "✨ VIP BEAUTY & SPA CLUB",
    primary: "#4a044e", // deep velvet plum
    secondary: "#701a75",
    accent: "#e11d48", // rose gold
    cardBg: "#fff1f2",
    perks: [
      { icon: "🪙", title: "1 Stamp Every Visit", desc: "Redeem for premium hair & skin therapy sessions" },
      { icon: "💆", title: "Free Head Massage", desc: "Complimentary relaxing treatment on your 4th service" },
      { icon: "🎂", title: "Birthday Glow Voucher", desc: "Free salon upgrade during your birthday week" },
      { icon: "✨", title: "Priority VIP Booking", desc: "Direct WhatsApp concierge for instant appointments" },
    ],
    option1Title: "Luxury Salon & Aesthetics Studio",
    option1Badge: "💇 Luxury Salon & Aesthetics Studio",
    option1Highlight: "Blossom Rose Gold & Velvet Plum with High-Gloss Acrylic Finish",
  },
  pharmacy: {
    id: "pharmacy",
    label: "Pharmacy & Health",
    icon: "💊",
    subtitle: "Chemists, Clinics, Diagnostics & Healthcare",
    tagline: "TRUSTED HEALTHCARE & WELLNESS ADVANTAGE",
    badgeText: "🌿 WELLNESS CARE PRIVILEGE",
    primary: "#064e3b", // emerald
    secondary: "#047857",
    accent: "#0d9488", // teal
    cardBg: "#f0fdf4",
    perks: [
      { icon: "🪙", title: "1 Point per ₹100", desc: "Redeem against prescription & OTC healthcare products" },
      { icon: "📦", title: "Free Home Delivery", desc: "Zero delivery fees on all regular monthly orders" },
      { icon: "🩺", title: "Quarterly Health Screen", desc: "Complimentary blood pressure, sugar & BMI checks" },
      { icon: "⚡", title: "10% Off Wellness Brands", desc: "Exclusive savings on vitamins & nutritional supplements" },
    ],
    option1Title: "Trusted Pharmacy & Wellness Care",
    option1Badge: "💊 Trusted Pharmacy & Wellness Care",
    option1Highlight: "Clean Emerald Forest & Medical Cross Branding with Pristine Counter Clarity",
  },
  auto: {
    id: "auto",
    label: "Auto & Services",
    icon: "🚗",
    subtitle: "Car Detailing, Garages, Repair & Hardware",
    tagline: "PREMIUM VEHICLE CARE & SERVICE REWARDS",
    badgeText: "🛠️ ELITE DRIVERS PRIVILEGE",
    primary: "#0f172a", // carbon slate
    secondary: "#1e293b",
    accent: "#2563eb", // cobalt blue
    cardBg: "#f1f5f9",
    perks: [
      { icon: "🪙", title: "1 Stamp per Service Visit", desc: "Unlock free premium foam wash & tyre rotation" },
      { icon: "🚗", title: "Free 15-Point Inspection", desc: "Complete safety diagnostic before long highway road trips" },
      { icon: "🛠️", title: "Flat ₹500 Off Next Service", desc: "Applied instantly at billing counter on routine service" },
      { icon: "⚡", title: "24/7 Breakdown Help", desc: "Priority emergency WhatsApp roadside support assistance" },
    ],
    option1Title: "Elite Auto Care & Service Garage",
    option1Badge: "🚗 Elite Auto Care & Service Garage",
    option1Highlight: "Titanium Slate & Electric Cobalt with Heavy-Duty Clear Acrylic Base",
  },
  general: {
    id: "general",
    label: "Universal VIP Club",
    icon: "⭐",
    subtitle: "Corporate, Commercial & Universal Businesses",
    tagline: "EXCLUSIVE PRIVILEGE MEMBERSHIP & REWARDS",
    badgeText: "⭐ VIP MEMBER CLUB",
    primary: "#09090b", // onyx black
    secondary: "#18181b",
    accent: "#f59e0b", // amber gold
    cardBg: "#fafafa",
    perks: [
      { icon: "🪙", title: "1 Stamp on Every Visit", desc: "Zero minimum spend to collect stamps on every billing" },
      { icon: "🎁", title: "Instant Welcome Reward", desc: "Special member voucher on your very first scan" },
      { icon: "🎉", title: "Birthday Member Surprise", desc: "Celebrate your special day with exclusive gift treats" },
      { icon: "💎", title: "VIP Customer Concierge", desc: "Dedicated priority support and instant rewards tracking" },
    ],
    option1Title: "Modern Onyx & Gold VIP Standee",
    option1Badge: "⭐ Modern Onyx & Gold VIP Standee",
    option1Highlight: "Polished Minimalist Onyx & Brushed Brass with Scannable High-Contrast QR",
  },
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Standee Design Options (Photorealistic Designer Standees)
 * ─────────────────────────────────────────────────────────────────────────── */

interface StandeeOption {
  id: StandeeDesignId
  number: string
  title: string
  badgeLabel: string
  palette: string
  keyHighlight: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  cardBg: string
}

export const STANDEE_BASE_OPTIONS: Record<StandeeDesignId, StandeeOption> = {
  bakery: {
    id: "bakery",
    number: "Option 1",
    title: "Industry Signature Standee",
    badgeLabel: "🎨 Industry Signature Design",
    palette: "Industry Tailored Colors",
    keyHighlight: "Curated specifically to your store's business category & aesthetic",
    primaryColor: "#7f1d1d",
    secondaryColor: "#991b1b",
    accentColor: "#b45309",
    cardBg: "#fffbeb",
  },
  royal: {
    id: "royal",
    number: "Option 2",
    title: "Royal Sapphire & Gold VIP Club",
    badgeLabel: "👑 Royal Sapphire & Gold VIP Club",
    palette: "Royal Sapphire Blue & Amber",
    keyHighlight: "Tiered Luxury Velvet Theme & Royal Gold Medallion with VIP Status",
    primaryColor: "#0f2942",
    secondaryColor: "#1e3a8a",
    accentColor: "#d97706",
    cardBg: "#f8fafc",
  },
  celebration: {
    id: "celebration",
    number: "Option 3",
    title: "Sweet Celebrations & Rewards Lounge",
    badgeLabel: "🍓 Sweet Celebrations & Rewards Lounge",
    palette: "Rose Bronze & Warm Copper",
    keyHighlight: "Festive Gourmet Dessert Aesthetics + 'SCAN TO JOIN VIP' Gold Badge",
    primaryColor: "#581c87",
    secondaryColor: "#701a75",
    accentColor: "#ea580c",
    cardBg: "#fff7ed",
  },
}

/**
 * Auto-detects the industry category from merchant business type, category, or store name
 */
export function detectIndustryCategory(businessType?: string | null, category?: string | null, name?: string | null): IndustryCategoryId {
  const combined = `${businessType || ""} ${category || ""} ${name || ""}`.toLowerCase()

  if (combined.match(/cake|bake|bakery|pastry|patisserie|sweet|dessert|mithai|cookie|bread|waffle|chocolat/i)) {
    return "bakery"
  }
  if (combined.match(/cafe|coffee|restaurant|bistro|pizza|pizzeria|burger|food|dining|bar|kitchen|diner|eatery/i)) {
    return "dining"
  }
  if (combined.match(/salon|spa|beauty|hair|grooming|parlour|parlor|skin|nail|barber|makeup|wellness/i)) {
    return "salon"
  }
  if (combined.match(/pharma|pharmacy|chemist|medical|health|care|clinic|optics|dental|hospital|drug/i)) {
    return "pharmacy"
  }
  if (combined.match(/auto|car|wash|garage|bike|motors|tyre|tire|repair|hardware|service|detailing/i)) {
    return "auto"
  }
  if (combined.match(/retail|fashion|boutique|cloth|garment|wear|jewel|jewellery|store|mart|shop|supermarket|apparel/i)) {
    return "retail"
  }
  return "general"
}

/* ─────────────────────────────────────────────────────────────────────────────
 * High-Resolution Printable Standee Generator (Full A4 Insert with Trim Guides)
 * ─────────────────────────────────────────────────────────────────────────── */

function generatePrintableStandeeHtml(
  designId: StandeeDesignId,
  merchantId: string,
  storeName: string
): string {
  const standeeUrl = `/api/qr/standee?design=${designId}&m=${merchantId}&format=print&v=${Date.now()}`
  
  const titleMap: Record<StandeeDesignId, string> = {
    bakery: "Artisanal Bakery & Cake Studio",
    royal: "Royal Sapphire & Gold VIP Club",
    celebration: "Sweet Celebrations & Rewards Lounge",
  }
  const title = titleMap[designId] || "VIP Loyalty Standee"

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Print Standee - ${title} - ${storeName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-sheet {
      width: 210mm;
      height: 297mm;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 8mm 10mm 6mm 10mm;
      box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    }
    @media print {
      body {
        background: #ffffff;
      }
      .print-sheet {
        box-shadow: none;
        width: 100vw;
        height: 100vh;
        max-width: 210mm;
        max-height: 297mm;
        page-break-after: avoid;
        page-break-inside: avoid;
        padding: 6mm 8mm 4mm 8mm;
      }
      .no-print {
        display: none !important;
      }
    }

    /* Outer Scissor Trim Guidelines for Standard Acrylic Stands */
    .trim-guide-box {
      position: relative;
      width: 100%;
      height: 268mm;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1.5px dashed #cbd5e1;
      border-radius: 8px;
      padding: 3mm;
      background: #fafafa;
    }
    .trim-label-top {
      position: absolute;
      top: -6px;
      left: 20px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .trim-label-bottom {
      position: absolute;
      bottom: -6px;
      right: 20px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* The Real Standee Artwork - Preserves 100% of Design, Artwork & Wordings */
    .standee-poster-image {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: 258mm;
      object-fit: contain;
      border-radius: 6px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      display: block;
    }

    /* Sheet Footer */
    .print-footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
      padding-top: 3mm;
      border-top: 1px solid #e2e8f0;
    }
    .footer-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-right {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      color: #0f172a;
    }

    /* Top Floating Print Bar (Hidden during print) */
    .print-bar {
      position: fixed;
      top: 15px;
      right: 15px;
      z-index: 100;
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37,99,235,0.4);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover {
      background: #1d4ed8;
    }
    .paper-hint {
      background: rgba(15, 23, 42, 0.9);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 14px;
      border-radius: 8px;
      backdrop-blur: 4px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn-close {
      background: #475569;
      color: #ffffff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <span class="paper-hint">📐 Paper: A4 Portrait (250+ GSM Photo Card recommended)</span>
    <button class="btn-print" onclick="window.print()">🖨️ Print Standee Sheet</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="print-sheet">
    <!-- Outer Trim & Crop Box for Standard Counter Acrylic Stands -->
    <div class="trim-guide-box">
      <span class="trim-label-top">✂️ Cut along dashed line to insert into Counter Acrylic Stand</span>
      
      <!-- 100% REAL STANDEE ARTWORK WITH CHOSEN DESIGN, PHOTOS & WORDINGS -->
      <img
        src="${standeeUrl}"
        alt="${title}"
        class="standee-poster-image"
        onload="setTimeout(function(){ window.print(); }, 500);"
      />

      <span class="trim-label-bottom">Standard A4 / A5 / 6×8" Tabletop Acrylic Stand Insert</span>
    </div>

    <!-- Printable Sheet Footer -->
    <div class="print-footer">
      <div class="footer-left">
        <span>📍 ${storeName} • Official Billing Counter VIP Standee</span>
        <span>• No App Download Needed (WhatsApp Integrated)</span>
      </div>
      <div class="footer-right">
        <span>CustomerPilot</span>
        <span>• Smart Retention Partner</span>
      </div>
    </div>
  </div>
</body>
</html>`
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Main Component
 * ─────────────────────────────────────────────────────────────────────────── */

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryCategoryId>("bakery")
  const [selectedDesign, setSelectedDesign] = useState<StandeeDesignId>("bakery")
  const [autoIndustry, setAutoIndustry] = useState<IndustryCategoryId>("bakery")
  const [isManualCategory, setIsManualCategory] = useState(false)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState<Record<StandeeDesignId, boolean>>({
    bakery: false,
    royal: false,
    celebration: false,
  })

  useEffect(() => {
    let isMounted = true
    async function loadQR() {
      if (!merchantId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/qr/generate?type=counter`, {
          headers: { "x-merchant-id": merchantId },
        })
        const json = await res.json().catch(() => null)
        if (res.ok && json && isMounted) {
          const data = json.data || json
          setQrData(data)

          // Auto-detect industry theme based on merchant's registered business category and name
          const detected = detectIndustryCategory(data?.merchant?.businessType, data?.merchant?.category, data?.merchant?.name)
          setAutoIndustry(detected)
          if (!isManualCategory) {
            setSelectedIndustry(detected)
          }
        } else if (!res.ok && isMounted) {
          toast({ title: "Error", description: json?.error || "Failed to load standee data", variant: "destructive" })
        }
      } catch (e: any) {
        if (isMounted) toast({ title: "Error", description: e.message, variant: "destructive" })
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadQR()
    return () => {
      isMounted = false
    }
  }, [toast, merchantId, isManualCategory])

  const storeName = qrData?.merchant?.name || "Merchant Store"
  const storeLogo = qrData?.merchant?.logoUrl || null
  const branchCity = qrData?.merchant?.city || null
  const activeIndustryConfig = INDUSTRY_CONFIGS[selectedIndustry] || INDUSTRY_CONFIGS.bakery

  // Standalone QR code download
  const handleDownloadQROnly = () => {
    if (!qrData?.qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrData.qrDataUrl
    link.download = `${storeName.replace(/\s+/g, "_")}-QR-Code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded QR", description: "Standalone VIP Loyalty QR Code downloaded successfully." })
  }

  // 3D Tabletop Mockup Download
  const handleDownloadStandeeHD = (designId: StandeeDesignId) => {
    const standeeUrl = `/api/qr/standee?design=${designId}&m=${merchantId}`
    const link = document.createElement("a")
    link.href = standeeUrl
    link.download = `${storeName.replace(/\s+/g, "_")}-Standee-${designId.toUpperCase()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded Standee HD", description: `Full resolution standee mockup downloaded.` })
  }

  // True High-Resolution Printable A4 Sheet Generator
  // Preserves 100% of the exact design, food photography, colors & wordings of the selected option
  const handlePrintStandee = (designId: StandeeDesignId) => {
    if (!merchantId) {
      toast({ title: "Please wait", description: "Merchant data is still loading.", variant: "destructive" })
      return
    }

    const printHtml = generatePrintableStandeeHtml(
      designId,
      merchantId,
      storeName
    )

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHtml)
      printWindow.document.close()
    }
  }

  const designsList: StandeeDesignId[] = ["bakery", "royal", "celebration"]
  const industryList: IndustryCategoryId[] = ["bakery", "dining", "retail", "salon", "pharmacy", "auto", "general"]

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
              3 world-class designer acrylic standees displayed side-by-side with your real store branding, live WhatsApp QR &amp; 1-click A4 printable format.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleDownloadQROnly}
              variant="outline"
              disabled={loading || !qrData}
              size="sm"
              className="rounded-xl border-slate-300 dark:border-slate-700"
            >
              <Download className="w-4 h-4 mr-1.5" /> Download QR Only
            </Button>
            <Button
              onClick={() => handlePrintStandee(selectedDesign)}
              disabled={loading || !merchantId || !qrData}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print A4 Standee Sheet
            </Button>
          </div>
        </div>

        {/* ─── Informative Header Callout ───────────────────────────────────── */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900/60 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Themes adapt dynamically to your business category! Click <strong>&quot;Print A4 Standee&quot;</strong> to get a pure printable insert with crop/trim lines ready for acrylic stands.
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Auto-Detected: {INDUSTRY_CONFIGS[autoIndustry].label}
          </span>
        </div>

        {/* ─── Interactive Industry Theme Adaptor (Requirement 1) ────────────── */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Adapt Theme for Your Business Category:
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Active: <strong>{activeIndustryConfig.icon} {activeIndustryConfig.label}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {industryList.map((indId) => {
              const cfg = INDUSTRY_CONFIGS[indId]
              const isSelected = selectedIndustry === indId
              const isDetected = autoIndustry === indId

              return (
                <button
                  key={indId}
                  onClick={() => {
                    setSelectedIndustry(indId)
                    setIsManualCategory(true)
                    toast({
                      title: `Theme adapted to ${cfg.label}`,
                      description: `Standee designs and printables updated with ${cfg.label} perks & styling.`,
                    })
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.label}</span>
                  {isDetected && (
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 rounded font-black ml-0.5">
                      Auto
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SIDE-BY-SIDE 3-COLUMN STANDEE GRID ("ek sath unsko sho karna he") */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {designsList.map((designId) => {
            const baseCfg = STANDEE_BASE_OPTIONS[designId]
            const isSelected = selectedDesign === designId
            const standeeImgUrl = merchantId ? `/api/qr/standee?design=${designId}&m=${merchantId}` : ""

            // Dynamic titles and badges adapted per industry
            let displayTitle = baseCfg.title
            let displayBadge = baseCfg.badgeLabel
            let displayHighlight = baseCfg.keyHighlight
            let displayPalette = baseCfg.palette

            if (designId === "bakery") {
              displayTitle = activeIndustryConfig.option1Title
              displayBadge = activeIndustryConfig.option1Badge
              displayHighlight = activeIndustryConfig.option1Highlight
              displayPalette = activeIndustryConfig.label
            }

            return (
              <div
                key={designId}
                className={`relative rounded-3xl transition-all duration-300 border-2 p-4 flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-500 shadow-2xl bg-indigo-50/20 dark:bg-indigo-950/20 ring-4 ring-indigo-500/10"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 shadow-md"
                }`}
              >
                {/* ── Card Top: Badge & Recommendation ── */}
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
                      {baseCfg.number}
                    </span>
                    {designId === "bakery" && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        {activeIndustryConfig.icon} Adapted Theme
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {displayPalette}
                  </span>
                </div>

                {/* ── Title & Category Subtitle ── */}
                <div className="mb-3 text-left">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {displayBadge}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {displayTitle}
                  </p>
                </div>

                {/* ── Photorealistic Studio Tabletop Standee Preview ── */}
                <div className="relative w-full aspect-[848/1264] rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 group">
                  {/* Loading Spinner */}
                  {!imgLoaded[designId] && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 gap-2 z-10">
                      <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                      <span className="text-xs font-semibold">Generating HD Standee...</span>
                    </div>
                  )}

                  {/* Real Photorealistic Composite Image with Live Embedded QR */}
                  {standeeImgUrl && (
                    <img
                      src={standeeImgUrl}
                      alt={displayTitle}
                      onLoad={() => setImgLoaded((prev) => ({ ...prev, [designId]: true }))}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  )}

                  {/* Interactive Hover Zoom Pill */}
                  <button
                    onClick={() => setZoomImage(standeeImgUrl)}
                    className="absolute top-2.5 right-2.5 bg-black/75 hover:bg-black/90 backdrop-blur-xs text-white text-[11px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom HD</span>
                  </button>

                  {/* Bottom Scan Verification Tag */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold py-1 px-2 rounded-lg text-center opacity-90">
                    ⛶ Scannable Live QR • Test with your phone
                  </div>
                </div>

                {/* ── Key Highlight ── */}
                <div className="mt-2.5 text-[11px] text-slate-600 dark:text-slate-400 text-left line-clamp-1">
                  ⭐ {displayHighlight}
                </div>

                {/* ── Card Bottom Actions (1-Click Print, Download & Select) ── */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePrintStandee(designId)}
                      disabled={loading || !merchantId || !qrData}
                      size="sm"
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl shadow-xs text-xs"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print A4 Standee
                    </Button>
                    <Button
                      onClick={() => handleDownloadStandeeHD(designId)}
                      variant="outline"
                      disabled={loading || !merchantId}
                      size="sm"
                      className="rounded-xl px-2.5 border-slate-300 dark:border-slate-700"
                      title="Download Full HD Standee 3D Mockup (JPEG)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDesign(designId)
                      toast({
                        title: `${displayTitle} Selected`,
                        description: "Set as your active standee template for top print action.",
                      })
                    }}
                    className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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

        {/* ─── Bottom Printing Guidelines ───────────────────────────────────── */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Counter Setup &amp; Material Guidelines:
            </span>
            <p>
              Clicking <strong>&quot;Print A4 Standee&quot;</strong> generates a dedicated <strong>2D A4 printable insert sheet</strong> with scissor trim guides for standard 6×8&quot; or A5 acrylic L-stands. Print on 250+ GSM coated card for best counter clarity.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> High-Resolution 600 DPI Vector QR
            </span>
          </div>
        </div>
      </CardContent>

      {/* ─── High-Res Fullscreen Zoom Modal ───────────────────────────────── */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={zoomImage} alt="Standee Zoom" className="w-full h-auto max-h-[85vh] object-contain" />
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 text-xs font-bold transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
