"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Star, Download, Printer, Copy, CheckCircle2, Sparkles, ExternalLink, RefreshCw, CreditCard } from "lucide-react"

interface GoogleReviewQRGeneratorProps {
  merchantId: string
  googleReviewUrl?: string | null
  placeName?: string | null
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Vector Assets matching the reference design (media_1790874703939.jpg)
 * ─────────────────────────────────────────────────────────────────────────── */

function GoogleGLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  )
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

function NfcWaveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 0 8" />
      <path d="M10 5a10 10 0 0 1 0 14" />
      <path d="M14 2a14 14 0 0 1 0 20" />
    </svg>
  )
}

function StartupIndiaBadge({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <svg viewBox="0 0 32 32" className="w-4 h-4 flex-shrink-0" fill="none">
        <circle cx="16" cy="16" r="14" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
        <path d="M16 6 C10 6 7 11 9 16 C11 21 16 26 22 24 C19 22 17 19 18 16 C19 13 22 10 20 7 C18.5 6.3 17.2 6 16 6 Z" fill="#F97316" />
        <path d="M16 26 C22 26 25 21 23 16 C21 11 16 6 10 8 C13 10 15 13 14 16 C13 19 10 22 12 25 C13.5 25.7 14.8 26 16 26 Z" fill="#16A34A" />
        <circle cx="16" cy="16" r="2.5" fill="#2563EB" />
      </svg>
      <span className="text-[7.5px] font-extrabold text-slate-700 leading-none">#startupindia</span>
    </div>
  )
}

function MakeInIndiaBadge({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <svg viewBox="0 0 64 32" className="w-8 h-4 flex-shrink-0 text-slate-800" fill="currentColor">
        <path d="M10 16c0-2 1-4 3-4s3 2 3 4c0 1-.5 2-1 2.5l2 3.5h3l1.5-2.5c.5.5 1.5 1 2.5 1s2-.5 2.5-1l1.5 2.5h14l2-3 2 3h4l2-4 2 4h4l-2-6c2-1 3-3 3-5 0-3-2-6-5-6h-8c-2 0-3 1-4 2l-3-2h-8l-3 3-4-1c-3 0-5 2-6 4l-4 2c-2 0-4 2-4 4v3h2zm6-1c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm24 3h-2v-2h2v2zm6-4h-2v-2h2v2z" />
        <circle cx="28" cy="14" r="1.5" fill="white" />
        <circle cx="36" cy="13" r="1.5" fill="white" />
      </svg>
      <div className="flex flex-col text-[6.5px] font-black leading-none text-slate-800">
        <span>MAKE IN</span>
        <span>INDIA</span>
      </div>
    </div>
  )
}

function SwachhBharatBadge({ className = "h-4" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <svg viewBox="0 0 44 22" className="w-7 h-3.5 flex-shrink-0" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#1E293B" strokeWidth="2" />
        <circle cx="33" cy="11" r="8" stroke="#1E293B" strokeWidth="2" />
        <path d="M19 11 Q22 7 25 11" stroke="#1E293B" strokeWidth="2" fill="none" />
        <text x="6" y="14" fontSize="7" fontWeight="bold" fill="#F97316">स्वच्छ</text>
        <text x="28" y="14" fontSize="7" fontWeight="bold" fill="#16A34A">भारत</text>
      </svg>
    </div>
  )
}

