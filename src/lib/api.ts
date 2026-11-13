// CustomerPilot V5 — API helpers
import { db } from "@/lib/db"
import { headers, cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/jwt-secret"

export async function getAuthenticatedMerchant() {
  try {
    const headerStore = await headers()
    let merchantId = headerStore.get('x-merchant-id')
    let userRole = headerStore.get('x-user-role')

    if (!merchantId) {
      try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (token) {
          const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()))
          merchantId = (payload.merchantId as string) || null
          userRole = (payload.role as string) || null
        }
      } catch {
        // Token invalid or absent
      }
    }

    if (merchantId && merchantId !== 'admin_merchant') {
      const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
      if (merchant) return merchant
    }

    // If Super Admin without a specific merchant, fallback to Cake Connection or primary merchant
    if (userRole === 'super_admin' || merchantId === 'admin_merchant') {
      const cakeConnection = await db.merchant.findUnique({ where: { id: 'cmtymavfx0002kx008lbfvp57' } })
      if (cakeConnection) return cakeConnection
      const primaryMerchant = await db.merchant.findFirst({
        where: { status: 'active' },
        orderBy: { createdAt: 'asc' }
      })
      if (primaryMerchant) return primaryMerchant
    }
  } catch {
    // If called outside Next.js request context
  }

  // Explicit demo fallback only if DEMO_MODE env flag is explicitly set
  if (process.env.DEMO_MODE === 'true') {
    return db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  }

  return null
}

export async function requireMerchant() {
  const m = await getAuthenticatedMerchant()
  if (!m) throw new Error("UNAUTHORIZED: Authenticated merchant session required.")
  return m
}

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init)
}

/** Use for POST routes that create a new resource (HTTP 201 Created). */
export function created<T>(data: T) {
  return Response.json({ ok: true, data }, { status: 201 })
}

export function err(message: string, status = 400, extra?: Record<string, unknown>) {
  return Response.json({ ok: false, error: message, ...extra }, { status })
}
