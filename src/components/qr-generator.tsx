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
  const [downloadingPoster, setDownloadingPoster] = useState(false)
  const [printingPoster, setPrintingPoster] = useState(false)

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
      link.download = `${storeName.replace(/\s+/g, "_")}-Master-QR-Code.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      toast({ title: "Downloaded QR Code!", description: "Universal Master QR poster image downloaded successfully." })
    } catch (e: any) {
      toast({ title: "Download Failed", description: e.message || "Could not download QR code image", variant: "destructive" })
    } finally {
      setDownloadingPoster(false)
    }
  }

  // Print Universal Master Standee (A4 Print-Ready with 100% Exact 3D Master Artwork)
  const handlePrintStandee = async () => {
    if (!merchantId) {
      toast({ title: "Please wait", description: "Merchant data is loading.", variant: "destructive" })
      return
    }

    setPrintingPoster(true)
    try {
      const res = await fetch(`/api/qr/standee?design=master&format=print&m=${merchantId}`)
      if (!res.ok) throw new Error("Failed to generate master standee poster for printing")
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
  <title>Master QR Loyalty Poster - ${safeStoreName}</title>
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
        max-width: 210mm;
        max-height: 297mm;
        page-break-after: avoid;
        page-break-inside: avoid;
        padding: 5mm 8mm;
      }
      .no-print {
        display: none !important;
      }
    }
    .trim-guide-box {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1.5px dashed #94a3b8;
      border-radius: 16px;
      padding: 4mm;
      background: #ffffff;
    }
    .trim-label-top {
      position: absolute;
      top: -10px;
      left: 16px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 8.5px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .trim-label-bottom {
      position: absolute;
      bottom: -10px;
      right: 16px;
      background: #ffffff;
      padding: 0 8px;
      font-size: 8px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .standee-master-img {
      max-width: 155mm;
      max-height: 252mm;
      width: auto;
      height: auto;
      display: block;
      border-radius: 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      image-rendering: -webkit-optimize-contrast;
    }
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
    <button class="btn-print" onclick="window.print()">🖨️ Print QR Code</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="print-sheet">
    <div class="trim-guide-box">
      <span class="trim-label-top">✂️ Cut along dashed line for Counter Acrylic Stand (A5 / 6×8" / 2:3)</span>
      <img src="${standeeDataUrl}" alt="${safeStoreName} Universal Master QR Code" class="standee-master-img" />
      <span class="trim-label-bottom">CustomerPilot Master QR • Universal Master Design</span>
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
            description: "Please allow popups in your browser to open the printable QR code view.",
            variant: "destructive",
          })
        }
      }
      reader.readAsDataURL(blob)
    } catch (e: any) {
      toast({
        title: "Print Failed",
        description: e.message || "Could not prepare master QR code for printing",
        variant: "destructive",
      })
    } finally {
      setPrintingPoster(false)
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
              Digital Loyalty Stamp QR Code
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Universal Master QR Loyalty Display with your branding, live WhatsApp check-in QR &amp; print-ready A4 export.
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
              disabled={loading || printingPoster || !merchantId}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
            >
              <Printer className="w-4 h-4 mr-1.5" /> {printingPoster ? "Preparing..." : "Print QR Code (A4)"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-sm font-semibold">Generating Master QR Code...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {/* ══════════════════════════════════════════════════════════════════ */}
            {/* UNIVERSAL MASTER QR LOYALTY STANDEE (LIVE ON-SCREEN PREVIEW)       */}
            <div className="w-full max-w-sm flex flex-col items-center relative">
              <img
                src={`/api/qr/standee?design=master&m=${merchantId}`}
                alt={`${storeName} Universal Master QR Code`}
                className="w-full h-auto rounded-[24px] shadow-2xl border-2 border-slate-900 object-contain"
              />
              <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Master Artwork
                </span>
                <span>Universal Print-Ready</span>
              </div>
            </div>

            {/* Bottom Printing Guidelines */}
            <div className="mt-6 max-w-md w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                Click <strong>&quot;Print QR Code (A4)&quot;</strong> or <strong>&quot;Download Poster&quot;</strong> for instant counter display inserts.
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
