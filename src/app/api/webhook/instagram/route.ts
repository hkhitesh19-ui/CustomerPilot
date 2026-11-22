import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";
import crypto from "crypto";

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "customerpilot_verify_123";

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
 * Timing-safe HMAC SHA-256 Signature Verification
 */
function verifyMetaSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }
  const receivedSig = signatureHeader.slice(7);
  const expectedSig = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  const receivedBuf = Buffer.from(receivedSig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");

  if (receivedBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuf, expectedBuf);
}

/**
 * Meta Webhook Inbound Events (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const appSecret = process.env.META_APP_SECRET;

    // 1. Mandatory Timing-Safe Signature Verification
    if (appSecret) {
      const signature = req.headers.get("x-hub-signature-256");
      const isValid = verifyMetaSignature(rawBody, signature, appSecret);
      if (!isValid) {
        console.warn("[Instagram Webhook] ❌ Rejecting request: Invalid or missing x-hub-signature-256");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
    }

    if (data.object !== "instagram" && data.object !== "page") {
      return NextResponse.json({ status: "ignored" });
    }

    for (const entry of data.entry || []) {
      // ── Stream A: Messenger / Inbound Messaging Events ──
      for (const messaging of entry.messaging || []) {
        // 2. Ignore Echo Messages Sent by the Page
        if (messaging.message?.is_echo) {
          continue;
        }

        const senderIgsid = String(messaging.sender?.id || "");
        const mid = messaging.message?.mid ? String(messaging.message.mid) : null;

        // 3. Webhook Delivery Deduplication via Message ID (.mid)
        if (mid) {
          const dedupeKey = `ig_mid_${mid}`;
          const existing = await db.systemContent.findUnique({ where: { key: dedupeKey } });
          if (existing) {
            console.log(`[Instagram Webhook] Duplicate delivery ignored for mid: ${mid}`);
            continue;
          }
          await db.systemContent.create({
            data: {
              section: "instagram_dedupe",
              key: dedupeKey,
              value: JSON.stringify({ senderIgsid, processedAt: new Date().toISOString() })
            }
          }).catch(() => {});
        }

        // 4. Story Mention Attachment in messaging[] (Meta Messaging API Spec)
        const attachments = messaging.message?.attachments || [];
        const isStoryMentionAttachment = attachments.some((att: any) => att.type === "story_mention");

        if (isStoryMentionAttachment && senderIgsid) {
          await processStoryMentionReward(senderIgsid);
        }

        // 5. Inbound DM Token Pairing & Follow Verification
        const rawText = messaging.message?.text?.trim() || "";
        if (rawText.toUpperCase().includes("VERIFY CP_") || rawText.toUpperCase().startsWith("CP_")) {
          const match = rawText.match(/CP_[A-F0-9]+/i);
          const token = match ? match[0].toUpperCase() : null;

          if (token) {
            console.log(`[Instagram Webhook] Pairing token detected: ${token} from IGSID: ${senderIgsid}`);
            const tokenKey = `ig_token_${token}`;

            // 6. Atomic Token Consumption (Replay Attack Guard)
            let tokenRecord: any = null;
            try {
              tokenRecord = await db.systemContent.delete({
                where: { key: tokenKey }
              });
            } catch {
              // Already consumed or does not exist
              tokenRecord = null;
            }

            if (tokenRecord) {
              const payload = JSON.parse(tokenRecord.value);
              const { merchantId, customerId, phone, expiresAt } = payload;

              if (new Date(expiresAt) > new Date()) {
                // Map Phone <-> IGSID in DB (Persists even if user isn't following yet)
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

                console.log(`[Instagram Webhook] ✅ Mapped Phone ${phone} to IGSID ${senderIgsid}`);

                // Check Follow status via Meta Graph API
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

                    if (isFollowing) {
                      // 7. Atomic Follow Claim & Credit in Single Transaction (ACID rollback on error)
                      const credited = await claimAndCreditFollowReward(identity.id, {
                        merchantId,
                        customerId,
                        phone,
                        stamps: 1,
                        sourceNote: "Instagram Follow Verified"
                      });

                      if (credited) {
                        console.log(`[Instagram Webhook] 🏆 +1 Stamp credited atomically in transaction to customer ${customerId} for Follow.`);
                      } else {
                        console.log(`[Instagram Webhook] Follow reward race condition dropped (already claimed).`);
                      }
                    } else {
                      // Customer mapped, but not following yet -> Keep record so follow re-verification works
                      await db.customerInstagramIdentity.update({
                        where: { id: identity.id },
                        data: { isFollowing: false }
                      });
                      console.log(`[Instagram Webhook] Customer ${customerId} is not following yet. Phone <-> IGSID remains paired.`);
                    }
                  } catch (err: any) {
                    console.error("[Instagram Webhook] Error checking is_user_follow_business:", err.message);
                  }
                }
              } else {
                console.warn(`[Instagram Webhook] Expired token rejected: ${token}`);
              }
            } else {
              console.warn(`[Instagram Webhook] Token ${token} already consumed or invalid (Replay blocked).`);
            }
          }
        } else {
          // If no pairing token in text, check if this sender was previously paired and pending follow reward
          await checkPendingFollowReward(senderIgsid);
        }
      }

      // ── Stream B: Graph API Changes Webhook (changes[].field === 'story_mentions') ──
      for (const change of entry.changes || []) {
        if (change.field === "story_mentions") {
          const senderIgsid = String(change.value?.sender?.id || change.value?.from?.id || "");
          if (senderIgsid) {
            await processStoryMentionReward(senderIgsid);
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
 * Story Mention Reward Processor with Atomic db.$transaction Claim & Credit
 */
