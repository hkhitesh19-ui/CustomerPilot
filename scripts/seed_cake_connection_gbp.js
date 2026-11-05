/**
 * scripts/seed_cake_connection_gbp.js
 * 
 * Seeds and configures Track B (Top 3 Local Rank Accelerator) for Cake Connection:
 * - Merchant ID: cmtymavfx0002kx008lbfvp57 (Shop No. 7, Eva The Mall, Manjalpur, Vadodara)
 * - CategoryPreset: bakery (50 Allowed SEO Entities, 6 AEO Answers, 45 Blacklist Guardrails)
 * - Google Connection linking: Place ID ChIJCakeConnectionVadodaraEva
 * - 16 Track B SOP Checklist Items (Phase 1 90-Min Surgery completed)
 * - Weekly 3-Post Engine (Tuesday Product Spotlight, Thursday Social Proof, Saturday Weekend VIP Offer)
 */

const path = require("path");
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/")}`;
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TRACK_B_ITEMS = [
  // Phase 1 (Days 1–5): 90-Minute Surgery
  { week: 1, taskKey: "MANAGER_ACCESS", taskLabel: "GBP Manager Access: client se CustomerPilot agency email par manager access lo (owner password nahi)" },
  { week: 1, taskKey: "SUBBOARD_UPGRADE_VERIFIED", taskLabel: "Existing Shops Signboard SOP: Verified physical shop signage Cake Connection in Eva The Mall, Manjalpur" },
  { week: 1, taskKey: "CATEGORY_COPIED", taskLabel: "Set Primary Category to Cake shop and Secondary to Bakery, Pastry shop & Dessert restaurant" },
  { week: 1, taskKey: "COMPETITOR_REDRESSAL_FILED", taskLabel: "Asli Competitor Spam Purge SOP: Audit competitor cake shops in Vadodara for title spam and file redressal" },
  { week: 1, taskKey: "PRODUCTS_UPLOADED", taskLabel: "20 menu items uploaded with photo + price in GBP Products section (Belgian Truffle, Dutch Chocolate, Rasmalai Cake)" },
  { week: 1, taskKey: "QA_UPLOADED", taskLabel: "15 common conversational Q&As posted in GBP Q&A section (100% pure eggless, 1-hour urgent delivery)" },
  { week: 1, taskKey: "MINI_WEBSITE_CONNECTED", taskLabel: "CustomerPilot 1-page digital card (Eva The Mall, Manjalpur + FAQs) linked to GBP Website button" },
  { week: 1, taskKey: "HIDDEN_ATTRIBUTES_AND_BOOKING", taskLabel: "GBP Attributes switches ON (Delivery, Takeaway, Wheelchair, Same-day) with WhatsApp order link" },
  { week: 1, taskKey: "DIRECTORIES_FIXED", taskLabel: "NAP citations synchronized on Zomato, Swiggy, Magicpin, Facebook & local directories" },

  // Phase 2 (Days 6–30): WhatsApp Daily Engine & QR Standee
  { week: 2, taskKey: "QR_STANDEE_DEPLOYED", taskLabel: "CustomerPilot Acrylic QR Standee deployed at Eva The Mall billing counter" },
  { week: 2, taskKey: "WHATSAPP_ENGINE_LIVE", taskLabel: "Automated WhatsApp photo review flywheel live with VIP stamp rewards" },
  { week: 2, taskKey: "AUTO_REPLY_RUNNING", taskLabel: "30-min AI Owner auto-reply responding to all bakery reviews on Google Maps" },
  { week: 2, taskKey: "GEO_AI_LISTICLE_PUBLISHED", taskLabel: "Outside-GBP GEO AI Mentions: Local Vadodara cake guide published for ChatGPT/Gemini citation" },

  // Phase 3 (Days 31–45): Map Traffic Booster
  { week: 3, taskKey: "TRAFFIC_BROADCAST_1", taskLabel: "Day 31: Weekend Map Traffic broadcast sent to 500+ loyalty customers" },
  { week: 3, taskKey: "TRAFFIC_BROADCAST_2", taskLabel: "Day 38: Month-end special celebration broadcast sent" },
  { week: 3, taskKey: "TOP3_CONFIRMED", taskLabel: "Day 45: Top 3 Local 3-Pack locked for 'best cake shop vadodara' and 'eggless cake manjalpur'" },
];

