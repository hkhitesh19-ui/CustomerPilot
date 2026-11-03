import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateInvoicePdf, InvoicePdfData } from "@/lib/invoice-pdf-generator"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNo: string }> }
) {
  try {
    const { orderNo } = await params
    if (!orderNo) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 })
    }

    const order = await db.order.findFirst({
      where: { orderNo },
      include: {
        merchant: true,
        customer: true,
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Parse notes for tax and calculation details
    let meta: any = {}
    if (order.notes && typeof order.notes === "string" && order.notes.startsWith("{")) {
      try {
        meta = JSON.parse(order.notes)
      } catch (_) {}
    }

    // Fetch merchant billing settings
    const billingSettingsRecord = await db.systemContent.findUnique({
      where: { key: `MERCHANT_BILLING_SETTINGS_${order.merchantId}` },
    })
    let billingSettings: any = {}
    if (billingSettingsRecord?.value) {
      try {
        billingSettings = JSON.parse(billingSettingsRecord.value)
      } catch (_) {}
    }

    const items = (meta.itemsBreakdown && Array.isArray(meta.itemsBreakdown) && meta.itemsBreakdown.length > 0)
      ? meta.itemsBreakdown
      : order.items.map((item) => ({
          name: item.notes || "Item",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        }))

    const formattedDate = (order.confirmedAt || order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    const pdfData: InvoicePdfData = {
      orderNo: order.orderNo,
      date: formattedDate,
      merchantName: order.merchant?.name || "CustomerPilot Merchant",
      merchantAddress: order.merchant?.address || null,
      merchantPhone: order.merchant?.whatsappPhone || null,
      gstin: meta.gstin || billingSettings.gstin || null,
      upiId: billingSettings.upiId || null,
      customerName: order.customerName || order.customer?.name || null,
      customerPhone: order.customerPhone || order.customer?.phone || "",
      paymentMethod: meta.paymentMethod || "UPI",
      items,
      subtotal: Number(meta.subtotal || order.totalAmount),
      discount: Number(meta.discount || 0),
      discountType: meta.discountType || "flat",
      taxableAmount: Number(meta.taxableAmount || order.totalAmount),
      gstRate: Number(meta.gstRate || 0),
      gstType: meta.gstType || "CGST_SGST",
      cgst: Number(meta.cgst || 0),
      sgst: Number(meta.sgst || 0),
      igst: Number(meta.igst || 0),
      grandTotal: Number(meta.grandTotal || order.totalAmount),
      terms: meta.terms || billingSettings.terms || null,
    }

    const pdfBuffer = generateInvoicePdf(pdfData)

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Invoice-${order.orderNo}.pdf"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error: any) {
    console.error("[INVOICE_PDF_GET]", error)
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 })
  }
}
