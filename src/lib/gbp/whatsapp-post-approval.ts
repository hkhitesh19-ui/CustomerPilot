/**
 * src/lib/gbp/whatsapp-post-approval.ts
 *
 * CustomerPilot RankLocal AI™ — Two-Way Interactive WhatsApp Google Post Approval Engine
 *
 * Outbound (Every Monday 09:30 AM IST):
 *   Dispatches the week's 4 scheduled Google Posts (Tue / Thu / Sat / Sun) to the merchant's
 *   WhatsApp with clear 1-line approval & edit commands.
 *
 * Inbound (via /api/webhook/evolution):
 *   Parses merchant replies in Hinglish / English:
 *   - "Approved all" / "Approve all" / "Sab ok"  -> Approves all 4 pending posts
 *   - "Approved 1, 2, 4"                         -> Approves specific posts
 *   - "Edit 3: offer 20% kardo" / "Price 1: 600" -> AI rewrites caption/offer/price & sends preview
 *   - "Change creative 1" / "Change photo 1"     -> Rotates to next verified creative PNG & confirms
 */

import { db } from "@/lib/db";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";
import {
  regenerateSinglePost,
  sanitizeCaptionForGooglePolicy,
} from "@/lib/gbp-post-generator";

const CREATIVE_LIBRARY_CAKE = [
  "/cake_connection_friday_post.png",
  "/cake_connection_standee_v3.png",
  "/cake_connection_official_logo.png",
];

const CREATIVE_LIBRARY_CP = [
  "/customerpilot_review_standee_tabletop.png",
  "/customerpilot_smart_review_card.png",
  "/cplogo_horizontal.png",
];

/**
 * Fetches the current week's pending (AWAITING_APPROVAL) or upcoming posts ordered 1..4
 */
export async function getPendingWeeklyPostsForMerchant(merchantId: string) {
  const posts = await db.gbpPost.findMany({
    where: {
      merchantId,
      status: { in: ["AWAITING_APPROVAL", "DRAFT"] },
    },
    orderBy: { scheduledDate: "asc" },
    take: 4,
  });
  return posts;
}

/**
 * Formats and dispatches the Monday 4-Post WhatsApp Approval Menu to the merchant's WhatsApp.
 */
