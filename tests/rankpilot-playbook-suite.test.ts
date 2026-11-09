import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  calculateRevenueLeak,
  getClickShareByRank,
  calculateCompetitorSpyScore,
} from "../src/lib/auditCalculator";
import {
  deterministicVerifyReviewScreenshot,
  verifyGoogleReviewScreenshot,
} from "../src/lib/geminiReviewVerifier";
import { generateMerchantGeoAeoSchema } from "../src/components/seo/schema-injector";

describe("RankPilot AI™ & GBP Top-3 Master Playbook Suite", () => {

  // =========================================================================
  // 1. MATHEMATICAL REVENUE LEAK TESTS (Playbook Section 3.2 & 3.5)
  // =========================================================================
  describe("1. Revenue Leak Mathematical Engine (Playbook Page 7 Verification Pass)", () => {
    it("matches exact textbook formula: V=2500, rank=18, Cconv=0.20, AOV=500 INR", () => {
      const output = calculateRevenueLeak({
        monthlySearchVolume: 2500,
        currentGridRankAvg: 18,
        conversionRate: 0.20,
        averageOrderValueINR: 500,
      });

      // Assert textbook numbers from Page 7
      expect(output.top3ClickShare).toBe(0.160);
      expect(output.currentClickShare).toBe(0.012);
      expect(output.top3PotentialActionsMonthly).toBe(400); // 2500 * 0.160
      expect(output.currentActionsMonthly).toBe(30);         // 2500 * 0.012
      expect(output.missedActionsMonthly).toBe(370);         // 400 - 30
      expect(output.lostOrdersMonthly).toBe(74);            // 370 * 0.20
      expect(output.monthlyRevenueLeakINR).toBe(37000);      // 74 * 500
      expect(output.annualRevenueLeakINR).toBe(444000);      // 37000 * 12
    });

    it("verifies click share benchmarks by rank tiers", () => {
      expect(getClickShareByRank(1)).toBe(0.240);  // 24%
      expect(getClickShareByRank(2)).toBe(0.150);  // 15%
      expect(getClickShareByRank(3)).toBe(0.100);  // 10%
      expect(getClickShareByRank(7)).toBe(0.030);  // 3% (Rank 4-10)
      expect(getClickShareByRank(15)).toBe(0.012); // 1.2% (Rank 11-20)
      expect(getClickShareByRank(28)).toBe(0.004); // 0.4% (Rank > 20)
    });

    it("evaluates rank 1 listing with 0 revenue leak", () => {
      const output = calculateRevenueLeak({
        monthlySearchVolume: 2000,
        currentGridRankAvg: 1,
        conversionRate: 0.20,
        averageOrderValueINR: 650,
      });

      expect(output.currentClickShare).toBe(0.240);
      expect(output.missedActionsMonthly).toBe(0);
      expect(output.lostOrdersMonthly).toBe(0);
      expect(output.monthlyRevenueLeakINR).toBe(0);
      expect(output.annualRevenueLeakINR).toBe(0);
    });
  });

  // =========================================================================
  // 2. 100-POINT COMPETITOR SPY SCORING ENGINE (Playbook Section 3.3)
  // =========================================================================
  describe("2. 100-Point Competitor Spy Scoring Engine", () => {
    it("reproduces verified textbook score: 28/100 (CRITICAL_VISIBILITY_LEAK)", () => {
      const result = calculateCompetitorSpyScore({
        primaryCategoryMatchesTop1: true,
        merchantSecondaryCategoryCount: 1,
        top3AvgSecondaryCategoryCount: 4,

        merchantTotalReviews: 60,
        top3AvgTotalReviews: 300,
        merchantReviewsLast30Days: 3,
        top3AvgReviewsLast30Days: 20,

        merchantKeywordMentionsInSample: 2,
        top3AvgKeywordMentionsInSample: 16,

        hasDedicatedWebsite: false,
        hasLocalBusinessSchema: false,
        hasFaqSchemaAndH1Locality: false,

        merchantPhotoCount: 20,
        top3AvgPhotoCount: 100,
        ownerReviewReplyRate: 0.20,
      });

      expect(result.categoryAlignmentScore).toBe(18);        // 15 + round(1/4 * 10) = 18/25
      expect(result.reviewVolumeAndVelocityScore).toBe(5);    // 2 + 3 = 5/30
      expect(result.keywordDensityScore).toBe(3);             // round(2/16 * 20) = 3/20
      expect(result.websiteSchemaAeoScore).toBe(0);           // 0/15
      expect(result.visualEngagementScore).toBe(2);           // 1 + 1 = 2/10
      expect(result.totalScore).toBe(28);                     // 18 + 5 + 3 + 0 + 2 = 28/100
      expect(result.grade).toBe("CRITICAL_VISIBILITY_LEAK");
    });
  });

  // =========================================================================
  // 3. FRAUD-PROOF REVIEW SCREENSHOT VERIFIER (Playbook Section 5 & 5.1)
  // =========================================================================
  describe("3. Fraud-Proof Gemini Review Screenshot Verifier", () => {
    it("detects and blocks Draft Screen scam (active 'Post' button visible)", async () => {
      const result = await verifyGoogleReviewScreenshot({
        imageBase64: "data:image/jpeg;base64,MOCK_DRAFT_POST_BUTTON_SAMPLE",
        expectedBusinessName: "Cake Connection",
        expectedLocality: "Manjalpur, Vadodara",
        targetKeywords: ["Belgian Truffle", "Cake", "Vadodara"],
      });

      expect(result.isDraftOrEditScreen).toBe(true);
      expect(result.isPublishedState).toBe(false);
      expect(result.rejectionReasonIfAny).toContain("Post");
    });

    it("detects and blocks Wrong Shop scam (merchant name mismatch)", async () => {
      const result = await verifyGoogleReviewScreenshot({
        imageBase64: "data:image/jpeg;base64,MOCK_WRONG_SHOP_SAMPLE",
        expectedBusinessName: "Cake Connection",
        expectedLocality: "Manjalpur, Vadodara",
        targetKeywords: ["Belgian Truffle", "Cake"],
      });

      expect(result.businessNameMatchesMerchant).toBe(false);
      expect(result.rejectionReasonIfAny).toContain("Cake Connection");
    });

    it("approves legitimate published Google review screenshot", async () => {
      const result = await verifyGoogleReviewScreenshot({
        imageBase64: "data:image/jpeg;base64,LEGIT_PUBLISHED_REVIEW_IMAGE_SAMPLE",
        expectedBusinessName: "Cake Connection",
        expectedLocality: "Manjalpur, Vadodara",
        targetKeywords: ["Cake Connection", "Vadodara"],
      });

      expect(result.isPublishedState).toBe(true);
      expect(result.isDraftOrEditScreen).toBe(false);
      expect(result.businessNameMatchesMerchant).toBe(true);
      expect(result.starRating).toBeGreaterThanOrEqual(4);
      expect(result.rejectionReasonIfAny).toBe("");
    });
  });

  // =========================================================================
  // 4. NEXT.JS SSR TRIPLE SCHEMA GENERATOR (Playbook Section 4.2 & Engine 1)
  // =========================================================================
  describe("4. SSR Micro-Page Triple Schema Generator", () => {
    it("generates a unified @graph with LocalBusiness, FAQPage, and OfferCatalog", () => {
      const schema = generateMerchantGeoAeoSchema({
        businessName: "Cake Connection",
        slug: "cake-connection-manjalpur",
        city: "Vadodara",
        locality: "Manjalpur",
        primaryCategory: "Bakery & Cake Shop",
        phone: "+917203824012",
        nearbyLandmarks: ["Eva The Mall", "Bird Circle", "Makarpura"],
        services: [
          { name: "Fresh Belgian Truffle Cake", keywordRichDescription: "100% pure eggless truffle", price: 650 },
          { name: "Designer Birthday Cake", keywordRichDescription: "Custom celebration cake", price: 1200 }
        ]
      });

      expect(schema["@context"]).toBe("https://schema.org");
      expect(Array.isArray(schema["@graph"])).toBe(true);
      expect(schema["@graph"].length).toBe(2);

      // LocalBusiness Entity
      const localBiz = schema["@graph"].find(e => e["@type"] === "LocalBusiness");
      expect(localBiz).toBeDefined();
      expect(localBiz.name).toBe("Cake Connection");
      expect(localBiz.telephone).toBe("+917203824012");
      expect(localBiz.geo["@type"]).toBe("GeoCoordinates");
      expect(localBiz.areaServed.length).toBe(3);
      expect(localBiz.hasOfferCatalog["@type"]).toBe("OfferCatalog");
      expect(localBiz.hasOfferCatalog.itemListElement.length).toBe(2);
      expect(localBiz.hasOfferCatalog.itemListElement[0].price).toBe(650);

      // FAQPage Entity
      const faqPage = schema["@graph"].find(e => e["@type"] === "FAQPage");
      expect(faqPage).toBeDefined();
      expect(faqPage.mainEntity.length).toBeGreaterThanOrEqual(4);
      expect(faqPage.mainEntity[0]["@type"]).toBe("Question");
      expect(faqPage.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    });
  });

});
