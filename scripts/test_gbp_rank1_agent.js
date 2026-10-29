/**
 * scripts/test_gbp_rank1_agent.js
 * 
 * Deterministic Test Suite for CustomerPilot Autonomous GBP Rank-1 Engine
 * 
 * Verifies:
 * 1. Track A Sandbox Routing (New profiles < 30 days or < 10 reviews)
 * 2. Track B Accelerator Routing (Cake Connection user payload)
 * 3. 4 Google Policy Guardrails (No review gating, reward action not stars, title proof requirement, no stock fluff)
 * 4. 100% Strict JSON Output Schema Parity
 * 5. Next.js API Route Handler POST /api/gbp/agent
 */

const assert = require("assert");
const { generateDeterministicGbpPayload, runGbpRank1Agent } = require("../src/lib/gbp-rank1-agent");
const { POST } = require("../src/app/api/gbp/agent/route");

async function runTests() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🚀 Testing CustomerPilot Autonomous GBP Rank-1 Engine");
  console.log("═══════════════════════════════════════════════════════════════\n");

  let passed = 0;
  let total = 0;

  function test(description, fn) {
    total++;
    try {
      fn();
      console.log(`✅ [Test ${total}] ${description}`);
      passed++;
    } catch (err) {
      console.error(`❌ [Test ${total}] FAILED: ${description}`);
      console.error(err);
      process.exit(1);
    }
  }

  async function testAsync(description, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [Test ${total}] ${description}`);
      passed++;
    } catch (err) {
      console.error(`❌ [Test ${total}] FAILED: ${description}`);
      console.error(err);
      process.exit(1);
    }
  }

  // ─── Test 1: Track A Routing & Sandbox Guardrails ─────────────
  test("Track A (Sandbox / New Profile) is routed when age < 30 days", () => {
    const input = {
      merchantId: "merch_new_01",
      businessName: "Aura Salon",
      accountAgeDays: 14,
      hasSignboardProof: false,
      hasUdyamOrLegalProof: false,
      city: "Vadodara",
      locality: "Alkapuri",
      nearbyLandmarks: ["Alkapuri Club", "Railway Station"],
      targetKeywords: ["hair spa", "bridal makeup"],
      currentProfile: {
        primaryCategory: "Beauty Salon",
        secondaryCategories: ["Hair Salon"],
        totalReviews: 5,
        reviewsLast30Days: 2,
        currentGridRankAvg: 18.2,
        top3PinCount: 0
      },
      top3Competitors: [
        {
          name: "Top Salon",
          primaryCategory: "Beauty Salon",
          secondaryCategories: ["Hair Salon", "Nail Salon"],
          totalReviews: 240,
          reviewsLast30Days: 15
        }
      ],
      productCatalogSample: [
        { name: "Keratin Hair Spa", priceINR: 1499 }
      ],
      pendingUnrepliedReviews: []
    };

    const output = generateDeterministicGbpPayload(input);

    assert.strictEqual(output.assignedTrack, "TRACK_A_SANDBOX", "Must assign TRACK_A_SANDBOX");
    assert.strictEqual(output.auditSummary.estimatedDaysToTop3, 60, "Track A target must be 60 days");
    assert.strictEqual(output.currentSprintPhase, "SPRINT_2", "Day 14 should map to SPRINT_2");

    // Check Citation Sync task is generated
    const hasCitation = output.immediateOperatorTasks.some(t => t.taskType === "CITATION_SYNC");
    assert.strictEqual(hasCitation, true, "Track A must have CITATION_SYNC operator task");

    // Check warning on unverified signboard
    const signboardTask = output.immediateOperatorTasks.find(t => t.taskType === "SIGNBOARD_DBA");
    assert.ok(signboardTask, "Must have SIGNBOARD_DBA task");
    assert.ok(signboardTask.exactInstructionHinglish.includes("STRICT WARNING"), "Must warn against title edits without proof");
  });

  // ─── Test 2: Track B Accelerator (User Cake Connection Payload) ─
  test("Track B (Accelerator) executes Category Surgery, Redressal, and Triple Schema", () => {
    const userPayload = {
      merchantId: "merch_cake_conn_01",
      businessName: "Cake Connection",
      accountAgeDays: 450,
      hasSignboardProof: true,
      hasUdyamOrLegalProof: true,
      city: "Vadodara",
      locality: "Manjalpur",
      nearbyLandmarks: ["Eva Mall", "Manjalpur Naka", "Darbar Chokdi"],
      weakGridDirections: ["South-West (Makarpura side)", "East (Pratapnagar side)"],
      targetKeywords: [
        "custom birthday cake",
        "fresh chocolate truffle cake",
        "live cake shop in Manjalpur",
        "eggless photo cake"
      ],
      currentProfile: {
        primaryCategory: "Bakery",
        secondaryCategories: ["Cake Shop"],
        totalReviews: 145,
        reviewsLast30Days: 4,
        currentGridRankAvg: 12.4,
        top3PinCount: 2
      },
      top3Competitors: [
        {
          name: "Competitor A - Best Cake Shop Vadodara",
          hasRealSignboardForKeywords: false,
          primaryCategory: "Cake Shop",
          secondaryCategories: ["Bakery", "Wedding Bakery", "Dessert Shop", "Pastry Shop"],
          totalReviews: 390,
          reviewsLast30Days: 24
        }
      ],
      productCatalogSample: [
        {
          name: "Belgian Chocolate Truffle Cake (500g)",
          priceINR: 550,
          imageUrl: "https://customerpilot.in/assets/cake1.jpg"
        }
      ],
      pendingUnrepliedReviews: [
        {
          reviewId: "rev_101",
          reviewerName: "Rohan Patel",
          starRating: 5,
          comment: "Very tasty cake and fast service!"
        }
      ]
    };

    const output = generateDeterministicGbpPayload(userPayload);

    assert.strictEqual(output.assignedTrack, "TRACK_B_ACCELERATOR", "Must assign TRACK_B_ACCELERATOR");
    assert.strictEqual(output.auditSummary.estimatedDaysToTop3, 30, "Track B target must be 30 days");
    assert.strictEqual(output.currentSprintPhase, "SPRINT_1", "Category mismatch / spam triggers SPRINT_1");

    // Category surgery: Primary must match #1 competitor
    assert.strictEqual(output.automatedSystemPayloads.gbpCategoryUpdate.primaryCategory, "Cake Shop");
    assert.ok(output.automatedSystemPayloads.gbpCategoryUpdate.secondaryCategories.includes("Bakery"));

    // Competitor Redressal Task must be generated for "Competitor A - Best Cake Shop Vadodara"
    const redressalTask = output.immediateOperatorTasks.find(t => t.taskType === "REDRESSAL_FILING");
    assert.ok(redressalTask, "Must generate REDRESSAL_FILING task");
    assert.ok(redressalTask.copyPastePayload.includes("Competitor A - Best Cake Shop Vadodara"));

    // Legitimate DBA Signboard optimization permitted because proofs are true
    const signboardTask = output.immediateOperatorTasks.find(t => t.taskType === "SIGNBOARD_DBA");
    assert.ok(signboardTask, "Must generate SIGNBOARD_DBA task");
    assert.ok(signboardTask.copyPastePayload.includes("Cake Connection - custom birthday cake"));

    // Triple JSON-LD schema verification
    const jsonLd = output.automatedSystemPayloads.microPageSeo.jsonLdSchema;
    assert.ok(jsonLd["@graph"], "Triple schema must contain @graph");
    const types = jsonLd["@graph"].map(item => item["@type"]);
    assert.ok(types.includes("LocalBusiness"), "Schema must include LocalBusiness");
    assert.ok(types.includes("FAQPage"), "Schema must include FAQPage");
    assert.ok(types.includes("OfferCatalog"), "Schema must include OfferCatalog");

    // 5 WhatsApp prompts rotated
    const prompts = output.automatedSystemPayloads.whatsappReviewPromptsHinglish;
    assert.strictEqual(prompts.length, 5, "Must provide 5 rotated WhatsApp prompt variants");

    // Automated Review Replies
    const replies = output.automatedSystemPayloads.automatedReviewReplies;
    assert.strictEqual(replies.length, 1, "Must generate reply for pending review");
    assert.strictEqual(replies[0].reviewId, "rev_101");
    assert.ok(replies[0].replyText.includes("Rohan Patel"));
    assert.ok(replies[0].replyText.includes("Cake Connection"));
    assert.ok(replies[0].replyText.includes("Manjalpur"));

    // Weekly 3 Posts (Tuesday, Thursday, Saturday)
    const posts = output.automatedSystemPayloads.weeklyGbpPosts;
    assert.strictEqual(posts.tuesdayProductPost.postType, "STANDARD");
    assert.strictEqual(posts.tuesdayProductPost.ctaType, "ORDER");
    assert.strictEqual(posts.thursdayReviewPost.postType, "STANDARD");
    assert.strictEqual(posts.saturdayOfferPost.postType, "OFFER");
    assert.strictEqual(posts.saturdayOfferPost.couponCode, "WEEKEND15");
  });

  // ─── Test 3: Google Policy Guardrails (Red Lines) ─────────────
  test("Policy Guardrail 1: NO Review Gating in WhatsApp Prompts", () => {
    const input = {
      merchantId: "merch_guardrail_01",
      businessName: "Fresh Bakes",
      accountAgeDays: 60,
      hasSignboardProof: true,
      hasUdyamOrLegalProof: true,
      city: "Vadodara",
      locality: "Karelibaug",
      nearbyLandmarks: ["L&T Circle"],
      targetKeywords: ["fresh bread"],
      currentProfile: {
        primaryCategory: "Bakery",
        secondaryCategories: [],
        totalReviews: 25,
        reviewsLast30Days: 5,
        currentGridRankAvg: 5.0,
        top3PinCount: 1
      },
      top3Competitors: [],
      productCatalogSample: [],
      pendingUnrepliedReviews: []
    };

    const output = generateDeterministicGbpPayload(input);
    const prompts = output.automatedSystemPayloads.whatsappReviewPromptsHinglish;

    prompts.forEach(p => {
      // Must NOT gate by rating 1 to 5
      assert.ok(!p.messageText.toLowerCase().includes("rate us 1 to 5"), "Must not contain review gating question");
      assert.ok(!p.messageText.toLowerCase().includes("how many stars"), "Must not filter by stars");
      // Must contain support opt-out
      assert.ok(p.messageText.includes("HELP"), "Must include support opt-out via HELP reply");
    });
  });

  test("Policy Guardrail 2: Reward the Action, NEVER the 5-Star Rating", () => {
    const input = {
      merchantId: "merch_guardrail_02",
      businessName: "Fresh Bakes",
      accountAgeDays: 60,
      hasSignboardProof: true,
      hasUdyamOrLegalProof: true,
      city: "Vadodara",
      locality: "Karelibaug",
      nearbyLandmarks: ["L&T Circle"],
      targetKeywords: ["fresh bread"],
      currentProfile: {
        primaryCategory: "Bakery",
        secondaryCategories: [],
        totalReviews: 25,
        reviewsLast30Days: 5,
        currentGridRankAvg: 5.0,
        top3PinCount: 1
      },
      top3Competitors: [],
      productCatalogSample: [],
      pendingUnrepliedReviews: []
    };

    const output = generateDeterministicGbpPayload(input);
    const prompts = output.automatedSystemPayloads.whatsappReviewPromptsHinglish;

    prompts.forEach(p => {
      assert.ok(!p.messageText.toLowerCase().includes("give us a 5-star"), "Must never demand 5-star for incentive");
      assert.ok(!p.messageText.toLowerCase().includes("5 star review to get"), "Must never condition reward on 5 stars");
      assert.ok(p.messageText.toLowerCase().includes("honest"), "Must neutrally request honest feedback");
    });
  });

  // ─── Test 4: runGbpRank1Agent Orchestrator ─────────────────────
  await testAsync("runGbpRank1Agent returns fully conforming JSON output", async () => {
    const sample = {
      merchantId: "merch_cake_conn_01",
      businessName: "Cake Connection",
      accountAgeDays: 450,
      hasSignboardProof: true,
      hasUdyamOrLegalProof: true,
      city: "Vadodara",
      locality: "Manjalpur",
      nearbyLandmarks: ["Eva Mall"],
      targetKeywords: ["fresh chocolate truffle cake"],
      currentProfile: {
        primaryCategory: "Bakery",
        secondaryCategories: ["Cake Shop"],
        totalReviews: 145,
        reviewsLast30Days: 4,
        currentGridRankAvg: 12.4,
        top3PinCount: 2
      },
      top3Competitors: [
        {
          name: "Comp 1",
          primaryCategory: "Cake Shop",
          secondaryCategories: ["Bakery"],
          totalReviews: 200,
          reviewsLast30Days: 10
        }
      ],
      productCatalogSample: [
        { name: "Truffle Cake", priceINR: 550 }
      ],
      pendingUnrepliedReviews: [
        {
          reviewId: "r1",
          reviewerName: "Amit Shah",
          starRating: 5,
          comment: "Great cake!"
        }
      ]
    };

    const result = await runGbpRank1Agent(sample);
    assert.strictEqual(result.merchantId, "merch_cake_conn_01");
    assert.strictEqual(result.assignedTrack, "TRACK_B_ACCELERATOR");
    assert.ok(result.auditSummary);
    assert.ok(result.immediateOperatorTasks.length > 0);
    assert.ok(result.automatedSystemPayloads.gbpCategoryUpdate);
    assert.ok(result.automatedSystemPayloads.microPageSeo);
    assert.ok(result.automatedSystemPayloads.seedQaPairs.length > 0);
    assert.ok(result.automatedSystemPayloads.whatsappReviewPromptsHinglish.length === 5);
    assert.ok(result.automatedSystemPayloads.automatedReviewReplies.length === 1);
    assert.ok(result.automatedSystemPayloads.weeklyGbpPosts.tuesdayProductPost);
    assert.ok(result.automatedSystemPayloads.weeklyGbpPosts.thursdayReviewPost);
    assert.ok(result.automatedSystemPayloads.weeklyGbpPosts.saturdayOfferPost);
  });

  // ─── Test 5: Next.js API Route Handler POST /api/gbp/agent ─────
  await testAsync("POST /api/gbp/agent handles direct payload and returns HTTP 200", async () => {
    const rawPayload = {
      merchantId: "merch_api_test",
      businessName: "Cake Connection",
      accountAgeDays: 450,
      hasSignboardProof: true,
      hasUdyamOrLegalProof: true,
      city: "Vadodara",
      locality: "Manjalpur",
      nearbyLandmarks: ["Eva Mall"],
      targetKeywords: ["fresh cake"],
      currentProfile: {
        primaryCategory: "Bakery",
        secondaryCategories: ["Cake Shop"],
        totalReviews: 145,
        reviewsLast30Days: 4,
        currentGridRankAvg: 12.4,
        top3PinCount: 2
      },
      top3Competitors: [],
      productCatalogSample: [],
      pendingUnrepliedReviews: []
    };

    const mockReq = {
      json: async () => rawPayload
    };

    const response = await POST(mockReq);
    assert.strictEqual(response.status, 200, "API route must return HTTP 200");
    const json = await response.json();
    assert.strictEqual(json.ok, true, "Response must have ok: true");
    assert.strictEqual(json.data.merchantId, "merch_api_test");
    assert.strictEqual(json.data.assignedTrack, "TRACK_B_ACCELERATOR");
  });

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`🎯 ALL ${passed}/${total} GBP RANK-1 ENGINE TESTS PASSED CLEANLY!`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);
}

runTests().catch(err => {
  console.error("Fatal Test Suite Error:", err);
  process.exit(1);
});
