// POST /api/birthdays/redeem — redeem a customer's birthday reward (during window).
// Awards bonus stamps to the customer.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, customerId } = body as { staffId?: string; customerId?: string }
  if (!staffId || !customerId) return err("staffId and customerId required")

  const birthday = await db.birthday.findFirst({ where: { customerId } })
  if (!birthday || birthday.merchantId !== merchant.id) return err("Birthday not scheduled", 404)
  if (birthday.status === "redeemed") return err("Birthday reward already redeemed")

  // Verify we're within the redemption window
  const now = new Date()
  if (birthday.rewardWindowStart && birthday.rewardWindowEnd) {
    if (now < birthday.rewardWindowStart || now > birthday.rewardWindowEnd) {
      return err("Not within birthday redemption window", 409)
    }
  }

  // Award bonus stamps
  const customer = await db.customer.findUnique({ where: { id: customerId } })
  if (!customer) return err("Customer not found", 404)

  const template = await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } })
  if (template) {
    let card = await db.customerStampCard.findFirst({
      where: { customerId: customer.id, stampCardId: template.id, completed: false, redeemed: false },
    })
    if (!card) {
      card = await db.customerStampCard.create({
        data: { customerId: customer.id, stampCardId: template.id, merchantId: merchant.id, stampsCollected: 0 },
      })
    }
    for (let i = 0; i < birthday.bonusStamps; i++) {
      await db.stamp.create({
        data: { customerId: customer.id, stampCardId: template.id, customerStampCardId: card.id, merchantId: merchant.id, source: "birthday_bonus" },
      })
    }
    const newCount = Math.min(card.stampsCollected + birthday.bonusStamps, template.stampsRequired)
    await db.customerStampCard.update({
      where: { id: card.id },
      data: { stampsCollected: newCount, completed: newCount >= template.stampsRequired },
    })
    await db.customer.update({
      where: { id: customer.id },
      data: { lifetimeStamps: { increment: birthday.bonusStamps } },
    })

    // Achievement
    await db.achievement.create({
      data: { customerId: customer.id, type: "birthday_redeemed", label: "Birthday Reward", description: `Redeemed ${birthday.rewardName} on birthday` },
    })
  }

  // WhatsApp
  if (customer.whatsappOptIn && customer.phone) {
    await db.whatsAppMessage.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        toPhone: customer.phone,
        template: "birthday_redeemed",
        body: `Happy Birthday ${customer.name}! 🎂 Sweet Crumb Bakery gifted you ${birthday.bonusStamps} bonus stamps. Have a wonderful day!`,
        status: "queued",
      },
    })
  }

  const updated = await db.birthday.update({
    where: { id: birthday.id },
    data: { status: "redeemed" },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "BIRTHDAY_REDEEMED",
      entity: "Birthday",
      entityId: birthday.id,
      metadata: JSON.stringify({ customer: customer.name, bonusStamps: birthday.bonusStamps }),
    },
  })

  return ok({ birthday: updated, bonusStamps: birthday.bonusStamps })
}
