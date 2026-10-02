"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, Printer, Copy, CheckCircle2, Sparkles, RefreshCw } from "lucide-react"

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)
  const [copied, setCopied] = useState(false)

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

  // Print High-Resolution A4 Acrylic Standee Insert
  const handlePrintStandee = () => {
    if (!qrDataUrl) {
      toast({ title: "Please wait", description: "QR code data is loading.", variant: "destructive" })
      return
    }

    const logoHtml = storeLogo
      ? `<img src="${storeLogo}" alt="${storeName}" class="brand-logo" />`
      : `<div class="brand-logo-fallback"><span>${storeName.slice(0, 2).toUpperCase()}</span></div>`

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VIP Reward CLUB Standee - ${storeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
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
      justify-content: space-between;
      align-items: center;
      padding: 10mm 12mm 8mm 12mm;
      box-shadow: 0 15px 35px rgba(0,0,0,0.1);
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
        padding: 8mm 10mm 6mm 10mm;
      }
      .no-print {
        display: none !important;
      }
    }

    /* Outer Scissor Trim Guidelines for Counter Acrylic Stands */
    .trim-guide-box {
      position: relative;
      width: 100%;
      height: 265mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      border: 1.5px dashed #cbd5e1;
      border-radius: 12px;
      padding: 8mm 8mm 6mm 8mm;
      background: #ffffff;
    }
    .trim-label-top {
      position: absolute;
      top: -7px;
      left: 20px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 8.5px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .trim-label-bottom {
      position: absolute;
      bottom: -7px;
      right: 20px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 8.5px;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* Standee Card Body */
    .standee-card {
      width: 100%;
      max-width: 140mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-top: 4mm;
    }

    /* 1. Business Logo */
    .logo-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 5mm;
      height: 65px;
    }
    .brand-logo {
      max-height: 65px;
      max-width: 220px;
      object-fit: contain;
    }
    .brand-logo-fallback {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
      color: #ffffff;
      font-size: 24px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    /* 2. Business Name */
    .brand-name {
      font-family: 'Cinzel', -apple-system, sans-serif;
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      line-height: 1.15;
      margin-bottom: 3.5mm;
    }

    /* 3. VIP Reward CLUB */
    .vip-club-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
      padding: 7px 26px;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
      border: 1px solid rgba(217, 119, 6, 0.4);
      margin-bottom: 7mm;
    }
    .vip-club-text {
      font-family: 'Cinzel', serif;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #fbbf24;
    }

    /* 4. QR Code */
    .qr-card-box {
      position: relative;
      background: #ffffff;
      border: 3px solid #e2e8f0;
      border-radius: 24px;
      padding: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 6mm;
    }
    .qr-img {
      width: 72mm;
      height: 72mm;
      max-width: 280px;
      max-height: 280px;
      display: block;
      border-radius: 12px;
    }
    .scan-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f1f5f9;
      color: #0f172a;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 16px;
      border-radius: 20px;
      margin-top: 10px;
      border: 1px solid #cbd5e1;
    }
    .wa-icon {
      color: #16a34a;
      font-size: 14px;
    }

    /* Perks / Benefits strip */
    .benefits-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      width: 100%;
      max-width: 140mm;
      margin-bottom: 4mm;
    }
    .benefit-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 6px 12px;
      font-size: 10px;
      font-weight: 700;
      color: #334155;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* CustomerPilot Footer */
    .standee-footer {
      width: 100%;
      border-top: 1px solid #e2e8f0;
      padding-top: 4mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
    }
    .cp-logo {
      height: 22px;
      width: auto;
      object-fit: contain;
    }
    .powered-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
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
      <span class="trim-label-top">✂️ Cut along dashed line to insert into Counter Acrylic Stand</span>

      <div class="standee-card">
        <!-- 1. Business Logo -->
        <div class="logo-wrap">
          ${logoHtml}
        </div>

        <!-- 2. Business Name -->
        <h1 class="brand-name">${storeName}</h1>

        <!-- 3. VIP Reward CLUB -->
        <div class="vip-club-badge">
          <span class="vip-club-text">★ VIP REWARD CLUB ★</span>
        </div>

        <!-- 4. QR Code -->
        <div class="qr-card-box">
          <img src="${qrDataUrl}" alt="VIP QR Code" class="qr-img" />
          <div class="scan-pill">
            <span class="wa-icon">💬</span>
            <span>Scan with WhatsApp • Collect Stamps &amp; Rewards</span>
          </div>
        </div>

        <!-- Benefits row -->
        <div class="benefits-row">
          <div class="benefit-item"><span>🪙</span> Earn Stamps Every Visit</div>
          <div class="benefit-item"><span>🎁</span> Unlock Exclusive Treats</div>
          <div class="benefit-item"><span>🎂</span> Free Birthday Special</div>
        </div>
      </div>

      <!-- Sheet Footer with CustomerPilot -->
      <div class="standee-footer">
        <div>
          <strong>No app download required.</strong> 100% WhatsApp integrated.
        </div>
        <div class="powered-wrap">
          <span>Powered by</span>
          <img src="/cplogo.png" alt="CustomerPilot" class="cp-logo" />
        </div>
      </div>

      <span class="trim-label-bottom">Standard A4 / A5 / 6×8" Tabletop Acrylic Stand Insert</span>
    </div>
  </div>
