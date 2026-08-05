// POST /api/customers — create a single customer (walk-in registration).
// Body: { staffId, name, phone, email?, whatsappOptIn?, acquisitionChan? }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

function genCode(prefix = "CUST") {
  return (
    prefix +
    "-" +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  )
}

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")

  const { staffId, name, phone, email, whatsappOptIn, acquisitionChan, referredByCode } = body as {
    staffId?: string
    name?: string
    phone?: string
    email?: string
    whatsappOptIn?: boolean
    acquisitionChan?: string
    referredByCode?: string
  }

  if (!staffId || !name || !phone) return err("staffId, name, phone required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "customers.create")) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "RBAC_DENIED",
        entity: "Customer",
        metadata: JSON.stringify({ permission: "customers.create" }),
      },
    })
    return err(deniedMessage(staff.role as Role, "customers.create"), 403)
  }

  // Duplicate prevention: phone must be unique per merchant
  const existing = await db.customer.findFirst({ where: { merchantId: merchant.id, phone } })
  if (existing) {
    return err(`Duplicate customer: phone ${phone} already registered as "${existing.name}"`, 409)
  }

  // Referral resolution
  let referredById: string | null = null
  if (referredByCode) {
    const ref = await db.customer.findFirst({
      where: { merchantId: merchant.id, referralCode: referredByCode },
    })
    if (ref) referredById = ref.id
  }

  const customer = await db.customer.create({
    data: {
      merchantId: merchant.id,
      name,
      phone,
      email,
      whatsappOptIn: whatsappOptIn ?? true,
      acquisitionChan: acquisitionChan ?? (referredById ? "referral" : "walk_in"),
      referredById,
      referralCode: genCode("CP"),
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "CUSTOMER_CREATED",
      entity: "Customer",
      entityId: customer.id,
      metadata: JSON.stringify({ name, phone, acquisitionChan: customer.acquisitionChan }),
    },
  })

  return ok({ customer })
}
