// POST /api/support — create a new support ticket.
// Body: { staffId, subject, category, priority, description }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, subject, category, priority, description } = body as {
    staffId?: string; subject?: string; category?: string; priority?: string; description?: string
  }
  if (!staffId || !subject || !description) return err("staffId, subject, description required")

  const ticket = await db.supportTicket.create({
    data: {
      merchantId: merchant.id,
      subject,
      category: category ?? "other",
      priority: priority ?? "normal",
      description,
      status: "open",
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "SUPPORT_TICKET_CREATED",
      entity: "SupportTicket",
      entityId: ticket.id,
      metadata: JSON.stringify({ subject, category, priority }),
    },
  })

  return ok({ ticket })
}
