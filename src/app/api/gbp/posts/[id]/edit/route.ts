import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return err("Post ID is required", 400);

    const body = await req.json().catch(() => null);
    if (!body) return err("Request body is required", 400);

    const existing = await db.gbpPost.findUnique({
      where: { id },
    });

    if (!existing) {
      return err("GBP Post not found", 404);
    }

    const { title, caption, ctaType, ctaUrl, couponCode, imageUrl } = body;

    const updated = await db.gbpPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(caption !== undefined && { caption }),
        ...(ctaType !== undefined && { ctaType }),
        ...(ctaUrl !== undefined && { ctaUrl }),
        ...(couponCode !== undefined && { couponCode }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return ok({
      message: "GBP Post updated successfully",
      post: updated,
    });
  } catch (error: any) {
    console.error("[GBP Post Edit PATCH Error]:", error);
    return err("Failed to edit GBP post", 500, { details: error.message });
  }
}
