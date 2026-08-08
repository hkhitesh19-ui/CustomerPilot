// GET /api/fraud-alerts — list fraud alerts for the merchant (auth required).
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function GET(_req: NextRequest) {
  try {
    const merchant = await requireMerchant()

    const alerts = await db.fraudAlert.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    return ok({ alerts })
  } catch (error: any) {
    console.error('[Fraud Alerts GET Error]', error)
    if (error?.message?.includes('UNAUTHORIZED') || error?.message?.includes('Unauthorized')) {
      return err('Unauthorized: Authentication required', 401)
    }
    return err('Failed to fetch fraud alerts', 500)
  }
}
