// POST /api/birthdays — set/update a customer's birthday.
// Body: { staffId, customerId, month, day }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { computeBirthdaySchedule } from "@/lib/birthday-engine"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
  const { staffId, customerId, month, day } = body as {
    staffId?: string; customerId?: string; month?: number; day?: number
  }
  if (!staffId || !customerId || typeof month !== "number" || typeof day !== "number") {
    return err("staffId, customerId, month, day required")
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) return err("Invalid month/day")

  const customer = await db.customer.findFirst({ where: { id: customerId } })
  if (!customer || customer.merchantId !== merchant.id) return err("Customer not found", 404)

  // Update customer's birthday
  const updated = await db.customer.update({
    where: { id: customerId },
    data: { birthday: `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` },
  })

  // Upsert Birthday record
  const schedule = computeBirthdaySchedule({
    customerId: customer.id,
    customerName: customer.name,
    birthMonth: month,
    birthDay: day,
  })

  const existing = await db.birthday.findFirst({ where: { customerId } })
  if (existing) {
    await db.birthday.update({
      where: { id: existing.id },
      data: {
        birthMonth: month,
        birthDay: day,
        rewardWindowStart: schedule.windowStart,
        rewardWindowEnd: schedule.windowEnd,
      },
    })
  } else {
    await db.birthday.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        birthMonth: month,
        birthDay: day,
        rewardName: "Free Birthday Slice",
        bonusStamps: 3,
        status: "scheduled",
        rewardWindowStart: schedule.windowStart,
        rewardWindowEnd: schedule.windowEnd,
      },
    })
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "BIRTHDAY_SET",
      entity: "Customer",
      entityId: customerId,
      metadata: JSON.stringify({ name: customer.name, birthday: `${month}/${day}` }),
    },
  })

    return ok({ customer: updated, schedule })
  } catch (error: unknown) {
    console.error('[Birthdays POST Error]', error)
    return err('Failed to set birthday', 500)
  }
}
