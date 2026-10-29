import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return err("Post ID is required", 400);

    const body = await req.json().catch(() => ({}));
    const postedBy = body.postedBy || "OPERATOR";
    const gbpPostId = body.gbpPostId || null;

    const existing = await db.gbpPost.findUnique({
      where: { id }
    });

    if (!existing) {
      return err("GBP Post not found", 404);
    }

    const updated = await db.gbpPost.update({
      where: { id },
      data: {
        status: "POSTED",
        postedAt: new Date(),
        postedBy,
        gbpPostId,
      }
    });

    return ok({
      message: "Post successfully marked as published to Google Business Profile",
      post: updated,
    });
  } catch (error: any) {
    console.error("[GBP Post Mark-Posted Error]:", error);
    return err("Failed to update post status", 500, { details: error.message });
  }
}
