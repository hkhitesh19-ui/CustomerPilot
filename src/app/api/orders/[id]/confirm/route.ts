import { NextRequest } from "next/server"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { confirmOrder } from "@/lib/order-bot"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const merchant = await getAuthenticatedMerchant()
    if (!merchant) return err("Unauthorized", 401)
    const merchantId = merchant.id

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const etaMinutes = Number(body.etaMinutes) || 30

    const order = await confirmOrder({
      orderId: id,
      merchantId,
      etaMinutes,
      staffId: merchant.id,
    })

    return ok({ order, message: `Order #${order.orderNo} confirmed and WhatsApp sent to customer.` })
  } catch (error: any) {
    return err(error.message || "Failed to confirm order", 500)
  }
}
