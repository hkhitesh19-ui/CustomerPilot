import { NextRequest } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { getAuthenticatedMerchant, err, ok } from "@/lib/api";

// SECURITY: No hardcoded key fallback — require env var at runtime
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Payment secret must be configured
    if (!RAZORPAY_KEY_SECRET) {
      console.error("[Razorpay Verify] RAZORPAY_KEY_SECRET env var not set");
      return err("Payment system not configured. Please contact support.", 500);
    }

    const body = await req.json().catch(() => null);
    if (!body) return err("Invalid JSON body");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      durationDays,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return err("Missing payment details", 400);
    }

    // SECURITY: Mandatory authenticated merchant session.
    // Strictly NO fallbacks to client-controlled body.merchantId or x-merchant-id headers.
    const merchant = await getAuthenticatedMerchant();
    if (!merchant) {
      return err("Unauthorized: valid merchant session required", 401);
    }

    // ─── 1. Idempotency Check (Replay Prevention) ───
    // Fast-path lookup for previously processed payment
    const existingPayment = await db.auditLog.findUnique({
      where: { id: `rp_pay_${razorpay_payment_id}` }
    });
    if (existingPayment) {
      return err("Payment has already been processed (replay detected)", 409);
    }

    // ─── 2. Cryptographic HMAC Signature Verification ───
    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;
    if (!isSignatureValid) {
      console.warn("[payments/verify] Invalid Razorpay signature — possible fraud attempt", {
        merchantId: merchant.id,
        razorpay_order_id,
      });
      return err("Invalid payment signature", 400);
    }

    // ─── 3. Gateway Order Details & Amount Verification ───
    if (process.env.RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.fetch(razorpay_order_id);
        if (!order) {
          return err("Order not found on payment gateway", 400);
        }

        // Verify status
        if (order.status !== "paid" && order.amount_paid !== order.amount) {
          return err("Order payment is not completed or paid", 400);
        }

        // Verify order ownership
        if (order.notes?.merchantId && order.notes.merchantId !== merchant.id) {
          return err("Order does not belong to this merchant", 403);
        }

        // Verify amount against plan price
        if (planId) {
          const planRecord = await db.plan.findFirst({
            where: { OR: [{ id: planId }, { planKey: planId }, { name: planId }] }
          });
          if (planRecord) {
            const expectedPlanPaise = Math.round(planRecord.price * 100);
            const couponCode = order.notes?.couponCode;
            if (!couponCode || couponCode === "NONE") {
              if (Number(order.amount) < expectedPlanPaise) {
                return err("Payment amount mismatch: order amount is less than plan price", 400);
              }
            }
          }
        }
      } catch (gatewayErr: any) {
        if (gatewayErr?.statusCode === 400 || gatewayErr?.statusCode === 404) {
          return err("Order verification failed on payment gateway", 400);
        }
        if (process.env.NODE_ENV === "production") {
          console.error("[payments/verify] Razorpay order fetch failed in production:", gatewayErr);
          return err("Failed to verify order details with payment gateway", 400);
        }
      }
    }

    // ─── 4. Plan & Expiry Resolution ───
    const daysToAdd = durationDays ? parseInt(String(durationDays), 10) : 30;
    if (isNaN(daysToAdd) || daysToAdd <= 0 || daysToAdd > 3650) {
      return err("Invalid durationDays value", 400);
    }

    const currentExpiry = merchant.trialEndsAt ? new Date(merchant.trialEndsAt) : new Date();
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd);

    let enabledModules = "LOYALTY,REVIEWS,AUTOREPLY";
    if (planId) {
      const planRecord = await db.plan.findFirst({
        where: { OR: [{ id: planId }, { planKey: planId }] }
      });
      if (planRecord?.enabledModules) {
        enabledModules = planRecord.enabledModules;
      }
    }
    if (body.enabledModules && typeof body.enabledModules === "string") {
      enabledModules = body.enabledModules;
    }

    // ─── 5. Race-Safe Atomic Idempotency Recording ───
    // Using explicit unique ID 'rp_pay_<payment_id>' on AuditLog to trigger P2002 if concurrent replay happens
    try {
      await db.auditLog.create({
        data: {
          id: `rp_pay_${razorpay_payment_id}`,
          merchantId: merchant.id,
          actorType: "SYSTEM",
          actorId: merchant.id,
          action: "SUBSCRIPTION_ACTIVATED",
          entity: "RazorpayPayment",
          entityId: razorpay_payment_id,
          metadata: JSON.stringify({
            plan: planId,
            durationDays: daysToAdd,
            razorpay_order_id,
            razorpay_payment_id,
          }),
        },
      });
    } catch (auditErr: any) {
      if (auditErr?.code === 'P2002') {
        return err("Payment has already been processed (concurrent replay detected)", 409);
      }
      console.warn("[payments/verify] Audit log creation warning:", auditErr);
    }

    // ─── 6. Update Merchant Record ───
    const updatedMerchant = await db.merchant.update({
      where: { id: merchant.id },
      data: {
        plan: planId || "subscribed",
        trialEndsAt: newExpiryDate,
        enabledModules,
      },
    });

    // ─── 7. Growth Engine: Reward Merchant Referral ───
    try {
      const referral = await db.merchantReferral.findFirst({
        where: {
          referredMerchantId: merchant.id,
          status: { in: ["INVITED", "SIGNED_UP", "ACTIVATED"] },
        },
      });

      if (referral) {
        await db.merchant.update({
          where: { id: referral.referrerMerchantId },
          data: { walletCredit: { increment: referral.referrerReward || 100 } },
        });

        await db.merchant.update({
          where: { id: merchant.id },
          data: { walletCredit: { increment: referral.referredReward || 100 } },
        });

        await db.merchantReferral.update({
          where: { id: referral.id },
          data: {
            status: "REWARDED",
            qualifyingEvent: "first_paid_subscription",
            convertedAt: referral.convertedAt || new Date(),
            rewardedAt: new Date(),
          },
        });
      }
    } catch (refErr) {
      console.warn("[Growth Engine] Merchant referral reward processing error (non-fatal):", refErr);
    }

    // ─── 8. Growth Engine: Auto-Create Baseline Growth Snapshot ───
    try {
      const existingSnapshot = await db.growthSnapshot.findFirst({
        where: { merchantId: merchant.id },
      });

      if (!existingSnapshot) {
        const [totalCustomers, totalStamps, totalRedemptions, totalReviews, totalGoogleReviews] = await Promise.all([
          db.customer.count({ where: { merchantId: merchant.id, deletedAt: null } }),
          db.stamp.count({ where: { merchantId: merchant.id } }),
          db.redemption.count({ where: { merchantId: merchant.id } }),
          db.review.count({ where: { merchantId: merchant.id } }),
          db.googleBusinessReview.count({ where: { merchantId: merchant.id } }),
        ]);

        await db.growthSnapshot.create({
          data: {
            merchantId: merchant.id,
            snapshotDate: new Date(),
            totalCustomers,
            totalStamps,
            totalRedemptions,
            totalReviews: totalReviews + totalGoogleReviews,
            repeatVisits: 0,
            googleReviewCount: totalGoogleReviews,
          },
        });
      }
    } catch (snapErr) {
      console.warn("[Growth Engine] Baseline snapshot creation error (non-fatal):", snapErr);
    }

    return ok({
      message: "Payment verified successfully",
      merchant: { plan: updatedMerchant.plan, trialEndsAt: updatedMerchant.trialEndsAt },
    });

  } catch (error: any) {
    console.error("[Razorpay Verify Error]:", error);
    return err("Failed to verify payment", 500, { details: error.message });
  }
}
