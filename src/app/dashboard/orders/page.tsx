"use client"

import { useState, useEffect, useRef } from "react"
import { 
  ShoppingBag, 
  Clock, 
  Bike, 
  Store, 
  CheckCircle2, 
  XCircle, 
  ChefHat, 
  Gift, 
  RotateCw, 
  Phone, 
  AlertCircle,
  X
} from "lucide-react"

interface OrderItem {
  id: string
  menuItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string | null
  menuItem: {
    name: string
    category: string
    isVeg: boolean
  }
}

interface Order {
  id: string
  orderNo: string
  customerName?: string | null
  customerPhone: string
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"
  deliveryType: string
  deliveryAddress?: string | null
  totalAmount: number
  notes?: string | null
  cancelReason?: string | null
  confirmedAt?: string | null
  createdAt: string
  items: OrderItem[]
}

export default function OrdersDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("ALL")
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [confirmModalOrder, setConfirmModalOrder] = useState<Order | null>(null)
  const [etaMinutes, setEtaMinutes] = useState(30)
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState("Kitchen currently at full capacity")

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch("/api/orders?take=100")
      const json = await res.json()
      if (res.ok && json.data?.orders) {
        setOrders(json.data.orders)
      }
    } catch (e) {
      console.error("[OrdersPage] Fetch error:", e)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 10000) // Poll every 10 seconds for live orders
    return () => clearInterval(interval)
  }, [])

  const pendingCount = orders.filter(o => o.status === "PENDING").length
  const confirmedCount = orders.filter(o => o.status === "CONFIRMED" || o.status === "PREPARING").length
  const readyCount = orders.filter(o => o.status === "READY").length

  const filteredOrders = orders.filter(o => {
    if (activeTab === "ALL") return true
    if (activeTab === "ACTIVE") return ["PENDING", "CONFIRMED", "PREPARING", "READY"].includes(o.status)
    return o.status === activeTab
  })

  // Action handlers
  const handleConfirmSubmit = async () => {
    if (!confirmModalOrder) return
    setActionLoadingId(confirmModalOrder.id)
    try {
      const res = await fetch(`/api/orders/${confirmModalOrder.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etaMinutes }),
      })
      if (res.ok) {
        setConfirmModalOrder(null)
        fetchOrders(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleCancelSubmit = async () => {
    if (!cancelModalOrder) return
    setActionLoadingId(cancelModalOrder.id)
    try {
      const res = await fetch(`/api/orders/${cancelModalOrder.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      })
      if (res.ok) {
        setCancelModalOrder(null)
        fetchOrders(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: "PREPARING" | "READY" | "DELIVERED") => {
    setActionLoadingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchOrders(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>📦</span> Live WhatsApp Orders
            </h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-rose-500 text-white text-xs font-black rounded-full animate-pulse shadow-md">
                {pendingCount} PENDING
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Incoming WhatsApp orders from your Zomato-style menu. Auto-refreshes every 10 seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <a
            href="/c/cake-connection"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
          >
            <span>View Public Menu</span>
          </a>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: "ALL", label: `All (${orders.length})` },
          { key: "PENDING", label: `⏳ Pending (${pendingCount})`, highlight: pendingCount > 0 },
          { key: "CONFIRMED", label: `✅ Confirmed (${confirmedCount})` },
          { key: "READY", label: `🎁 Ready (${readyCount})` },
          { key: "DELIVERED", label: `🎉 Delivered (${orders.filter(o => o.status === "DELIVERED").length})` },
          { key: "CANCELLED", label: `❌ Cancelled (${orders.filter(o => o.status === "CANCELLED").length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.key
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                : tab.highlight
                ? "bg-rose-500/10 text-rose-600 border border-rose-500/30 hover:bg-rose-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 animate-pulse">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No orders in this tab</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When customers place orders from your online menu on WhatsApp, they will appear here live.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map(order => {
            const isPending = order.status === "PENDING"
            const isConfirmed = order.status === "CONFIRMED"
            const isPreparing = order.status === "PREPARING"
            const isReady = order.status === "READY"
            const isDelivered = order.status === "DELIVERED"
            const isCancelled = order.status === "CANCELLED"

            const orderDate = new Date(order.createdAt)
            const timeAgoStr = orderDate.toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div
                key={order.id}
                className={`p-5 rounded-3xl border transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col justify-between relative shadow-sm ${
                  isPending
                    ? "border-rose-400 dark:border-rose-700/80 shadow-rose-500/5 ring-2 ring-rose-500/20"
                    : isReady
                    ? "border-emerald-400 dark:border-emerald-600/80 shadow-emerald-500/5"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Header: Order No + Status Badge */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                          #{order.orderNo}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {timeAgoStr}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">
                        {order.customerName || "Customer"}
                      </div>
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        +{order.customerPhone}
                      </a>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          isPending
                            ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                            : isConfirmed
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            : isPreparing
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : isReady
                            ? "bg-emerald-500 text-white border-emerald-600"
                            : isDelivered
                            ? "bg-slate-100 text-slate-600 border-slate-300"
                            : "bg-rose-100 text-rose-600 border-rose-300"
                        }`}
                      >
                        {order.status}
                      </span>

                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        {order.deliveryType === "delivery" ? (
                          <>
                            <Bike className="w-3 h-3 text-emerald-500" />
                            Delivery
                          </>
                        ) : (
                          <>
                            <Store className="w-3 h-3 text-amber-500" />
                            Pickup
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryType === "delivery" && order.deliveryAddress && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Address: </span>
                      {order.deliveryAddress}
                    </div>
                  )}

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                      <span className="font-bold">📝 Note: </span>
                      {order.notes}
                    </div>
                  )}

                  {/* Cancel Reason */}
                  {order.cancelReason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
                      <span className="font-bold">Reason: </span>
                      {order.cancelReason}
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.menuItem?.isVeg ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span className="font-semibold">{item.menuItem?.name || "Item"}</span>
                          <span className="text-slate-400 font-bold">×{item.quantity}</span>
                        </div>
                        <span className="font-mono font-bold">₹{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Total & Actions */}
                <div className="pt-3 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Total Amount</span>
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  {/* Action Buttons based on status */}
                  <div className="flex gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => setConfirmModalOrder(order)}
                          disabled={actionLoadingId === order.id}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                        <button
                          onClick={() => setCancelModalOrder(order)}
                          disabled={actionLoadingId === order.id}
                          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleStatusChange(order.id, "PREPARING")}
                        disabled={actionLoadingId === order.id}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        Mark Preparing
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleStatusChange(order.id, "READY")}
                        disabled={actionLoadingId === order.id}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Mark Ready (Notify WhatsApp)
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleStatusChange(order.id, "DELIVERED")}
                        disabled={actionLoadingId === order.id}
                        className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Delivered & Send Review Prompt
                      </button>
                    )}

                    {isDelivered && (
                      <div className="w-full text-center py-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 rounded-xl">
                        ✓ Completed & Reviewed
                      </div>
                    )}

                    {isCancelled && (
                      <div className="w-full text-center py-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 rounded-xl">
                        Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Confirm Order #{confirmModalOrder.orderNo}
            </h3>
            <p className="text-xs text-slate-500">
              Customer ({confirmModalOrder.customerName || confirmModalOrder.customerPhone}) will receive an automated WhatsApp confirmation message.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Estimated Time to Ready (Minutes):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setEtaMinutes(mins)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      etaMinutes === mins
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModalOrder(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={actionLoadingId === confirmModalOrder.id}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md"
              >
                Send WhatsApp Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Reject Order #{cancelModalOrder.orderNo}
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for Rejection:
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCancelSubmit}
                disabled={actionLoadingId === cancelModalOrder.id}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
