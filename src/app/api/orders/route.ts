import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"

// GET /api/orders — Admin: list orders with filters
export async function GET(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant()
    if (!merchant) return err("Unauthorized", 401)
    const merchantId = merchant.id

    const status = req.nextUrl.searchParams.get("status") || undefined
    const take = Math.min(Number(req.nextUrl.searchParams.get("take") || "50"), 100)

    const orders = await db.order.findMany({
      where: {
        merchantId,
        ...(status ? { status } : {}),
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
    })

    const pendingCount = await db.order.count({
      where: { merchantId, status: "PENDING" },
    })

    return ok({ orders, pendingCount })
  } catch (error: any) {
    return err(error.message || "Failed to fetch orders", 500)
  }
}
