// GET /api/queue — merchant sees waiting customers (live queue).
// POST /api/queue — same as join (alternative entry point).
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { getQueue, joinQueue } from "@/lib/queue-engine"

export async function GET(_req: NextRequest) {
  const merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  if (!merchant) return err("No merchant seeded", 404)

  const queue = await getQueue(merchant.id)
  return ok({ queue, count: queue.length })
}

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
