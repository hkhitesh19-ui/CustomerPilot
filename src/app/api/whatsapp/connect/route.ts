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
 * GET & POST /api/whatsapp/connect
 * 
 * Supports:
 * 1. QR Code generation (with live 30s TTL)
 * 2. WhatsApp Pairing Code generation (via phone number, zero camera scanning)
 * 3. Force-refresh / clean-wipe (clearing stuck sessions on Evolution API)
 */
async function handleConnect(req: Request) {
  try {
    const merchant = await getAuthMerchant(req)
    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    let forceRefresh = url.searchParams.get("force") === "true" || url.searchParams.get("refresh") === "true"
    let inputPhone = url.searchParams.get("phone") || url.searchParams.get("number")

    // Check POST body if applicable
    if (req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}))
        if (body.forceRefresh !== undefined) forceRefresh = !!body.forceRefresh
        if (body.phone) inputPhone = body.phone
        if (body.number) inputPhone = body.number
      } catch {}
    }

    // Clean phone number (e.g. +91 90333 04707 -> 919033304707)
    let cleanPhone: string | null = null
    const candidatePhone = inputPhone || merchant.whatsappPhone
    if (candidatePhone) {
      const digits = candidatePhone.replace(/\D/g, "")
      if (digits.length >= 10) {
        // If 10 digits without country code, default to 91 (India)
        cleanPhone = digits.length === 10 ? `91${digits}` : digits
      }
    }

    const instanceName = merchant.whatsappInstanceName || buildInstanceName(cleanPhone, merchant.id)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY,
    }

    // ── Step 1: Check current state ─────────────────────────────────────────
    const stateRes = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, { headers }).catch(() => null)
    const stateData = stateRes && stateRes.ok ? await stateRes.json().catch(() => null) : null
    const currentState: string = stateData?.instance?.state || "unknown"
    const instanceExists = !!(stateRes && stateRes.ok)

    console.log(`[WhatsApp Connect] Instance: ${instanceName} | State: ${currentState} | Exists: ${instanceExists} | Force: ${forceRefresh} | Phone: ${cleanPhone || 'none'}`)

    // ── CASE 1: Already connected ────────────────────────────────────────────
    if (currentState === "open" && !forceRefresh) {
      if (merchant.whatsappInstanceName !== instanceName) {
        await db.merchant.update({ where: { id: merchant.id }, data: { whatsappInstanceName: instanceName } })
      }
      return NextResponse.json({
        ok: true, status: "open", connected: true, instanceName,
        whatsappPhone: merchant.whatsappPhone || cleanPhone, message: "WhatsApp connected! 🎉"
      })
    }

    // ── CASE 2: Instance exists in "connecting" state and NO force refresh and NO phone requested ──
    if (currentState === "connecting" && instanceExists && !forceRefresh && !inputPhone) {
      console.log(`[WhatsApp Connect] Instance is connecting — fetching current QR from /instance/connect`)
      const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, { headers }).catch(() => null)
      const connectData = connectRes && connectRes.ok ? await connectRes.json().catch(() => null) : null

      let qrBase64: string | null = connectData?.qrcode?.base64 || connectData?.base64 || null
      const rawCode: string | null = connectData?.qrcode?.code || connectData?.code || null
      let pairingCode: string | null = connectData?.pairingCode || connectData?.qrcode?.pairingCode || null

      if (rawCode) {
        try {
          qrBase64 = await QRCode.toDataURL(rawCode, { width: 800, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        } catch (err) {
          console.warn(`[WhatsApp Connect] Failed to generate high-res QR, falling back to base64`, err)
        }
      }

      if (pairingCode && pairingCode.length === 8 && !pairingCode.includes("-")) {
        pairingCode = `${pairingCode.slice(0, 4)}-${pairingCode.slice(4)}`
      }

      if (merchant.whatsappInstanceName !== instanceName) {
        await db.merchant.update({ where: { id: merchant.id }, data: { whatsappInstanceName: instanceName } })
      }

      return NextResponse.json({
        ok: true, status: "connecting", connected: false, instanceName,
        whatsappPhone: merchant.whatsappPhone || cleanPhone,
        qrCodeBase64: qrBase64,
        pairingCode: pairingCode && pairingCode.length <= 15 ? pairingCode : null,
        expiresIn: 30,
      })
    }

    // ── CASE 3: Force refresh, state is "close", or new phone provided → Clean wipe then recreate ──
    if (instanceExists) {
      console.log(`[WhatsApp Connect] Cleaning stale instance "${instanceName}" (state: ${currentState}, force: ${forceRefresh})`)
      await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, { method: "DELETE", headers }).catch(() => null)
      await new Promise((r) => setTimeout(r, 400))
      await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, { method: "DELETE", headers }).catch(() => null)
      await new Promise((r) => setTimeout(r, 800))
    }

    // ── Create fresh instance with optional phoneNumber for pairing code ───
    console.log(`[WhatsApp Connect] Creating fresh instance: ${instanceName} with number: ${cleanPhone || 'none'}`)
    const createPayload: Record<string, any> = {
      instanceName,
      token: `cpilot_${merchant.id.slice(0, 8)}`,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      reject_call: false,
    }

    if (cleanPhone) {
      createPayload.number = cleanPhone
    }

    if (PUBLIC_WEBHOOK_URL) {
      createPayload.webhook = {
        url: PUBLIC_WEBHOOK_URL,
        byEvents: false,
        base64: false,
        events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
        headers: {
          "X-Pinggy-No-Screen": "true"
        }
      }
    }

    const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(createPayload),
    }).catch(() => null)

    if (!createRes || !createRes.ok) {
      const errText = createRes ? await createRes.text().catch(() => "no body") : "fetch failed"
      console.error(`[WhatsApp Connect] Create failed ${createRes?.status}: ${errText}`)
      return NextResponse.json({ ok: false, error: `Failed to create WhatsApp instance: ${errText}` }, { status: 500 })
    }

    const createData = await createRes.json().catch(() => null)
    let rawCode: string | null = createData?.qrcode?.code || null
    let qrBase64: string | null = createData?.qrcode?.base64 || null
    let pairingCode: string | null = createData?.qrcode?.pairingCode || null

    // If pairing code requested but not returned immediately in create response, poll /instance/connect once
    if (cleanPhone && !pairingCode) {
      await new Promise((r) => setTimeout(r, 1500))
      const pollConnect = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, { headers }).catch(() => null)
      if (pollConnect && pollConnect.ok) {
        const pData = await pollConnect.json().catch(() => null)
        pairingCode = pData?.pairingCode || pData?.qrcode?.pairingCode || null
        if (!qrBase64 && (pData?.qrcode?.base64 || pData?.base64)) {
          qrBase64 = pData?.qrcode?.base64 || pData?.base64
        }
        if (!rawCode && (pData?.qrcode?.code || pData?.code)) {
          rawCode = pData?.qrcode?.code || pData?.code
        }
      }
    }

    if (rawCode) {
      try {
        qrBase64 = await QRCode.toDataURL(rawCode, { width: 800, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      } catch (err) {
        console.warn(`[WhatsApp Connect] Failed to generate high-res QR`, err)
      }
    }

    if (pairingCode && pairingCode.length === 8 && !pairingCode.includes("-")) {
      pairingCode = `${pairingCode.slice(0, 4)}-${pairingCode.slice(4)}`
    }

    // Persist instanceName
    await db.merchant.update({
      where: { id: merchant.id },
      data: {
        whatsappInstanceName: instanceName,
        ...(cleanPhone && !merchant.whatsappPhone ? { whatsappPhone: cleanPhone } : {})
      }
    })

    return NextResponse.json({
      ok: true, status: "connecting", connected: false, instanceName,
      whatsappPhone: cleanPhone || merchant.whatsappPhone,
      qrCodeBase64: qrBase64,
      pairingCode: pairingCode && pairingCode.length <= 15 ? pairingCode : null,
      expiresIn: 30,
    })

  } catch (error: any) {
    console.error("[WhatsApp Connect Error]", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return handleConnect(req)
}

export async function POST(req: Request) {
  return handleConnect(req)
}

