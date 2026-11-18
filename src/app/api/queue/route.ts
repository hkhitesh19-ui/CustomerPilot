// GET /api/queue — merchant sees waiting customers (live queue).
// POST /api/queue — same as join (alternative entry point).
// FIXED (V13): Was using findFirst({ orderBy: { createdAt: "asc" } }) which ALWAYS returned
// the first-ever seeded merchant regardless of which merchant's dashboard was viewing.
// This caused Maw & Paw and all new merchants to see Cake Connection's queue instead of their own.
// Now correctly resolves the authenticated merchant from JWT session.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { getQueue, joinQueue } from "@/lib/queue-engine"

export async function GET(_req: NextRequest) {
  const merchant = await getAuthenticatedMerchant()
  if (!merchant) return err("Unauthorized: No merchant session found", 401)

  const queue = await getQueue(merchant.id)
  return ok({ queue, count: queue.length })
}

export async function POST(req: NextRequest) {
  const merchant = await getAuthenticatedMerchant()
  if (!merchant) return err("Unauthorized: No merchant session found", 401)

  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { phone, name, scanSource } = body as { phone?: string; name?: string; scanSource?: string }

  if (!phone) return err("phone is required")

  try {
    const result = await joinQueue({ merchantId: merchant.id, phone, name, scanSource })
    return ok(result)
  } catch (e: any) {
    return err(e.message ?? "Failed to join queue", 500)
  }
}
