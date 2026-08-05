import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-do-not-use-in-prod"
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!"

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
      "apikey": EVOLUTION_API_KEY,
    }

    const stateRes = await fetch(
      `${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${instanceName}`,
      { headers }
    ).catch(() => null)

    if (!stateRes || !stateRes.ok) {
      return NextResponse.json({ ok: true, status: "disconnected", connected: false })
    }

    const stateData = await stateRes.json().catch(() => null)
    const instanceData = Array.isArray(stateData) ? stateData[0] : null
    const state: string = instanceData?.connectionStatus || "disconnected"
    const isConnected = state === "open"
    const ownerJid: string | null = instanceData?.ownerJid || null

    // If now connected, save ownerJid phone to merchant DB
    if (isConnected && ownerJid && !merchant.whatsappPhone) {
      const phone = ownerJid.replace("@s.whatsapp.net", "").replace(/\D/g, "")
      if (phone.length >= 10) {
        await db.merchant.update({
          where: { id: merchant.id },
          data: { whatsappPhone: phone }
        })
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
