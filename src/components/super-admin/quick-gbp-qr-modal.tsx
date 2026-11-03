"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Zap, Loader2, Star, MapPin, Copy, Check, Download, ExternalLink, QrCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuickGbpQrModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickGbpQrModal({ open, onOpenChange }: QuickGbpQrModalProps) {
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [phone, setPhone] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copiedReview, setCopiedReview] = useState(false)
  const [copiedMaps, setCopiedMaps] = useState(false)

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      toast({ title: "Query required", description: "Please enter a business name or Google Maps link.", variant: "destructive" })
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/admin/gbp/quick-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          customPhone: phone.trim() || undefined,
          customCategory: category.trim() || undefined
        })
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to resolve Google Business Profile")
      }
      setResult(json)
      toast({ title: "Smart Review QR Generated! ⚡", description: `Resolved: ${json.merchantName}` })
    } catch (err: any) {
      toast({ title: "Resolution Error", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyReviewUrl = () => {
    if (!result?.smartReviewUrl) return
    navigator.clipboard.writeText(result.smartReviewUrl)
    setCopiedReview(true)
    setTimeout(() => setCopiedReview(false), 2000)
    toast({ title: "Copied!", description: "CustomerPilot Smart AI Review URL copied." })
  }

  const handleCopyMapsUrl = () => {
    if (!result?.googleReviewUrl) return
    navigator.clipboard.writeText(result.googleReviewUrl)
    setCopiedMaps(true)
    setTimeout(() => setCopiedMaps(false), 2000)
    toast({ title: "Copied!", description: "Direct Google Maps Review link copied." })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </span>
            <DialogTitle className="text-xl font-black text-white tracking-tight">
              Instant Smart AI Review QR from Google Profile
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Paste any Google Maps link or enter a Business Name & City. System resolves the Place ID from Google and generates the ready-to-print Smart AI Review QR code instantly.
          </DialogDescription>
        </DialogHeader>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-300">
              Google Business Profile Link or Store Query *
            </Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Cake Connection Pune or https://maps.app.goo.gl/..."
              className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-sm font-medium"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">
                Store WhatsApp Number (optional)
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 919099773781"
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-sm font-mono"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">
                Industry Category (optional)
              </Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Bakery, Cafe, Salon"
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Querying Google Places & Generating QR...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Smart Review QR & Standee
              </>
            )}
          </Button>
        </form>

        {/* Resolved Results Card */}
        {result && (
          <div className="mt-5 p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 shadow-inner space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-lg font-black text-white">{result.merchantName}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {result.address}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {result.rating && (
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black">
                    <Star className="w-3 h-3 mr-1 fill-amber-400" />
                    {result.rating} ({result.reviewCount || 0} reviews)
                  </Badge>
                )}
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Google Linked ✓
                </Badge>
              </div>
            </div>

            {/* QR Code Preview & Direct Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* Left: High-Res QR Image */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-emerald-400/80 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.qrCodeBase64}
                  alt="Smart AI Review QR Code"
                  className="w-48 h-48 object-contain"
                />
                <a
                  href={result.qrCodeBase64}
                  download={`${result.merchantName.replace(/[^a-z0-9]/gi, "_")}_Review_QR.png`}
                  className="mt-3 w-full"
                >
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Download 1024px QR PNG
                  </Button>
                </a>
              </div>

              {/* Right: Live Links & Actions */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px] block mb-1">
                    Smart AI Review URL (QR Destination)
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="font-mono text-emerald-400 truncate flex-1">{result.smartReviewUrl}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyReviewUrl}
                      className="h-7 px-2 text-slate-300 hover:text-white"
                    >
                      {copiedReview ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <a href={result.smartReviewUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-300 hover:text-white">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px] block mb-1">
                    Direct Google Maps Write Review Link
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <span className="font-mono text-slate-400 truncate flex-1">{result.googleReviewUrl}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyMapsUrl}
                      className="h-7 px-2 text-slate-300 hover:text-white"
                    >
                      {copiedMaps ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <a href={result.googleReviewUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-300 hover:text-white">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <a href={result.standeeUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="w-full border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/50 font-bold text-xs">
                      <QrCode className="w-3.5 h-3.5 mr-1.5" />
                      Open Print-Ready Table Standee Preview ↗
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
