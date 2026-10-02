"use client"

import { useState, useEffect } from "react"
import { 
  Smartphone, 
  Share2, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  Save, 
  RefreshCw, 
  Search, 
  Globe, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Instagram, 
  Facebook, 
  Youtube, 
  Clock, 
  Bike,
  Check,
  MessageCircle,
  Eye,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { DigitalCardView, DigitalCardData } from "@/components/digital-card-view"

export default function DigitalCardDashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchingGbp, setFetchingGbp] = useState(false)
  const [copied, setCopied] = useState(false)
  const [gbpSearchQuery, setGbpSearchQuery] = useState("")

  // Form State
  const [formData, setFormData] = useState<DigitalCardData>({
    id: "",
    slug: "cake-connection",
    displayName: "Cake Connection",
    subCategories: "Cakes • Desserts • Flowers • Party Decor",
    logoUrl: "/uploads/1789267721286-IMG_20220502_WA0034.jpg",
    coverUrl: null,
    locationShort: "Manjalpur",
    locationState: "Vadodara, Gujarat",
    businessHours: "Open Daily • 9:00 AM – 12:00 AM",
    deliveryInfo: "Delivery Available • Vadodara Only",
    whatsappNumber: "917203824012",
    phoneNumber: "+91 72038 24012",
    instagramUrl: "https://www.instagram.com/CakeConnection.in/",
    facebookUrl: "https://www.facebook.com/CakeConnection.in/",
    youtubeUrl: "",
    googleMapsUrl: "https://maps.google.com/?q=Cake+Connection+Manjalpur+Vadodara",
    websiteUrl: "https://cakeconnection.in",
    orderingLinks: JSON.stringify([
      { platform: "website", label: "Website", sublabel: "Order Now", url: "https://cakeconnection.in", color: "#2563eb" },
      { platform: "whatsapp", label: "WhatsApp", sublabel: "Order Now", url: "https://wa.me/917203824012?text=Hi%20Cake%20Connection%2C%20I%20want%20to%20order", color: "#16a34a" },
      { platform: "zomato", label: "Zomato", sublabel: "Order Now", url: "https://www.zomato.com", color: "#ef4444" },
      { platform: "swiggy", label: "Swiggy", sublabel: "Order Now", url: "https://www.swiggy.com", color: "#f97316" },
      { platform: "easycater", label: "EasyCater", sublabel: "Order Now", url: "https://www.easycater.com", color: "#7c3aed" }
    ]),
    googleRating: 4.6,
    googleReviewsCnt: 689,
  })

  // Load existing card
  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch("/api/digital-card")
        const json = await res.json()
        if (json.success && json.card) {
          setFormData(json.card)
        }
      } catch (err) {
        console.error("Failed to load digital card", err)
      } finally {
        setLoading(false)
      }
    }
    loadCard()
  }, [])

  // Auto-Fetch from Public GBP (No OAuth required)
  const handleAutoFetchGbp = async () => {
    if (!gbpSearchQuery.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your Store Name or paste your Google Maps link.",
        variant: "destructive",
      })
      return
    }

    setFetchingGbp(true)
    try {
      const res = await fetch("/api/digital-card/fetch-public-gbp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: gbpSearchQuery }),
      })
      const json = await res.json()

      if (!json.success) {
        // API explicitly failed — show the error, do NOT touch form fields
        toast({
          title: "Could Not Extract Business Details",
          description: json.error || "Please type your business name directly instead of pasting a short link.",
          variant: "destructive",
        })
        return
      }

      if (json.success && json.details) {
        const d = json.details
        // Only overwrite a field if the API returned a non-empty, non-null, non-URL value
        setFormData((prev) => ({
          ...prev,
          displayName: (d.displayName && !d.displayName.startsWith("http"))
            ? d.displayName
            : prev.displayName,
          subCategories: d.subCategories ? d.subCategories : prev.subCategories,
          locationShort: d.locationShort ? d.locationShort : prev.locationShort,
          locationState: d.locationState ? d.locationState : prev.locationState,
          phoneNumber: d.phoneNumber ? d.phoneNumber : prev.phoneNumber,
          googleRating: d.googleRating != null ? d.googleRating : prev.googleRating,
          googleReviewsCnt: d.googleReviewsCnt != null ? d.googleReviewsCnt : prev.googleReviewsCnt,
          googleMapsUrl: (d.googleMapsUrl && d.googleMapsUrl.length > 20)
            ? d.googleMapsUrl
            : prev.googleMapsUrl,
          websiteUrl: d.websiteUrl ? d.websiteUrl : prev.websiteUrl,
          businessHours: d.businessHours ? d.businessHours : prev.businessHours,
          deliveryInfo: d.deliveryInfo ? d.deliveryInfo : prev.deliveryInfo,
        }))

        if (json.partial) {
          toast({
            title: "Partial Info Found ⚠️",
            description: "Business name pre-filled. Please verify and complete remaining details (location, hours, phone) manually before saving.",
          })
        } else {
          toast({
            title: "GBP Details Auto-Synced! ⚡",
            description: `${json.source === "google_places_api" ? "Full Google Places data" : "Business details"} fetched successfully.`,
          })
        }
      }
    } catch (err) {
      toast({
        title: "Fetch Error",
        description: "Network error occurred while fetching GBP details.",
        variant: "destructive",
      })
    } finally {
      setFetchingGbp(false)
    }
  }

  // Save Card Changes
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/digital-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (json.success) {
        toast({
          title: "Digital Business Card Saved! ✅",
          description: "Your live card has been updated successfully.",
        })
      } else {
        toast({
          title: "Save Failed",
          description: json.error || "Failed to save card changes.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/c/${formData.slug}`
    : `https://customerpilot.in/c/${formData.slug}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast({ title: "Link Copied!", description: publicUrl })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsAppShare = () => {
    const text = `🎂 *${formData.displayName} • Official Digital Business Card* ✨\n📍 ${formData.locationShort || "Vadodara"} | ⭐ ${formData.googleRating || 4.6} (${formData.googleReviewsCnt || 689} Reviews)\n\nHamare contacts, menu, Instagram, Zomato & Swiggy online ordering ke liye tap karein:\n👉 ${publicUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold text-slate-500">Loading your Digital Business Card...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Standalone Service
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Smartphone className="w-7 h-7 text-indigo-400" />
            Luxury Live Digital Business Card
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Auto-fetch public Google Business Profile details, add social &amp; online food ordering links, and share directly on WhatsApp or through countertop QR codes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700"
          >
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "Copied" : "Copy Live Link"}
          </Button>
          
          <Button
            onClick={handleWhatsAppShare}
            size="sm"
            className="rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-md"
          >
            <MessageCircle className="w-4 h-4 mr-1 fill-white" />
            Share on WhatsApp
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
          >
            <a href={`/c/${formData.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              Open Live Card
            </a>
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Editor + Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: EDITORS & AUTO-FETCH (7 COLS)                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. Public GBP Auto-Sync Card */}
          <Card className="border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black flex items-center gap-2 text-amber-800 dark:text-amber-400">
                  <Search className="w-4 h-4 text-amber-600" />
                  Auto-Fetch from Google Business Profile (100% Public)
                </CardTitle>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  No Google Login Needed
                </span>
              </div>
              <CardDescription className="text-xs">
                Enter your Store Name or paste your Google Maps Share Link. We will auto-extract your location, phone, rating, reviews and opening hours!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={gbpSearchQuery}
                  onChange={(e) => setGbpSearchQuery(e.target.value)}
                  placeholder="e.g. Cake Connection Manjalpur Vadodara or maps link..."
                  className="rounded-xl bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                />
                <Button
                  onClick={handleAutoFetchGbp}
                  disabled={fetchingGbp}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex-shrink-0"
                >
                  {fetchingGbp ? <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                  Auto-Fill
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 2. Identity & Branding */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Store Identity &amp; Status Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold">Business Display Name</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">Custom URL Slug (/c/your-slug)</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    className="mt-1 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold">Categories / Tagline (Separated by •)</Label>
                <Input
                  value={formData.subCategories || ""}
                  onChange={(e) => setFormData({ ...formData, subCategories: e.target.value })}
                  placeholder="Cakes • Desserts • Flowers • Party Decor"
                  className="mt-1 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold">📍 Short Location</Label>
                  <Input
                    value={formData.locationShort || ""}
                    onChange={(e) => setFormData({ ...formData, locationShort: e.target.value })}
                    placeholder="Manjalpur, Vadodara"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">🕒 Business Hours</Label>
                  <Input
                    value={formData.businessHours || ""}
                    onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                    placeholder="Open Daily • 9:00 AM – 12:00 AM"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">🛵 Delivery Scope</Label>
                  <Input
                    value={formData.deliveryInfo || ""}
                    onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
                    placeholder="Delivery Available • Vadodara Only"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Direct Contact & Social Links */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Direct Contact &amp; Social Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Number (with country code)
                  </Label>
                  <Input
                    value={formData.whatsappNumber || ""}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="919876543210"
                    className="mt-1 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    Calling Phone Number
                  </Label>
                  <Input
                    value={formData.phoneNumber || ""}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    Instagram Profile Link
                  </Label>
                  <Input
                    value={formData.instagramUrl || ""}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/cakeconnection"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" />
                    Facebook Page Link
                  </Label>
                  <Input
                    value={formData.facebookUrl || ""}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/cakeconnection"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                    YouTube Channel Link
                  </Label>
                  <Input
                    value={formData.youtubeUrl || ""}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/@cakeconnection"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    Google Maps Direction Link
                  </Label>
                  <Input
                    value={formData.googleMapsUrl || ""}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Save Button Action */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-wider uppercase shadow-xl transition-all"
            >
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save All Changes to Live Digital Card
            </Button>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: LIVE INTERACTIVE IPHONE SIMULATOR (5 COLS)        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-5 flex flex-col items-center sticky top-6">
          
          <div className="flex items-center justify-between w-full max-w-sm mb-2 px-2">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              Live Interactive Simulator
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300">
              Live Preview
            </span>
          </div>

          {/* iPhone Outer Chassis Frame */}
          <div className="w-full max-w-[380px] rounded-[48px] bg-slate-950 p-3 shadow-2xl border-4 border-slate-800 relative ring-1 ring-slate-700/50">
            
            {/* Top Speaker / Dynamic Island */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end pr-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            {/* Inner Mobile Screen Canvas */}
            <div className="w-full rounded-[38px] overflow-hidden bg-white max-h-[720px] overflow-y-auto no-scrollbar relative shadow-inner">
              <DigitalCardView card={formData} />
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
          </div>

        </div>

      </div>

    </div>
  )
}
