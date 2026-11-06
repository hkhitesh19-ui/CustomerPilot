import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";

const THEMES = ["emerald", "indigo", "gold", "sunset", "cyan", "default"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return err("Post ID is required", 400);

    const post = await db.gbpPost.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!post) {
      return err("GBP Post not found", 404);
    }

    const currentRev = post.revisionCount || 0;
    const nextRev = currentRev + 1;
    const nextTheme = THEMES[nextRev % THEMES.length];

    // Parse existing image URL and update theme and cachebuster
    let newImageUrl = post.imageUrl;
    try {
      // If it's a relative or absolute URL with query params
      const baseUrlParts = post.imageUrl.split("?");
      const base = baseUrlParts[0];
      const params = new URLSearchParams(baseUrlParts[1] || "");
      params.set("theme", nextTheme);
      params.set("v", String(Date.now()));
      newImageUrl = `${base}?${params.toString()}`;
    } catch {
      newImageUrl = `${post.imageUrl}&theme=${nextTheme}&v=${Date.now()}`;
    }

    const updated = await db.gbpPost.update({
      where: { id },
      data: {
        imageUrl: newImageUrl,
        revisionCount: nextRev,
      },
    });

    return ok({
      message: `Image regenerated successfully with ${nextTheme} styling`,
      post: updated,
      theme: nextTheme,
      imageUrl: updated.imageUrl,
    });
  } catch (error: any) {
    console.error("[Regenerate Image Error]:", error);
    return err("Failed to regenerate image card", 500, { details: error.message });
  }
}
