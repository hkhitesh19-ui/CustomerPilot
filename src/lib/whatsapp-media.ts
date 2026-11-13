import { db } from "@/lib/db"
import { resolveWhatsappInstanceName } from "@/lib/whatsapp-service"

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://localhost:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || process.env.EVOLUTION_GLOBAL_API_KEY || ""

export interface SendInvoicePdfParams {
  merchantId: string
  toPhone: string
  pdfBuffer: Buffer
  invoiceNumber: string
  grandTotal: number
  merchantName: string
  invoiceId: string
  customerId?: string | null
}

/**
 * Sends a generated PDF invoice via Evolution API's /message/sendMedia endpoint.
 * Ensures strict idempotency via unique `idempotencyKey` per invoice.
 */
export async function sendInvoicePdfViaWhatsApp(
  params: SendInvoicePdfParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const idempotencyKey = `inv_${params.invoiceId}_wa`

    // Check if already sent successfully
    const existing = await db.whatsAppMessage.findUnique({
      where: { idempotencyKey }
    })

    if (existing && existing.status === "sent") {
      return { success: true, messageId: existing.metaMessageId || undefined }
    }

    const merchant = await db.merchant.findUnique({
      where: { id: params.merchantId }
    })

    if (!merchant) {
      return { success: false, error: "Merchant not found" }
    }

    const instanceName = resolveWhatsappInstanceName(merchant)
    const base64Pdf = params.pdfBuffer.toString("base64")
    const cleanPhone = params.toPhone.replace(/\D/g, "")

    const caption = `🧾 *Official Tax Invoice from ${params.merchantName}*\n\n` +
      `• *Invoice No:* ${params.invoiceNumber}\n` +
      `• *Grand Total:* ₹${params.grandTotal.toFixed(2)}\n\n` +
      `Thank you for shopping with us! Your digital invoice PDF is attached above. 🙏`

    const payload = {
      number: cleanPhone,
      mediatype: "document",
      mimetype: "application/pdf",
      caption: caption,
      media: base64Pdf,
      fileName: `Invoice_${params.invoiceNumber}.pdf`
    }

    const res = await fetch(`${EVOLUTION_API_URL}/message/sendMedia/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json().catch(() => ({}))
    const isSuccess = res.ok && Boolean(data?.key?.id)

    // Upsert the WhatsAppMessage tracking record
    await db.whatsAppMessage.upsert({
      where: { idempotencyKey },
      create: {
        merchantId: params.merchantId,
        customerId: params.customerId || null,
        toPhone: cleanPhone,
        template: "invoice_pdf",
        body: `Invoice ${params.invoiceNumber} - Rs ${params.grandTotal}`,
        status: isSuccess ? "sent" : "failed",
        errorMessage: isSuccess ? null : JSON.stringify(data),
        metaMessageId: data?.key?.id || `${params.invoiceNumber}_${Date.now()}`,
        invoiceId: params.invoiceId,
        idempotencyKey,
        sentAt: isSuccess ? new Date() : null
      },
      update: {
        status: isSuccess ? "sent" : "failed",
        retryCount: { increment: 1 },
        errorMessage: isSuccess ? null : JSON.stringify(data),
        sentAt: isSuccess ? new Date() : null
      }
    })

    // Update invoice record status
    await db.invoice.update({
      where: { id: params.invoiceId },
      data: {
        waStatus: isSuccess ? "SENT" : "FAILED"
      }
    }).catch(() => {})

    return {
      success: isSuccess,
      messageId: data?.key?.id,
      error: isSuccess ? undefined : JSON.stringify(data)
    }
  } catch (err: any) {
    console.error("[WhatsApp Media] Failed to send PDF:", err)
    return { success: false, error: err.message || "Unknown error" }
  }
}