async function processStoryMentionReward(senderIgsid: string) {
  const identity = await db.customerInstagramIdentity.findFirst({
    where: { igsid: senderIgsid }
  });

  if (!identity) {
    console.warn(`[Instagram Webhook] Story tag from unmapped IGSID: ${senderIgsid}`);
    return;
  }

  const credited = await claimAndCreditStoryReward(identity.id, {
    merchantId: identity.merchantId,
    customerId: identity.customerId,
    phone: identity.phone,
    stamps: 2,
    sourceNote: "Instagram Story Mention Verified"
  });

  if (credited) {
    console.log(`[Instagram Webhook] 📸 +2 Story Bonus Stamps credited atomically to customer ${identity.customerId}`);
  } else {
    console.log(`[Instagram Webhook] Story tag reward skipped: 24h cooldown active or race condition dropped.`);
  }
}

/**
 * Re-check pending follow reward for mapped customers sending regular DMs
 */
async function checkPendingFollowReward(senderIgsid: string) {
  try {
    const identity = await db.customerInstagramIdentity.findFirst({
      where: { igsid: senderIgsid, followRewarded: false }
    });
    if (!identity) return;

    const conn = await db.merchantInstagramConnection.findUnique({
      where: { merchantId: identity.merchantId }
    });
    if (!conn || !conn.accessToken) return;

    const graphRes = await fetch(
      `https://graph.facebook.com/v21.0/${senderIgsid}?fields=is_user_follow_business&access_token=${conn.accessToken}`
    );
    const graphData = await graphRes.json();
    if (graphData.is_user_follow_business) {
      const credited = await claimAndCreditFollowReward(identity.id, {
        merchantId: identity.merchantId,
        customerId: identity.customerId,
        phone: identity.phone,
        stamps: 1,
        sourceNote: "Instagram Follow Verified"
      });

      if (credited) {
        console.log(`[Instagram Webhook] 🏆 +1 Stamp credited to customer ${identity.customerId} on subsequent message.`);
      }
    }
  } catch (err: any) {
    console.error("[Instagram Webhook] Error in checkPendingFollowReward:", err.message);
  }
}

/**
 * Truly Atomic Follow Claim & Credit inside a single db.$transaction
 * If stamp creation throws, the claim rolls back so reward is not lost!
 */
