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

  const handlePrintPDF = () => {
    if (!qrData?.qrDataUrl) return

    const storeName = qrData?.merchant?.name || placeName || "Our Store"
    const logoHtml = qrData?.merchant?.logoUrl
      ? `<div style="display:flex; justify-content:center; align-items:center; min-height:75px; margin: 0 auto 14px auto;">
           <img src="${qrData.merchant.logoUrl}" style="max-height:80px; max-width:220px; width:auto; height:auto; object-fit:contain; border-radius:12px; background:#ffffff; padding:6px; border:1px solid #e2e8f0;" />
         </div>`
      : `<div style="width:64px; height:64px; border-radius:50%; background:#f59e0b; color:white; font-size:22px; font-weight:bold; display:flex; align-items:center; justify-content:center; margin:0 auto 14px auto;">⭐</div>`

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Google Review Standee - ${storeName}</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              background: #f8fafc;
              margin: 0;
              padding: 40px 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .standee-card {
              width: 380px;
              background: white;
              border-radius: 28px;
              border: 4px solid #f59e0b;
              padding: 36px 28px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(245, 158, 11, 0.15);
            }
            .badge {
              background: #f59e0b;
              color: white;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.2px;
              padding: 6px 16px;
              border-radius: 20px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .stars-row {
              color: #f59e0b;
              font-size: 26px;
              letter-spacing: 4px;
              margin-bottom: 8px;
            }
            .store-name {
              font-size: 24px;
              font-weight: 800;
              color: #0f172a;
              margin: 4px 0;
              letter-spacing: -0.5px;
            }
            .tagline {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .qr-box {
              background: white;
              padding: 16px;
              border-radius: 22px;
              border: 2px solid #e2e8f0;
              display: inline-block;
              box-shadow: 0 6px 16px rgba(0,0,0,0.06);
            }
            .qr-img {
              width: 210px;
              height: 210px;
              display: block;
            }
            .instructions {
              margin-top: 22px;
              background: #fef3c7;
              padding: 14px 18px;
              border-radius: 14px;
              border: 1px solid #fde68a;
            }
            .instructions p {
              margin: 0;
              font-size: 12px;
              color: #92400e;
              font-weight: 600;
              line-height: 1.4;
            }
            .footer-brand {
              margin-top: 20px;
              font-size: 11px;
              color: #94a3b8;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            ${logoHtml}
            <div class="stars-row">★★★★★</div>
            <div class="badge">Google 5-Star Reviews</div>
            <div class="store-name">${storeName}</div>
            <div class="tagline">Love our food & service? Share your feedback!</div>
            
            <div class="qr-box">
              <img class="qr-img" src="${qrData.qrDataUrl}" alt="Google Review QR" />
            </div>

            <div class="instructions">
              <p>✨ <strong>Scan with Phone Camera</strong></p>
              <p>Get a ready-made AI review draft in 10 seconds & post on Google!</p>
            </div>

            <div class="footer-brand">
              Powered by SmartAI Review Assistant • CustomerPilot
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
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

  return (
    <Card className="bg-slate-900/60 border-amber-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
      <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              SmartAI Google Reviews QR Standee & Posters
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Dedicated QR Code for collecting 5-Star Google Reviews with 1-Tap AI Draft assistance.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={loading || !qrData?.targetUrl}
              className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied Link" : "Copy Review Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPNG}
              disabled={loading || !qrData?.qrDataUrl}
              className="border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Download PNG
            </Button>
            <Button
              size="sm"
              onClick={handlePrintPDF}
              disabled={loading || !qrData?.qrDataUrl}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print A4 Standee
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls & Options */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Choose QR Code Format / Placement</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "review_counter", label: "Counter Standee", icon: "🏢" },
                  { id: "review_table", label: "Table Tent Card", icon: "🍽️" },
                  { id: "review_sticker", label: "Bill / Box Sticker", icon: "🏷️" },
                  { id: "review_poster", label: "Window Poster", icon: "🖼️" },
                  { id: "review_direct", label: "Direct Google 5★", icon: "⭐" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQrType(item.id)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      qrType === item.id
                        ? "bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                How Smart AI Google Review QR Works:
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                <li>Customer scans this QR code using any phone camera (No app install).</li>
                <li>Opens your <strong>AI Review Assistant Page</strong> with 5-star rating pre-selected.</li>
                <li>AI automatically drafts a high-converting, personalized review in 10 seconds.</li>
                <li>Customer taps <strong>&quot;Post to Google&quot;</strong> ➜ Redirects to your Google Maps review page!</li>
              </ul>
            </div>

            {qrData?.targetUrl && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Review Destination URL:</label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-mono break-all">
                  <span className="flex-1 truncate">{qrData.targetUrl}</span>
                  <a href={qrData.targetUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 flex items-center gap-1 flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Standee Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-[280px] bg-white text-slate-900 rounded-3xl p-5 shadow-2xl border-4 border-amber-400 text-center relative">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                ★★★★★ Google Reviews
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 truncate">
                {qrData?.merchant?.name || placeName || "Your Business"}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mb-3">
                Scan to leave a 5-star review in 10s
              </p>

              <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block shadow-inner">
                {loading ? (
                  <div className="w-40 h-40 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                  </div>
                ) : qrData?.qrDataUrl ? (
                  <img src={qrData.qrDataUrl} alt="Google Review QR" className="w-40 h-40 object-contain mx-auto" />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                    QR Unavailable
                  </div>
                )}
              </div>

              <div className="mt-3 p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] font-bold text-amber-900">
                ✨ Instant AI Review Assistant
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