export function GoogleReviewQRGenerator({ merchantId, googleReviewUrl, placeName }: GoogleReviewQRGeneratorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrType, setQrType] = useState<string>("review_counter")
  const [qrData, setQrData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"both" | "standee" | "nfc">("both")

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
              padding: 24px 24px 18px 24px;
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
              letter-spacing: 1.5px;
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
              padding: 3px 12px;
              border-radius: 6px;
              margin-bottom: 10px;
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
              margin-bottom: 16px;
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
              width: 200px;
              height: 200px;
              display: block;
              border-radius: 8px;
            }
            .badges-row {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 14px;
              margin: 6px 0 4px 0;
              opacity: 0.9;
            }
            .badge-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 8px;
              font-weight: 800;
              color: #334155;
            }
            .bottom-banner {
              background: #0B132B;
              color: #ffffff;
              padding: 12px 16px;
              margin-top: 14px;
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
              <div class="smart-badge">SMART CONNECT QR</div>
              
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

              <div class="badges-row">
                <div class="badge-item">
                  <span style="font-size:12px">🇮🇳</span> #startupindia
                </div>
                <div class="badge-item">
                  <span>⚙️ MAKE IN INDIA</span>
                </div>
                <div class="badge-item">
                  <span>👓 स्वच्छ भारत</span>
                </div>
              </div>
            </div>

            <div class="bottom-banner">
              <div class="powered-line">---- Powered By ----</div>
              <div class="brand-line">CustomerPilot • AI Review Assistant</div>
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

  /* ─────────────────────────────────────────────────────────────────────────
   * Print NFC Pocket / Tap Card (Standard CR80 85.6mm x 54mm)
   * ─────────────────────────────────────────────────────────────────────── */
  const handlePrintNfcPDF = () => {
    if (!qrData?.targetUrl) return
    const storeName = qrData?.merchant?.name || placeName || "Our Store"

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print NFC Google Review Card - ${storeName}</title>
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
              padding: 40px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .nfc-card {
              width: 250px;
              height: 380px;
              background: #ffffff;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.15);
              position: relative;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              padding: 24px 16px 16px 16px;
              text-align: center;
              border: 1px solid #cbd5e1;
            }
            /* Google 4-Color Borders */
            .border-bar-top {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #4285F4 50%, #EA4335 50%);
            }
            .border-bar-bottom {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 6px;
              background: linear-gradient(90deg, #FBBC05 50%, #34A853 50%);
            }
            .border-bar-left {
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              width: 6px;
              background: linear-gradient(180deg, #4285F4 50%, #FBBC05 50%);
            }
            .border-bar-right {
              position: absolute;
              top: 0;
              bottom: 0;
              right: 0;
              width: 6px;
              background: linear-gradient(180deg, #EA4335 50%, #34A853 50%);
            }
            .g-logo {
              width: 52px;
              height: 52px;
              margin: 4px 0;
            }
            .nfc-row {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .tap-share {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1.5px;
              color: #0f172a;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .google-wordmark {
              font-size: 34px;
              font-weight: 900;
              line-height: 1;
              font-family: 'Product Sans', 'Poppins', sans-serif;
            }
            .stars-row {
              color: #FBBC05;
              font-size: 18px;
              letter-spacing: 2px;
              margin: 4px 0 2px 0;
            }
            .review-text {
              font-size: 13px;
              font-weight: 900;
              color: #0f172a;
            }
            .powered-box {
              margin-top: 12px;
              font-size: 8px;
              color: #64748b;
              font-weight: 700;
            }
            .powered-brand {
              font-size: 10px;
              font-weight: 900;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          <div class="nfc-card">
            <div class="border-bar-top"></div>
            <div class="border-bar-bottom"></div>
            <div class="border-bar-left"></div>
            <div class="border-bar-right"></div>

            <!-- Top G Logo -->
            <svg viewBox="0 0 48 48" class="g-logo">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>

            <!-- NFC Wave -->
            <div class="nfc-row">
              <span>NFC</span>
              <span>)))</span>
            </div>

            <!-- Tap to Share & Review -->
            <div>
              <div class="tap-share">TAP TO SHARE</div>
              <div class="google-wordmark">
                <span style="color:#4285F4">G</span><span style="color:#EA4335">o</span><span style="color:#FBBC05">o</span><span style="color:#4285F4">g</span><span style="color:#34A853">l</span><span style="color:#EA4335">e</span>
              </div>
              <div class="stars-row">★★★★★</div>
              <div class="review-text">REVIEW!</div>
            </div>

            <!-- Footer -->
            <div class="powered-box">
              <div>---- Powered By ----</div>
              <div class="powered-brand">CustomerPilot Smart QR</div>
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
              Official Acrylic Tabletop Standee &amp; NFC Tap Card designed for maximum 5-star Google review conversions.
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
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrintNfcPDF}
              disabled={loading || !qrData?.targetUrl}
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs rounded-xl"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1 text-blue-500" />
              Print NFC Card
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── Left Column: Controls & Information ───────────────────────── */}
          <div className="lg:col-span-5 space-y-4">
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
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Instant 5-Star Reviews:</strong> Pre-fills 5-star rating and opens customer's camera immediately.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>AI Keyword-Rich Draft:</strong> Generates localized SEO-rich review text matching customer's experience.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Government Trust Badges:</strong> #StartupIndia &amp; Make in India trust seals for high retail credibility.</span>
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

          {/* ── Right Column: Live Mockup Preview (Standee + Companion NFC Card) ── */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center pt-2">
            
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("both")}
                className={`px-3 py-1 rounded-lg transition-colors ${activeTab === "both" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-600 dark:text-slate-400"}`}
              >
                Standee + NFC Card
              </button>
              <button
                onClick={() => setActiveTab("standee")}
                className={`px-3 py-1 rounded-lg transition-colors ${activeTab === "standee" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-600 dark:text-slate-400"}`}
              >
                Acrylic Standee Only
              </button>
              <button
                onClick={() => setActiveTab("nfc")}
                className={`px-3 py-1 rounded-lg transition-colors ${activeTab === "nfc" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold" : "text-slate-600 dark:text-slate-400"}`}
              >
                NFC Card Only
              </button>
            </div>

            {/* Mockup Canvas */}
            <div className="relative w-full max-w-[480px] flex items-center justify-center p-3 sm:p-6 bg-gradient-to-b from-slate-100/80 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
              
              {/* ── 1. The Acrylic Standee (Left / Center) ───────────────── */}
              {(activeTab === "both" || activeTab === "standee") && (
                <div className={`relative transition-all duration-300 ${activeTab === "both" ? "w-[270px] sm:w-[290px] -mr-12 sm:-mr-16 z-0" : "w-[290px] sm:w-[320px] z-10"}`}>
                  
                  {/* Standee Body */}
                  <div className="bg-gradient-to-b from-[#F0F7FF] via-white via-70% to-[#F4F9FF] text-slate-900 rounded-3xl pt-5 pb-0 shadow-2xl border-2 border-slate-200/90 text-center relative overflow-hidden">
                    
                    {/* Top Sparkle + AI - Powered */}
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-900 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
                      <span>Ai - Powered</span>
                    </div>

                    {/* SMART CONNECT QR pill */}
                    <div className="inline-block bg-black text-white text-[10px] font-black tracking-wider uppercase px-4 py-1 rounded-full mb-2 shadow-xs">
                      SMART CONNECT QR
                    </div>

                    {/* Store Name Badge */}
                    {storeName && (
                      <div className="mb-1">
                        <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md inline-block max-w-[200px] truncate">
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
                    <div className="flex items-center justify-center gap-1.5 mb-2.5">
                      <div className="flex items-center text-[#FBBC05] text-base leading-none">
                        ★ ★ ★ ★ ★
                      </div>
                      <span className="text-xs font-black text-slate-900 tracking-wide">
                        REVIEW!
                      </span>
                    </div>

                    {/* QR Code Container with 4-Color Google Corner Brackets */}
                    <div className="relative inline-block p-3 bg-white rounded-2xl shadow-sm my-1">
                      {/* Top-Left: RED */}
                      <div className="absolute -top-1 -left-1 w-10 h-10 border-t-[5px] border-l-[5px] border-[#EA4335] rounded-tl-xl pointer-events-none" />
                      
                      {/* Top-Right: YELLOW */}
                      <div className="absolute -top-1 -right-1 w-10 h-10 border-t-[5px] border-r-[5px] border-[#FBBC05] rounded-tr-xl pointer-events-none" />
                      
                      {/* Bottom-Left: GREEN */}
                      <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-[5px] border-l-[5px] border-[#34A853] rounded-bl-xl pointer-events-none" />
                      
                      {/* Bottom-Right: BLUE */}
                      <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-[5px] border-r-[5px] border-[#4285F4] rounded-br-xl pointer-events-none" />

                      {/* QR Image */}
                      {loading ? (
                        <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
                        </div>
                      ) : qrData?.qrDataUrl ? (
                        <img 
                          src={qrData.qrDataUrl} 
                          alt="Google Review QR" 
                          className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg" 
                        />
                      ) : (
                        <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-xs text-slate-400">
                          QR Unavailable
                        </div>
                      )}
                    </div>

                    {/* Trust Badges Row */}
                    <div className="flex items-center justify-center gap-3 px-3 py-1.5 mt-1">
                      <StartupIndiaBadge />
                      <MakeInIndiaBadge />
                      <SwachhBharatBadge />
                    </div>

                    {/* Bottom Dark Banner */}
                    <div className="bg-[#0B132B] text-white py-2 px-3 mt-2 border-t border-slate-800">
                      <div className="text-[8px] font-bold text-sky-400 tracking-wider">
                        •••• Powered By ••••
                      </div>
                      <div className="text-[10px] font-black tracking-tight text-white mt-0.5 truncate">
                        CustomerPilot - Your Branding Partner
                      </div>
                    </div>
                  </div>

                  {/* Acrylic 3D L-Stand Base Shadow */}
                  <div className="w-full h-4 bg-gradient-to-b from-slate-300 to-slate-200 rounded-b-2xl shadow-xl transform -skew-x-6 mx-auto -mt-1 opacity-90 border-t border-slate-300" />
                </div>
              )}

              {/* ── 2. The Companion NFC Tap Card (Right / Overlapping) ────── */}
              {(activeTab === "both" || activeTab === "nfc") && (
                <div className={`transition-all duration-300 ${activeTab === "both" ? "w-[150px] sm:w-[170px] z-10 self-end -mb-3" : "w-[200px] sm:w-[220px] z-10"}`}>
                  <div className="bg-white rounded-2xl p-3 shadow-2xl border border-slate-200 relative overflow-hidden text-center">
                    
                    {/* Google 4-Color Outer Edge Bars */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4285F4] 50% to-[#EA4335] 50%" />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FBBC05] 50% to-[#34A853] 50%" />
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-[#4285F4] 50% to-[#FBBC05] 50%" />
                    <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-gradient-to-b from-[#EA4335] 50% to-[#34A853] 50%" />

                    {/* Google 'G' 4-Color Logo */}
                    <div className="flex justify-center mt-1 mb-1">
                      <GoogleGLogo className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>

                    {/* NFC Wave Icon + Text */}
                    <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-slate-800 mb-1">
                      <span>NFC</span>
                      <NfcWaveIcon className="w-3.5 h-3.5 text-slate-800" />
                    </div>

                    {/* Tap to Share */}
                    <div className="text-[9px] font-black text-slate-900 tracking-wider uppercase mb-0.5">
                      TAP TO SHARE
                    </div>

                    {/* Google Wordmark */}
                    <div>
                      <GoogleWordmark className="text-xl sm:text-2xl" />
                    </div>

                    {/* Stars + REVIEW! */}
                    <div className="flex items-center justify-center gap-1 my-0.5">
                      <span className="text-[#FBBC05] text-xs">★★★★★</span>
                      <span className="text-[10px] font-extrabold text-slate-900">REVIEW!</span>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 mt-2 border-t border-slate-100 text-[8px] text-slate-500 font-bold">
                      <div>---- Powered By ----</div>
                      <div className="text-[9px] font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>CustomerPilot</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Quick Helper Labels */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Counter Standee
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> NFC Tap Card
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
