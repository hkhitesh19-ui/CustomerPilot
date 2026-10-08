"use client"

import { useState, useEffect } from "react"
import {
  Smartphone,
  Store,
  Star,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Globe,
  Phone,
  Clock,
  MapPin,
  Sparkles,
  Search,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  PlusCircle,
  Eye,
  Instagram,
  Facebook,
  Youtube,
  Share2
} from "lucide-react"
import { OfficialWhatsAppIcon } from "@/components/icons/official-whatsapp-icon"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface MerchantOption {
  id: string
  name: string
  category?: string
  whatsappPhone?: string
  city?: string
}

interface DigitalCardItem {
  id: string
  merchantId: string
  slug: string
  displayName: string
  subCategories?: string
  logoUrl?: string
  locationShort?: string
  locationState?: string
  businessHours?: string
  deliveryInfo?: string
  phoneNumber?: string
  whatsappNumber?: string
  instagramUrl?: string
  facebookUrl?: string
  youtubeUrl?: string
  websiteUrl?: string
  googleMapsUrl?: string
  orderingLinks?: string
  googleRating?: number
  googleReviewsCnt?: number
  viewsCount: number
  contactSaves: number
  theme?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  merchant?: {
    id: string
    name: string
    category?: string
    whatsappPhone?: string
  }
}

