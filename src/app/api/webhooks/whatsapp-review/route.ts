/**
 * src/app/api/webhooks/whatsapp-review/route.ts
 * 
 * CustomerPilot — WhatsApp Google Review Screenshot Webhook Endpoint
 * Reference: RankPilot AI™ Master Playbook Section 5.2
 * 
 * Listens for Evolution API WhatsApp image messages, computes SHA-256 image hashes,
 * prevents duplicate & 30-day fraud, invokes Gemini 2.5 Flash Vision verifier,
 * and automatically awards +1 Bonus Loyalty Stamp to the customer.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { verifyGoogleReviewScreenshot } from "@/lib/geminiReviewVerifier";

export const dynamic = "force-dynamic";

/**
 * Sends WhatsApp reply via Evolution API or mocks in test mode
 */
async function sendWhatsAppReply(instanceName: string, remoteJid: string, text: string) {
  const evoUrl = process.env.EVOLUTION_API_URL;
  const evoKey = process.env.EVOLUTION_API_KEY;
  if (!evoUrl || !evoKey) {
    console.log(`[WhatsApp Review Webhook Mock Send] To: ${remoteJid} -> ${text.slice(0, 80)}...`);
    return;
  }
  try {
    await fetch(`${evoUrl}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evoKey,
      },
      body: JSON.stringify({ number: remoteJid, text }),
    });
  } catch (err: any) {
    console.error("[WhatsApp Send Error]:", err?.message);
  }
}

/**
 * Creates a unique fingerprint of merchant + customer + review text snippet
 */
function createReviewFingerprint(merchantId: string, reviewerName: string, reviewText: string): string {
  const cleanName = reviewerName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanText = reviewText.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60);
  return crypto.createHash("sha256").update(`${merchantId}:${cleanName}:${cleanText}`).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 1. Validate payload structure (Evolution API standard or Direct Test Payload)
    let instanceName = payload.instance;
    let remoteJid = payload.data?.key?.remoteJid || payload.remoteJid || "";
    let customerPhone = remoteJid.split("@")[0].replace(/[^0-9]/g, "") || payload.customerPhone || "";
    let imageBase64 = payload.imageBase64 || payload.data?.message?.imageMessage?.base64 || "";

    // If payload is an Evolution event
    if (payload.event === "messages.upsert") {
      const msg = payload.data;
      if (!msg || msg.key?.fromMe || msg.messageType !== "imageMessage") {
        return NextResponse.json({ ignored: true, reason: "Not an incoming image message" });
      }
      instanceName = payload.instance;
      remoteJid = msg.key.remoteJid;
      customerPhone = remoteJid.split("@")[0].replace(/[^0-9]/g, "");
    }

    if (!customerPhone) {
      return NextResponse.json({ error: "Missing customer phone or remoteJid" }, { status: 400 });
    }

    // 2. Identify Merchant
    let merchant: any = null;
    if (payload.merchantId) {
      merchant = await db.merchant.findUnique({ where: { id: payload.merchantId } });
    } else if (instanceName) {
      merchant = await db.merchant.findFirst({
        where: {
          OR: [
            { whatsappInstanceName: instanceName },
            { id: instanceName },
          ]
        }
      });
    }

    // Default to first active merchant if not resolved (e.g. Cake Connection in testing)
    if (!merchant) {
      merchant = await db.merchant.findFirst({
        where: { status: "active" }
      });
    }

    if (!merchant) {
      return NextResponse.json({ error: "No active merchant associated with this WhatsApp instance" }, { status: 404 });
    }

    // 3. Compute SHA-256 Image Hash for duplicate fraud prevention
    const rawImageBytes = imageBase64 || `MOCK_IMAGE_BYTES_FOR_${customerPhone}_${Date.now()}`;
    const imageSha256Hash = crypto.createHash("sha256").update(rawImageBytes).digest("hex");

    // Check for exact duplicate screenshot
    const existingImage = await db.reviewVerificationLog.findUnique({
      where: { imageSha256Hash }
    });

    if (existingImage) {
      const duplicateMsg = `⚠️ Namaste! Ye review screenshot pehle hi verify ho chuka hai. Bonus loyalty stamp ke liye please apna naya aur original Google Review screenshot share karein.`;
      await sendWhatsAppReply(instanceName || merchant.id, remoteJid, duplicateMsg);
      return NextResponse.json({
        ok: false,
        status: "REJECTED",
        reason: "DUPLICATE_IMAGE_HASH",
        message: "Duplicate review screenshot detected"
      }, { status: 409 });
    }

    // 4. 30-Day Fraud Throttle Check
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentApprovedClaim = await db.reviewVerificationLog.findFirst({
      where: {
        merchantId: merchant.id,
        customerPhone,
        status: "APPROVED",
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    if (recentApprovedClaim) {
      const throttleMsg = `Namaste! Aapne pichle 30 dino me already Google Review bonus stamp claim kar liya hai. Hamara system 30 din me 1 baar bonus review stamp allow karta hai. Thank you for your support! ✨`;
      await sendWhatsAppReply(instanceName || merchant.id, remoteJid, throttleMsg);
      return NextResponse.json({
        ok: false,
        status: "REJECTED",
        reason: "THIRTY_DAY_THROTTLE",
        message: "Customer already received bonus stamp within the last 30 days"
      }, { status: 429 });
    }

    // 5. Run Fraud-Proof Gemini Vision Verification
    const targetKeywords = [merchant.category || "bakery", merchant.city || "Vadodara", "cake", "review"];
    const verification = await verifyGoogleReviewScreenshot({
      imageBase64: rawImageBytes,
      expectedBusinessName: merchant.name,
      expectedLocality: merchant.city || "Vadodara",
      targetKeywords,
    });

    // 6. Generate Review Fingerprint
    const reviewFingerprint = createReviewFingerprint(
      merchant.id,
      verification.reviewerDisplayName,
      verification.extractedReviewText || rawImageBytes.slice(0, 20)
    );

    // Check fingerprint collision
    const existingFingerprint = await db.reviewVerificationLog.findUnique({
      where: { reviewFingerprint }
    });

    if (existingFingerprint) {
      const dupTextMsg = `⚠️ Namaste! Is Google review ka text hamare records me already kisi aur customer dwara submit ho chuka hai.`;
      await sendWhatsAppReply(instanceName || merchant.id, remoteJid, dupTextMsg);
      return NextResponse.json({
        ok: false,
        status: "REJECTED",
        reason: "DUPLICATE_REVIEW_FINGERPRINT",
        message: "Duplicate review text fingerprint detected"
      }, { status: 409 });
    }

    // 7. Evaluate Approval or Rejection
    const isApproved = verification.isPublishedState &&
                       !verification.isDraftOrEditScreen &&
                       verification.businessNameMatchesMerchant;

    const logRecord = await db.reviewVerificationLog.create({
      data: {
        merchantId: merchant.id,
        customerPhone,
        imageSha256Hash,
        reviewFingerprint,
        reviewerName: verification.reviewerDisplayName,
        extractedText: verification.extractedReviewText,
        starRating: verification.starRating,
        hasKeywordMatch: verification.matchedKeywords.length > 0,
        hasPhotoAttached: verification.hasUploadedPhotoInReview,
        stampsCredited: isApproved ? 1 : 0,
        status: isApproved ? "APPROVED" : "REJECTED",
        rejectionReason: isApproved ? null : (verification.rejectionReasonIfAny || "Verification failed"),
      }
    });

    if (isApproved) {
      // Award Bonus Loyalty Stamp in Customer Record if available
      try {
        const customer = await db.customer.findFirst({
          where: { merchantId: merchant.id, phone: customerPhone }
        });
        if (customer) {
          await db.customer.update({
            where: { id: customer.id },
            data: {
              lifetimeStamps: { increment: 1 }
            }
          });
        }
      } catch (custErr) {
        console.warn("[Customer Stamp Update Warning]:", custErr);
      }

      const successMsg = `🎉 Badhai ho! Aapka Google Review verify ho gaya hai.\n\n` +
        `⭐ Rating: ${verification.starRating} Stars\n` +
        `🎁 Bonus Reward: *+1 Loyalty Stamp* aapke account me credit kar diya gaya hai!\n\n` +
        `Thank you for supporting *${merchant.name}*! Visit us again soon. ✨`;

      await sendWhatsAppReply(instanceName || merchant.id, remoteJid, successMsg);

      return NextResponse.json({
        ok: true,
        status: "APPROVED",
        verificationId: logRecord.id,
        stampsCredited: 1,
        verification,
      });
    } else {
      const rejectMsg = verification.isDraftOrEditScreen
        ? `⚠️ Namaste! Aapka screenshot draft mode me hai (Post button nahi daba hai). Please review ko post karne ke baad live review ka screenshot bhejein taaki bonus stamp mil sake.`
        : `⚠️ Namaste! Screenshot verify nahi ho saka: ${verification.rejectionReasonIfAny || "Store name match nahi hua"}. Please sahi review screenshot bhejein.`;

      await sendWhatsAppReply(instanceName || merchant.id, remoteJid, rejectMsg);

      return NextResponse.json({
        ok: false,
        status: "REJECTED",
        verificationId: logRecord.id,
        reason: verification.rejectionReasonIfAny || "DRAFT_OR_MISMATCH",
        verification,
      });
    }
  } catch (error: any) {
    console.error("[WhatsApp Review Webhook Error]:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
