import { describe, it, expect } from "vitest";
import { 
  getKeywordPresetForCategory, 
  generateAutoKeywordsForLocation, 
  resolveMerchantKeywordProfile
} from "@/lib/keyword-matrix";
import { generateDynamicReviewDraft } from "@/lib/dynamic-review-engine";

describe("Pillar 3: Universal Category Classification & Optical Store Architecture", () => {
  it("correctly identifies optical store from GBP category string", () => {
    const preset = getKeywordPresetForCategory("Optician in Vadodara, Gujarat", "Alfa opticals");
    expect(preset.id).toBe("optical_store");
    expect(preset.label).toContain("Optician");
    expect(preset.seoEntities).toBeDefined();
    expect(preset.seoEntities.length).toBeGreaterThan(10);
  });

  it("correctly identifies optical store from store name alone if category is missing or null", () => {
    const preset = getKeywordPresetForCategory(null, "Alfa Opticals - Manjalpur");
    expect(preset.id).toBe("optical_store");
  });

  it("prevents bakery cross-contamination when merchant was saved with businessType 'bakery' but is an optical store", () => {
    const mockMerchant = {
      id: "cmwknjmr604vqkvv4row826w1",
      name: "Alfa Opticals",
      businessType: "bakery", // Stale default from old NextAuth route
      category: null,
      address: "Manjalpur, Vadodara",
      keywordProfile: null
    };

    const resolved = resolveMerchantKeywordProfile(mockMerchant);
    expect(resolved.categoryKey).toBe("optical_store");
    expect(resolved.heroProducts.some((p: string) => p.toLowerCase().includes("lens") || p.toLowerCase().includes("frame"))).toBe(true);
    expect(resolved.heroProducts.some((p: string) => p.toLowerCase().includes("cake") || p.toLowerCase().includes("pastry"))).toBe(false);
  });

  it("generates authentic optical keywords with zero food/bakery contamination", () => {
    const keywords = generateAutoKeywordsForLocation("optical_store", "Manjalpur", "Alfa Opticals");
    expect(keywords.coreGeo.some(k => k.toLowerCase().includes("optical") || k.toLowerCase().includes("optician"))).toBe(true);
    expect(keywords.services.some(k => k.toLowerCase().includes("eye testing") || k.toLowerCase().includes("lens"))).toBe(true);

    const serialized = JSON.stringify(keywords).toLowerCase();
    expect(serialized).not.toContain("birthday cake");
    expect(serialized).not.toContain("pastry");
    expect(serialized).not.toContain("bakery");
  });

  it("dynamic review engine generates authentic optical reviews without food mentions", async () => {
    const draft = await generateDynamicReviewDraft({
      businessCategory: "Optician",
      businessType: "optical_store",
      merchantName: "Alfa Opticals",
      productName: "Progressive multifocal lenses"
    });

    expect(draft.draft1.length).toBeGreaterThan(20);
    expect(draft.draft2.length).toBeGreaterThan(20);
    expect(draft.draft3.length).toBeGreaterThan(20);

    const fullText = (draft.draft1 + " " + draft.draft2 + " " + draft.draft3).toLowerCase();
    expect(fullText).not.toContain("cake");
    expect(fullText).not.toContain("pastry");
    expect(fullText).not.toContain("delicious");
    expect(fullText).not.toContain("tasty");
  });
});
