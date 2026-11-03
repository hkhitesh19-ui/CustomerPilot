"use client"

import { useState } from "react"
import { Printer, Share2, ArrowLeft, Check, Copy, Download, ShieldCheck, QrCode } from "lucide-react"
import Link from "next/link"

interface InvoiceItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface InvoiceViewProps {
  invoice: {
    orderNo: string
    createdAt: string
    merchant: {
      name: string
      address: string
      phone: string
      logoUrl: string | null
      gstin: string
      upiId: string
      terms: string
    }
    customer: {
      name: string
      phone: string
    }
    items: InvoiceItem[]
    financials: {
      subtotal: number
      discount: number
      discountType: string
      taxableAmount: number
      gstRate: number
      gstType: string
      cgst: number
      sgst: number
      igst: number
      grandTotal: number
      paymentMethod: string
    }
  }
}

// Convert numbers into Indian English words
function numberToWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ]
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  const intNum = Math.floor(num)
  if (intNum === 0) return "Zero Rupees Only"

  function inWords(n: number): string {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "")
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + inWords(n % 100) : "")
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "")
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "")
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "")
  }

  return `${inWords(intNum)} Rupees Only`
}

export function InvoiceView({ invoice }: InvoiceViewProps) {
  const [copied, setCopied] = useState(false)

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print()
    }
  }

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href
      const text = `Tax Invoice #${invoice.orderNo} from ${invoice.merchant.name} (Amount: ₹${invoice.financials.grandTotal}): ${url}`
      if (navigator.share) {
        navigator.share({ title: `Invoice #${invoice.orderNo}`, text, url }).catch(() => {})
      } else {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  const formattedDate = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  const formattedTime = new Date(invoice.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  const upiPayUrl = invoice.merchant.upiId
    ? `upi://pay?pa=${encodeURIComponent(invoice.merchant.upiId)}&pn=${encodeURIComponent(invoice.merchant.name)}&am=${invoice.financials.grandTotal}&cu=INR`
    : null

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 px-3 sm:px-6 font-sans print:p-0 print:bg-white print:m-0">
      
      {/* ── Top Non-Printable Action Bar ── */}
      <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? "Copied Link" : "Share"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white flex items-center gap-1.5 shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ── Official Tax Invoice Document ── */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {invoice.merchant.logoUrl ? (
              <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 shadow-md">
                <img
                  src={invoice.merchant.logoUrl}
                  alt={invoice.merchant.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/10 text-white font-black text-2xl flex items-center justify-center shrink-0 border border-white/20">
                {invoice.merchant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {invoice.merchant.name}
              </h1>
              {invoice.merchant.address && (
                <p className="text-xs text-emerald-100/90 mt-0.5 line-clamp-2 max-w-sm">
                  {invoice.merchant.address}
                </p>
              )}
              {invoice.merchant.phone && (
                <p className="text-xs text-emerald-200 font-mono mt-0.5">
                  Phone: +{invoice.merchant.phone}
                </p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase tracking-wider border border-emerald-400/30">
              Tax Invoice / Bill of Supply
            </span>
            <div className="mt-2 text-white">
              <span className="text-xs text-emerald-200/80 block">Invoice Number</span>
              <span className="font-mono font-black text-lg tracking-wider">#{invoice.orderNo}</span>
            </div>
          </div>
        </div>

        {/* Invoice Meta Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Invoice Date</span>
            <span className="font-semibold text-slate-800">{formattedDate}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Invoice Time</span>
            <span className="font-semibold text-slate-800">{formattedTime}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Payment Status</span>
            <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">
              PAID ({invoice.financials.paymentMethod})
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Merchant GSTIN</span>
            <span className="font-mono font-bold text-slate-800">
              {invoice.merchant.gstin || "Exempt / Unregistered"}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-4 sm:p-8 border-b border-slate-200">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            Billed To
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {invoice.customer.name}
          </div>
          {invoice.customer.phone && (
            <div className="text-xs text-slate-600 font-mono mt-0.5">
              Phone: {invoice.customer.phone}
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div className="p-4 sm:p-8">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-800 font-black uppercase tracking-wider text-[10px]">
                <th className="py-2.5 w-8">#</th>
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center w-16">Qty</th>
                <th className="py-2.5 text-right w-24">Rate (₹)</th>
                <th className="py-2.5 text-right w-28">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 text-slate-400 font-mono">{index + 1}</td>
                  <td className="py-3 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 text-center font-mono font-bold text-slate-700">{item.quantity}</td>
                  <td className="py-3 text-right font-mono text-slate-600">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-black text-slate-900">₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Calculation Summary */}
          <div className="mt-6 pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between gap-6">
            {/* Amount in words & UPI QR code */}
            <div className="flex-1 space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Amount in Words
                </span>
                <span className="text-xs font-bold text-slate-800 italic">
                  {numberToWords(invoice.financials.grandTotal)}
                </span>
              </div>

              {upiPayUrl && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 w-fit">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(upiPayUrl)}`}
                    alt="UPI Verification QR"
                    className="w-16 h-16 object-contain rounded-lg border border-slate-300"
                  />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full w-fit">
                      UPI Verified
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-800 mt-1">
                      {invoice.merchant.upiId}
                    </div>
                    <div className="text-[10px] text-slate-500">Scan to verify payment</div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown Table */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">₹{invoice.financials.subtotal.toFixed(2)}</span>
              </div>

              {invoice.financials.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{invoice.financials.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                <span>Taxable Value:</span>
                <span className="font-mono font-semibold">₹{invoice.financials.taxableAmount.toFixed(2)}</span>
              </div>

              {invoice.financials.gstRate > 0 ? (
                invoice.financials.gstType === "IGST" ? (
                  <div className="flex justify-between text-slate-600">
                    <span>IGST ({invoice.financials.gstRate}%):</span>
                    <span className="font-mono">₹{invoice.financials.igst.toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST ({(invoice.financials.gstRate / 2).toFixed(1)}%):</span>
                      <span className="font-mono">₹{invoice.financials.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST ({(invoice.financials.gstRate / 2).toFixed(1)}%):</span>
                      <span className="font-mono">₹{invoice.financials.sgst.toFixed(2)}</span>
                    </div>
                  </>
                )
              ) : (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST:</span>
                  <span>Exempt (0%)</span>
                </div>
              )}

              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t-2 border-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-700">₹{invoice.financials.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notes & Authorized Signatory */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="max-w-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Terms &amp; Conditions
            </span>
            <p className="text-[11px] leading-relaxed">
              {invoice.merchant.terms}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              This is a computer-generated official tax invoice verified by CustomerPilot.
            </p>
          </div>

          <div className="text-left sm:text-right pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200 w-full sm:w-auto">
            <div className="h-10 w-36 border-b border-slate-300 mx-0 sm:ml-auto mb-1 flex items-end justify-center text-[10px] text-slate-400 italic">
              Digital Authorized Signatory
            </div>
            <div className="font-bold text-slate-800 text-xs">For {invoice.merchant.name}</div>
          </div>
        </div>

      </div>

      {/* Media print formatting styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          @page {
            margin: 10mm;
            size: auto;
          }
        }
      `}</style>

    </div>
  )
}
