import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, created, err, getAuthenticatedMerchant } from "@/lib/api"

// GET /api/menu/items — Admin: list all items (incl unavailable)
export async function GET(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant()
    if (!merchant) return err("Unauthorized", 401)
    const merchantId = merchant.id

    const items = await db.menuItem.findMany({
      where: { merchantId },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    })
    return ok({ items })
  } catch (error: any) {
    return err(error.message || "Failed to fetch items", 500)
  }
}

// POST /api/menu/items — Admin: create new item
export async function POST(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant()
    if (!merchant) return err("Unauthorized", 401)
    const merchantId = merchant.id

    const body = await req.json()
    const { category, name, description, price, originalPrice, imageUrl, isVeg, isAvailable, sortOrder, tags } = body

    if (!category?.trim()) return err("Category is required", 400)
    if (!name?.trim()) return err("Item name is required", 400)
    if (!price || price < 0) return err("Valid price is required", 400)

    const item = await db.menuItem.create({
      data: {
        merchantId,
        category: category.trim(),
        name: name.trim(),
        description: description?.trim() || null,
        price: Math.round(Number(price)),
        originalPrice: originalPrice ? Math.round(Number(originalPrice)) : null,
        imageUrl: imageUrl?.trim() || null,
        isVeg: Boolean(isVeg ?? true),
        isAvailable: Boolean(isAvailable ?? true),
        sortOrder: Number(sortOrder ?? 0),
        tags: tags ? JSON.stringify(tags) : null,
      },
    })

    await db.auditLog.create({
      data: {
        merchantId,
        actorType: "OWNER",
        actorId: merchant.id,
        action: "MENU_ITEM_CREATED",
        entity: "MenuItem",
        entityId: item.id,
        metadata: JSON.stringify({ name: item.name, price: item.price, category: item.category }),
      },
    })

    return created({ item })
  } catch (error: any) {
    return err(error.message || "Failed to create item", 500)
  }
}

// PATCH /api/menu/items — Admin: update item
export async function PATCH(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant()
    if (!merchant) return err("Unauthorized", 401)
    const merchantId = merchant.id

    const body = await req.json()
    const { id, category, name, description, price, originalPrice, imageUrl, isVeg, isAvailable, sortOrder, tags } = body

    if (!id) return err("Item ID is required", 400)

    const existing = await db.menuItem.findFirst({ where: { id, merchantId } })
    if (!existing) return err("Item not found", 404)

    const item = await db.menuItem.update({
      where: { id },
      data: {
        ...(category !== undefined && { category: category.trim() }),
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price: Math.round(Number(price)) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? Math.round(Number(originalPrice)) : null }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
        ...(isVeg !== undefined && { isVeg: Boolean(isVeg) }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
      },
    })

    return ok({ item })
  } catch (error: any) {
    return err(error.message || "Failed to update item", 500)
  }
}

// DELETE /api/menu/items?id=xxx — Admin: delete item
export async function DELETE(req: NextRequest) {
  try {
    const merchant = await getAuthenticatedMerchant()
    if (!merchant) return err("Unauthorized", 401)
    const merchantId = merchant.id

    const id = req.nextUrl.searchParams.get("id")
    if (!id) return err("Item ID is required", 400)

    const existing = await db.menuItem.findFirst({ where: { id, merchantId } })
    if (!existing) return err("Item not found", 404)

    // Check if item has been ordered (don't delete, just disable)
    const hasOrders = await db.orderItem.findFirst({ where: { menuItemId: id } })
    if (hasOrders) {
      await db.menuItem.update({ where: { id }, data: { isAvailable: false } })
      return ok({ message: "Item has existing orders — marked as unavailable instead of deleted" })
    }

    await db.menuItem.delete({ where: { id } })
    return ok({ message: "Item deleted successfully" })
  } catch (error: any) {
    return err(error.message || "Failed to delete item", 500)
  }
}
