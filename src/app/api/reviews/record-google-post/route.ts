import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAIReviewReply, getCleanMerchantName } from '@/lib/ai-review-reply';
import { postReviewReplyToGBP } from '@/lib/google-reviews-service';
import { sendCentralWhatsAppMessage } from '@/lib/whatsapp-service';
import { hasModule } from '@/lib/feature-gate';

// Stamps for Google Reviews are awarded manually by the merchant/cashier after verification.

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

async function sendWhatsApp(merchantId: string, toPhone: string, text: string, template: string, customerId?: string) {
  try {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
      console.error("[Review Post Action] EVOLUTION_API_URL or EVOLUTION_API_KEY not configured — skipping WhatsApp dispatch");
      return { ok: false };
    }
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    const instanceName = merchant?.whatsappInstanceName || `CP_M_${merchantId}`;
    
    console.log(`[Review Post Action] 🚀 Attempting WhatsApp send via instance: ${instanceName} to +${toPhone}`);

    const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": EVOLUTION_API_KEY },
      body: JSON.stringify({
        number: toPhone,
        text: text
      })
    });
    const data = await res.json().catch(() => ({}));
    
    const isSuccess = res.ok && data?.key?.id;

    await db.whatsAppMessage.create({
      data: {
        merchantId,
        customerId,
        toPhone,
        template,
        body: text.substring(0, 500),
        status: isSuccess ? "sent" : "failed",
        errorMessage: isSuccess ? null : JSON.stringify(data),
        metaMessageId: data?.key?.id || `${template}_${Date.now()}`
      }
    }).catch(() => {});
    
    if (isSuccess) {
      console.log(`[Review Post Action] ✅ Sent ${template} to +${toPhone} via ${instanceName}`);
    } else {
      console.error(`[Review Post Action] ❌ Evolution API send failed (${res.status}):`, data);
    }
  } catch (e: any) {
    console.error(`[Review Post Action] WhatsApp error for ${template}:`, e.message);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, merchantId, reviewText, rating = 5 } = body;

    if (!merchantId) {
      return NextResponse.json({ error: "merchantId is required" }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    let customer = customerId ? await db.customer.findUnique({ where: { id: customerId } }) : null;
    if (!customer) {
      // Find or create guest customer for public QR code reviews
      const guestPhone = `guest_${merchantId.substring(0, 8)}`;
      customer = await db.customer.findFirst({
        where: { merchantId, phone: guestPhone }
      });
      if (!customer) {
        customer = await db.customer.create({
          data: {
            merchantId,
            name: "Counter Customer",
            phone: guestPhone
          }
        });
      }
    }

    const finalReviewText = reviewText || "The service and quality were fresh, beautiful, and absolutely delicious. Highly recommended!";

    // Fetch Merchant's Active Reward Card Config first
    const template = await db.stampCard.findFirst({ where: { merchantId, active: true } });

    // Check if customer already submitted a Google Review previously (Upsert support)
    const existingReview = await db.review.findFirst({
      where: { merchantId, customerId },
      orderBy: { createdAt: "desc" }
    });

    // Manual verification policy: 0 automatic stamps awarded here
    const reviewBonusToAward = 0;
    const photoBonusToAward = 0;
    const totalBonusToAward = 0;
    const bonusCount = 0;
    const matchedPhotoUri: string | null = body?.photoUrl || null;

    let reviewRecord;

    if (existingReview) {
      reviewRecord = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Number(rating),
          aiDraft: finalReviewText,
          finalText: finalReviewText,
          photoUrl: matchedPhotoUri || existingReview.photoUrl || null,
          status: "submitted",
          submittedAt: new Date()
        }
      });
    } else {
      reviewRecord = await db.review.create({
        data: {
          merchantId,
          customerId,
          rating: Number(rating),
          aiDraft: finalReviewText,
          finalText: finalReviewText,
          photoUrl: matchedPhotoUri || null,
          photoBonusStamps: 0,
          bonusStampsAwarded: 0,
          platform: "google",
          status: "submitted",
          submittedAt: new Date()
        }
      });
    }

    // Log review post attempt for audit (manual counter verification required)
    await db.reviewBonusLog.create({
      data: {
        merchantId,
        customerId: customer.id,
        reviewId: reviewRecord.id,
        reviewerName: customer.name || "VIP Member",
        stage: "MANUAL_COUNTER_CHECK",
        photoUri: matchedPhotoUri,
        matchConfidence: null,
        decision: "MANUAL",
        reason: "manual_merchant_verification",
        recheckScheduled: false,
        recheckAt: null,
        retryCount: 0,
        finalizedAt: new Date()
      }
    }).catch(err => console.error("[ReviewBonusLog] Creation error:", err.message));

    let replyText: string | null = null;

    // Google Business Review & AI Auto-Reply (Only if AUTOREPLY module is enabled)
    if (hasModule(merchant, "AUTOREPLY")) {
      // Check existing GoogleBusinessReview for this customer
      const existingGbpReview = await db.googleBusinessReview.findFirst({
        where: {
          merchantId,
          reviewerName: customer.name || "VIP Member"
        },
        orderBy: { createdAt: "desc" }
      });

      let gbpReview;
      const alreadyReplied = Boolean(existingGbpReview && existingGbpReview.isReplied && existingGbpReview.reviewReply);

      if (existingGbpReview) {
        gbpReview = await db.googleBusinessReview.update({
          where: { id: existingGbpReview.id },
          data: {
            rating: Number(rating),
            comment: finalReviewText,
            ...(alreadyReplied ? {} : {
              status: "pending",
              isReplied: false,
              reviewReply: null
            }),
            updatedAt: new Date()
          }
        });

        if (alreadyReplied) {
          replyText = existingGbpReview.reviewReply;
        }
      } else {
        gbpReview = await db.googleBusinessReview.create({
          data: {
            merchantId,
            gbpReviewId: `g_rev_${customerId}_${Date.now()}`,
            reviewerName: customer.name || "VIP Member",
            rating: Number(rating),
            comment: finalReviewText,
            status: "pending",
            isReplied: false,
            createdAt: new Date()
          }
        });
      }

      // Generate & Post AI Owner Auto-Reply ONLY if review was not already replied
      if (!alreadyReplied) {
        const cleanName = getCleanMerchantName(merchant.name);
        const city = merchant.city || merchant.address?.split(',').pop()?.trim() || "Vadodara";
        const category = merchant.businessType || merchant.category || "fresh cakes and bakery products";
        replyText = await generateAIReviewReply({
          merchantName: cleanName,
          locationOrArea: city,
          category: category,
          customerReview: finalReviewText,
          rating: Number(rating),
          reviewerName: customer.name || "VIP Member"
        });

        // Post AI Owner Auto-Reply back to Google Business Profile API & Update DB
        const postSuccess = await postReviewReplyToGBP(merchant.id, gbpReview.gbpReviewId, replyText);

        await db.googleBusinessReview.update({
          where: { id: gbpReview.id },
          data: {
            isReplied: true,
            reviewReply: replyText,
            repliedAt: new Date(),
            status: postSuccess ? "replied" : "replied"
          }
        });
      }
    }

    // Read current wallet balance (stamps for Google Reviews are awarded manually by merchant)
    let finalStampsInWallet = 0;

    if (template) {
      const currentCard = await db.customerStampCard.findFirst({
        where: { customerId: customer.id, stampCardId: template.id, completed: false },
        orderBy: { createdAt: "desc" }
      });
      finalStampsInWallet = currentCard?.stampsCollected ?? customer.lifetimeStamps ?? 0;
    }

    // 6. Send WhatsApp confirmation to Customer (instructing manual counter check)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const walletUrl = `${appUrl}/q/wallet/${customer.id}`;
    const stampsRequired = template?.stampsRequired || 10;
    const remaining = Math.max(0, stampsRequired - finalStampsInWallet);

    const customerMsg = `⭐ *Thank you ${customer.name || "VIP"}!* ❤️\n\n` +
      `Thank you for sharing your feedback for *${merchant.name}*!\n\n` +
      `🎁 *Bonus stamps:* Show your Google review at the counter and our team will add them after checking.\n\n` +
      `📊 *Wallet:* ${finalStampsInWallet} / ${stampsRequired} Stamps\n` +
      `🎁 *Next Reward:* ${template?.rewardName || "FREE Reward"} (${remaining} more needed)\n\n` +
      `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`;

    await sendCentralWhatsAppMessage({
      merchantId: merchant.id,
      toPhone: customer.phone,
      text: customerMsg,
      template: 'review_bonus_reward',
      customerId: customer.id
    });

    // 7. Merchant WhatsApp alert disabled per merchant preference
    // (Google Review Received & AI Auto-Reply notification is not sent to merchant)

    return NextResponse.json({
      success: true,
      bonusStamps: bonusCount,
      aiReply: replyText,
      reviewId: reviewRecord.id
    });

  } catch (error: any) {
    console.error("[Record Google Post] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
