"use client"

import { useState, useEffect, useRef } from "react"
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
  Loader2,
  Star,
  Image as ImageIcon,
  UtensilsCrossed,
  IndianRupee,
  CreditCard,
  Mail,
  SlidersHorizontal,
  Upload,
  Trash2
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

  // Dedicated Platform & Contact Links
  const [email, setEmail] = useState("")
  const [enableFoodDelivery, setEnableFoodDelivery] = useState(false)
  const [googleReviewLink, setGoogleReviewLink] = useState("")
  const [zomatoUrl, setZomatoUrl] = useState("")
  const [swiggyUrl, setSwiggyUrl] = useState("")
  const [otherOrderUrl, setOtherOrderUrl] = useState("")
  const [otherOrderLabel, setOtherOrderLabel] = useState("EasyCater / Other")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

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
    email: "order.cakeconnection@gmail.com",
    instagramUrl: "https://www.instagram.com/CakeConnection.in/",
    facebookUrl: "https://www.facebook.com/CakeConnection.in/",
    youtubeUrl: "",
    googleMapsUrl: "https://maps.google.com/?q=Cake+Connection+Manjalpur+Vadodara",
    googleReviewUrl: "",
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

  // Dynamic category detection
  const isPetCategory = ((formData.subCategories || "") + " " + (formData.displayName || "")).toLowerCase().match(/pet|dog|cat|puppy|animal|vet|grooming|paw/) !== null

  // Synchronize orderingLinks into formData for live interactive phone simulator
  const syncSimulatorLinks = (
    newZomato: string,
    newSwiggy: string,
    newOtherU: string,
    newOtherL: string,
    newWebsite: string,
    newWhatsapp: string,
    newReview: string,
    newEmail?: string,
    foodDeliveryOverride?: boolean,
    isPetOverride?: boolean
  ) => {
    const list: any[] = []
    const isPet = isPetOverride !== undefined ? isPetOverride : isPetCategory
    const allowFood = foodDeliveryOverride !== undefined ? foodDeliveryOverride : enableFoodDelivery

    if (newWebsite?.trim()) {
      list.push({ platform: "website", label: isPet ? "Online Store" : "Website", sublabel: isPet ? "Explore" : "Order Now", url: newWebsite.trim(), color: "#2563eb" })
    }
    if (newWhatsapp?.trim()) {
      list.push({
        platform: "whatsapp",
        label: "WhatsApp",
        sublabel: isPet ? "Pet Supplies" : "Order Now",
        url: `https://wa.me/${newWhatsapp.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(formData.displayName)}%2C%20${encodeURIComponent(isPet ? "I want to inquire about pet supplies" : "I want to order")}`,
        color: "#16a34a"
      })
    }
    // Only show Zomato and Swiggy if NOT a pet category, or if food delivery is explicitly enabled
    if (!isPet || allowFood) {
      if (newZomato?.trim()) {
        list.push({ platform: "zomato", label: "Zomato", sublabel: "Order Now", url: newZomato.trim(), color: "#ef4444" })
      }
      if (newSwiggy?.trim()) {
        list.push({ platform: "swiggy", label: "Swiggy", sublabel: "Order Now", url: newSwiggy.trim(), color: "#f97316" })
      }
    }
    if (newOtherU?.trim()) {
      list.push({
        platform: isPet ? "catalog" : "easycater",
        label: newOtherL?.trim() || (isPet ? "Pet Catalog" : "Catalog"),
        sublabel: isPet ? "View All" : "Order Now",
        url: newOtherU.trim(),
        color: "#7c3aed"
      })
    }
    if (isPet && list.length < 5) {
      list.push({
        platform: "grooming",
        label: "Grooming",
        sublabel: "Book Spa",
        url: newWhatsapp?.trim() ? `https://wa.me/${newWhatsapp.replace(/[^0-9]/g, "")}?text=Hi%2C%20I%20want%20to%20book%20a%20pet%20grooming%20session` : "#",
        color: "#0284c7"
      })
      list.push({
        platform: "directions",
        label: "Store Visit",
        sublabel: "Find Us",
        url: formData.googleMapsUrl || "#",
        color: "#d97706"
      })
    }

    setFormData((prev) => ({
      ...prev,
      email: newEmail !== undefined ? newEmail : (prev.email || email),
      orderingLinks: JSON.stringify(list),
      googleReviewUrl: newReview ? newReview.trim() : prev.googleReviewUrl,
      googlePlaceId: newReview ? newReview.trim() : prev.googlePlaceId
    }))
  }

  // Load existing card
  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch("/api/digital-card")
        const json = await res.json()
        if (json.success && json.card) {
          const c = json.card
          setFormData(c)

          // Extract ordering platforms
          let zomato = ""
          let swiggy = ""
          let otherU = ""
          let otherL = "EasyCater / Other"
          try {
            const arr = JSON.parse(c.orderingLinks || "[]")
            if (Array.isArray(arr)) {
              zomato = arr.find((l: any) => l.platform?.toLowerCase() === "zomato")?.url || ""
              swiggy = arr.find((l: any) => l.platform?.toLowerCase() === "swiggy")?.url || ""
              const o = arr.find((l: any) => l.platform?.toLowerCase() === "easycater" || l.platform?.toLowerCase() === "catalog" || (!["website", "whatsapp", "zomato", "swiggy"].includes(l.platform?.toLowerCase())))
              if (o) {
                otherU = o.url || ""
                otherL = o.label || "Catalog / Other"
              }
            }
          } catch {}
          setZomatoUrl(zomato)
          setSwiggyUrl(swiggy)
          setOtherOrderUrl(otherU)
          setOtherOrderLabel(otherL)

          // Extract Email & Theme preferences
          let cardEmail = c.email || ""
          let allowFood = false
          if (c.theme && typeof c.theme === "string" && c.theme.startsWith("{")) {
            try {
              const th = JSON.parse(c.theme)
              if (!cardEmail && th.email) cardEmail = th.email
              if (th.enableFoodDelivery !== undefined) allowFood = Boolean(th.enableFoodDelivery)
            } catch {}
          }
          setEmail(cardEmail)
          setEnableFoodDelivery(allowFood)

          // Extract Google Review link
          let revLink = c.googleReviewUrl || ""
          if (!revLink && c.theme && typeof c.theme === "string" && c.theme.startsWith("{")) {
            try {
              const th = JSON.parse(c.theme)
              if (th.googleReviewLink) revLink = th.googleReviewLink
            } catch {}
          }
          if (!revLink && c.googlePlaceId && (c.googlePlaceId.startsWith("http://") || c.googlePlaceId.startsWith("https://"))) {
            revLink = c.googlePlaceId
          }
          setGoogleReviewLink(revLink)
        }
      } catch (err) {
        console.error("Failed to load digital card", err)
      } finally {
        setLoading(false)
      }
    }
    loadCard()
  }, [])

  // ── Unified Logo Upload / Removal (Synchronized Everywhere) ──
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum allowed file size is 5MB", variant: "destructive" })
      return
    }
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "logo")
      const res = await fetch("/api/merchant/upload-brand", {
        method: "POST",
        body: fd,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Upload failed")
      const uploadedUrl = json.data?.url || json.url
      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, logoUrl: uploadedUrl }))
        toast({
          title: "Logo Synchronized Everywhere! 🌟",
          description: "Aapka logo Digital Card, Counter Standee, aur Google Review Standee sabhi jagah ek saath update ho gaya hai.",
        })
      }
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message || "Failed to upload logo", variant: "destructive" })
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm("Kya aap sach me logo remove karna chahte hain? Ye Digital Card aur sabhi Standees se hat jayega.")) return
    try {
      await fetch("/api/merchant/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: null }),
      })
      setFormData(prev => ({ ...prev, logoUrl: "" }))
      toast({
        title: "Logo Removed Everywhere",
        description: "Logo sabhi standees aur digital card se successfully remove ho gaya hai.",
      })
    } catch {
      toast({ title: "Error", description: "Failed to remove logo", variant: "destructive" })
    }
  }

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
        toast({
          title: "Could Not Extract Business Details",
          description: json.error || "Please type your business name directly instead of pasting a short link.",
          variant: "destructive",
        })
        return
      }

      if (json.success && json.details) {
        const d = json.details
        const isPet = Boolean(d.isPetStore) || ((d.subCategories || "") + " " + (d.displayName || "")).toLowerCase().match(/pet|dog|cat|puppy|animal|vet|grooming|paw/) !== null

        if (d.email) setEmail(d.email)
        if (isPet) {
          setEnableFoodDelivery(false)
          setZomatoUrl("")
          setSwiggyUrl("")
          setOtherOrderLabel("Pet Catalog")
        }

        const newSlug = d.slug || (d.displayName ? d.displayName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") : formData.slug)

        setFormData((prev) => ({
          ...prev,
          displayName: (d.displayName && !d.displayName.startsWith("http"))
            ? d.displayName
            : prev.displayName,
          slug: newSlug || prev.slug,
          subCategories: d.subCategories ? d.subCategories : prev.subCategories,
          locationShort: d.locationShort ? d.locationShort : prev.locationShort,
          locationState: d.locationState ? d.locationState : prev.locationState,
          phoneNumber: d.phoneNumber ? d.phoneNumber : prev.phoneNumber,
          whatsappNumber: d.whatsappNumber ? d.whatsappNumber : prev.whatsappNumber,
          logoUrl: d.logoUrl ? d.logoUrl : prev.logoUrl,
          email: d.email ? d.email : (email || prev.email),
          googleRating: d.googleRating != null ? d.googleRating : prev.googleRating,
          googleReviewsCnt: d.googleReviewsCnt != null ? d.googleReviewsCnt : prev.googleReviewsCnt,
          googleMapsUrl: (d.googleMapsUrl && d.googleMapsUrl.length > 20)
            ? d.googleMapsUrl
            : prev.googleMapsUrl,
          websiteUrl: d.websiteUrl !== undefined ? d.websiteUrl : prev.websiteUrl,
          businessHours: d.businessHours ? d.businessHours : prev.businessHours,
          deliveryInfo: d.deliveryInfo ? d.deliveryInfo : prev.deliveryInfo,
          orderingLinks: d.orderingLinks ? d.orderingLinks : prev.orderingLinks,
        }))

        if (d.googleReviewLink) {
          setGoogleReviewLink(d.googleReviewLink)
        }

        syncSimulatorLinks(
          isPet ? "" : zomatoUrl,
          isPet ? "" : swiggyUrl,
          otherOrderUrl,
          isPet ? "Pet Catalog" : otherOrderLabel,
          d.websiteUrl || formData.websiteUrl || "",
          d.whatsappNumber || formData.whatsappNumber || "",
          d.googleReviewLink || googleReviewLink,
          d.email || email,
          !isPet,
          isPet
        )

        toast({
          title: isPet ? "🐾 Pet Store Profile Auto-Synced!" : "GBP Details Auto-Synced! ⚡",
          description: isPet
            ? `${d.displayName}: Contact details, email and pet catalog active. Zomato & Swiggy food links disabled.`
            : `${json.source === "google_places_api" ? "Full Google Places data" : "Business details"} fetched successfully.`,
        })
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
      const payload = {
        ...formData,
        email: email.trim(),
        enableFoodDelivery,
        googleReviewLink: googleReviewLink.trim(),
        zomatoUrl: (enableFoodDelivery || !isPetCategory) ? zomatoUrl.trim() : "",
        swiggyUrl: (enableFoodDelivery || !isPetCategory) ? swiggyUrl.trim() : "",
        websiteUrl: formData.websiteUrl?.trim() || "",
        otherOrderUrl: otherOrderUrl.trim(),
        otherOrderLabel: otherOrderLabel.trim(),
      }

      const res = await fetch("/api/digital-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    const emoji = isPetCategory ? "🐾" : "🎂"
    const channels = isPetCategory
      ? "contacts, services catalog & directions"
      : "contacts, menu, Instagram, Zomato & Swiggy online ordering"
    const text = `${emoji} *${formData.displayName} • Official Digital Business Card* ✨\n📍 ${formData.locationShort || "Vadodara"} | ⭐ ${formData.googleRating || 4.6} (${formData.googleReviewsCnt || 689} Reviews)\n\nHamare ${channels} ke liye tap karein:\n👉 ${publicUrl}`
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

          <Button
            asChild
            size="sm"
            className="rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold"
          >
            <a href="/dashboard/settings#sec-vip-qr">
              <QrCode className="w-4 h-4 mr-1 text-amber-400" />
              Counter Standee
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

          {/* 2. Google Review Short Link Highlighted Card */}
          <Card className="border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black flex items-center gap-2 text-amber-800 dark:text-amber-400">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ⭐ Google Review Short Link (Auto 5-Star Reviews Modal)
                </CardTitle>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Recommended for Reviews
                </span>
              </div>
              <CardDescription className="text-xs text-slate-600 dark:text-slate-400">
                When visitors tap &quot;Google Review&quot; on your digital card, this link opens the direct 5-star review submission modal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={googleReviewLink}
                onChange={(e) => {
                  const val = e.target.value
                  setGoogleReviewLink(val)
                  syncSimulatorLinks(zomatoUrl, swiggyUrl, otherOrderUrl, otherOrderLabel, formData.websiteUrl || "", formData.whatsappNumber || "", val)
                }}
                placeholder="e.g. https://g.page/r/CbXxY.../review or maps.app.goo.gl/..."
                className="rounded-xl text-xs bg-white dark:bg-slate-900 border-amber-500/40 text-amber-900 dark:text-amber-200 font-medium"
              />
            </CardContent>
          </Card>

          {/* 3. Identity & Branding */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Store Identity, Logo &amp; Google Rating
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

              {/* Store Logo with Direct Upload & Global Auto-Sync */}
              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                    Store Brand Logo (Synchronized Across All Standees & Digital Card)
                  </Label>
                  {formData.logoUrl && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active Everywhere
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap sm:flex-nowrap">
                  <Input
                    value={formData.logoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="/uploads/... or https://..."
                    className="rounded-xl text-xs font-mono flex-1 min-w-[200px]"
                  />

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                  />

                  {/* 1-Click Upload / Change Logo Button */}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-xl border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900 font-bold text-xs shrink-0 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    {uploadingLogo ? "Uploading..." : (formData.logoUrl ? "Change Logo" : "Upload Logo")}
                  </Button>

                  {/* Remove Logo Button */}
                  {formData.logoUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveLogo}
                      className="h-8 px-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl shrink-0"
                      title="Remove Logo everywhere"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}

                  {/* Live Thumbnail Preview */}
                  {formData.logoUrl && (
                    <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                      <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ✨ Logo yahan upload/change karne par ye automatically Digital Card, Counter Standee, aur Google Review Standee sabhi jagah ek saath live change ho jayega.
                </p>
              </div>

              {/* Google Rating & Review Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Google Star Rating
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.googleRating || 4.6}
                    onChange={(e) => setFormData({ ...formData, googleRating: parseFloat(e.target.value) || 4.6 })}
                    className="mt-1 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                    Google Reviews Count
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.googleReviewsCnt || 689}
                    onChange={(e) => setFormData({ ...formData, googleReviewsCnt: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Contact & 3-Pill Status Details */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Contact &amp; 3-Pill Status Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Number
                  </Label>
                  <Input
                    value={formData.whatsappNumber || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData({ ...formData, whatsappNumber: val })
                      syncSimulatorLinks(zomatoUrl, swiggyUrl, otherOrderUrl, otherOrderLabel, formData.websiteUrl || "", val, googleReviewLink, email)
                    }}
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
                    className="mt-1 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    Official Business Email (Contacts &amp; vCard)
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value
                      setEmail(val)
                      setFormData((prev) => ({ ...prev, email: val }))
                      syncSimulatorLinks(zomatoUrl, swiggyUrl, otherOrderUrl, otherOrderLabel, formData.websiteUrl || "", formData.whatsappNumber || "", googleReviewLink, val)
                    }}
                    placeholder="e.g. mawpaw2323@gmail.com"
                    className="mt-1 rounded-xl text-xs font-mono bg-indigo-50/20 border-indigo-200 dark:border-indigo-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold">📍 Area &amp; City (Pill 1)</Label>
                  <Input
                    value={formData.locationShort || ""}
                    onChange={(e) => setFormData({ ...formData, locationShort: e.target.value })}
                    placeholder="Manjalpur, Vadodara"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">🕒 Business Hours (Pill 2)</Label>
                  <Input
                    value={formData.businessHours || ""}
                    onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                    placeholder="Open Daily • 9:00 AM – 12:00 AM"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold">🛵 Delivery Scope (Pill 3)</Label>
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

          {/* 5. Online Ordering Platforms & Catalog */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                  {isPetCategory ? "Pet Services & Store Catalog" : "Online Ordering Platforms & Store Catalog"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isPetCategory 
                      ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                      : "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-300"
                  }`}>
                    {isPetCategory ? "🐾 Pet Store Mode" : "🍔 Food & Dining Mode"}
                  </span>
                </div>
              </div>
              <CardDescription className="text-xs">
                {isPetCategory
                  ? "Configure product catalog, grooming booking, website and WhatsApp inquiry channels for your pet store."
                  : "Configure direct ordering and menu catalog links displayed on your live digital business card."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Pet Store Mode Notice & Food Delivery Toggle */}
              {isPetCategory && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">🐾</span>
                    <div>
                      <div className="font-extrabold text-amber-900 dark:text-amber-300">
                        Pet Store &amp; Pet Care Profile Active
                      </div>
                      <div className="text-[11px] text-amber-800/80 dark:text-amber-400 mt-0.5 leading-snug">
                        Food delivery links (Zomato &amp; Swiggy) are disabled by default. Contacts, WhatsApp Inquiry &amp; Pet Catalog are enabled.
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = !enableFoodDelivery
                      setEnableFoodDelivery(next)
                      syncSimulatorLinks(zomatoUrl, swiggyUrl, otherOrderUrl, otherOrderLabel, formData.websiteUrl || "", formData.whatsappNumber || "", googleReviewLink, email, next, isPetCategory)
                    }}
                    className="rounded-xl border-amber-300 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900/50 whitespace-nowrap self-start sm:self-center"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                    {enableFoodDelivery ? "Disable Zomato & Swiggy" : "Enable Food Delivery Links"}
                  </Button>
                </div>
              )}

              {/* Zomato & Swiggy Links (Visible for Food businesses OR when explicitly enabled) */}
              {(!isPetCategory || enableFoodDelivery) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Zomato */}
                  <div>
                    <Label className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#e23744] text-white text-[10px] font-black flex items-center justify-center">z</span>
                      Zomato Order Link
                    </Label>
                    <Input
                      value={zomatoUrl}
                      onChange={(e) => {
                        const val = e.target.value
                        setZomatoUrl(val)
                        syncSimulatorLinks(val, swiggyUrl, otherOrderUrl, otherOrderLabel, formData.websiteUrl || "", formData.whatsappNumber || "", googleReviewLink, email, enableFoodDelivery, isPetCategory)
                      }}
                      placeholder="https://www.zomato.com/..."
                      className="mt-1 rounded-xl text-xs"
                    />
                  </div>

                  {/* Swiggy */}
                  <div>
                    <Label className="text-xs font-bold flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#fc8019] text-white text-[10px] font-black flex items-center justify-center">S</span>
                      Swiggy Order Link
                    </Label>
                    <Input
                      value={swiggyUrl}
                      onChange={(e) => {
                        const val = e.target.value
                        setSwiggyUrl(val)
                        syncSimulatorLinks(zomatoUrl, val, otherOrderUrl, otherOrderLabel, formData.websiteUrl || "", formData.whatsappNumber || "", googleReviewLink, email, enableFoodDelivery, isPetCategory)
                      }}
                      placeholder="https://www.swiggy.com/..."
                      className="mt-1 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Website / Online Menu / Online Store */}
                <div>
                  <Label className="text-xs font-bold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    {isPetCategory ? "Online Store / Website Link" : "Website / Online Menu Link"}
                  </Label>
                  <Input
                    value={formData.websiteUrl || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData({ ...formData, websiteUrl: val })
                      syncSimulatorLinks(zomatoUrl, swiggyUrl, otherOrderUrl, otherOrderLabel, val, formData.whatsappNumber || "", googleReviewLink, email, enableFoodDelivery, isPetCategory)
                    }}
                    placeholder={isPetCategory ? "https://yourpetstore.com" : "https://cakeconnection.in"}
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>

                {/* Other Platform / Custom Catalog */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                      {isPetCategory ? "Pet Food & Supplies Catalog Link" : "Other Platform / Catalog Link"}
                    </Label>
                    <Input
                      value={otherOrderLabel}
                      onChange={(e) => {
                        const val = e.target.value
                        setOtherOrderLabel(val)
                        syncSimulatorLinks(zomatoUrl, swiggyUrl, otherOrderUrl, val, formData.websiteUrl || "", formData.whatsappNumber || "", googleReviewLink, email, enableFoodDelivery, isPetCategory)
                      }}
                      placeholder={isPetCategory ? "Pet Catalog" : "Label e.g. EasyCater"}
                      className="h-5 w-28 text-[10px] rounded-md px-1.5 py-0 border-slate-300"
                    />
                  </div>
                  <Input
                    value={otherOrderUrl}
                    onChange={(e) => {
                      const val = e.target.value
                      setOtherOrderUrl(val)
                      syncSimulatorLinks(zomatoUrl, swiggyUrl, val, otherOrderLabel, formData.websiteUrl || "", formData.whatsappNumber || "", googleReviewLink, email, enableFoodDelivery, isPetCategory)
                    }}
                    placeholder="https://... (Catalog PDF, Menu, or Google Drive link)"
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Social Media & Direction Channels */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Share2 className="w-4 h-4 text-pink-600" />
                Social Media &amp; Directions Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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

          {/* 7. Save Button Action */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-wider uppercase shadow-xl transition-all cursor-pointer"
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
