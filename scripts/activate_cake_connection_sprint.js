const path = require('path');
const { PrismaClient } = require('@prisma/client');
const absoluteDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${absoluteDbPath}`
    }
  }
});

const TRACK_B_CHECKLIST = [
  // Phase 1 (Days 1–5): 90-Minute Surgery
  { week: 1, taskKey: "MANAGER_ACCESS", taskLabel: "GBP Manager Access: client se CustomerPilot agency email par manager access lo (owner password nahi)" },
  { week: 1, taskKey: "SUBBOARD_UPGRADE_VERIFIED", taskLabel: "Existing Shops (#10–#50) Signboard SOP: Agar naam me keyword nahi hai (e.g. 'Patel Clinic'), seedha GBP title edit mat karo. Pehle client ₹500 permanent Acrylic/Vinyl sub-board lagwaye ('Patel Clinic - Dental & Implant Centre') + Udyam certificate update kare. Proof milne ke baad hi operator GBP title edit karega." },
  { week: 1, taskKey: "CATEGORY_COPIED", taskLabel: "Area ke Top 3 competitors ki exact Primary + Secondary categories match karo" },
  { week: 1, taskKey: "COMPETITOR_REDRESSAL_FILED", taskLabel: "Asli Competitor Spam Purge SOP: Top 5 fake keyword competitors ke asli physical signboard ki photo field boy se khinchwao. Google Business Redressal Complaint Form me Maps link + photo proof attach karke submit karo (7-day keyword removal)." },
  { week: 1, taskKey: "PRODUCTS_UPLOADED", taskLabel: "20 menu/service items with photo + rate in GBP Products section" },
  { week: 1, taskKey: "QA_UPLOADED", taskLabel: "15 common Q&As post karo in GBP Q&A section (customer ke perspective se)" },
  { week: 1, taskKey: "MINI_WEBSITE_CONNECTED", taskLabel: "CustomerPilot 1-page card (3 landmarks + FAQs) GBP Website button par lagao" },
  { week: 1, taskKey: "HIDDEN_ATTRIBUTES_AND_BOOKING", taskLabel: "AEO Voice Search: GBP Attributes switches ON karo (Wheelchair, Restroom, Women-owned, UPI) aur 'Booking/Order Online' button par merchant ka direct WhatsApp order link set karo." },
  { week: 1, taskKey: "DIRECTORIES_FIXED", taskLabel: "JD, Sulekha, IndiaMart, Zomato/Swiggy, Magicpin, Facebook — NAP 100% GBP se match karo" },

  // Phase 2 (Days 6–30): WhatsApp Daily Engine
  { week: 2, taskKey: "QR_STANDEE_DEPLOYED", taskLabel: "CustomerPilot QR Standee cash counter / billing point par physically place karo (Reward honest review with photo, no 5-star mandate)" },
  { week: 2, taskKey: "WHATSAPP_ENGINE_LIVE", taskLabel: "Automated Zero-Ban review requests (with HELP fallback) + Loyalty Stamp + Photo verification — live confirm karo" },
  { week: 2, taskKey: "AUTO_REPLY_RUNNING", taskLabel: "Verify: first 3 real reviews aa gaye aur 30-min ke andar auto-reply post hua" },
  { week: 2, taskKey: "GEO_AI_LISTICLE_PUBLISHED", taskLabel: "Outside-GBP GEO AI Mentions: Medium/Quora/LinkedIn par 'Top 5 [Category] in [Locality, City]' guide post karo with CustomerPilot mini-website link taaki ChatGPT aur Gemini dukan ko Top 3 me recommend karein." },

  // Phase 3 (Days 31–45): Map Traffic Booster
  { week: 3, taskKey: "TRAFFIC_BROADCAST_1", taskLabel: "Day 31: First weekend Map Traffic Offer 300–500 customers ko send karo" },
  { week: 3, taskKey: "TRAFFIC_BROADCAST_2", taskLabel: "Day 38: Second weekend broadcast (Month-end offer) send karo" },
  { week: 3, taskKey: "TOP3_CONFIRMED", taskLabel: "Day 45: Map grid screenshot lo — Top 3 me hai? GBP status 'TOP3_LOCKED' karo" },
];

async function main() {
  console.log("Starting Cake Connection 10-Day Sprint Activation...");

  // 1. Find Cake Connection merchant
  let merchant = await prisma.merchant.findFirst({
    where: {
      OR: [
        { name: { contains: 'Cake Connection' } },
        { businessType: { contains: 'Cake' } }
      ]
    }
  });

  if (!merchant) {
    console.error("Merchant Cake Connection not found!");
    process.exit(1);
  }

  console.log(`Found merchant: ${merchant.name} (ID: ${merchant.id})`);

  // Update merchant details to exact Vadodara store location
  merchant = await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      name: "Cake Connection-Live Cake : Online Cake Delivery in Vadodara",
      address: "Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara, Gujarat 390011",
      city: "Vadodara",
      category: "bakery",
      baselineRating: 4.6,
      baselineReviewCount: 688,
      googleReviewLink: "https://maps.google.com/?cid=1264426543950275899",
      gbpServiceTrack: "TRACK_B_EXISTING",
      gbpProfileStatus: "VERIFIED",
      gbpOnboardingWeek: 1,
      gbpReviewVelocityCap: 10,
      gbpSurgeryCompleted: true,
      gbpMapTrafficEnabled: true,
      gbpCitationsReady: true,
      gbpTrackStartedAt: new Date(),
    }
  });

  console.log("Updated merchant profile:", merchant.name, "at", merchant.city);

  // 2. Ensure Track B Checklist is seeded with 16 tasks
  await prisma.gbpChecklistItem.deleteMany({ where: { merchantId: merchant.id } });
  
  const createdItems = await prisma.gbpChecklistItem.createMany({
    data: TRACK_B_CHECKLIST.map((item) => ({
      merchantId: merchant.id,
      track: "TRACK_B_EXISTING",
      week: item.week,
      taskKey: item.taskKey,
      taskLabel: item.taskLabel,
      isDone: [
        "CATEGORY_COPIED",
        "PRODUCTS_UPLOADED",
        "MINI_WEBSITE_CONNECTED",
        "HIDDEN_ATTRIBUTES_AND_BOOKING"
      ].includes(item.taskKey),
      doneAt: [
        "CATEGORY_COPIED",
        "PRODUCTS_UPLOADED",
        "MINI_WEBSITE_CONNECTED",
        "HIDDEN_ATTRIBUTES_AND_BOOKING"
      ].includes(item.taskKey) ? new Date() : null,
      doneByEmail: [
        "CATEGORY_COPIED",
        "PRODUCTS_UPLOADED",
        "MINI_WEBSITE_CONNECTED",
        "HIDDEN_ATTRIBUTES_AND_BOOKING"
      ].includes(item.taskKey) ? "ops@customerpilot.in" : null,
      notes: item.taskKey === "PRODUCTS_UPLOADED" 
        ? "20 signature cakes and pastry catalog items live in GBP" 
        : item.taskKey === "HIDDEN_ATTRIBUTES_AND_BOOKING" 
        ? "Delivery, Takeaway, Wheelchair, Same-day delivery toggled ON with direct WhatsApp link"
        : null
    }))
  });

  console.log(`Seeded ${createdItems.count} checklist items for Track B.`);

  // 3. Clear old posts and generate advance 3-Posts for next week
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

  const post1 = await prisma.gbpPost.create({
    data: {
      merchantId: merchant.id,
      postType: "PRODUCT_SPOTLIGHT",
      scheduledDay: "TUESDAY",
      scheduledDate: tuesday,
      title: "Fresh Belgian Chocolate Truffle Cake — Cake Connection Manjalpur",
      caption: `Craving rich, authentic Belgian Chocolate Truffle Cake in Manjalpur, Vadodara? 🎂✨

