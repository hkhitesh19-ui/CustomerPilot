import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAIReviewReply } from '@/lib/ai-review-reply';
import { postReviewReplyToGBP } from '@/lib/google-reviews-service';
import { sendCentralWhatsAppMessage } from '@/lib/whatsapp-service';
import { hasModule } from '@/lib/feature-gate';

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
            phone: guestPhone,
            visitsCount: 1
          }
        });
      }
    }

    const finalReviewText = reviewText || "The service and quality were fresh, beautiful, and absolutely delicious. Highly recommended!";

    // Fetch Merchant's Active Reward Card Config first
    const template = await db.stampCard.findFirst({ where: { merchantId, active: true } });
    const configuredBonus = template?.googleReviewBonus ?? 1;
    const configuredPhotoBonus = template?.photoBonus ?? 2;

    const photoAttached = Boolean(body?.photoUrl || body?.hasPhoto || body?.photoAttached);
    const photoBonusCount = photoAttached ? configuredPhotoBonus : 0;

    // Check if customer already submitted a Google Review previously (Upsert support)
    const existingReview = await db.review.findFirst({
      where: { merchantId, customerId },
      orderBy: { createdAt: "desc" }
    });

    const isFirstTimeReview = !existingReview;
    const reviewBonusCount = isFirstTimeReview ? configuredBonus : 0;
    const totalBonusCount = reviewBonusCount + photoBonusCount;
    const bonusCount = totalBonusCount;

    let reviewRecord;
    if (existingReview) {
      reviewRecord = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Number(rating),
          aiDraft: finalReviewText,
          finalText: finalReviewText,
          photoUrl: body?.photoUrl || null,
          photoBonusStamps: photoBonusCount,
          bonusStampsAwarded: totalBonusCount,
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
          photoUrl: body?.photoUrl || null,
          photoBonusStamps: photoBonusCount,
          bonusStampsAwarded: totalBonusCount,
          platform: "google",
          status: "submitted",
          submittedAt: new Date()
        }
      });
    }

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
      if (existingGbpReview) {
        gbpReview = await db.googleBusinessReview.update({
          where: { id: existingGbpReview.id },
          data: {
            rating: Number(rating),
            comment: finalReviewText,
            status: "pending",
            isReplied: false,
            reviewReply: null,
            createdAt: new Date()
          }
        });
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

      // Generate AI Owner Auto-Reply
      const city = merchant.address?.split(',').pop()?.trim() || "Vadodara";
      replyText = await generateAIReviewReply({
        merchantName: merchant.name || "Cake Connection",
        locationOrArea: city,
        category: merchant.category || "Cake Shop",
        customerReview: finalReviewText,
        rating: Number(rating)
      });

      // Post AI Owner Auto-Reply back to Google Business Profile API & Update DB
      const postSuccess = await postReviewReplyToGBP(merchant.id, gbpReview.gbpReviewId, replyText);

      await db.googleBusinessReview.update({
        where: { id: gbpReview.id },
        data: {
          isReplied: true,
          reviewReply: replyText,
          repliedAt: new Date(),
          status: postSuccess ? "replied" : "pending"
        }
      });
    }

    // Award Bonus Stamps to customer stamp card (Only for first-time reviews if LOYALTY module is enabled)
    if (hasModule(merchant, "LOYALTY") && isFirstTimeReview && bonusCount > 0) {
      if (template) {
        let card = await db.customerStampCard.findFirst({
          where: { customerId: customer.id, stampCardId: template.id, completed: false, redeemed: false }
        });
        if (!card) {
          card = await db.customerStampCard.create({
            data: { customerId: customer.id, stampCardId: template.id, merchantId, stampsCollected: 0 }
          });
        }

        for (let i = 0; i < bonusCount; i++) {
          await db.stamp.create({
            data: {
              customerId: customer.id,
              stampCardId: template.id,
              customerStampCardId: card.id,
              merchantId,
              source: "review_bonus"
            }
          });
        }

        const newCount = Math.min(card.stampsCollected + bonusCount, template.stampsRequired);
        await db.customerStampCard.update({
          where: { id: card.id },
          data: {
            stampsCollected: newCount,
            completed: newCount >= template.stampsRequired
          }
        });

        await db.customer.update({
          where: { id: customer.id },
          data: { lifetimeStamps: { increment: bonusCount } }
        });
      }
    }

    // 6. Send WhatsApp confirmation to Customer (Bonus Stamps added)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const walletUrl = `${appUrl}/wallet?c=${customer.id}&m=${merchant.id}`;
    const customerMsg = `🎉 *Congratulations ${customer.name || "VIP"}!* ⭐\n\nThank you for posting your Google Review! We have credited 🎁 *+${bonusCount} Bonus Stamps* to your VIP Card!\n\nCheck your updated VIP Wallet:\n${walletUrl}`;
    
    await sendCentralWhatsAppMessage({
      merchantId: merchant.id,
      toPhone: customer.phone,
      text: customerMsg,
      template: 'review_bonus_reward',
      customerId: customer.id
    });

    // 7. Send WhatsApp notification to Merchant
    if (merchant.whatsappPhone) {
      const merchantMsg = `⭐ *New 5-Star Google Review Received!* ⭐\n\n👤 *Customer:* ${customer.name}\n💬 *Review:* "${finalReviewText}"\n\n🤖 *AI Auto-Reply Sent:* "${replyText}"`;
      await sendCentralWhatsAppMessage({
        merchantId: merchant.id,
        toPhone: merchant.whatsappPhone,
        text: merchantMsg,
        template: 'merchant_review_alert'
      });
    }

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
