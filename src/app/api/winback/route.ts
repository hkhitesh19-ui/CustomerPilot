// POST /api/winback — manually trigger a win-back action for a customer.
// Body: { staffId, customerId, action: "advance" }
// "advance" moves the customer to the next escalation stage.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { WIN_BACK_STAGES } from "@/lib/winback-engine"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, customerId, action } = body as { staffId?: string; customerId?: string; action?: string }
  if (!staffId || !customerId) return err("staffId and customerId required")

  const customer = await db.customer.findUnique({ where: { id: customerId } })
  if (!customer || customer.merchantId !== merchant.id) return err("Customer not found", 404)

  // Find latest win-back for this customer
  const existing = await db.winBackEscalation.findFirst({
    where: { customerId, outcome: null },
    orderBy: { createdAt: "desc" },
  })

  let nextStage
  if (existing) {
    const currentIdx = WIN_BACK_STAGES.findIndex((s) => s.stage === existing.stage)
    nextStage = WIN_BACK_STAGES[Math.min(currentIdx + 1, WIN_BACK_STAGES.length - 1)]
    // Mark existing as escalated
    await db.winBackEscalation.update({
      where: { id: existing.id },
      data: { outcome: "escalated" },
    })
  } else {
    nextStage = WIN_BACK_STAGES[0]
  }

  if (!nextStage) return err("No escalation stage available", 500)

  // Create new escalation record
  const escalation = await db.winBackEscalation.create({
    data: {
      merchantId: merchant.id,
      customerId,
      stage: nextStage.stage,
      action: nextStage.action,
      messageTemplate: nextStage.messageTemplate,
      sentAt: new Date(),
    },
  })

  // Queue WhatsApp if channel is whatsapp
  if (nextStage.channel === "whatsapp" && customer.phone) {
    await db.whatsAppMessage.create({
      data: {
        merchantId: merchant.id,
        customerId,
        toPhone: customer.phone,
        template: nextStage.messageTemplate,
        body: nextStage.sampleBody(customer.name, merchant.name),
        status: "queued",
      },
    })
  }

  // If day_90 reached and customer has been gone >120 days, mark as lost
  if (nextStage.stage === "day_90") {
    const lastActive = customer.lastActiveAt ? new Date(customer.lastActiveAt) : null
    if (lastActive) {
      const daysSince = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSince >= 120) {
        await db.customer.update({ where: { id: customerId }, data: { status: "churned" } })
        await db.winBackEscalation.update({
          where: { id: escalation.id },
          data: { outcome: "lost" },
        })
      }
    }
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "WINBACK_ESCALATED",
      entity: "WinBackEscalation",
      entityId: escalation.id,
      metadata: JSON.stringify({ customer: customer.name, stage: nextStage.stage, action: nextStage.action }),
    },
  })

  return ok({ escalation, stage: nextStage })
}
