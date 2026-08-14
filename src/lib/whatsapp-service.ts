import { db } from "@/lib/db";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

/**
 * Single source of truth for resolving any merchant's WhatsApp Evolution Instance Name.
 * Prevents instance mismatch issues for new & existing merchants permanently.
 */
export function resolveWhatsappInstanceName(merchant: {
  id: string;
  whatsappInstanceName?: string | null;
  whatsappPhone?: string | null;
}): string {
  if (merchant.whatsappInstanceName) {
    return merchant.whatsappInstanceName;
  }
  // Universal standard fallback across CustomerPilot platform:
  return `CP_M_${merchant.id}`;
}

/**
 * Centralized WhatsApp message dispatcher.
 * Handles instance resolution, Evolution API POST, logging, and DB record creation cleanly.
 */
export async function sendCentralWhatsAppMessage(params: {
  merchantId: string;
  toPhone: string;
  text: string;
  template: string;
  customerId?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const merchant = await db.merchant.findUnique({ where: { id: params.merchantId } });
    if (!merchant) {
      return { success: false, error: "Merchant not found" };
    }

    const instanceName = resolveWhatsappInstanceName(merchant);

    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({
        number: params.toPhone,
        text: params.text
      })
    });

    const data = await res.json().catch(() => ({}));
    const isSuccess = res.ok && Boolean(data?.key?.id);

    await db.whatsAppMessage.create({
      data: {
        merchantId: params.merchantId,
        customerId: params.customerId,
        toPhone: params.toPhone,
        template: params.template,
        body: params.text.substring(0, 500),
        status: isSuccess ? "sent" : "failed",
        errorMessage: isSuccess ? null : JSON.stringify(data),
        metaMessageId: data?.key?.id || `${params.template}_${Date.now()}`
      }
    }).catch(() => {});

    if (isSuccess) {
      console.log(`[WhatsApp Central] ✅ Sent ${params.template} to +${params.toPhone} via instance ${instanceName}`);
      return { success: true, data };
    } else {
      console.error(`[WhatsApp Central] ❌ Send failed (${res.status}) via instance ${instanceName}:`, data);
      return { success: false, error: JSON.stringify(data) };
    }
  } catch (e: any) {
    console.error(`[WhatsApp Central] Exception for ${params.template}:`, e.message);
    return { success: false, error: e.message };
  }
}
