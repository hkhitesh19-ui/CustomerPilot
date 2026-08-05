// POST /api/queue/join — customer scans QR, joins merchant's queue.
// Body: { phone, name?, scanSource? }
// This is the FIRST bridge: customer initiates by scanning QR.
// No merchant action required. Customer appears in queue automatically.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { joinQueue } from "@/lib/queue-engine"

export async function POST(req: NextRequest) {
  const merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  if (!merchant) return err("No merchant seeded", 404)

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