</body>
</html>`

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(printHtml)
      printWindow.document.close()
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
              Digital Loyalty Stamp QR
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Professional billing counter standee with your business branding, live WhatsApp check-in QR &amp; 1-click A4 printing.
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
            <span className="text-sm font-semibold">Generating VIP QR Standee...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* SINGLE PROFESSIONAL STANDEE CARD                                    */}
            {/* [1] Business Logo  [2] Business Name  [3] VIP Reward CLUB  [4] QR   */}
            {/* ══════════════════════════════════════════════════════════════════ */}
            <div className="w-full max-w-sm rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
              
              {/* Subtle top decorative accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-500" />

              {/* 1. Business Logo */}
              <div className="h-16 flex items-center justify-center mb-3">
                {storeLogo ? (
                  <img
                    src={storeLogo}
                    alt={storeName}
                    className="max-h-16 max-w-[180px] object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-700 to-slate-900 text-white font-black text-2xl flex items-center justify-center shadow-md">
                    {storeName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* 2. Business Name */}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-2">
                {storeName}
              </h3>

              {/* 3. VIP Reward CLUB */}
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-slate-950 text-amber-400 dark:bg-amber-400/10 dark:text-amber-300 font-extrabold text-xs tracking-widest uppercase shadow-sm border border-amber-500/30 mb-5">
                <span>★</span>
                <span>VIP REWARD CLUB</span>
                <span>★</span>
              </div>

              {/* 4. QR Code Box */}
              <div className="p-3.5 bg-white dark:bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-300 shadow-md mb-4 flex flex-col items-center">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="VIP Loyalty QR Code"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                )}
              </div>

              {/* Scan with WhatsApp Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold mb-4">
                <span className="text-emerald-600 font-bold">💬</span>
                <span>Scan with WhatsApp to Collect Stamps</span>
              </div>

              {/* Perks Row */}
              <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  🪙 1 Stamp / Visit
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  🎁 Welcome Treat
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  🎂 Birthday Freebie
                </div>
              </div>

              {/* Bottom CustomerPilot Branding */}
              <div className="w-full pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>100% WhatsApp Integrated</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">CustomerPilot</span>
              </div>
            </div>

            {/* Bottom Printing Guidelines */}
            <div className="mt-6 max-w-md w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                Click <strong>&quot;Print Standee (A4)&quot;</strong> to print with scissor trim lines for standard acrylic counter stands.
              </span>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                600 DPI Vector QR
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
