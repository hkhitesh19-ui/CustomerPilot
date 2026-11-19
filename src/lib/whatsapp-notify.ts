import { db } from '@/lib/db';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

const SEND_TIMEOUT_MS = 6000;

/**
 * Sends a WhatsApp notification via Evolution API for a specific merchant instance.
 * Strict rules:
 * - Uses merchant.whatsappInstanceName ONLY (no fallbacks to guessed names or defaultInstance)
 * - 6s timeout with abort signal
 * - Logs to db.whatsAppMessage with 'sent' or 'failed' (capturing real error or timeout message)
 * - Never blocks calling workflow on failures
 */
export async function sendWhatsAppNotification(
  merchantId: string,
  toPhone: string,
  text: string,
  templateKey: string = "STAMP_AWARDED"
) {
  let ok = false;
  let errorMsg: string | null = null;
  let metaId: string | undefined;

  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      errorMsg = "Evolution API credentials not configured";
    } else {
      const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
      const instanceName = merchant?.whatsappInstanceName;
      if (!instanceName) {
        // never fall back to a shared/guessed instance (cross-merchant leak)
        errorMsg = "No WhatsApp instance configured for merchant";
      } else {
        const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${encodeURIComponent(instanceName)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
          body: JSON.stringify({ number: toPhone, text }),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });
        const data: any = await res.json().catch(() => ({}));
        if (res.ok) {
          ok = true;
          metaId = data?.key?.id;
        } else {
          errorMsg = `[${instanceName}] HTTP ${res.status}: ${String(data?.response?.message ?? data?.message ?? data?.error ?? "unknown")}`.slice(0, 300);
        }
      }
    }
  } catch (e: any) {
    errorMsg = (e?.name === "TimeoutError" || e?.name === "AbortError")
      ? `Timeout ${SEND_TIMEOUT_MS}ms (delivery unknown)`
      : String(e?.message || e).slice(0, 300);
  }

  await db.whatsAppMessage.create({
    data: {
      merchantId,
      toPhone,
      template: templateKey,
      body: text.substring(0, 500),
      status: ok ? "sent" : "failed",
      sentAt: ok ? new Date() : null,
      metaMessageId: metaId || `stamp_${Date.now()}`,
      errorMessage: errorMsg,
    },
  }).catch((err: any) => console.error("[Award API] failed to log WhatsApp message:", err?.message));

  if (!ok) {
    console.error(`[Award API] WhatsApp ${templateKey} to +${toPhone.slice(0, 4)}**** failed: ${errorMsg}`);
  }
}