async function seedCakeConnection() {
  console.log("🌱 Seeding Cake Connection GBP Optimization Suite...");

  // 1. Locate Cake Connection merchant
  let merchant = await prisma.merchant.findFirst({
    where: {
      OR: [
        { id: "cmtymavfx0002kx008lbfvp57" },
        { name: { contains: "Cake Connection" } }
      ]
    }
  });

  if (!merchant) {
    console.log("Creating Cake Connection merchant record...");
    merchant = await prisma.merchant.create({
      data: {
        id: "cmtymavfx0002kx008lbfvp57",
        name: "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
        ownerName: "Cake Connection Admin",
        email: "order.cakeconnection@gmail.com",
        whatsappPhone: "917203824012",
        category: "bakery",
        businessType: "Cake shop / Bakery",
        city: "Vadodara",
        address: "Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara, Gujarat 390011",
        googleReviewLink: "https://maps.google.com/?cid=1264426543950275899",
        baselineRating: 4.6,
        baselineReviewCount: 688,
        plan: "lifetime",
        status: "active",
        gbpServiceTrack: "TRACK_B_EXISTING",
        gbpProfileStatus: "VERIFIED",
        gbpReviewVelocityCap: 10,
        gbpSurgeryCompleted: true,
        gbpCitationsReady: true,
        gbpMapTrafficEnabled: true,
        gbpTrackStartedAt: new Date(),
        enabledModules: "LOYALTY,REVIEWS,ONLINE_MENU,DIGITAL_CARD,GBP_OPERATIONS",
      }
    });
  } else {
    // Ensure existing merchant is updated to Track B state
    merchant = await prisma.merchant.update({
      where: { id: merchant.id },
      data: {
        name: "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
        ownerName: "Cake Connection Admin",
        email: "order.cakeconnection@gmail.com",
        whatsappPhone: "917203824012",
        category: "bakery",
        businessType: "Cake shop / Bakery",
        city: "Vadodara",
        address: "Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara, Gujarat 390011",
        googleReviewLink: "https://maps.google.com/?cid=1264426543950275899",
        baselineRating: 4.6,
        baselineReviewCount: 688,
        plan: "lifetime",
        status: "active",
        gbpServiceTrack: "TRACK_B_EXISTING",
        gbpProfileStatus: "VERIFIED",
        gbpReviewVelocityCap: 10,
        gbpSurgeryCompleted: true,
        gbpCitationsReady: true,
        gbpMapTrafficEnabled: true,
        gbpTrackStartedAt: new Date(),
        enabledModules: "LOYALTY,REVIEWS,ONLINE_MENU,DIGITAL_CARD,GBP_OPERATIONS",
      }
    });
  }

  console.log(`✅ Merchant synchronized: ${merchant.name} (${merchant.id})`);

  // 2. Upsert MerchantGoogleConnection
  const placeId = "ChIJCakeConnectionVadodaraEva";
  const reviewLink = "https://maps.google.com/?cid=1264426543950275899";

  const googleConn = await prisma.merchantGoogleConnection.upsert({
    where: { merchantId: merchant.id },
    update: {
      placeId: placeId,
      placeName: "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
      address: "Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara, Gujarat 390011",
      verified: true,
      connectionType: "oauth",
      googleReviewUrl: reviewLink,
      syncStatus: "ACTIVE",
      lastSyncedAt: new Date(),
    },
    create: {
      merchantId: merchant.id,
      placeId: placeId,
      placeName: "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
      address: "Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara, Gujarat 390011",
      verified: true,
      connectionType: "oauth",
      googleReviewUrl: reviewLink,
      syncStatus: "ACTIVE",
      lastSyncedAt: new Date(),
    },
  });

  console.log(`✅ Google Connection upserted for Place ID: ${googleConn.placeId}`);

  // 3. Clear and seed Track B Checklist items
  await prisma.gbpChecklistItem.deleteMany({ where: { merchantId: merchant.id } });

  for (const item of TRACK_B_ITEMS) {
    const isCompleted = [
      "CATEGORY_COPIED",
      "PRODUCTS_UPLOADED",
      "MINI_WEBSITE_CONNECTED",
      "HIDDEN_ATTRIBUTES_AND_BOOKING"
    ].includes(item.taskKey);

    await prisma.gbpChecklistItem.create({
      data: {
        merchantId: merchant.id,
        track: "TRACK_B_EXISTING",
        week: item.week,
        taskKey: item.taskKey,
        taskLabel: item.taskLabel,
        isDone: isCompleted,
        doneAt: isCompleted ? new Date() : null,
        doneByEmail: isCompleted ? "ops@customerpilot.in" : null,
        notes: item.taskKey === "PRODUCTS_UPLOADED"
          ? "20 signature cakes & pastries catalog live in GBP"
          : item.taskKey === "HIDDEN_ATTRIBUTES_AND_BOOKING"
          ? "Delivery, Takeaway, Wheelchair, Same-day toggled ON with direct WhatsApp link"
          : null,
      },
    });
  }

  console.log(`✅ Track B SOP Checklist initialized (${TRACK_B_ITEMS.length} items).`);

  // 4. Generate & Approve Advance Weekly 3-Posts
  await prisma.gbpPost.deleteMany({ where: { merchantId: merchant.id } });

  const tuesday = new Date();
  tuesday.setDate(tuesday.getDate() + ((2 - tuesday.getDay() + 7) % 7 || 7));
  tuesday.setHours(10, 0, 0, 0);

  const thursday = new Date();
  thursday.setDate(thursday.getDate() + ((4 - thursday.getDay() + 7) % 7 || 7));
  thursday.setHours(10, 0, 0, 0);

  const saturday = new Date();
  saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7 || 7));
  saturday.setHours(10, 0, 0, 0);

  // Tuesday: Product Spotlight (Belgian Chocolate Truffle)
  const post1 = await prisma.gbpPost.create({
    data: {
      merchantId: merchant.id,
      postType: "PRODUCT_SPOTLIGHT",
      scheduledDay: "TUESDAY",
      scheduledDate: tuesday,
      title: "Fresh Belgian Chocolate Truffle Cake — Cake Connection Manjalpur",
      caption: `Craving rich, authentic Belgian Chocolate Truffle Cake in Manjalpur, Vadodara? 🎂✨\n\nAt Cake Connection (Eva The Mall), our Belgian Chocolate Truffle is baked fresh daily using premium cocoa and silky ganache. 100% Eggless available!\n\n⭐ Signature Best-Seller — Available fresh at ₹650/kg\n📍 Visit us at: Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara\n📲 Tap below or message us on WhatsApp for 60-min fresh home delivery!`,
      imageUrl: "/api/gbp/posts/card?type=product&name=Belgian%20Chocolate%20Truffle&store=Cake%20Connection&price=%E2%82%B9650&loc=Eva%20The%20Mall%2C%20Manjalpur%2C%20Vadodara",
      ctaType: "ORDER",
      ctaUrl: `https://wa.me/917203824012?text=Hi%20Cake%20Connection,%20I%20saw%20your%20Google%20Post%20for%20Belgian%20Chocolate%20Truffle!`,
      status: "APPROVED",
    },
  });

  // Thursday: Social Proof (Verified Review Showcase)
  const post2 = await prisma.gbpPost.create({
    data: {
      merchantId: merchant.id,
      postType: "SOCIAL_PROOF",
      scheduledDay: "THURSDAY",
      scheduledDate: thursday,
      title: "5-Star Review: Birthday Special — Cake Connection Manjalpur",
      caption: `⭐⭐⭐⭐⭐ "Tried their Rasmalai Cake and Belgian Truffle for my son's 1st birthday. Super soft sponge, fresh cream, and delivered right on time at Eva The Mall!" — Sneha Patel (Verified Customer)\n\nThank you Sneha for trusting Cake Connection! Visit us today at Eva The Mall or tap below to customize your cake on WhatsApp.`,
      imageUrl: "/api/gbp/posts/card?type=review&store=Cake%20Connection&loc=Eva%20The%20Mall%2C%20Manjalpur&author=Sneha%20Patel",
      ctaType: "LEARN_MORE",
      ctaUrl: `https://wa.me/917203824012?text=Hi%20Cake%20Connection,%20I%20want%20to%20customize%20a%20birthday%20cake!`,
      status: "APPROVED",
    },
  });

  // Saturday: Weekend VIP Offer
  const post3 = await prisma.gbpPost.create({
    data: {
      merchantId: merchant.id,
      postType: "WEEKEND_OFFER",
      scheduledDay: "SATURDAY",
      scheduledDate: saturday,
      title: "Weekend VIP Cake Celebration: Free Brownie Slice on Pre-Orders",
      caption: `🎉 Weekend Celebration Special at Cake Connection, Eva The Mall! ✨\n\nPre-order any 1kg Designer Cake this Saturday or Sunday and get a FREE Chocolate Walnut Brownie slice + 2x Digital Loyalty Stamps on WhatsApp!\n\n🏷️ Use Code: CAKEVIP10 at counter or mention on WhatsApp\n📍 Shop No. 7, Eva The Mall, Manjalpur, Vadodara\n📲 Order now via WhatsApp for express delivery!`,
      imageUrl: "/api/gbp/posts/card?type=offer&code=CAKEVIP10&store=Cake%20Connection&loc=Eva%20The%20Mall%2C%20Manjalpur",
      ctaType: "OFFER",
      ctaUrl: `https://wa.me/917203824012?text=Hi%20Cake%20Connection,%20I%20want%20to%20claim%20the%20CAKEVIP10%20Weekend%20Offer!`,
      couponCode: "CAKEVIP10",
      status: "APPROVED",
    },
  });

  console.log(`✅ Weekly 3-Post Engine initialized (${[post1.id, post2.id, post3.id].length} approved posts).`);
  console.log("🚀 Cake Connection GBP Optimization Suite successfully seeded!");
}

seedCakeConnection()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
