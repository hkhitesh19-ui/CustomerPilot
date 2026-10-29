import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { generateWeeklyPostsForMerchant } from "@/lib/gbp-post-generator";

async function executeWeeklyGbpPostsCron() {
  // Find all active merchants on a GBP Track (or all active merchants)
  const merchants = await db.merchant.findMany({
    where: {
      status: "active",
      OR: [
        { gbpServiceTrack: { not: null } },
        { gbpProfileStatus: { not: null } },
        { plan: { not: "inactive" } }
      ]
    },
    select: { id: true, name: true }
  });

  let totalGenerated = 0;
  const summary: Array<{ merchantId: string; merchantName: string; postsCount: number; error?: string }> = [];

  for (const merchant of merchants) {
    try {
      const posts = await generateWeeklyPostsForMerchant(merchant.id);
      totalGenerated += posts.length;
      summary.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        postsCount: posts.length,
      });
    } catch (e: any) {
      console.warn(`[Cron GBP Posts] Generation failed for merchant ${merchant.id} (${merchant.name}):`, e.message);
      summary.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        postsCount: 0,
        error: e.message,
      });
    }
  }

  return {
    merchantsCount: merchants.length,
    totalGenerated,
    summary,
  };
}

export async function GET(req: NextRequest) {
  try {
    const result = await executeWeeklyGbpPostsCron();
    return ok({
      message: `Automated Weekly GBP Posts Cron completed. Generated ${result.totalGenerated} posts across ${result.merchantsCount} merchants.`,
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