export async function dispatchWeeklyPostsWhatsAppApproval(merchantId: string): Promise<{
  sent: boolean;
  postsCount: number;
  toPhone?: string;
  error?: string;
}> {
  const merchant = await db.merchant.findUnique({
    where: { id: merchantId },
    select: {
      id: true,
      name: true,
      whatsappPhone: true,
      ownerName: true,
    },
  });

  if (!merchant) {
    return { sent: false, postsCount: 0, error: "Merchant not found" };
  }

  const targetPhone = merchant.whatsappPhone?.replace(/\D/g, "");
  if (!targetPhone || targetPhone.length < 10) {
    return { sent: false, postsCount: 0, error: "Merchant whatsappPhone not configured" };
  }

  const pendingPosts = await getPendingWeeklyPostsForMerchant(merchantId);
  if (pendingPosts.length === 0) {
    return { sent: false, postsCount: 0, error: "No AWAITING_APPROVAL posts found" };
  }

  const cleanStoreName = merchant.name.split(/[-–:|]/)[0].trim();
  const numEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"];

  const postLines = pendingPosts
    .map((p, idx) => {
      const emoji = numEmojis[idx] || `${idx + 1}.`;
      const dayLabel = p.scheduledDay || "SCHEDULED";
      const dateStr = new Date(p.scheduledDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      const title = p.title || p.postType;
      const snippet = p.caption.replace(/\n+/g, " ").slice(0, 85);
      return `${emoji} *${dayLabel} (${dateStr})* — ${title}\n   _${snippet}..._`;
    })
    .join("\n\n");

  const message =
    `🚀 *RankLocal AI — Weekly Google Posts Approval*\n` +
    `Namaste *${cleanStoreName}*! Aapke is hafte ke *${pendingPosts.length} Google Maps Posts* ready hain:\n\n` +
    `${postLines}\n\n` +
    `✅ *Dashboard Preview:* https://customerpilot.in/dashboard/gbp-status\n\n` +
    `👉 *Approve ya Edit karne ke liye bas reply karein:*\n` +
    `• *"Approved all"* — Sabhi ${pendingPosts.length} posts scheduled days par auto-publish ho jayenge\n` +
    `• *"Approved 1, 2, 4"* — Sirf selected posts approve honge\n` +
    `• *"Edit 3: offer 20% kardo"* — AI turant Post #3 rewrite karke naya preview bhejega\n` +
    `• *"Price 1: ₹600 karo"* — Post #1 ka price update hoga\n` +
    `• *"Change creative 1"* — Post #1 ka photo change hoga`;

  const res = await sendCentralWhatsAppMessage({
    merchantId: merchant.id,
    toPhone: targetPhone,
    text: message,
    template: "gbp_weekly_posts_approval",
  });

  return {
    sent: res.success,
    postsCount: pendingPosts.length,
    toPhone: targetPhone,
    error: res.error,
  };
}

/**
 * Checks whether an inbound WhatsApp message is a GBP Post Approval / Edit command.
 */
export function isGbpPostApprovalCommand(text: string): boolean {
  const lower = text.trim().toLowerCase();
  if (!lower) return false;
  return (
    /^(approved|approve|ok\s*all|sab\s*(ok|approved|sahi|theek))/i.test(lower) ||
    /\b(approved|approve)\s+(all|1|2|3|4)/i.test(lower) ||
    /^(edit|change|update|price|rate|offer|creative|photo|reject)\s*#?[1-4]\b/i.test(lower) ||
    /^(change\s+(creative|photo|image|offer|price))\s*#?[1-4]\b/i.test(lower) ||
    /^post\s*#?[1-4]\b/i.test(lower)
  );
}

/**
 * Rewrites a post's caption cleanly using AI (Groq/OpenAI-compatible endpoint) or deterministic update.
 */
async function rewriteCaptionWithInstruction(
  originalCaption: string,
  instruction: string,
  storeName: string
): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || "https://api.groq.com/openai/v1/chat/completions";
  const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

  if (apiKey && !apiKey.startsWith("mock_")) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 450,
          messages: [
            {
              role: "system",
              content:
                "You are a Google Business Profile SEO copywriter for Indian local businesses. Apply the merchant's exact edit instruction (price change, offer change, wording tweak) to the Google Post caption. STRICT POLICY: NEVER include any phone number or mobile digits inside the caption text. Return ONLY the updated caption text, nothing else.",
            },
            {
              role: "user",
              content: `Store: ${storeName}\n\nOriginal Google Post Caption:\n${originalCaption}\n\nMerchant Edit Instruction:\n${instruction}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 20) {
          return sanitizeCaptionForGooglePolicy(content);
        }
      }
    } catch (e: any) {
      console.warn("[GBP WhatsApp AI Edit] LLM fallback triggered:", e.message);
    }
  }

  // Deterministic safe fallback if AI API unavailable: apply price/offer tweak directly
  let updated = originalCaption;
  const priceMatch = instruction.match(/(?:₹|rs\.?|inr|price|rate)\s*[:\-]?\s*(\d{2,6})/i);
  if (priceMatch) {
    const newPrice = `₹${priceMatch[1]}`;
    if (/₹\s*\d[\d,]*/.test(updated)) {
      updated = updated.replace(/₹\s*\d[\d,]*/g, newPrice);
    } else {
      updated += `\n\n⭐ Updated Special Price: ${newPrice}/-`;
    }
  } else {
    updated += `\n\n✨ Update: ${instruction.trim()}`;
  }
  return sanitizeCaptionForGooglePolicy(updated);
}

/**
 * Processes an inbound WhatsApp reply from a Merchant for their weekly Google Posts.
 * Returns { handled: true, replyText } if it was a GBP post command, else { handled: false }.
 */
export async function handleMerchantGbpPostWhatsAppReply(params: {
  merchantId: string;
  senderPhone: string;
  text: string;
}): Promise<{ handled: boolean; replyText?: string; updatedPostIds?: string[] }> {
  const { merchantId, text } = params;
  if (!isGbpPostApprovalCommand(text)) {
    return { handled: false };
  }

  const merchant = await db.merchant.findUnique({
    where: { id: merchantId },
    select: { id: true, name: true, category: true },
  });
  if (!merchant) return { handled: false };

  const pendingPosts = await getPendingWeeklyPostsForMerchant(merchantId);
  if (pendingPosts.length === 0) {
    return {
      handled: true,
      replyText:
        `ℹ️ *RankLocal AI*: Abhi koi pending Google Post approval ke liye nahi hai. Agla 4-post batch Monday subah 9:30 AM par aayega!`,
    };
  }

  const lower = text.trim().toLowerCase();
  const cleanStoreName = merchant.name.split(/[-–:|]/)[0].trim();

  // CASE 1: Approve ALL pending posts
  if (/^(approved\s*all|approve\s*all|ok\s*all|sab\s*(ok|approved|sahi|theek))/i.test(lower)) {
    const ids = pendingPosts.map((p) => p.id);
    await db.gbpPost.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        merchantFeedback: text.trim(),
      },
    });

    const scheduleSummary = pendingPosts
      .map(
        (p, i) =>
          `${i + 1}. ${p.scheduledDay} (${new Date(p.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}) — ${p.title || p.postType}`
      )
      .join("\n");

    return {
      handled: true,
      updatedPostIds: ids,
      replyText:
        `✅ *All ${ids.length} Google Posts Approved!*\n\n` +
        `${scheduleSummary}\n\n` +
        `🚀 RankLocal AI AutoPilot in sabhi posts ko unke scheduled days par subah 10:00 AM IST automatically Google Maps par LIVE publish kar dega aur aapko link bhej dega!`,
    };
  }

  // CASE 2: Approve SPECIFIC post numbers (e.g. "Approved 1, 2, 4")
  if (/^(approved|approve)\b/i.test(lower)) {
    const matches = lower.match(/[1-4]/g) || [];
    const uniqueIndices = Array.from(new Set(matches.map((m) => parseInt(m, 10) - 1))).filter(
      (idx) => idx >= 0 && idx < pendingPosts.length
    );

    if (uniqueIndices.length > 0) {
      const approvedPosts = uniqueIndices.map((idx) => pendingPosts[idx]);
      const ids = approvedPosts.map((p) => p.id);
      await db.gbpPost.updateMany({
        where: { id: { in: ids } },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          merchantFeedback: text.trim(),
        },
      });

      const approvedNums = uniqueIndices.map((i) => `#${i + 1}`).join(", ");
      const remainingNums = pendingPosts
        .map((_, idx) => idx)
        .filter((idx) => !uniqueIndices.includes(idx))
        .map((i) => `#${i + 1}`);

      const remainNote =
        remainingNums.length > 0
          ? `\n⏸️ Pending/Hold: Post ${remainingNums.join(", ")} (Edit karne ke liye *"Edit ${remainingNums[0].replace("#", "")}: <change>"* reply karein)`
          : `\n🎉 Is hafte ke sabhi posts approve ho chuke hain!`;

      return {
        handled: true,
        updatedPostIds: ids,
        replyText:
          `✅ *Post ${approvedNums} Approved!* Ye scheduled date par Google Maps par auto-publish ho jayenge.${remainNote}`,
      };
    }
  }

  // CASE 3: Change Creative / Photo for specific post (e.g. "Change creative 1" / "Change photo 2")
  const creativeMatch = lower.match(/(?:change\s+)?(?:creative|photo|image)\s*#?([1-4])/i);
  if (creativeMatch) {
    const idx = parseInt(creativeMatch[1], 10) - 1;
    const targetPost = pendingPosts[idx];
    if (targetPost) {
      const isCake =
        merchant.id === "cmtymavfx0002kx008lbfvp57" ||
        merchant.name.toLowerCase().includes("cake");
      const library = isCake ? CREATIVE_LIBRARY_CAKE : CREATIVE_LIBRARY_CP;
      const currentPos = library.indexOf(targetPost.imageUrl);
      const nextCreative = library[(currentPos + 1) % library.length];

      await db.gbpPost.update({
        where: { id: targetPost.id },
        data: {
          imageUrl: nextCreative,
          revisionCount: (targetPost.revisionCount || 0) + 1,
          merchantFeedback: text.trim(),
        },
      });

      return {
        handled: true,
        updatedPostIds: [targetPost.id],
        replyText:
          `🎨 *Post #${idx + 1} Creative Updated!*\n` +
          `Naya Creative Preview: https://customerpilot.in${nextCreative}\n\n` +
          `Agar ye sahi lag raha hai to *"Approved ${idx + 1}"* reply karein!`,
      };
    }
  }

  // CASE 4: Reject / Regenerate completely (e.g. "Reject 2")
  const rejectMatch = lower.match(/^reject\s*#?([1-4])(?:\s*[:\-]?\s*(.*))?$/i);
  if (rejectMatch) {
    const idx = parseInt(rejectMatch[1], 10) - 1;
    const targetPost = pendingPosts[idx];
    if (targetPost) {
      const regenerated = await regenerateSinglePost(targetPost.id, rejectMatch[2] || "Regenerated via WhatsApp");
      return {
        handled: true,
        updatedPostIds: [targetPost.id],
        replyText:
          `🔄 *Post #${idx + 1} Regenerated!*\n*${regenerated.title}*\n\n${regenerated.caption.slice(0, 320)}...\n\n👉 Pasand aaya to *"Approved ${idx + 1}"* reply karein!`,
      };
    }
  }

  // CASE 5: Edit / Offer / Price / Post #N custom instruction (e.g. "Edit 3: offer 20% kardo", "Price 1: 600 karo")
  const editMatch = text.trim().match(/^(?:edit|update|change|offer|price|rate|post)\s*#?([1-4])\s*[:\-]?\s*(.+)$/i);
  if (editMatch) {
    const idx = parseInt(editMatch[1], 10) - 1;
    const instruction = editMatch[2].trim();
    const targetPost = pendingPosts[idx];
    if (targetPost && instruction) {
      const updatedCaption = await rewriteCaptionWithInstruction(
        targetPost.caption,
        instruction,
        cleanStoreName
      );

      await db.gbpPost.update({
        where: { id: targetPost.id },
        data: {
          caption: updatedCaption,
          revisionCount: (targetPost.revisionCount || 0) + 1,
          merchantFeedback: text.trim(),
          status: "AWAITING_APPROVAL",
        },
      });

      return {
        handled: true,
        updatedPostIds: [targetPost.id],
        replyText:
          `✏️ *Post #${idx + 1} Updated as requested!*\n\n` +
          `${updatedCaption.slice(0, 420)}\n\n` +
          `👉 Confirm karne ke liye *"Approved ${idx + 1}"* reply karein (ya aur change ke liye *"Edit ${idx + 1}: ..."* bhejein).`,
      };
    }
  }

  return { handled: false };
}
