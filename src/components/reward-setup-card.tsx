"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Gift, Sparkles, RefreshCw, Award, Image as ImageIcon } from "lucide-react"

export function RewardSetupCard({ merchantId }: { merchantId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDefault, setIsDefault] = useState(true)

  const [form, setForm] = useState({
    id: "",
    name: "Loyalty Stamp Card",
    stampsRequired: 10,
    rewardName: "FREE 500gm Cake",
    stampValue: 500,
    validityDays: 90,
    googleReviewBonus: 1,
    photoBonus: 1,
    color: "#6366f1",
    tierRewardsEnabled: false,
    excludedCategories: "",
    rewardImageUrl: ""
  })

  useEffect(() => {
    let isMounted = true
    async function loadSetup() {
      if (!merchantId) return
      try {
        const res = await fetch("/api/cards/setup", {
          headers: { "x-merchant-id": merchantId }
        })
        const json = await res.json()
        if (res.ok && json.card && isMounted) {
          setForm({
            id: json.card.id || "",
            name: json.card.name || "Loyalty Stamp Card",
            stampsRequired: json.card.stampsRequired ?? 10,
            rewardName: json.card.rewardName || "FREE 500gm Cake",
            stampValue: json.card.stampValue ?? 500,
            validityDays: json.card.validityDays ?? 90,
            googleReviewBonus: json.card.googleReviewBonus ?? 1,
            photoBonus: json.card.photoBonus ?? 1,
            color: json.card.color || "#6366f1",
            tierRewardsEnabled: Boolean(json.card.tierRewardsEnabled),
            excludedCategories: json.card.excludedCategories || "",
            rewardImageUrl: json.card.rewardImageUrl || ""
          })
          setIsDefault(json.isDefault ?? false)
        }
      } catch (error) {
        console.error("[RewardSetupCard] Fetch Error:", error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadSetup()
    return () => { isMounted = false }
  }, [merchantId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/cards/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-merchant-id": merchantId },
        body: JSON.stringify(form)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to save configuration")

      toast({ title: "Saved Successfully", description: "Reward Card rules updated." })
      setIsDefault(false)
      if (json.card?.id) setForm(prev => ({ ...prev, id: json.card.id }))
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
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
              Step 5: Reward Card Setup
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
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. VIP Club Card"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-name">Reward Description</Label>
              <Input
                id="reward-name"
                value={form.rewardName}
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
                  value={form.stampValue}
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
                value={form.stampsRequired}
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
                value={form.validityDays}
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
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <Input
                  value={form.color}
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
                value={form.googleReviewBonus}
                onChange={e => setForm({ ...form, googleReviewBonus: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Bonus stamps awarded when a customer posts a 5-star Google review</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-bonus">Photo Review Bonus Stamps</Label>
              <Input
                id="photo-bonus"
                type="number"
                value={form.photoBonus}
                onChange={e => setForm({ ...form, photoBonus: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Extra bonus stamps if they attach a photo with their review</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excluded-cat">Excluded Categories (Comma Separated)</Label>
            <Input
              id="excluded-cat"
              value={form.excludedCategories}
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
