import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { code, amount } = body

    if (!code || !amount) {
      return err("Coupon code and order amount are required", 400)
    }

    const cleanCode = String(code).trim().toUpperCase()
    const orderAmount = Number(amount)

    if (isNaN(orderAmount) || orderAmount <= 0) {
      return err("Invalid order amount", 400)
    }

    const coupon = await db.coupon.findUnique({
      where: { code: cleanCode }
    })

    if (!coupon || !coupon.active) {
      return err("Invalid or inactive coupon code", 404)
    }

    if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
      return err("This coupon has expired", 400)
    }

    if (coupon.maxUses && coupon.timesUsed >= coupon.maxUses) {
      return err("This coupon usage limit has been reached", 400)
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return err(`Minimum purchase of ₹${coupon.minOrderAmount} required for this coupon`, 400)
    }

    let discount = 0
    if (coupon.discountType === "percent") {
      discount = (orderAmount * coupon.discountValue) / 100
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      discount = coupon.discountValue
    }

    // Ensure discount does not exceed total order amount
    discount = Math.min(discount, orderAmount - 1) // Minimum ₹1 charged for gateway
    const finalAmount = Math.max(1, Math.round(orderAmount - discount))

    return ok({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: Math.round(discount),
      originalAmount: orderAmount,
      finalAmount,
      description: coupon.description
    })
  } catch (error: any) {
    return err(error.message || "Failed to validate coupon", 500)
  }
}
