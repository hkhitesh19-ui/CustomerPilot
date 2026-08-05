// POST /api/customers/favorite — toggle favorite flag on a customer.
// Body: { staffId, customerId }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, customerId } = body as { staffId?: string; customerId?: string }
  if (!staffId || !customerId) return err("staffId and customerId required")

  const customer = await db.customer.findUnique({ where: { id: customerId } })
  if (!customer || customer.merchantId !== merchant.id) return err("Customer not found", 404)

  const updated = await db.customer.update({
    where: { id: customerId },
    data: { favorite: !customer.favorite },
  })

  return ok({ customer: updated })
}
