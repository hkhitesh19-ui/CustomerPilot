"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  RefreshCw,
  Search,
  MapPin,
  TrendingUp,
  Sparkles,
  BarChart3,
  Sliders
} from "lucide-react"

type TrackedKeyword = {
  id: string
  merchantId: string
  keyword: string
  keywordType: "GEO" | "SEO" | "AEO" | string
  targetLocality: string | null
  targetCity: string
  searchVolume: number
  serpFeature: string
  baselineRank: number
  isActive: boolean
  createdAt: string
}

interface ManageTrackedKeywordsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  merchantId: string
  merchantName?: string
  onKeywordsUpdated?: () => void
}

export function ManageTrackedKeywordsModal({
  open,
  onOpenChange,
  merchantId,
  merchantName = "Selected Merchant",
  onKeywordsUpdated,
}: ManageTrackedKeywordsModalProps) {
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"ALL" | "GEO" | "SEO" | "AEO">("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKeyword, setNewKeyword] = useState("")
  const [newType, setNewType] = useState<"GEO" | "SEO" | "AEO">("GEO")
  const [newLocality, setNewLocality] = useState("")
  const [newVolume, setNewVolume] = useState("1000")
  const [newBaselineRank, setNewBaselineRank] = useState("10")
  const [addingKeyword, setAddingKeyword] = useState(false)

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editKeyword, setEditKeyword] = useState("")
  const [editType, setEditType] = useState<"GEO" | "SEO" | "AEO">("GEO")
  const [editLocality, setEditLocality] = useState("")
  const [editVolume, setEditVolume] = useState("1000")
  const [savingEdit, setSavingEdit] = useState(false)

  // Action states
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchKeywords = useCallback(async () => {
    if (!merchantId) return
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/admin/gbp/keywords?merchantId=${merchantId}`)
      const data = await res.json()
      if (data.ok) {
        setKeywords(data.keywords || [])
      } else {
        setError(data.error || "Failed to load keywords")
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch keywords")
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    if (open && merchantId) {
      fetchKeywords()
    }
  }, [open, merchantId, fetchKeywords])

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyword.trim()) return

    try {
      setAddingKeyword(true)
      const res = await fetch("/api/admin/gbp/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          keyword: newKeyword.trim(),
          keywordType: newType,
          targetLocality: newLocality.trim(),
          searchVolume: parseInt(newVolume) || 500,
          baselineRank: parseInt(newBaselineRank) || 10,
          serpFeature: newType === "GEO" ? "LOCAL_3PACK" : newType === "AEO" ? "AI_OVERVIEW" : "ORGANIC",
        }),
      })

      const data = await res.json()
      if (data.ok) {
        setNewKeyword("")
        setNewLocality("")
        setShowAddForm(false)
        await fetchKeywords()
        if (onKeywordsUpdated) onKeywordsUpdated()
      } else {
        alert(data.error || "Failed to add keyword")
      }
    } catch (err: any) {
      alert(err.message || "Network error")
    } finally {
      setAddingKeyword(false)
    }
  }

  const handleStartEdit = (kw: TrackedKeyword) => {
    setEditingId(kw.id)
    setEditKeyword(kw.keyword)
    setEditType((kw.keywordType as any) || "GEO")
    setEditLocality(kw.targetLocality || "")
    setEditVolume(String(kw.searchVolume || 500))
  }

  const handleSaveEdit = async (id: string) => {
    try {
      setSavingEdit(true)
      const res = await fetch("/api/admin/gbp/keywords", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          keyword: editKeyword.trim(),
          keywordType: editType,
          targetLocality: editLocality.trim(),
          searchVolume: parseInt(editVolume) || 0,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        setEditingId(null)
        await fetchKeywords()
        if (onKeywordsUpdated) onKeywordsUpdated()
      } else {
        alert(data.error || "Failed to update keyword")
      }
    } catch (err: any) {
      alert(err.message || "Network error")
    } finally {
      setSavingEdit(false)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/gbp/keywords", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          isActive: !currentActive,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        await fetchKeywords()
        if (onKeywordsUpdated) onKeywordsUpdated()
      }
    } catch (err: any) {
      console.error("Toggle error", err)
    }
  }

  const handleDeleteKeyword = async (id: string, keywordName: string) => {
    if (!confirm(`Are you sure you want to delete keyword "${keywordName}"?`)) return

    try {
      setDeletingId(id)
      const res = await fetch(`/api/admin/gbp/keywords?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.ok) {
        await fetchKeywords()
        if (onKeywordsUpdated) onKeywordsUpdated()
      } else {
        alert(data.error || "Failed to delete keyword")
      }
    } catch (err: any) {
      alert(err.message || "Network error")
    } finally {
      setDeletingId(null)
    }
  }

  // Filtered list
  const filteredKeywords = keywords.filter((kw) => {
    const matchesTab = activeTab === "ALL" || kw.keywordType === activeTab
    const matchesSearch =
      kw.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (kw.targetLocality && kw.targetLocality.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTab && matchesSearch
  })

  const geoCount = keywords.filter((k) => k.keywordType === "GEO").length
  const seoCount = keywords.filter((k) => k.keywordType === "SEO").length
  const aeoCount = keywords.filter((k) => k.keywordType === "AEO").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 border border-slate-200 p-6 shadow-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  Manage Tracked Keywords
                  <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-xs">
                    {keywords.length} Active Keywords
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Target Store: <span className="font-semibold text-slate-800">{merchantName}</span> (ID: {merchantId})
                </DialogDescription>
              </div>
            </div>

            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm gap-1.5"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddForm ? "Cancel" : "Add Keyword"}
            </Button>
          </div>
        </DialogHeader>

        {/* Add Keyword Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddKeyword}
            className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                Add New Priority Search Term
              </span>
              <span className="text-[11px] text-slate-500">Auto-scanned daily at 09:00 AM IST</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              <div className="md:col-span-6">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Target Keyword Query *
                </label>
                <Input
                  placeholder="e.g. customized birthday cake shop in manjalpur"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 text-xs h-9"
                  required
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Category Type *
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md text-xs h-9 px-2 text-slate-900 font-medium focus:ring-1 focus:ring-blue-500"
                >
                  <option value="GEO">GEO (Hyper-Local / Landmarks)</option>
                  <option value="SEO">SEO (Core Transactional Search)</option>
                  <option value="AEO">AEO (AI / Voice Search Prompts)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Locality / Landmark
                </label>
                <Input
                  placeholder="e.g. Manjalpur, Eva Mall"
                  value={newLocality}
                  onChange={(e) => setNewLocality(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 text-xs h-9"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Estimated Monthly Searches
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1500"
                  value={newVolume}
                  onChange={(e) => setNewVolume(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 text-xs h-9"
                />
              </div>

              <div className="md:col-span-4">
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Baseline Day 0 Rank
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 12"
                  value={newBaselineRank}
                  onChange={(e) => setNewBaselineRank(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 text-xs h-9"
                />
              </div>

              <div className="md:col-span-4 flex items-end">
                <Button
                  type="submit"
                  disabled={addingKeyword}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-9 text-xs shadow-sm"
                >
                  {addingKeyword ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Check className="w-3.5 h-3.5 mr-1.5" />}
                  Save to 09:00 AM Scan
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Filter bar & stats */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({keywords.length})
            </button>
            <button
              onClick={() => setActiveTab("GEO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "GEO"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              <MapPin className="w-3 h-3" />
              GEO ({geoCount})
            </button>
            <button
              onClick={() => setActiveTab("SEO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "SEO"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              SEO ({seoCount})
            </button>
            <button
              onClick={() => setActiveTab("AEO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "AEO"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              AEO ({aeoCount})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search keyword or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        {/* Keyword list table */}
        <div className="mt-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">Loading tracked keywords from database...</span>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-600 text-xs">
              Error: {error}
              <Button onClick={fetchKeywords} variant="outline" size="sm" className="mt-2 text-xs">
                Retry
              </Button>
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs border border-dashed rounded-xl">
              No keywords found matching your filter. Click "Add Keyword" to track a new search term.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Keyword Query</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Locality</th>
                    <th className="py-2.5 px-2 text-right">Search Volume</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKeywords.map((kw) => {
                    const isEditing = editingId === kw.id

                    if (isEditing) {
                      return (
                        <tr key={kw.id} className="bg-amber-50/50">
                          <td className="py-2 px-3">
                            <Input
                              value={editKeyword}
                              onChange={(e) => setEditKeyword(e.target.value)}
                              className="h-7 text-xs bg-white border-amber-300"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={editType}
                              onChange={(e) => setEditType(e.target.value as any)}
                              className="bg-white border border-amber-300 rounded text-[11px] h-7 px-1.5"
                            >
                              <option value="GEO">GEO</option>
                              <option value="SEO">SEO</option>
                              <option value="AEO">AEO</option>
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              value={editLocality}
                              onChange={(e) => setEditLocality(e.target.value)}
                              className="h-7 text-xs bg-white border-amber-300"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <Input
                              type="number"
                              value={editVolume}
                              onChange={(e) => setEditVolume(e.target.value)}
                              className="h-7 text-xs bg-white border-amber-300 text-right w-20 ml-auto"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="text-[11px] text-slate-400">Editing</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(kw.id)}
                                disabled={savingEdit}
                                className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]"
                              >
                                {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                                className="h-7 px-2 text-[11px]"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={kw.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {kw.keyword}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              kw.keywordType === "GEO"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : kw.keywordType === "SEO"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {kw.keywordType}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 text-[11px]">
                          {kw.targetLocality || "City-wide"}
                        </td>
                        <td className="py-2.5 px-2 text-right font-medium text-slate-700">
                          {kw.searchVolume.toLocaleString()}/mo
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleToggleActive(kw.id, kw.isActive)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                              kw.isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            {kw.isActive ? "Active" : "Paused"}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(kw)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit keyword"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteKeyword(kw.id, kw.keyword)}
                              disabled={deletingId === kw.id}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete keyword"
                            >
                              {deletingId === kw.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            💡 Changes saved here take effect immediately in the next <strong>09:00 AM IST</strong> automated crawl and on-demand scans.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchKeywords}
            disabled={loading}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
