import { NextRequest } from "next/server"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { cancelOrder } from "@/lib/order-bot"

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
    const reason = body.reason?.trim() || "Item out of stock or kitchen closed"

    const order = await cancelOrder({
      orderId: id,
      merchantId,
      reason,
      staffId: merchant.id,
    })

    return ok({ order, message: `Order #${order.orderNo} cancelled.` })
  } catch (error: any) {
    return err(error.message || "Failed to cancel order", 500)
  }
}
