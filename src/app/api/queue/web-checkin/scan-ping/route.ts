import { NextRequest } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { QR_WA_REDIRECT_ACTION, resolveMerchantForCheckin } from "@/lib/web-checkin"
import { applyScanPingIpLimit } from "@/lib/rate-limiter"

/**
 * POST /api/queue/web-checkin/scan-ping
 * Records anonymous counter scan before customer skips to wa.me so LiveQueue can catch silent Evolution drops.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      merchantId?: string
      slug?: string
      source?: string
    } | null

    if (!body || (!body.merchantId && !body.slug)) {
      return err("merchantId or slug required", 400)
    }

    const summary = await resolveMerchantForCheckin({
      merchantId: body.merchantId,
      slug: body.slug,
    })
    if (!summary) {
      return err("Store not found", 404)
    }
    if (!summary.isActive) {
      return err("Store loyalty check-in is temporarily paused.", 403)
    }

    const pingLimited = await applyScanPingIpLimit(req, summary.merchantId)
    if (pingLimited) return pingLimited

    const scanId = `scan_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`
    const cleanSource = (body.source || "qr_counter").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40)

    await db.auditLog.create({
      data: {
        merchantId: summary.merchantId,
        actorType: "CUSTOMER",
        actorId: "anonymous_scan",
        action: QR_WA_REDIRECT_ACTION,
        entity: "Merchant",
        entityId: scanId,
        metadata: JSON.stringify({
          scanId,
          source: cleanSource,
          scannedAtMs: Date.now(),
        }),
      },
    })

    return ok({ scanId, merchantId: summary.merchantId })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to record scan ping"
    return err(message, 500)
  }
}
