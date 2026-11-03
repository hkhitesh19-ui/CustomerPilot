import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

async function sendWhatsAppInvoice(merchantId: string, toPhone: string, text: string) {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.log("[Invoice API] Evolution API credentials not configured, skipping WhatsApp dispatch")
      return { ok: false }
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    const defaultInstance = process.env.EVOLUTION_INSTANCE_NAME || "CustomerPilot_Main"
    const instanceName = merchant?.whatsappInstanceName || (merchant?.whatsappPhone ? `CP_M${merchant.whatsappPhone.replace(/\D/g, "")}` : defaultInstance)

    let res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number: toPhone, text })
    })

    if (!res.ok && instanceName !== defaultInstance) {
      console.log(`[Invoice API] Merchant instance ${instanceName} failed. Falling back to default ${defaultInstance}`)
      res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${defaultInstance}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
        body: JSON.stringify({ number: toPhone, text })
      })
    }

    const data = await res.json().catch(() => ({}))
    await db.whatsAppMessage.create({
      data: {
        merchantId,
        toPhone,
        template: "TAX_INVOICE_PDF",
        body: text.substring(0, 500),
        status: res.ok ? "sent" : "failed",
        sentAt: res.ok ? new Date() : null,
        metaMessageId: data?.key?.id || `inv_${Date.now()}`,
        errorMessage: res.ok ? null : (data?.message || `HTTP ${res.status}`)
      }
    }).catch(() => {})

    return { ok: res.ok }
  } catch (e: any) {
    console.error("[Invoice API] WhatsApp send error:", e.message)
    return { ok: false, error: e.message }
  }
}

