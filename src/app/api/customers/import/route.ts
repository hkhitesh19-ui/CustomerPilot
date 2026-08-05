// POST /api/customers/import — bulk import existing customers from a CSV-like
// array. Handles WhatsApp invitation queueing and duplicate prevention.
// Body: { staffId, rows: [{name, phone, email?}] }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

function genCode() {
  return (
    "CP-" +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  )
}

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, rows } = body as { staffId?: string; rows?: { name: string; phone: string; email?: string }[] }

  if (!staffId || !Array.isArray(rows)) return err("staffId and rows[] required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "customers.import")) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staff.id,
        staffId: staff.id,
        action: "RBAC_DENIED",
        entity: "Customer",
        metadata: JSON.stringify({ permission: "customers.import" }),
      },
    })
    return err(deniedMessage(staff.role as Role, "customers.import"), 403)
  }

  const results: { row: { name: string; phone: string }; status: "imported" | "duplicate" | "invalid"; customerId?: string }[] = []

  for (const row of rows) {
    if (!row.name || !row.phone) {
      results.push({ row, status: "invalid" })
      continue
    }
    const existing = await db.customer.findFirst({ where: { merchantId: merchant.id, phone: row.phone } })
    if (existing) {
      results.push({ row, status: "duplicate" })
      continue
    }
    const c = await db.customer.create({
      data: {
        merchantId: merchant.id,
        name: row.name,
        phone: row.phone,
        email: row.email ?? null,
        acquisitionChan: "import",
        referralCode: genCode(),
      },
    })
    // Queue WhatsApp invite
    await db.whatsAppMessage.create({
      data: {
        merchantId: merchant.id,
        customerId: c.id,
        toPhone: c.phone,
        template: "invite",
        body: `Hi ${c.name}! Welcome to ${merchant.name}'s loyalty program. You've been enrolled. Show this message on your next visit to start collecting stamps. 🎟️`,
        status: "queued",
      },
    })
    results.push({ row, status: "imported", customerId: c.id })
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "CUSTOMERS_IMPORTED",
      entity: "Customer",
      metadata: JSON.stringify({ total: rows.length, imported: results.filter((r) => r.status === "imported").length, duplicates: results.filter((r) => r.status === "duplicate").length }),
    },
  })

  return ok({ results })
}
