// POST /api/customers/block — block or unblock a customer (manager+).
// Body: { staffId, customerId, blocked: boolean, reason? }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, customerId, blocked, reason } = body as {
    staffId?: string
    customerId?: string
    blocked?: boolean
    reason?: string
  }

  if (!staffId || !customerId || typeof blocked !== "boolean") {
    return err("staffId, customerId, blocked required")
  }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "customers.block")) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "RBAC_DENIED",
        entity: "Customer",
        metadata: JSON.stringify({ permission: "customers.block" }),
      },
    })
    return err(deniedMessage(staff.role as Role, "customers.block"), 403)
  }

  const c = await db.customer.findUnique({ where: { id: customerId } })
  if (!c || c.merchantId !== merchant.id) return err("Customer not found", 404)

  const updated = await db.customer.update({
    where: { id: customerId },
    data: { status: blocked ? "blocked" : "active" },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: blocked ? "CUSTOMER_BLOCKED" : "CUSTOMER_UNBLOCKED",
      entity: "Customer",
      entityId: customerId,
      metadata: JSON.stringify({ name: c.name, reason }),
    },
  })

  return ok({ customer: updated })
}
