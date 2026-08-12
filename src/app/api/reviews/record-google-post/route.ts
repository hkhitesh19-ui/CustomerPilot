import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAIReviewReply } from '@/lib/ai-review-reply';
import { postReviewReplyToGBP } from '@/lib/google-reviews-service';
import { sendCentralWhatsAppMessage } from '@/lib/whatsapp-service';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://200.97.170.53:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "Evo_Api_Key_Secure_998877!";

async function sendWhatsApp(merchantId: string, toPhone: string, text: string, template: string, customerId?: string) {
  try {
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

    if (!customerId || !merchantId) {
      return NextResponse.json({ error: "customerId and merchantId are required" }, { status: 400 });
    }

    const customer = await db.customer.findUnique({ where: { id: customerId } });
    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });

    if (!customer || !merchant) {
      return NextResponse.json({ error: "Customer or Merchant not found" }, { status: 404 });
    }

    const finalReviewText = reviewText || "The cake was fresh, beautiful, and absolutely delicious. Highly recommended!";

    // Fetch Merchant's Active Reward Card Config first
    const template = await db.stampCard.findFirst({ where: { merchantId, active: true } });
    const configuredBonus = template?.googleReviewBonus ?? 1;

    // Check if customer already submitted a Google Review previously (Upsert support)
    const existingReview = await db.review.findFirst({
      where: { merchantId, customerId },
      orderBy: { createdAt: "desc" }
    });

    const isFirstTimeReview = !existingReview;
    const bonusCount = isFirstTimeReview ? configuredBonus : 0; // Award dynamic bonus stamps per merchant's Step 5 settings

    let reviewRecord;
    if (existingReview) {
      reviewRecord = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Number(rating),
          aiDraft: finalReviewText,
          finalText: finalReviewText,
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
          platform: "google",
          status: "submitted",
          submittedAt: new Date(),
          bonusStampsAwarded: bonusCount
        }
      });
    }

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

    // 3. Award Bonus Stamps to customer stamp card (Only for first-time reviews)
    if (isFirstTimeReview && bonusCount > 0) {
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

    // 4. Generate AI Owner Auto-Reply
    const city = merchant.address?.split(',').pop()?.trim() || "Vadodara";
    const replyText = await generateAIReviewReply({
      merchantName: merchant.name || "Cake Connection",
      locationOrArea: city,
      category: merchant.category || "Cake Shop",
      customerReview: finalReviewText
    });

    // 5. Post AI Owner Auto-Reply back to Google Business Profile API & Update DB
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
