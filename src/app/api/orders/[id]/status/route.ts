import { NextRequest } from "next/server"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { updateOrderStatus } from "@/lib/order-bot"

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
    const status = body.status as "PREPARING" | "READY" | "DELIVERED"

    if (!["PREPARING", "READY", "DELIVERED"].includes(status)) {
      return err("Invalid status. Must be PREPARING, READY, or DELIVERED", 400)
    }

    const order = await updateOrderStatus({
      orderId: id,
      merchantId,
      status,
      staffId: merchant.id,
    })

    return ok({ order, message: `Order #${order.orderNo} updated to ${status}.` })
  } catch (error: any) {
    return err(error.message || "Failed to update order status", 500)
  }
}
