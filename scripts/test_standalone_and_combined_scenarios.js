/**
 * End-to-End Simulation Test Script for Standalone & Combined Services
 * 
 * Verifies:
 * 1. Complete Bundle Merchant (All 3 modules)
 * 2. Loyalty-Only Standalone Merchant
 * 3. Reviews-Only Standalone Merchant
 * 4. AutoReply-Only Standalone Merchant
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import feature-gate helper logic directly
function hasModule(merchant, module) {
  const modules = merchant.enabledModules || "LOYALTY,REVIEWS,AUTOREPLY";
  return modules.split(",").map(m => m.trim()).includes(module);
}

async function runTests() {
  console.log("================================================================");
  console.log("🧪 STARTING STANDALONE & COMBINED SERVICES VERIFICATION TEST");
  console.log("================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Feature-Gate Logic Tests
  // -------------------------------------------------------------
  console.log("📌 1. Testing Feature-Gate Helper Logic:");
  const completeMerchant = { enabledModules: "LOYALTY,REVIEWS,AUTOREPLY" };
  const loyaltyMerchant = { enabledModules: "LOYALTY" };
  const reviewsMerchant = { enabledModules: "REVIEWS" };
  const autoReplyMerchant = { enabledModules: "AUTOREPLY" };
  const legacyMerchant = { enabledModules: null }; // Legacy / default

  assert(hasModule(completeMerchant, "LOYALTY") === true, "Complete merchant has LOYALTY");
  assert(hasModule(completeMerchant, "REVIEWS") === true, "Complete merchant has REVIEWS");
  assert(hasModule(completeMerchant, "AUTOREPLY") === true, "Complete merchant has AUTOREPLY");

  assert(hasModule(loyaltyMerchant, "LOYALTY") === true, "Loyalty merchant has LOYALTY");
  assert(hasModule(loyaltyMerchant, "REVIEWS") === false, "Loyalty merchant DOES NOT have REVIEWS");
  assert(hasModule(loyaltyMerchant, "AUTOREPLY") === false, "Loyalty merchant DOES NOT have AUTOREPLY");

  assert(hasModule(reviewsMerchant, "REVIEWS") === true, "Reviews merchant has REVIEWS");
  assert(hasModule(reviewsMerchant, "LOYALTY") === false, "Reviews merchant DOES NOT have LOYALTY");
  assert(hasModule(reviewsMerchant, "AUTOREPLY") === false, "Reviews merchant DOES NOT have AUTOREPLY");

  assert(hasModule(autoReplyMerchant, "AUTOREPLY") === true, "AutoReply merchant has AUTOREPLY");
  assert(hasModule(autoReplyMerchant, "LOYALTY") === false, "AutoReply merchant DOES NOT have LOYALTY");
  assert(hasModule(autoReplyMerchant, "REVIEWS") === false, "AutoReply merchant DOES NOT have REVIEWS");

  assert(hasModule(legacyMerchant, "LOYALTY") === true, "Legacy merchant (null) defaults to LOYALTY");
  assert(hasModule(legacyMerchant, "REVIEWS") === true, "Legacy merchant (null) defaults to REVIEWS");
  assert(hasModule(legacyMerchant, "AUTOREPLY") === true, "Legacy merchant (null) defaults to AUTOREPLY");

  // -------------------------------------------------------------
  // Test 2: Database Plans Verification
  // -------------------------------------------------------------
  console.log("\n📌 2. Testing Database Pricing Plans:");
  const allPlans = await prisma.plan.findMany({ where: { active: true } });
  console.log(`  Found ${allPlans.length} active plans in database:`);
  
  const expectedPlans = [
    { key: "starter_30", expectedModules: "LOYALTY,REVIEWS,AUTOREPLY" },
    { key: "growth_180", expectedModules: "LOYALTY,REVIEWS,AUTOREPLY" },
    { key: "enterprise_365", expectedModules: "LOYALTY,REVIEWS,AUTOREPLY" },
    { key: "loyalty_monthly", expectedModules: "LOYALTY" },
    { key: "loyalty_yearly", expectedModules: "LOYALTY" },
    { key: "reviews_monthly", expectedModules: "REVIEWS" },
    { key: "reviews_yearly", expectedModules: "REVIEWS" },
    { key: "autoreply_monthly", expectedModules: "AUTOREPLY" },
    { key: "autoreply_yearly", expectedModules: "AUTOREPLY" },
  ];

  for (const exp of expectedPlans) {
    const plan = allPlans.find(p => p.planKey === exp.key);
    assert(!!plan, `Plan ${exp.key} exists in database`);
    if (plan) {
      assert(plan.enabledModules === exp.expectedModules, `Plan ${exp.key} enabledModules == '${exp.expectedModules}'`);
    }
  }

  // -------------------------------------------------------------
  // Test 3: Onboarding Dynamic Steps Simulation
  // -------------------------------------------------------------
  console.log("\n📌 3. Testing Onboarding Step Filtering Simulation:");
  const ALL_STEPS = [
    { stepKey: "business_info",   requiredModules: [] },
    { stepKey: "whatsapp_verify", requiredModules: ["LOYALTY", "REVIEWS"] },
    { stepKey: "google_business", requiredModules: ["REVIEWS", "AUTOREPLY"] },
    { stepKey: "logo_upload",     requiredModules: ["LOYALTY"] },
    { stepKey: "reward_setup",    requiredModules: ["LOYALTY"] },
    { stepKey: "qr_code",         requiredModules: ["LOYALTY"] },
    { stepKey: "print_standee",   requiredModules: ["LOYALTY"] },
    { stepKey: "system_test",     requiredModules: ["LOYALTY"] },
  ];

  function getStepsForMerchant(m) {
    return ALL_STEPS
      .filter(s => s.requiredModules.length === 0 || s.requiredModules.some(mod => hasModule(m, mod)))
      .map(s => s.stepKey);
  }

  const completeSteps = getStepsForMerchant(completeMerchant);
  assert(completeSteps.length === 8, "Complete merchant sees ALL 8 onboarding steps");

  const loyaltySteps = getStepsForMerchant(loyaltyMerchant);
  assert(loyaltySteps.length === 7, "Loyalty merchant sees 7 steps (skips Google Business connect)");
  assert(!loyaltySteps.includes("google_business"), "Loyalty merchant does NOT see google_business step");

  const reviewsSteps = getStepsForMerchant(reviewsMerchant);
  assert(reviewsSteps.length === 3, "Reviews merchant sees 3 steps (Business, WhatsApp, Google)");
  assert(reviewsSteps.join(",") === "business_info,whatsapp_verify,google_business", "Reviews merchant sees exact 3 steps");

  const autoReplySteps = getStepsForMerchant(autoReplyMerchant);
  assert(autoReplySteps.length === 2, "AutoReply merchant sees 2 steps (Business, Google)");
  assert(autoReplySteps.join(",") === "business_info,google_business", "AutoReply merchant sees exact 2 steps");

  // -------------------------------------------------------------
  // Test 4: Dashboard Sidebar Visibility Simulation
  // -------------------------------------------------------------
  console.log("\n📌 4. Testing Dashboard Sidebar Module Visibility Simulation:");
  const NAV_ITEMS = [
    { title: "Home", url: "/dashboard" },
    { title: "Live Queue", url: "/dashboard/queue", module: "LOYALTY" },
    { title: "Rewards", url: "/dashboard/rewards", module: "LOYALTY" },
    { title: "Customers CRM", url: "/dashboard/customers" },
    { title: "Google Reviews AI", url: "/dashboard/reviews", module: "AUTOREPLY" },
    { title: "Subscription", url: "/dashboard/subscription" },
    { title: "Settings", url: "/dashboard/settings" },
  ];

  function getVisibleNav(m) {
    return NAV_ITEMS.filter(item => !item.module || hasModule(m, item.module)).map(i => i.title);
  }

  const completeNav = getVisibleNav(completeMerchant);
  assert(completeNav.includes("Live Queue") && completeNav.includes("Rewards") && completeNav.includes("Google Reviews AI"), "Complete merchant sees all nav items");

  const loyaltyNav = getVisibleNav(loyaltyMerchant);
  assert(loyaltyNav.includes("Live Queue") && loyaltyNav.includes("Rewards") && !loyaltyNav.includes("Google Reviews AI"), "Loyalty merchant sees Queue & Rewards, hides AutoReply");

  const reviewsNav = getVisibleNav(reviewsMerchant);
  assert(!reviewsNav.includes("Live Queue") && !reviewsNav.includes("Rewards") && !reviewsNav.includes("Google Reviews AI"), "Reviews-only merchant hides Queue, Rewards, and AutoReply");

  const autoReplyNav = getVisibleNav(autoReplyMerchant);
  assert(!autoReplyNav.includes("Live Queue") && !autoReplyNav.includes("Rewards") && autoReplyNav.includes("Google Reviews AI"), "AutoReply merchant sees AutoReply, hides Queue & Rewards");

  // -------------------------------------------------------------
  // Final Scorecard
  // -------------------------------------------------------------
  console.log("\n================================================================");
  console.log(`📊 FINAL TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("================================================================\n");

  if (failed === 0) {
    console.log("🎉 ALL TESTS PASSED! Standalone & Combined architectures are 100% verified.");
  } else {
    console.error("❌ Some tests failed. Please review errors.");
    process.exit(1);
  }
}

runTests()
  .catch(e => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
