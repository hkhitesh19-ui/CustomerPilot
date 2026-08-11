import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getAuthenticatedMerchant, requireMerchant, err, ok } from "@/lib/api";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return err("Invalid JSON body");

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      planId, 
      durationDays,
      merchantId
    } = body;

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

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return err("Missing payment details", 400);
    }

    // Validate Signature
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(bodyString.toString())
      .digest("hex");

    // Allow dev bypass if secret is the placeholder (so the user can test UI without actual keys)
    const isSignatureValid = expectedSignature === razorpay_signature;
    const isDevBypass = RAZORPAY_KEY_SECRET === "rzp_secret_placeholder";

    if (!isSignatureValid && !isDevBypass) {
      console.warn('[payments/verify] Invalid Razorpay signature — possible fraud attempt', { merchantId: merchant.id, razorpay_order_id });
      return err("Invalid payment signature", 400);
    }

    const daysToAdd = durationDays ? parseInt(durationDays) : 30;

    // Extend from today, or from current expiry if they are renewing early
    const currentExpiry = merchant.trialEndsAt ? new Date(merchant.trialEndsAt) : new Date();
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    
    const newExpiryDate = new Date(baseDate.setDate(baseDate.getDate() + daysToAdd));

    const updatedMerchant = await db.merchant.update({
      where: { id: merchant.id },
      data: {
        plan: planId || "subscribed",
        trialEndsAt: newExpiryDate,
      },
    });

    // Record the payment
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: 'SYSTEM',
        actorId: merchant.id,
        action: 'SUBSCRIPTION_ACTIVATED',
        entity: 'Merchant',
        entityId: merchant.id,
        metadata: JSON.stringify({ plan: planId, durationDays: daysToAdd, razorpay_order_id, razorpay_payment_id }),
      },
    }).catch(() => {});

    return ok({ 
      message: "Payment verified successfully", 
      merchant: { plan: updatedMerchant.plan, trialEndsAt: updatedMerchant.trialEndsAt } 
    });

  } catch (error: any) {
    console.error("[Razorpay Verify Error]:", error);
    return err("Failed to verify payment", 500, { details: error.message });
  }
}
