import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

// GET /api/menu/[merchantId] — Public: fetch menu categories + items
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        whatsappPhone: true,
        logoUrl: true,
      },
    })

    if (!merchant) return err("Merchant not found", 404)

    const items = await db.menuItem.findMany({
      where: { merchantId, isAvailable: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    })

    // Group by category
    const categoryMap: Record<string, typeof items> = {}
    for (const item of items) {
      if (!categoryMap[item.category]) categoryMap[item.category] = []
      categoryMap[item.category].push(item)
    }

    const categories = Object.entries(categoryMap).map(([name, menuItems]) => ({
      name,
      items: menuItems,
    }))

    return ok({ merchant, categories, totalItems: items.length })
  } catch (error: any) {
    return err(error.message || "Failed to fetch menu", 500)
  }
}
