import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { hasModule } from "@/lib/feature-gate"
import { generateInvoicePdf, InvoicePdfData } from "@/lib/invoice-pdf-generator"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

interface WhatsAppInvoicePayload {
  merchantId: string
  toPhone: string
  text: string
  pdfBase64?: string
  orderNo: string
  invoiceUrl: string
}

async function sendWhatsAppInvoice({
  merchantId,
  toPhone,
  text,
  pdfBase64,
  orderNo,
  invoiceUrl
}: WhatsAppInvoicePayload) {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.log("[Invoice API] Evolution API credentials not configured, skipping WhatsApp dispatch")
      return { ok: false }
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    const defaultInstance = process.env.EVOLUTION_INSTANCE_NAME || "CustomerPilot_Main"
    const instanceName = merchant?.whatsappInstanceName || (merchant?.whatsappPhone ? `CP_M${merchant.whatsappPhone.replace(/\D/g, "")}` : defaultInstance)
    const cleanNumber = toPhone.replace(/\D/g, "")

    // 1. Dispatch Attached PDF Document via Evolution API sendMedia
    if (pdfBase64) {
      try {
        const mediaPayload = {
          number: cleanNumber,
          mediatype: "document",
          mimetype: "application/pdf",
          caption: `🧾 Official Tax Invoice #${orderNo}\n🔗 View / Print Online: ${invoiceUrl}`,
          media: `data:application/pdf;base64,${pdfBase64}`,
          fileName: `Invoice-${orderNo}.pdf`
        }

        let mediaRes = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
          body: JSON.stringify(mediaPayload)
        })

        if (!mediaRes.ok && instanceName !== defaultInstance) {
          console.log(`[Invoice API] sendMedia on ${instanceName} failed. Retrying fallback ${defaultInstance}`)
          await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${defaultInstance}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
            body: JSON.stringify(mediaPayload)
          })
        }
      } catch (mediaErr: any) {
        console.warn("[Invoice API] sendMedia error (will deliver text bill):", mediaErr.message)
      }
    }

    // 2. Dispatch Full Formatted Text Bill via sendText
    let res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({ number: cleanNumber, text })
    })

    if (!res.ok && instanceName !== defaultInstance) {
      console.log(`[Invoice API] Merchant instance ${instanceName} failed. Falling back to default ${defaultInstance}`)
      res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${defaultInstance}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
        body: JSON.stringify({ number: cleanNumber, text })
      })
    }

    const data = await res.json().catch(() => ({}))
    await db.whatsAppMessage.create({
      data: {
        merchantId,
        toPhone: cleanNumber,
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
    let billingSettings: {
      invoicePrefix: string
      gstin: string
      terms: string
      upiId: string
      thankYouMessage: string
    } = {
      invoicePrefix: "",
      gstin: "",
      terms: "Thank you for shopping with us! Goods once sold will not be returned.",
      upiId: "",
      thankYouMessage: "🙏 Thank you for your visit! Please visit again."
    }
    if (billingSettingsRecord?.value) {
      try {
        billingSettings = { ...billingSettings, ...JSON.parse(billingSettingsRecord.value) }
      } catch (_) {}
    }

    // Automatically derive prefix if not configured (e.g. "Cake Connection" -> "CC-")
    let prefix = billingSettings.invoicePrefix?.trim()
    if (!prefix) {
      const initials = (merchant.name || "INV")
        .split(/\s+/)
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 3)
      prefix = `${initials || "INV"}-`
    }

    // Generate unique sequential order / invoice number
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const timestampDigits = Date.now().toString().slice(-4)
    const orderNo = `${prefix}${timestampDigits}${randomDigits}`

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

      // Check if Loyalty is active and calculate stamps to award
      let stampsAwardedThisBill = 0
      if (hasModule(merchant, "LOYALTY")) {
        const stampCard = await tx.stampCard.findFirst({
          where: { merchantId, active: true },
          orderBy: { createdAt: "desc" }
        })
        if (stampCard) {
          const rewardPoints = stampCard.stampValue || 300
          stampsAwardedThisBill = Math.floor(finalGrandTotal / rewardPoints)
          if (stampsAwardedThisBill > 0) {
            let card = await tx.customerStampCard.findFirst({
              where: { customerId: waitingCustomer.customerId, stampCardId: stampCard.id, completed: false, redeemed: false },
              orderBy: { createdAt: "desc" }
            })
            if (!card) {
              card = await tx.customerStampCard.create({
                data: { customerId: waitingCustomer.customerId, stampCardId: stampCard.id, merchantId, stampsCollected: 0 }
              })
            }
            for (let s = 0; s < stampsAwardedThisBill; s++) {
              await tx.stamp.create({
                data: {
                  customerId: waitingCustomer.customerId,
                  stampCardId: stampCard.id,
                  customerStampCardId: card.id,
                  merchantId,
                  source: "purchase"
                }
              })
            }
            const stampsRequired = stampCard.stampsRequired || 10
            const newCount = card.stampsCollected + stampsAwardedThisBill
            if (newCount >= stampsRequired) {
              await tx.customerStampCard.update({
                where: { id: card.id },
                data: { stampsCollected: stampsRequired, completed: true }
              })
              const overflow = newCount - stampsRequired
              if (overflow > 0) {
                await tx.customerStampCard.create({
                  data: { customerId: waitingCustomer.customerId, stampCardId: stampCard.id, merchantId, stampsCollected: overflow }
                })
              }
            } else {
              await tx.customerStampCard.update({
                where: { id: card.id },
                data: { stampsCollected: newCount }
              })
            }
            await tx.customer.update({
              where: { id: waitingCustomer.customerId },
              data: { lifetimeStamps: { increment: stampsAwardedThisBill } }
            })
          }
        }
      }

      // Create Bill record for customer spend & CRM history
      await tx.bill.create({
        data: {
          merchantId,
          customerId: waitingCustomer.customerId,
          issuedById: staff.id,
          number: orderNo,
          amount: finalGrandTotal,
          stampsAwarded: stampsAwardedThisBill,
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

    // 4. Construct Clean Official WhatsApp Invoice & Generate PDF Attachment
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })

    const hasGstin = Boolean(billingSettings.gstin && billingSettings.gstin.trim())
    const invoiceTitle = hasGstin ? "TAX INVOICE" : "INVOICE"

    // Construct Loyalty Update Block (if Loyalty is active)
    let loyaltyRewardText = ""
    if (hasModule(merchant, "LOYALTY")) {
      const stampCard = await db.stampCard.findFirst({
        where: { merchantId, active: true },
        orderBy: { createdAt: "desc" }
      })
      if (stampCard) {
        const rewardPoints = stampCard.stampValue || 300
        const stampsEarned = Math.floor(finalGrandTotal / rewardPoints)
        const currentCard = await db.customerStampCard.findFirst({
          where: { customerId: waitingCustomer.customerId, stampCardId: stampCard.id, completed: false },
          orderBy: { createdAt: "desc" }
        })
        const currentStamps = currentCard?.stampsCollected ?? (waitingCustomer.customer.lifetimeStamps || 0)
        const stampsRequired = stampCard.stampsRequired || 10
        const remaining = Math.max(0, stampsRequired - currentStamps)

        loyaltyRewardText =
          `---------------------------------\n` +
          `🎉 *LOYALTY REWARD UPDATE:*\n` +
          `+${stampsEarned} Stamp${stampsEarned === 1 ? "" : "s"} Earned on this purchase!\n` +
          `Current Balance: ${currentStamps} / ${stampsRequired} Stamps 🎂\n` +
          (remaining === 0
            ? `🏆 *REWARD UNLOCKED: ${stampCard.rewardName || "Free Gift"}!*\n`
            : `(Only ${remaining} more stamp(s) to unlock ${stampCard.rewardName || "Free Reward"}!)\n`)
      }
    }

    const waBillMessage =
      `🧾 *${invoiceTitle}*\n` +
      `*${merchant.name.toUpperCase()}*\n` +
      (merchant.address ? `📍 ${merchant.address}\n` : "") +
      (merchant.whatsappPhone ? `📞 Contact: +${merchant.whatsappPhone}\n` : "") +
      (hasGstin ? `🏛️ GSTIN: ${billingSettings.gstin.trim()}\n` : "") +
      `---------------------------------\n` +
      `*INVOICE DETAILS*\n` +
      `*Bill No:* #${orderNo}\n` +
      `*Bill Date:* ${formattedDate}\n` +
      `*Customer:* ${customerDisplayName} (${waitingCustomer.customer.phone})\n` +
      `---------------------------------\n` +
      `*ITEM DETAILS*\n` +
      `${itemLines}\n` +
      `---------------------------------\n` +
      `Item Total       : ₹${Number(subtotal).toFixed(2)}\n` +
      (discount > 0 ? `Discount         : -₹${Number(discount).toFixed(2)}\n` : "") +
      `Taxable Amount   : ₹${Number(taxableAmount).toFixed(2)}\n` +
      taxBreakdown +
      `---------------------------------\n` +
      `*GRAND TOTAL     : ₹${finalGrandTotal.toFixed(2)} (PAID)*\n` +
      `Payment Mode     : ${paymentMethod}\n` +
      loyaltyRewardText +
      `---------------------------------\n` +
      `📎 *Download Official ${invoiceTitle} PDF attached below:*\n` +
      `${invoiceUrl}\n` +
      (billingSettings.terms ? `\n📌 *Terms & Conditions:*\n${billingSettings.terms}\n` : "") +
      `\n${billingSettings.thankYouMessage || "🙏 *Thank you for your visit! Please visit again.*"}`

    // Generate Binary PDF Buffer for direct WhatsApp document attachment
    let pdfBase64: string | undefined
    try {
      const pdfData: InvoicePdfData = {
        orderNo,
        date: formattedDate,
        merchantName: merchant.name,
        merchantAddress: merchant.address || null,
        merchantPhone: merchant.whatsappPhone || null,
        gstin: billingSettings.gstin || null,
        upiId: billingSettings.upiId || null,
        customerName: customerDisplayName,
        customerPhone: waitingCustomer.customer.phone,
        paymentMethod,
        items: items.map(i => ({
          name: i.name,
          quantity: Number(i.quantity || 1),
          unitPrice: Number(i.unitPrice || 0),
          totalPrice: Number(i.totalPrice || (i.unitPrice * i.quantity))
        })),
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
        terms: billingSettings.terms || null
      }
      const pdfBuffer = generateInvoicePdf(pdfData)
      pdfBase64 = pdfBuffer.toString("base64")
    } catch (pdfErr: any) {
      console.warn("[Invoice API] PDF buffer generation error:", pdfErr.message)
    }

    // Dispatch WhatsApp notification (both attached PDF document and structured text bill)
    sendWhatsAppInvoice({
      merchantId,
      toPhone: waitingCustomer.customer.phone,
      text: waBillMessage,
      pdfBase64,
      orderNo,
      invoiceUrl
    })

    return ok({
      message: "Tax invoice generated and dispatched successfully",
      orderNo,
      invoiceUrl,
      pdfDownloadUrl: `${appUrl}/api/billing/invoice-pdf/${orderNo}`,
      grandTotal: finalGrandTotal,
      orderId: transactionResult.id
    })

  } catch (error: any) {
    console.error("[Invoice API] Error generating invoice:", error)
    return err(error.message || "Failed to generate invoice", 500)
  }
}
