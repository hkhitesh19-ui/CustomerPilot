import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { QR_WA_DISMISS_ACTION } from "@/lib/web-checkin"

/**
 * POST /api/queue/dismiss-scan
 * Authenticated merchant endpoint to dismiss a pending QR scan alert in LiveQueue.
 */
export async function POST(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant()
    if (!merchant) {
      return err("Unauthorized", 401)
    }

    const body = (await req.json().catch(() => null)) as { scanId?: string } | null
    const scanId = body?.scanId?.trim()
    if (!scanId) {
      return err("scanId is required", 400)
    }

    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: merchant.id,
        action: QR_WA_DISMISS_ACTION,
        entity: "Merchant",
        entityId: scanId,
        metadata: JSON.stringify({ scanId, dismissedAtMs: Date.now() }),
      },
    })

    return ok({ dismissed: true, scanId })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to dismiss scan alert"
    return err(message, 500)
  }
}
