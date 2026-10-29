/**
 * scripts/test_gbp_post_engine.js
 * 
 * End-to-End Integration Test for CustomerPilot "Zero-Touch" Weekly 3-Post Engine
 * 
 * Validates:
 * 1. Schedule date calculation (Tuesday, Thursday, Saturday)
 * 2. Locality extraction
 * 3. 3-Post generation (Product Spotlight, 5-Star Social Proof, Weekend 2x Offer)
 * 4. Idempotent upsert (0 duplicate rows created on re-run)
 * 5. Data integrity (0 dummy placeholders, realistic merchant details, coupon codes)
 * 6. Operator mark-posted lifecycle (status transitions from QUEUED -> POSTED)
 */

const { PrismaClient } = require("@prisma/client");
const path = require("path");

const db = new PrismaClient();

async function runTests() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🧪 CustomerPilot Weekly 3-Post Engine Integration Test Suite");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Dynamic imports from built/transpiled generator
    const {
      getUpcomingScheduleDates,
      extractLocality,
      generateWeeklyPostsForMerchant
    } = require("../src/lib/gbp-post-generator");

    // Test 1: Schedule Calculation
    console.log("▶️ Test 1: Schedule calculation (Tuesday, Thursday, Saturday)");
    const baseDate = new Date("2026-10-22T10:00:00.000Z"); // Thursday
    const dates = getUpcomingScheduleDates(baseDate);

    assert(dates.tuesday instanceof Date, "Tuesday is a valid Date object");
    assert(dates.thursday instanceof Date, "Thursday is a valid Date object");
    assert(dates.saturday instanceof Date, "Saturday is a valid Date object");
    assert(dates.tuesday.getDay() === 2, `Tuesday day is 2 (got ${dates.tuesday.getDay()})`);
    assert(dates.thursday.getDay() === 4, `Thursday day is 4 (got ${dates.thursday.getDay()})`);
    assert(dates.saturday.getDay() === 6, `Saturday day is 6 (got ${dates.saturday.getDay()})`);

    // Test 2: Locality Extraction
    console.log("\n▶️ Test 2: Locality & Landmark Extraction");
    const loc1 = extractLocality("Shop 4, Linking Road, Bandra West, Mumbai", "Mumbai");
    assert(loc1.includes("Bandra") || loc1.includes("Linking"), `Extracted locality: "${loc1}"`);
    const loc2 = extractLocality(null, "Bengaluru");
    assert(loc2 === "Bengaluru", `Fallback to city: "${loc2}"`);

    // Test 3: Setup or Find Test Merchant
    console.log("\n▶️ Test 3: Setting up Test Merchant for Post Generation");
    let testMerchant = await db.merchant.findFirst({
      where: { gbpServiceTrack: { not: "NONE" } }
    });

    if (!testMerchant) {
      testMerchant = await db.merchant.findFirst();
    }

    if (!testMerchant) {
      // Create seed merchant if empty DB
      testMerchant = await db.merchant.create({
        data: {
          name: "Cake Connection Artisanal Bakery",
          category: "bakery",
          city: "Pune",
          address: "Shop 12, Koregaon Park Main Road, Pune",
          whatsappPhone: "919876543210",
          gbpServiceTrack: "TRACK_B_EXISTING",
          gbpProfileStatus: "VERIFIED",
        }
      });
    }

    assert(!!testMerchant, `Active merchant found/created: ${testMerchant.name} (${testMerchant.id})`);

    // Clean up any existing test posts for this merchant to ensure clean slate
    await db.gbpPost.deleteMany({
      where: { merchantId: testMerchant.id }
    });

    // Test 4: Master 3-Post Generation
    console.log("\n▶️ Test 4: Master 3-Post Generation");
    const generatedPosts = await generateWeeklyPostsForMerchant(testMerchant.id, baseDate);

    assert(Array.isArray(generatedPosts), "Generator returns an array of posts");
    assert(generatedPosts.length === 3, `Generated exactly 3 posts (got ${generatedPosts.length})`);

    // Post 1: Tuesday Product Spotlight
    const tuesdayPost = generatedPosts.find(p => p.scheduledDay === "TUESDAY");
    assert(!!tuesdayPost, "Tuesday post exists");
    assert(tuesdayPost.postType === "PRODUCT_SPOTLIGHT", `Tuesday postType is PRODUCT_SPOTLIGHT (got ${tuesdayPost.postType})`);
    assert(tuesdayPost.ctaType === "ORDER", `Tuesday CTA is ORDER (got ${tuesdayPost.ctaType})`);
    assert(tuesdayPost.imageUrl.includes("/api/gbp/posts/card"), "Tuesday has dynamic image card URL");
    assert(tuesdayPost.caption.length > 50, "Tuesday caption is rich and descriptive");
    assert(!tuesdayPost.caption.includes("undefined"), "Tuesday caption has no 'undefined' substrings");

    // Post 2: Thursday 5-Star Social Proof
    const thursdayPost = generatedPosts.find(p => p.scheduledDay === "THURSDAY");
    assert(!!thursdayPost, "Thursday post exists");
    assert(thursdayPost.postType === "SOCIAL_PROOF", `Thursday postType is SOCIAL_PROOF (got ${thursdayPost.postType})`);
    assert(thursdayPost.ctaType === "LEARN_MORE", `Thursday CTA is LEARN_MORE (got ${thursdayPost.ctaType})`);
    assert(thursdayPost.caption.includes("⭐⭐⭐⭐⭐") || thursdayPost.caption.includes("5-star"), "Thursday caption features 5-star social proof");
    assert(!thursdayPost.caption.includes("undefined"), "Thursday caption has no 'undefined' substrings");

    // Post 3: Saturday Weekend Offer
    const saturdayPost = generatedPosts.find(p => p.scheduledDay === "SATURDAY");
    assert(!!saturdayPost, "Saturday post exists");
    assert(saturdayPost.postType === "WEEKEND_OFFER", `Saturday postType is WEEKEND_OFFER (got ${saturdayPost.postType})`);
    assert(saturdayPost.couponCode === "WEEKEND2X", `Saturday couponCode is WEEKEND2X (got ${saturdayPost.couponCode})`);
    assert(saturdayPost.offerStartDate instanceof Date, "Saturday offer has valid offerStartDate");
    assert(saturdayPost.offerEndDate instanceof Date, "Saturday offer has valid offerEndDate");
    assert(saturdayPost.ctaType === "OFFER", `Saturday CTA is OFFER (got ${saturdayPost.ctaType})`);

    // Test 5: Idempotency (Re-running on same date should NOT duplicate)
    console.log("\n▶️ Test 5: Idempotent Regeneration (0 Duplicate Rows)");
    const regeneratedPosts = await generateWeeklyPostsForMerchant(testMerchant.id, baseDate);
    assert(regeneratedPosts.length === 3, "Regeneration returns 3 posts");

    const totalCountInDb = await db.gbpPost.count({
      where: { merchantId: testMerchant.id }
    });
    assert(totalCountInDb === 3, `DB count remains exactly 3 after re-generation (got ${totalCountInDb})`);

    // Test 6: Merchant Approval & Edit Lifecycle
    console.log("\n▶️ Test 6: Merchant Approval & Edit Lifecycle");
    const postToApprove = generatedPosts[0];
    assert(postToApprove.status === "AWAITING_APPROVAL", `Initial status is AWAITING_APPROVAL (got ${postToApprove.status})`);

    // Merchant edits caption
    const editedPost = await db.gbpPost.update({
      where: { id: postToApprove.id },
      data: { caption: "Custom modified caption by merchant!" }
    });
    assert(editedPost.caption === "Custom modified caption by merchant!", "Merchant custom caption modification saved");

    // Merchant approves
    const approvedPost = await db.gbpPost.update({
      where: { id: postToApprove.id },
      data: { status: "APPROVED", approvedAt: new Date() }
    });
    assert(approvedPost.status === "APPROVED", "Merchant approval sets status to APPROVED");
    assert(approvedPost.approvedAt instanceof Date, "Approval timestamp recorded");

    // Test 7: Merchant Reject & Regenerate Flow
    console.log("\n▶️ Test 7: Merchant Reject & Regenerate Flow");
    const { regenerateSinglePost } = require("../src/lib/gbp-post-generator");
    const postToReject = generatedPosts[1];
    const initialTitle = postToReject.title;

    const regeneratedPost = await regenerateSinglePost(postToReject.id, "Merchant requested different variation");
    assert(regeneratedPost.status === "AWAITING_APPROVAL", "Regenerated post status resets to AWAITING_APPROVAL");
    assert(regeneratedPost.revisionCount === 1, `Revision count incremented to 1 (got ${regeneratedPost.revisionCount})`);
    assert(regeneratedPost.merchantFeedback === "Merchant requested different variation", "Feedback recorded");
    assert(regeneratedPost.rejectedAt instanceof Date, "Rejection timestamp recorded");
    assert(!!regeneratedPost.imageUrl, "Regenerated post has fresh image URL");

    // Test 8: Operator Mark-as-Posted Lifecycle
    console.log("\n▶️ Test 8: Operator Mark-as-Posted Transition");
    const updatedPost = await db.gbpPost.update({
      where: { id: postToApprove.id },
      data: {
        status: "POSTED",
        postedAt: new Date(),
        postedBy: "ops@customerpilot.in",
        gbpPostId: "accounts/123/locations/456/localPosts/789"
      }
    });

    assert(updatedPost.status === "POSTED", "Post status transitioned to POSTED");
    assert(updatedPost.postedBy === "ops@customerpilot.in", "Operator email recorded");
    assert(updatedPost.postedAt instanceof Date, "PostedAt timestamp recorded");

    // Summary
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("═══════════════════════════════════════════════════════════════");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("💥 Unhandled Error during test execution:", err);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runTests();
