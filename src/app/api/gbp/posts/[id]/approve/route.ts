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

    const existing = await db.gbpPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return err("GBP Post not found", 404);
    }

    const updated = await db.gbpPost.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    return ok({
      message: "GBP Post approved successfully by merchant",
      post: updated,
    });
  } catch (error: any) {
    console.error("[GBP Post Approve POST Error]:", error);
    return err("Failed to approve GBP post", 500, { details: error.message });
  }
}