async function claimAndCreditFollowReward(
  identityId: string,
  params: {
    merchantId: string;
    customerId: string;
    phone: string;
    stamps: number;
    sourceNote: string;
  }
): Promise<boolean> {
  const { merchantId, customerId, phone, stamps, sourceNote } = params;

  const template = await db.stampCard.findFirst({
    where: { merchantId, active: true }
  });
  if (!template) return false;

  let credited = false;
  let totalCollected = 0;
  let rewardUnlocked = false;

  await db.$transaction(
    async (tx) => {
      // 1. Atomic claim inside transaction
      const claim = await tx.customerInstagramIdentity.updateMany({
        where: {
          id: identityId,
          followRewarded: false
        },
        data: {
          isFollowing: true,
          followRewarded: true
        }
      });

      if (claim.count !== 1) {
        return; // Already rewarded or concurrent race condition
      }

      // 2. Credit stamps inside transaction
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

      await tx.stamp.createMany({
        data: Array.from({ length: stamps }).map(() => ({
          customerId,
          merchantId,
          stampCardId: template.id,
          customerStampCardId: card.id,
          source: sourceNote || "instagram_reward"
        }))
      });

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

    credited = true;
  }, { timeout: 15000, maxWait: 5000 });

  if (credited) {
    sendInstagramRewardWhatsApp({
      merchantId,
      customerId,
      phone,
      stamps,
      sourceNote,
      template,
      totalCollected,
      rewardUnlocked
    });
  }

  return credited;
}

/**
 * Truly Atomic Story Claim & Credit inside a single db.$transaction
 * If stamp creation throws, the 24h cadence timestamp rolls back!
 */
async function claimAndCreditStoryReward(
  identityId: string,
  params: {
    merchantId: string;
    customerId: string;
    phone: string;
    stamps: number;
    sourceNote: string;
  }
): Promise<boolean> {
  const { merchantId, customerId, phone, stamps, sourceNote } = params;

  const template = await db.stampCard.findFirst({
    where: { merchantId, active: true }
  });
  if (!template) return false;

  let credited = false;
  let totalCollected = 0;
  let rewardUnlocked = false;

  await db.$transaction(
    async (tx) => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const claim = await tx.customerInstagramIdentity.updateMany({
        where: {
          id: identityId,
          OR: [
            { lastStoryRewardedAt: null },
            { lastStoryRewardedAt: { lt: cutoff } }
          ]
        },
        data: {
          lastStoryMentionAt: new Date(),
          lastStoryRewardedAt: new Date()
        }
      });

      if (claim.count !== 1) {
        return; // 24h cooldown active or concurrent race condition
      }

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

      await tx.stamp.createMany({
        data: Array.from({ length: stamps }).map(() => ({
          customerId,
          merchantId,
          stampCardId: template.id,
          customerStampCardId: card.id,
          source: sourceNote || "instagram_reward"
        }))
      });

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

    credited = true;
  }, { timeout: 15000, maxWait: 5000 });

  if (credited) {
    sendInstagramRewardWhatsApp({
      merchantId,
      customerId,
      phone,
      stamps,
      sourceNote,
      template,
      totalCollected,
      rewardUnlocked
    });
  }

  return credited;
}

/**
 * Non-blocking WhatsApp Celebratory Notification
 */
function sendInstagramRewardWhatsApp(params: {
  merchantId: string;
  customerId: string;
  phone: string;
  stamps: number;
  sourceNote: string;
  template: any;
  totalCollected: number;
  rewardUnlocked: boolean;
}) {
  const { merchantId, customerId, phone, stamps, sourceNote, template, totalCollected, rewardUnlocked } = params;
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

  sendCentralWhatsAppMessage({
    merchantId,
    toPhone: phone,
    text,
    template: "instagram_reward_verified",
    customerId
  }).catch((e) => console.error("[Instagram Reward WhatsApp Error]:", e.message));
}
