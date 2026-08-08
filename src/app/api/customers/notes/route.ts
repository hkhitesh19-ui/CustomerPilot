// POST /api/customers/notes — update merchant notes on a customer.
// Body: { staffId, customerId, notes }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const merchant = await requireMerchant()
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")
    const { customerId, notes } = body as { staffId?: string; customerId?: string; notes?: string }
    if (!customerId || typeof customerId !== 'string') return err("customerId required")
    if (notes !== undefined && typeof notes !== 'string') return err("notes must be a string")

    const customer = await db.customer.findUnique({ where: { id: customerId } })
    if (!customer || customer.merchantId !== merchant.id) return err("Customer not found", 404)

    const updated = await db.customer.update({
      where: { id: customerId },
      data: { notes: notes ?? null },
    })

    return ok({ customer: updated })
  } catch (error: unknown) {
    console.error('[Customers Notes Error]', error)
    return err('Failed to update customer notes', 500)
  }
}
