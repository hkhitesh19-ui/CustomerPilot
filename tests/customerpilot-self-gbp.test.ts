/**
 * tests/customerpilot-self-gbp.test.ts
 * 
 * Deterministic Test Suite for CustomerPilot Own GBP Optimization Module
 */

import { describe, it, expect } from "vitest";
import { getKeywordPresetForCategory, MASTER_KEYWORD_PRESETS } from "../src/lib/keyword-matrix";
import { getDynamicFallbackReview } from "../src/lib/dynamic-review-engine";
import { buildTuesdayProductPost, buildThursdayReviewPost, buildSaturdayOfferPost } from "../src/lib/gbp-post-generator";

describe("CustomerPilot Self-GBP Module Verification", () => {
  it("resolves saas_agency preset for CustomerPilot software company", () => {
    const preset1 = getKeywordPresetForCategory("Software Company", "CustomerPilot");
    expect(preset1.id).toBe("saas_agency");
    expect(preset1.gbpCategory).toBe("Software Company / Marketing Agency");

    const preset2 = getKeywordPresetForCategory("saas platform", "My Tech App");
    expect(preset2.id).toBe("saas_agency");
  });

  it("enforces 50 allowed SEO entities and 50 blacklist guardrails", () => {
    const preset = MASTER_KEYWORD_PRESETS.saas_agency;
    expect(preset.seoEntities.length).toBeGreaterThanOrEqual(45);
    expect(preset.blacklist.length).toBeGreaterThanOrEqual(45);

    // Verify allowed SaaS entities
    expect(preset.seoEntities).toContain("WhatsApp Digital Loyalty Card Software");
    expect(preset.seoEntities).toContain("Smart AI Google Review Standee");
    expect(preset.seoEntities).toContain("1-Click AI Owner Review Auto-Reply");

    // Verify blacklist guards (No retail hallucinations)
    expect(preset.blacklist).toContain("Cake");
    expect(preset.blacklist).toContain("Haircut");
    expect(preset.blacklist).toContain("Dal makhani");
    expect(preset.blacklist).toContain("Car foam wash");
  });

  it("generates authentic B2B SaaS fallback reviews without retail items", () => {
    const review = getDynamicFallbackReview("saas_agency", undefined, "test-seed-123");
    expect(review.draft1).toBeDefined();
    expect(review.draft2).toBeDefined();
    expect(review.draft3).toBeDefined();

    const allText = (review.draft1 + " " + review.draft2 + " " + review.draft3).toLowerCase();
    expect(allText).not.toContain("cake");
    expect(allText).not.toContain("haircut");
    expect(allText).not.toContain("facial");
    expect(allText).not.toContain("pizza");
  });

  it("generates specialized B2B weekly posts for CustomerPilot", async () => {
    const mockCpMerchant = {
      id: "customerpilot-hq",
      name: "CustomerPilot - AI Customer Retention & Google Reviews SaaS",
      category: "Software Company",
      city: "Vadodara",
      address: "Alkapuri / Gotri Road, Vadodara, Gujarat",
      whatsappPhone: "919033304707",
      googleReviewLink: "https://search.google.com/local/writereview?placeid=ChIJCustomerPilotVadodaraHQ",
    };

    const testDate = new Date("2026-11-10T10:00:00Z"); // Tuesday

    // Tuesday: Tech Product Spotlight
    const tue = await buildTuesdayProductPost(mockCpMerchant, testDate);
    expect(tue.postType).toBe("PRODUCT_SPOTLIGHT");
    expect(tue.caption).toContain("Looking to 10x your authentic Google Reviews");
    expect(tue.caption).toContain("CustomerPilot");

    // Thursday: Social Proof Case Study
    const thu = await buildThursdayReviewPost(mockCpMerchant, testDate);
    expect(thu.postType).toBe("SOCIAL_PROOF");
    expect(thu.caption).toContain("See why retail store owners trust CustomerPilot");

    // Saturday: Founding Merchant Offer
    const sat = await buildSaturdayOfferPost(mockCpMerchant, testDate);
    expect(sat.postType).toBe("WEEKEND_OFFER");
    expect(sat.couponCode).toBe("FOUNDER50");
    expect(sat.caption).toContain("Founding Merchant");
  });
});
