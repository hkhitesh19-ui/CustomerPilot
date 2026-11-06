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
    const isCakeMerchant =
      post.merchant?.name?.toLowerCase().includes("cake") ||
      post.merchantId === "cmtymavfx0002kx008lbfvp57";

    let newImageUrl = post.imageUrl;
    let styleName = "theme";

    if (isCakeMerchant) {
      const cakeVariants: Record<string, { url: string; label: string }[]> = {
        PRODUCT_SPOTLIGHT: [
          { url: "/gbp/posts/cake_connection_belgian_truffle_banner.jpg", label: "Branded Marketing Poster" },
          { url: "/gbp/posts/cake_connection_belgian_truffle.jpg", label: "Pure Bakery Photography" },
          { url: "/api/gbp/posts/card?type=product&name=Belgian%20Chocolate%20Truffle&store=Cake%20Connection&price=%E2%82%B9650%2F-%20for%20500g&theme=gold", label: "Luxury Gold Card" },
          { url: "/api/gbp/posts/card?type=product&name=Belgian%20Chocolate%20Truffle&store=Cake%20Connection&price=%E2%82%B9650%2F-%20for%20500g&theme=emerald", label: "Emerald Chef Spotlight" },
        ],
        SOCIAL_PROOF: [
          { url: "/gbp/posts/cake_connection_birthday_review_banner.jpg", label: "5-Star Testimonial Poster" },
          { url: "/gbp/posts/cake_connection_birthday_review.jpg", label: "Festive Birthday Celebration Cake" },
          { url: "/api/gbp/posts/card?type=review&store=Cake%20Connection&author=Sneha%20Patel&theme=indigo", label: "Indigo Review Card" },
          { url: "/api/gbp/posts/card?type=review&store=Cake%20Connection&author=Sneha%20Patel&theme=gold", label: "Gold Review Card" },
        ],
        WEEKEND_OFFER: [
          { url: "/gbp/posts/cake_connection_weekend_vip_offer_banner.jpg", label: "Weekend VIP Coupon Poster" },
          { url: "/gbp/posts/cake_connection_weekend_vip_offer.jpg", label: "Gourmet Brownies & Cake Platter" },
          { url: "/api/gbp/posts/card?type=offer&code=CAKEVIP10&store=Cake%20Connection&theme=sunset", label: "Sunset Flash Deal Card" },
          { url: "/api/gbp/posts/card?type=offer&code=CAKEVIP10&store=Cake%20Connection&theme=emerald", label: "Emerald VIP Card" },
        ],
      };

      const variants = cakeVariants[post.postType] || cakeVariants.PRODUCT_SPOTLIGHT;
      const chosen = variants[nextRev % variants.length];
      const sep = chosen.url.includes("?") ? "&" : "?";
      newImageUrl = `${chosen.url}${sep}v=${Date.now()}`;
      styleName = chosen.label;
    } else {
      const nextTheme = THEMES[nextRev % THEMES.length];
      styleName = nextTheme;
      try {
        const baseUrlParts = post.imageUrl.split("?");
        const base = baseUrlParts[0];
        const params = new URLSearchParams(baseUrlParts[1] || "");
        params.set("theme", nextTheme);
        params.set("v", String(Date.now()));
        newImageUrl = `${base}?${params.toString()}`;
      } catch {
        newImageUrl = `${post.imageUrl}&theme=${nextTheme}&v=${Date.now()}`;
      }
    }

    const updated = await db.gbpPost.update({
      where: { id },
      data: {
        imageUrl: newImageUrl,
        revisionCount: nextRev,
      },
    });

    return ok({
      message: `Image regenerated successfully with ${styleName} styling`,
      post: updated,
      style: styleName,
      imageUrl: updated.imageUrl,
    });
  } catch (error: any) {
    console.error("[Regenerate Image Error]:", error);
    return err("Failed to regenerate image card", 500, { details: error.message });
  }
}
