import assert from "assert";
import {
  calculateRevenueLeak,
  getClickShareByRank,
  calculateCompetitorSpyScore,
} from "../src/lib/auditCalculator";
import {
  verifyGoogleReviewScreenshot,
  deterministicVerifyReviewScreenshot,
} from "../src/lib/geminiReviewVerifier";
import { generateMerchantGeoAeoSchema } from "../src/components/seo/schema-injector";

async function main() {
  console.log("============================================================");
  console.log("🛡️ RANKPILOT AI™ MASTER PLAYBOOK COMPREHENSIVE VERIFICATION");
  console.log("============================================================\n");

  let passed = 0;

  // 1. Revenue Leak Mathematical Engine
  console.log("--- 1. Revenue Leak Mathematical Engine (Playbook Page 7) ---");
  const leak18 = calculateRevenueLeak({
    monthlySearchVolume: 2500,
    currentGridRankAvg: 18,
    conversionRate: 0.20,
    averageOrderValueINR: 500,
  });

  assert.strictEqual(leak18.top3ClickShare, 0.160);
  assert.strictEqual(leak18.currentClickShare, 0.012);
  assert.strictEqual(leak18.top3PotentialActionsMonthly, 400);
  assert.strictEqual(leak18.currentActionsMonthly, 30);
  assert.strictEqual(leak18.missedActionsMonthly, 370);
  assert.strictEqual(leak18.lostOrdersMonthly, 74);
  assert.strictEqual(leak18.monthlyRevenueLeakINR, 37000);
  assert.strictEqual(leak18.annualRevenueLeakINR, 444000);
  console.log("✅ [PASS] Textbook Revenue Leak Formula Verified: ₹37,000/mo, ₹4,44,000/yr (74 lost orders)");
  passed++;

  assert.strictEqual(getClickShareByRank(1), 0.240);
  assert.strictEqual(getClickShareByRank(2), 0.150);
  assert.strictEqual(getClickShareByRank(3), 0.100);
  assert.strictEqual(getClickShareByRank(8), 0.030);
  assert.strictEqual(getClickShareByRank(16), 0.012);
  assert.strictEqual(getClickShareByRank(28), 0.004);
  console.log("✅ [PASS] Click Share by Rank Tiers Strictly Verified (24%, 15%, 10%, 3%, 1.2%, 0.4%)");
  passed++;

  const leak1 = calculateRevenueLeak({
    monthlySearchVolume: 2500,
    currentGridRankAvg: 1,
    conversionRate: 0.20,
    averageOrderValueINR: 500,
  });
  assert.strictEqual(leak1.monthlyRevenueLeakINR, 0);
  assert.strictEqual(leak1.annualRevenueLeakINR, 0);
  assert.strictEqual(leak1.lostOrdersMonthly, 0);
  console.log("✅ [PASS] Rank #1 Zero Revenue Leak Verified");
  passed++;

  // 2. 100-Point Competitor Spy Scoring Engine
  console.log("\n--- 2. 100-Point Competitor Spy Scoring Engine (Playbook Page 7) ---");
  const spyScore = calculateCompetitorSpyScore({
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

  assert.strictEqual(spyScore.categoryAlignmentScore, 18);
  assert.strictEqual(spyScore.reviewVolumeAndVelocityScore, 5);
  assert.strictEqual(spyScore.keywordDensityScore, 3);
  assert.strictEqual(spyScore.websiteSchemaAeoScore, 0);
  assert.strictEqual(spyScore.visualEngagementScore, 2);
  assert.strictEqual(spyScore.totalScore, 28);
  assert.strictEqual(spyScore.grade, "CRITICAL_VISIBILITY_LEAK");
  console.log("✅ [PASS] 100-Point Competitor Spy Score Matches Page 7 Textbook Example: 28/100");
  passed++;

  // 3. Fraud-Proof Review Screenshot Verifier
  console.log("\n--- 3. Fraud-Proof Review Screenshot Verifier (Playbook Section 5) ---");
  const draftRes = await verifyGoogleReviewScreenshot({
    imageBase64: "data:image/jpeg;base64,MOCK_DRAFT_POST_BUTTON",
    expectedBusinessName: "Cake Connection",
    expectedLocality: "Manjalpur, Vadodara",
    targetKeywords: ["Belgian Truffle", "Cake"],
  });
  assert.strictEqual(draftRes.isDraftOrEditScreen, true);
  assert.strictEqual(draftRes.isPublishedState, false);
  console.log("✅ [PASS] Fraud Scheme 1 (Draft Screen Scam with 'Post' button) Blocked");
  passed++;

  const wrongShopRes = await verifyGoogleReviewScreenshot({
    imageBase64: "data:image/jpeg;base64,MOCK_WRONG_SHOP",
    expectedBusinessName: "Cake Connection",
    expectedLocality: "Manjalpur, Vadodara",
    targetKeywords: ["Belgian Truffle"],
  });
  assert.strictEqual(wrongShopRes.businessNameMatchesMerchant, false);
  console.log("✅ [PASS] Fraud Scheme 2 (Wrong Shop Scam) Blocked");
  passed++;

  const legitRes = await verifyGoogleReviewScreenshot({
    imageBase64: "data:image/jpeg;base64,LEGIT_LIVE_REVIEW_PHOTO",
    expectedBusinessName: "Cake Connection",
    expectedLocality: "Manjalpur, Vadodara",
    targetKeywords: ["Cake Connection", "Vadodara"],
  });
  assert.strictEqual(legitRes.isPublishedState, true);
  assert.strictEqual(legitRes.isDraftOrEditScreen, false);
  assert.strictEqual(legitRes.businessNameMatchesMerchant, true);
  assert.strictEqual(legitRes.starRating, 5);
  console.log("✅ [PASS] Legitimate Published Google Review Approved (+1 Stamp Eligible)");
  passed++;

  // 4. Next.js SSR Triple Schema Generator
  console.log("\n--- 4. Next.js SSR Triple Schema Generator (Playbook Section 4.2) ---");
  const schema = generateMerchantGeoAeoSchema({
    businessName: "Cake Connection",
    slug: "cake-connection-manjalpur",
    city: "Vadodara",
    locality: "Manjalpur",
    primaryCategory: "Cake Shop / Bakery",
    phone: "+917203824012",
    nearbyLandmarks: ["Eva The Mall", "Bird Circle", "Makarpura"],
    services: [
      { name: "Fresh Belgian Truffle Cake", keywordRichDescription: "100% pure eggless truffle", price: 650 },
      { name: "Designer Birthday Cake", keywordRichDescription: "Custom celebration cake", price: 1250 },
    ]
  });

  assert.strictEqual(schema["@context"], "https://schema.org");
  assert(Array.isArray(schema["@graph"]));
  assert.strictEqual(schema["@graph"].length, 2);

  const localBiz: any = schema["@graph"].find((e: any) => e["@type"] === "LocalBusiness");
  assert(localBiz);
  assert.strictEqual(localBiz.name, "Cake Connection");
  assert.strictEqual(localBiz.telephone, "+917203824012");
  assert.strictEqual(localBiz.geo["@type"], "GeoCoordinates");
  assert.strictEqual(localBiz.areaServed.length, 3);
  assert.strictEqual(localBiz.hasOfferCatalog.itemListElement.length, 2);
  assert.strictEqual(localBiz.hasOfferCatalog.itemListElement[0].price, 650);

  const faqPage: any = schema["@graph"].find((e: any) => e["@type"] === "FAQPage");
  assert(faqPage);
  assert(faqPage.mainEntity.length >= 4);
  assert.strictEqual(faqPage.mainEntity[0]["@type"], "Question");
  console.log("✅ [PASS] Triple Schema Injected: LocalBusiness (Geo + Landmarks + Citations) + FAQPage + OfferCatalog");
  passed++;

  console.log("\n============================================================");
  console.log(`🎉 ALL ${passed} VERIFICATION SUITES 100% PASSED`);
  console.log("============================================================\n");
}

main().catch(err => {
  console.error("❌ Test crashed:", err);
  process.exit(1);
});
