import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";
import crypto from "crypto";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "customerpilot_verify_123";
const APP_SECRET = process.env.META_APP_SECRET;

/**
 * Meta Webhook Handshake (GET)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Instagram Webhook] ✅ Challenge verified successfully.");
    return new Response(challenge, { status: 200 });
  }

  console.warn("[Instagram Webhook] ❌ Invalid verify token:", token);
  return new Response("Forbidden", { status: 403 });
}

/**
 * Meta Webhook Inbound Events (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // 1. Verify HMAC Signature (Security Anti-Spoofing Guard)
    if (APP_SECRET) {
      const signature = req.headers.get("x-hub-signature-256");
      if (signature) {
        const expected = "sha256=" + crypto.createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");
        if (signature !== expected) {
          console.warn("[Instagram Webhook] ❌ Invalid HMAC signature rejected.");
          return new Response("Invalid signature", { status: 401 });
        }
      }
    }

    const data = JSON.parse(rawBody);
    if (data.object !== "instagram") {
      return NextResponse.json({ status: "ignored" });
    }

    for (const entry of data.entry || []) {
      // ── Event 1: Messaging / Inbound DM (Token Pairing & Follow Verification) ──
      for (const messaging of entry.messaging || []) {
        const senderIgsid = String(messaging.sender?.id || "");
        const rawText = messaging.message?.text?.trim() || "";

        if (rawText.toUpperCase().includes("VERIFY CP_") || rawText.toUpperCase().startsWith("CP_")) {
          const match = rawText.match(/CP_[A-F0-9]+/i);
          const token = match ? match[0].toUpperCase() : null;

          if (token) {
            console.log(`[Instagram Webhook] Inbound DM pairing token detected: ${token} from IGSID: ${senderIgsid}`);
            const tokenRecord = await db.systemContent.findUnique({
              where: { key: `ig_token_${token}` }
            });

            if (tokenRecord) {
              const payload = JSON.parse(tokenRecord.value);
              const { merchantId, customerId, phone, expiresAt } = payload;

              if (new Date(expiresAt) > new Date()) {
                // Map Phone <-> IGSID
                const identity = await db.customerInstagramIdentity.upsert({
                  where: {
                    merchantId_customerId: { merchantId, customerId }
                  },
                  create: {
                    merchantId,
                    customerId,
                    phone,
                    igsid: senderIgsid
                  },
                  update: {
                    igsid: senderIgsid
                  }
                });

                console.log(`[Instagram Webhook] ✅ Paired Phone ${phone} to IGSID ${senderIgsid}`);

                // Query Meta Graph API for Follow Status
                const conn = await db.merchantInstagramConnection.findUnique({
                  where: { merchantId }
                });

                if (conn && conn.accessToken) {
                  try {
                    const graphRes = await fetch(
                      `https://graph.facebook.com/v21.0/${senderIgsid}?fields=is_user_follow_business&access_token=${conn.accessToken}`
                    );
                    const graphData = await graphRes.json();
                    const isFollowing = Boolean(graphData.is_user_follow_business);

                    if (isFollowing && !identity.followRewarded) {
                      await creditInstagramStamps({
                        merchantId,
                        customerId,
                        phone,
                        stamps: 1,
                        sourceNote: "Instagram Follow Verified"
                      });

                      await db.customerInstagramIdentity.update({
                        where: { id: identity.id },
                        data: {
                          isFollowing: true,
                          followRewarded: true
                        }
                      });
                      console.log(`[Instagram Webhook] 🏆 +1 Stamp credited to customer ${customerId} for Follow.`);
                    }
                  } catch (err: any) {
                    console.error("[Instagram Webhook] Error checking is_user_follow_business:", err.message);
                  }
                }
              } else {
                console.warn(`[Instagram Webhook] Token ${token} has expired.`);
              }
            }
          }
        }
      }

      // ── Event 2: Story Mentions (User tagged business in Instagram Story) ──
      for (const change of entry.changes || []) {
        if (change.field === "story_mentions") {
          const senderIgsid = String(change.value?.sender?.id || change.value?.from?.id || "");
          console.log(`[Instagram Webhook] Inbound story_mention from IGSID: ${senderIgsid}`);

          if (senderIgsid) {
            const identity = await db.customerInstagramIdentity.findFirst({
              where: { igsid: senderIgsid }
            });

            if (identity) {
              const lastRewardedMs = identity.lastStoryRewardedAt ? identity.lastStoryRewardedAt.getTime() : 0;
              const ONE_DAY_MS = 24 * 60 * 60 * 1000;

              if (Date.now() - lastRewardedMs > ONE_DAY_MS) {
                // Award 2 Story Bonus Stamps
                await creditInstagramStamps({
                  merchantId: identity.merchantId,
                  customerId: identity.customerId,
                  phone: identity.phone,
                  stamps: 2,
                  sourceNote: "Instagram Story Mention Verified"
                });

                await db.customerInstagramIdentity.update({
                  where: { id: identity.id },
                  data: {
                    lastStoryMentionAt: new Date(),
                    lastStoryRewardedAt: new Date()
                  }
                });
                console.log(`[Instagram Webhook] 📸 +2 Story Bonus Stamps credited to customer ${identity.customerId}`);
              } else {
                console.log(`[Instagram Webhook] Story tag reward skipped: Cooldown active (<24h).`);
              }
            } else {
              console.warn(`[Instagram Webhook] Story tag received from unmapped IGSID: ${senderIgsid}. Customer needs to pair via DM token.`);
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("[Instagram Webhook Processing Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Transactional Social Stamp Ledger Credit
 */
