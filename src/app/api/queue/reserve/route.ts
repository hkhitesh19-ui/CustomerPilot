// POST /api/queue/reserve — merchant taps customer, 10s reservation lock.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { can, type Role } from "@/lib/rbac"
import { reserveFromQueue } from "@/lib/queue-engine"

export async function POST(req: NextRequest) {
  const merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } })
  if (!merchant) return err("No merchant seeded", 404)
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, queueId } = body as { staffId?: string; queueId?: string }
  if (!staffId || !queueId) return err("staffId and queueId required")
  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "bills.create")) return err("Permission denied", 403)
  const result = await reserveFromQueue({ staffId, queueId })
  if (!result.ok) return err(result.reason ?? "Reserve failed", 409)
  return ok(result)
}
