"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Gift, Sparkles, RefreshCw, Award, Check, Layers, Users,
  Save, AlertTriangle, Store, Clock, Bell, Flame
} from "lucide-react"
import { FALLBACK_GLOBAL_DEFAULTS, DefaultMerchantSettingsData } from "@/lib/default-merchant-settings-types"

const PRESET_TEMPLATES: Record<string, Partial<DefaultMerchantSettingsData>> = {
  bakery: {
    cardName: "Cake Connection VIP Club",
    rewardName: "1 Free Cake",
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    referralBonusEnabled: true,
    referralBonusStamps: 1,
    referralFriendBonusStamps: 1,
    referralRewardAmount: 0,
    instagramStoryBonusEnabled: true,
    instagramStoryBonusStamps: 1,
    instagramStoryFrequency: "ONCE_PER_CYCLE",
    color: "#6366f1"
  },
  restaurant: {
    cardName: "Gourmet Diner's VIP Club",
    rewardName: "Free Starter / Dessert",
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    referralBonusEnabled: true,
    referralBonusStamps: 1,
    referralFriendBonusStamps: 1,
    referralRewardAmount: 0,
    instagramStoryBonusEnabled: true,
    instagramStoryBonusStamps: 1,
    instagramStoryFrequency: "ONCE_PER_CYCLE",
    color: "#6366f1"
  },
  cafe: {
    cardName: "Coffee Lover's VIP Club",
    rewardName: "1 Free Specialty Coffee",
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    referralBonusEnabled: true,
    referralBonusStamps: 1,
    referralFriendBonusStamps: 1,
    referralRewardAmount: 0,
    instagramStoryBonusEnabled: true,
    instagramStoryBonusStamps: 1,
    instagramStoryFrequency: "ONCE_PER_CYCLE",
    color: "#6366f1"
  },
  salon: {
    cardName: "Luxury Beauty VIP Pass",
    rewardName: "Free Hair Spa / Facial",
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    referralBonusEnabled: true,
    referralBonusStamps: 1,
    referralFriendBonusStamps: 1,
    referralRewardAmount: 0,
    instagramStoryBonusEnabled: true,
    instagramStoryBonusStamps: 1,
    instagramStoryFrequency: "ONCE_PER_CYCLE",
    color: "#6366f1"
  },
  retail: {
    cardName: "Exclusive Shopper's Club",
    rewardName: "₹500 Shopping Voucher",
    stampsRequired: 10,
    stampValue: 300,
    validityDays: 180,
    googleReviewBonus: 1,
    photoBonus: 1,
    joiningBonusEnabled: true,
    joiningBonusStamps: 1,
    vipUpgradeBonusStamps: 2,
    referralBonusEnabled: true,
    referralBonusStamps: 1,
    referralFriendBonusStamps: 1,
    referralRewardAmount: 0,
    instagramStoryBonusEnabled: true,
    instagramStoryBonusStamps: 1,
    instagramStoryFrequency: "ONCE_PER_CYCLE",
    color: "#6366f1"
  }
}

