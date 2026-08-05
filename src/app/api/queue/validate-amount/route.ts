// POST /api/queue/validate-amount — AI outlier detection on entered amount.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { validateAmount } from "@/lib/queue-engine"

export async function POST(req: NextRequest) {
  const merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  if (!merchant) return err("No merchant seeded", 404)
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { amount } = body as { amount?: number }
  if (typeof amount !== "number") return err("amount required")
  const result = await validateAmount({ merchantId: merchant.id, amount })
  return ok(result)
}
