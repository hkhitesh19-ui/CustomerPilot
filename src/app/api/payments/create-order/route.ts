import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAuthenticatedMerchant, err } from "@/lib/api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TAyBShtPsT7nSS";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "u3nuKxrh3ljRBYuEApMJ0okC";

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json().catch(() => ({}));
    const { planId, couponCode, merchantId } = body;

    if (!planId) {
      return err("Missing planId", 400);
    }

    // Resolve merchant safely
    let merchant = await getAuthenticatedMerchant();
    if (!merchant && merchantId) {
      merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    }
    if (!merchant) {
      const headerId = req.headers.get("x-merchant-id");
      if (headerId) {
        merchant = await db.merchant.findUnique({ where: { id: headerId } });
      }
    }
    if (!merchant) {
      merchant = await db.merchant.findFirst({ orderBy: { createdAt: "asc" } });
    }
    if (!merchant) {
      return err("No active merchant account found", 401);
    }

    // 1. Fetch official plan from database
    const plan = await db.plan.findFirst({
      where: {
        OR: [{ id: planId }, { planKey: planId }, { name: planId }],
        active: true
      }
    });

    let basePrice = plan?.price || Number(body.amount) || 999;
    let discount = 0;
    let appliedCoupon = null;

    // 2. Validate coupon if provided
    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const coupon = await db.coupon.findUnique({ where: { code: cleanCode } });
      if (coupon && coupon.active) {
        const isNotExpired = !coupon.validUntil || new Date() <= new Date(coupon.validUntil);
        const isWithinUsage = !coupon.maxUses || coupon.timesUsed < coupon.maxUses;
        const meetsMinOrder = !coupon.minOrderAmount || basePrice >= coupon.minOrderAmount;

        if (isNotExpired && isWithinUsage && meetsMinOrder) {
          if (coupon.discountType === "percent") {
            discount = (basePrice * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          appliedCoupon = coupon.code;
        }
      }
    }

    const finalAmount = Math.max(1, Math.round(basePrice - discount));

    const options = {
      amount: finalAmount * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${merchant.id.substring(0, 8)}_${Date.now().toString().slice(-6)}`,
      notes: {
        merchantId: merchant.id,
        planId: plan?.id || planId,
        planKey: plan?.planKey || planId,
        couponCode: appliedCoupon || "NONE",
        durationDays: String(plan?.days || 30)
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
      finalAmount,
      basePrice,
      discount: Math.round(discount),
      appliedCoupon
    });
  } catch (error: any) {
    console.error("[Razorpay Create Order Error]:", error);
    const detail = error?.error?.description || error?.message || (typeof error === "object" ? JSON.stringify(error) : String(error));
    return NextResponse.json({ ok: false, error: detail, details: detail }, { status: 500 });
  }
}
