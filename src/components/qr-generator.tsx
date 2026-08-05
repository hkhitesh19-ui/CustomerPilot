"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { QrCode, Download, RefreshCw, Printer, Sparkles, CheckCircle2 } from "lucide-react"

const QR_TYPES = [
  { id: "counter", label: "Counter Stand", desc: "Best for Checkout Counters" },
  { id: "table", label: "Table Standee", desc: "For Dining Tables & Seating" },
  { id: "poster", label: "Store Poster", desc: "For Window & Entrance Display" },
  { id: "sticker", label: "Packaging Sticker", desc: "For Delivery Bags & Boxes" },
  { id: "cake_box", label: "Cake Box Seal", desc: "Special seal for bakery products" },
]

export function QRGenerator({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState("counter")
  const [loading, setLoading] = useState(true)
  const [qrData, setQrData] = useState<any>(null)

  useEffect(() => {
    let isMounted = true
    async function loadQR() {
      if (!merchantId) return
      setLoading(true)
      try {
        const res = await fetch(`/api/qr/generate?type=${selectedType}`, {
          headers: { "x-merchant-id": merchantId }
        })
        const json = await res.json()
        if (res.ok && isMounted) {
          // The API returns data wrapped in { ok: true, data: ... }
          setQrData(json.data || json)
        } else if (!res.ok && isMounted) {
          toast({ title: "Error", description: json.error || "Failed to generate QR", variant: "destructive" })
        }
      } catch (e: any) {
        if (isMounted) toast({ title: "Error", description: e.message, variant: "destructive" })
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadQR()
    return () => { isMounted = false }
  }, [selectedType, toast, merchantId])

  const handleDownloadPNG = () => {
    if (!qrData?.qrDataUrl) return
    const link = document.createElement("a")
    link.href = qrData.qrDataUrl
    link.download = `CustomerPilot-${selectedType}-QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({ title: "Downloaded PNG", description: `${qrData.title} downloaded successfully.` })
  }

  const handlePrintPDF = () => {
    toast({ title: "Preparing High-Res Printable PDF", description: "Format optimized for commercial printing with logo overlay." })
    window.print()
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-indigo-500" />
          Step 6: Commercial QR Generation
        </CardTitle>
        <CardDescription>
          Generate branded QR codes for your store counters, tables, posters, packaging, and cake boxes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1 gap-1">
            {QR_TYPES.map(t => (
              <TabsTrigger key={t.id} value={t.id} className="text-xs py-2">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

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
              {qrData?.title || "Counter Standee"}
            </p>
          </div>

          {/* Details & Actions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{QR_TYPES.find(t => t.id === selectedType)?.label}</h3>
              <p className="text-sm text-muted-foreground">{QR_TYPES.find(t => t.id === selectedType)?.desc}</p>
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
              <Button onClick={handlePrintPDF} variant="outline" disabled={loading || !qrData} className="flex-1">
                <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
