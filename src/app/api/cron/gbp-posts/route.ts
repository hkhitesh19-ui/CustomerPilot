import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import {
  generateWeeklyPostsForMerchant,
  publishGbpPostToGoogle,
} from "@/lib/gbp-post-generator";
import { dispatchWeeklyPostsWhatsAppApproval } from "@/lib/gbp/whatsapp-post-approval";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Automated RankLocal AI Weekly 4-Post Generator + Scheduled Auto-Publisher Cron
 *
 * Modes:
 * - ?mode=generate  -> Generates 4 posts (Tue/Thu/Sat/Sun) + sends WhatsApp Approval Menu to Merchant
 * - ?mode=publish   -> Publishes all APPROVED posts whose scheduledDate <= now directly to Google Maps API
 * - ?mode=all       -> Runs publish + (on Mondays or ?forceGenerate=true) runs generate + WhatsApp dispatch
 */
async function executeGbpPostsCron(options: {
  mode: "generate" | "publish" | "all";
  targetMerchantId?: string | null;
  forceGenerate?: boolean;
  sendWhatsApp?: boolean;
}) {
  const { mode, targetMerchantId, forceGenerate = false, sendWhatsApp = true } = options;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const isMondayIST = istNow.getUTCDay() === 1;

  const merchantWhere: any = targetMerchantId
    ? { id: targetMerchantId }
    : {
        status: "active",
        OR: [
          { gbpServiceTrack: { in: ["TRACK_A_NEW", "TRACK_B_EXISTING"] } },
          { id: { in: ["cmtymavfx0002kx008lbfvp57", "customerpilot-hq"] } },
        ],
      };

  const merchants = await db.merchant.findMany({
    where: merchantWhere,
    select: { id: true, name: true, whatsappPhone: true },
  });

  // ── PHASE 1: GENERATE 4 WEEKLY POSTS + WHATSAPP APPROVAL DISPATCH ──
  const shouldGenerate = mode === "generate" || (mode === "all" && (isMondayIST || forceGenerate));
  let totalGenerated = 0;
  let whatsappApprovalsSent = 0;
  const generationSummary: Array<{
    merchantId: string;
    merchantName: string;
    postsCount: number;
    whatsappSent: boolean;
    error?: string;
  }> = [];

  if (shouldGenerate) {
    for (const merchant of merchants) {
      try {
        const posts = await generateWeeklyPostsForMerchant(merchant.id);
        totalGenerated += posts.length;

        let waSent = false;
        let waErr: string | undefined;
        if (sendWhatsApp) {
          const waRes = await dispatchWeeklyPostsWhatsAppApproval(merchant.id);
          waSent = waRes.sent;
          waErr = waRes.error;
          if (waSent) whatsappApprovalsSent++;
        }

        generationSummary.push({
          merchantId: merchant.id,
          merchantName: merchant.name,
          postsCount: posts.length,
          whatsappSent: waSent,
          ...(waErr ? { error: waErr } : {}),
        });
      } catch (e: any) {
        console.warn(`[Cron GBP Posts] Generation failed for ${merchant.id} (${merchant.name}):`, e.message);
        generationSummary.push({
          merchantId: merchant.id,
          merchantName: merchant.name,
          postsCount: 0,
          whatsappSent: false,
          error: e.message,
        });
      }
    }
  }

  // ── PHASE 2: AUTO-PUBLISH DUE APPROVED POSTS TO LIVE GOOGLE BUSINESS PROFILE API ──
  const shouldPublish = mode === "publish" || mode === "all";
  let totalPublished = 0;
  let totalPublishFailed = 0;
  const publishSummary: Array<{
    postId: string;
    merchantId: string;
    title: string | null;
    success: boolean;
    gbpPostId?: string;
    searchUrl?: string;
    error?: string;
  }> = [];

  if (shouldPublish) {
    const duePosts = await db.gbpPost.findMany({
      where: {
        status: "APPROVED",
        gbpPostId: null,
        scheduledDate: { lte: now },
        ...(targetMerchantId ? { merchantId: targetMerchantId } : {}),
      },
      orderBy: { scheduledDate: "asc" },
      take: 10, // Process safely per tick
      include: {
        merchant: {
          select: { id: true, name: true, whatsappPhone: true },
        },
      },
    });

    for (const post of duePosts) {
      const pubRes = await publishGbpPostToGoogle(post.id);
      if (pubRes.success) {
        totalPublished++;
        // Notify merchant on WhatsApp with live Google Maps link
        if (sendWhatsApp && post.merchant?.whatsappPhone) {
          const cleanName = post.merchant.name.split(/[-–:|]/)[0].trim();
          const liveNote = pubRes.searchUrl ? `\n🔗 Live Link: ${pubRes.searchUrl}` : "";
          await sendCentralWhatsAppMessage({
            merchantId: post.merchantId,
            toPhone: post.merchant.whatsappPhone.replace(/\D/g, ""),
            text: `🎉 *RankLocal AI AutoPilot*: Aapka Google Post *"${post.title || post.postType}"* *${cleanName}* ke Google Maps profile par LIVE publish ho chuka hai!${liveNote}`,
            template: "gbp_post_published_alert",
          }).catch(() => {});
        }
      } else {
        totalPublishFailed++;
      }

      publishSummary.push({
        postId: post.id,
        merchantId: post.merchantId,
        title: post.title,
        success: pubRes.success,
        gbpPostId: pubRes.gbpPostId,
        searchUrl: pubRes.searchUrl,
        error: pubRes.error,
      });
    }
  }

  return {
    mode,
    isMondayIST,
    merchantsCount: merchants.length,
    totalGenerated,
    whatsappApprovalsSent,
    totalPublished,
    totalPublishFailed,
    generationSummary,
    publishSummary,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawMode = (searchParams.get("mode") || "all").toLowerCase();
    const mode: "generate" | "publish" | "all" =
      rawMode === "generate" || rawMode === "publish" ? rawMode : "all";
    const targetMerchantId = searchParams.get("merchantId");
    const forceGenerate = searchParams.get("forceGenerate") === "true";
    const sendWhatsApp = searchParams.get("sendWhatsApp") !== "false";

    const result = await executeGbpPostsCron({
      mode,
      targetMerchantId,
      forceGenerate,
      sendWhatsApp,
    });

    return ok({
      message: `RankLocal AI GBP Posts Cron (${mode}) completed: ${result.totalGenerated} generated (${result.whatsappApprovalsSent} WhatsApp approvals sent), ${result.totalPublished} published live to Google Maps.`,
      result,
    });
  } catch (error: any) {
    console.error("[Cron GBP Posts Error]:", error);
    return err("Failed to execute Weekly GBP Posts Cron", 500, { details: error.message });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
