import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import QRCode from "qrcode"

if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set');
const JWT_SECRET = process.env.JWT_SECRET;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY
// Use WHATSAPP_WEBHOOK_URL first (set this to ngrok/production URL).
// If not set, fall back to NEXT_PUBLIC_APP_URL regardless of localhost —
// Evolution API is on a remote VPS and needs a reachable URL.
// On local dev, run ngrok and set WHATSAPP_WEBHOOK_URL in .env.
const PUBLIC_WEBHOOK_URL = process.env.WHATSAPP_WEBHOOK_URL ||
  (process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/evolution`
    : "")

function buildInstanceName(whatsappPhone?: string | null, merchantId?: string): string {
  if (whatsappPhone) {
    const cleanPhone = whatsappPhone.replace(/\D/g, "")
    if (cleanPhone.length >= 10) return `CP_M${cleanPhone}`
  }
  return `CP_M_${merchantId || Date.now()}`
}

async function getAuthMerchant(req: Request) {
  const merchantHeader = req.headers.get("x-merchant-id")
  if (merchantHeader) {
    const m = await db.merchant.findUnique({ where: { id: merchantHeader } })
    if (m) return m
  }

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const merchantId = payload.merchantId as string
      if (merchantId) {
        const m = await db.merchant.findUnique({ where: { id: merchantId } })
        if (m) return m
      }
    }
  } catch {}

  return await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
}

/**
 * GET /api/whatsapp/connect
 * 
 * Called ONCE when onboarding Step 2 loads.
 * Logic:
 *   "open"       → return connected, no changes
 *   "connecting" → instance is active & showing QR. Fetch fresh QR via /instance/connect. Do NOT delete.
 *   "close" / not exists → logout + delete stale, create fresh instance, get QR from create response
 */
export async function GET(req: Request) {
  try {
    const merchant = await getAuthMerchant(req)
    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const instanceName = merchant.whatsappInstanceName || buildInstanceName(merchant.whatsappPhone, merchant.id)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY,
    }

    // ── Step 1: Check current state ─────────────────────────────────────────
    const stateRes = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, { headers }).catch(() => null)
    const stateData = stateRes && stateRes.ok ? await stateRes.json().catch(() => null) : null
    const currentState: string = stateData?.instance?.state || "unknown"
    const instanceExists = !!(stateRes && stateRes.ok)

    console.log(`[WhatsApp Connect] Instance: ${instanceName} | State: ${currentState} | Exists: ${instanceExists}`)

    // ── CASE 1: Already connected ────────────────────────────────────────────
    if (currentState === "open") {
      if (merchant.whatsappInstanceName !== instanceName) {
        await db.merchant.update({ where: { id: merchant.id }, data: { whatsappInstanceName: instanceName } })
      }
      return NextResponse.json({
        ok: true, status: "open", connected: true, instanceName,
        whatsappPhone: merchant.whatsappPhone, message: "WhatsApp connected! 🎉"
      })
    }

    // ── CASE 2: Instance exists in "connecting" state (QR is live, user may be scanning) ──
    // DO NOT delete — just fetch the current QR from /instance/connect
    if (currentState === "connecting" && instanceExists) {
      console.log(`[WhatsApp Connect] Instance is connecting — fetching current QR without touching instance`)
      const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, { headers }).catch(() => null)
      const connectData = connectRes && connectRes.ok ? await connectRes.json().catch(() => null) : null

      let qrBase64: string | null = connectData?.qrcode?.base64 || connectData?.base64 || null
      const rawCode: string | null = connectData?.qrcode?.code || connectData?.code || null
      const pairingCode: string | null = connectData?.qrcode?.pairingCode || connectData?.pairingCode || null

      if (rawCode) {
        try {
          qrBase64 = await QRCode.toDataURL(rawCode, { width: 800, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
          console.log(`[WhatsApp Connect] ✓ Generated Super High Res QR Code natively from /connect`)
        } catch (err) {
          console.warn(`[WhatsApp Connect] Failed to generate high-res QR, falling back to Evolution API's base64`, err)
        }
      } else if (qrBase64) {
        console.log(`[WhatsApp Connect] ✓ QR refreshed from /connect — length: ${qrBase64.length}`)
      }

      // Persist instanceName
      if (merchant.whatsappInstanceName !== instanceName) {
        await db.merchant.update({ where: { id: merchant.id }, data: { whatsappInstanceName: instanceName } })
      }

      return NextResponse.json({
        ok: true, status: "connecting", connected: false, instanceName,
        whatsappPhone: merchant.whatsappPhone,
        qrCodeBase64: qrBase64,
        pairingCode: pairingCode && pairingCode.length <= 12 ? pairingCode : null,
      })
    }

    // ── CASE 3: Instance is "close", "disconnected", or doesn't exist → Create fresh ──
    if (instanceExists) {
      console.log(`[WhatsApp Connect] State "${currentState}" — logout + delete then recreate`)
      await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, { method: "DELETE", headers }).catch(() => null)
      await new Promise((r) => setTimeout(r, 600))
      await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, { method: "DELETE", headers }).catch(() => null)
      await new Promise((r) => setTimeout(r, 1200))
    }

    // ── Create fresh instance — Evolution v2 returns QR in CREATE response ───
    console.log(`[WhatsApp Connect] Creating fresh instance: ${instanceName}`)
    const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        instanceName,
        token: `cpilot_${merchant.id.slice(0, 8)}`,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        reject_call: false,
        webhook: {
          url: PUBLIC_WEBHOOK_URL,
          byEvents: false,
          base64: false,
          events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
          headers: {
            "X-Pinggy-No-Screen": "true"
          }
        },
      }),
    }).catch(() => null)

    if (!createRes || !createRes.ok) {
      const errText = createRes ? await createRes.text().catch(() => "no body") : "fetch failed"
      console.error(`[WhatsApp Connect] Create failed ${createRes?.status}: ${errText}`)
      return NextResponse.json({ ok: false, error: `Failed to create WhatsApp instance: ${errText}` }, { status: 500 })
    }

    const createData = await createRes.json().catch(() => null)
    console.log(`[WhatsApp Connect] Create response keys:`, JSON.stringify(Object.keys(createData || {})))

    // Evolution v2 verified structure: createData.qrcode.base64 = "data:image/png;base64,iVBOR..."
    const rawCode: string | null = createData?.qrcode?.code || null
    let qrBase64: string | null = createData?.qrcode?.base64 || null
    const pairingCode: string | null = createData?.qrcode?.pairingCode || null

    if (rawCode) {
      try {
        qrBase64 = await QRCode.toDataURL(rawCode, { width: 800, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        console.log(`[WhatsApp Connect] ✓ Generated Super High Res QR Code natively`)
      } catch (err) {
        console.warn(`[WhatsApp Connect] Failed to generate high-res QR, falling back to Evolution API's base64`, err)
      }
    } else if (qrBase64) {
      console.log(`[WhatsApp Connect] ✓ QR image from CREATE — length: ${qrBase64.length}`)
    } else {
      console.warn(`[WhatsApp Connect] ✗ No QR base64 in create response`)
    }

    // Persist instanceName
    if (merchant.whatsappInstanceName !== instanceName) {
      await db.merchant.update({ where: { id: merchant.id }, data: { whatsappInstanceName: instanceName } })
    }

    return NextResponse.json({
      ok: true, status: "connecting", connected: false, instanceName,
      whatsappPhone: merchant.whatsappPhone,
      qrCodeBase64: qrBase64,
      pairingCode: pairingCode && pairingCode.length <= 12 ? pairingCode : null,
    })

  } catch (error: any) {
    console.error("[WhatsApp Connect Error]", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
