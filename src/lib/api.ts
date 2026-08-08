// CustomerPilot V5 — API helpers
import { db } from "@/lib/db"

import { headers } from "next/headers"

export async function getAuthenticatedMerchant() {
  try {
    const headerStore = await headers()
    const merchantId = headerStore.get('x-merchant-id')
    if (merchantId) {
      const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
      if (merchant) return merchant
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
