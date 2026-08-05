// GET /api/fraud-alerts — list fraud alerts for the merchant.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function GET(_req: NextRequest) {
  const merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  if (!merchant) return err("No merchant seeded", 404)

  const alerts = await db.fraudAlert.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  return ok({ alerts })
}
