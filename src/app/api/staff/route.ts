// POST /api/staff — create new staff (owner only).
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, name, phone, email, pin, role } = body as {
    staffId?: string
    name?: string
    phone?: string
    email?: string
    pin?: string
    role?: string
  }

  if (!staffId || !name || !phone || !pin || !role) return err("staffId, name, phone, pin, role required")

  const actor = await db.staff.findUnique({ where: { id: staffId } })
  if (!actor || actor.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(actor.role as Role, "staff.create")) {
    return err(deniedMessage(actor.role as Role, "staff.create"), 403)
  }

  const newStaff = await db.staff.create({
    data: {
      merchantId: merchant.id,
      name,
      phone,
      email,
      pin,
      role,
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: actor.id,
      staffId: actor.id,
      action: "STAFF_CREATED",
      entity: "Staff",
      entityId: newStaff.id,
      metadata: JSON.stringify({ name, role }),
    },
  })

  return ok({ staff: newStaff })
}
