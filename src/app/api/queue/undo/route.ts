// POST /api/queue/undo — undo a claim within 30s window.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, type Role } from "@/lib/rbac"
import { undoClaim } from "@/lib/queue-engine"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
    const { staffId, queueId, reason } = body as { staffId?: string; queueId?: string; reason?: string }
    if (!staffId || !queueId) return err("staffId and queueId required")
    if (typeof staffId !== 'string' || typeof queueId !== 'string') return err("staffId and queueId must be strings")
    const staff = await db.staff.findUnique({ where: { id: staffId } })
    if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
    if (!can(staff.role as Role, "bills.create")) return err("Permission denied", 403)
    const result = await undoClaim({ staffId, queueId, reason })
    if (!result.ok) return err(result.reason ?? "Undo failed", 409)
    return ok(result)
  } catch (error: unknown) {
    console.error('[Queue Undo Error]', error)
    return err('Failed to undo queue claim', 500)
  }
}
