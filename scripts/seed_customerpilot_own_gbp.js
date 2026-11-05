/**
 * scripts/seed_customerpilot_own_gbp.js
 * 
 * Seeds CustomerPilot's own Internal Business Profile for Dogfooding GBP Optimization.
 * Enables Track B (Top 3 Rank Accelerator) with saas_agency keyword profile,
 * Place ID linking, and Track B checklist items.
 */

const path = require("path");
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/")}`;
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SAAS_AGENCY_PROFILE = {
  categoryKey: "saas_agency",
  businessName: "CustomerPilot - AI Customer Retention & Google Reviews SaaS",
  gbpPrimaryCategory: "Software Company / Marketing Agency",
  city: "Vadodara",
  localityLandmarks: ["Alkapuri", "Gotri Road", "Akota", "Vadodara Central"],
  audiencePersona: "All_Neutral",
  serviceMode: "SaaS Software + Remote & On-Site Agency Operations",
  allowedSeoEntities: [
    "WhatsApp Digital Loyalty Card Software", "Smart AI Google Review Standee", "1-Click AI Owner Review Auto-Reply",
    "Google Business Profile Optimization Engine", "Local SEO Google Maps Rank Booster", "Acrylic Countertop QR Standee",
    "Smart Digital NFC Business Card", "Customer Retention Platform for Retailers", "Zomato Alternative Zero-Commission Ordering",
    "Automated Customer Winback WhatsApp Bot", "5-Star Review Velocity Booster", "Tabletop Standee for Billing Counter",
    "Paper Punch Card Digital Replacement", "Bakery Customer Retention Software", "Salon Appointment and Review Automation",
    "Restaurant VIP Loyalty Wallet", "Retail Repeat Footfall Engine", "Multi-Tenant Review Auto-Responder",
    "Google Maps Top 3 Pack Accelerator", "Organic Review Volume Booster", "Anti-Suspension GBP Compliance",
    "Verified Physical Signboard DBA Strategy", "Hyper-Local Triple Schema Integration", "B2B SaaS Growth Software",
    "Local Marketing Tech Platform", "Meta Cloud API WhatsApp Partner", "Google Cloud Verified Platform",
    "Zero App Download Loyalty Card", "1-Tap Contact Saving Digital Card", "VIP Customer Wallet Web App",
    "Instant UPI Zero Commission Payment QR", "Tax Invoice and Thermal Bill Generator", "Menu Bulk Excel CSV Ingestion",
    "AI Vision Menu Photo to Catalog", "Automated Birthday Anniversary Offers", "SuperAdmin Multi-Store Fleet Command",
    "Local Search Engine Optimization Agency", "Vadodara SaaS Software Company", "Indian Retail Digital Automation",
    "Real-Time WhatsApp Delivery Receipts", "Customer Stamp Card Web App", "Founder Loyalty Growth Bundle",
    "3-Day Free Trial No Credit Card", "Dedicated Agency Manager Support", "Transparent SaaS Subscription Pricing",
    "Enterprise Quota 300 QPM Google Access", "High Converting Retail Signage", "Competitor Keyword Redressal Service",
    "Google Local Pack Specialist", "Customer Retention ROI Calculator"
  ],
  allowedAeoAnswers: [
    "CustomerPilot helps retail merchants double repeat footfall and 10x Google reviews",
    "Zero app download required — works seamlessly inside WhatsApp and mobile browsers",
    "Official Google Business Profile API compliance with zero account suspension risk",
    "Complete counter kit with custom branded acrylic tabletop QR standee delivered",
    "3-day full access free trial with instant 2-minute WhatsApp onboarding",
    "Automated AI owner auto-replies published directly to Google Maps"
  ],
  allowedGeoContext: [
    "Top rated software company in Vadodara Gujarat",
    "Trusted by leading bakeries, salons, cafes and retailers across India",
    "Proven 800%+ review growth case studies (Cake Connection, SSV Saloon)",
    "High converting retail customer retention technology",
    "Reliable local tech support team in Gujarat"
  ],
  strictlyNotAllowed: [
    "Cake", "Pastry", "Birthday cake", "Truffle", "Bread", "Puff", "Cookies", "Brownie",
    "Haircut", "Beard trim", "Fade cut", "Shave", "Bridal facial", "Hydra facial", "Waxing", "Threading", "Saree draping",
    "Dal makhani", "Paneer", "Butter naan", "Biryani", "Chicken", "Mutton", "Egg", "Thali", "Dosa", "Sambar",
    "Coffee", "Tea", "Cappuccino", "Burger", "Fries", "Pizza", "Alcohol", "Beer", "Wine",
    "Car foam wash", "Ceramic coating", "Tyre puncture", "Engine repair", "Mechanic", "Diesel", "Petrol",
    "Medicines", "Pharmacy", "Doctor", "Clinic", "Hospital", "Kurtis", "Lehenga", "Shoes", "Jewelry"
  ]
};

