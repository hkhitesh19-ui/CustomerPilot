import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Ensure we NEVER make real WhatsApp or Google calls in this test
delete process.env.EVOLUTION_API_URL;
delete process.env.EVOLUTION_API_KEY;

async function main() {
  const { db } = await import("../src/lib/db");
  const {
    matchReviewsToClaims,
    processLatePhotoBonuses,
    nameMatch
  } = await import("../src/lib/review-matcher");
  const { syncGoogleReviewsToDb } = await import("../src/lib/google-reviews-service");

  console.log("=== STEP 7: ISOLATED REVIEW MATCHER TEST SUITE ===");

  // 0. Unit check on nameMatch
  assert.equal(nameMatch("Aditya Bihari", "Aditya Bihari Vlogs Aditya Bihari Vlogs"), true, "Repeated name + vlogs should match");
  assert.equal(nameMatch("Hitesh Kumar", "Hitesh Kumar 🎉"), true, "Emoji stripped should match");
  assert.equal(nameMatch("Priya Shah", "Priya Verma"), false, "Different last name should not match");
  assert.equal(nameMatch("Amit", "Sumit"), false, "No full token match should reject");
  assert.equal(nameMatch("Rahul", "Rahul Patel"), false, "Single-token first-name-only must NOT match");
  assert.equal(nameMatch("Rahul Patil", "Rahul Patel"), false, "Rahul Patil vs Rahul Patel must NOT auto-match");
  assert.equal(nameMatch("Ritesh Patel", "Hitesh Patel"), false, "First token must be exact (Ritesh != Hitesh)");
  assert.equal(nameMatch("Kumar Shah", "Kumari Shah"), false, "5-char first token must be exact (Kumar != Kumari)");
  assert.equal(nameMatch("Abhilasha Sharma", "Abhilasha S."), false, "Initial last token must NOT auto-match");
  assert.equal(nameMatch("Rahul Shah", "Rahul"), false, "Single-token reviewer must NOT auto-match");
  assert.equal(nameMatch("guest_123", "guest_123"), false, "guest_ must NOT match");
  assert.equal(nameMatch("", "Rahul Patel"), false, "Empty name must NOT match");
  console.log("✅ 0. nameMatch unit assertions passed");

  // Setup isolated test merchant & stampCard
  const suffix = Date.now().toString();
  const merchant = await db.merchant.create({
    data: {
      name: `Test Bakery ${suffix}`,
      businessType: "Bakery",
      plan: "growth"
    }
  });

  const stampCard = await db.stampCard.create({
    data: {
      merchantId: merchant.id,
      name: "VIP Test Card",
      stampsRequired: 10,
      rewardName: "Free Cake",
      active: true,
      googleReviewBonus: 2,
      photoBonus: 2
    }
  });

  const now = new Date();
  const clickedAt = new Date(now.getTime() - 10 * 60 * 1000); // 10m ago
  const expiresAt = new Date(now.getTime() + 47 * 60 * 60 * 1000);

  // Test 1: 1 claim + matching review -> +2 stamps, claim matched
  const c1 = await db.customer.create({
    data: { merchantId: merchant.id, name: "Rohan Mehta", phone: `9190000001${suffix.slice(-2)}` }
  });
  const claim1 = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: c1.id, clickedAt, expiresAt, status: "open" }
  });

  const rev1Id = `gbp_test_rev1_${suffix}`;
  const sync1 = await syncGoogleReviewsToDb(merchant.id, [{
    gbpReviewId: rev1Id,
    reviewerName: "Rohan Mehta",
    rating: 5,
    comment: "Great cakes!",
    hasMedia: false,
    submittedAt: now
  }]);
  assert.equal(sync1.count, 1);
  assert.equal(sync1.created.length, 1);

  const match1 = await matchReviewsToClaims(merchant.id, sync1.created);
  assert.equal(match1.matched, 1, "Should match 1 claim");

  const claim1After = await db.reviewClaim.findUnique({ where: { id: claim1.id } });
  assert.equal(claim1After?.status, "matched");
  assert.equal(claim1After?.stampsAwarded, 2);
  assert.equal(claim1After?.matchedGbpReviewId, rev1Id);

  const c1After = await db.customer.findUnique({ where: { id: c1.id } });
  assert.equal(c1After?.lifetimeStamps, 2, "Customer 1 should have 2 stamps");
  console.log("✅ 1. 1 claim + matching review -> 2 stamps, claim matched");

  // Test 2: Same review processed twice -> no double credit
  const match2 = await matchReviewsToClaims(merchant.id, sync1.created);
  assert.equal(match2.matched, 0, "Re-processing same review must award 0");
  const c1AfterDup = await db.customer.findUnique({ where: { id: c1.id } });
  assert.equal(c1AfterDup?.lifetimeStamps, 2, "Customer 1 stamps must stay 2");
  console.log("✅ 2. Same review processed twice -> no double credit");

  // Test 3: Two claims same name -> both manual, 0 stamps
  const c2a = await db.customer.create({
    data: { merchantId: merchant.id, name: "Rahul Patil", phone: `9190000002${suffix.slice(-2)}` }
  });
  const c2b = await db.customer.create({
    data: { merchantId: merchant.id, name: "Rahul Patil", phone: `9190000003${suffix.slice(-2)}` }
  });
  const claim2a = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: c2a.id, clickedAt, expiresAt, status: "open" }
  });
  const claim2b = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: c2b.id, clickedAt, expiresAt, status: "open" }
  });

  const rev2Id = `gbp_test_rev2_${suffix}`;
  const sync2 = await syncGoogleReviewsToDb(merchant.id, [{
    gbpReviewId: rev2Id,
    reviewerName: "Rahul Patil",
    rating: 5,
    comment: "Awesome!",
    hasMedia: false,
    submittedAt: now
  }]);
  const match3 = await matchReviewsToClaims(merchant.id, sync2.created);
  assert.equal(match3.matched, 0);
  assert.equal(match3.manual, 2);

  const c2aClaimAfter = await db.reviewClaim.findUnique({ where: { id: claim2a.id } });
  const c2bClaimAfter = await db.reviewClaim.findUnique({ where: { id: claim2b.id } });
  assert.equal(c2aClaimAfter?.status, "manual");
  assert.equal(c2bClaimAfter?.status, "manual");
  assert.equal((await db.customer.findUnique({ where: { id: c2a.id } }))?.lifetimeStamps, 0);
  assert.equal((await db.customer.findUnique({ where: { id: c2b.id } }))?.lifetimeStamps, 0);
  console.log("✅ 3. Two claims same name -> both manual, 0 stamps");

  // Test 4: Review before clickedAt or after expiry -> no match
  const c3 = await db.customer.create({
    data: { merchantId: merchant.id, name: "Sneha Joshi", phone: `9190000004${suffix.slice(-2)}` }
  });
  await db.reviewClaim.create({
    data: {
      merchantId: merchant.id,
      customerId: c3.id,
      clickedAt: new Date(now.getTime() + 60_000), // clicked AFTER review
      expiresAt,
      status: "open"
    }
  });
  const match4 = await matchReviewsToClaims(merchant.id, [{
    gbpReviewId: `gbp_test_rev3_${suffix}`,
    reviewerName: "Sneha Joshi",
    rating: 5,
    hasMedia: false,
    createdAt: now
  }]);
  assert.equal(match4.matched, 0, "Review before clickedAt must not match");
  assert.equal((await db.customer.findUnique({ where: { id: c3.id } }))?.lifetimeStamps, 0);
  console.log("✅ 4. Review before clickedAt -> no match");

  // Test 5: hasMedia review -> 4 stamps total
  const c4 = await db.customer.create({
    data: { merchantId: merchant.id, name: "Karan Patel", phone: `9190000005${suffix.slice(-2)}` }
  });
  const claim4 = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: c4.id, clickedAt, expiresAt, status: "open" }
  });
  const rev4Id = `gbp_test_rev4_${suffix}`;
  const sync4 = await syncGoogleReviewsToDb(merchant.id, [{
    gbpReviewId: rev4Id,
    reviewerName: "Karan Patel",
    rating: 5,
    comment: "Loved the photo cake!",
    hasMedia: true,
    submittedAt: now
  }]);
  const match5 = await matchReviewsToClaims(merchant.id, sync4.created);
  assert.equal(match5.matched, 1);
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claim4.id } }))?.stampsAwarded, 4);
  assert.equal((await db.customer.findUnique({ where: { id: c4.id } }))?.lifetimeStamps, 4);
  console.log("✅ 5. hasMedia review -> 4 stamps total");

  // Test 6: Late photo bonus on claim1 (previously 2 stamps, now review gets hasMedia=true)
  await syncGoogleReviewsToDb(merchant.id, [{
    gbpReviewId: rev1Id,
    reviewerName: "Rohan Mehta",
    rating: 5,
    comment: "Great cakes!",
    hasMedia: true,
    submittedAt: now
  }]);
  const late1 = await processLatePhotoBonuses(merchant.id);
  assert.equal(late1, 1, "Late photo bonus should award +2 once");
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claim1.id } }))?.stampsAwarded, 4);
  assert.equal((await db.customer.findUnique({ where: { id: c1.id } }))?.lifetimeStamps, 4);

  const late2 = await processLatePhotoBonuses(merchant.id);
  assert.equal(late2, 0, "Re-running late photo bonus must not double credit");
  console.log("✅ 6. Late photo bonus -> +2 once (total 4), idempotent");

  // Test 7: Flag OFF check on record-google-post
  process.env.AUTO_REVIEW_MATCH = "false";
  const { POST } = await import("../src/app/api/reviews/record-google-post/route");
  const c5 = await db.customer.create({
    data: { merchantId: merchant.id, name: "Meera Nair", phone: `9190000006${suffix.slice(-2)}` }
  });
  const req = new Request("http://localhost:3000/api/reviews/record-google-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchantId: merchant.id, customerId: c5.id, rating: 5, reviewText: "Nice!" })
  });
  const res = await POST(req);
  const resJson = await res.json();
  assert.equal(resJson.success, true);
  assert.equal(resJson.bonusStamps, 0);
  const c5Claims = await db.reviewClaim.count({ where: { customerId: c5.id } });
  assert.equal(c5Claims, 0, "Flag OFF must create 0 ReviewClaims");
  console.log("✅ 7. Flag OFF -> 0 ReviewClaims created, 0 stamps awarded");

  // Test 8: Cake Connection pending check (if present in DB copy)
  const cakePending = await db.googleBusinessReview.count({
    where: { merchantId: "cmtymavfx0002kx008lbfvp57", status: "pending" }
  });
  console.log(`✅ 8. Cake Connection pending reviews in DB: ${cakePending}`);

  // Test 9 (Diff 2.1): First-name-only customer -> routed to manual, 0 stamps
  const cSingle = await db.customer.create({
    data: { merchantId: merchant.id, name: "Vikram", phone: `9190000007${suffix.slice(-2)}` }
  });
  const claimSingle = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: cSingle.id, clickedAt, expiresAt, status: "open" }
  });
  const matchSingle = await matchReviewsToClaims(merchant.id, [{
    gbpReviewId: `gbp_test_single_${suffix}`,
    reviewerName: "Vikram Desai",
    rating: 5,
    hasMedia: false,
    createdAt: now
  }]);
  assert.equal(matchSingle.matched, 0);
  assert.equal(matchSingle.manual, 1);
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claimSingle.id } }))?.status, "manual");
  assert.equal((await db.customer.findUnique({ where: { id: cSingle.id } }))?.lifetimeStamps, 0);
  console.log("✅ 9. First-name-only -> manual, 0 stamps");

  // Test 10 (Diff 2.1): Guest customer -> routed to manual, 0 stamps
  const cGuest = await db.customer.create({
    data: { merchantId: merchant.id, name: "Counter Customer", phone: `guest_${merchant.id.slice(0, 8)}` }
  });
  const claimGuest = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: cGuest.id, clickedAt, expiresAt, status: "open" }
  });
  const matchGuest = await matchReviewsToClaims(merchant.id, [{
    gbpReviewId: `gbp_test_guest_${suffix}`,
    reviewerName: "Any Reviewer",
    rating: 5,
    hasMedia: false,
    createdAt: now
  }]);
  assert.equal(matchGuest.matched, 0);
  assert.equal(matchGuest.manual, 1);
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claimGuest.id } }))?.status, "manual");
  assert.equal((await db.customer.findUnique({ where: { id: cGuest.id } }))?.lifetimeStamps, 0);
  console.log("✅ 10. Guest customer -> manual, 0 stamps");

  // Test 11 (Diff 2.1): "Rahul Patil" customer vs "Rahul Patel" reviewer -> no auto
  const cPatil = await db.customer.create({
    data: { merchantId: merchant.id, name: "Vikash Patil", phone: `9190000008${suffix.slice(-2)}` }
  });
  const claimPatil = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: cPatil.id, clickedAt, expiresAt, status: "open" }
  });
  const matchPatil = await matchReviewsToClaims(merchant.id, [{
    gbpReviewId: `gbp_test_patel_${suffix}`,
    reviewerName: "Vikash Patel",
    rating: 5,
    hasMedia: false,
    createdAt: now
  }]);
  assert.equal(matchPatil.matched, 0, "Patil vs Patel must NOT auto-award");
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claimPatil.id } }))?.status, "open");
  assert.equal((await db.customer.findUnique({ where: { id: cPatil.id } }))?.lifetimeStamps, 0);
  console.log('✅ 11. "Patil" vs "Patel" -> no auto-award');

  // Test 12 (Diff 2.1b): "Ritesh Patel" vs "Hitesh Patel" -> no auto-award
  const cRitesh = await db.customer.create({
    data: { merchantId: merchant.id, name: "Ritesh Patel", phone: `9190000009${suffix.slice(-2)}` }
  });
  const claimRitesh = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: cRitesh.id, clickedAt, expiresAt, status: "open" }
  });
  const matchRitesh = await matchReviewsToClaims(merchant.id, [{
    gbpReviewId: `gbp_test_ritesh_${suffix}`,
    reviewerName: "Hitesh Patel",
    rating: 5,
    hasMedia: false,
    createdAt: now
  }]);
  assert.equal(matchRitesh.matched, 0, "Ritesh Patel vs Hitesh Patel must NOT auto-award");
  assert.equal((await db.customer.findUnique({ where: { id: cRitesh.id } }))?.lifetimeStamps, 0);
  console.log('✅ 12. "Ritesh Patel" vs "Hitesh Patel" -> no auto-award');

  // Test 13 (Diff 2.1b): "Abhilasha S." vs "Abhilasha Sharma" -> manual
  const cAbhilasha = await db.customer.create({
    data: { merchantId: merchant.id, name: "Abhilasha Sharma", phone: `9190000010${suffix.slice(-2)}` }
  });
  const claimAbhilasha = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: cAbhilasha.id, clickedAt, expiresAt, status: "open" }
  });
  const matchAbhilasha = await matchReviewsToClaims(merchant.id, [{
    gbpReviewId: `gbp_test_abhilasha_${suffix}`,
    reviewerName: "Abhilasha S.",
    rating: 5,
    hasMedia: false,
    createdAt: now
  }]);
  assert.equal(matchAbhilasha.matched, 0);
  assert.equal(matchAbhilasha.manual, 1);
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claimAbhilasha.id } }))?.status, "manual");
  assert.equal((await db.customer.findUnique({ where: { id: cAbhilasha.id } }))?.lifetimeStamps, 0);
  console.log('✅ 13. "Abhilasha S." vs "Abhilasha Sharma" -> manual');

  // Test 14 (Diff 2.1b): Reviewer "Rahul" vs Customer "Rahul Shah" -> manual
  const cRahulShah = await db.customer.create({
    data: { merchantId: merchant.id, name: "Rahul Shah", phone: `9190000011${suffix.slice(-2)}` }
  });
  const claimRahulShah = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: cRahulShah.id, clickedAt, expiresAt, status: "open" }
  });
  const matchRahulSingle = await matchReviewsToClaims(merchant.id, [{
    gbpReviewId: `gbp_test_rahul_single_${suffix}`,
    reviewerName: "Rahul",
    rating: 5,
    hasMedia: false,
    createdAt: now
  }]);
  assert.equal(matchRahulSingle.matched, 0);
  assert.equal(matchRahulSingle.manual, 1);
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claimRahulShah.id } }))?.status, "manual");
  assert.equal((await db.customer.findUnique({ where: { id: cRahulShah.id } }))?.lifetimeStamps, 0);
  console.log('✅ 14. Reviewer "Rahul" vs Customer "Rahul Shah" -> manual');

  // Test 15 (Diff 2.1b): Guest claim with NO review -> stays open (not manual)
  const cGuestNoRev = await db.customer.create({
    data: { merchantId: merchant.id, name: "Counter Customer", phone: `guest_norev_${suffix}` }
  });
  const claimGuestNoRev = await db.reviewClaim.create({
    data: { merchantId: merchant.id, customerId: cGuestNoRev.id, clickedAt, expiresAt, status: "open" }
  });
  const matchEmpty = await matchReviewsToClaims(merchant.id, []);
  assert.equal(matchEmpty.matched, 0);
  assert.equal(matchEmpty.manual, 0);
  assert.equal((await db.reviewClaim.findUnique({ where: { id: claimGuestNoRev.id } }))?.status, "open");
  console.log("✅ 15. Guest claim with no review -> stays open");

  await db.$disconnect();
  console.log("\n🎯 ALL 15 ISOLATED REVIEW MATCHER TESTS PASSED!");
}

main().catch((err) => {
  console.error("❌ TEST FAILED:", err);
  process.exit(1);
});
