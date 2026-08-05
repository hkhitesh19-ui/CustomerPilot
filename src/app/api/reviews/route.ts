// GET /api/reviews — list all reviews (for the Reviews view).
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function GET(_req: NextRequest) {
  const merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  if (!merchant) return err("No merchant seeded", 404)

  const reviews = await db.review.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
  })
  return ok({ reviews })
}
