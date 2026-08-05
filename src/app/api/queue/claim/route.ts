// POST /api/queue/claim — merchant taps a waiting customer, awards stamps.
// Body: { staffId, queueId, amount? }
// Max 5 seconds: Tap → Amount → Confirm.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { can, type Role } from "@/lib/rbac"
import { claimFromQueue } from "@/lib/queue-engine"

export async function POST(req: NextRequest) {
  const merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  if (!merchant) return err("No merchant seeded", 404)

  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, queueId, amount } = body as { staffId?: string; queueId?: string; amount?: number }

  if (!staffId || !queueId) return err("staffId and queueId required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)

  // Cashier can claim from queue (this is the primary flow, not a privileged action)
  if (!can(staff.role as Role, "bills.create")) {
    return err("Permission denied — cannot claim from queue", 403)
  }

  try {
    const result = await claimFromQueue({ staffId, queueId, amount })
    if (!result.ok) {
      return err(result.reason ?? "Claim failed", 409)
    }
    return ok(result)
  } catch (e: any) {
    return err(e.message ?? "Claim failed", 500)
  }
}