export async function POST(req: NextRequest) {
  try {
    const headerMerchantId = req.headers.get("x-merchant-id")
    const authMerchant = await getAuthenticatedMerchant()
    const merchantId = headerMerchantId || authMerchant?.id

    if (!merchantId) return err("Unauthorized", 401)

    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON payload", 400)

    const {
      waitingCustomerId,
      items,
      subtotal,
      discount = 0,
      discountType = "flat",
      taxableAmount,
      gstRate = 0,
      gstType = "CGST_SGST",
      cgst = 0,
      sgst = 0,
      igst = 0,
      grandTotal,
      paymentMethod = "UPI"
    } = body

    if (!waitingCustomerId) return err("Waiting customer ID is required", 400)
    if (!items || !Array.isArray(items) || items.length === 0) {
      return err("At least one item is required to generate an invoice", 400)
    }

    // 1. Fetch WaitingCustomer and verify ownership
    const waitingCustomer = await db.waitingCustomer.findUnique({
      where: { id: waitingCustomerId },
      include: { customer: true }
    })

    if (!waitingCustomer || waitingCustomer.merchantId !== merchantId) {
      return err("Waiting customer not found", 404)
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant) return err("Merchant not found", 404)

    // 2. Fetch billing settings
    const billingSettingsRecord = await db.systemContent.findUnique({
      where: { key: `MERCHANT_BILLING_SETTINGS_${merchantId}` }
    })
    let billingSettings = {
      invoicePrefix: "INV-",
      gstin: "",
      terms: "Thank you for shopping with us! Goods once sold will not be returned.",
      upiId: ""
    }
    if (billingSettingsRecord?.value) {
      try {
        billingSettings = { ...billingSettings, ...JSON.parse(billingSettingsRecord.value) }
      } catch (_) {}
    }

    // Generate unique sequential order / invoice number
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const timestampDigits = Date.now().toString().slice(-4)
    const orderNo = `${billingSettings.invoicePrefix || "INV-"}${timestampDigits}${randomDigits}`

    const finalGrandTotal = Math.round(Number(grandTotal || taxableAmount || subtotal))

    // 3. Atomically create Order, OrderItems, Bill, and remove WaitingCustomer
    const transactionResult = await db.$transaction(async (tx) => {
      // Find or create fallback MenuItem for ad-hoc custom items
      let defaultMenuItem = await tx.menuItem.findFirst({
        where: { merchantId, name: "General Item" }
      })
      if (!defaultMenuItem) {
        defaultMenuItem = await tx.menuItem.create({
          data: {
            merchantId,
            category: "General",
            name: "General Item",
            price: 0,
            isAvailable: true
          }
        })
      }

      // Find or create staff for bill record
      let staff = await tx.staff.findFirst({
        where: { merchantId }
      })
      if (!staff) {
        staff = await tx.staff.create({
          data: {
            merchantId,
            name: "Store Manager",
            role: "manager"
          }
        })
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          merchantId,
          customerId: waitingCustomer.customerId,
          customerPhone: waitingCustomer.customer.phone,
          customerName: waitingCustomer.customer.name,
          orderNo,
          status: "CONFIRMED",
          deliveryType: "dine-in",
          totalAmount: finalGrandTotal,
          confirmedAt: new Date(),
          notes: JSON.stringify({
            isItemizedInvoice: true,
            subtotal: Number(subtotal),
            discount: Number(discount),
            discountType,
            taxableAmount: Number(taxableAmount),
            gstRate: Number(gstRate),
            gstType,
            cgst: Number(cgst),
            sgst: Number(sgst),
            igst: Number(igst),
            grandTotal: finalGrandTotal,
            paymentMethod,
            gstin: billingSettings.gstin || "",
            terms: billingSettings.terms || "",
            itemsBreakdown: items.map(i => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice
            }))
          }),
          items: {
            create: items.map(item => ({
              menuItemId: item.menuItemId || defaultMenuItem!.id,
              quantity: Number(item.quantity || 1),
              unitPrice: Math.round(Number(item.unitPrice || 0)),
              totalPrice: Math.round(Number(item.totalPrice || item.unitPrice * item.quantity)),
              notes: item.name
            }))
          }
        },
        include: { items: true }
      })

      // Create Bill record for customer spend & CRM history
      await tx.bill.create({
        data: {
          merchantId,
          customerId: waitingCustomer.customerId,
          issuedById: staff.id,
          number: orderNo,
          amount: finalGrandTotal,
          stampsAwarded: 0,
          status: "paid",
          notes: `Itemized Tax Invoice #${orderNo}`
        }
      })

      // Increment customer lifetime spend
      await tx.customer.update({
        where: { id: waitingCustomer.customerId },
        data: {
          lifetimeSpend: { increment: finalGrandTotal }
        }
      })

      // Remove from LiveQueue
      await tx.waitingCustomer.delete({
        where: { id: waitingCustomerId }
      })

      return newOrder
    })

    // 4. Construct Clean Official WhatsApp Invoice (Strictly ZERO Loyalty Stamp Text)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in"
    const invoiceUrl = `${appUrl}/invoice/${orderNo}`

    const itemLines = items.map((i, idx) => 
      `${idx + 1}. *${i.name}* × ${i.quantity} = ₹${Number(i.totalPrice || (i.unitPrice * i.quantity)).toFixed(2)}`
    ).join("\n")

    let taxBreakdown = `*Tax:* Exempt (0%)\n`
    if (gstRate > 0) {
      if (gstType === "IGST") {
        taxBreakdown = `*IGST (${gstRate}%):* ₹${Number(igst).toFixed(2)}\n`
      } else {
        const halfRate = (gstRate / 2).toFixed(1)
        taxBreakdown = `*CGST (${halfRate}%):* ₹${Number(cgst).toFixed(2)}\n*SGST (${halfRate}%):* ₹${Number(sgst).toFixed(2)}\n`
      }
    }

    const customerDisplayName = waitingCustomer.customer.name || "Customer"
    const formattedDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })

    const waBillMessage =
      `🧾 *TAX INVOICE / CASH BILL*\n` +
      `*${merchant.name.toUpperCase()}*\n` +
      (merchant.address ? `📍 ${merchant.address}\n` : "") +
      (billingSettings.gstin ? `🏛️ GSTIN: ${billingSettings.gstin}\n` : "") +
      `---------------------------------\n` +
      `*Invoice No:* #${orderNo}\n` +
      `*Date:* ${formattedDate}\n` +
      `*Billed To:* ${customerDisplayName} (${waitingCustomer.customer.phone})\n` +
      `---------------------------------\n` +
      `*ITEMS PURCHASED:*\n` +
      `${itemLines}\n` +
      `---------------------------------\n` +
      `*Subtotal:* ₹${Number(subtotal).toFixed(2)}\n` +
      (discount > 0 ? `*Discount (${discountType === "percent" ? "Promo %" : "Flat ₹"}):* -₹${Number(discount).toFixed(2)}\n` : "") +
      `*Taxable Value:* ₹${Number(taxableAmount).toFixed(2)}\n` +
      taxBreakdown +
      `*GRAND TOTAL PAID:* *₹${finalGrandTotal.toFixed(2)}*\n` +
      `*Payment Method:* ${paymentMethod}\n` +
      `---------------------------------\n` +
      `📄 *View / Download Official PDF Invoice:*\n` +
      `${invoiceUrl}\n\n` +
      `🙏 *Thank you for shopping with us!*`

    // Dispatch WhatsApp notification asynchronously from merchant instance
    sendWhatsAppInvoice(merchantId, waitingCustomer.customer.phone, waBillMessage)

    return ok({
      message: "Tax invoice generated and dispatched successfully",
      orderNo,
      invoiceUrl,
      grandTotal: finalGrandTotal,
      orderId: transactionResult.id
    })

  } catch (error: any) {
    console.error("[Invoice API] Error generating invoice:", error)
    return err(error.message || "Failed to generate invoice", 500)
  }
}
