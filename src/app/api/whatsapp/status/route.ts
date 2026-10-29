import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/jwt-secret";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY

async function getAuthMerchant(req: Request) {
  const merchantHeader = req.headers.get("x-merchant-id")
  if (merchantHeader) {
    const m = await db.merchant.findUnique({ where: { id: merchantHeader } })
    if (m) return m
  }

  const url = new URL(req.url)
  const queryMerchantId = url.searchParams.get("merchantId")
  if (queryMerchantId) {
    const m = await db.merchant.findUnique({ where: { id: queryMerchantId } })
    if (m) return m
  }

  try {
    const cookieStore = await cookies()
    const merchantCookie = cookieStore.get("merchant_id")?.value
    if (merchantCookie) {
      const m = await db.merchant.findUnique({ where: { id: merchantCookie } })
      if (m) return m
    }

    const token = cookieStore.get("token")?.value
    if (token) {
      const secret = new TextEncoder().encode(getJwtSecret())
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
 * GET /api/whatsapp/status
 * 
 * Lightweight endpoint — ONLY checks connection state.
 * Does NOT create/delete/refresh any instance or QR code.
 * Used by frontend polling to detect when user successfully scans QR.
 */
export async function GET(req: Request) {
  try {
    const merchant = await getAuthMerchant(req)
    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const instanceName = merchant.whatsappInstanceName
    if (!instanceName) {
      return NextResponse.json({ ok: true, status: "no_instance", connected: false })
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY || "",
    }

    const stateRes = await fetch(
      `${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`,
      { headers }
    ).catch(() => null)

    if (!stateRes || !stateRes.ok) {
      return NextResponse.json({ ok: true, status: "disconnected", connected: false })
    }

    const stateData = await stateRes.json().catch(() => null)
    const instanceData = Array.isArray(stateData)
      ? (stateData.find((inst: any) => inst.name === instanceName) || stateData[0])
      : (stateData?.instance || stateData)
    const state: string = instanceData?.connectionStatus || instanceData?.state || "disconnected"
    const isConnected = state === "open"
    const ownerJid: string | null = instanceData?.ownerJid || null

    // Always sync & normalise phone from ownerJid when connected.
    // This corrects any stale/wrongly-formatted number (e.g. 10-digit without country code)
    // that was saved at registration time — regardless of whether DB already has a value.
    if (isConnected && ownerJid) {
      const normalised = normalizePhone(ownerJid)
      if (normalised && normalised !== merchant.whatsappPhone) {
        await db.merchant.update({
          where: { id: merchant.id },
          data: { whatsappPhone: normalised }
        }).catch(e => console.error("[WhatsApp Status] Failed to sync phone:", e))
        console.log(`[WhatsApp Status] ✅ Phone auto-corrected: ${merchant.whatsappPhone} → ${normalised}`)
      }
    }

    return NextResponse.json({
      ok: true,
      status: state,
      connected: isConnected,
      instanceName,
      whatsappPhone: merchant.whatsappPhone,
    })

  } catch (error: any) {
    console.error("[WhatsApp Status Error]", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