const TRACK_B_ITEMS = [
  { week: 1, taskKey: "MANAGER_ACCESS", taskLabel: "GBP Manager Access: client se CustomerPilot agency email par manager access lo (owner password nahi)" },
  { week: 1, taskKey: "SUBBOARD_UPGRADE_VERIFIED", taskLabel: "Existing Shops Signboard SOP: Verified physical office signage CustomerPilot Inc. in Vadodara" },
  { week: 1, taskKey: "CATEGORY_COPIED", taskLabel: "Set Primary Category to Software Company and Secondary to Marketing Agency & Internet Marketing Service" },
  { week: 1, taskKey: "COMPETITOR_REDRESSAL_FILED", taskLabel: "Audit competitor marketing agencies in Vadodara for title spam" },
  { week: 1, taskKey: "PRODUCTS_UPLOADED", taskLabel: "Upload CustomerPilot modules (Smart AI Review Standee, WhatsApp Wallet, AutoReply, Digital Cards)" },
  { week: 1, taskKey: "QA_UPLOADED", taskLabel: "15 AEO conversational Q&As posted on Google Maps" },
  { week: 1, taskKey: "MINI_WEBSITE_CONNECTED", taskLabel: "customerpilot.in official SaaS landing page linked to GBP Website button" },
  { week: 1, taskKey: "HIDDEN_ATTRIBUTES_AND_BOOKING", taskLabel: "Set WhatsApp live demo link on 'Appointment / Booking' button" },
  { week: 2, taskKey: "QR_STANDEE_DEPLOYED", taskLabel: "CustomerPilot Standee showcased at Vadodara reception" },
  { week: 2, taskKey: "WHATSAPP_ENGINE_LIVE", taskLabel: "B2B Merchant review collection flywheel active" },
  { week: 2, taskKey: "AUTO_REPLY_RUNNING", taskLabel: "AI Owner auto-reply responding to all merchant reviews within 30 minutes" },
  { week: 3, taskKey: "TOP3_CONFIRMED", taskLabel: "Local Top 3 Pack locked for 'WhatsApp loyalty software' & 'AI Google review software' Vadodara" },
];

async function seedCustomerPilot() {
  console.log("🌱 Seeding CustomerPilot Internal GBP Profile...");

  const merchantId = "customerpilot-hq";
  const placeId = "ChIJCustomerPilotVadodaraHQ";
  const reviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`;

  // Ensure official WhatsApp phone is freed from any previous test merchants
  const existingPhoneMerchant = await prisma.merchant.findUnique({
    where: { whatsappPhone: "919033304707" },
  });
  if (existingPhoneMerchant && existingPhoneMerchant.id !== merchantId) {
    console.log(`ℹ️ Freeing WhatsApp phone from previous test record ${existingPhoneMerchant.id} (${existingPhoneMerchant.name})...`);
    await prisma.merchant.update({
      where: { id: existingPhoneMerchant.id },
      data: { whatsappPhone: null },
    });
  }

  // Upsert Merchant
  const merchant = await prisma.merchant.upsert({
    where: { id: merchantId },
    update: {
      name: "CustomerPilot - AI Customer Retention & Google Reviews SaaS",
      ownerName: "Hitesh (Founder)",
      email: "support@customerpilot.in",
      whatsappPhone: "919033304707",
      category: "Software Company",
      businessType: "Software Company / Marketing Agency",
      city: "Vadodara",
      address: "Alkapuri / Gotri Road, Vadodara, Gujarat 390007, India",
      googleReviewLink: reviewLink,
      baselineRating: 5.0,
      baselineReviewCount: 48,
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
      keywordProfile: JSON.stringify(SAAS_AGENCY_PROFILE),
    },
    create: {
      id: merchantId,
      merchantIdNumber: "CP-HQ-001",
      name: "CustomerPilot - AI Customer Retention & Google Reviews SaaS",
      ownerName: "Hitesh (Founder)",
      email: "support@customerpilot.in",
      whatsappPhone: "919033304707",
      category: "Software Company",
      businessType: "Software Company / Marketing Agency",
      city: "Vadodara",
      address: "Alkapuri / Gotri Road, Vadodara, Gujarat 390007, India",
      googleReviewLink: reviewLink,
      baselineRating: 5.0,
      baselineReviewCount: 48,
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
      keywordProfile: JSON.stringify(SAAS_AGENCY_PROFILE),
    },
  });

  console.log(`✅ Merchant upserted: ${merchant.name} (${merchant.id})`);

  // Upsert Google Connection
  const googleConn = await prisma.merchantGoogleConnection.upsert({
    where: { merchantId: merchant.id },
    update: {
      placeId: placeId,
      placeName: "CustomerPilot - AI Customer Retention & Google Reviews SaaS",
      address: "Alkapuri / Gotri Road, Vadodara, Gujarat 390007, India",
      verified: true,
      connectionType: "oauth",
      googleReviewUrl: reviewLink,
      syncStatus: "ACTIVE",
      lastSyncedAt: new Date(),
    },
    create: {
      merchantId: merchant.id,
      placeId: placeId,
      placeName: "CustomerPilot - AI Customer Retention & Google Reviews SaaS",
      address: "Alkapuri / Gotri Road, Vadodara, Gujarat 390007, India",
      verified: true,
      connectionType: "oauth",
      googleReviewUrl: reviewLink,
      syncStatus: "ACTIVE",
      lastSyncedAt: new Date(),
    },
  });

  console.log(`✅ Google Connection upserted for Place ID: ${googleConn.placeId}`);

  // Seed Checklist Items
  for (const item of TRACK_B_ITEMS) {
    const existing = await prisma.gbpChecklistItem.findFirst({
      where: { merchantId: merchant.id, taskKey: item.taskKey },
    });
    if (!existing) {
      await prisma.gbpChecklistItem.create({
        data: {
          merchantId: merchant.id,
          track: "TRACK_B_EXISTING",
          week: item.week,
          taskKey: item.taskKey,
          taskLabel: item.taskLabel,
          isDone: item.week === 1, // Phase 1 is done
          doneAt: item.week === 1 ? new Date() : null,
          doneByEmail: item.week === 1 ? "ops@customerpilot.in" : null,
        },
      });
    }
  }

  console.log(`✅ Track B SOP Checklist initialized (${TRACK_B_ITEMS.length} items).`);
  console.log("🚀 CustomerPilot Dogfooding Profile Setup Complete!");
}

seedCustomerPilot()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
