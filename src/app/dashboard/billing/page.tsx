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
  RefreshCw, FileText, Send, Sparkles, AlertCircle, ShoppingBag,
  CreditCard, MessageCircle, DollarSign, QrCode, Eye, Download, X,
  Clock, Check, Layers, Store, ArrowRight
} from "lucide-react"

interface LineItem {
  id: string
  name: string
  category?: string
  quantity: number
  unitPrice: number
  total: number
}

// Preset Catalogue for Instant 1-Tap POS Entry
const PRESET_CATALOG = [
  { name: "Special Chocolate Truffle Cake (1kg)", category: "Cakes", price: 650 },
  { name: "Black Forest Cake (500g)", category: "Cakes", price: 380 },
  { name: "Pineapple Delight Cake (500g)", category: "Cakes", price: 350 },
  { name: "Red Velvet Pastry", category: "Pastries", price: 90 },
  { name: "Dutch Truffle Pastry", category: "Pastries", price: 95 },
  { name: "Cold Coffee with Ice Cream", category: "Beverages", price: 120 },
  { name: "Chocolate Thick Shake", category: "Beverages", price: 140 },
  { name: "Birthday Candle & Knife Set", category: "Accessories", price: 50 },
]

export default function SmartBillingPage() {
  const { toast } = useToast()

  // POS State
  const [docType, setDocType] = useState<"GST_TAX_INVOICE" | "BILL_OF_SUPPLY" | "NON_GST_RECEIPT">("GST_TAX_INVOICE")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", name: "Special Chocolate Truffle Cake (1kg)", category: "Cakes", quantity: 1, unitPrice: 650, total: 650 }
  ])
  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemQty, setNewItemQty] = useState("1")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  // Payment State
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD" | "SPLIT">("CASH")
  const [amountReceived, setAmountReceived] = useState<string>("")
  const [upiUtrRef, setUpiUtrRef] = useState<string>("")
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [gstRate, setGstRate] = useState<number>(5)
  const [creating, setCreating] = useState(false)

  // Invoices History & Thermal Modal State
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [thermalModalOpen, setThermalModalOpen] = useState(false)
  const [activeThermalBill, setActiveThermalBill] = useState<any>(null)
  const [thermalWidth, setThermalWidth] = useState<"58mm" | "80mm">("58mm")

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
  const handleAddItem = (nameOverride?: string, priceOverride?: number) => {
    const nameToAdd = nameOverride || newItemName
    const priceToAdd = priceOverride !== undefined ? priceOverride : parseFloat(newItemPrice) || 0

    if (!nameToAdd.trim() || priceToAdd <= 0) {
      toast({ title: "Incomplete item", description: "Enter product name and valid price.", variant: "destructive" })
      return
    }

    const q = Math.max(1, parseInt(newItemQty) || 1)
    const line: LineItem = {
      id: Date.now().toString() + Math.random().toString().slice(2, 6),
      name: nameToAdd.trim(),
      quantity: q,
      unitPrice: priceToAdd,
      total: priceToAdd * q
    }
    setItems((prev) => [...prev, line])
    if (!nameOverride) {
      setNewItemName("")
      setNewItemPrice("")
      setNewItemQty("1")
    }
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
  const effectiveGstRate = docType === "NON_GST_RECEIPT" || docType === "BILL_OF_SUPPLY" ? 0 : gstRate
  const tax = (taxable * effectiveGstRate) / 100
  const grandTotal = Math.round(taxable + tax)

  // Cash Change Calculation
  const cashNum = parseFloat(amountReceived) || 0
  const changeToReturn = Math.max(0, cashNum - grandTotal)
  const balanceDue = Math.max(0, grandTotal - cashNum)

  // Dual Action: Print + WhatsApp
  const handleCreateAndFinalize = async (triggerWhatsApp = true) => {
    if (items.length === 0) return
    setCreating(true)

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: docType,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          paymentMode,
          items: items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice
          })),
          discountAmount,
          gstRate: effectiveGstRate,
          notes: upiUtrRef ? `UPI UTR: ${upiUtrRef}` : undefined
        })
      })

      const data = await res.json()
      if (data.success && data.invoice) {
        toast({
          title: "Bill Created Successfully! 🧾",
          description: `Invoice #${data.invoice.invoiceNumber} generated.`
        })

        // Set active for thermal preview
        setActiveThermalBill({
          ...data.invoice,
          items,
          customerName: customerName || "Valued Customer",
          customerPhone,
          grandTotal,
          subtotal,
          tax,
          changeToReturn,
          amountReceived: cashNum
        })

        // Reset form
        setItems([{ id: "1", name: "Special Chocolate Truffle Cake (1kg)", quantity: 1, unitPrice: 650, total: 650 }])
        setCustomerName("")
        setCustomerPhone("")
        setAmountReceived("")
        setUpiUtrRef("")
        fetchInvoices()

        // Open thermal modal automatically
        setThermalModalOpen(true)
      } else {
        toast({
          title: "Billing Error",
          description: data.error || "Failed to finalize invoice.",
          variant: "destructive"
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not create invoice. Check server.",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  // Resend WhatsApp Bill
  const handleResendWhatsApp = async (invoiceId: string) => {
    setResendingId(invoiceId)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-whatsapp`, {
        method: "POST"
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "WhatsApp Sent! 📲", description: "Official PDF bill delivered to customer." })
        fetchInvoices()
      } else {
        toast({ title: "Delivery Error", description: data.error || "WhatsApp sending failed", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to resend WhatsApp bill", variant: "destructive" })
    } finally {
      setResendingId(null)
    }
  }

  const filteredPresets = selectedCategory === "All"
    ? PRESET_CATALOG
    : PRESET_CATALOG.filter((p) => p.category === selectedCategory)

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-800">
              <Printer className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Smart POS Billing &amp; WhatsApp Invoicing</h1>
            <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-2.5 py-0.5">
              Standalone Service • ₹599/mo (₹4,999/yr)
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Mobile-first POS billing engine with <strong>GST Tax Invoice</strong>, <strong>Bill of Supply</strong>, and <strong>Non-GST Sales Receipt</strong> support.
            Instant thermal printing (58mm/80mm), cash change calculation, and automated WhatsApp PDF bill delivery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchInvoices} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Bills
          </Button>
        </div>
      </div>

      {/* 2. Document Type Selector (PRD Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => { setDocType("GST_TAX_INVOICE"); setGstRate(5); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            docType === "GST_TAX_INVOICE"
              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">1. Regular GST Tax Invoice</span>
            {docType === "GST_TAX_INVOICE" && <Badge className="bg-indigo-600 text-white text-[9px]">ACTIVE</Badge>}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Official Tax Invoice with GSTIN, CGST+SGST / IGST breakup &amp; taxable amount.
          </p>
        </button>

        <button
          type="button"
          onClick={() => { setDocType("BILL_OF_SUPPLY"); setGstRate(0); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            docType === "BILL_OF_SUPPLY"
              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">2. Bill of Supply</span>
            {docType === "BILL_OF_SUPPLY" && <Badge className="bg-indigo-600 text-white text-[9px]">ACTIVE</Badge>}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Composition Scheme registered dealers. No separate tax collection.
          </p>
        </button>

        <button
          type="button"
          onClick={() => { setDocType("NON_GST_RECEIPT"); setGstRate(0); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            docType === "NON_GST_RECEIPT"
              ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">3. Non-GST Sales Receipt</span>
            {docType === "NON_GST_RECEIPT" && <Badge className="bg-indigo-600 text-white text-[9px]">ACTIVE</Badge>}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            For unregistered merchants. Pure sales receipt without fictitious GSTIN.
          </p>
        </button>
      </div>

      {/* 3. Main Console: Left POS Cart (8 cols) + Right Payment & Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer + Quick Presets + Items (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Customer Identification */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900">1. Customer Identification</CardTitle>
              <span className="text-[11px] text-slate-400">Optional for Walk-ins</span>
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
                  <Label className="text-xs font-semibold text-slate-600">Customer Name</Label>
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

          {/* Quick Catalogue Presets (1-Tap Add) */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold text-slate-900">2. Quick Item Presets (1-Tap Add)</CardTitle>
                <CardDescription className="text-[11px] text-slate-500">Tap any product to add immediately to current bill.</CardDescription>
              </div>
              {/* Category pills */}
              <div className="flex items-center gap-1">
                {["All", "Cakes", "Pastries", "Beverages"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleAddItem(preset.name, preset.price)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition flex flex-col justify-between"
                  >
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-2">{preset.name}</span>
                    <span className="text-xs font-extrabold text-indigo-700 mt-2">₹{preset.price}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cart Line Items */}
          <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900">3. Current Bill Items</CardTitle>
              <Badge variant="outline" className="text-xs">{items.length} Items</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Table */}
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

              {/* Add custom item form */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
                <Input
                  placeholder="Add custom item name / pastry..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="rounded-xl border-slate-200 text-xs flex-1"
                />
                <Input
                  placeholder="Qty"
                  type="number"
                  min="1"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                  className="rounded-xl border-slate-200 font-mono text-xs w-20 text-center"
                />
                <Input
                  placeholder="₹ Price"
                  type="number"
                  min="0"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="rounded-xl border-slate-200 font-mono text-xs w-24 text-right"
                />
                <Button onClick={() => handleAddItem()} size="sm" variant="outline" className="rounded-xl gap-1 shrink-0">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bill Summary + Cash Change + Finalize (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Bill Summary Card */}
          <Card className="border-slate-200 shadow-md rounded-2xl bg-white overflow-hidden">
            <CardHeader className="p-4 bg-slate-900 text-white flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-white">Bill Summary</CardTitle>
                <div className="text-[10px] text-slate-300">
                  {docType === "GST_TAX_INVOICE" ? "TAX INVOICE" : docType === "BILL_OF_SUPPLY" ? "BILL OF SUPPLY" : "SALES RECEIPT"}
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                ₹{grandTotal}
              </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-800">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Discount (₹)</span>
                  <Input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discountAmount || ""}
                    onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-20 text-right h-7 rounded-lg text-xs font-mono border-slate-200"
                  />
                </div>

                {/* Tax Rate (Only for GST Tax Invoice) */}
                {docType === "GST_TAX_INVOICE" && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">GST Rate</span>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                      className="border border-slate-200 rounded-lg text-xs p-1 font-mono bg-white"
                    >
                      <option value="0">0% (Nil)</option>
                      <option value="5">5% (2.5% CGST + 2.5% SGST)</option>
                      <option value="12">12% (6% CGST + 6% SGST)</option>
                      <option value="18">18% (9% CGST + 9% SGST)</option>
                    </select>
                  </div>
                )}

                {docType === "GST_TAX_INVOICE" && effectiveGstRate > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>GST ({effectiveGstRate}%)</span>
                    <span className="font-mono text-slate-800">₹{tax.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="font-mono text-xl text-emerald-600">₹{grandTotal}</span>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-700">Payment Mode</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["CASH", "UPI", "CARD", "SPLIT"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 text-[11px] font-bold rounded-xl border transition ${
                        paymentMode === mode
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Change Workflow (PRD Section 11) */}
              {paymentMode === "CASH" && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-amber-900">Amount Received from Customer</Label>
                    <span className="text-[10px] text-amber-700">Cash Counter</span>
                  </div>
                  <Input
                    placeholder="e.g. 1000"
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="h-9 rounded-xl border-amber-300 font-mono text-sm bg-white"
                  />
                  {cashNum > 0 && (
                    <div className="pt-1 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">Change to Return:</span>
                      <span className={`font-mono text-sm ${cashNum >= grandTotal ? "text-emerald-700" : "text-red-600"}`}>
                        {cashNum >= grandTotal ? `₹${changeToReturn.toFixed(2)}` : `Short: ₹${balanceDue.toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* UPI Reference Workflow (PRD Section 12) */}
              {paymentMode === "UPI" && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-blue-900">UPI Transaction / UTR No.</Label>
                    <span className="text-[10px] text-blue-700 font-mono">cakeconnection@upi</span>
                  </div>
                  <Input
                    placeholder="Enter 12-digit UPI UTR (Optional)"
                    value={upiUtrRef}
                    onChange={(e) => setUpiUtrRef(e.target.value)}
                    className="h-9 rounded-xl border-blue-300 font-mono text-xs bg-white"
                  />
                </div>
              )}

              {/* Dual Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => handleCreateAndFinalize(true)}
                  disabled={creating || items.length === 0}
                  className="w-full h-11 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{creating ? "Finalizing Bill..." : "PRINT THERMAL + WHATSAPP BILL"}</span>
                </Button>

                <p className="text-[10px] text-center text-slate-400">
                  Automatically generates official PDF &amp; delivers to customer's WhatsApp if mobile is provided.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Thermal Receipt Modal (58mm / 80mm Preview & Direct Print) */}
      {thermalModalOpen && activeThermalBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Thermal Receipt Console</span>
              </div>
              <div className="flex items-center gap-2">
                {/* 58mm vs 80mm toggle */}
                <div className="bg-slate-800 rounded-lg p-0.5 flex text-[10px] font-bold">
                  <button
                    onClick={() => setThermalWidth("58mm")}
                    className={`px-2 py-0.5 rounded ${thermalWidth === "58mm" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
                  >
                    58mm
                  </button>
                  <button
                    onClick={() => setThermalWidth("80mm")}
                    className={`px-2 py-0.5 rounded ${thermalWidth === "80mm" ? "bg-emerald-600 text-white" : "text-slate-400"}`}
                  >
                    80mm
                  </button>
                </div>
                <button onClick={() => setThermalModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thermal Bill Content (Rendered exactly like thermal roll) */}
            <div className="p-6 bg-slate-100 flex justify-center max-h-[60vh] overflow-y-auto">
              <div
                className={`bg-white p-5 rounded shadow text-slate-900 font-mono text-[11px] leading-tight space-y-3 ${
                  thermalWidth === "58mm" ? "w-[260px]" : "w-[340px]"
                }`}
              >
                {/* Store Header */}
                <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                  <div className="font-black text-xs uppercase">CAKE CONNECTION</div>
                  <div className="text-[10px] text-slate-600">Alkapuri, Vadodara</div>
                  <div className="text-[10px] text-slate-600">Ph: +91 7203824012</div>
                  <div className="text-[10px] font-bold mt-1">
                    {docType === "GST_TAX_INVOICE" ? "TAX INVOICE" : docType === "BILL_OF_SUPPLY" ? "BILL OF SUPPLY" : "SALES RECEIPT"}
                  </div>
                  {docType === "GST_TAX_INVOICE" && <div className="text-[9px]">GSTIN: 24AAACC1234F1Z5</div>}
                </div>

                {/* Metadata */}
                <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                  <div className="flex justify-between">
                    <span>Inv: #{activeThermalBill.invoiceNumber}</span>
                    <span>{new Date().toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cust: {activeThermalBill.customerName || "Walk-in"}</span>
                    <span>{activeThermalBill.customerPhone || ""}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Pay Mode:</span>
                    <span>{activeThermalBill.paymentMode}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-b border-dashed border-slate-300 pb-2 space-y-1">
                  {activeThermalBill.items?.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[10px]">
                      <span className="truncate pr-2">{it.quantity}x {it.name}</span>
                      <span className="shrink-0 font-bold">₹{it.unitPrice * it.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{activeThermalBill.subtotal}</span>
                  </div>
                  {activeThermalBill.tax > 0 && (
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>GST (5%):</span>
                      <span>₹{activeThermalBill.tax}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-xs pt-1">
                    <span>TOTAL:</span>
                    <span>₹{activeThermalBill.grandTotal}</span>
                  </div>
                  {activeThermalBill.amountReceived > 0 && (
                    <div className="flex justify-between text-[10px] pt-1">
                      <span>Cash Tendered:</span>
                      <span>₹{activeThermalBill.amountReceived}</span>
                    </div>
                  )}
                  {activeThermalBill.changeToReturn > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-emerald-700">
                      <span>Change Due:</span>
                      <span>₹{activeThermalBill.changeToReturn}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center text-[9px] text-slate-500 pt-1 space-y-0.5">
                  <div>Thank You for Your Business!</div>
                  <div>Join VIP Club on WhatsApp for Secret Offers</div>
                  <div className="text-[8px] text-slate-400">Powered by CustomerPilot</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setThermalModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.print()}
                  className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt ({thermalWidth})</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Invoices History Table */}
      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Recent Invoices &amp; Delivery Status</CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Real-time delivery receipts for bills dispatched to customer WhatsApp numbers.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">{invoices.length} Invoices</Badge>
        </CardHeader>

        <CardContent className="p-0">
          {loadingInvoices ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading invoice records...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No Invoices Found</div>
              <p className="text-[11px] text-slate-400">Bills created from the POS console above will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-6">Invoice No</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">WhatsApp Delivery</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 pl-6 font-mono font-bold text-indigo-700">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        {inv.customerName || "Walk-in Guest"}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {inv.customerPhone || "—"}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        ₹{inv.grandTotal}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="text-[10px] font-mono uppercase border-slate-300">
                          {inv.paymentMode}
                        </Badge>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.waStatus === "DELIVERED" || inv.waStatus === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : inv.waStatus === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {inv.waStatus}
                        </span>
                      </td>
                      <td className="p-3.5 pr-6 text-right space-x-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setActiveThermalBill(inv)
                            setThermalModalOpen(true)
                          }}
                          className="h-7 px-2 text-[11px] text-slate-600 hover:text-slate-900"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" /> Thermal
                        </Button>

                        {inv.customerPhone && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={resendingId === inv.id}
                            onClick={() => handleResendWhatsApp(inv.id)}
                            className="h-7 px-2 text-[11px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Send className="w-3.5 h-3.5 mr-1" />
                            {resendingId === inv.id ? "Sending..." : "Resend WA"}
                          </Button>
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
