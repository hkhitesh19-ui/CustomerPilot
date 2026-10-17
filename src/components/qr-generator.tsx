"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, Printer, Copy, CheckCircle2, Sparkles, RefreshCw, Star, Smartphone, Gift, Layers } from "lucide-react"

export type StandeeDesignType = "review" | "card" | "combo" | "master"

export function QRGenerator({
  merchantId,
  initialDesign,
}: {
  merchantId: string
  initialDesign?: StandeeDesignType
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [downloadingPoster, setDownloadingPoster] = useState(false)
  const [printingPoster, setPrintingPoster] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<StandeeDesignType>(initialDesign || "master")

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

          // Auto-detect best standee if not explicitly provided
          if (!initialDesign && data?.merchant?.enabledModules) {
            const mods = data.merchant.enabledModules as string
            const hasLoyalty = mods.includes("LOYALTY")
            const hasReviews = mods.includes("REVIEWS") || mods.includes("AUTOREPLY")
            const hasCard = mods.includes("DIGITAL_CARD") || !!data.digitalCard

            if (hasLoyalty) {
              setSelectedDesign("master")
            } else if (hasCard && hasReviews) {
              setSelectedDesign("combo")
            } else if (hasCard) {
              setSelectedDesign("card")
            } else if (hasReviews) {
              setSelectedDesign("review")
            }
          }
        } else if (!res.ok && isMounted) {
          toast({ title: "Error", description: json?.error || "Failed to load QR data", variant: "destructive" })
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
  }, [toast, merchantId, initialDesign])

  const storeName = qrData?.merchant?.name || "Merchant Store"
  const qrDataUrl = qrData?.qrDataUrl || ""
  const targetUrl = qrData?.targetUrl || ""
  const enabledModules = (qrData?.merchant?.enabledModules as string) || "LOYALTY,REVIEWS,AUTOREPLY"
  const isLoyaltyOpted = enabledModules.includes("LOYALTY")

  // Copy WhatsApp link
  const handleCopyLink = () => {
    if (!targetUrl) return
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    toast({ title: "Link Copied!", description: "Check-in link copied to clipboard." })
    setTimeout(() => setCopied(false), 2500)
  }

  // Download Standalone QR Code (PNG)
  const handleDownloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = `${storeName.replace(/\s+/g, "_")}-QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded QR", description: "Standalone QR Code image downloaded." })
  }

  // Download High-Resolution Standee Image (JPG)
  const handleDownloadStandeeImage = async () => {
    if (!merchantId) return
    setDownloadingPoster(true)
    try {
      const res = await fetch(`/api/qr/standee?design=${selectedDesign}&format=print&m=${merchantId}`)
      if (!res.ok) throw new Error("Failed to generate standee poster")
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${storeName.replace(/\s+/g, "_")}-${selectedDesign.toUpperCase()}-Standee.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      toast({
        title: "Downloaded Standee!",
        description: `${selectedDesign.toUpperCase()} Standee poster downloaded successfully.`,
      })
    } catch (e: any) {
      toast({ title: "Download Failed", description: e.message || "Could not download standee image", variant: "destructive" })
    } finally {
      setDownloadingPoster(false)
    }
  }

  // Print Standee (A4 Print-Ready)
  const handlePrintStandee = async () => {
    if (!merchantId) {
      toast({ title: "Please wait", description: "Merchant data is loading.", variant: "destructive" })
      return
    }

    setPrintingPoster(true)
    try {
      const res = await fetch(`/api/qr/standee?design=${selectedDesign}&format=print&m=${merchantId}`)
      if (!res.ok) throw new Error("Failed to generate standee poster for printing")
      const blob = await res.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        const standeeDataUrl = reader.result as string
        const safeStoreName = storeName
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")

        const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safeStoreName} - Standee Poster (${selectedDesign.toUpperCase()})</title>
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
      background: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color: #0f172a;
    }
    .print-sheet {
      width: 210mm;
      height: 297mm;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6mm 10mm;
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
        padding: 4mm 6mm;
      }
      .no-print {
        display: none !important;
      }
    }
    .poster-img {
      max-width: 100%;
      max-height: 96%;
      object-fit: contain;
      border-radius: 8px;
    }
    .cut-guide {
      position: absolute;
      bottom: 2mm;
      font-size: 8pt;
      color: #94a3b8;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="print-sheet">
    <img src="${standeeDataUrl}" class="poster-img" alt="Standee Poster" />
    <div class="cut-guide">CustomerPilot High-Resolution A4 Standee &bull; Cut along border for A5 Acrylic Stands</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`

        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.open()
          printWindow.document.write(printHtml)
          printWindow.document.close()
        } else {
          toast({
            title: "Pop-up Blocked",
            description: "Please allow pop-ups to open the print preview window.",
            variant: "destructive",
          })
        }
      }
      reader.readAsDataURL(blob)
    } catch (e: any) {
      toast({
        title: "Print Failed",
        description: e.message || "Could not prepare standee poster for printing",
        variant: "destructive",
      })
    } finally {
      setPrintingPoster(false)
    }
  }

  const TEMPLATE_TABS = [
    {
      id: "review" as StandeeDesignType,
      label: "Google Review Standee",
      badge: "Template A",
      icon: Star,
      desc: "5 Stars, Google Colors, Zero Loyalty Text",
      isRecommended: !isLoyaltyOpted && enabledModules.includes("REVIEWS") && !enabledModules.includes("DIGITAL_CARD"),
    },
    {
      id: "card" as StandeeDesignType,
      label: "Digital Business Card",
      badge: "Template B",
      icon: Smartphone,
      desc: "Save Contact, Menu & Socials, Luxury Gold Frame",
      isRecommended: !isLoyaltyOpted && enabledModules.includes("DIGITAL_CARD") && !enabledModules.includes("REVIEWS"),
    },
    {
      id: "combo" as StandeeDesignType,
      label: "Connect & Review Duo",
      badge: "Template C",
      icon: Layers,
      desc: "Save Contact + 5-Star Review, Dual Power Blocks",
      isRecommended: !isLoyaltyOpted && enabledModules.includes("DIGITAL_CARD") && enabledModules.includes("REVIEWS"),
    },
    {
      id: "master" as StandeeDesignType,
      label: "VIP Loyalty Standee",
      badge: "Template D",
      icon: Gift,
      desc: "Scan to Earn Confirm Rewards & Discounts",
      isRecommended: isLoyaltyOpted,
      requiresLoyalty: true,
    },
  ]

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              Counter QR Standee Studio
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Select your bespoke Standee template tailored to your active business services.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              disabled={loading || !targetUrl}
              size="sm"
              className="rounded-xl border-slate-300 dark:border-slate-700"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> : <Copy className="w-4 h-4 mr-1.5" />}
              {copied ? "Link Copied" : "Copy Link"}
            </Button>
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              disabled={loading || !qrDataUrl}
              size="sm"
              className="rounded-xl border-slate-300 dark:border-slate-700"
            >
              <Download className="w-4 h-4 mr-1.5" /> Download QR
            </Button>
            <Button
              onClick={handleDownloadStandeeImage}
              variant="outline"
              disabled={loading || downloadingPoster}
              size="sm"
              className="rounded-xl border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-bold"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-amber-600" />
              {downloadingPoster ? "Generating..." : "Download Standee (JPG)"}
            </Button>
            <Button
              onClick={handlePrintStandee}
              disabled={loading || printingPoster || !merchantId}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4 mr-1.5" /> {printingPoster ? "Preparing..." : "Print A4 Poster"}
            </Button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TEMPLATE SWITCHER TABS (4 BESPOKE MODULE COMBINATIONS)             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
          {TEMPLATE_TABS.map((tab) => {
            const Icon = tab.icon
            const isSelected = selectedDesign === tab.id
            const isLocked = tab.requiresLoyalty && !isLoyaltyOpted

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedDesign(tab.id)}
                className={`text-left p-3 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                  {tab.isRecommended && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Recommended
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
                      Loyalty Plan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`} />
                  <span className={`text-xs font-bold ${isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-slate-800 dark:text-slate-200"}`}>
                    {tab.label}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {tab.desc}
                </p>
              </button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Generating Standee Artwork...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* LIVE DYNAMIC STANDEE PREVIEW                                      */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="w-full max-w-sm flex flex-col items-center relative">
              <img
                src={`/api/qr/standee?design=${selectedDesign}&m=${merchantId}`}
                alt={`${storeName} ${selectedDesign} Standee Artwork`}
                className="w-full h-auto rounded-[24px] shadow-2xl border-2 border-slate-900 object-contain transition-all"
              />
              <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live {selectedDesign.toUpperCase()} Artwork
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {selectedDesign === "review" && "⭐ Smart AI Google Review"}
                  {selectedDesign === "card" && "📱 Smart Digital Card"}
                  {selectedDesign === "combo" && "🌟 Connect & Review Duo"}
                  {selectedDesign === "master" && "🎁 VIP Loyalty Rewards"}
                </span>
              </div>
            </div>

            {/* Bottom Printing Guidelines */}
            <div className="mt-6 max-w-md w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                Click <strong>&quot;Print A4 Poster&quot;</strong> or <strong>&quot;Download Standee (JPG)&quot;</strong> for instant counter acrylic stands.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
