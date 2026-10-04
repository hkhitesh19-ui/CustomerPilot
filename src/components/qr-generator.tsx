"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, Printer, Copy, CheckCircle2, Sparkles, RefreshCw, Gift, Star, Tag, Crown } from "lucide-react"

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [downloadingPoster, setDownloadingPoster] = useState(false)

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
          setQrData(json.data || json)
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
  }, [toast, merchantId])

  const storeName = qrData?.merchant?.name || "Merchant Store"
  const storeLogo = qrData?.merchant?.logoUrl || null
  const branchCity = qrData?.merchant?.city || null
  const qrDataUrl = qrData?.qrDataUrl || ""
  const targetUrl = qrData?.targetUrl || ""

  // Copy WhatsApp link
  const handleCopyLink = () => {
    if (!targetUrl) return
    navigator.clipboard.writeText(targetUrl)
    setCopied(true)
    toast({ title: "Link Copied!", description: "WhatsApp VIP check-in link copied to clipboard." })
    setTimeout(() => setCopied(false), 2500)
  }

  // Download Standalone QR Code (PNG)
  const handleDownloadQR = () => {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = `${storeName.replace(/\s+/g, "_")}-VIP-QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded QR", description: "Standalone VIP Loyalty QR Code downloaded." })
  }

  // Download High-Resolution Master Standee Image (JPG)
  const handleDownloadStandeeImage = async () => {
    if (!merchantId) return
    setDownloadingPoster(true)
    try {
      const res = await fetch(`/api/qr/standee?design=master&format=print&m=${merchantId}`)
      if (!res.ok) throw new Error("Failed to generate master standee poster")
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = `${storeName.replace(/\s+/g, "_")}-Master-QR-Standee.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      toast({ title: "Downloaded Standee!", description: "Universal Master Standee poster image downloaded successfully." })
    } catch (e: any) {
      toast({ title: "Download Failed", description: e.message || "Could not download standee image", variant: "destructive" })
    } finally {
      setDownloadingPoster(false)
    }
  }

  // Print Universal Master Standee (A4 / A5 Acrylic Insert)
  const handlePrintStandee = () => {
    if (!qrDataUrl) {
      toast({ title: "Please wait", description: "QR code data is loading.", variant: "destructive" })
      return
    }

    const safeStoreName = storeName
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")

    const headerBrandingHtml = storeLogo
      ? `<img src="${storeLogo}" alt="${safeStoreName}" class="brand-logo" />`
      : `<div class="brand-wordmark"><span>${safeStoreName}</span></div>`

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Master QR Loyalty Standee - ${safeStoreName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Playfair+Display:ital,wght@1,600;1,700&display=swap" rel="stylesheet">
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
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
      justify-content: center;
      align-items: center;
      padding: 8mm 10mm;
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
        padding: 6mm 8mm;
      }
      .no-print {
        display: none !important;
      }
    }

    /* Outer Scissor Trim Guidelines for Standard Tabletop Acrylic Stand (A5 / 6x8" / 2:3) */
    .trim-guide-box {
      position: relative;
      width: 148mm;
      height: 220mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      border: 1.5px dashed #94a3b8;
      border-radius: 12px;
      padding: 4mm;
      background: #ffffff;
    }
    .trim-label-top {
      position: absolute;
      top: -9px;
      left: 14px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 8px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .trim-label-bottom {
      position: absolute;
      bottom: -9px;
      right: 14px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 8px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* Universal Master Standee Frame */
    .standee-frame {
      position: relative;
      width: 100%;
      height: 100%;
      border: 2px solid #d4af37;
      border-radius: 16px;
      padding: 4mm 5mm 3.5mm 5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      background: radial-gradient(circle at 50% 25%, #ffffff 0%, #faf8f5 60%, #f4ede2 100%);
      box-shadow: inset 0 0 0 1px #071829;
      overflow: hidden;
    }

    /* 1. Top Curved Navy Header */
    .header-pill {
      width: 95%;
      height: 48px;
      background: linear-gradient(180deg, #071829 0%, #030a12 100%);
      border: 2px solid #d4af37;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1mm;
      margin-bottom: 2mm;
      padding: 4px 16px;
      box-shadow: 0 4px 12px rgba(7,24,41,0.25);
    }
    .brand-logo {
      max-height: 38px;
      max-width: 200px;
      object-fit: contain;
    }
    .brand-wordmark {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 20px;
      font-weight: bold;
      color: #fef08a;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* 2. Core Headline: 3D "SCAN to EARN" */
    .headline-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      margin-bottom: 1.5mm;
    }
    .scan-to-earn {
      font-size: 32px;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      line-height: 1.05;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.12));
    }
    .word-scan {
      color: #071829;
      text-shadow: 0 2px 0 #cbd5e1, 0 3px 0 #94a3b8;
    }
    .word-to {
      font-size: 20px;
      font-weight: 800;
      color: #071829;
      text-transform: lowercase;
      font-style: italic;
    }
    .word-earn {
      color: #dc2626;
      text-shadow: 0 2px 0 #fca5a5, 0 3px 0 #b91c1c;
    }

    /* Gold Satin Ribbon: CONFIRM REWARDS */
    .gold-ribbon {
      background: linear-gradient(180deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%);
      color: #071829;
      font-size: 13.5px;
      font-weight: 900;
      letter-spacing: 2.2px;
      text-transform: uppercase;
      padding: 3.5px 22px;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(217,119,6,0.35);
      border: 1px solid #b45309;
      margin-top: 1mm;
      position: relative;
    }

    /* 3. Central QR Section with Marble Pedestal */
    .qr-stage {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 1mm 0 2mm 0;
    }
    .marble-pedestal {
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 70%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 20px;
      padding: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .qr-bracket-box {
      position: relative;
      background: #ffffff;
      padding: 6px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Yellow Corner Brackets */
    .bracket-tl {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-top: 3.5px solid #eab308;
      border-left: 3.5px solid #eab308;
      border-top-left-radius: 6px;
    }
    .bracket-tr {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      border-top: 3.5px solid #eab308;
      border-right: 3.5px solid #eab308;
      border-top-right-radius: 6px;
    }
    .bracket-bl {
      position: absolute;
      bottom: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-bottom: 3.5px solid #eab308;
      border-left: 3.5px solid #eab308;
      border-bottom-left-radius: 6px;
    }
    .bracket-br {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      border-bottom: 3.5px solid #eab308;
      border-right: 3.5px solid #eab308;
      border-bottom-right-radius: 6px;
    }
    .qr-image {
      width: 60mm;
      height: 60mm;
      max-width: 228px;
      max-height: 228px;
      display: block;
      border-radius: 4px;
    }

    /* Flanking Directional Cues */
    .cue-left {
      position: absolute;
      left: 4mm;
      top: 42%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .cue-text-script {
      font-family: 'Playfair Display', Georgia, cursive;
      font-style: italic;
      font-size: 19px;
      font-weight: 700;
      color: #071829;
      line-height: 1.1;
    }
    .cue-right {
      position: absolute;
      right: 4mm;
      top: 42%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }
    .cue-red-script {
      font-family: 'Playfair Display', Georgia, cursive;
      font-style: italic;
      font-size: 21px;
      font-weight: 700;
      color: #dc2626;
      line-height: 1.1;
    }
    .gift-deco {
      font-size: 22px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
      margin-top: 4px;
    }

    /* 4. Three-Column Benefits Section */
    .benefits-pill {
      width: 96%;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 6px 8px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.05);
      margin-bottom: 2mm;
    }
    .benefit-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 2px;
      padding: 2px 0;
    }
    .benefit-icon {
      font-size: 18px;
    }
    .benefit-title {
      font-size: 8.5px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.4px;
      line-height: 1.15;
      text-transform: uppercase;
    }

    /* 5. Footer Bar: VIP Member & Locked CustomerPilot Branding */
    .footer-bar {
      width: 96%;
      background: linear-gradient(180deg, #071829 0%, #030a12 100%);
      border: 1.5px solid #d4af37;
      border-radius: 14px;
      padding: 5px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(7,24,41,0.25);
    }
    .vip-member-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      text-align: left;
    }
    .vip-crown {
      font-size: 20px;
    }
    .vip-title {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.8px;
      color: #ffffff;
      line-height: 1.1;
    }
    .vip-sub {
      font-size: 7.5px;
      font-weight: 600;
      color: #cbd5e1;
      letter-spacing: 0.3px;
    }
    .cp-branding-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
    }
    .cp-powered-text {
      font-size: 6.5px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cp-logo-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 1px 0;
    }
    .cp-brand-name {
      font-size: 11.5px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.3px;
    }
    .cp-brand-name span {
      color: #38bdf8;
    }
    .cp-tagline {
      font-size: 6px;
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    /* Top Floating Print Bar (Hidden on print) */
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
    <span class="paper-hint">📐 Paper: Standard A4 Portrait (250+ GSM recommended)</span>
    <button class="btn-print" onclick="window.print()">🖨️ Print Standee</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="print-sheet">
    <div class="trim-guide-box">
      <span class="trim-label-top">✂️ Cut along dashed line for Counter Acrylic Stand (A5 / 6×8" / 2:3)</span>

      <div class="standee-frame">
        <!-- 1. Top Curved Navy Header -->
        <div class="header-pill">
          ${headerBrandingHtml}
        </div>

        <!-- 2. Core Headline: SCAN to EARN + CONFIRM REWARDS -->
        <div class="headline-group">
          <div class="scan-to-earn">
            <span class="word-scan">SCAN</span>
            <span class="word-to">to</span>
            <span class="word-earn">EARN</span>
          </div>
          <div class="gold-ribbon">
            CONFIRM REWARDS
          </div>
        </div>

        <!-- 3. Central QR Section with Marble Pedestal & Directional Cues -->
        <div class="qr-stage">
          <div class="cue-left">
            <span class="cue-text-script">Scan Here</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
            <div class="gift-deco">🎁</div>
          </div>

          <div class="marble-pedestal">
            <div class="qr-bracket-box">
              <div class="bracket-tl"></div>
              <div class="bracket-tr"></div>
              <div class="bracket-bl"></div>
              <div class="bracket-br"></div>
              <img src="${qrDataUrl}" alt="VIP QR Code" class="qr-image" />
            </div>
          </div>

          <div class="cue-right">
            <span class="cue-text-script">Join Now &amp; Get</span>
            <span class="cue-red-script">Rewards</span>
            <div class="gift-deco">🎁</div>
          </div>
        </div>

        <!-- 4. Three-Column Benefits Section -->
        <div class="benefits-pill">
          <div class="benefit-card">
            <span class="benefit-icon">🎁</span>
            <span class="benefit-title">EXCLUSIVE<br/>OFFERS</span>
          </div>
          <div class="benefit-card">
            <span class="benefit-icon">⭐</span>
            <span class="benefit-title">LOYALTY<br/>REWARDS</span>
          </div>
          <div class="benefit-card">
            <span class="benefit-icon">🏷️</span>
            <span class="benefit-title">MEMBERSHIP<br/>DISCOUNT</span>
          </div>
        </div>

        <!-- 5. Footer Bar: VIP Member & Locked CustomerPilot Branding -->
        <div class="footer-bar">
          <div class="vip-member-wrap">
            <span class="vip-crown">👑</span>
            <div>
              <div class="vip-title">VIP MEMBER</div>
              <div class="vip-sub">Scan • Earn • Redeem • Repeat</div>
            </div>
          </div>

          <div class="cp-branding-wrap">
            <span class="cp-powered-text">Powered by</span>
            <div class="cp-logo-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
                <path d="M12 12 2.1 7.1"></path>
                <path d="m12 12 9.9 4.9"></path>
              </svg>
              <span class="cp-brand-name">Customer<span>Pilot</span></span>
            </div>
            <span class="cp-tagline">Turns Every Walkins into LifeTime Customers</span>
          </div>
        </div>
      </div>

      <span class="trim-label-bottom">CustomerPilot Master Standee • Universal Print Template</span>
    </div>
  </div>
</body>
</html>`

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHtml)
      printWindow.document.close()
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups in your browser to open the printable standee view.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              Digital Loyalty Stamp QR Standee
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Universal Master QR Loyalty Standee with your branding, live WhatsApp check-in QR &amp; print-ready A4 export.
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
              {downloadingPoster ? "Generating..." : "Download Poster (JPG)"}
            </Button>
            <Button
              onClick={handlePrintStandee}
              disabled={loading || !qrDataUrl}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print Standee (A4)
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Generating Master QR Standee...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* UNIVERSAL MASTER QR LOYALTY STANDEE (LIVE ON-SCREEN PREVIEW)       */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="w-full max-w-sm rounded-[28px] border-2 border-slate-900 bg-gradient-to-b from-stone-50 via-amber-50/20 to-stone-100 p-5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
              
              {/* Inner gold hairline border */}
              <div className="absolute inset-2 rounded-[22px] border border-amber-500/40 pointer-events-none" />

              {/* 1. Top Curved Navy Header with Logo or Times New Roman Wordmark */}
              <div className="w-full h-12 rounded-2xl bg-gradient-to-b from-[#071829] to-[#020810] border border-[#d4af37] px-4 flex items-center justify-center mb-3 shadow-md relative z-10">
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    className="max-h-9 max-w-[190px] object-contain"
                  />
                ) : (
                  <span
                    className="text-amber-200 font-bold tracking-wider text-base sm:text-lg uppercase"
                    style={{ fontFamily: "'Times New Roman', Georgia, serif" }}
                  >
                    {storeName}
                  </span>
                )}
              </div>

              {/* 2. Core Headline: 3D "SCAN to EARN" + Gold Ribbon "CONFIRM REWARDS" */}
              <div className="flex flex-col items-center mb-3 relative z-10">
                <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  <span className="text-slate-900 drop-shadow-sm">SCAN</span>
                  <span className="text-slate-900 text-lg font-bold lowercase italic">to</span>
                  <span className="text-red-600 drop-shadow-sm">EARN</span>
                </div>

                <div className="mt-1 px-4 py-1 rounded-md bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-[0.18em] uppercase border border-amber-600 shadow-sm">
                  CONFIRM REWARDS
                </div>
              </div>

              {/* 3. Central QR Section with Marble Pedestal & Yellow Corner Brackets */}
              <div className="relative w-full flex items-center justify-center my-1 relative z-10">
                {/* Left Directional Cue */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center text-slate-900 hidden sm:flex">
                  <span className="text-xs font-serif italic font-bold">Scan Here</span>
                  <span className="text-amber-500 text-base">➔</span>
                  <span className="text-base">🎁</span>
                </div>

                {/* Marble Pedestal & QR */}
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-lg relative">
                  {/* 4 Corner Yellow Target Brackets */}
                  <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-[3.5px] border-l-[3.5px] border-amber-400 rounded-tl-xs pointer-events-none" />
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-[3.5px] border-r-[3.5px] border-amber-400 rounded-tr-xs pointer-events-none" />
                  <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-[3.5px] border-l-[3.5px] border-amber-400 rounded-bl-xs pointer-events-none" />
                  <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-[3.5px] border-r-[3.5px] border-amber-400 rounded-br-xs pointer-events-none" />

                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="VIP Loyalty QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xs"
                    />
                  )}
                </div>

                {/* Right Directional Cue */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col items-center text-slate-900 hidden sm:flex">
                  <span className="text-[11px] font-serif italic font-bold">Join Now &amp; Get</span>
                  <span className="text-xs font-serif italic font-black text-red-600">Rewards</span>
                  <span className="text-base">🎁</span>
                </div>
              </div>

              {/* 4. Three-Column Benefits Section */}
              <div className="w-full mt-3 p-2 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-3 gap-1 relative z-10">
                <div className="flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-base">🎁</span>
                  <span className="text-[9px] font-black uppercase text-slate-800 leading-tight">EXCLUSIVE<br/>OFFERS</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 text-center border-x border-slate-100">
                  <span className="text-base">⭐</span>
                  <span className="text-[9px] font-black uppercase text-slate-800 leading-tight">LOYALTY<br/>REWARDS</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-base">🏷️</span>
                  <span className="text-[9px] font-black uppercase text-slate-800 leading-tight">MEMBERSHIP<br/>DISCOUNT</span>
                </div>
              </div>

              {/* 5. Footer Bar: VIP Member & Locked CustomerPilot Branding */}
              <div className="w-full mt-3 p-2.5 rounded-xl bg-gradient-to-b from-[#071829] to-[#020810] border border-[#d4af37] flex items-center justify-between text-white relative z-10 shadow-sm">
                <div className="flex items-center gap-1.5 text-left">
                  <Crown className="w-5 h-5 text-amber-400 fill-amber-400/30 shrink-0" />
                  <div>
                    <div className="text-xs font-black tracking-wider text-white">VIP MEMBER</div>
                    <div className="text-[8px] font-medium text-slate-300">Scan • Earn • Redeem • Repeat</div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <span className="text-[7px] text-slate-400 font-semibold uppercase">Powered by</span>
                  <div className="flex items-center gap-1 text-[11px] font-black text-white">
                    <span className="text-sky-400">Customer</span>Pilot
                  </div>
                  <span className="text-[6.5px] text-slate-400 font-normal">Turns Every Walkins into LifeTime Customers</span>
                </div>
              </div>
            </div>

            {/* Bottom Printing Guidelines */}
            <div className="mt-6 max-w-md w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                Click <strong>&quot;Print Standee (A4)&quot;</strong> or <strong>&quot;Download Poster&quot;</strong> for instant acrylic counter display inserts.
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                Master Template Locked
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
