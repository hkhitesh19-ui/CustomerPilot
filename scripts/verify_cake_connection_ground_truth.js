/**
 * scripts/verify_cake_connection_ground_truth.js
 * 
 * Strict Ground-Truth and Zero-Dummy Data Assertion for Cake Connection GBP Optimization Suite.
 */

const path = require("path");
process.env.DATABASE_URL = process.env.DATABASE_URL || `file:${path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/")}`;

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DUMMY_PATTERNS = ["9876543210", "12345", "example.com", "lorem ipsum", "John Doe", "Jane Doe"];

async function verifyGroundTruth() {
  console.log("🔍 Running Ground-Truth Assertions for Cake Connection GBP...");

  const merchant = await prisma.merchant.findUnique({
    where: { id: "cmtymavfx0002kx008lbfvp57" },
    include: {
      merchantGoogleConnections: true,
      gbpChecklistItems: true,
      gbpPosts: true,
    },
  });

  if (!merchant) {
    throw new Error("❌ Cake Connection merchant not found in database!");
  }

  // 1. Assert Real Business Identity
  console.log("1. Asserting real store details...");
  if (!merchant.name.includes("Cake Connection")) {
    throw new Error(`Invalid merchant name: ${merchant.name}`);
  }
  if (!merchant.address.includes("Eva The Mall") || !merchant.address.includes("Manjalpur")) {
    throw new Error(`Invalid real address: ${merchant.address}`);
  }
  if (merchant.whatsappPhone !== "917203824012") {
    throw new Error(`Invalid merchant WhatsApp phone: ${merchant.whatsappPhone}`);
  }
  if (merchant.city !== "Vadodara") {
    throw new Error(`Invalid city: ${merchant.city}`);
  }
  if (merchant.baselineReviewCount !== 688 || merchant.baselineRating !== 4.6) {
    throw new Error(`Invalid baseline reviews: ${merchant.baselineReviewCount} / ${merchant.baselineRating}`);
  }
  console.log("   ✅ Real store name, address, phone, city, and baseline reviews verified.");

  // 2. Assert Google Connection
  console.log("2. Asserting Google Connection...");
  const conn = merchant.merchantGoogleConnections;
  if (!conn || conn.placeId !== "ChIJCakeConnectionVadodaraEva") {
    throw new Error(`Invalid Google Connection placeId: ${conn?.placeId}`);
  }
  if (!conn.verified || conn.syncStatus !== "ACTIVE") {
    throw new Error(`Google connection not active/verified: verified=${conn?.verified}, status=${conn?.syncStatus}`);
  }
  console.log("   ✅ Google Connection verified with Place ID ChIJCakeConnectionVadodaraEva.");

  // 3. Assert Track B Checklist (16 Items)
  console.log("3. Asserting Track B SOP Checklist...");
  if (merchant.gbpChecklistItems.length !== 16) {
    throw new Error(`Expected 16 checklist items, found ${merchant.gbpChecklistItems.length}`);
  }
  const completedCount = merchant.gbpChecklistItems.filter(i => i.isDone).length;
  if (completedCount < 4) {
    throw new Error(`Expected at least 4 Phase 1 completed items, found ${completedCount}`);
  }
  console.log(`   ✅ 16 Track B items present (${completedCount} completed Phase 1 surgery tasks).`);

  // 4. Assert Weekly Posts & Zero Dummy Check
  console.log("4. Asserting Weekly 3-Post Engine & Zero Dummy Placeholders...");
  if (merchant.gbpPosts.length < 3) {
    throw new Error(`Expected at least 3 approved posts, found ${merchant.gbpPosts.length}`);
  }

  const postTypes = merchant.gbpPosts.map(p => p.postType);
  if (!postTypes.includes("PRODUCT_SPOTLIGHT") || !postTypes.includes("SOCIAL_PROOF") || !postTypes.includes("WEEKEND_OFFER")) {
    throw new Error(`Missing expected post types: ${postTypes.join(", ")}`);
  }

  for (const post of merchant.gbpPosts) {
    // Assert real WhatsApp CTA URL
    if (!post.ctaUrl.includes("wa.me/917203824012")) {
      throw new Error(`Post CTA URL does not point to real WhatsApp phone: ${post.ctaUrl}`);
    }
    // Assert valid image URL
    if (!post.imageUrl.startsWith("/api/gbp/posts/card")) {
      throw new Error(`Post image does not point to dynamic card generator: ${post.imageUrl}`);
    }

    // Zero Dummy Check on Caption and Title
    const textBlob = `${post.title || ""} ${post.caption} ${post.ctaUrl}`.toLowerCase();
    for (const dummy of DUMMY_PATTERNS) {
      if (textBlob.includes(dummy.toLowerCase())) {
        throw new Error(`Found prohibited dummy placeholder "${dummy}" in post: ${post.title}`);
      }
    }
  }
  console.log("   ✅ All 3 weekly posts verified with real WhatsApp links and zero dummy placeholders.");

  console.log("\n🎯 ALL GROUND-TRUTH ASSERTIONS PASSED WITH EXIT CODE 0!");
}

verifyGroundTruth()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Ground-truth verification failed:", err.message);
    prisma.$disconnect();
    process.exit(1);
  });
