"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Star, Download, Printer, Copy, CheckCircle2, Sparkles, ExternalLink, RefreshCw } from "lucide-react"

interface GoogleReviewQRGeneratorProps {
  merchantId: string
  googleReviewUrl?: string | null
  placeName?: string | null
}

function GoogleWordmark({ className = "text-3xl" }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight select-none inline-block ${className}`} style={{ fontFamily: 'Product Sans, Poppins, -apple-system, sans-serif' }}>
      <span className="text-[#4285F4]">G</span>
      <span className="text-[#EA4335]">o</span>
      <span className="text-[#FBBC05]">o</span>
      <span className="text-[#4285F4]">g</span>
      <span className="text-[#34A853]">l</span>
      <span className="text-[#EA4335]">e</span>
    </span>
  )
}

export function GoogleReviewQRGenerator({ merchantId, googleReviewUrl, placeName }: GoogleReviewQRGeneratorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrType, setQrType] = useState<string>("review_counter")
  const [qrData, setQrData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadQR() {
      if (!merchantId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/qr/generate?mode=reviews&type=${qrType}`, {
          headers: { "x-merchant-id": merchantId }
        })
        const json = await res.json().catch(() => null)
        if (res.ok && json && isMounted) {
          setQrData(json.data || json)
        } else if (!res.ok && isMounted) {
          toast({ title: "Error", description: json?.error || "Failed to generate Reviews QR", variant: "destructive" })
        }
      } catch (e: any) {
        if (isMounted) toast({ title: "Error", description: e.message, variant: "destructive" })
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadQR()
    return () => { isMounted = false }
  }, [toast, merchantId, qrType])

  const handleCopyLink = () => {
    if (!qrData?.targetUrl) return
    navigator.clipboard.writeText(qrData.targetUrl)
    setCopied(true)
    toast({ title: "Link Copied!", description: "Smart AI Google Review link copied to clipboard." })
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownloadPNG = () => {
    if (!qrData?.qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrData.qrDataUrl
    link.download = `SmartAI-Google-Review-${qrType}-QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded PNG", description: "SmartAI Google Review QR downloaded successfully." })
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * Print High-Res A4 Acrylic Standee
   * ─────────────────────────────────────────────────────────────────────── */
  const handlePrintStandeePDF = () => {
    if (!qrData?.qrDataUrl) return
    const storeName = qrData?.merchant?.name || placeName || "Our Store"

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Smart AI Google Review Standee - ${storeName}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&family=Product+Sans:wght@700;900&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 0; }
            * { box-sizing: border-box; }
            body {
              font-family: 'Poppins', -apple-system, sans-serif;
              background: #f1f5f9;
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
              background: linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 35%, #FFFFFF 75%, #F4F9FF 100%);
              border-radius: 28px;
              border: 1px solid #cbd5e1;
              box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
              text-align: center;
              overflow: hidden;
              position: relative;
            }
            .standee-body {
              padding: 28px 24px 22px 24px;
            }
            .ai-powered {
              font-size: 14px;
              font-weight: 700;
              color: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
              margin-bottom: 6px;
            }
            .smart-badge {
              display: inline-block;
              background: #000000;
              color: #ffffff;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 1.2px;
              text-transform: uppercase;
              padding: 6px 20px;
              border-radius: 9999px;
              margin-bottom: 16px;
            }
            .store-pill {
              font-size: 12px;
              font-weight: 700;
              color: #334155;
              background: rgba(226, 232, 240, 0.6);
              display: inline-block;
              padding: 4px 14px;
              border-radius: 8px;
              margin-bottom: 12px;
            }
            .leave-us {
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .google-wordmark {
              font-size: 46px;
              font-weight: 900;
              letter-spacing: -1.5px;
              line-height: 1;
              margin-bottom: 4px;
              font-family: 'Product Sans', 'Poppins', sans-serif;
            }
            .stars-review {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              margin-bottom: 18px;
            }
            .stars-row {
              color: #FBBC05;
              font-size: 24px;
              letter-spacing: 2px;
              line-height: 1;
            }
            .review-text {
              font-size: 17px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .qr-wrapper {
              position: relative;
              background: #ffffff;
              padding: 16px;
              border-radius: 20px;
              display: inline-block;
              margin: 4px 0 16px 0;
            }
            .bracket {
              position: absolute;
              width: 50px;
              height: 50px;
              pointer-events: none;
            }
            .bracket-tl {
              top: -2px;
              left: -2px;
              border-top: 6px solid #EA4335;
              border-left: 6px solid #EA4335;
              border-top-left-radius: 14px;
            }
            .bracket-tr {
              top: -2px;
              right: -2px;
              border-top: 6px solid #FBBC05;
              border-right: 6px solid #FBBC05;
              border-top-right-radius: 14px;
            }
            .bracket-bl {
              bottom: -2px;
              left: -2px;
              border-bottom: 6px solid #34A853;
              border-left: 6px solid #34A853;
              border-bottom-left-radius: 14px;
            }
            .bracket-br {
              bottom: -2px;
              right: -2px;
              border-bottom: 6px solid #4285F4;
              border-right: 6px solid #4285F4;
              border-bottom-right-radius: 14px;
            }
            .qr-image {
              width: 210px;
              height: 210px;
              display: block;
              border-radius: 8px;
            }
            .bottom-banner {
              background: #0B132B;
              color: #ffffff;
              padding: 14px 16px;
              margin-top: 10px;
              border-top: 1px solid rgba(255,255,255,0.1);
            }
            .powered-line {
              font-size: 9px;
              color: #38bdf8;
              letter-spacing: 2px;
              margin-bottom: 2px;
              font-weight: 700;
            }
            .brand-line {
              font-size: 12px;
              font-weight: 900;
              letter-spacing: 0.5px;
              color: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="standee-body">
              <div class="ai-powered">
                <span style="color:#000000">✦</span> Ai - Powered
              </div>
              <div class="smart-badge">Smart Ai GoogleReview QR</div>
              
              ${qrData?.merchant?.logoUrl ? `
                <div style="display:flex; justify-content:center; align-items:center; min-height:50px; margin: 4px auto 8px auto;">
                  <img src="${qrData.merchant.logoUrl}" style="max-height:55px; max-width:180px; width:auto; height:auto; object-fit:contain; border-radius:10px; background:#ffffff; padding:4px; border:1px solid #cbd5e1;" />
                </div>
              ` : ''}

              ${storeName ? `<div class="store-pill">${storeName}</div>` : ''}

              <div class="leave-us">LEAVE US A</div>
              <div class="google-wordmark">
                <span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span>
              </div>
              <div class="stars-review">
                <span class="stars-row">★★★★★</span>
                <span class="review-text">REVIEW!</span>
              </div>

              <div class="qr-wrapper">
                <div class="bracket bracket-tl"></div>
                <div class="bracket bracket-tr"></div>
                <div class="bracket bracket-bl"></div>
                <div class="bracket bracket-br"></div>
                <img src="${qrData.qrDataUrl}" class="qr-image" alt="QR" />
              </div>
            </div>

            <div class="bottom-banner">
              <div class="powered-line">---- Powered By ----</div>
              <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin-top:3px;">
                <img src="/cplogo_icon.png" style="width:18px; height:18px; border-radius:4px; object-fit:contain;" />
                <span class="brand-line">CustomerPilot - YourReview Partner</span>
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
      printWindow.document.write(printContent)
      printWindow.document.close()
    }
  }

  const storeName = qrData?.merchant?.name || placeName || "Our Store"

  return (
    <Card className="bg-white/90 dark:bg-slate-900/60 border-amber-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-red-500 via-amber-400 to-green-500" />
      
      <CardHeader className="bg-amber-50/40 dark:bg-slate-900/40 border-b border-amber-100 dark:border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              Smart Ai Google Reviews QR Standee &amp; Posters
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Official Acrylic Tabletop Standee designed for maximum 5-star Google review conversions.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={loading || !qrData?.targetUrl}
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPNG}
              disabled={loading || !qrData?.qrDataUrl}
              className="border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded-xl"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download QR
            </Button>
            <Button
              size="sm"
              onClick={handlePrintStandeePDF}
              disabled={loading || !qrData?.qrDataUrl}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 rounded-xl"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print A4 Standee
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── Left Column: Controls & Information ───────────────────────── */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Choose QR Standee Placement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "review_counter", label: "Counter Standee", icon: "🏢" },
                  { id: "review_table", label: "Table Tent Card", icon: "🍽️" },
                  { id: "review_sticker", label: "Bill / Box Sticker", icon: "🏷️" },
                  { id: "review_poster", label: "Window Poster", icon: "🖼️" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQrType(item.id)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      qrType === item.id
                        ? "bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm font-bold"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/40 dark:border-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Review Benefit Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-blue-50/50 dark:from-slate-800/60 dark:to-slate-900/60 border border-amber-200/60 dark:border-slate-700/60 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Smart AI Google Review Standee Highlights:</span>
              </div>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Instant 5-Star Reviews:</strong> Pre-fills 5-star rating and opens customer's camera immediately without app install.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>AI Keyword-Rich Draft:</strong> Generates localized SEO-rich review text matching customer's experience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Ready for Acrylic Fabrication:</strong> High-definition vector layout ready to print or insert directly into store counter standees.</span>
                </li>
              </ul>
            </div>

            {/* Review Link Display */}
            {qrData?.targetUrl && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Target Google Review URL:
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 font-mono break-all">
                  <span className="flex-1 truncate">{qrData.targetUrl}</span>
                  <a href={qrData.targetUrl} target="_blank" rel="noreferrer" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Live Mockup Preview (Prominent Centered Acrylic Standee) ── */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center pt-2">
            
            {/* Mockup Canvas */}
            <div className="relative w-full max-w-[420px] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-100/80 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
              
              {/* ── The Acrylic Standee ───────────────── */}
              <div className="relative w-[290px] sm:w-[320px]">
                
                {/* Standee Body */}
                <div className="bg-gradient-to-b from-[#F0F7FF] via-white via-70% to-[#F4F9FF] text-slate-900 rounded-3xl pt-6 pb-0 shadow-2xl border-2 border-slate-200/90 text-center relative overflow-hidden">
                  
                  {/* Top Sparkle + AI - Powered */}
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
                    <span>Ai - Powered</span>
                  </div>

                  {/* Smart Ai GoogleReview QR pill */}
                  <div className="inline-block bg-black text-white text-[10px] font-black tracking-wider uppercase px-4 py-1.5 rounded-full mb-2 shadow-xs">
                    Smart Ai GoogleReview QR
                  </div>

                  {/* Merchant Business Logo */}
                  {qrData?.merchant?.logoUrl && (
                    <div className="flex flex-col items-center justify-center my-1 min-h-[46px]">
                      <img
                        src={qrData.merchant.logoUrl}
                        alt={storeName}
                        className="max-h-12 max-w-[180px] w-auto h-auto object-contain p-1 rounded-xl bg-white/95 border border-slate-200/90 shadow-xs"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                  )}

                  {/* Store Name Badge */}
                  {storeName && (
                    <div className="mb-1.5">
                      <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 px-3 py-0.5 rounded-md inline-block max-w-[220px] truncate">
                        {storeName}
                      </span>
                    </div>
                  )}

                  {/* LEAVE US A */}
                  <div className="text-[11px] font-extrabold tracking-widest text-slate-900 uppercase">
                    LEAVE US A
                  </div>

                  {/* Google Wordmark */}
                  <div className="my-0.5">
                    <GoogleWordmark className="text-3xl sm:text-4xl" />
                  </div>

                  {/* Stars + REVIEW! */}
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <div className="flex items-center text-[#FBBC05] text-base leading-none">
                      ★ ★ ★ ★ ★
                    </div>
                    <span className="text-xs font-black text-slate-900 tracking-wide">
                      REVIEW!
                    </span>
                  </div>

                  {/* QR Code Container with 4-Color Google Corner Brackets */}
                  <div className="relative inline-block p-3.5 bg-white rounded-2xl shadow-sm my-1">
                    {/* Top-Left: RED */}
                    <div className="absolute -top-1 -left-1 w-11 h-11 border-t-[5px] border-l-[5px] border-[#EA4335] rounded-tl-xl pointer-events-none" />
                    
                    {/* Top-Right: YELLOW */}
                    <div className="absolute -top-1 -right-1 w-11 h-11 border-t-[5px] border-r-[5px] border-[#FBBC05] rounded-tr-xl pointer-events-none" />
                    
                    {/* Bottom-Left: GREEN */}
                    <div className="absolute -bottom-1 -left-1 w-11 h-11 border-b-[5px] border-l-[5px] border-[#34A853] rounded-bl-xl pointer-events-none" />
                    
                    {/* Bottom-Right: BLUE */}
                    <div className="absolute -bottom-1 -right-1 w-11 h-11 border-b-[5px] border-r-[5px] border-[#4285F4] rounded-br-xl pointer-events-none" />

                    {/* QR Image */}
                    {loading ? (
                      <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                      </div>
                    ) : qrData?.qrDataUrl ? (
                      <img 
                        src={qrData.qrDataUrl} 
                        alt="Google Review QR" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg" 
                      />
                    ) : (
                      <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-xs text-slate-400">
                        QR Unavailable
                      </div>
                    )}
                  </div>

                  {/* Bottom Dark Banner */}
                  <div className="bg-[#0B132B] text-white py-2.5 px-3 mt-4 border-t border-slate-800">
                    <div className="text-[8px] font-bold text-sky-400 tracking-wider uppercase">
                      •••• Powered By ••••
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <img 
                        src="/cplogo_icon.png" 
                        alt="CustomerPilot" 
                        className="w-4 h-4 rounded object-contain" 
                      />
                      <span className="text-[10px] font-black tracking-tight text-white truncate">
                        CustomerPilot - YourReview Partner
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acrylic 3D L-Stand Base Shadow */}
                <div className="w-full h-4 bg-gradient-to-b from-slate-300 to-slate-200 rounded-b-2xl shadow-xl transform -skew-x-6 mx-auto -mt-1 opacity-90 border-t border-slate-300" />
              </div>

            </div>

            {/* Quick Helper Labels */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Counter Standee
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Table Tent
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Ready to Print
              </span>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
