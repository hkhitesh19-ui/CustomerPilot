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
  Loader2
} from "lucide-react"

export function SubscriptionPlansManager() {
  const { toast } = useToast()

  // Plans state
  const [plans, setPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [savingPlans, setSavingPlans] = useState(false)

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
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Plans, Pricing, Coupons & Legal Settings
          </h2>
          <p className="text-sm text-stone-500">
            Control dynamic subscription pricing (30/180/365 days), promo coupons, and Merchant Terms of Service in real-time.
          </p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md bg-stone-200">
          <TabsTrigger value="pricing" className="flex items-center gap-1.5 text-xs font-semibold">
            <CreditCard className="w-4 h-4" /> Pricing Plans (3)
          </TabsTrigger>
          <TabsTrigger value="coupons" className="flex items-center gap-1.5 text-xs font-semibold">
            <Tag className="w-4 h-4" /> Coupons & Offers
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-1.5 text-xs font-semibold">
            <FileText className="w-4 h-4" /> Terms & Conditions
          </TabsTrigger>
        </TabsList>

        {/* 1. PRICING PLANS TAB */}
        <TabsContent value="pricing" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Dynamic Subscription Plans</CardTitle>
                <CardDescription className="text-xs">
                  Changes made here update instantly across Homepage Pricing and Merchant Checkout.
                </CardDescription>
              </div>
              <Button
                onClick={handleSavePlans}
                disabled={savingPlans}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 text-xs"
              >
                {savingPlans ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save All Pricing Changes
              </Button>
            </CardHeader>
            <CardContent>
              {loadingPlans ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {plans.map((p, idx) => (
                    <div key={p.id || idx} className="p-4 rounded-xl border border-stone-200 bg-white space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-stone-900">{p.name}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">{p.days} Days</Badge>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-stone-600">Plan Title</Label>
                        <Input
                          value={p.name}
                          onChange={(e) => {
                            const copy = [...plans]
                            copy[idx].name = e.target.value
                            setPlans(copy)
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-stone-600">Selling Price (₹)</Label>
                          <Input
                            type="number"
                            value={p.price}
                            onChange={(e) => {
                              const copy = [...plans]
                              copy[idx].price = Number(e.target.value)
                              setPlans(copy)
                            }}
                            className="h-8 text-xs font-bold text-emerald-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-stone-600">Original Price (₹)</Label>
                          <Input
                            type="number"
                            value={p.originalPrice || ""}
                            onChange={(e) => {
                              const copy = [...plans]
                              copy[idx].originalPrice = Number(e.target.value)
                              setPlans(copy)
                            }}
                            className="h-8 text-xs text-stone-500 line-through"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-stone-600">Discount %</Label>
                          <Input
                            type="number"
                            value={p.discountPercent || 0}
                            onChange={(e) => {
                              const copy = [...plans]
                              copy[idx].discountPercent = Number(e.target.value)
                              setPlans(copy)
                            }}
                            className="h-8 text-xs font-semibold text-amber-600"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-stone-600">Badge Tag</Label>
                          <Input
                            value={p.badge || ""}
                            onChange={(e) => {
                              const copy = [...plans]
                              copy[idx].badge = e.target.value
                              setPlans(copy)
                            }}
                            placeholder="e.g. Best Value"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-stone-600">Description</Label>
                        <Input
                          value={p.description || ""}
                          onChange={(e) => {
                            const copy = [...plans]
                            copy[idx].description = e.target.value
                            setPlans(copy)
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
