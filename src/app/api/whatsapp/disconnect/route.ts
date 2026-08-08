import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

if (!process.env.JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set');
const JWT_SECRET = process.env.JWT_SECRET;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080"
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!"

async function getAuthMerchant(req: Request) {
  const merchantHeader = req.headers.get("x-merchant-id")
  if (merchantHeader) {
    const m = await db.merchant.findUnique({ where: { id: merchantHeader } })
    if (m) return m
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    const merchantId = payload.merchantId as string
    if (merchantId) return await db.merchant.findUnique({ where: { id: merchantId } })
  } catch {}

  return await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
}

export async function DELETE(req: Request) {
  try {
    const merchant = await getAuthMerchant(req)
    if (!merchant) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const instanceName = merchant.whatsappInstanceName

    if (instanceName) {
      const headers = {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      }

      // 1. Logout the instance from WhatsApp
      console.log(`[WhatsApp Disconnect] Logging out instance: ${instanceName}`)
      await fetch(`${EVOLUTION_API_URL}/instance/logout/${instanceName}`, { 
        method: "DELETE", 
        headers 
      }).catch(e => console.warn("Logout error:", e.message))

      // Wait a moment for logout to process
      await new Promise(r => setTimeout(r, 500))

      // 2. Delete the instance from Evolution API completely
      console.log(`[WhatsApp Disconnect] Deleting instance: ${instanceName}`)
      await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, { 
        method: "DELETE", 
        headers 
      }).catch(e => console.warn("Delete error:", e.message))
    }

    // 3. Update the database to remove the connection
    await db.merchant.update({
      where: { id: merchant.id },
      data: { 
        whatsappPhone: null, 
        whatsappInstanceName: null 
      }
    })

    return NextResponse.json({ ok: true, message: "Disconnected and instance deleted successfully." })
  } catch (error: any) {
    console.error("[WhatsApp Disconnect Error]", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
