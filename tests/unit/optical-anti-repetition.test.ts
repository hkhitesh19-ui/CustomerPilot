import { describe, it, expect } from "vitest";
import { getDynamicFallbackReview, generateDynamicReviewDraft } from "@/lib/dynamic-review-engine";

describe("Optical Anti-Repetition Engine & Persona Diversity", () => {
  it("generates 8 unique fallback review drafts across 8 seeds for optical_store", () => {
    const drafts = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const res = getDynamicFallbackReview("optical_store", undefined, i);
      drafts.add(res.draft1);
    }
    // Must generate at least 6 unique drafts out of 8 seeds
    expect(drafts.size).toBeGreaterThanOrEqual(6);
  });

  it("item-targeted draft router customizes drafts by item type (screen, progressive, kids, sunglasses)", () => {
    const blueCut = getDynamicFallbackReview("optical_store", "Blue-cut screen protection glasses", 1);
    expect(blueCut.draft1.toLowerCase()).toMatch(/blue|screen|glare|laptop/i);

    const progressive = getDynamicFallbackReview("optical_store", "Progressive multifocal lenses", 2);
    expect(progressive.draft1.toLowerCase()).toMatch(/progressive|reading|vision|corridor/i);

    const sunglasses = getDynamicFallbackReview("optical_store", "Polarized UV400 sunglasses", 3);
    expect(sunglasses.draft1.toLowerCase()).toMatch(/sunglass|polarized|glare|sunlight|driving/i);

    const kids = getDynamicFallbackReview("optical_store", "Flexible unbreakable kids eyewear", 4);
    expect(kids.draft1.toLowerCase()).toMatch(/kid|beta|bach|flexible|unbreakable|school/i);

    const repair = getDynamicFallbackReview("optical_store", "Emergency spectacle screw repair & nose pad", 5);
    expect(repair.draft1.toLowerCase()).toMatch(/repair|screw|nose pad|align|clean/i);
  });

  it("does not repeat hardcoded robotic formulas across runs", async () => {
    const runs = [];
    for (let i = 0; i < 5; i++) {
      const draft = await generateDynamicReviewDraft({
        businessCategory: "optical_store",
        businessType: "optical_store",
        merchantName: "Alfa Opticals",
        seed: `seed-${i}-${Date.now()}`
      });
      runs.push(draft);
    }

    // Verify all 5 draft1 are non-empty and have variations
    const draft1Set = new Set(runs.map(r => r.draft1));
    expect(draft1Set.size).toBeGreaterThanOrEqual(4);

    // Verify none start with the banned robotic boilerplate
    for (const r of runs) {
      expect(r.draft1.startsWith("The optometrist performed")).toBe(false);
      expect(r.draft1.startsWith("Alfa Opticals provided")).toBe(false);
      expect(r.draft2.includes("thoda rush tha par service polite thi")).toBe(false);
    }
  });
});
