"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Bike, 
  Plus, 
  Minus, 
  X, 
  Check, 
  ChevronRight, 
  Sparkles,
  ArrowLeft,
  Store
} from "lucide-react"

export interface MenuItemData {
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

export interface MerchantMenuData {
  id: string
  name: string
  whatsappPhone: string | null
  logoUrl: string | null
  address?: string | null
  city?: string | null
  businessTiming?: string | null
  rating?: number
  reviewsCount?: number
  slug?: string
}

interface CartItem {
  item: MenuItemData
  quantity: number
  notes?: string
}

export function MenuView({
  merchant,
  initialCategories,
}: {
  merchant: MerchantMenuData
  initialCategories: { name: string; items: MenuItemData[] }[]
}) {
  const [categories, setCategories] = useState(initialCategories)
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategories[0]?.name || ""
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [vegOnly, setVegOnly] = useState(false)
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  // Checkout Details
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [orderNotes, setOrderNotes] = useState("")
  const [orderSuccess, setOrderSuccess] = useState(false)

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Flattened items for easy lookup
  const allItems = useMemo(() => {
    return categories.flatMap(c => c.items)
  }, [categories])

  // Filtered categories & items
  const filteredCategories = useMemo(() => {
    return categories
      .map(cat => {
        const filteredItems = cat.items.filter(item => {
          if (vegOnly && !item.isVeg) return false
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            const matchName = item.name.toLowerCase().includes(q)
            const matchDesc = item.description?.toLowerCase().includes(q) || false
            const matchCat = item.category.toLowerCase().includes(q)
            if (!matchName && !matchDesc && !matchCat) return false
          }
          return true
        })
        return {
          ...cat,
          items: filteredItems,
        }
      })
      .filter(cat => cat.items.length > 0)
  }, [categories, searchQuery, vegOnly])

  // Cart totals
  const cartList = useMemo(() => Object.values(cart), [cart])
  const totalItemCount = useMemo(() => {
    return cartList.reduce((acc, curr) => acc + curr.quantity, 0)
  }, [cartList])

