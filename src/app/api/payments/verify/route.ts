import { NextRequest } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { requireMerchant, err, ok } from "@/lib/api";

// SECURITY: No hardcoded key fallback — require env var at runtime
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(req: NextRequest) {
  try {
    // SECURITY: Payment secret must be configured
    if (!RAZORPAY_KEY_SECRET) {
      console.error("[Razorpay Verify] RAZORPAY_KEY_SECRET env var not set")
      return err("Payment system not configured. Please contact support.", 500)
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

    // SECURITY: Merchant resolved ONLY from server-injected JWT header (proxy.ts)
    // /api/payments/ is now a protected route — no findFirst() fallback needed
    const merchant = await requireMerchant();

    // Validate Razorpay signature
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

    const daysToAdd = durationDays ? parseInt(String(durationDays), 10) : 30;
    if (isNaN(daysToAdd) || daysToAdd <= 0 || daysToAdd > 3650) {
      return err("Invalid durationDays value", 400);
    }

    // Extend from today, or from current expiry if renewing early
    const currentExpiry = merchant.trialEndsAt ? new Date(merchant.trialEndsAt) : new Date();
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd);

    // Resolve plan to set merchant's enabledModules
    let enabledModules = "LOYALTY,REVIEWS,AUTOREPLY";
    if (planId) {
      const planRecord = await db.plan.findFirst({
        where: { OR: [{ id: planId }, { planKey: planId }] }
      });
      if (planRecord?.enabledModules) {
        enabledModules = planRecord.enabledModules;
      }
    }

    const updatedMerchant = await db.merchant.update({
      where: { id: merchant.id },
      data: {
        plan: planId || "subscribed",
        trialEndsAt: newExpiryDate,
        enabledModules,
      },
    });

    // Audit log the payment activation
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "SYSTEM",
        actorId: merchant.id,
        action: "SUBSCRIPTION_ACTIVATED",
        entity: "Merchant",
        entityId: merchant.id,
        metadata: JSON.stringify({
          plan: planId,
          durationDays: daysToAdd,
          razorpay_order_id,
          razorpay_payment_id,
        }),
      },
    }).catch(() => {}); // Non-critical — don't fail payment on audit log error

    // ─── Growth Engine: Reward Merchant Referral (Qualifying Event: First Paid Subscription) ───
    try {
      const referral = await db.merchantReferral.findFirst({
        where: {
          referredMerchantId: merchant.id,
          status: { in: ["INVITED", "SIGNED_UP", "ACTIVATED"] },
        },
      });

      if (referral) {
        // Credit Referrer
        await db.merchant.update({
          where: { id: referral.referrerMerchantId },
          data: { walletCredit: { increment: referral.referrerReward || 100 } },
        });

        // Credit Referred Merchant
        await db.merchant.update({
          where: { id: merchant.id },
          data: { walletCredit: { increment: referral.referredReward || 100 } },
        });

        // Mark Referral as Rewarded
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

    // ─── Growth Engine: Auto-Create Baseline Growth Snapshot ───
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
