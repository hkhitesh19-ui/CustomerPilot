import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateInvoicePdf, InvoicePdfData } from "@/lib/invoice-pdf-generator"
import { sendInvoicePdfViaWhatsApp } from "@/lib/whatsapp-media"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const merchantId = req.headers.get("x-merchant-id")

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        merchant: true,
        customer: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (merchantId && invoice.merchantId !== merchantId) {
      return NextResponse.json({ error: "Forbidden: Not your invoice" }, { status: 403 })
    }

    const phone = invoice.customerPhone || invoice.customer?.phone
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "No valid WhatsApp phone number for this invoice." }, { status: 400 })
    }

    // Regenerate fresh PDF buffer
    const pdfData: InvoicePdfData = {
      orderNo: invoice.invoiceNumber,
      date: invoice.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      merchantName: invoice.merchant.name,
      merchantAddress: invoice.merchant.address,
      merchantPhone: invoice.merchant.whatsappPhone,
      gstin: (invoice.merchant as any).gstin || null,
      upiId: null,
      customerName: invoice.customerName || invoice.customer?.name || null,
      customerPhone: phone,
      paymentMethod: invoice.paymentMode,
      items: invoice.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice
      })),
      subtotal: invoice.subtotal,
      discount: invoice.discountAmount,
      discountType: (invoice.discountType as any) || "flat",
      taxableAmount: invoice.taxableAmount,
      gstRate: invoice.gstRate,
      gstType: (invoice.gstType as any) || "CGST_SGST",
      cgst: invoice.cgst,
      sgst: invoice.sgst,
      igst: invoice.igst,
      grandTotal: invoice.grandTotal
    }

    const pdfBuffer = generateInvoicePdf(pdfData)

    const result = await sendInvoicePdfViaWhatsApp({
      merchantId: invoice.merchantId,
      toPhone: phone,
      pdfBuffer,
      invoiceNumber: invoice.invoiceNumber,
      grandTotal: invoice.grandTotal,
      merchantName: invoice.merchant.name,
      invoiceId: invoice.id,
      customerId: invoice.customerId
    })

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error
    })
  } catch (err: any) {
    console.error("[Invoice Send WhatsApp Error]:", err)
    return NextResponse.json({ error: "Failed to dispatch WhatsApp invoice" }, { status: 500 })
  }
}
