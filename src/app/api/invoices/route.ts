import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateInvoicePdf, InvoicePdfData } from "@/lib/invoice-pdf-generator"
import { sendInvoicePdfViaWhatsApp } from "@/lib/whatsapp-media"
import { storage } from "@/lib/storage"
import { getAuthenticatedMerchant } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    let merchantId = req.headers.get("x-merchant-id") || req.nextUrl.searchParams.get("merchantId")
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
    }
    if (!merchantId) {
      return NextResponse.json({ error: "Unauthorized: Merchant ID required" }, { status: 401 })
    }

    const invoices = await db.invoice.findMany({
      where: { merchantId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json({ success: true, invoices })
  } catch (err: any) {
    console.error("[Invoices GET Error]:", err)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    let merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
    }
    if (!merchantId) {
      return NextResponse.json({ error: "Unauthorized: Merchant ID required" }, { status: 401 })
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId }
    })
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    const body = await req.json()
    const {
      customerId,
      customerName,
      customerPhone,
      items,
      paymentMode = "CASH",
      discountAmount = 0,
      discountType = "flat",
      gstRate = 0,
      gstType = "CGST_SGST",
      notes
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invoice must contain at least 1 item." }, { status: 400 })
    }

    // Calculate line item totals
    let subtotal = 0
    const invoiceItemsData = items.map((it: any) => {
      const q = Math.max(1, Number(it.quantity) || 1)
      const p = Math.max(0, Number(it.unitPrice) || 0)
      const lineTotal = q * p
      subtotal += lineTotal
      return {
        name: String(it.name || "Item"),
        category: it.category ? String(it.category) : undefined,
        quantity: q,
        unitPrice: p,
        discountAmt: 0,
        taxRate: Number(gstRate) || 0,
        taxAmount: (lineTotal * (Number(gstRate) || 0)) / 100,
        totalPrice: lineTotal
      }
    })

    const disc = Math.min(subtotal, Math.max(0, Number(discountAmount) || 0))
    const taxable = Math.max(0, subtotal - disc)
    const totalTax = (taxable * (Number(gstRate) || 0)) / 100
    const grandTotal = Math.round(taxable + totalTax)

    let cgst = 0
    let sgst = 0
    let igst = 0
    if (gstType === "IGST") {
      igst = totalTax
    } else {
      cgst = totalTax / 2
      sgst = totalTax / 2
    }

    // Sequence generator: CC-1001, CC-1002 etc.
    const merchantPrefix = (merchant.name.replace(/[^A-Za-z]/g, "").substring(0, 2) || "CP").toUpperCase()
    const count = await db.invoice.count({ where: { merchantId } })
    const invoiceNumber = `${merchantPrefix}-${1001 + count}`

    // 1. Create Invoice & Items in DB transaction
    const invoice = await db.invoice.create({
      data: {
        merchantId,
        customerId: customerId || null,
        invoiceNumber,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        paymentMode: paymentMode.toUpperCase(),
        paymentStatus: "PAID",
        subtotal,
        discountAmount: disc,
        discountType,
        taxableAmount: taxable,
        gstRate: Number(gstRate) || 0,
        gstType,
        cgst,
        sgst,
        igst,
        grandTotal,
        notes: notes || null,
        printedAt: new Date(),
        waStatus: "NOT_SENT",
        items: {
          create: invoiceItemsData
        }
      },
      include: {
        items: true
      }
    })

    // 2. Generate PDF Buffer
    const pdfData: InvoicePdfData = {
      orderNo: invoiceNumber,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      merchantName: merchant.name,
      merchantAddress: merchant.address,
      merchantPhone: merchant.whatsappPhone,
      gstin: (merchant as any).gstin || null,
      upiId: null,
      customerName: customerName || null,
      customerPhone: customerPhone || "",
      paymentMethod: paymentMode.toUpperCase(),
      items: invoiceItemsData.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice
      })),
      subtotal,
      discount: disc,
      discountType: discountType as "flat" | "percent",
      taxableAmount: taxable,
      gstRate: Number(gstRate) || 0,
      gstType: gstType as "CGST_SGST" | "IGST",
      cgst,
      sgst,
      igst,
      grandTotal
    }

    const pdfBuffer = generateInvoicePdf(pdfData)

    // 3. Upload/Save PDF via Storage abstraction
    let pdfUrl = ""
    try {
      pdfUrl = await storage.upload(`invoice_${invoiceNumber}.pdf`, pdfBuffer, "application/pdf")
      await db.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl, pdfGeneratedAt: new Date() }
      })
    } catch (sErr) {
      console.warn("[Invoice Storage Warning]:", sErr)
    }

    // 4. Dual-Action: If Customer Phone is available, automatically dispatch WhatsApp PDF!
    let waSent = false
    if (customerPhone && customerPhone.replace(/\D/g, "").length >= 10) {
      const waResult = await sendInvoicePdfViaWhatsApp({
        merchantId,
        toPhone: customerPhone,
        pdfBuffer,
        invoiceNumber,
        grandTotal,
        merchantName: merchant.name,
        invoiceId: invoice.id,
        customerId
      })
      waSent = waResult.success
    }

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        pdfUrl
      },
      whatsappDelivered: waSent
    })
  } catch (err: any) {
    console.error("[Invoices POST Error]:", err)
    return NextResponse.json({ error: "Failed to create invoice." }, { status: 500 })
  }
}
