"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Gift, Sparkles, RefreshCw, Award, Image as ImageIcon, Check, Users, Instagram } from "lucide-react"

import { useDashboardState } from "@/hooks/use-dashboard-state"

export function RewardSetupCard({ merchantId }: { merchantId: string }) {
  const { refetch } = useDashboardState()

  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSavedSuccess, setIsSavedSuccess] = useState(false)
  const [isDefault, setIsDefault] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const defaultForm = {
    id: "",
    name: "Loyalty Stamp Card",
    stampsRequired: 10,
    rewardName: "1 Free Cake",
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    vipUpgradeBonusStamps: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    referralBonusEnabled: true,
    referralBonusStamps: 1,
    referralFriendBonusStamps: 1,
    referralRewardAmount: 50,
    instagramStoryBonusEnabled: true,
    instagramStoryBonusStamps: 1,
    instagramStoryFrequency: "ONCE_PER_CYCLE",
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
            joiningBonusEnabled: cardData.joiningBonusEnabled ?? true,
            joiningBonusStamps: cardData.joiningBonusStamps ?? 2,
            referralBonusEnabled: cardData.referralBonusEnabled ?? true,
            referralBonusStamps: cardData.referralBonusStamps ?? 1,
            referralFriendBonusStamps: cardData.referralFriendBonusStamps ?? 1,
            referralRewardAmount: cardData.referralRewardAmount ?? 50,
            instagramStoryBonusEnabled: cardData.instagramStoryBonusEnabled ?? true,
            instagramStoryBonusStamps: cardData.instagramStoryBonusStamps ?? 1,
            instagramStoryFrequency: cardData.instagramStoryFrequency || "ONCE_PER_CYCLE",
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
      setIsSavedSuccess(true)
      setTimeout(() => setIsSavedSuccess(false), 3500)
      if (json.data?.card?.id) setForm(prev => ({ ...prev, id: json.data.card.id }))
      if (refetch) refetch()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setIsSavedSuccess(false)
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
            <CardTitle className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-slate-900 dark:text-slate-100 tracking-tight">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Gift className="w-5 h-5 text-indigo-500" />
              </div>
              Stamps Reward Card Rules Setup
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
            {/* ── Joining Bonus Stamps moved to TOP ── */}
            <div className="col-span-1 md:col-span-2 p-4 sm:p-5 bg-emerald-50/50 dark:bg-slate-950/60 border border-emerald-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <Label htmlFor="joining-bonus" className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Joining Bonus Stamps (First Time Scan)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${form.joiningBonusEnabled ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/20'}`}>
                    {form.joiningBonusEnabled ? `ACTIVE (+${form.joiningBonusStamps ?? 2} Stamps on Join)` : "DEACTIVATED"}
                  </span>
                  <Switch
                    checked={form.joiningBonusEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, joiningBonusEnabled: checked })}
                    className="data-[state=checked]:!bg-emerald-600 dark:data-[state=checked]:!bg-emerald-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Automatically award advance bonus stamps to NEW customers when they scan the QR code and join the loyalty program for the first time.
                  </p>
                </div>
                <div>
                  <Input
                    id="joining-bonus-stamps"
                    type="number"
                    min="1"
                    max="10"
                    disabled={!form.joiningBonusEnabled}
                    value={form.joiningBonusStamps ?? 2}
                    onChange={e => setForm({ ...form, joiningBonusStamps: Math.max(1, Number(e.target.value)) })}
                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Card Title</Label>
              <Input
                id="card-name"
                value={form.name ?? ""}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. VIP Club Card"
                className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reward Description</Label>
              <Input
                id="reward-name"
                value={form.rewardName ?? ""}
                onChange={e => setForm({ ...form, rewardName: e.target.value })}
                placeholder="e.g. FREE 500gm Cake"
                className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stamp-val" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Eligible Minimum Purchase Amount for Loyalty stamp</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                <Input
                  id="stamp-val"
                  type="number"
                  className="pl-7 bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                  value={form.stampValue ?? 500}
                  onChange={e => setForm({ ...form, stampValue: Number(e.target.value) })}
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Every ₹{form.stampValue || 500} spent = 1 Stamp</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stamps-req" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stamp Goal (Stamps for Reward)</Label>
              <Input
                id="stamps-req"
                type="number"
                value={form.stampsRequired ?? 10}
                onChange={e => setForm({ ...form, stampsRequired: Number(e.target.value) })}
                className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                required
              />
              <p className="text-[11px] text-muted-foreground">{form.stampsRequired || 10} Stamps needed for 1 {form.rewardName || 'Reward'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validity" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Validity (in Days) [Maximum Time Duration to Earn Reward]</Label>
              <Input
                id="validity"
                type="number"
                value={form.validityDays ?? 90}
                onChange={e => setForm({ ...form, validityDays: Number(e.target.value) })}
                className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme-color" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Card Theme Color</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="theme-color"
                  value={form.color ?? "#6366f1"}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                />
                <Input
                  value={form.color ?? "#6366f1"}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="font-mono bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google-bonus" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Google Review Bonus Stamps</Label>
              <Input
                id="google-bonus"
                type="number"
                value={form.googleReviewBonus ?? 0}
                onChange={e => setForm({ ...form, googleReviewBonus: Number(e.target.value) })}
                className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Bonus stamps awarded when a customer posts a 5-star Google review</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo-bonus" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Photo Review Bonus Stamps</Label>
              <Input
                id="photo-bonus"
                type="number"
                value={form.photoBonus ?? 0}
                onChange={e => setForm({ ...form, photoBonus: Number(e.target.value) })}
                className="bg-white dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Extra bonus stamps if they attach a photo with their review</p>
            </div>

            <div className="col-span-1 md:col-span-2 p-4 sm:p-5 bg-amber-50/50 dark:bg-slate-950/60 border border-amber-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <Label htmlFor="vip-upgrade-bonus" className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Next Level Kickstart Bonus Stamps (Level Completion Bonus)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${(form.vipUpgradeBonusStamps ?? 0) > 0 ? 'bg-amber-100 dark:bg-emerald-500/10 text-amber-800 dark:text-emerald-400 border-amber-300 dark:border-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/20'}`}>
                    {(form.vipUpgradeBonusStamps ?? 0) > 0 ? `ACTIVE (+${form.vipUpgradeBonusStamps ?? 0} Stamp on Next Level)` : "DEACTIVATED (0 Stamps)"}
                  </span>
                  <Switch
                    checked={(form.vipUpgradeBonusStamps ?? 0) > 0}
                    onCheckedChange={(checked) => setForm({ ...form, vipUpgradeBonusStamps: checked ? 1 : 0 })}
                    className="data-[state=checked]:!bg-emerald-600 dark:data-[state=checked]:!bg-emerald-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Advance bonus stamps pre-credited when a customer completes their previous level/card and unlocks the next loyalty level (e.g. Level 1 complete → Level 2 starts with pre-added bonus stamps).
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
                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* ── Customer Referral Bonus Rules (Customer A ➔ Friend B) ── */}
            <div className="col-span-1 md:col-span-2 p-4 sm:p-5 bg-indigo-50/60 dark:bg-slate-950/60 border border-indigo-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <Label htmlFor="referral-bonus-switch" className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Customer Referral Bonus Rules (Customer A ➔ Friend B)
                    </Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Reward both the referring customer and their invited friend with digital loyalty stamps when the friend makes their first qualifying store visit.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${form.referralBonusEnabled ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/20' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/20'}`}>
                    {form.referralBonusEnabled ? `ACTIVE (+${form.referralBonusStamps ?? 1} / +${form.referralFriendBonusStamps ?? 1} Stamps)` : "DEACTIVATED"}
                  </span>
                  <Switch
                    id="referral-bonus-switch"
                    checked={form.referralBonusEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, referralBonusEnabled: checked })}
                    className="data-[state=checked]:!bg-emerald-600 dark:data-[state=checked]:!bg-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="referral-referrer-stamps" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Referrer Bonus Stamps
                  </Label>
                  <Input
                    id="referral-referrer-stamps"
                    type="number"
                    min="0"
                    max="10"
                    disabled={!form.referralBonusEnabled}
                    value={form.referralBonusStamps ?? 1}
                    onChange={e => setForm({ ...form, referralBonusStamps: Math.max(0, Number(e.target.value)) })}
                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Bonus stamps awarded to Customer A (Referrer)</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="referral-friend-stamps" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Friend Welcome Stamps
                  </Label>
                  <Input
                    id="referral-friend-stamps"
                    type="number"
                    min="0"
                    max="10"
                    disabled={!form.referralBonusEnabled}
                    value={form.referralFriendBonusStamps ?? 1}
                    onChange={e => setForm({ ...form, referralFriendBonusStamps: Math.max(0, Number(e.target.value)) })}
                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-sm"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Welcome stamps awarded to Friend B on 1st visit</p>
                </div>
              </div>
            </div>

            {/* ── Instagram Story Mention & Social Tag Reward (@MerchantHandle) ── */}
            <div className="col-span-1 md:col-span-2 p-4 sm:p-5 bg-gradient-to-r from-pink-50/70 via-purple-50/40 to-amber-50/40 dark:bg-slate-950/60 border border-pink-200 dark:border-pink-900/40 rounded-2xl space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <Label htmlFor="insta-story-switch" className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Instagram Story Mention &amp; Tag Reward Feature
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-800">
                        Social Viral Engine
                      </span>
                    </Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Kya aap apne store par customer ko photo story lagakar @tag karne par extra bonus loyalty stamp dena chahte hain?
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${form.instagramStoryBonusEnabled ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                    {form.instagramStoryBonusEnabled ? `ACTIVE (+${form.instagramStoryBonusStamps ?? 1} STAMPS)` : "DEACTIVATED"}
                  </span>
                  <Switch
                    id="insta-story-switch"
                    checked={form.instagramStoryBonusEnabled}
                    onCheckedChange={(checked) => setForm({ ...form, instagramStoryBonusEnabled: checked })}
                    className="data-[state=checked]:!bg-emerald-600 dark:data-[state=checked]:!bg-emerald-500"
                  />
                </div>
              </div>

              {/* Settings Controls (Only visible when active, or faded when deactivated) */}
              <div className={`space-y-4 pt-1 transition-opacity duration-200 ${form.instagramStoryBonusEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                {/* Number of Stamps Input */}
                <div className="p-3.5 bg-white/80 dark:bg-slate-900/70 border border-pink-200/80 dark:border-pink-900/30 rounded-xl space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <Label htmlFor="insta-bonus-stamps" className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Story Tag Bonus Stamps (Har valid story tag par kitne extra stamps milenge?)
                      </Label>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Customer cake/product ki photo lekar @tag karega tab yeh bonus stamps add honge.
                      </p>
                    </div>
                    <div className="w-full sm:w-28">
                      <Input
                        id="insta-bonus-stamps"
                        type="number"
                        min="1"
                        max="10"
                        disabled={!form.instagramStoryBonusEnabled}
                        value={form.instagramStoryBonusStamps ?? 1}
                        onChange={e => setForm({ ...form, instagramStoryBonusStamps: Math.max(1, Number(e.target.value)) })}
                        className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-center rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Radio Button Options for Frequency */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Award Cadence: Aap customer ko yeh Story Bonus Stamp kab kab dena chahte hain?
                  </Label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Apne business model aur profit margin ke hisaab se koi ek option select karein:
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {/* Option 1: ONCE_PER_CYCLE */}
                    <div 
                      onClick={() => form.instagramStoryBonusEnabled && setForm({ ...form, instagramStoryFrequency: "ONCE_PER_CYCLE" })}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 ${
                        (form.instagramStoryFrequency || "ONCE_PER_CYCLE") === "ONCE_PER_CYCLE"
                          ? "border-pink-500 bg-white dark:bg-slate-900 shadow-xs ring-1 ring-pink-400/50"
                          : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-pink-300 dark:hover:border-pink-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          id="freq-once-per-cycle"
                          name="instagramStoryFrequency"
                          value="ONCE_PER_CYCLE"
                          checked={(form.instagramStoryFrequency || "ONCE_PER_CYCLE") === "ONCE_PER_CYCLE"}
                          onChange={() => setForm({ ...form, instagramStoryFrequency: "ONCE_PER_CYCLE" })}
                          className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="freq-once-per-cycle" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer">
                              Option 1: 1 Stamp Cycle me Sirf 1 Baar
                            </label>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                              Recommended (100% Margin Safe)
                            </span>
                          </div>
                          <div className="space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            <p>
                              <strong className="text-slate-900 dark:text-slate-100">📌 Kya hoga:</strong> Customer ko pure 10-stamp card mein sirf ek baar hi story bonus stamp milega, agla stamp naya card shuru hone par hi milega.
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">🎯 Kiske liye suitable:</strong> Established bakeries, cafes aur salons ke liye — jahan profit margin 100% protect rakhna ho aur koi fraud/abuse na ho sake.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: EVERY_PURCHASE */}
                    <div 
                      onClick={() => form.instagramStoryBonusEnabled && setForm({ ...form, instagramStoryFrequency: "EVERY_PURCHASE" })}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 ${
                        form.instagramStoryFrequency === "EVERY_PURCHASE"
                          ? "border-pink-500 bg-white dark:bg-slate-900 shadow-xs ring-1 ring-pink-400/50"
                          : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-pink-300 dark:hover:border-pink-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          id="freq-every-purchase"
                          name="instagramStoryFrequency"
                          value="EVERY_PURCHASE"
                          checked={form.instagramStoryFrequency === "EVERY_PURCHASE"}
                          onChange={() => setForm({ ...form, instagramStoryFrequency: "EVERY_PURCHASE" })}
                          className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="freq-every-purchase" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer">
                              Option 2: Har Qualifying Purchase Bill par
                            </label>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                              High Viral Social Reach
                            </span>
                          </div>
                          <div className="space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            <p>
                              <strong className="text-slate-900 dark:text-slate-100">📌 Kya hoga:</strong> Customer jab bhi counter par minimum qualifying bill bharega, har visit par story tag karne par bill stamp ke sath extra stamp milega.
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">🎯 Kiske liye suitable:</strong> Naye stores, youth cafes aur trendy outlets ke liye — jinhe local mohalle aur area mein aggressive viral publicity chahiye.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Option 3: COOLDOWN_30_DAYS */}
                    <div 
                      onClick={() => form.instagramStoryBonusEnabled && setForm({ ...form, instagramStoryFrequency: "COOLDOWN_30_DAYS" })}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 ${
                        form.instagramStoryFrequency === "COOLDOWN_30_DAYS"
                          ? "border-pink-500 bg-white dark:bg-slate-900 shadow-xs ring-1 ring-pink-400/50"
                          : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 hover:border-pink-300 dark:hover:border-pink-800"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          id="freq-cooldown"
                          name="instagramStoryFrequency"
                          value="COOLDOWN_30_DAYS"
                          checked={form.instagramStoryFrequency === "COOLDOWN_30_DAYS"}
                          onChange={() => setForm({ ...form, instagramStoryFrequency: "COOLDOWN_30_DAYS" })}
                          className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <label htmlFor="freq-cooldown" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer">
                              Option 3: Har 30 Din me Sirf 1 Baar (Monthly Cooldown)
                            </label>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                              Steady Monthly Buzz
                            </span>
                          </div>
                          <div className="space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            <p>
                              <strong className="text-slate-900 dark:text-slate-100">📌 Kya hoga:</strong> Ek customer har 30 din (1 mahina) mein maximum 1 baar story tag karke bonus stamp le sakega.
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">
                              <strong className="text-slate-700 dark:text-slate-300">🎯 Kiske liye suitable:</strong> Regular retail stores aur dining restaurants ke liye — jo safe margin ke sath har mahine fresh organic buzz chahte hain.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className={`transition-all duration-300 font-bold px-6 py-2.5 ${
                isSavedSuccess
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30"
                  : ""
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving Rules...
                </>
              ) : isSavedSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-white" />
                  Saved Successfully! ✓
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Save Loyalty Reward Rules
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
