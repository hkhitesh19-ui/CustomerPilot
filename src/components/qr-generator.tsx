"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, RefreshCw, Printer, Sparkles, CheckCircle2, ZoomIn, ExternalLink } from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────────
 * Standee Design Options (Photorealistic Designer Standees)
 * ─────────────────────────────────────────────────────────────────────────── */

export type StandeeDesignId = "bakery" | "retail" | "pizzeria"

interface StandeeOption {
  id: StandeeDesignId
  number: string
  title: string
  badgeLabel: string
  categoryHint: string
  palette: string
  keyHighlight: string
}

const STANDEE_OPTIONS: Record<StandeeDesignId, StandeeOption> = {
  bakery: {
    id: "bakery",
    number: "Option 1",
    title: "Artisanal Bakery & Cake Studio",
    badgeLabel: "🎂 Bakery & Cake Studio",
    categoryHint: "Best for Bakeries, Cake Shops, Pastry Cafes & Dessert Studios",
    palette: "Ruby Crimson & Warm Gold",
    keyHighlight: "Photorealistic Chocolate Drip Cake with Cherries + Golden Crown & Brush Badge",
  },
  retail: {
    id: "retail",
    number: "Option 2",
    title: "Royal Retail & Lifestyle",
    badgeLabel: "🛍️ Royal Retail & Lifestyle",
    categoryHint: "Best for Fashion Boutiques, Footwear, Electronics & Retail Stores",
    palette: "Royal Sapphire Blue & Amber",
    keyHighlight: "3D VIP Shopping Bags + Golden Sunburst 'Instant ₹100 Off' Badge",
  },
  pizzeria: {
    id: "pizzeria",
    number: "Option 3",
    title: "Fast-Food & Pizzeria",
    badgeLabel: "🍕 Fast-Food & Pizzeria",
    categoryHint: "Best for Pizzerias, Burger Hubs, Fast-Casual Dining & Food Courts",
    palette: "Italian Crimson & Mozzarella Gold",
    keyHighlight: "Sizzling Wood-Fired Pizza with Melted Cheese Pull + Chef Medallion",
  },
}

function detectDefaultDesign(businessType?: string | null, category?: string | null): StandeeDesignId {
  const typeStr = (businessType || "").toUpperCase()
  const catStr = (category || "").toUpperCase()

  if (
    typeStr.includes("RETAIL") ||
    catStr.includes("SHOP") ||
    catStr.includes("STORE") ||
    catStr.includes("CLOTH") ||
    catStr.includes("FURNIT") ||
    catStr.includes("FASHION") ||
    catStr.includes("OPTIC")
  ) {
    return "retail"
  }
  if (
    typeStr.includes("PIZZA") ||
    catStr.includes("PIZZA") ||
    typeStr.includes("BURGER") ||
    catStr.includes("BURGER") ||
    typeStr.includes("FAST") ||
    catStr.includes("FAST") ||
    catStr.includes("DHABA") ||
    catStr.includes("RESTAURANT")
  ) {
    return "pizzeria"
  }
  return "bakery"
}

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)
  const [selectedDesign, setSelectedDesign] = useState<StandeeDesignId>("bakery")
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState<Record<StandeeDesignId, boolean>>({
    bakery: false,
    retail: false,
    pizzeria: false,
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
          const defaultDesign = detectDefaultDesign(data?.merchant?.businessType, data?.merchant?.category)
          setSelectedDesign(defaultDesign)
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
  }, [toast, merchantId])

  const storeName = qrData?.merchant?.name || "Merchant Store"
  const recommendedDesign = detectDefaultDesign(qrData?.merchant?.businessType, qrData?.merchant?.category)

  // Download stand-alone QR code PNG
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

  // Download high-resolution Standee graphic image
  const handleDownloadStandeeHD = (designId: StandeeDesignId) => {
    const standeeUrl = `/api/qr/standee?design=${designId}&m=${merchantId}`
    const link = document.createElement("a")
    link.href = standeeUrl
    link.download = `${storeName.replace(/\s+/g, "_")}-Standee-${designId.toUpperCase()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded Standee HD", description: `Full resolution ${STANDEE_OPTIONS[designId].title} downloaded.` })
  }

  // Print A4 Tabletop Standee (opens printable window with full-bleed high-res artwork)
  const handlePrintStandee = (designId: StandeeDesignId) => {
    const standeeUrl = `/api/qr/standee?design=${designId}&m=${merchantId}&v=${Date.now()}`
    const cfg = STANDEE_OPTIONS[designId]

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Standee - ${cfg.title} - ${storeName}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: #f8fafc;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .standee-print-card {
              max-width: 190mm;
              max-height: 277mm;
              width: 100%;
              height: auto;
              display: block;
              margin: auto;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              border-radius: 8px;
            }
            @media print {
              body {
                background: #ffffff;
                min-height: auto;
              }
              .standee-print-card {
                max-width: 200mm;
                max-height: 287mm;
                width: 100%;
                box-shadow: none;
                border-radius: 0;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <img src="${standeeUrl}" class="standee-print-card" alt="Standee A4" onload="setTimeout(function(){ window.print(); }, 400);" />
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
              3 world-class designer acrylic standees displayed side-by-side with your real store branding, live WhatsApp QR &amp; 1-click A4 printing.
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
              disabled={loading || !merchantId}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print Standee ({STANDEE_OPTIONS[selectedDesign].title})
            </Button>
          </div>
        </div>

        {/* ─── Informative Header Callout ───────────────────────────────────── */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-amber-50/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900/60 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              These are <strong>100% photorealistic studio standees</strong> with your <strong>real scannable WhatsApp QR code</strong> embedded directly. Test scanning with your phone!
            </span>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full whitespace-nowrap">
            Auto-Recommended: {STANDEE_OPTIONS[recommendedDesign].title}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SIDE-BY-SIDE 3-COLUMN STANDEE GRID ("ek sath unsko sho karna he") */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {designsList.map((designId) => {
            const cfg = STANDEE_OPTIONS[designId]
            const isSelected = selectedDesign === designId
            const isRecommended = recommendedDesign === designId
            const standeeImgUrl = merchantId ? `/api/qr/standee?design=${designId}&m=${merchantId}` : ""

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
                      {cfg.number}
                    </span>
                    {isRecommended && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Recommended
                      </span>
                    )}
                    {isSelected && !isRecommended && (
                      <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {cfg.palette}
                  </span>
                </div>

                {/* ── Title & Category Subtitle ── */}
                <div className="mb-3 text-left">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {cfg.badgeLabel}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {cfg.categoryHint}
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
                      alt={cfg.title}
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
                  ⭐ {cfg.keyHighlight}
                </div>

                {/* ── Card Bottom Actions (1-Click Print, Download & Select) ── */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handlePrintStandee(designId)}
                      disabled={loading || !merchantId}
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
                      title="Download Full HD Standee Image (JPEG)"
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
              Click <strong>&quot;Print A4 Standee&quot;</strong> on any design to print directly on 250+ GSM glossy photo paper or coated card. Insert it into a standard clear acrylic L-stand on your billing counter for instant customer scan conversion.
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
