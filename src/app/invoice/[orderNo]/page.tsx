import { notFound } from "next/navigation"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { InvoiceView } from "@/components/invoice/invoice-view"

interface PageProps {
  params: Promise<{
    orderNo: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderNo } = await params
  const order = await db.order.findFirst({
    where: { orderNo },
    include: { merchant: true }
  })

  if (!order) {
    return {
      title: "Invoice Not Found | CustomerPilot",
      description: "Official Tax Invoice"
    }
  }

  const title = `Tax Invoice #${order.orderNo} • ${order.merchant.name}`
  const description = `Official Tax Invoice for order #${order.orderNo} from ${order.merchant.name}. Total: ₹${order.totalAmount}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "CustomerPilot Invoicing",
      type: "article"
    }
  }
}

export default async function InvoicePage({ params }: PageProps) {
  const { orderNo } = await params

  const order = await db.order.findFirst({
    where: { orderNo },
    include: {
      merchant: true,
      customer: true,
      items: {
        include: { menuItem: true }
      }
    }
  })

  if (!order) {
    notFound()
  }

  // Parse invoice metadata from order notes
  let invoiceMeta: any = {}
  try {
    if (order.notes && order.notes.startsWith("{")) {
      invoiceMeta = JSON.parse(order.notes)
    }
  } catch (_) {}

  // Fetch billing settings if needed for fallback
  const billingSettingsRecord = await db.systemContent.findUnique({
    where: { key: `MERCHANT_BILLING_SETTINGS_${order.merchantId}` }
  })
  let billingSettings: any = {}
  if (billingSettingsRecord?.value) {
    try {
      billingSettings = JSON.parse(billingSettingsRecord.value)
    } catch (_) {}
  }

  const invoiceData = {
    orderNo: order.orderNo,
    createdAt: order.createdAt.toISOString(),
    merchant: {
      name: order.merchant.name,
      address: order.merchant.address || "",
      phone: order.merchant.whatsappPhone || "",
      logoUrl: order.merchant.logoUrl || null,
      gstin: invoiceMeta.gstin || billingSettings.gstin || "",
      upiId: invoiceMeta.upiId || billingSettings.upiId || (order.merchant.whatsappPhone ? `${order.merchant.whatsappPhone.replace(/\D/g, "").slice(-10)}@upi` : ""),
      terms: invoiceMeta.terms || billingSettings.terms || "Thank you for shopping with us! Goods once sold will not be returned."
    },
    customer: {
      name: order.customerName || order.customer?.name || "Customer",
      phone: order.customerPhone || order.customer?.phone || ""
    },
    items: order.items.map(item => ({
      id: item.id,
      name: item.notes || item.menuItem?.name || "Item",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    })),
    financials: {
      subtotal: Number(invoiceMeta.subtotal || order.totalAmount),
      discount: Number(invoiceMeta.discount || 0),
      discountType: invoiceMeta.discountType || "flat",
      taxableAmount: Number(invoiceMeta.taxableAmount || order.totalAmount),
      gstRate: Number(invoiceMeta.gstRate || 0),
      gstType: invoiceMeta.gstType || "CGST_SGST",
      cgst: Number(invoiceMeta.cgst || 0),
      sgst: Number(invoiceMeta.sgst || 0),
      igst: Number(invoiceMeta.igst || 0),
      grandTotal: order.totalAmount,
      paymentMethod: invoiceMeta.paymentMethod || "UPI"
    }
  }

  return <InvoiceView invoice={invoiceData} />
}
