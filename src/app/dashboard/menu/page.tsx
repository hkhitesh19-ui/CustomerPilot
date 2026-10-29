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
  AlertCircle
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

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </button>
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
    </div>
  )
}
