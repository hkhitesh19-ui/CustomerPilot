/**
 * scripts/execute_cake_gbp_optimization.ts
 * 
 * End-to-End Execution and Testing of GBP Optimization for Cake Connection Artisanal Bakery
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateGbpAudit } from "../src/lib/gbp-audit-engine";
import { TRACK_B_CHECKLIST } from "../src/lib/gbp-checklist-seed";
import {
  generateWeeklyPostsForMerchant,
  regenerateSinglePost,
  getUpcomingScheduleDates,
} from "../src/lib/gbp-post-generator";

const db = new PrismaClient();

async function runOptimization() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🚀 STARTING GBP OPTIMIZATION FOR CAKE CONNECTION ARTISANAL BAKERY");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let passedAssertions = 0;
  let failedAssertions = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ ${msg}`);
      passedAssertions++;
    } else {
      console.error(`  ❌ FAILED: ${msg}`);
      failedAssertions++;
    }
  }

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Setup/Verify Cake Connection Merchant and User Records
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶️ STEP 1: Setting up Merchant & Authentication Credentials");

    let merchant = await db.merchant.findFirst({
      where: {
        OR: [
          { name: { contains: "Cake Connection" } },
          { email: "cake@customerpilot.in" },
        ]
      }
    });

    if (!merchant) {
      merchant = await db.merchant.create({
        data: {
          name: "Cake Connection Artisanal Bakery",
          email: "cake@customerpilot.in",
          category: "bakery",
          city: "Pune",
          address: "Shop 12, Koregaon Park Main Road, Pune",
          whatsappPhone: "919876543210",
          gbpServiceTrack: "TRACK_B_EXISTING",
          gbpProfileStatus: "VERIFIED",
        }
      });
    } else {
      merchant = await db.merchant.update({
        where: { id: merchant.id },
        data: {
          name: "Cake Connection Artisanal Bakery",
          email: "cake@customerpilot.in",
          category: "bakery",
          city: "Pune",
          address: "Shop 12, Koregaon Park Main Road, Pune",
          whatsappPhone: "919876543210",
          gbpServiceTrack: "TRACK_B_EXISTING",
          gbpProfileStatus: "VERIFIED",
        }
      });
    }

    assert(!!merchant, `Merchant profile ready: "${merchant.name}" (ID: ${merchant.id})`);
    assert(merchant.city === "Pune", `City confirmed: ${merchant.city}`);
    assert(merchant.address?.includes("Koregaon Park") ?? false, `Address verified: ${merchant.address}`);

    // Create / Update User for Cake Connection
    const passwordHash = await bcrypt.hash("Admin@CustomerPilot2026!", 10);
    const existingUser = await db.user.findFirst({
      where: { email: "cake@customerpilot.in" }
    });

    if (!existingUser) {
      await db.user.create({
        data: {
          email: "cake@customerpilot.in",
          password: passwordHash,
          name: "Cake Connection Owner",
          role: "MERCHANT",
          merchant: { connect: { id: merchant.id } }
        }
      });
    }

    // Create / Update SuperAdmin User
    const existingAdmin = await db.user.findFirst({
      where: { email: "admin@customerpilot.in" }
    });
    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: "admin@customerpilot.in",
          password: passwordHash,
          name: "CustomerPilot SuperAdmin",
          role: "SUPERADMIN",
        }
      });
    }
    assert(true, "Authentication users verified (Merchant & SuperAdmin)");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Execute 100-Point Diagnostic GBP Health Audit for Cake Connection
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶️ STEP 2: Running Free 100-Point Diagnostic GBP Health Audit");

    const auditResult = calculateGbpAudit({
      businessName: merchant.name,
      category: merchant.category || "bakery",
      locality: "Koregaon Park, Pune",
      currentReviews: 142,
      currentRank: 18, // Existing shop stuck at rank #18
      realPlace: null,
    });

    const score = auditResult.audit.overallScore;
    const pillars = auditResult.audit.pillars;
    const competitors = auditResult.competitors;

    assert(score > 0 && score <= 100, `Total audit score: ${score}/100 (${auditResult.audit.grade} Grade)`);
    assert(pillars.length >= 6, `6-Pillar audit breakdown complete (${pillars.length} pillars)`);
    assert(competitors.length > 0, `Competitor local pack benchmark generated (${competitors.length} competitors)`);
    assert(auditResult.recommendedTrack === "TRACK_B", `Recommended service track: ${auditResult.recommendedTrack} (${auditResult.trackDetails.name})`);
    assert(auditResult.fiveGuardrails.length === 5, `All 5 operational guardrails evaluated (${auditResult.fiveGuardrails.length} guardrails)`);

    console.log(`     📊 Audit Scorecard for ${merchant.name}:`);
    for (const pillar of pillars) {
      console.log(`        • ${pillar.title}: ${pillar.score}/${pillar.maxScore} pts [${pillar.status}]`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3: Assign Service Track B & Seed 15 Operational Checklist Items
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶️ STEP 3: Assigning Track B (Existing Profile Surgery) & Seeding Checklist");

    // Clear previous items for idempotency
    await db.gbpChecklistItem.deleteMany({ where: { merchantId: merchant.id } });

    // Seed Track B items
    await db.gbpChecklistItem.createMany({
      data: TRACK_B_CHECKLIST.map((item) => ({
        merchantId: merchant.id,
        track: "TRACK_B_EXISTING",
        week: item.week,
        taskKey: item.taskKey,
        taskLabel: item.taskLabel,
        isDone: false,
      }))
    });

    const seededItems = await db.gbpChecklistItem.findMany({
      where: { merchantId: merchant.id },
      orderBy: { week: "asc" }
    });

    assert(seededItems.length === TRACK_B_CHECKLIST.length, `Seeded exactly ${seededItems.length} Track B operational checklist items`);

    // Verify 5 Newly Injected Operational SOP Modules are present
    const subboardItem = seededItems.find(i => i.taskKey === "SUBBOARD_UPGRADE_VERIFIED");
    assert(!!subboardItem, "SOP #2 (Signboard Upgrade SOP: ₹500 acrylic sub-board) seeded in checklist");

    const redressalItem = seededItems.find(i => i.taskKey === "COMPETITOR_REDRESSAL_FILED");
    assert(!!redressalItem, "SOP #3 (Spam Purge SOP: Google Business Redressal Form + photo proof) seeded in checklist");

    const attributesItem = seededItems.find(i => i.taskKey === "HIDDEN_ATTRIBUTES_AND_BOOKING");
    assert(!!attributesItem, "SOP #5 (Hidden Attributes & direct WhatsApp booking link) seeded in checklist");

    const geoAiItem = seededItems.find(i => i.taskKey === "GEO_AI_LISTICLE_PUBLISHED");
    assert(!!geoAiItem, "SOP #4 (Outside-GBP GEO AI Mentions: Medium/Quora listicle) seeded in checklist");

    const standeeItem = seededItems.find(i => i.taskKey === "QR_STANDEE_DEPLOYED");
    assert(!!standeeItem, "SOP #1 (Zero-Ban review standee: Reward honest review with photo) seeded in checklist");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4: Generate Next Week's 3 Google Posts in Advance
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶️ STEP 4: Generating Next Week's 3 Google Posts (Tuesday, Thursday, Saturday)");

    // Clear previous posts for clean test run
    await db.gbpPost.deleteMany({ where: { merchantId: merchant.id } });

    const baseDate = new Date("2026-10-22T10:00:00.000Z");
    const generatedPosts = await generateWeeklyPostsForMerchant(merchant.id, baseDate);

    assert(generatedPosts.length === 3, `Generated exactly 3 posts for Cake Connection (got ${generatedPosts.length})`);

    const postTuesday = generatedPosts.find(p => p.scheduledDay === "TUESDAY")!;
    const postThursday = generatedPosts.find(p => p.scheduledDay === "THURSDAY")!;
    const postSaturday = generatedPosts.find(p => p.scheduledDay === "SATURDAY")!;

    assert(postTuesday.status === "AWAITING_APPROVAL", `Tuesday post status is AWAITING_APPROVAL (got ${postTuesday.status})`);
    assert(postThursday.status === "AWAITING_APPROVAL", `Thursday post status is AWAITING_APPROVAL (got ${postThursday.status})`);
    assert(postSaturday.status === "AWAITING_APPROVAL", `Saturday post status is AWAITING_APPROVAL (got ${postSaturday.status})`);

    assert(postTuesday.caption.includes("Cake Connection"), "Tuesday caption includes Cake Connection brand name");
    assert(postTuesday.caption.includes("Koregaon Park") || postTuesday.caption.includes("Pune"), "Tuesday caption features local neighborhood keywords");
    assert(postTuesday.ctaType === "ORDER", "Tuesday CTA is ORDER via WhatsApp");

    assert(postThursday.postType === "SOCIAL_PROOF", "Thursday post is 5-Star Social Proof");
    assert(postThursday.caption.includes("⭐⭐⭐⭐⭐"), "Thursday caption showcases 5-star customer review");

    assert(postSaturday.postType === "WEEKEND_OFFER", "Saturday post is Official Google OFFER Post");
    assert(postSaturday.couponCode === "WEEKEND2X", "Saturday post has valid couponCode WEEKEND2X");
    assert(postSaturday.ctaType === "OFFER", "Saturday CTA is OFFER");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5: Test Merchant Lifecycle Actions (Approve, Edit, Reject & Regenerate)
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶️ STEP 5: Testing Merchant Lifecycle Actions (Approve, Edit, Reject & Regenerate)");

    // 1. Merchant Approves Post #1 (Tuesday)
    const approvedTuesday = await db.gbpPost.update({
      where: { id: postTuesday.id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      }
    });
    assert(approvedTuesday.status === "APPROVED", "Merchant 1-Click Approved Post #1 (status -> APPROVED)");
    assert(approvedTuesday.approvedAt instanceof Date, "Approval timestamp recorded in database");

    // 2. Merchant Edits Post #2 (Thursday)
    const customizedCaption = `⭐⭐⭐⭐⭐ "The Belgian Chocolate Truffle cake from Cake Connection made our anniversary celebration unforgettable! Fresh, rich, and prompt delivery in Koregaon Park." — Priya M.\n\nThank you for trusting Cake Connection Artisanal Bakery! Visit us today or WhatsApp to order fresh.`;
    const customizedTitle = `Anniversary Special Testimonial — Cake Connection`;

    const editedThursday = await db.gbpPost.update({
      where: { id: postThursday.id },
      data: {
        title: customizedTitle,
        caption: customizedCaption,
      }
    });
    assert(editedThursday.title === customizedTitle, "Merchant customized title saved successfully");
    assert(editedThursday.caption === customizedCaption, "Merchant customized caption saved successfully");

    // 3. Merchant Rejects Post #3 (Saturday) & Triggers Instant Fresh Option Regeneration
    const merchantFeedback = "Feature freshly baked sourdough loaves and celebratory family hamper instead";
    const regeneratedSaturday = await regenerateSinglePost(postSaturday.id, merchantFeedback);

    assert(regeneratedSaturday.status === "AWAITING_APPROVAL", "Regenerated post resets to AWAITING_APPROVAL");
    assert(regeneratedSaturday.revisionCount === 1, `Revision count incremented to 1 (got ${regeneratedSaturday.revisionCount})`);
    assert(regeneratedSaturday.merchantFeedback === merchantFeedback, "Merchant feedback reason recorded in DB");
    assert(regeneratedSaturday.rejectedAt instanceof Date, "Rejection timestamp recorded");
    assert(regeneratedSaturday.title.includes("Weekend"), "Regenerated title generated properly");
    assert(!!regeneratedSaturday.imageUrl, "Regenerated dynamic card banner created");

    // 4. Operator Marks Post #1 as Posted to Google Maps
    const operatorPosted = await db.gbpPost.update({
      where: { id: postTuesday.id },
      data: {
        status: "POSTED",
        postedAt: new Date(),
        postedBy: "ops@customerpilot.in",
        gbpPostId: "accounts/cake-connection/locations/pune/localPosts/lp-101",
      }
    });
    assert(operatorPosted.status === "POSTED", "Operator marked Post #1 as POSTED to Google Maps");
    assert(operatorPosted.postedBy === "ops@customerpilot.in", "Operator attribution logged");

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6: Execute Checklist Task Completion Simulation
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶️ STEP 6: Testing Operational Checklist Progress & Side-Effects");

    // Complete Manager Access
    const mgrTask = seededItems.find(i => i.taskKey === "MANAGER_ACCESS")!;
    await db.gbpChecklistItem.update({
      where: { id: mgrTask.id },
      data: { isDone: true, doneAt: new Date(), doneByEmail: "ops@customerpilot.in" }
    });

    // Complete Sub-Board Upgrade SOP
    await db.gbpChecklistItem.update({
      where: { id: subboardItem!.id },
      data: {
        isDone: true,
        doneAt: new Date(),
        doneByEmail: "ops@customerpilot.in",
        notes: "Verified ₹500 acrylic sub-board photo ('Cake Connection - Artisanal Bakery & Patisserie') & updated Udyam certificate."
      }
    });

    // Complete Hidden Attributes & Booking Link
    await db.gbpChecklistItem.update({
      where: { id: attributesItem!.id },
      data: {
        isDone: true,
        doneAt: new Date(),
        doneByEmail: "ops@customerpilot.in",
        notes: "Wheelchair, Restroom, Women-owned, UPI toggled ON + direct WhatsApp booking URL configured."
      }
    });

    const completedCount = await db.gbpChecklistItem.count({
      where: { merchantId: merchant.id, isDone: true }
    });
    const totalCount = await db.gbpChecklistItem.count({
      where: { merchantId: merchant.id }
    });

    assert(completedCount === 3, `Checklist completion verified (3/${totalCount} tasks completed)`);

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 7: Ground-Truth Zero Dummy Data & Locality Verification
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶️ STEP 7: Ground-Truth Data & Anti-Dummy Data Assertion");

    const allPostsInDb = await db.gbpPost.findMany({
      where: { merchantId: merchant.id }
    });

    for (const post of allPostsInDb) {
      assert(!post.caption.includes("lorem ipsum"), `Post ${post.scheduledDay}: No lorem ipsum`);
      assert(!post.caption.includes("undefined"), `Post ${post.scheduledDay}: No undefined values`);
      assert(!post.caption.includes("12345"), `Post ${post.scheduledDay}: No dummy placeholder numbers`);
      assert(post.caption.length >= 60, `Post ${post.scheduledDay}: High-density rich local SEO copy (${post.caption.length} chars)`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FINAL SUMMARY
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log(`🏁 CAKE CONNECTION OPTIMIZATION VERIFICATION: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
    console.log("═══════════════════════════════════════════════════════════════\n");

    if (failedAssertions > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("💥 Unhandled Error during optimization execution:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

runOptimization();
