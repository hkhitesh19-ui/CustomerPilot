// POST /api/support — create a new support ticket.
// Body: { staffId, subject, category, priority, description }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, created, err, requireMerchant } from "@/lib/api"
import { CreateSupportTicketSchema, zodErrors } from "@/lib/schemas"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")

    // Zod validation
    const parse = CreateSupportTicketSchema.safeParse(body)
    if (!parse.success) return err(zodErrors(parse.error).join('; '), 400)
    const { subject, category, priority, description } = parse.data

    // staffId is optional context for audit log
    const staffId = typeof body.staffId === 'string' ? body.staffId : null

    const ticket = await db.supportTicket.create({
      data: {
        merchantId: merchant.id,
        subject,
        category: category ?? "other",
        priority: priority ?? "normal",
        description: description ?? "",
        status: "open",
      },
    })

    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "STAFF",
        actorId: staffId ?? merchant.id,
        staffId: staffId ?? undefined,
        action: "SUPPORT_TICKET_CREATED",
        entity: "SupportTicket",
        entityId: ticket.id,
        metadata: JSON.stringify({ subject, category, priority }),
      },
    })

    return created({ ticket })
  } catch (error: unknown) {
    console.error('[Support POST Error]', error)
    return err('Failed to create support ticket', 500)
  }
}