async function creditInstagramStamps(params: {
  merchantId: string;
  customerId: string;
  phone: string;
  stamps: number;
  sourceNote: string;
}) {
  const { merchantId, customerId, phone, stamps, sourceNote } = params;

  const template = await db.stampCard.findFirst({
    where: { merchantId, active: true }
  });
  if (!template) return;

  let totalCollected = 0;
  let rewardUnlocked = false;

  await db.$transaction(async (tx) => {
    let card = await tx.customerStampCard.findFirst({
      where: { customerId, stampCardId: template.id, completed: false, redeemed: false },
      orderBy: { createdAt: "desc" }
    });

    if (!card) {
      card = await tx.customerStampCard.create({
        data: {
          customerId,
          stampCardId: template.id,
          merchantId,
          stampsCollected: 0
        }
      });
    }

    for (let i = 0; i < stamps; i++) {
      await tx.stamp.create({
        data: {
          customerId,
          merchantId,
          stampCardId: template.id,
          customerStampCardId: card.id,
          source: sourceNote || "instagram_reward"
        }
      });
    }

    const required = template.stampsRequired || 10;
    const newCount = card.stampsCollected + stamps;

    if (newCount >= required) {
      rewardUnlocked = true;
      await tx.customerStampCard.update({
        where: { id: card.id },
        data: { stampsCollected: required, completed: true }
      });
      totalCollected = required;

      const overflow = newCount - required;
      if (overflow > 0) {
        await tx.customerStampCard.create({
          data: {
            customerId,
            stampCardId: template.id,
            merchantId,
            stampsCollected: overflow
          }
        });
        totalCollected = overflow;
      }
    } else {
      await tx.customerStampCard.update({
        where: { id: card.id },
        data: { stampsCollected: newCount }
      });
      totalCollected = newCount;
    }

    await tx.customer.update({
      where: { id: customerId },
      data: { lifetimeStamps: { increment: stamps } }
    });
  });

  // WhatsApp Celebratory Notification
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://customerpilot.in";
  const walletUrl = `${appUrl}/q/wallet/${customerId}`;
  const required = template.stampsRequired || 10;
  const remaining = Math.max(0, required - totalCollected);

  const text =
    `🎉 *Awesome! Instagram Reward Credited!* 📸\n\n` +
    `Your *${sourceNote}* has been verified!\n\n` +
    `🎁 *+${stamps} Bonus Stamps Added!* (Wallet: ${totalCollected} / ${required} Stamps)\n` +
    `🎯 *Goal:* ${template.rewardName || "FREE Reward"}${rewardUnlocked ? " — 🏆 *REWARD UNLOCKED!*" : ` (${remaining} more needed)`}\n\n` +
    `📱 *View Your Live Stamp Card:*\n${walletUrl}`;

  await sendCentralWhatsAppMessage({
    merchantId,
    toPhone: phone,
    text,
    template: "instagram_reward_verified",
    customerId
  }).catch((e) => console.error("[Instagram Reward WhatsApp Error]:", e.message));
}