  const itemTotalAmount = useMemo(() => {
    return cartList.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0)
  }, [cartList])

  const packagingCharges = itemTotalAmount > 0 ? (itemTotalAmount > 500 ? 0 : 25) : 0
  const grandTotal = itemTotalAmount + packagingCharges

  // Add to cart helper
  const updateQuantity = (item: MenuItemData, delta: number) => {
    setCart(prev => {
      const existing = prev[item.id]
      const currentQty = existing ? existing.quantity : 0
      const newQty = currentQty + delta

      if (newQty <= 0) {
        const copy = { ...prev }
        delete copy[item.id]
        return copy
      }

      return {
        ...prev,
        [item.id]: {
          item,
          quantity: newQty,
          notes: existing?.notes,
        },
      }
    })
  }

  const scrollToCategory = (catName: string) => {
    setActiveCategory(catName)
    const el = categoryRefs.current[catName]
    if (el) {
      const yOffset = -120 // Header & sticky bar offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  // Generate WhatsApp order message & open wa.me
  const handlePlaceWhatsAppOrder = () => {
    if (!merchant.whatsappPhone) {
      alert("Store WhatsApp number not configured!")
      return
    }

    if (cartList.length === 0) return

    const itemsFormatted = cartList
      .map(
        (ci, idx) =>
          `${idx + 1}. ${ci.item.name} x${ci.quantity} (₹${ci.item.price * ci.quantity})`
      )
      .join("\n")

    const rawPhone = merchant.whatsappPhone.replace(/[^0-9]/g, "")
    const cleanPhone = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`

    const message =
      `🛒 *NEW ORDER*\n\n` +
      `Hi ${merchant.name}! I want to place an order:\n\n` +
      `${itemsFormatted}\n\n` +
      `📦 Type: ${deliveryType === "delivery" ? "Home Delivery" : "Self Pickup"}\n` +
      (deliveryType === "delivery" && deliveryAddress.trim()
        ? `📍 Address: ${deliveryAddress.trim()}\n`
        : "") +
      `💰 Total: ₹${grandTotal}\n` +
      (customerName.trim() ? `👤 Name: ${customerName.trim()}\n` : "") +
      (orderNotes.trim() ? `📝 Note: ${orderNotes.trim()}\n` : "") +
      `\n#ORDER`

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    
    setOrderSuccess(true)
    setTimeout(() => {
      window.location.href = waUrl
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-32">
      {/* ── TOP HEADER / RESTAURANT PROFILE (Zomato-Style) ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {merchant.slug && (
              <a
                href={`/c/${merchant.slug}`}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </a>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
                  {merchant.name}
                </h1>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Open
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-500" />
                {merchant.address || merchant.city || "Vadodara"}
                {merchant.rating && (
                  <span className="ml-2 inline-flex items-center gap-0.5 font-bold text-amber-500 text-[11px]">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {merchant.rating}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="font-extrabold text-xs bg-white text-emerald-800 rounded-full px-1.5 py-0.2">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar + Veg Toggle */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${merchant.name}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 border-none placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setVegOnly(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition shrink-0 ${
              vegOnly
                ? "bg-emerald-500 text-white border-emerald-600 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full border border-emerald-600 flex items-center justify-center bg-white p-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            </span>
            Veg Only
          </button>
        </div>

        {/* ── STICKY CATEGORY NAV TABS ── */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-x-auto no-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 flex gap-2 py-2">
            {categories.map(cat => {
              const isActive = activeCategory === cat.name
              return (
                <button
                  key={cat.name}
                  onClick={() => scrollToCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {cat.name} ({cat.items.length})
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── RESTAURANT MENU ITEMS LIST (Zomato-Style Cards) ── */}
      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-base">No items found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or search term</p>
          </div>
        ) : (
          filteredCategories.map(cat => (
            <div
              key={cat.name}
              ref={el => { categoryRefs.current[cat.name] = el }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  {cat.name}
                  <span className="text-xs font-normal text-slate-400">({cat.items.length})</span>
                </h2>
              </div>

              <div className="grid gap-4">
                {cat.items.map(item => {
                  const qty = cart[item.id]?.quantity || 0
                  const tagsArray: string[] = item.tags ? JSON.parse(item.tags) : []

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition flex gap-3 sm:gap-4 items-start"
                    >
                      {/* Left Item Details */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          {/* Veg/Non-veg mark */}
                          <span
                            className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center p-0.5 ${
                              item.isVeg
                                ? "border-emerald-600 bg-white"
                                : "border-rose-600 bg-white"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.isVeg ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                          </span>

                          {tagsArray.map(tag => (
                            <span
                              key={tag}
                              className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
                          {item.name}
                        </h3>

                        <div className="flex items-baseline gap-2">
                          <span className="font-extrabold text-base text-slate-900 dark:text-white">
                            ₹{item.price}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{item.originalPrice}
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Right Item Image + Add Button */}
                      <div className="relative shrink-0 flex flex-col items-center">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl">🍰</span>
                          )}
                        </div>

                        {/* Add / Quantity Counter Button */}
                        <div className="absolute -bottom-2">
                          {qty === 0 ? (
                            <button
                              onClick={() => updateQuantity(item, 1)}
                              className="px-5 py-1.5 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 rounded-xl font-extrabold text-xs shadow-md hover:bg-emerald-50 dark:hover:bg-slate-700 active:scale-95 transition"
                            >
                              ADD +
                            </button>
                          ) : (
                            <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-md border border-emerald-500 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item, -1)}
                                className="px-2.5 py-1.5 hover:bg-emerald-700 active:scale-95 transition"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 font-black text-xs">{qty}</span>
                              <button
                                onClick={() => updateQuantity(item, 1)}
                                className="px-2.5 py-1.5 hover:bg-emerald-700 active:scale-95 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </main>

      {/* ── STICKY BOTTOM CART FLOATING BAR (Zomato-Style) ── */}
      {totalItemCount > 0 && !isCartOpen && (
        <aside aria-label="Order summary floating bar" className="fixed bottom-4 left-4 right-4 z-40 max-w-3xl mx-auto">
          <div className="bg-emerald-600 text-white rounded-2xl p-3.5 px-5 shadow-2xl flex items-center justify-between border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-emerald-100 uppercase tracking-wider">
                {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"} in Cart
              </span>
              <span className="font-extrabold text-lg leading-tight">
                ₹{grandTotal} <span className="text-xs font-normal text-emerald-200">(plus taxes/charges)</span>
              </span>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-white text-emerald-800 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-95 hover:bg-emerald-50 transition"
            >
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* ── SLIDE-UP CART & CHECKOUT DRAWER / MODAL ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end flex-col sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Your Order · {merchant.name}
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Cart Items List */}
              <div className="space-y-3">
                {cartList.map(ci => (
                  <div
                    key={ci.item.id}
                    className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {ci.item.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        ₹{ci.item.price} each
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(ci.item, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{ci.quantity}</span>
                        <button
                          onClick={() => updateQuantity(ci.item, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm w-14 text-right">
                        ₹{ci.item.price * ci.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Type (Pickup vs Delivery) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Select Order Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("pickup")}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                      deliveryType === "pickup"
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    Self Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType("delivery")}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                      deliveryType === "delivery"
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    Home Delivery
                  </button>
                </div>
              </div>

              {/* Delivery Address (if Delivery) */}
              {deliveryType === "delivery" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Delivery Address *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter complete house no, building, landmark..."
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Cooking / Packing Instructions */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Special Notes / Message on Cake
                </label>
                <input
                  type="text"
                  placeholder="e.g. Write 'Happy Birthday Rahul', Less sugar..."
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Bill Details */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Item Total</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{itemTotalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Packing & Container Charges</span>
                  <span>{packagingCharges === 0 ? "FREE" : `₹${packagingCharges}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer / WhatsApp Place Order Button */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                onClick={handlePlaceWhatsAppOrder}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition"
              >
                <span>🟢 Place Order via WhatsApp (₹{grandTotal})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Tapping this will open WhatsApp with your formatted order ready to send.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
