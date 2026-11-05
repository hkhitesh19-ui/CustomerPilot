import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { publishGbpPostToGoogle } from "@/lib/gbp-post-generator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return err("Post ID is required", 400);

    const existing = await db.gbpPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return err("GBP Post not found", 404);
    }

    await db.gbpPost.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    // Publish to Google Business Profile API (300 QPM Project 391546314644)
    const publishResult = await publishGbpPostToGoogle(id);

    const updated = await db.gbpPost.findUnique({
      where: { id },
    });

    return ok({
      message: publishResult.success
        ? "GBP Post approved and published to Google Maps successfully"
        : "GBP Post approved successfully",
      post: updated,
      gbpPostId: publishResult.gbpPostId,
    });
  } catch (error: any) {
    console.error("[GBP Post Approve POST Error]:", error);
    return err("Failed to approve GBP post", 500, { details: error.message });
  }
}