export function DefaultMerchantSettingsManager() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applyingAll, setApplyingAll] = useState(false)
  const [form, setForm] = useState<DefaultMerchantSettingsData>(FALLBACK_GLOBAL_DEFAULTS)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/default-settings", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      })
      const json = await res.json()
      if (res.ok && json.data?.settings) {
        setForm(json.data.settings)
      } else if (!res.ok) {
        throw new Error(json.error || `Failed to fetch settings (HTTP ${res.status})`)
      }
    } catch (err: any) {
      toast({
        title: "Failed to load defaults",
        description: err.message || "Using fallback default settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (applyToAll: boolean = false) => {
    if (applyToAll) {
      setApplyingAll(true)
    } else {
      setSaving(true)
    }

    try {
      const res = await fetch("/api/admin/default-settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        body: JSON.stringify({
          settings: form,
          applyToAll
        })
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || "Failed to update global defaults")
      }

      if (json.data?.settings) {
        setForm(json.data.settings)
      }

      toast({
        title: applyToAll ? "Applied to Entire Fleet!" : "Saved Successfully!",
        description: json.data?.message || "Default settings updated.",
        className: "bg-emerald-600 text-white border-none"
      })
    } catch (err: any) {
      toast({
        title: "Error Saving Defaults",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
      setApplyingAll(false)
    }
  }

  const applyPreset = (key: string) => {
    const preset = PRESET_TEMPLATES[key]
    if (preset) {
      setForm(prev => ({ ...prev, ...preset }))
      toast({
        title: `Applied ${key.toUpperCase()} Preset`,
        description: "Template fields updated. Click Save to persist."
      })
    }
  }

  const handleCategoryNameChange = (index: number, value: string) => {
    const updated = [...form.loyaltyCategoryNames]
    updated[index] = value
    setForm(prev => ({ ...prev, loyaltyCategoryNames: updated }))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium">Loading Global Default Settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Gift className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs px-2.5 py-0.5">
                <Store className="w-3.5 h-3.5 mr-1" />
                Fleet Configuration Engine
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Global New Merchant Defaults
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Default Merchant Settings & Reward Rules
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Configure universal loyalty stamp rules, reward criteria, bonus stamps, and 10 loyalty tier levels automatically assigned to every new merchant signup and settings page across CustomerPilot.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <Button
              onClick={() => handleSave(false)}
              disabled={saving || applyingAll}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Global Defaults
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving || applyingAll}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              {applyingAll ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Flame className="w-4 h-4 mr-2" />}
              Apply to All Merchants
            </Button>
          </div>
        </div>

        {/* 1-Click Industry Presets Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Quick Presets:
          </span>
          {Object.keys(PRESET_TEMPLATES).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="px-3 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors uppercase font-bold tracking-wider cursor-pointer"
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setForm(FALLBACK_GLOBAL_DEFAULTS)}
            className="px-3 py-1 text-xs rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 transition-colors font-semibold ml-auto cursor-pointer"
          >
            Reset to Recommended Defaults
          </button>
        </div>
      </div>

      {/* STEP A: Reward Card Rules Setup */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl">
        <CardHeader className="border-b border-slate-800/80 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-indigo-400 mb-1">
                STEP A
              </div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-indigo-400" />
                Stamps Reward Card Rules Setup
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Default stamp card parameters pre-populated when a new merchant creates their account.
              </CardDescription>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Universal Rules
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Joining Bonus Stamps */}
          <div className="p-4 sm:p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <Label htmlFor="global-joining-bonus" className="font-bold text-sm text-slate-100">
                  Joining Bonus Stamps (First Time Scan)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${form.joiningBonusEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                  {form.joiningBonusEnabled ? `ACTIVE (+${form.joiningBonusStamps ?? 2} Stamps on Join)` : "DEACTIVATED"}
                </span>
                <Switch
                  id="global-joining-bonus"
                  checked={form.joiningBonusEnabled}
                  onCheckedChange={(checked) => setForm({ ...form, joiningBonusEnabled: checked })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically award advance bonus stamps to new customers when they scan the QR code and join the merchant's loyalty club.
                </p>
              </div>
              <div>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  disabled={!form.joiningBonusEnabled}
                  value={form.joiningBonusStamps ?? 2}
                  onChange={e => setForm({ ...form, joiningBonusStamps: Math.max(1, Number(e.target.value)) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="global-card-name" className="text-xs font-semibold text-slate-300">
                Default Card Display Title
              </Label>
              <Input
                id="global-card-name"
                value={form.cardName}
                onChange={e => setForm({ ...form, cardName: e.target.value })}
                placeholder="e.g. Cake Connection VIP Club"
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-reward-name" className="text-xs font-semibold text-slate-300">
                Default Free Reward
              </Label>
              <Input
                id="global-reward-name"
                value={form.rewardName}
                onChange={e => setForm({ ...form, rewardName: e.target.value })}
                placeholder="e.g. 250g Free Cake"
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-stamp-val" className="text-xs font-semibold text-slate-300">
                Eligible Minimum Purchase Amount for Loyalty stamp (₹)
              </Label>
              <Input
                id="global-stamp-val"
                type="number"
                min="10"
                step="10"
                value={form.stampValue}
                onChange={e => setForm({ ...form, stampValue: Number(e.target.value) })}
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
              />
              <p className="text-[11px] text-slate-500">Every ₹{form.stampValue || 500} = 1 Stamp</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-stamps-req" className="text-xs font-semibold text-slate-300">
                Stamp Goal (Stamps for Reward)
              </Label>
              <Input
                id="global-stamps-req"
                type="number"
                min="2"
                max="50"
                value={form.stampsRequired}
                onChange={e => setForm({ ...form, stampsRequired: Number(e.target.value) })}
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
              />
              <p className="text-[11px] text-slate-500">
                {form.stampsRequired || 11} Stamps needed for 1 {form.rewardName || 'Free Cake'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-validity" className="text-xs font-semibold text-slate-300">
                Validity (in Days) [Maximum Time Duration to Earn Reward]
              </Label>
              <Input
                id="global-validity"
                type="number"
                min="7"
                max="365"
                value={form.validityDays}
                onChange={e => setForm({ ...form, validityDays: Number(e.target.value) })}
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-color" className="text-xs font-semibold text-slate-300">
                Default Card Theme Color
              </Label>
              <div className="flex gap-3 items-center">
                <input
                  id="global-color"
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer p-0.5"
                />
                <Input
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-review-bonus" className="text-xs font-semibold text-slate-300">
                Google Review Bonus Stamps
              </Label>
              <Input
                id="global-review-bonus"
                type="number"
                min="0"
                max="5"
                value={form.googleReviewBonus}
                onChange={e => setForm({ ...form, googleReviewBonus: Number(e.target.value) })}
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
              />
              <p className="text-[11px] text-slate-500">Bonus stamps awarded when customer posts a 5-star Google review</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="global-photo-bonus" className="text-xs font-semibold text-slate-300">
                Photo Review Bonus Stamps
              </Label>
              <Input
                id="global-photo-bonus"
                type="number"
                min="0"
                max="5"
                value={form.photoBonus}
                onChange={e => setForm({ ...form, photoBonus: Number(e.target.value) })}
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
              />
              <p className="text-[11px] text-slate-500">Extra bonus stamps if they attach a photo with their review</p>
            </div>
          </div>

          {/* Next Level Kickstart Bonus */}
          <div className="p-4 sm:p-5 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <Label htmlFor="global-next-level-bonus" className="font-bold text-sm text-slate-100">
                  Next Level Kickstart Bonus Stamps (Level Completion Bonus)
                </Label>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
                ACTIVE (+{form.vipUpgradeBonusStamps ?? 2} Stamp on Next Level)
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Advance bonus stamps pre-credited when a customer completes their previous level/card and unlocks the next loyalty tier (e.g. Level 1 complete → Level 2 starts with pre-added bonus stamps).
                </p>
              </div>
              <div>
                <Input
                  id="global-next-level-bonus"
                  type="number"
                  min="0"
                  max="5"
                  value={form.vipUpgradeBonusStamps ?? 2}
                  onChange={e => setForm({ ...form, vipUpgradeBonusStamps: Math.max(0, Number(e.target.value)) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Customer Referral Bonus Rules */}
          <div className="p-4 sm:p-5 bg-indigo-950/20 border border-indigo-500/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <Label htmlFor="global-referral-switch" className="font-bold text-sm text-slate-100">
                  Global Referral Bonus Rules (Customer A ➔ Friend B)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${form.referralBonusEnabled ?? true ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'}`}>
                  {form.referralBonusEnabled ?? true ? `ACTIVE (+${form.referralBonusStamps ?? 1} / +${form.referralFriendBonusStamps ?? 1} Stamps)` : "DEACTIVATED"}
                </span>
                <Switch
                  id="global-referral-switch"
                  checked={form.referralBonusEnabled ?? true}
                  onCheckedChange={(checked) => setForm({ ...form, referralBonusEnabled: checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="global-referral-referrer" className="text-xs font-semibold text-slate-300">
                  Referrer Bonus Stamps
                </Label>
                <Input
                  id="global-referral-referrer"
                  type="number"
                  min="0"
                  max="10"
                  value={form.referralBonusStamps ?? 1}
                  onChange={e => setForm({ ...form, referralBonusStamps: Math.max(0, Number(e.target.value)) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm mt-1"
                />
                <p className="text-[11px] text-slate-400 mt-1">Stamps to Customer A (Referrer)</p>
              </div>

              <div>
                <Label htmlFor="global-referral-friend" className="text-xs font-semibold text-slate-300">
                  Friend Welcome Stamps
                </Label>
                <Input
                  id="global-referral-friend"
                  type="number"
                  min="0"
                  max="10"
                  value={form.referralFriendBonusStamps ?? 1}
                  onChange={e => setForm({ ...form, referralFriendBonusStamps: Math.max(0, Number(e.target.value)) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm mt-1"
                />
                <p className="text-[11px] text-slate-400 mt-1">Stamps to Friend B on 1st visit</p>
              </div>
            </div>
          </div>

          {/* Instagram Story Mention & Tag Reward Feature */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-950/20 via-purple-950/20 to-indigo-950/20 border border-pink-500/30 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <Label htmlFor="global-insta-switch" className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    Instagram Story Mention & Tag Reward Feature
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">VIRAL SOCIAL REWARD</span>
                  </Label>
                  <p className="text-[11px] text-slate-400">
                    Kya aap apne store par customer ko photo story lagakar @tag karne par extra bonus loyalty stamp dena chahte hain?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${form.instagramStoryBonusEnabled ?? true ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {form.instagramStoryBonusEnabled ?? true ? `ACTIVE (+${form.instagramStoryBonusStamps ?? 1} STAMPS)` : "DEACTIVATED"}
                </span>
                <Switch
                  id="global-insta-switch"
                  checked={form.instagramStoryBonusEnabled ?? true}
                  onCheckedChange={(checked) => setForm({ ...form, instagramStoryBonusEnabled: checked })}
                />
              </div>
            </div>

            <div className={`space-y-4 pt-1 transition-opacity ${form.instagramStoryBonusEnabled ?? true ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-pink-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-200">
                    Story Tag Bonus Stamps (Har valid story tag par kitne extra stamps milenge?)
                  </Label>
                  <p className="text-[11px] text-slate-400">Default: +1 extra stamp per valid Instagram story mention</p>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={form.instagramStoryBonusStamps ?? 1}
                  onChange={e => setForm({ ...form, instagramStoryBonusStamps: Math.max(1, Number(e.target.value)) })}
                  className="w-24 bg-slate-900 border-slate-700 text-white font-bold text-center"
                />
              </div>

              {/* 3 Strategy Radios */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300">
                  Award Cadence: Aap customer ko yeh Story Bonus Stamp kab kab dena chahte hain?
                </Label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option 1: Once Per Cycle */}
                  <label
                    onClick={() => setForm({ ...form, instagramStoryFrequency: "ONCE_PER_CYCLE" })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${(form.instagramStoryFrequency || "ONCE_PER_CYCLE") === "ONCE_PER_CYCLE" ? 'bg-pink-950/30 border-pink-500 ring-1 ring-pink-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                  >
                    <input
                      type="radio"
                      name="globalInstagramStoryFrequency"
                      checked={(form.instagramStoryFrequency || "ONCE_PER_CYCLE") === "ONCE_PER_CYCLE"}
                      onChange={() => setForm({ ...form, instagramStoryFrequency: "ONCE_PER_CYCLE" })}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Option 1: 1 Stamp Cycle me Sirf 1 Baar</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">RECOMMENDED FOR 100% SECURITY & ROI</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        👉 <strong>Kya hoga:</strong> Customer ko pure 10 stamps card cycle me sirf ek hi baar story bonus stamp milega, agla stamp naye card cycle me milega.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Every Purchase */}
                  <label
                    onClick={() => setForm({ ...form, instagramStoryFrequency: "EVERY_PURCHASE" })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${form.instagramStoryFrequency === "EVERY_PURCHASE" ? 'bg-pink-950/30 border-pink-500 ring-1 ring-pink-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                  >
                    <input
                      type="radio"
                      name="globalInstagramStoryFrequency"
                      checked={form.instagramStoryFrequency === "EVERY_PURCHASE"}
                      onChange={() => setForm({ ...form, instagramStoryFrequency: "EVERY_PURCHASE" })}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Option 2: Har Qualifying Purchase Bill par</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">BONUS ALONG WITH BILLING STAMP</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        👉 <strong>Kya hoga:</strong> Customer jab bhi purchase karega aur minimum qualifying bill banwayega, har visit par story tag karne par bill stamp ke saath extra stamp milega.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Cooldown 30 Days */}
                  <label
                    onClick={() => setForm({ ...form, instagramStoryFrequency: "COOLDOWN_30_DAYS" })}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${form.instagramStoryFrequency === "COOLDOWN_30_DAYS" ? 'bg-pink-950/30 border-pink-500 ring-1 ring-pink-500' : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'}`}
                  >
                    <input
                      type="radio"
                      name="globalInstagramStoryFrequency"
                      checked={form.instagramStoryFrequency === "COOLDOWN_30_DAYS"}
                      onChange={() => setForm({ ...form, instagramStoryFrequency: "COOLDOWN_30_DAYS" })}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Option 3: Har 30 Din me Sirf 1 Baar (Monthly CoolDown)</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">STEADY MONTHLY TRAFFIC</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        👉 <strong>Kya hoga:</strong> Ek customer ko har 30 din / 1 mahine me maximum 1 baar story tag karne ka bonus stamp hi milega.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* STEP B: Loyalty Cycle Categories (10 Levels) */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl">
        <CardHeader className="border-b border-slate-800/80 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-purple-400 mb-1">
                STEP B
              </div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Default Loyalty Cycle Categories (10 Levels)
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Configure default titles for 10 customer loyalty levels. New customers start at Level 1 upon QR scan, and automatically upgrade upon completing each loyalty stamp card cycle!
              </CardDescription>
            </div>
            <span className="text-xs px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 10 Progression Tiers
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {form.loyaltyCategoryNames.map((name, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 focus-within:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">Level {idx + 1}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {idx === 0 ? "Initial QR" : `${idx} Card${idx > 1 ? "s" : ""}`}
                  </span>
                </div>
                <Input
                  value={name}
                  onChange={e => handleCategoryNameChange(idx, e.target.value)}
                  placeholder={`Level ${idx + 1}`}
                  className="bg-slate-900 border-slate-700/80 text-white rounded-lg text-xs h-8 px-2 font-medium"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* STEP C: Default Automation & Nudge Rules */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl rounded-2xl">
        <CardHeader className="border-b border-slate-800/80 pb-5">
          <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400 mb-1">
            STEP C
          </div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Default System Automation & Nudge Rules
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            System timings, Google review delays, and customer win-back campaign triggers applied by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">
                Google Review WhatsApp Prompt Delay
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="5"
                  max="1440"
                  value={form.googleReviewDelayMinutes}
                  onChange={e => setForm({ ...form, googleReviewDelayMinutes: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
                />
                <span className="text-xs text-slate-400 font-medium">Minutes</span>
              </div>
              <p className="text-[11px] text-slate-500">Wait time after bill/stamp before asking for Google Review</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">
                Winback Autopilot Nudge 1
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="7"
                  max="180"
                  value={form.winbackDays1}
                  onChange={e => setForm({ ...form, winbackDays1: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
                />
                <span className="text-xs text-slate-400 font-medium">Days</span>
              </div>
              <p className="text-[11px] text-slate-500">First reminder to dormant customers</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">
                Winback Autopilot Nudge 2
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="14"
                  max="365"
                  value={form.winbackDays2}
                  onChange={e => setForm({ ...form, winbackDays2: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
                />
                <span className="text-xs text-slate-400 font-medium">Days</span>
              </div>
              <p className="text-[11px] text-slate-500">Second win-back alert with extra incentive</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-300">
                Stamp Card Expiry Warning
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={form.expiryWarningDays}
                  onChange={e => setForm({ ...form, expiryWarningDays: Number(e.target.value) })}
                  className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm"
                />
                <span className="text-xs text-slate-400 font-medium">Days Prior</span>
              </div>
              <p className="text-[11px] text-slate-500">Advance WhatsApp alert before card validity expires</p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-semibold text-slate-300">
                Default Enabled Modules
              </Label>
              <Input
                value={form.enabledModules}
                onChange={e => setForm({ ...form, enabledModules: e.target.value })}
                className="bg-slate-950 border-slate-700 text-white rounded-xl text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500">Comma-separated: LOYALTY, REVIEWS, AUTOREPLY</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Defaults are loaded persistently into database for every new merchant signup.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => handleSave(false)}
            disabled={saving || applyingAll}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Global Defaults
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving || applyingAll}
            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            {applyingAll ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Flame className="w-4 h-4 mr-2" />}
            Apply to All Merchants
          </Button>
        </div>
      </div>
    </div>
  )
}
