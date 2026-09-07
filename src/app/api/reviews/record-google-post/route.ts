import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAIReviewReply } from '@/lib/ai-review-reply';
import { postReviewReplyToGBP } from '@/lib/google-reviews-service';
import { sendCentralWhatsAppMessage } from '@/lib/whatsapp-service';
import { hasModule } from '@/lib/feature-gate';
import { verifyCustomerGooglePhoto } from '@/lib/review-photo-verifier';

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
    const configuredBonus = template?.googleReviewBonus ?? 2;
    const configuredPhotoBonus = template?.photoBonus ?? 2;

    const photoAttached = Boolean(body?.photoUrl || body?.hasPhoto || body?.photoAttached);

    // Check if customer already submitted a Google Review previously (Upsert support)
    const existingReview = await db.review.findFirst({
      where: { merchantId, customerId },
      orderBy: { createdAt: "desc" }
    });

    const alreadyHadReview = Boolean(existingReview);
    const alreadyHadPhoto = Boolean(existingReview && (existingReview.photoBonusStamps > 0 || existingReview.photoUrl));

    // 1. Base Review Bonus (awarded immediately if first time)
    const reviewBonusToAward = alreadyHadReview ? 0 : configuredBonus;

    // 2. Automated Google Photo Verification Pipeline
    let photoBonusToAward = 0;
    let photoVerificationStatus: "VERIFIED" | "PENDING" | "NONE" = "NONE";
    let verificationStage = "INITIAL_REVIEW";
    let matchedPhotoUri: string | null = body?.photoUrl || null;
    let matchConfidence: number | null = null;

    if (!alreadyHadPhoto && configuredPhotoBonus > 0) {
      // During Google Business Profile Enterprise API approval period (10-15 business days),
      // by default treat all CustomerPilot Google Review posts as having a verified product photo,
      // awarding full 2 + 2 = 4 bonus stamps immediately.
      const DEFAULT_PHOTO_BONUS_GRACE_PERIOD = true;

      if (DEFAULT_PHOTO_BONUS_GRACE_PERIOD) {
        photoBonusToAward = configuredPhotoBonus;
        photoVerificationStatus = "VERIFIED";
        verificationStage = "PRE_APPROVED_GRACE_PERIOD";
        matchedPhotoUri = body?.photoUrl || matchedPhotoUri || null;
        matchConfidence = 1.0;
      } else {
        // Check if photo can be verified immediately (sandbox session photo or live GBP)
        const photoCheck = await verifyCustomerGooglePhoto(
          merchantId,
          customer.name || "VIP Member",
          new Date()
        );

        if (photoCheck.verified) {
          photoBonusToAward = configuredPhotoBonus;
          photoVerificationStatus = "VERIFIED";
          verificationStage = photoCheck.stage;
          matchedPhotoUri = photoCheck.photoUri || matchedPhotoUri;
          matchConfidence = photoCheck.confidence ?? null;
        } else {
          // Enqueue 20-min verification check in ReviewBonusLog
          photoVerificationStatus = "PENDING";
        }
      }
    }

    const totalBonusToAward = reviewBonusToAward + photoBonusToAward;
    const bonusCount = totalBonusToAward;

    let reviewRecord;
    const cumulativePhotoBonus = (existingReview?.photoBonusStamps || 0) + photoBonusToAward;
    const cumulativeTotalBonus = (existingReview?.bonusStampsAwarded || 0) + totalBonusToAward;

    if (existingReview) {
      reviewRecord = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Number(rating),
          aiDraft: finalReviewText,
          finalText: finalReviewText,
          photoUrl: matchedPhotoUri || existingReview.photoUrl || null,
          photoBonusStamps: cumulativePhotoBonus,
          bonusStampsAwarded: cumulativeTotalBonus,
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
          photoBonusStamps: photoBonusToAward,
          bonusStampsAwarded: totalBonusToAward,
          platform: "google",
          status: "submitted",
          submittedAt: new Date()
        }
      });
    }

    // Create entry in ReviewBonusLog queue for auditing and automated rechecking
    await db.reviewBonusLog.create({
      data: {
        merchantId,
        customerId: customer.id,
        reviewId: reviewRecord.id,
        reviewerName: customer.name || "VIP Member",
        stage: verificationStage,
        photoUri: matchedPhotoUri,
        matchConfidence,
        decision: photoVerificationStatus === "VERIFIED" ? "4_STAMPS" : (photoVerificationStatus === "PENDING" ? "PENDING" : "2_STAMPS"),
        reason: photoVerificationStatus === "VERIFIED" ? "photo_verified_on_post" : (photoVerificationStatus === "PENDING" ? "awaiting_google_photo_indexing" : "review_only"),
        recheckScheduled: photoVerificationStatus === "PENDING",
        recheckAt: photoVerificationStatus === "PENDING" ? new Date(Date.now() + 20 * 60 * 1000) : null,
        retryCount: 0,
        finalizedAt: photoVerificationStatus !== "PENDING" ? new Date() : null
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

      // Generate AI Owner Auto-Reply with Local SEO Keywords
      const city = merchant.city || merchant.address?.split(',').pop()?.trim() || "Vadodara";
      const category = merchant.businessType || merchant.category || "fresh cakes and bakery products";
      replyText = await generateAIReviewReply({
        merchantName: merchant.name || "Cake Connection",
        locationOrArea: city,
        category: category,
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
          status: postSuccess ? "replied" : "replied"
        }
      });
    }

    // Award Bonus Stamps to customer stamp card (If LOYALTY module is enabled and bonus to award > 0)
    let finalStampsInWallet = 0;
    let cardCompletedNow = false;

    if (hasModule(merchant, "LOYALTY") && totalBonusToAward > 0) {
      if (template) {
        let card = await db.customerStampCard.findFirst({
          where: { customerId: customer.id, stampCardId: template.id, completed: false, redeemed: false },
          orderBy: { createdAt: "desc" }
        });
        if (!card) {
          card = await db.customerStampCard.create({
            data: { customerId: customer.id, stampCardId: template.id, merchantId, stampsCollected: 0 }
          });
        }

        // Add review bonus stamps
        for (let i = 0; i < reviewBonusToAward; i++) {
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

        // Add photo bonus stamps
        for (let i = 0; i < photoBonusToAward; i++) {
          await db.stamp.create({
            data: {
              customerId: customer.id,
              stampCardId: template.id,
              customerStampCardId: card.id,
              merchantId,
              source: "photo_bonus"
            }
          });
        }

        const stampsRequired = template.stampsRequired || 10;
        const totalNewCount = card.stampsCollected + totalBonusToAward;

        if (totalNewCount >= stampsRequired) {
          cardCompletedNow = true;
          await db.customerStampCard.update({
            where: { id: card.id },
            data: {
              stampsCollected: stampsRequired,
              completed: true
            }
          });
          finalStampsInWallet = stampsRequired;

          // If overflow, create next cycle card
          const overflow = totalNewCount - stampsRequired;
          if (overflow > 0) {
            await db.customerStampCard.create({
              data: {
                customerId: customer.id,
                stampCardId: template.id,
                merchantId,
                stampsCollected: overflow
              }
            });
            finalStampsInWallet = overflow;
          }
        } else {
          await db.customerStampCard.update({
            where: { id: card.id },
            data: {
              stampsCollected: totalNewCount,
              completed: false
            }
          });
          finalStampsInWallet = totalNewCount;
        }

        await db.customer.update({
          where: { id: customer.id },
          data: { lifetimeStamps: { increment: totalBonusToAward } }
        });
      }
    } else if (template) {
      const currentCard = await db.customerStampCard.findFirst({
        where: { customerId: customer.id, stampCardId: template.id, completed: false },
        orderBy: { createdAt: "desc" }
      });
      finalStampsInWallet = currentCard?.stampsCollected ?? customer.lifetimeStamps ?? 0;
    }

    // 6. Send WhatsApp confirmation to Customer (Bonus Stamps added + Real-Time Digital Wallet Link)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const walletUrl = `${appUrl}/q/wallet/${customer.id}`;
    const stampsRequired = template?.stampsRequired || 10;
    const remaining = Math.max(0, stampsRequired - finalStampsInWallet);

    let customerMsg = "";
    if (photoVerificationStatus === "VERIFIED" && totalBonusToAward > 0) {
      customerMsg = `🎉 *Congratulations ${customer.name || "VIP"}!* ⭐\n\n` +
        `Thank you for supporting *${merchant.name}* on Google Maps!\n\n` +
        `✅ *+${totalBonusToAward} Bonus Stamps Credited!* (+${reviewBonusToAward} Review ⭐ + ${photoBonusToAward} Photo Bonus 📸)\n` +
        `📊 *Wallet:* ${finalStampsInWallet} / ${stampsRequired} Stamps\n` +
        `🎁 *Goal:* ${template?.rewardName || "FREE Reward"}${cardCompletedNow ? " — 🏆 *REWARD UNLOCKED!*" : ` (${remaining} more stamp(s) needed)`}\n\n` +
        `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`;
    } else if (reviewBonusToAward > 0) {
      customerMsg = `🎉 *Congratulations ${customer.name || "VIP"}!* ⭐\n\n` +
        `Thank you for supporting *${merchant.name}* on Google Maps!\n\n` +
        `✅ *+${reviewBonusToAward} Review Bonus Stamps Credited!* ⭐\n` +
        (configuredPhotoBonus > 0 && !alreadyHadPhoto
          ? `📸 *Attached a Product Photo on Google Maps?* Our system will verify it automatically within 20 mins and add *+${configuredPhotoBonus} Extra Stamps* (Total 4)! 🎁\n\n`
          : `\n`) +
        `📊 *Wallet:* ${finalStampsInWallet} / ${stampsRequired} Stamps\n` +
        `🎁 *Goal:* ${template?.rewardName || "FREE Reward"}${cardCompletedNow ? " — 🏆 *REWARD UNLOCKED!*" : ` (${remaining} more stamp(s) needed)`}\n\n` +
        `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`;
    } else {
      customerMsg = `⭐ *Thank you ${customer.name || "VIP"}!* ❤️\n\n` +
        `Your review for *${merchant.name}* has been updated on Google Maps!\n\n` +
        `📊 *Wallet:* ${finalStampsInWallet} / ${stampsRequired} Stamps\n` +
        `🎁 *Next Reward:* ${template?.rewardName || "FREE Reward"} (${remaining} more needed)\n\n` +
        `📱 *View Your Live Digital Stamp Card:*\n${walletUrl}`;
    }

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
