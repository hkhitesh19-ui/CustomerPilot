"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Gift, Sparkles, RefreshCw, Award, Image as ImageIcon } from "lucide-react"

import { useDashboardState } from "@/hooks/use-dashboard-state"

export function RewardSetupCard({ merchantId }: { merchantId: string }) {
  const { refetch } = useDashboardState()

  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDefault, setIsDefault] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const defaultForm = {
    id: "",
    name: "Loyalty Stamp Card",
    stampsRequired: 10,
    rewardName: "FREE 500gm Cake",
    stampValue: 500,
    validityDays: 90,
    googleReviewBonus: 1,
    photoBonus: 1,
    vipUpgradeBonusStamps: 1,
    color: "#6366f1",
    tierRewardsEnabled: false,
    excludedCategories: "",
    rewardImageUrl: ""
  }

  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    let cancelled = false

    async function loadSetup() {
      try {
        setLoading(true)
        setLoadError(null)

        const res = await fetch("/api/cards/setup", {
          cache: "no-store",
        })

        const json = await res.json().catch(() => null)

        if (!res.ok) {
          throw new Error(json?.error ?? `Setup request failed: ${res.status}`)
        }

        if (!json?.data?.card) {
          throw new Error("No active reward card was returned")
        }

        if (!cancelled) {
          const cardData = json.data.card
          setForm({
            id: cardData.id || "",
            name: cardData.name || "Loyalty Stamp Card",
            stampsRequired: cardData.stampsRequired ?? 10,
            rewardName: cardData.rewardName || "FREE 500gm Cake",
            stampValue: cardData.stampValue ?? 500,
            validityDays: cardData.validityDays ?? 90,
            googleReviewBonus: cardData.googleReviewBonus ?? 1,
            photoBonus: cardData.photoBonus ?? 1,
            vipUpgradeBonusStamps: cardData.vipUpgradeBonusStamps ?? 1,
            color: cardData.color || "#6366f1",
            tierRewardsEnabled: Boolean(cardData.tierRewardsEnabled),
            excludedCategories: cardData.excludedCategories || "",
            rewardImageUrl: cardData.rewardImageUrl || ""
          })
          setIsDefault(Boolean(json.data.isDefault))
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load setup"
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSetup()

    return () => {
      cancelled = true
    }
  }, []) // runs once on mount

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // No x-merchant-id header — server reads from JWT cookie
      const res = await fetch("/api/cards/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Failed to save configuration")

      toast({ title: "Saved Successfully", description: "Reward Card rules updated." })
      setIsDefault(false)
      if (json.data?.card?.id) setForm(prev => ({ ...prev, id: json.data.card.id }))
      if (refetch) refetch()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-sm">Loading reward setup...</p>
        </CardContent>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card className="border-border border-red-500/20 bg-red-500/5">
        <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-red-500">
          <p className="text-sm font-medium">Failed to load configuration</p>
          <p className="text-xs opacity-80">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-500" />
              Reward Card Setup
            </CardTitle>
            <CardDescription>
              Configure your merchant loyalty rules, stamp requirements, and bonus stamp triggers.
            </CardDescription>
          </div>
          {isDefault && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Defaults Loaded
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-name">Card Title</Label>
              <Input
                id="card-name"
                value={form.name ?? ""}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. VIP Club Card"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-name">Reward Description</Label>
              <Input
                id="reward-name"
                value={form.rewardName ?? ""}
                onChange={e => setForm({ ...form, rewardName: e.target.value })}
                placeholder="e.g. FREE 500gm Cake"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stamp-val">Eligible Minimum Purchase Amount for Loyalty stamp</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                <Input
                  id="stamp-val"
                  type="number"
                  className="pl-7"
                  value={form.stampValue ?? 500}
                  onChange={e => setForm({ ...form, stampValue: Number(e.target.value) })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Every ₹{form.stampValue || 500} spent = 1 Stamp</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stamps-req">Stamp Goal (Stamps for Reward)</Label>
              <Input
                id="stamps-req"
                type="number"
                value={form.stampsRequired ?? 10}
                onChange={e => setForm({ ...form, stampsRequired: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">{form.stampsRequired || 10} Stamps needed for 1 {form.rewardName || 'Reward'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity">Maximum Time Duration to earn Loyalty Reward</Label>
              <Input
                id="validity"
                type="number"
                value={form.validityDays ?? 90}
                onChange={e => setForm({ ...form, validityDays: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-color">Card Theme Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="theme-color"
                  value={form.color ?? "#6366f1"}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input
                  value={form.color ?? "#6366f1"}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-bonus">Google Review Bonus Stamps</Label>
              <Input
                id="google-bonus"
                type="number"
                value={form.googleReviewBonus ?? 0}
                onChange={e => setForm({ ...form, googleReviewBonus: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Bonus stamps awarded when a customer posts a 5-star Google review</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-bonus">Photo Review Bonus Stamps</Label>
              <Input
                id="photo-bonus"
                type="number"
                value={form.photoBonus ?? 0}
                onChange={e => setForm({ ...form, photoBonus: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Extra bonus stamps if they attach a photo with their review</p>
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2 p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <Label htmlFor="vip-upgrade-bonus" className="font-semibold text-slate-200">
                    VIP Tier Upgrade Bonus Stamp Rule
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${(form.vipUpgradeBonusStamps ?? 0) > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                    {(form.vipUpgradeBonusStamps ?? 0) > 0 ? `ACTIVE (+${form.vipUpgradeBonusStamps ?? 0} Stamp)` : "DEACTIVATED (0 Stamps)"}
                  </span>
                  <Switch
                    checked={(form.vipUpgradeBonusStamps ?? 0) > 0}
                    onCheckedChange={(checked) => setForm({ ...form, vipUpgradeBonusStamps: checked ? 1 : 0 })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Advance bonus stamps awarded when a customer reaches a higher VIP spend tier (e.g. crossing ₹2,500 lifetime spend threshold).
                    Toggle OFF or set to <strong>0</strong> to deactivate this bonus rule entirely.
                  </p>
                </div>
                <div>
                  <Input
                    id="vip-upgrade-bonus"
                    type="number"
                    min="0"
                    max="10"
                    value={form.vipUpgradeBonusStamps ?? 0}
                    onChange={e => setForm({ ...form, vipUpgradeBonusStamps: Math.max(0, Number(e.target.value)) })}
                    className="bg-slate-900 border-slate-700 text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excluded-cat">Excluded Categories (Comma Separated)</Label>
            <Input
              id="excluded-cat"
              value={form.excludedCategories ?? ""}
              onChange={e => setForm({ ...form, excludedCategories: e.target.value })}
              placeholder="e.g. Cigarettes, Alcohol, Discounted Items"
            />
          </div>



          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
              Save Reward Config
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
