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
          <title>Print Standee - ${storeName}</title>
          <meta charset="utf-8">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
              background: #F1F5F9;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 40px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .standee-card {
              position: relative;
              width: 440px;
              background: #FFFFFF;
              border-radius: 36px 36px 12px 12px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.15);
              overflow: hidden;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 34px 28px 24px 28px;
              text-align: center;
              border: 1px solid #E2E8F0;
            }
            .stripe-left {
              position: absolute; left: 0; top: 0; bottom: 0; width: 8px; display: flex; flex-direction: column;
            }
            .stripe-right {
              position: absolute; right: 0; top: 0; bottom: 0; width: 8px; display: flex; flex-direction: column;
            }
            .stripe-segment { flex: 1; width: 100%; }
            .seg-blue { background: #4285F4; }
            .seg-red { background: #EA4335; }
            .seg-yellow { background: #FBBC05; }
            .seg-green { background: #34A853; }
            .brand-header {
              margin-top: 4px; margin-bottom: 18px; display: flex; align-items: center; justify-content: center; min-height: 70px;
            }
            .merchant-logo {
              height: 68px; max-width: 300px; width: auto; object-fit: contain;
            }
            .google-reviews-logo {
              height: 52px; width: auto; max-width: 220px; object-fit: contain; margin-bottom: 16px;
            }
            .qr-frame-wrapper {
              position: relative; width: 280px; height: 280px; padding: 10px; display: flex; align-items: center; justify-content: center; background: #FFFFFF; border-radius: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); margin-bottom: 12px;
            }
            .qr-border-svg {
              position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;
            }
            .qr-image {
              width: 236px; height: 236px; object-fit: contain; border-radius: 20px;
            }
            .scan-me {
              font-size: 18px; font-weight: 900; color: #0F172A; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 12px;
            }
            .tagline {
              font-size: 18px; font-weight: 600; color: #334155; margin-bottom: 4px;
            }
            .thank-you {
              font-family: 'Dancing Script', cursive; font-size: 40px; font-weight: 700; color: #DC2626; margin-bottom: 20px; transform: rotate(-1.5deg);
            }
            .footer-section {
              width: 100%; padding-top: 14px; border-top: 1px solid rgba(0,0,0,0.08); display: flex; flex-direction: column; align-items: center; justify-content: center;
            }
            .powered-label {
              font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #64748B; text-transform: uppercase; margin-bottom: 6px;
            }
            .powered-row {
              display: flex; align-items: center; justify-content: center; gap: 8px;
            }
            .cp-footer-logo {
              height: 20px; width: auto; object-fit: contain;
            }
            .wa-icon {
              width: 18px; height: 18px; object-fit: contain; border-radius: 50%;
            }
            .powered-phone {
              font-size: 13px; font-weight: 800; color: #0F172A;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="stripe-left">
              <div class="stripe-segment seg-blue"></div>
              <div class="stripe-segment seg-red"></div>
              <div class="stripe-segment seg-yellow"></div>
              <div class="stripe-segment seg-green"></div>
            </div>
            <div class="stripe-right">
              <div class="stripe-segment seg-red"></div>
              <div class="stripe-segment seg-blue"></div>
              <div class="stripe-segment seg-green"></div>
              <div class="stripe-segment seg-yellow"></div>
            </div>

            <div class="brand-header">
              <img src="${qrData?.merchant?.logoUrl && !qrData.merchant.logoUrl.includes('cplogo.png') ? qrData.merchant.logoUrl : '/cake_connection_official_logo.png'}" class="merchant-logo" alt="${storeName}" />
            </div>

            <img src="/google_reviews_official_logo.png" class="google-reviews-logo" alt="Google Reviews" />

            <div class="qr-frame-wrapper">
              <svg class="qr-border-svg" viewBox="0 0 280 280" fill="none">
                <path d="M 140 7 L 34 7 A 27 27 0 0 0 7 34 L 7 140" stroke="#4285F4" stroke-width="11" stroke-linecap="round"/>
                <path d="M 140 7 L 246 7 A 27 27 0 0 1 273 34 L 273 140" stroke="#EA4335" stroke-width="11" stroke-linecap="round"/>
                <path d="M 7 140 L 7 246 A 27 27 0 0 0 34 273 L 140 273" stroke="#34A853" stroke-width="11" stroke-linecap="round"/>
                <path d="M 273 140 L 273 246 A 27 27 0 0 1 246 273 L 140 273" stroke="#FBBC05" stroke-width="11" stroke-linecap="round"/>
              </svg>
              <img src="${qrData?.qrDataUrl}" class="qr-image" alt="QR" />
            </div>

            <div class="scan-me">SCAN ME</div>
            <div class="tagline">your review matters</div>
            <div class="thank-you">Thank You</div>

            <div class="footer-section">
              <div class="powered-label">POWERED BY:</div>
              <div class="powered-row">
                <img src="/cplogo_notagline.png" class="cp-footer-logo" alt="CustomerPilot" />
                <span style="color:#94a3b8; font-size:12px;">•</span>
                <div style="display:inline-flex; align-items:center; gap:4px;">
                  <img src="/whatsapp_clean_icon.png" class="wa-icon" alt="WhatsApp" />
                  <span class="powered-phone">+91 9033304707</span>
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
            <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5 tracking-tight">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              Smart Ai Google Reviews QR Code &amp; Posters
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
              Official Tabletop QR Code designed for maximum 5-star Google review conversions.
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
              Print A4 QR Code
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
                Choose QR Code Placement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "review_counter", label: "Counter QR Code", icon: "🏢" },
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
                <span>Smart AI Google Review QR Highlights:</span>
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
                  <span><strong>Ready for Counter Display:</strong> High-definition vector layout ready to print or display on store counters.</span>
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
              
              {/* ── The Counter QR Code Display ───────────────── */}
              <div className="relative w-[290px] sm:w-[320px]">
                
                {/* Standee Body (Final v3 Design) */}
                <div className="bg-white text-slate-900 rounded-3xl pt-5 pb-0 shadow-2xl border-2 border-slate-200/90 text-center relative overflow-hidden flex flex-col items-center">
                  
                  {/* Left Colored Stripes (Google Colors) */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col pointer-events-none">
                    <div className="flex-1 bg-[#4285F4]"></div>
                    <div className="flex-1 bg-[#EA4335]"></div>
                    <div className="flex-1 bg-[#FBBC05]"></div>
                    <div className="flex-1 bg-[#34A853]"></div>
                  </div>

                  {/* Right Colored Stripes (Google Colors) */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col pointer-events-none">
                    <div className="flex-1 bg-[#EA4335]"></div>
                    <div className="flex-1 bg-[#4285F4]"></div>
                    <div className="flex-1 bg-[#34A853]"></div>
                    <div className="flex-1 bg-[#FBBC05]"></div>
                  </div>

                  {/* Merchant Business Logo (Bigger & Ultra HD) */}
                  <div className="flex items-center justify-center pt-1 px-4 mb-2 min-h-[64px]">
                    <img
                      src={qrData?.merchant?.logoUrl && !qrData.merchant.logoUrl.includes("cplogo.png") ? qrData.merchant.logoUrl : "/cake_connection_official_logo.png"}
                      alt={storeName}
                      className="max-h-16 sm:max-h-20 max-w-[240px] w-auto h-auto object-contain drop-shadow-sm"
                      onError={(e) => { e.currentTarget.src = "/cake_connection_official_logo.png" }}
                    />
                  </div>

                  {/* Official Google Reviews Logo (Google + Reviews + 5 Stars) */}
                  <div className="flex flex-col items-center justify-center my-1 px-4">
                    <img
                      src="/google_reviews_official_logo.png"
                      alt="Google Reviews ★★★★★"
                      className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>

                  {/* QR Code Container with 4-Color Google Rounded Border */}
                  <div className="relative inline-block p-2.5 bg-white rounded-3xl shadow-sm my-1">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 240" fill="none">
                      <path d="M 120 6 L 30 6 A 24 24 0 0 0 6 30 L 6 120" stroke="#4285F4" strokeWidth="10" strokeLinecap="round" />
                      <path d="M 120 6 L 210 6 A 24 24 0 0 1 234 30 L 234 120" stroke="#EA4335" strokeWidth="10" strokeLinecap="round" />
                      <path d="M 6 120 L 6 210 A 24 24 0 0 0 30 234 L 120 234" stroke="#34A853" strokeWidth="10" strokeLinecap="round" />
                      <path d="M 234 120 L 234 210 A 24 24 0 0 1 210 234 L 120 234" stroke="#FBBC05" strokeWidth="10" strokeLinecap="round" />
                    </svg>

                    {/* QR Image */}
                    {loading ? (
                      <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                      </div>
                    ) : qrData?.qrDataUrl ? (
                      <img 
                        src={qrData.qrDataUrl} 
                        alt="Google Review QR" 
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-2xl" 
                      />
                    ) : (
                      <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-xs text-slate-400">
                        QR Unavailable
                      </div>
                    )}
                  </div>

                  {/* SCAN ME */}
                  <div className="text-xs sm:text-sm font-black text-slate-900 tracking-widest uppercase mt-1">
                    SCAN ME
                  </div>

                  {/* Tagline */}
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-600 tracking-tight mt-0.5">
                    your review matters
                  </div>

                  {/* Thank You in Cursive Calligraphy */}
                  <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-0.5 mb-2.5" style={{ fontFamily: "'Dancing Script', cursive, serif" }}>
                    Thank You
                  </div>

                  {/* Footer Section */}
                  <div className="w-full bg-slate-50 dark:bg-slate-900/90 py-2.5 px-3 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="text-[9px] font-extrabold text-slate-500 tracking-widest uppercase mb-1">
                      POWERED BY:
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src="/cplogo_notagline.png"
                        alt="CustomerPilot"
                        className="h-4 sm:h-4.5 w-auto object-contain"
                      />
                      <span className="text-slate-400 text-xs">•</span>
                      <div className="inline-flex items-center gap-1">
                        <img
                          src="/whatsapp_clean_icon.png"
                          alt="WhatsApp"
                          className="w-3.5 h-3.5 rounded-full object-contain"
                        />
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-slate-100">
                          +91 9033304707
                        </span>
                      </div>
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
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Counter QR Code
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
