"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Check, 
  X, 
  Store, 
  Image as ImageIcon,
  AlertCircle,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText
} from "lucide-react"

interface MenuItem {
  id: string
  merchantId: string
  category: string
  name: string
  description: string | null
  price: number
  originalPrice: number | null
  imageUrl: string | null
  isVeg: boolean
  isAvailable: boolean
  sortOrder: number
  tags: string | null
}

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("ALL")
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  
  // Form fields
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    imageUrl: "",
    isVeg: true,
    isAvailable: true,
    tags: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkPreview, setBulkPreview] = useState<{
    totalRows: number
    validCount: number
    invalidCount: number
    preview: any[]
    validItems: any[]
    invalidRows: any[]
  } | null>(null)
  const [bulkMode, setBulkMode] = useState<"append" | "replace">("append")
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null)

  // Photo-to-Menu AI Ingestion State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoPreviewItems, setPhotoPreviewItems] = useState<any[]>([])
  const [photoMode, setPhotoMode] = useState<"append" | "replace">("append")
  const [photoImporting, setPhotoImporting] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState<string | null>(null)

  const resetPhotoModal = () => {
    setPhotoFile(null)
    setPhotoLoading(false)
    setPhotoPreviewItems([])
    setPhotoMode("append")
    setPhotoImporting(false)
    setPhotoError(null)
    setPhotoSuccessMsg(null)
  }

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoLoading(true)
    setPhotoError(null)
    setPhotoSuccessMsg(null)
    setPhotoPreviewItems([])

    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/menu/extract-from-image", {
        method: "POST",
        body: fd
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to scan menu image")
      if (data.data?.items) {
        setPhotoPreviewItems(data.data.items)
      } else {
        throw new Error("No items detected in this menu photo")
      }
    } catch (err: any) {
      setPhotoError(err.message || "Failed to parse menu card")
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleCommitPhotoItems = async () => {
    if (photoPreviewItems.length === 0) return
    setPhotoImporting(true)
    setPhotoError(null)

    try {
      const res = await fetch("/api/menu/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: photoPreviewItems,
          mode: photoMode
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to import items")
      setPhotoSuccessMsg(`Successfully imported ${data.data?.importedCount || photoPreviewItems.length} items to your live menu!`)
      fetchItems()
      setTimeout(() => {
        setIsPhotoModalOpen(false)
        resetPhotoModal()
      }, 1800)
    } catch (err: any) {
      setPhotoError(err.message || "Failed to save items to menu")
    } finally {
      setPhotoImporting(false)
    }
  }

  const resetBulkModal = () => {
    setBulkFile(null)
    setBulkLoading(false)
    setBulkPreview(null)
    setBulkMode("append")
    setBulkImporting(false)
    setBulkError(null)
    setBulkSuccessMsg(null)
  }

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkFile(file)
    setBulkLoading(true)
    setBulkError(null)
    setBulkSuccessMsg(null)
    setBulkPreview(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/menu/bulk-preview", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to preview file")
      }

      setBulkPreview(data.data)
    } catch (err: any) {
      setBulkError(err.message || "Failed to parse file")
    } finally {
      setBulkLoading(false)
    }
  }

  const handleExecuteBulkImport = async () => {
    if (!bulkPreview || !bulkPreview.validItems || bulkPreview.validItems.length === 0) {
      setBulkError("No valid items to import.")
      return
    }

    setBulkImporting(true)
    setBulkError(null)

    try {
      const res = await fetch("/api/menu/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: bulkPreview.validItems,
          mode: bulkMode,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to import items")
      }

      setBulkSuccessMsg(`Successfully imported ${data.data.importedCount} items (${bulkMode === "replace" ? "Replaced existing menu" : "Added to menu"})! 🎉`)
      await fetchItems()

      setTimeout(() => {
        setIsBulkModalOpen(false)
        resetBulkModal()
      }, 1500)
    } catch (err: any) {
      setBulkError(err.message || "Failed to complete bulk import")
    } finally {
      setBulkImporting(false)
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/menu/items")
      const json = await res.json()
      if (res.ok && json.data?.items) {
        setItems(json.data.items)
      } else {
        setError(json.error || "Failed to load menu items")
      }
    } catch (e: any) {
      setError(e.message || "Failed to load menu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const categories = Array.from(new Set(items.map(i => i.category))).filter(Boolean)

  const filteredItems = items.filter(item => {
    if (activeCategory === "ALL") return true
    return item.category === activeCategory
  })

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      category: categories[0] || "Cakes",
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      imageUrl: "",
      isVeg: true,
      isAvailable: true,
      tags: "",
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item)
    const tagsArr = item.tags ? JSON.parse(item.tags) : []
    setFormData({
      category: item.category,
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      originalPrice: item.originalPrice ? item.originalPrice.toString() : "",
      imageUrl: item.imageUrl || "",
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      tags: tagsArr.join(", "),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const tagsArray = formData.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)

    const payload = {
      id: editingItem?.id,
      category: formData.category,
      name: formData.name,
      description: formData.description || null,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      imageUrl: formData.imageUrl || null,
      isVeg: formData.isVeg,
      isAvailable: formData.isAvailable,
      tags: tagsArray.length > 0 ? tagsArray : null,
    }

    try {
      const url = "/api/menu/items"
      const method = editingItem ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok) {
        setIsModalOpen(false)
        fetchItems()
      } else {
        setError(json.error || "Failed to save item")
      }
    } catch (e: any) {
      setError(e.message || "Failed to save item")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch("/api/menu/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isAvailable: !item.isAvailable,
        }),
      })
      if (res.ok) {
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return
    try {
      const res = await fetch(`/api/menu/items?id=${item.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchItems()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>🍽️</span> Online Menu Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your Zomato-style digital menu, prices, stock availability, and WhatsApp order items.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => { resetPhotoModal(); setIsPhotoModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Photo-to-Menu (AI Ingest)</span>
          </button>

          <button
            onClick={() => { resetBulkModal(); setIsBulkModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Bulk Import (Excel / CSV)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Item</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
            activeCategory === "ALL"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          All Items ({items.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              activeCategory === cat
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {cat} ({items.filter(i => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* Items Table / Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">Loading menu items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <Store className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No menu items found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click &quot;Add Menu Item&quot; to add cakes, pastries, or treats to your online ordering menu.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => {
            const tagsArr = item.tags ? JSON.parse(item.tags) : []
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900/70 shadow-xs flex flex-col justify-between ${
                  item.isAvailable
                    ? "border-slate-200 dark:border-slate-800 hover:border-emerald-500/40"
                    : "border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900/30"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🍰</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`w-3 h-3 rounded-xs border flex items-center justify-center p-0.5 ${
                            item.isVeg ? "border-emerald-600 bg-white" : "border-rose-600 bg-white"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h4>

                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ₹{item.price}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {tagsArr.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tagsArr.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                      item.isAvailable
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.isAvailable ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {item.isAvailable ? "In Stock" : "Sold Out"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cakes, Pastries"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Belgian Truffle Cake"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 649"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 750 (optional strikethrough)"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 100% Eggless rich Belgian dark chocolate ganache cake..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Image URL</label>
                <input
                  type="url"
                  placeholder="https://... (or leave blank for food emoji icon)"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Highlight Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bestseller, 100% Eggless, Chef Special"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={e => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">100% Vegetarian 🟢</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">In Stock</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 transition"
                >
                  {submitting ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Bulk Excel / CSV Import Modal ─── */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      Bulk Excel / CSV Menu Importer
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      Up to 2,000 Items
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload your category-wise products with weight variations (500g, 1kg) and prices in 1-click.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Prompt Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Don&apos;t have an Excel file prepared yet?</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Download our ready-made template with pre-filled weight variations and price columns.
                </p>
              </div>
              <a
                href="/api/menu/template"
                download="CustomerPilot_Menu_Import_Template.csv"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold text-xs shadow-xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template (.csv)</span>
              </a>
            </div>

            {/* File Dropzone / Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Excel (.xlsx, .xls) or CSV File
              </label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-slate-50/50 dark:bg-slate-800/30">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleBulkFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {bulkFile ? (
                      <span className="text-emerald-600 font-bold">{bulkFile.name}</span>
                    ) : (
                      <span>Drag &amp; drop your file here, or <strong className="text-emerald-600 underline">browse</strong></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Supports .xlsx (Excel), .xls, and .csv files up to 2,000 items
                  </p>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {bulkLoading && (
              <div className="p-6 text-center space-y-2 animate-pulse">
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Validating columns, categories, and price variations...</p>
              </div>
            )}

            {/* Error Message */}
            {bulkError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{bulkError}</span>
              </div>
            )}

            {/* Success Message */}
            {bulkSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            {/* Live Preview Table */}
            {bulkPreview && !bulkLoading && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {bulkPreview.validCount} Valid Items Detected
                    </span>
                    {bulkPreview.invalidCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        {bulkPreview.invalidCount} Skipped (Missing Name/Price)
                      </span>
                    )}
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="bulkMode"
                        value="append"
                        checked={bulkMode === "append"}
                        onChange={() => setBulkMode("append")}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Append</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                      <input
                        type="radio"
                        name="bulkMode"
                        value="replace"
                        checked={bulkMode === "replace"}
                        onChange={() => setBulkMode("replace")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-rose-600 font-bold">Replace All</span>
                    </label>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-slate-800/80 p-2.5 px-3 border-b border-slate-200 dark:border-slate-800">
                    First {bulkPreview.preview.length} Rows Preview:
                  </div>
                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {bulkPreview.preview.map((p, idx) => (
                      <div key={idx} className="p-2.5 px-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-semibold text-slate-600 dark:text-slate-300">
                              {p.category}
                            </span>
                            <span>{p.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            ₹{p.price}
                          </span>
                          {p.originalPrice && (
                            <span className="text-[10px] text-slate-400 line-through ml-1.5">
                              ₹{p.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkImport}
                disabled={bulkLoading || bulkImporting || !bulkPreview || bulkPreview.validCount === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md disabled:opacity-50 active:scale-95 transition"
              >
                {bulkImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Importing Catalog...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Import ({bulkPreview?.validCount || 0} Items)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── PHOTO-TO-MENU AI INGESTION MODAL ── */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Photo-to-Menu AI Ingestion</span>
                    <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      Gemini Vision
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Snap or upload a photo of your physical printed menu card. AI extracts items, variations &amp; prices in seconds!
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsPhotoModalOpen(false); resetPhotoModal(); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-3xl p-6 sm:p-8 text-center bg-amber-50/40 dark:bg-amber-950/20 hover:border-amber-500 transition relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  disabled={photoLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                    {photoFile ? photoFile.name : "Tap to Snap Photo or Upload Menu Card Image"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Supports JPG, PNG, WEBP (Camera photos from smartphone supported)
                  </span>
                </div>
              </div>

              {/* Loading Indicator */}
              {photoLoading && (
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Scanning Menu Image with Gemini Vision AI... Extracting dishes, prices &amp; variations...
                  </span>
                </div>
              )}

              {/* Error Message */}
              {photoError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {/* Success Message */}
              {photoSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{photoSuccessMsg}</span>
                </div>
              )}

              {/* Extracted Items Preview */}
              {photoPreviewItems.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        AI Extracted {photoPreviewItems.length} Menu Items
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Review the extracted catalog. You can tweak names or prices anytime.
                      </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center gap-2 text-xs">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Import Mode:</label>
                      <select
                        value={photoMode}
                        onChange={(e) => setPhotoMode(e.target.value as "append" | "replace")}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                      >
                        <option value="append">Append (Add to Menu)</option>
                        <option value="replace">Replace All Existing</option>
                      </select>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0">
                        <tr>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Item Name</th>
                          <th className="p-2.5">Variation</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5">MRP</th>
                          <th className="p-2.5">Diet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {photoPreviewItems.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-bold text-slate-700 dark:text-slate-300">{it.category}</td>
                            <td className="p-2.5 font-extrabold text-slate-900 dark:text-white">{it.name}</td>
                            <td className="p-2.5 text-slate-500">{it.variation || "—"}</td>
                            <td className="p-2.5 font-black text-emerald-600 dark:text-emerald-400">₹{it.price}</td>
                            <td className="p-2.5 text-slate-400 line-through">{it.originalPrice ? `₹${it.originalPrice}` : "—"}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                it.isVeg
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              }`}>
                                {it.isVeg ? "Veg" : "Non-Veg"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {photoPreviewItems.length > 0 ? `${photoPreviewItems.length} items ready for instant activation` : "Waiting for menu card photo..."}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIsPhotoModalOpen(false); resetPhotoModal(); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommitPhotoItems}
                  disabled={photoPreviewItems.length === 0 || photoImporting}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
                >
                  {photoImporting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Menu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save All to Live Menu</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
