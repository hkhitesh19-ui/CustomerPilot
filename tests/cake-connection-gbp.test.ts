/**
 * tests/cake-connection-gbp.test.ts
 * 
 * Verifies Cake Connection GBP Optimization Suite:
 * 1. Database Track B settings & Place ID connection
 * 2. Keyword matrix resolution for bakery preset
 * 3. Dynamic review generation
 * 4. Weekly 3-post schedule and schema integrity
 */

import { describe, it, expect, afterAll } from "vitest";
import path from "path";
import { getKeywordPresetForCategory } from "../src/lib/keyword-matrix";
import { getDynamicFallbackReview } from "../src/lib/dynamic-review-engine";
import { buildTuesdayProductPost, buildThursdayReviewPost, buildSaturdayOfferPost } from "../src/lib/gbp-post-generator";
import { PrismaClient } from "@prisma/client";

const absoluteDbPath = path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${absoluteDbPath}`,
    },
  },
});

describe("Cake Connection GBP Optimization Suite", () => {
  const merchantId = "cmtymavfx0002kx008lbfvp57";

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("1. Merchant is configured with Track B Accelerator and Google Connection", async () => {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { merchantGoogleConnections: true, gbpChecklistItems: true, gbpPosts: true },
    });

    expect(merchant).toBeDefined();
    expect(merchant?.category).toBe("bakery");
    expect(merchant?.gbpServiceTrack).toBe("TRACK_B_EXISTING");
    expect(merchant?.gbpProfileStatus).toBe("VERIFIED");
    expect(merchant?.whatsappPhone).toBe("917203824012");
    expect(merchant?.merchantGoogleConnections?.placeId).toBe("ChIJCakeConnectionVadodaraEva");
    expect(merchant?.gbpChecklistItems.length).toBe(16);
    expect(merchant?.gbpPosts.length).toBeGreaterThanOrEqual(3);
  });

  it("2. Keyword matrix resolves bakery preset with entities, AEO answers & strict blacklist", () => {
    const preset = getKeywordPresetForCategory("bakery");
    expect(preset).toBeDefined();
    expect(preset.id).toBe("bakery");
    expect(preset.seoEntities.length).toBeGreaterThanOrEqual(40);
    expect(preset.seoEntities).toContain("Chocolate truffle cake");
    expect(preset.seoEntities).toContain("100% pure eggless cake");
    expect(preset.aeoAnswers.length).toBeGreaterThanOrEqual(5);
    expect(preset.blacklist).toContain("White bread");
    expect(preset.blacklist).toContain("Samosa");
    expect(preset.blacklist).toContain("Haircut");
  });

  it("3. Dynamic review engine generates authentic bakery reviews for Cake Connection", () => {
    const drafts = getDynamicFallbackReview("bakery", "Belgian Chocolate Truffle Cake");

    expect(drafts).toBeDefined();
    expect(drafts.draft1.length).toBeGreaterThan(20);
    expect(drafts.draft2.length).toBeGreaterThan(20);
    expect(drafts.draft3.length).toBeGreaterThan(15);
    const combined = `${drafts.draft1} ${drafts.draft2} ${drafts.draft3}`.toLowerCase();
    expect(combined).toMatch(/cake|truffle|fruit|pastry|eggless|sweetness/);
  });

  it("4. Weekly 3-Post generator creates valid Tuesday, Thursday, Saturday posts for Cake Connection", async () => {
    const mockMerchant = {
      id: merchantId,
      name: "Cake Connection",
      category: "bakery",
      city: "Vadodara",
      address: "Shop No. 7, Eva The Mall, Manjalpur, Vadodara",
      whatsappPhone: "917203824012",
    };

    const baseDate = new Date();
    const tue = await buildTuesdayProductPost(mockMerchant, baseDate);
    expect(tue.postType).toBe("PRODUCT_SPOTLIGHT");
    expect(tue.ctaType).toBe("ORDER");
    expect(tue.ctaUrl).toContain("wa.me/917203824012");
    expect(tue.caption).toContain("Cake Connection");

    const thu = await buildThursdayReviewPost(mockMerchant, baseDate);
    expect(thu.postType).toBe("SOCIAL_PROOF");
    expect(thu.ctaType).toBe("LEARN_MORE");
    expect(thu.imageUrl).toContain("card?type=review");

    const sat = await buildSaturdayOfferPost(mockMerchant, baseDate);
    expect(sat.postType).toBe("WEEKEND_OFFER");
    expect(sat.ctaType).toBe("OFFER");
    expect(sat.couponCode).toBeDefined();
    expect(sat.imageUrl).toContain("card?type=offer");
  });
});
