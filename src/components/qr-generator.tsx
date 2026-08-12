"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, RefreshCw, Printer, Sparkles, CheckCircle2 } from "lucide-react"

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)

  useEffect(() => {
    let isMounted = true
    async function loadQR() {
      if (!merchantId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/qr/generate?type=counter`, {
          headers: { "x-merchant-id": merchantId }
        })
        const json = await res.json().catch(() => null)
        if (res.ok && json && isMounted) {
          setQrData(json.data || json)
        } else if (!res.ok && isMounted) {
          toast({ title: "Error", description: json?.error || "Failed to generate QR", variant: "destructive" })
        }
      } catch (e: any) {
        if (isMounted) toast({ title: "Error", description: e.message, variant: "destructive" })
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadQR()
    return () => { isMounted = false }
  }, [toast, merchantId])

  const handleDownloadPNG = () => {
    if (!qrData?.qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrData.qrDataUrl
    link.download = `CustomerPilot-Counter-Stand-QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded PNG", description: "Counter Stand QR downloaded successfully." })
  }

  const handlePrintPDF = () => {
    if (!qrData?.qrDataUrl) return

    const storeName = qrData?.merchant?.name || "Merchant Store"
    const logoHtml = qrData?.merchant?.logoUrl
      ? `<img src="${qrData.merchant.logoUrl}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; margin:0 auto 12px auto; border:3px solid #6366f1;" />`
      : `<div style="width:70px; height:70px; border-radius:50%; background:#6366f1; color:white; font-size:24px; font-weight:bold; display:flex; align-items:center; justify-content:center; margin:0 auto 12px auto;">CP</div>`

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Counter Stand QR - ${storeName}</title>
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
              width: 360px;
              background: white;
              border-radius: 24px;
              border: 4px solid #6366f1;
              padding: 36px 24px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
            }
            .badge {
              background: #6366f1;
              color: white;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              padding: 6px 16px;
              border-radius: 20px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .store-name {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              margin: 8px 0 4px 0;
            }
            .tagline {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 20px;
              font-weight: 500;
            }
            .qr-box {
              background: white;
              padding: 16px;
              border-radius: 18px;
              border: 2px solid #e2e8f0;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            }
            .qr-img {
              width: 220px;
              height: 220px;
              display: block;
            }
            .footer-text {
              margin-top: 20px;
              font-size: 12px;
              color: #475569;
              font-weight: 600;
            }
            .powered-by {
              margin-top: 10px;
              font-size: 10px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="badge">VIP Loyalty Club</div>
            <div>${logoHtml}</div>
            <div class="store-name">${storeName}</div>
            <div class="tagline">Scan QR Code to Earn Stamps & Claim Rewards!</div>
            
            <div class="qr-box">
              <img src="${qrData.qrDataUrl}" class="qr-img" />
            </div>

            <div class="footer-text">📲 Point your camera to check-in on WhatsApp</div>
            <div class="powered-by">Powered by CustomerPilot</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `

    const printWin = window.open("", "_blank", "width=600,height=800")
    if (printWin) {
      printWin.document.write(printContent)
      printWin.document.close()
    } else {
      toast({
        title: "Pop-up Blocked",
        description: "Please allow pop-ups for this site to print/save PDF.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-500" />
          Commercial QR Generation
        </CardTitle>
        <CardDescription>
          Generate and print your branded Counter Stand QR code for store checkout counters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Printable Preview Card */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-indigo-500/30 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-background dark:from-indigo-950/20 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-indigo-500 text-white rounded-full">
              <Sparkles className="w-3 h-3" /> Ready to Print
            </div>

            {/* Merchant Branding Header */}
            <div className="flex items-center gap-2 mb-3">
              {qrData?.merchant?.logoUrl ? (
                <img src={qrData.merchant.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover border" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  CP
                </div>
              )}
              <span className="font-bold text-base">{qrData?.merchant?.name || "Merchant Store"}</span>
            </div>

            <p className="text-xs text-muted-foreground mb-4 font-medium">Scan to Collect Stamps & Claim Rewards!</p>

            {/* QR Image Container */}
            <div className="relative p-3 bg-white rounded-xl shadow-inner border border-gray-200">
              {loading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                </div>
              ) : qrData?.qrDataUrl ? (
                <img src={qrData.qrDataUrl} alt="Store QR Code" className="w-48 h-48 rounded-lg" />
              ) : null}
            </div>

            <p className="text-[11px] font-mono text-muted-foreground mt-3 uppercase tracking-wider">
              Counter Standee
            </p>
          </div>

          {/* Details & Actions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Counter Standee</h3>
              <p className="text-sm text-muted-foreground">High-resolution QR code standee optimized for store checkout counters.</p>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground border p-3 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Auto-attached to Merchant WhatsApp Pipeline
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> High-Resolution Vector Output
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Embedded Merchant Logo & Theme
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button onClick={handleDownloadPNG} disabled={loading || !qrData} className="flex-1">
                <Download className="w-4 h-4 mr-2" /> Download PNG
              </Button>
              <Button onClick={handlePrintPDF} variant="outline" disabled={loading || !qrData} className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 border-none">
                <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
