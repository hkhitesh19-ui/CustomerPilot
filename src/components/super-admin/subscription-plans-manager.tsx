"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  CreditCard,
  Tag,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Percent,
  RefreshCw,
  Save,
  Globe,
  Loader2,
  Smartphone,
  Zap,
  Check,
  Star
} from "lucide-react"

import { PricingStudio } from "@/components/pricing/pricing-studio"

export function SubscriptionPlansManager() {
  const { toast } = useToast()

  // Plans state
  const [plans, setPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [savingPlans, setSavingPlans] = useState(false)
  const [planCategoryFilter, setPlanCategoryFilter] = useState("ALL")
  const [pricingViewMode, setPricingViewMode] = useState<"studio" | "grid">("studio")

  // Coupons state
  const [coupons, setCoupons] = useState<any[]>([])
  const [loadingCoupons, setLoadingCoupons] = useState(true)
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    discountType: "percent",
    discountValue: 20,
    minOrderAmount: 0,
    maxDiscount: 1000,
    maxUses: 100,
  })
  const [creatingCoupon, setCreatingCoupon] = useState(false)

  // Terms state
  const [termsContent, setTermsContent] = useState("")
  const [loadingTerms, setLoadingTerms] = useState(true)
  const [savingTerms, setSavingTerms] = useState(false)

  // Fetch plans
  const fetchPlans = async () => {
    setLoadingPlans(true)
    try {
      const res = await fetch("/api/pricing/plans")
      const data = await res.json()
      if (data.ok && Array.isArray(data.data?.plans)) {
        setPlans(data.data.plans)
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load plans", variant: "destructive" })
    } finally {
      setLoadingPlans(false)
    }
  }

  // Fetch coupons
  const fetchCoupons = async () => {
    setLoadingCoupons(true)
    try {
      const res = await fetch("/api/coupons")
      const data = await res.json()
      if (data.ok && Array.isArray(data.data?.coupons)) {
        setCoupons(data.data.coupons)
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load coupons", variant: "destructive" })
    } finally {
      setLoadingCoupons(false)
    }
  }

  // Fetch terms
  const fetchTerms = async () => {
    setLoadingTerms(true)
    try {
      const res = await fetch("/api/legal/terms")
      const data = await res.json()
      if (data.ok && data.data?.content) {
        setTermsContent(data.data.content)
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to load terms", variant: "destructive" })
    } finally {
      setLoadingTerms(false)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchCoupons()
    fetchTerms()
  }, [])

  // Save Plans
  const handleSavePlans = async () => {
    setSavingPlans(true)
    try {
      const res = await fetch("/api/pricing/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to update plans")

      toast({ title: "Plans Updated", description: "New pricing is now live on Homepage and Merchant Dashboards." })
    } catch (e: any) {
      toast({ title: "Save Error", description: e.message, variant: "destructive" })
    } finally {
      setSavingPlans(false)
    }
  }

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCoupon.code) return
    setCreatingCoupon(true)
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to create coupon")

      toast({ title: "Coupon Created", description: `Code ${data.data?.coupon?.code} is now active.` })
      setNewCoupon({
        code: "",
        description: "",
        discountType: "percent",
        discountValue: 20,
        minOrderAmount: 0,
        maxDiscount: 1000,
        maxUses: 100,
      })
      fetchCoupons()
    } catch (e: any) {
      toast({ title: "Creation Failed", description: e.message, variant: "destructive" })
    } finally {
      setCreatingCoupon(false)
    }
  }

  // Delete Coupon
  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.ok) {
        toast({ title: "Coupon Deleted" })
        fetchCoupons()
      }
    } catch (e) {
      toast({ title: "Delete Failed", variant: "destructive" })
    }
  }

  // Save Terms
  const handleSaveTerms = async () => {
    setSavingTerms(true)
    try {
      const res = await fetch("/api/legal/terms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: termsContent }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to save terms")

      toast({ title: "Terms & Conditions Saved", description: "Updated legal agreement for all merchants." })
    } catch (e: any) {
      toast({ title: "Save Error", description: e.message, variant: "destructive" })
    } finally {
      setSavingTerms(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            Plans, Pricing, Coupons & Legal Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control dynamic subscription pricing (30/180/365 days), promo coupons, and Merchant Terms of Service in real-time.
          </p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md bg-slate-950 border border-slate-800">
          <TabsTrigger value="pricing" className="flex items-center gap-1.5 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4" /> Pricing Plans ({plans.length})
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-1.5 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Tag className="w-4 h-4" /> Coupons & Offers
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-1.5 text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4" /> Terms & Conditions
          </TabsTrigger>
        </TabsList>

        {/* 1. PRICING PLANS TAB */}
        <TabsContent value="pricing" className="mt-4 space-y-4">
          {/* View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400">View Experience:</span>
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPricingViewMode("studio")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    pricingViewMode === "studio"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pricing Studio v4</span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/20 text-emerald-300 border-none font-bold">Interactive</Badge>
                </button>
                <button
                  type="button"
                  onClick={() => setPricingViewMode("grid")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    pricingViewMode === "grid"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Raw Plans Matrix ({plans.length})</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchPlans}
                disabled={loadingPlans}
                className="text-xs h-8 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingPlans ? "animate-spin" : ""}`} />
                Reload
              </Button>
            </div>
          </div>

          {pricingViewMode === "studio" ? (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <PricingStudio
                mode="superadmin"
                theme="dark"
                showAdminToggle={true}
                initialPlans={plans}
              />
            </div>
          ) : (
            <Card className="bg-slate-900/80 border-slate-800/80 shadow-xl backdrop-blur-xl">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/60">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  Dynamic Master Pricing Plans ({plans.length})
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Edit selling prices, original MRPs, and discount tags across all platforms including Smart Digital Business Cards. Changes update live in real-time.
                </CardDescription>
              </div>
              <Button
                onClick={handleSavePlans}
                disabled={savingPlans}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg self-start sm:self-auto cursor-pointer"
              >
                {savingPlans ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Pricing Changes
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingPlans ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
              ) : (
                <div className="space-y-6">
                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800/60">
                    {[
                      { id: "ALL", label: `All Plans (${plans.length})` },
                      { id: "DIGITAL_CARD", label: `Smart Digital Cards (${plans.filter(p => (p.planKey || '').startsWith('card_') || p.enabledModules === 'DIGITAL_CARD').length})` },
                      { id: "COMPLETE", label: `CustomerPilot Complete (${plans.filter(p => (p.planKey || '').startsWith('growth_') || (p.planKey || '').startsWith('enterprise_')).length})` },
                      { id: "LOYALTY", label: `Loyalty Stamps (${plans.filter(p => (p.planKey || '').startsWith('loyalty_') || p.enabledModules === 'LOYALTY').length})` },
                      { id: "REVIEWS", label: `AI Google Reviews (${plans.filter(p => (p.planKey || '').startsWith('reviews_') || p.enabledModules === 'REVIEWS').length})` },
                      { id: "AUTOREPLY", label: `AI AutoReply (${plans.filter(p => (p.planKey || '').startsWith('autoreply_') || p.enabledModules === 'AUTOREPLY').length})` },
                    ].map(filter => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setPlanCategoryFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          planCategoryFilter === filter.id
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        <span>{filter.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Plans Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {plans
                      .filter(p => {
                        if (planCategoryFilter === "ALL") return true
                        const key = p.planKey || ""
                        if (planCategoryFilter === "DIGITAL_CARD") return key.startsWith("card_") || p.enabledModules === "DIGITAL_CARD"
                        if (planCategoryFilter === "COMPLETE") return key.startsWith("growth_") || key.startsWith("enterprise_")
                        if (planCategoryFilter === "LOYALTY") return key.startsWith("loyalty_") || p.enabledModules === "LOYALTY"
                        if (planCategoryFilter === "REVIEWS") return key.startsWith("reviews_") || p.enabledModules === "REVIEWS"
                        if (planCategoryFilter === "AUTOREPLY") return key.startsWith("autoreply_") || p.enabledModules === "AUTOREPLY"
                        return true
                      })
                      .map((p) => {
                        const realIdx = plans.findIndex(item => (item.id && item.id === p.id) || item.planKey === p.planKey)
                        const isCard = (p.planKey || "").startsWith("card_") || p.enabledModules === "DIGITAL_CARD"

                        return (
                          <div 
                            key={p.id || p.planKey || realIdx} 
                            className={`p-5 rounded-2xl border bg-slate-950 space-y-4 shadow-xl transition-all ${
                              isCard ? "border-cyan-500/40 bg-gradient-to-b from-slate-950 to-cyan-950/20" : "border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                isCard
                                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                  : (p.planKey || "").startsWith("growth_") || (p.planKey || "").startsWith("enterprise_")
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : (p.planKey || "").startsWith("loyalty_")
                                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                      : (p.planKey || "").startsWith("reviews_")
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                        : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              }`}>
                                {isCard ? "Smart Digital Card" : (p.planKey || "").startsWith("growth_") || (p.planKey || "").startsWith("enterprise_") ? "Complete Suite" : (p.planKey || "").startsWith("loyalty_") ? "Loyalty" : (p.planKey || "").startsWith("reviews_") ? "Google Reviews" : "AutoReply"}
                              </span>
                              <Badge variant="outline" className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                                {p.days} Days
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400 font-semibold">Plan Name</Label>
                              <Input
                                value={p.name}
                                onChange={(e) => {
                                  const copy = [...plans]
                                  copy[realIdx].name = e.target.value
                                  setPlans(copy)
                                }}
                                className="h-8 text-xs font-semibold bg-slate-900 border-slate-800 text-white"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400 font-semibold">Selling Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={p.price}
                                  onChange={(e) => {
                                    const copy = [...plans]
                                    copy[realIdx].price = Number(e.target.value)
                                    setPlans(copy)
                                  }}
                                  className="h-8 text-xs font-black text-emerald-400 bg-slate-900 border-slate-800"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400 font-semibold">MRP Price (₹)</Label>
                                <Input
                                  type="number"
                                  value={p.originalPrice || ""}
                                  onChange={(e) => {
                                    const copy = [...plans]
                                    copy[realIdx].originalPrice = Number(e.target.value)
                                    setPlans(copy)
                                  }}
                                  className="h-8 text-xs text-slate-400 line-through bg-slate-900 border-slate-800"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400 font-semibold">Discount %</Label>
                                <Input
                                  type="number"
                                  value={p.discountPercent || 0}
                                  onChange={(e) => {
                                    const copy = [...plans]
                                    copy[realIdx].discountPercent = Number(e.target.value)
                                    setPlans(copy)
                                  }}
                                  className="h-8 text-xs font-semibold text-amber-400 bg-slate-900 border-slate-800"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-slate-400 font-semibold">Badge Tag</Label>
                                <Input
                                  value={p.badge || ""}
                                  onChange={(e) => {
                                    const copy = [...plans]
                                    copy[realIdx].badge = e.target.value
                                    setPlans(copy)
                                  }}
                                  placeholder="e.g. ⭐ Most Popular"
                                  className="h-8 text-xs bg-slate-900 border-slate-800 text-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-slate-400 font-semibold">Description</Label>
                              <Input
                                value={p.description || ""}
                                onChange={(e) => {
                                  const copy = [...plans]
                                  copy[realIdx].description = e.target.value
                                  setPlans(copy)
                                }}
                                className="h-8 text-xs bg-slate-900 border-slate-800 text-slate-300"
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* 2. COUPONS TAB */}
        <TabsContent value="coupons" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Create Coupon Form */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" /> Create New Coupon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCoupon} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Coupon Code (Uppercase)</Label>
                    <Input
                      placeholder="e.g. DIWALI50"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      required
                      className="h-8 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Discount Value</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newCoupon.discountValue}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <select
                        value={newCoupon.discountType}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                        className="w-full h-8 text-xs border rounded-md px-2 bg-white"
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Flat Amount (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Max Discount (₹)</Label>
                      <Input
                        type="number"
                        value={newCoupon.maxDiscount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max Usage Limit</Label>
                      <Input
                        type="number"
                        value={newCoupon.maxUses}
                        onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      placeholder="e.g. Festival 50% discount"
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={creatingCoupon || !newCoupon.code}
                    className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  >
                    {creatingCoupon ? "Creating..." : "Add Coupon Code"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Active Coupons List */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Active & Promotional Coupons</span>
                  <Badge variant="outline" className="text-xs">{coupons.length} Active</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCoupons ? (
                  <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-stone-400" /></div>
                ) : coupons.length === 0 ? (
                  <p className="text-xs text-stone-500 text-center py-6">No coupons created yet.</p>
                ) : (
                  <div className="space-y-2">
                    {coupons.map((c) => (
                      <div key={c.id} className="p-3 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-white border border-stone-200 text-emerald-600 font-mono font-bold text-xs">
                            {c.code}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-stone-900">
                              {c.discountType === "percent" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                              {c.maxDiscount ? ` (Up to ₹${c.maxDiscount})` : ""}
                            </p>
                            <p className="text-[11px] text-stone-500">{c.description || "Promo code"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-[11px] text-stone-500">
                            Used: <strong className="text-stone-900">{c.timesUsed}</strong>/{c.maxUses || "∞"}
                          </span>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. TERMS & CONDITIONS TAB */}
        <TabsContent value="legal" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Merchant Terms of Service Document</CardTitle>
                <CardDescription className="text-xs">
                  This Markdown agreement is shown during merchant onboarding, subscription checkout, and at /terms.
                </CardDescription>
              </div>
              <Button
                onClick={handleSaveTerms}
                disabled={savingTerms}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs"
              >
                {savingTerms ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Terms & Conditions
              </Button>
            </CardHeader>
            <CardContent>
              {loadingTerms ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
              ) : (
                <Textarea
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  rows={20}
                  className="font-mono text-xs leading-relaxed"
                  placeholder="Enter Markdown Terms & Conditions..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
