import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" }
    })
    return ok({ coupons })
  } catch (error: any) {
    return err(error.message || "Failed to fetch coupons", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      maxUses,
      validUntil
    } = body

    if (!code || discountValue === undefined) {
      return err("Coupon code and discount value are mandatory", 400)
    }

    const cleanCode = String(code).trim().toUpperCase()

    const existing = await db.coupon.findUnique({ where: { code: cleanCode } })
    if (existing) {
      return err("A coupon with this code already exists", 400)
    }

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        description: description || null,
        discountType: discountType || "percent",
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        maxUses: maxUses ? Number(maxUses) : 100,
        validUntil: validUntil ? new Date(validUntil) : null,
        active: true
      }
    })

    return ok({ coupon, message: "Coupon created successfully" })
  } catch (error: any) {
    return err(error.message || "Failed to create coupon", 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { id, active, discountValue, description, maxUses } = body

    if (!id) return err("Coupon ID is required", 400)

    const updateData: any = {}
    if (active !== undefined) updateData.active = Boolean(active)
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue)
    if (description !== undefined) updateData.description = description
    if (maxUses !== undefined) updateData.maxUses = Number(maxUses)

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData
    })

    return ok({ coupon, message: "Coupon updated successfully" })
  } catch (error: any) {
    return err(error.message || "Failed to update coupon", 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return err("Coupon ID is required", 400)

    await db.coupon.delete({ where: { id } })
    return ok({ message: "Coupon deleted successfully" })
  } catch (error: any) {
    return err(error.message || "Failed to delete coupon", 500)
  }
}