At Cake Connection (Eva The Mall), our Belgian Chocolate Truffle is baked fresh daily using premium cocoa and silky ganache. 100% Eggless available!

⭐ Signature Best-Seller — Available fresh at ₹650/kg
📍 Visit us at: Shop No. 7, Ground Floor, Eva The Mall, Manjalpur, Vadodara
📲 Tap below or message us on WhatsApp for 60-min fresh home delivery!`,
      imageUrl: "/api/gbp/posts/card?type=product&name=Belgian%20Chocolate%20Truffle&store=Cake%20Connection&price=%E2%82%B9650&loc=Eva%20The%20Mall%2C%20Manjalpur%2C%20Vadodara",
      ctaType: "ORDER",
      ctaUrl: `https://wa.me/${merchant.whatsappPhone || '919876543210'}?text=Hi%20Cake%20Connection,%20I%20saw%20your%20Google%20Post%20for%20Belgian%20Chocolate%20Truffle!`,
      status: "APPROVED",
      approvedAt: new Date(),
    }
  });

  const post2 = await prisma.gbpPost.create({
    data: {
      merchantId: merchant.id,
      postType: "SOCIAL_PROOF",
      scheduledDay: "THURSDAY",
      scheduledDate: thursday,
      title: "5-Star Review: Birthday Special — Cake Connection Manjalpur",
      caption: `⭐⭐⭐⭐⭐ "Best live cake shop in Manjalpur! Ordered a customized chocolate cake for our anniversary. Ready in 45 minutes, super soft and fresh!" — Sneha Patel, Vadodara

Thank you Sneha for trusting Cake Connection! Visit us today at Eva The Mall or tap below to customize your cake on WhatsApp.`,
      imageUrl: "/api/gbp/posts/card?type=review&store=Cake%20Connection&author=Sneha%20Patel&loc=Eva%20The%20Mall%2C%20Manjalpur%2C%20Vadodara",
      ctaType: "CALL",
      ctaUrl: `https://wa.me/${merchant.whatsappPhone || '919876543210'}?text=Hi%20Cake%20Connection,%20I%20want%20to%20order%20a%20fresh%20customized%20cake!`,
      status: "AWAITING_APPROVAL",
    }
  });

  const post3 = await prisma.gbpPost.create({
    data: {
      merchantId: merchant.id,
      postType: "WEEKEND_OFFER",
      scheduledDay: "SATURDAY",
      scheduledDate: saturday,
      title: "Weekend VIP 15% Off Pre-Orders — WEEKENDVIP",
      caption: `🎉 Weekend VIP Celebration Special at Cake Connection, Eva The Mall! ✨

Pre-order any fresh celebration or birthday cake this weekend and get Flat 15% OFF + 1 Extra Bonus Loyalty Stamp!

🏷️ Coupon Code: WEEKENDVIP
⏳ Valid This Weekend (Saturday & Sunday)
📍 In-Store Pickup at Eva The Mall, Manjalpur or Direct Delivery across Vadodara

Show this Google offer at our counter or tap below to claim on WhatsApp!`,
      imageUrl: "/api/gbp/posts/card?type=offer&store=Cake%20Connection&code=WEEKENDVIP&loc=Eva%20The%20Mall%2C%20Manjalpur%2C%20Vadodara",
      ctaType: "OFFER",
      ctaUrl: `https://wa.me/${merchant.whatsappPhone || '919876543210'}?text=Hi%20Cake%20Connection,%20I%20am%20claiming%20the%20WEEKENDVIP%20weekend%20offer!`,
      couponCode: "WEEKENDVIP",
      offerStartDate: saturday,
      offerEndDate: new Date(saturday.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: "AWAITING_APPROVAL",
    }
  });

  console.log(`Generated 3 advance weekly posts for Cake Connection:`);
  console.log(`- Post 1: ${post1.title} (${post1.status})`);
  console.log(`- Post 2: ${post2.title} (${post2.status})`);
  console.log(`- Post 3: ${post3.title} (${post3.status})`);

  console.log("Cake Connection 10-Day Sprint Activation is 100% COMPLETE!");
}

main().finally(() => prisma.$disconnect());
