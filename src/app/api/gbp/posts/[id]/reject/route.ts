import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { regenerateSinglePost } from "@/lib/gbp-post-generator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return err("Post ID is required", 400);

    const body = await req.json().catch(() => ({}));
    const feedback = body.feedback || "Merchant requested alternative option";

    const existing = await db.gbpPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return err("GBP Post not found", 404);
    }

    const regeneratedPost = await regenerateSinglePost(id, feedback);

    return ok({
      message: "Post rejected and fresh alternative successfully generated",
      post: regeneratedPost,
    });
  } catch (error: any) {
    console.error("[GBP Post Reject & Regenerate POST Error]:", error);
    return err("Failed to reject and regenerate post", 500, { details: error.message });
  }
}
