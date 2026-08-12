"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Crown, Sparkles, CheckCircle2 } from "lucide-react"
import { DEFAULT_10_LOYALTY_CATEGORIES, parseMerchantLoyaltyCategories } from "@/lib/loyalty-category-service"

interface Props {
  merchantId: string
  initialCategoryJson?: string | null
}

export function LoyaltyCategoryCard({ merchantId, initialCategoryJson }: Props) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<string[]>(DEFAULT_10_LOYALTY_CATEGORIES)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (initialCategoryJson) {
      setCategories(parseMerchantLoyaltyCategories(initialCategoryJson))
    }
  }, [initialCategoryJson])

  const handleCategoryChange = (index: number, val: string) => {
    const next = [...categories]
    next[index] = val
    setCategories(next)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/merchant/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-merchant-id": merchantId
        },
        body: JSON.stringify({
          loyaltyCategoryNames: JSON.stringify(categories)
        })
      })

      if (!res.ok) throw new Error("Failed to save categories")

      setSaved(true)
      toast({
        title: "Loyalty Categories Saved",
        description: "Your 10-level loyalty progression titles have been updated successfully."
      })
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not save loyalty categories",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <CardHeader className="bg-slate-900/40 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Step 6: Loyalty Cycle Categories (10 Levels)
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Configure titles for 10 customer loyalty levels. New customers start at Level 1 (VIP) upon QR scan, and automatically upgrade upon completing each loyalty stamp card cycle!
            </CardDescription>
          </div>
          {saved && (
            <span className="text-xs text-green-400 flex items-center gap-1 font-medium bg-green-950/60 border border-green-800/60 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((catName, idx) => (
              <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Level {idx + 1}
                  </Label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {idx === 0 ? "Initial QR" : `${idx} Card${idx > 1 ? "s" : ""}`}
                  </span>
                </div>
                <Input
                  value={catName}
                  onChange={(e) => handleCategoryChange(idx, e.target.value)}
                  placeholder={`Level ${idx + 1} Name`}
                  className="bg-slate-900/80 border-slate-700/80 text-sm font-medium text-slate-100"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
              {saving ? "Saving..." : "Save Loyalty Categories"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
