"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tag, Plus, Trash2, Search, Loader2, Sparkles, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { type GbpCategoryItem } from "@/lib/gbp-categories"

interface GbpCategoriesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GbpCategoriesModal({ open, onOpenChange }: GbpCategoriesModalProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<GbpCategoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  // New Category Form State
  const [showAddForm, setShowAddForm] = useState(false)
  const [label, setLabel] = useState("")
  const [group, setGroup] = useState("Food & Dining")
  const [icon, setIcon] = useState("⭐")
  const [keywords, setKeywords] = useState("")
  const [stamps, setStamps] = useState(5)
  const [reward, setReward] = useState("Special VIP Reward")
  const [saving, setSaving] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/categories")
      const json = await res.json()
      if (json.categories) {
        setCategories(json.categories)
      }
    } catch (err: any) {
      toast({ title: "Failed to load categories", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    setSaving(true)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          group: group.trim(),
          icon: icon.trim() || "⭐",
          reviewKeywords: keywords.split(",").map((s) => s.trim()).filter(Boolean),
          defaultLoyaltyRule: {
            stamps: Number(stamps) || 5,
            reward: reward.trim() || "Special Customer Reward",
            value: 150
          }
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create category")

      toast({ title: "Category Added! 🚀", description: `"${label}" is now live across CustomerPilot.` })
      setLabel("")
      setKeywords("")
      setShowAddForm(false)
      loadCategories()
    } catch (err: any) {
      toast({ title: "Save Error", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (id: string, catLabel: string) => {
    if (!confirm(`Are you sure you want to delete the custom category "${catLabel}"?`)) return
    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Delete failed")
      toast({ title: "Category Removed", description: `"${catLabel}" removed.` })
      loadCategories()
    } catch (err: any) {
      toast({ title: "Delete Error", description: err.message, variant: "destructive" })
    }
  }

  const filtered = categories.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.group.toLowerCase().includes(search.toLowerCase()) ||
    c.reviewKeywords.some((k) => k.toLowerCase().includes(search.toLowerCase()))
  )

  // Group by Industry
  const grouped: Record<string, GbpCategoryItem[]> = {}
  filtered.forEach((c) => {
    if (!grouped[c.group]) grouped[c.group] = []
    grouped[c.group].push(c)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-800 text-slate-100 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Tag className="w-4 h-4" />
              </span>
              <DialogTitle className="text-xl font-black text-white tracking-tight">
                GBP Business Categories & Subcategories Manager
              </DialogTitle>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              {showAddForm ? "Cancel" : "Add New Category"}
            </Button>
          </div>
          <DialogDescription className="text-xs text-slate-400">
            Official GBP taxonomy mapped to review generation keywords and automated loyalty rules. Add new custom categories dynamically below.
          </DialogDescription>
        </DialogHeader>

        {/* Inline Add Category Form */}
        {showAddForm && (
          <form onSubmit={handleCreateCategory} className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 space-y-3 mt-2">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Add New Business Category (SuperAdmin)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-300">Category Label *</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. South Indian Dosa Hub"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-300">Industry Group</Label>
                <Input
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="Food & Dining, Beauty, Clinic..."
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-300">Icon / Emoji</Label>
                <Input
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🥞, ✂️, 🚗"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-300">Review Keywords (comma separated)</Label>
                <Input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="crispy dosa, filter coffee, fresh sambar"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-slate-300">Default Loyalty Reward</Label>
                <Input
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="Free Filter Coffee Combo"
                  className="bg-slate-900 border-slate-800 text-white text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving || !label.trim()}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              Save New Category
            </Button>
          </form>
        )}

        {/* Search & Counter */}
        <div className="flex items-center justify-between gap-3 pt-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, group, or keyword..."
              className="bg-slate-950 border-slate-800 text-white text-xs pl-8"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono shrink-0">
            {filtered.length} categories active
          </span>
        </div>

        {/* Grouped Categories List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Loading GBP category catalog...</span>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {Object.entries(grouped).map(([grpName, items]) => (
              <div key={grpName} className="space-y-2">
                <div className="text-xs font-black text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center justify-between">
                  <span>{grpName}</span>
                  <span className="text-[10px] text-slate-500">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                          {cat.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white text-xs">{cat.label}</span>
                            {cat.isCustom ? (
                              <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] px-1.5 py-0">
                                Custom
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0">
                                Built-in
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            Keywords: {cat.reviewKeywords.slice(0, 3).join(", ")}
                          </p>
                          <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                            Loyalty: {cat.defaultLoyaltyRule.stamps} stamps = {cat.defaultLoyaltyRule.reward}
                          </p>
                        </div>
                      </div>

                      {cat.isCustom && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(cat.id, cat.label)}
                          className="h-7 w-7 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
