// POST /api/queue/reserve — merchant taps customer, 10s reservation lock.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, type Role } from "@/lib/rbac"
import { reserveFromQueue } from "@/lib/queue-engine"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
    const { staffId, queueId } = body as { staffId?: string; queueId?: string }
    if (!staffId || !queueId) return err("staffId and queueId required")
    if (typeof staffId !== 'string' || typeof queueId !== 'string') return err("staffId and queueId must be strings")
    const staff = await db.staff.findUnique({ where: { id: staffId } })
    if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
    if (!can(staff.role as Role, "bills.create")) return err("Permission denied", 403)
    const result = await reserveFromQueue({ staffId, queueId })
    if (!result.ok) return err(result.reason ?? "Reserve failed", 409)
    return ok(result)
  } catch (error: unknown) {
    console.error('[Queue Reserve Error]', error)
    return err('Failed to reserve queue slot', 500)
  }
}
