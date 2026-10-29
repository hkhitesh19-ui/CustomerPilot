// GET  /api/gbp/checklist?merchantId=xxx  — Returns all checklist items + completion %
// POST /api/gbp/checklist/complete         — Mark a single item done
//   Body: { itemId, doneByEmail, notes }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get("merchantId")
    if (!merchantId) return err("merchantId query param required")

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        gbpServiceTrack: true,
        gbpProfileStatus: true,
        gbpOnboardingWeek: true,
        gbpReviewCount: true,
        gbpReviewVelocityCap: true,
        gbpCitationsReady: true,
        gbpSurgeryCompleted: true,
        gbpMapTrafficEnabled: true,
        gbpTrackStartedAt: true,
        gbpLastReportSentAt: true,
      },
    })
    if (!merchant) return err("Merchant not found", 404)

    const items = await db.gbpChecklistItem.findMany({
      where: { merchantId },
      orderBy: [{ week: "asc" }, { createdAt: "asc" }],
    })

    const totalItems = items.length
    const doneItems = items.filter((i) => i.isDone).length
    const completionPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

    // Group items by week for easier UI rendering
    const byWeek: Record<number, typeof items> = {}
    for (const item of items) {
      if (!byWeek[item.week]) byWeek[item.week] = []
      byWeek[item.week].push(item)
    }

    return ok({
      merchant,
      checklist: items,
      byWeek,
      stats: { totalItems, doneItems, pendingItems: totalItems - doneItems, completionPct },
    })
  } catch (error) {
    console.error("[GBP Checklist GET] Error:", error)
    return err("Failed to fetch checklist", 500)
  }
}
