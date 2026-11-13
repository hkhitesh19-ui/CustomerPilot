"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Printer, Smartphone, Plus, Trash2, Search, CheckCircle2,
  RefreshCw, FileText, Send, Sparkles, AlertCircle, ShoppingBag, CreditCard, MessageCircle
} from "lucide-react"

interface LineItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export default function SmartBillingPage() {
  const { toast } = useToast()

  // POS State
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", name: "Special Chocolate Truffle Cake (1kg)", quantity: 1, unitPrice: 650, total: 650 }
  ])
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemQty, setNewItemQty] = useState("1")

  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD">("CASH")
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [gstRate, setGstRate] = useState<number>(5)
  const [creating, setCreating] = useState(false)

  // Invoices History
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const fetchInvoices = async () => {
    setLoadingInvoices(true)
    try {
      const res = await fetch("/api/invoices")
      const data = await res.json()
      if (data.success && data.invoices) {
        setInvoices(data.invoices)
      }
    } catch {
      console.warn("Failed to load invoice history")
    } finally {
      setLoadingInvoices(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  // Line item handlers
  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) {
      toast({ title: "Incomplete item", description: "Enter product name and price.", variant: "destructive" })
      return
    }
    const p = Math.max(0, parseFloat(newItemPrice) || 0)
    const q = Math.max(1, parseInt(newItemQty) || 1)
    const line: LineItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: q,
      unitPrice: p,
      total: p * q
    }
    setItems([...items, line])
    setNewItemName("")
    setNewItemPrice("")
    setNewItemQty("1")
  }

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      toast({ title: "Warning", description: "Bill must have at least 1 item." })
      return
    }
    setItems(items.filter((it) => it.id !== id))
  }

  // Calculation
  const subtotal = items.reduce((sum, it) => sum + it.total, 0)
  const taxable = Math.max(0, subtotal - discountAmount)
  const tax = (taxable * gstRate) / 100
  const grandTotal = Math.round(taxable + tax)

  // Dual Action: Print + WhatsApp
  const handleCreateAndPrint = async () => {
    if (items.length === 0) return
    setCreating(true)

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          paymentMode,
          items: items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice
          })),
          discountAmount,
          gstRate
        })
      })

      const data = await res.json()
      if (res.ok && data.invoice) {
        toast({
          title: `Invoice ${data.invoice.invoiceNumber} Generated!`,
          description: data.whatsappDelivered
            ? "Sent to customer's WhatsApp & ready to print."
            : "Invoice saved. Ready to print."
        })

        // Trigger physical print dialog
        window.print()

        // Reset form
        setCustomerName("")
        setCustomerPhone("")
        setDiscountAmount(0)
        fetchInvoices()
      } else {
        toast({ title: "Error", description: data.error || "Failed to generate bill", variant: "destructive" })
      }
    } catch {
      toast({ title: "Network error", description: "Failed to connect to billing server", variant: "destructive" })
    } finally {
      setCreating(false)
    }
  }

  const handleResendWhatsApp = async (invoiceId: string) => {
    setResendingId(invoiceId)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-whatsapp`, {
        method: "POST"
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({ title: "WhatsApp Sent!", description: "Invoice PDF delivered to customer's WhatsApp." })
        fetchInvoices()
      } else {
        toast({ title: "WhatsApp Error", description: data.error || "Failed to send WhatsApp message", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Network error during WhatsApp resend", variant: "destructive" })
    } finally {
      setResendingId(null)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <Printer className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Smart POS Billing &amp; WhatsApp Invoicing</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fast mobile billing, automatic GST calculation, 1-click thermal print &amp; instant WhatsApp PDF bill delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchInvoices} variant="outline" size="sm" className="rounded-xl gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Bills
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* POS Bill Creation Console */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Identification */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">1. Customer Identification</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">WhatsApp Mobile Number</Label>
                  <Input
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="rounded-xl border-slate-200 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-600">Customer Name (Optional)</Label>
                  <Input
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item List */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900">2. Purchased Items &amp; Products</CardTitle>
              <Badge variant="outline" className="text-xs">{items.length} Items</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Existing items table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Item Name</th>
                      <th className="p-2.5 w-16 text-center">Qty</th>
                      <th className="p-2.5 w-24 text-right">Rate</th>
                      <th className="p-2.5 w-24 text-right">Total</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium text-slate-800">{it.name}</td>
                        <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono">₹{it.unitPrice}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹{it.total}</td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemoveItem(it.id)}
                            className="text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add item row */}
              <div className="grid grid-cols-12 gap-2 pt-2">
                <div className="col-span-6 sm:col-span-7">
                  <Input
                    placeholder="Add item name / pastry..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs text-center font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Price ₹"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Button
                    onClick={handleAddItem}
                    size="sm"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total & Action Panel */}
        <div className="space-y-5">
          <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-900 p-4 text-white">
              <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                <span>Bill Summary</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  TAX INVOICE
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 text-right p-1 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>GST Rate</span>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="p-1 rounded-lg border border-slate-200 text-xs font-semibold"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (F&amp;B / Bakery)</option>
                    <option value={12}>12% (Goods)</option>
                    <option value={18}>18% (Standard)</option>
                  </select>
                </div>

                {gstRate > 0 && (
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>CGST + SGST ({gstRate}%)</span>
                    <span className="font-mono">₹{tax.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900">
                  <span className="font-bold text-sm">Grand Total</span>
                  <span className="font-extrabold text-xl text-emerald-700 font-mono">₹{grandTotal}</span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label className="text-xs font-semibold text-slate-600">Payment Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "UPI", "CARD"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode)}
                      className={`py-1.5 rounded-xl border text-xs font-bold transition ${
                        paymentMode === mode
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Action Print & WA Send Button */}
              <Button
                onClick={handleCreateAndPrint}
                disabled={creating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>{creating ? "Generating Invoice..." : "PRINT + WhatsApp Bill"}</span>
              </Button>

              <p className="text-[10px] text-center text-slate-400">
                Automatically triggers printer dialog &amp; delivers same PDF to customer&apos;s WhatsApp.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice History Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white mt-8">
        <CardHeader className="p-4 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Recent Invoices &amp; Delivery Status</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Real-time delivery receipts for bills dispatched to customer WhatsApp numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingInvoices ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No invoices generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Payment</th>
                    <th className="p-3 text-center">WhatsApp Delivery</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-3 text-slate-800">{inv.customerName || "Walk-in Guest"}</td>
                      <td className="p-3 font-mono text-slate-500">{inv.customerPhone || "—"}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">₹{inv.grandTotal}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {inv.paymentMode}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            inv.waStatus === "SENT" || inv.waStatus === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : inv.waStatus === "FAILED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {inv.waStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1.5 flex items-center justify-end">
                        {inv.customerPhone && (
                          <>
                            <a
                              href={`https://wa.me/91${inv.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`🧾 Official Tax Invoice from Cake Connection\nInvoice No: ${inv.invoiceNumber}\nAmount: ₹${inv.grandTotal}\nThank you for shopping with us! 🙏`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center h-7 px-2 text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition font-medium"
                              title="Open direct WhatsApp chat with customer"
                            >
                              <MessageCircle className="w-3 h-3 mr-1" /> Open WA
                            </a>
                            <Button
                              onClick={() => handleResendWhatsApp(inv.id)}
                              disabled={resendingId === inv.id}
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg"
                            >
                              <Send className="w-3 h-3 mr-1" /> Resend
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
