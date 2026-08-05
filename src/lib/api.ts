// CustomerPilot V5 — API helpers
import { db } from "@/lib/db"

export async function getFirstMerchant() {
  // Demo: single-tenant mode, so we always pick the first merchant.
  return db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
}

export async function requireMerchant() {
  const m = await getFirstMerchant()
  if (!m) throw new Error("No merchant seeded. Run `bun run src/lib/seed.ts`.")
  return m
}

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json({ ok: true, data }, init)
}

export function err(message: string, status = 400, extra?: Record<string, unknown>) {
  return Response.json({ ok: false, error: message, ...extra }, { status })
}
