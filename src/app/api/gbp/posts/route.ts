import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { generateWeeklyPostsForMerchant } from "@/lib/gbp-post-generator";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (merchantId) where.merchantId = merchantId;
    if (status) where.status = status;

    const posts = await db.gbpPost.findMany({
      where,
      orderBy: { scheduledDate: "asc" },
      take: limit,
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            category: true,
            city: true,
            gbpServiceTrack: true,
            whatsappPhone: true,
          }
        }
      }
    });

    return ok({ posts });
  } catch (error: any) {
    console.error("[GBP Posts GET Error]:", error);
    return err("Failed to fetch GBP posts", 500, { details: error.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.merchantId) {
      return err("merchantId is required in request body", 400);
    }

    const { merchantId, baseDate } = body;
    const parsedDate = baseDate ? new Date(baseDate) : new Date();

    const generatedPosts = await generateWeeklyPostsForMerchant(merchantId, parsedDate);

    return ok({
      message: `Successfully generated ${generatedPosts.length} weekly Google Business Profile posts`,
      posts: generatedPosts,
    });
  } catch (error: any) {
    console.error("[GBP Posts Generate POST Error]:", error);
    return err("Failed to generate weekly GBP posts", 500, { details: error.message });
  }
}
