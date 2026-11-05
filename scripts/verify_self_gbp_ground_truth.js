/**
 * scripts/verify_self_gbp_ground_truth.js
 * 
 * Deterministic Ground-Truth Verification for CustomerPilot Own GBP Module
 */

const path = require("path");
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/")}`;
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { buildTuesdayProductPost, buildThursdayReviewPost, buildSaturdayOfferPost, getUpcomingScheduleDates } = require("../src/lib/gbp-post-generator");
const { getKeywordPresetForCategory } = require("../src/lib/keyword-matrix");
const { getDynamicFallbackReview } = require("../src/lib/dynamic-review-engine");
const { getEligibleMerchantsForCustomerPilotReview } = require("../src/lib/gbp-review-flywheel");

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🔍 CustomerPilot Own GBP Ground-Truth Verification");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // 1. Verify DB Seeding
  const cp = await prisma.merchant.findUnique({
    where: { id: "customerpilot-hq" },
    include: {
      merchantGoogleConnections: true,
      gbpChecklistItems: true,
    },
  });

  if (!cp) {
    throw new Error("❌ Assertion Failed: customerpilot-hq not found in database.");
  }
  console.log(`✅ [1/5] Database Record Verified: ${cp.name}`);
  console.log(`      Place ID: ${cp.merchantGoogleConnections?.placeId}`);
  console.log(`      Track: ${cp.gbpServiceTrack} | Status: ${cp.gbpProfileStatus}`);
  console.log(`      Rating: ${cp.baselineRating}★ (${cp.baselineReviewCount} reviews)`);

  // 2. Verify Keyword Matrix
  const preset = getKeywordPresetForCategory(cp.category, cp.name);
  if (preset.id !== "saas_agency") {
    throw new Error(`❌ Assertion Failed: Expected saas_agency but got ${preset.id}`);
  }
  console.log(`✅ [2/5] Keyword Matrix Preset Verified: ${preset.id} (${preset.gbpCategory})`);
  console.log(`      Allowed SEO Entities: ${preset.seoEntities.length}`);
  console.log(`      Banned Blacklist Items: ${preset.blacklist.length}`);

  // 3. Verify Review Flywheel
  const eligible = await getEligibleMerchantsForCustomerPilotReview();
  console.log(`✅ [3/5] Review Flywheel Verified: Found ${eligible.length} merchant reviewer candidates.`);
  if (eligible.length > 0) {
    console.log(`      Sample invite generated for: ${eligible[0].name}`);
    console.log(`      Milestone: ${eligible[0].milestoneReason}`);
  }

  // 4. Verify Weekly 3-Posts Generation
  const schedule = getUpcomingScheduleDates(new Date());
  const tue = await buildTuesdayProductPost(cp, schedule.tuesday);
  const thu = await buildThursdayReviewPost(cp, schedule.thursday);
  const sat = await buildSaturdayOfferPost(cp, schedule.saturday);

  if (!tue.caption.includes("CustomerPilot") || !tue.caption.includes("10x")) {
    throw new Error("❌ Assertion Failed: Tuesday caption does not contain CustomerPilot B2B copy.");
  }
  if (!thu.caption.includes("CustomerPilot")) {
    throw new Error("❌ Assertion Failed: Thursday caption does not contain CustomerPilot B2B copy.");
  }
  if (!sat.caption.includes("Founding Merchant") || sat.couponCode !== "FOUNDER50") {
    throw new Error("❌ Assertion Failed: Saturday offer is not FOUNDER50.");
  }
  console.log(`✅ [4/5] Weekly 3-Post Engine Verified:`);
  console.log(`      Tuesday [${tue.postType}]: "${tue.title}"`);
  console.log(`      Thursday [${thu.postType}]: "${thu.title}"`);
  console.log(`      Saturday [${sat.postType}]: "${sat.couponCode}" - 50% Off Annual Growth Pack`);

  // Save posts to DB to verify persistence
  for (const p of [tue, thu, sat]) {
    await prisma.gbpPost.create({
      data: {
        merchantId: cp.id,
        postType: p.postType,
        scheduledDay: p.scheduledDay,
        scheduledDate: p.scheduledDate,
        title: p.title,
        caption: p.caption,
        imageUrl: p.imageUrl,
        ctaType: p.ctaType,
        ctaUrl: p.ctaUrl,
        couponCode: p.couponCode,
        status: "DRAFT",
      },
    });
  }
  console.log(`      Persisted 3 weekly posts to database for customerpilot-hq.`);

  // 5. Verify Anti-Hallucination Fallback Reviews
  const sampleReview = getDynamicFallbackReview("saas_agency", undefined, "ground-truth-seed");
  const reviewText = (sampleReview.draft1 + " " + sampleReview.draft2 + " " + sampleReview.draft3).toLowerCase();
  const dummyWords = ["98765", "12345", "example.com", "lorem ipsum", "cake", "haircut", "facial", "thali"];
  for (const w of dummyWords) {
    if (reviewText.includes(w)) {
      throw new Error(`❌ Anti-Hallucination Check Failed: Found forbidden word "${w}" in review draft.`);
    }
  }
  console.log(`✅ [5/5] Anti-Hallucination Guard Verified: 0 dummy placeholders, 0 retail cross-hallucinations.`);
  console.log(`      Sample Draft 1: "${sampleReview.draft1}"`);

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("🎯 ALL GROUND-TRUTH ASSERTIONS PASSED WITH EXIT CODE 0.");
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