export function SuperAdminDigitalCardsManager() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"generator" | "fleet">("generator")

  // Fleet state
  const [cards, setCards] = useState<DigitalCardItem[]>([])
  const [merchants, setMerchants] = useState<MerchantOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Generator form state
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>("new")
  const [merchantSearchFilter, setMerchantSearchFilter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<{
    slug: string
    displayName: string
    liveUrl: string
  } | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Form Fields
  const [formData, setFormData] = useState({
    displayName: "",
    slug: "",
    subCategories: "Cafe & Restaurant",
    logoUrl: "",
    locationShort: "Alkapuri, Vadodara",
    locationState: "Gujarat, India",
    businessHours: "Open Daily: 9:00 AM – 10:00 PM",
    deliveryInfo: "Delivery Available",
    phoneNumber: "+91 90333 04707",
    whatsappNumber: "919033304707",
    googleReviewLink: "",
    googleRating: 4.8,
    googleReviewsCnt: 350,
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    websiteUrl: "",
    whatsappOrderUrl: "",
    zomatoUrl: "",
    swiggyUrl: "",
    easycaterUrl: "",
    orderingLinksJson: "",
    statusMode: "TRIAL", // "TRIAL" | "ACTIVE" | "LIFETIME"
    trialDays: 3,
    isActive: true,
  })

  // Fetch Fleet Data
  const fetchFleetData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/digital-cards")
      const data = await res.json()
      if (data.success) {
        setCards(data.cards || [])
        setMerchants(data.merchants || [])
      } else {
        toast({ title: "Error", description: data.error || "Failed to load digital cards fleet", variant: "destructive" })
      }
    } catch (e: any) {
      toast({ title: "Fetch Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFleetData()
  }, [])

  // Handle selecting an existing merchant
  const handleSelectMerchant = (merchantId: string) => {
    setSelectedMerchantId(merchantId)
    if (merchantId === "new") {
      setFormData({
        displayName: "",
        slug: "",
        subCategories: "Retail Store",
        logoUrl: "",
        locationShort: "Vadodara",
        locationState: "Gujarat, India",
        businessHours: "Open Daily: 9:00 AM – 10:00 PM",
        deliveryInfo: "Delivery Available",
        phoneNumber: "+91 90333 04707",
        whatsappNumber: "919033304707",
        googleReviewLink: "",
        googleRating: 4.8,
        googleReviewsCnt: 350,
        instagramUrl: "",
        facebookUrl: "",
        youtubeUrl: "",
        websiteUrl: "",
        whatsappOrderUrl: "",
        zomatoUrl: "",
        swiggyUrl: "",
        easycaterUrl: "",
        orderingLinksJson: "",
        statusMode: "TRIAL",
        trialDays: 3,
        isActive: true,
      })
      return
    }

    const m = merchants.find(item => item.id === merchantId)
    const existingCard = cards.find(item => item.merchantId === merchantId)

    if (existingCard) {
      // Parse ordering links
      let zomato = ""
      let swiggy = ""
      let website = existingCard.websiteUrl || ""
      let whatsappOrder = ""
      let easycater = ""
      try {
        const orderLinks = JSON.parse(existingCard.orderingLinks || "[]")
        if (Array.isArray(orderLinks)) {
          zomato = orderLinks.find((l: any) => (l.platform || "").toLowerCase() === "zomato")?.url || ""
          swiggy = orderLinks.find((l: any) => (l.platform || "").toLowerCase() === "swiggy")?.url || ""
          website = orderLinks.find((l: any) => (l.platform || "").toLowerCase() === "website" || (l.platform || "").toLowerCase() === "store")?.url || website
          whatsappOrder = orderLinks.find((l: any) => (l.platform || "").toLowerCase() === "whatsapp")?.url || ""
          easycater = orderLinks.find((l: any) => (l.platform || "").toLowerCase() === "easycater" || (l.platform || "").toLowerCase() === "catalog")?.url || ""
        }
      } catch {}

      if (!whatsappOrder && existingCard.whatsappNumber) {
        const cleanW = existingCard.whatsappNumber.replace(/[^0-9]/g, "")
        whatsappOrder = `https://wa.me/${cleanW}?text=Hi%20${encodeURIComponent(existingCard.displayName)}%2C%20I%20want%20to%20place%20an%20order`
      }

      // Parse theme
      let statusMode = "TRIAL"
      let reviewLink = ""
      try {
        const themeObj = JSON.parse(existingCard.theme || "{}")
        statusMode = themeObj.statusMode || (themeObj.isTrial ? "TRIAL" : "ACTIVE")
        reviewLink = themeObj.googleReviewLink || existingCard.googleMapsUrl || ""
      } catch {}

      setFormData({
        displayName: existingCard.displayName,
        slug: existingCard.slug,
        subCategories: existingCard.subCategories || "Retail Store",
        logoUrl: existingCard.logoUrl || "",
        locationShort: existingCard.locationShort || "Vadodara",
        locationState: existingCard.locationState || "Gujarat, India",
        businessHours: existingCard.businessHours || "Open Daily: 9:00 AM – 10:00 PM",
        deliveryInfo: existingCard.deliveryInfo || "Delivery Available",
        phoneNumber: existingCard.phoneNumber || m?.whatsappPhone || "+91 90333 04707",
        whatsappNumber: existingCard.whatsappNumber || m?.whatsappPhone || "919033304707",
        googleReviewLink: reviewLink,
        googleRating: existingCard.googleRating || 4.8,
        googleReviewsCnt: existingCard.googleReviewsCnt || 350,
        instagramUrl: existingCard.instagramUrl || "",
        facebookUrl: existingCard.facebookUrl || "",
        youtubeUrl: existingCard.youtubeUrl || "",
        websiteUrl: website,
        whatsappOrderUrl: whatsappOrder,
        zomatoUrl: zomato,
        swiggyUrl: swiggy,
        easycaterUrl: easycater,
        orderingLinksJson: existingCard.orderingLinks || "",
        statusMode,
        trialDays: 3,
        isActive: existingCard.isActive !== false,
      })

      toast({
        title: "Existing Card Loaded",
        description: `Loaded existing digital card for ${existingCard.displayName} (/c/${existingCard.slug}).`
      })
    } else if (m) {
      setFormData({
        displayName: m.name,
        slug: m.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-"),
        subCategories: m.category || "Retail Store",
        logoUrl: "",
        locationShort: m.city || "Vadodara",
        locationState: "Gujarat, India",
        businessHours: "Open Daily: 9:00 AM – 10:00 PM",
        deliveryInfo: "Delivery Available",
        phoneNumber: m.whatsappPhone ? (m.whatsappPhone.startsWith("+") ? m.whatsappPhone : `+91 ${m.whatsappPhone}`) : "+91 90333 04707",
        whatsappNumber: m.whatsappPhone || "919033304707",
        googleReviewLink: "",
        googleRating: 4.8,
        googleReviewsCnt: 350,
        instagramUrl: "",
        facebookUrl: "",
        youtubeUrl: "",
        websiteUrl: "",
        whatsappOrderUrl: "",
        zomatoUrl: "",
        swiggyUrl: "",
        easycaterUrl: "",
        orderingLinksJson: "",
        statusMode: "TRIAL",
        trialDays: 3,
        isActive: true,
      })
    }
  }

  // Handle Form Submission
  const handleSubmitCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.displayName) {
      toast({ title: "Validation Error", description: "Business Name is required", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        merchantId: selectedMerchantId === "new" ? "new" : selectedMerchantId
      }

      const res = await fetch("/api/admin/digital-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate digital card")
      }

      setGeneratedResult({
        slug: data.slug,
        displayName: data.card.displayName,
        liveUrl: data.liveUrl || `${window.location.origin}/c/${data.slug}`,
      })

      toast({
        title: "Card Successfully Generated!",
        description: `Live at /c/${data.slug} on behalf of ${data.card.displayName}`
      })

      fetchFleetData()
    } catch (e: any) {
      toast({ title: "Generation Error", description: e.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Card
  const handleDeleteCard = async (id: string, displayName: string) => {
    if (!confirm(`Are you sure you want to delete the digital business card for "${displayName}"?`)) return

    try {
      const res = await fetch(`/api/admin/digital-cards?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Card Deleted", description: `Card for ${displayName} was deleted.` })
        fetchFleetData()
      } else {
        throw new Error(data.error || "Failed to delete card")
      }
    } catch (e: any) {
      toast({ title: "Delete Error", description: e.message, variant: "destructive" })
    }
  }

  const handleCopyLink = () => {
    if (!generatedResult) return
    navigator.clipboard.writeText(generatedResult.liveUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
    toast({ title: "Link Copied!", description: generatedResult.liveUrl })
  }

  const filteredMerchants = merchants.filter(m =>
    m.name.toLowerCase().includes(merchantSearchFilter.toLowerCase()) ||
    (m.whatsappPhone && m.whatsappPhone.includes(merchantSearchFilter)) ||
    (m.city && m.city.toLowerCase().includes(merchantSearchFilter.toLowerCase()))
  )

  const filteredCards = cards.filter(c =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.merchant?.name && c.merchant.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Smart Digital Business Cards Manager
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px] font-black uppercase">
                  SuperAdmin V6.5
                </Badge>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate and edit high-conversion digital business cards on behalf of merchants with custom Google Review links, social media, ordering channels, and subscription statuses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFleetData}
            disabled={loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Fleet
          </Button>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("generator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "generator"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Generator on Behalf
            </button>
            <button
              onClick={() => setActiveTab("fleet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "fleet"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Fleet Directory ({cards.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400">Total Cards Active</span>
            <div className="text-2xl font-black text-white mt-1">{cards.length}</div>
            <span className="text-[10px] text-cyan-400 font-bold">100% Hosted on Cloud</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400">Active Subscribed / Lifetime</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {cards.filter(c => {
                try {
                  const t = JSON.parse(c.theme || "{}")
                  return !t.isTrial
                } catch { return true }
              }).length}
            </div>
            <span className="text-[10px] text-emerald-500 font-bold">Revenue Generating</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400">3-Day Free Trial Cards</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {cards.filter(c => {
                try {
                  const t = JSON.parse(c.theme || "{}")
                  return t.isTrial
                } catch { return false }
              }).length}
            </div>
            <span className="text-[10px] text-amber-500 font-bold">In Trial Period</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-lg">
          <CardContent className="p-4">
            <span className="text-[11px] font-semibold text-slate-400">Total Views &amp; Saves</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {cards.reduce((acc, c) => acc + (c.viewsCount || 0) + (c.contactSaves || 0), 0)}
            </div>
            <span className="text-[10px] text-indigo-400 font-bold">Customer Engagements</span>
          </CardContent>
        </Card>
      </div>

      {activeTab === "generator" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Generator Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-slate-900/80 border-slate-800/80 shadow-xl backdrop-blur-xl">
              <CardHeader className="border-b border-slate-800/60 pb-4">
                <CardTitle className="text-base font-bold text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Fill Details on Behalf of Merchant
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold border-cyan-500/30 text-cyan-300">
                    Instant Live Deployment
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Select an existing merchant from the fleet to update their card, or generate a fresh standalone card directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmitCard} className="space-y-6">
                  {/* Step 0: Merchant Selector Mode */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-white flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-indigo-400" />
                        Target Merchant Account
                      </Label>
                      <button
                        type="button"
                        onClick={() => handleSelectMerchant("new")}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                          selectedMerchantId === "new"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        + Create Fresh Merchant
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                        <Input
                          placeholder="Filter existing merchants by name, phone or city..."
                          value={merchantSearchFilter}
                          onChange={(e) => setMerchantSearchFilter(e.target.value)}
                          className="pl-9 h-9 text-xs bg-slate-900 border-slate-800 text-white"
                        />
                      </div>

                      <select
                        value={selectedMerchantId}
                        onChange={(e) => handleSelectMerchant(e.target.value)}
                        className="w-full h-10 rounded-xl bg-slate-900 border border-slate-800 px-3 text-xs font-semibold text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="new">⚡ [Fresh Merchant / Direct Card Generation]</option>
                        {filteredMerchants.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.category || "Store"}) {m.city ? `• ${m.city}` : ""} {m.whatsappPhone ? `• ${m.whatsappPhone}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Section 1: Business Identity & Review Link */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      1. Business Identity &amp; Google Review Short Link
                    </h3>

                    {/* Google Review Short Link Highlighted */}
                    <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/30">
                      <Label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                        <span>⭐ Google Review Short Link (Auto 5-Star Reviews Modal)</span>
                        <span className="text-[10px] text-amber-400 font-semibold">Recommended for Instant Reviews</span>
                      </Label>
                      <Input
                        placeholder="e.g. https://g.page/r/CbXxY.../review or maps.app.goo.gl/..."
                        value={formData.googleReviewLink}
                        onChange={(e) => setFormData({ ...formData, googleReviewLink: e.target.value })}
                        className="h-9 text-xs bg-slate-950 border-amber-500/40 text-amber-200 font-medium"
                      />
                      <p className="text-[11px] text-slate-400">
                        When visitors click &quot;Google Reviews&quot; on the card, this link opens the direct 5-star review submission modal.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">
                          Store / Business Display Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          required
                          placeholder="e.g. Sharma Sweets & Cafe"
                          value={formData.displayName}
                          onChange={(e) => {
                            const name = e.target.value
                            setFormData({
                              ...formData,
                              displayName: name,
                              slug: selectedMerchantId === "new" && !formData.slug ? name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") : formData.slug
                            })
                          }}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">
                          Live URL Slug (/c/...)
                        </Label>
                        <div className="flex items-center">
                          <span className="px-2.5 h-9 bg-slate-900 border border-r-0 border-slate-800 rounded-l-xl text-slate-400 text-xs flex items-center font-mono">
                            /c/
                          </span>
                          <Input
                            placeholder="sharma-sweets"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                            className="h-9 text-xs rounded-l-none bg-slate-950 border-slate-800 text-cyan-300 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Category Tagline</Label>
                        <Input
                          placeholder="e.g. Cafe • Bakery • Pure Veg"
                          value={formData.subCategories}
                          onChange={(e) => setFormData({ ...formData, subCategories: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Google Star Rating</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={formData.googleRating}
                          onChange={(e) => setFormData({ ...formData, googleRating: parseFloat(e.target.value) || 4.8 })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-amber-400 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Google Reviews Count</Label>
                        <Input
                          type="number"
                          value={formData.googleReviewsCnt}
                          onChange={(e) => setFormData({ ...formData, googleReviewsCnt: parseInt(e.target.value, 10) || 350 })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Contact, Location & Store Hours */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      2. Contact &amp; 3-Pill Status Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Calling Phone Number</Label>
                        <Input
                          placeholder="+91 90333 04707"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">WhatsApp Number</Label>
                        <Input
                          placeholder="919033304707 (with country code)"
                          value={formData.whatsappNumber}
                          onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Area &amp; City (Pill 1)</Label>
                        <Input
                          placeholder="Alkapuri, Vadodara"
                          value={formData.locationShort}
                          onChange={(e) => setFormData({ ...formData, locationShort: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Business Hours (Pill 2)</Label>
                        <Input
                          placeholder="Open Daily 9:00 AM – 10:00 PM"
                          value={formData.businessHours}
                          onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Delivery Info (Pill 3)</Label>
                        <Input
                          placeholder="Vadodara Only"
                          value={formData.deliveryInfo}
                          onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Logo Image URL</Label>
                      <Input
                        placeholder="/uploads/... or https://..."
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        className="h-9 text-xs bg-slate-950 border-slate-800 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Section 3: Social & Ordering Links */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      3. Social Media &amp; Online Ordering Channels
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram Username/URL
                        </Label>
                        <Input
                          placeholder="https://instagram.com/mybrand"
                          value={formData.instagramUrl}
                          onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Facebook className="w-3.5 h-3.5 text-blue-400" /> Facebook Page URL
                        </Label>
                        <Input
                          placeholder="https://facebook.com/mybrand"
                          value={formData.facebookUrl}
                          onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Youtube className="w-3.5 h-3.5 text-red-400" /> YouTube Channel URL
                        </Label>
                        <Input
                          placeholder="https://youtube.com/@mybrand"
                          value={formData.youtubeUrl}
                          onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                          className="h-9 text-xs bg-slate-950 border-slate-800 text-white"
                        />
                      </div>
                    </div>

                    {/* 5 Online Ordering Channels Grid */}
                    <div className="pt-2">
                      <Label className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider block mb-2">
                        Online Ordering &amp; Store Channels (All 5 Live Slots)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {/* Channel 1: Website */}
                        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">🌐</span>
                            1. Website / Store URL
                          </Label>
                          <Input
                            placeholder="https://mybrand.com"
                            value={formData.websiteUrl}
                            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                            className="h-8 text-xs bg-slate-950 border-slate-800 text-white"
                          />
                        </div>

                        {/* Channel 2: WhatsApp Order */}
                        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px]">💬</span>
                            2. WhatsApp Order Link
                          </Label>
                          <Input
                            placeholder="https://wa.me/91... (Auto-generated if empty)"
                            value={formData.whatsappOrderUrl}
                            onChange={(e) => setFormData({ ...formData, whatsappOrderUrl: e.target.value })}
                            className="h-8 text-xs bg-slate-950 border-slate-800 text-white"
                          />
                        </div>

                        {/* Channel 3: Zomato */}
                        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#ef4444] text-white flex items-center justify-center text-[10px] font-black italic">z</span>
                            3. Zomato Restaurant Link
                          </Label>
                          <Input
                            placeholder="https://zomato.com/..."
                            value={formData.zomatoUrl}
                            onChange={(e) => setFormData({ ...formData, zomatoUrl: e.target.value })}
                            className="h-8 text-xs bg-slate-950 border-slate-800 text-white"
                          />
                        </div>

                        {/* Channel 4: Swiggy */}
                        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#f97316] text-white flex items-center justify-center text-[10px] font-black">S</span>
                            4. Swiggy Restaurant Link
                          </Label>
                          <Input
                            placeholder="https://swiggy.com/..."
                            value={formData.swiggyUrl}
                            onChange={(e) => setFormData({ ...formData, swiggyUrl: e.target.value })}
                            className="h-8 text-xs bg-slate-950 border-slate-800 text-white"
                          />
                        </div>

                        {/* Channel 5: EasyCater / Custom Ordering */}
                        <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                          <Label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[9px] font-black">EC</span>
                            5. EasyCater / Custom Link
                          </Label>
                          <Input
                            placeholder="https://easycater.com/... or custom"
                            value={formData.easycaterUrl}
                            onChange={(e) => setFormData({ ...formData, easycaterUrl: e.target.value })}
                            className="h-8 text-xs bg-slate-950 border-slate-800 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Subscription & Status Gate */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      4. Subscription Plan &amp; Paywall Status
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-300">Access Mode</Label>
                        <select
                          value={formData.statusMode}
                          onChange={(e) => setFormData({ ...formData, statusMode: e.target.value })}
                          className="w-full h-9 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs font-semibold text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="TRIAL">⏳ 3-Day Free Trial (Active)</option>
                          <option value="ACTIVE">✅ Active Pro / Subscribed (1 Year)</option>
                          <option value="LIFETIME">👑 Lifetime Deal Access (Permanent)</option>
                        </select>
                      </div>

                      {formData.statusMode === "TRIAL" && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Trial Length (Days)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={formData.trialDays}
                            onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value, 10) || 3 })}
                            className="h-9 text-xs bg-slate-950 border-slate-800 text-amber-400 font-bold"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5 flex flex-col justify-end">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <Label htmlFor="active-card-toggle" className="text-xs font-semibold text-slate-300 cursor-pointer">
                            Card Active (Live)
                          </Label>
                          <Switch
                            id="active-card-toggle"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Generating Digital Card on Behalf...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white mr-2" />
                        Generate / Save Digital Card on Behalf
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Output & Test Actions (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {generatedResult ? (
              <Card className="bg-slate-900/90 border-2 border-emerald-500/80 shadow-2xl backdrop-blur-xl">
                <CardHeader className="border-b border-slate-800 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Live Card Generated!
                    </CardTitle>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-black uppercase">
                      Live on Cloud
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    {generatedResult.displayName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      Direct Live Card URL:
                    </span>
                    <a
                      href={generatedResult.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-bold text-cyan-400 hover:underline break-all block"
                    >
                      {generatedResult.liveUrl}
                    </a>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="p-2 bg-white rounded-xl shadow-md border-2 border-amber-300">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedResult.liveUrl)}`}
                        alt="Digital Card QR Code"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Scan with phone to test card</span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      asChild
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md"
                    >
                      <a href={generatedResult.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Open Live Card in New Tab
                      </a>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopyLink}
                      className="w-full border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-bold"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Live URL
                        </>
                      )}
                    </Button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Check out your live Smart Digital Business Card: ${generatedResult.liveUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <OfficialWhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                      Send Link to Merchant WhatsApp
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/60 border-slate-800/80 shadow-lg backdrop-blur-xl">
                <CardHeader className="pb-3 border-b border-slate-800/60">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Live Output Preview Box
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-2xl text-slate-600">
                    📱
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">No Active Generation Yet</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Fill out the form on the left and click &quot;Generate / Save Digital Card on Behalf&quot; to inspect the live URL and QR code here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Presets / Tips */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-lg backdrop-blur-xl">
              <CardHeader className="pb-2 border-b border-slate-800/60">
                <CardTitle className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  💡 SuperAdmin On-Behalf Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2 text-[11px] text-slate-400 leading-relaxed">
                <p>
                  • <strong>Google Short Link:</strong> Found under the merchant&apos;s Google Search dashboard ➔ &quot;Ask for reviews&quot; ➔ &quot;Copy link&quot;.
                </p>
                <p>
                  • <strong>Trial Expiry:</strong> 3-Day Free Trial automatically sets 72h countdown banner and prompts subscription upon expiration.
                </p>
                <p>
                  • <strong>Active Pro / Lifetime:</strong> Bypasses paywall entirely with permanent live status.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Fleet Directory Tab */
        <Card className="bg-slate-900/80 border-slate-800/80 shadow-xl backdrop-blur-xl">
          <CardHeader className="border-b border-slate-800/60 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-cyan-400" />
                Smart Digital Cards Fleet Directory ({cards.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                All digital business cards generated across CustomerPilot merchants.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <Input
                placeholder="Search by store or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-4 p-0 sm:p-6">
            {loading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : filteredCards.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No matching digital business cards found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Store Name &amp; Category</th>
                      <th className="p-3">Live URL Slug</th>
                      <th className="p-3">Phone / WhatsApp</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Views / Saves</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCards.map((c) => {
                      let isTrial = false
                      let statusMode = "ACTIVE"
                      try {
                        const t = JSON.parse(c.theme || "{}")
                        isTrial = Boolean(t.isTrial)
                        statusMode = t.statusMode || (isTrial ? "TRIAL" : "ACTIVE")
                      } catch {}

                      return (
                        <tr key={c.id} className="hover:bg-slate-800/40 transition">
                          <td className="p-3 font-semibold text-white">
                            <div className="font-bold text-white text-xs">{c.displayName}</div>
                            <div className="text-[10px] text-slate-400">{c.subCategories || "Retail Store"}</div>
                          </td>
                          <td className="p-3">
                            <a
                              href={`/c/${c.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>/c/{c.slug}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </td>
                          <td className="p-3 font-mono text-slate-300">
                            <div>{c.phoneNumber || "—"}</div>
                            {c.whatsappNumber && <div className="text-[10px] text-emerald-400">WA: {c.whatsappNumber}</div>}
                          </td>
                          <td className="p-3 text-center">
                            {statusMode === "LIFETIME" ? (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[9px] font-black uppercase">
                                👑 Lifetime
                              </Badge>
                            ) : isTrial ? (
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px] font-black uppercase">
                                ⏳ 3-Day Trial
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-black uppercase">
                                ✅ Subscribed
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className="text-white font-bold">{c.viewsCount || 0}</span>
                            <span className="text-slate-500"> / </span>
                            <span className="text-cyan-400 font-bold">{c.contactSaves || 0}</span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                              >
                                <a href={`/c/${c.slug}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3 mr-1 text-cyan-400" />
                                  Open
                                </a>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleSelectMerchant(c.merchantId)
                                  setActiveTab("generator")
                                }}
                                className="h-7 text-[11px] border-slate-700 bg-slate-900 text-indigo-300 hover:text-white"
                              >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCard(c.id, c.displayName)}
                                className="h-7 text-[11px] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
