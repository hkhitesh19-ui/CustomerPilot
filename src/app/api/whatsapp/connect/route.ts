import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import QRCode from "qrcode"

if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set');
const JWT_SECRET = process.env.JWT_SECRET;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

function getLiveWebhookUrl(): string {
  const base = process.env.WHATSAPP_WEBHOOK_URL ||
    (process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/evolution`
      : "")
  if (!base) return ""
  if (base.includes("secret=")) return base
  const separator = base.includes("?") ? "&" : "?"
  return `${base}${separator}secret=cpilot_webhook_secret_change_in_prod_2026`
}

function buildInstanceName(whatsappPhone?: string | null, merchantId?: string, isNewSession: boolean = false): string {
  const timestamp = Date.now().toString(36)
  if (whatsappPhone) {
    const cleanPhone = whatsappPhone.replace(/\D/g, "")
    if (cleanPhone.length >= 10) {
      // Tarika 1: Smart Hybrid Name (e.g. CP_917203824012_mtlad58c)
      return isNewSession ? `CP_${cleanPhone}_${timestamp}` : `CP_${cleanPhone}`
    }
  }
  const base = `CP_M_${(merchantId || 'anon').slice(0, 8)}`
  return isNewSession ? `${base}_${timestamp}` : base
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
 * Permanent Fix for "couldn't link device, Try again later":
 * 1. Guarantees 100% FRESH WebSocket handshake directly with WhatsApp servers (count = 1).
 * 2. Uses session-unique instance names to prevent "403: Name already in use" collisions.
 * 3. Cleanly purges any stale aborted instances from Evolution API before creation.
 * 4. Resolves the latest active Pinggy/ngrok webhook URL dynamically on every call.
 * 5. Supports silent background refresh during active 10-minute session (?silent=true).
 */
async function handleConnect(req: Request) {
  try {
    const merchant = await getAuthMerchant(req)
    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const isSilent = url.searchParams.get("silent") === "true"
    let forceRefresh = url.searchParams.get("force") === "true" || url.searchParams.get("refresh") === "true"
    let inputPhone = url.searchParams.get("phone") || url.searchParams.get("number")

    if (req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({}))
        if (body.forceRefresh !== undefined) forceRefresh = !!body.forceRefresh
        if (body.phone) inputPhone = body.phone
        if (body.number) inputPhone = body.number
      } catch {}
    }

    let cleanPhone: string | null = null
    const candidatePhone = inputPhone || merchant.whatsappPhone
    if (candidatePhone) {
      const digits = candidatePhone.replace(/\D/g, "")
      if (digits.length >= 10) {
        cleanPhone = digits.length === 10 ? `91${digits}` : digits
      }
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY,
    }

    const currentInstanceName = merchant.whatsappInstanceName

    // ── Step 1: Check if already verified & open ──────────────────────────────
    if (currentInstanceName) {
      const stateRes = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${currentInstanceName}`, { headers }).catch(() => null)
      const stateData = stateRes && stateRes.ok ? await stateRes.json().catch(() => null) : null
      const currentState: string = stateData?.instance?.state || "unknown"

      if (currentState === "open" && !forceRefresh) {
        return NextResponse.json({
          ok: true, status: "open", connected: true, instanceName: currentInstanceName,
          whatsappPhone: merchant.whatsappPhone || cleanPhone, message: "WhatsApp connected! 🎉"
        })
      }

      // ── Step 2: If silent background refresh and instance is actively connecting ──
      if (isSilent && currentState === "connecting" && !forceRefresh) {
        const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${currentInstanceName}`, { headers }).catch(() => null)
        const connectData = connectRes && connectRes.ok ? await connectRes.json().catch(() => null) : null

        const qrCount = connectData?.qrcode?.count ?? connectData?.count ?? 0
        // If qr count is healthy (< 22), return the rotated QR silently
        if (qrCount < 22 && (connectData?.qrcode?.base64 || connectData?.base64 || connectData?.qrcode?.code || connectData?.code)) {
          let qrBase64: string | null = connectData?.qrcode?.base64 || connectData?.base64 || null
          const rawCode: string | null = connectData?.qrcode?.code || connectData?.code || null
          if (rawCode) {
            try {
              qrBase64 = await QRCode.toDataURL(rawCode, { width: 800, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
            } catch {}
          }
          return NextResponse.json({
            ok: true, status: "connecting", connected: false, instanceName: currentInstanceName,
            qrCodeBase64: qrBase64, count: qrCount
          })
        }
        // If count is >= 22, fall through to recreate fresh instance so it doesn't hit 30-limit wall
      }

      // Clean up previous stale instance from Evolution API
      console.log(`[WhatsApp Connect] Cleaning previous instance "${currentInstanceName}"`)
      await fetch(`${EVOLUTION_API_URL}/instance/logout/${currentInstanceName}`, { method: "DELETE", headers }).catch(() => null)
      await fetch(`${EVOLUTION_API_URL}/instance/delete/${currentInstanceName}`, { method: "DELETE", headers }).catch(() => null)
    }

    // ── Step 3: Create a 100% FRESH, session-unique instance ──────────────────
    const freshInstanceName = buildInstanceName(cleanPhone, merchant.id, true)
    console.log(`[WhatsApp Connect] Creating fresh session-unique instance: ${freshInstanceName}`)

    const liveWebhook = getLiveWebhookUrl()
    const createPayload: Record<string, any> = {
      instanceName: freshInstanceName,
      token: `cpilot_${merchant.id.slice(0, 8)}`,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      reject_call: false,
    }

    if (cleanPhone) {
      createPayload.number = cleanPhone
    }

    if (liveWebhook) {
      createPayload.webhook = {
        url: liveWebhook,
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

    // If QR code is not immediately ready in create response, poll connect once
    if (!qrBase64 && !rawCode) {
      await new Promise((r) => setTimeout(r, 1200))
      const pollConnect = await fetch(`${EVOLUTION_API_URL}/instance/connect/${freshInstanceName}`, { headers }).catch(() => null)
      if (pollConnect && pollConnect.ok) {
        const pData = await pollConnect.json().catch(() => null)
        qrBase64 = pData?.qrcode?.base64 || pData?.base64 || null
        rawCode = pData?.qrcode?.code || pData?.code || null
      }
    }

    if (rawCode) {
      try {
        qrBase64 = await QRCode.toDataURL(rawCode, { width: 800, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      } catch (err) {
        console.warn(`[WhatsApp Connect] Failed to generate high-res QR, falling back to base64`, err)
      }
    }

    // Persist freshInstanceName in merchant DB so status polling tracks this exact instance
    await db.merchant.update({
      where: { id: merchant.id },
      data: {
        whatsappInstanceName: freshInstanceName,
        ...(cleanPhone && !merchant.whatsappPhone ? { whatsappPhone: cleanPhone } : {})
      }
    })

    console.log(`[WhatsApp Connect] Fresh instance created successfully: ${freshInstanceName} | QR Ready: ${!!qrBase64}`)

    return NextResponse.json({
      ok: true, status: "connecting", connected: false, instanceName: freshInstanceName,
      whatsappPhone: cleanPhone || merchant.whatsappPhone,
      qrCodeBase64: qrBase64,
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
