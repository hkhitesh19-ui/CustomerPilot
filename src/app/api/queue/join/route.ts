// POST /api/queue/join — customer scans QR, joins merchant's queue.
// Body: { phone, name?, scanSource? }
// FIXED (V13): Was using findFirst({ orderBy: { createdAt: "asc" } }) which ALWAYS returned
// the first-ever seeded merchant regardless of which merchant's dashboard called this.
// Now correctly resolves the authenticated merchant from JWT session.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { joinQueue } from "@/lib/queue-engine"

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
