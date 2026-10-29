const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const updates = [
  {
    planKey: "complete_monthly",
    name: "CustomerPilot Complete — Monthly (30 Days)",
    description: "Full CustomerPilot Complete suite for 30 days (₹14.97/day).",
    days: 30,
    price: 449,
    originalPrice: 898,
    discountPercent: 50,
    badge: "Monthly",
    popular: false,
    features: JSON.stringify([
      "All 4 Core Retention Engines",
      "30-Day WhatsApp Automations",
      "AI Google Reviews & AutoReply",
      "Digital Loyalty Stamp Cards",
      "Smart Digital Business Card",
      "Printable High-Res QR Code"
    ]),
    enabledModules: "LOYALTY,REVIEWS,AUTOREPLY,DIGITAL_CARD",
    currency: "INR",
    active: true
  },
  {
    planKey: "growth_180",
    name: "Starter Growth Plan (CustomerPilot Complete) (6 Months)",
    description: "Full CustomerPilot Complete suite for up to 1,000 VIP customers (₹13.88/day, ~₹417/mo).",
    days: 180,
    price: 2499,
    originalPrice: 4998,
    discountPercent: 50,
    badge: "⭐ Best Value",
    popular: false,
    active: true
  },
  {
    planKey: "enterprise_365",
    name: "Pro Scaling Plan (CustomerPilot Complete) (1 Year)",
    description: "Full CustomerPilot Complete suite for up to 2,500 VIP customers (₹13.42/day, ~₹408/mo).",
    days: 365,
    price: 4899,
    originalPrice: 9798,
    discountPercent: 50,
    badge: "Annual Pro",
    popular: true,
    active: true
  },
  {
    planKey: "loyalty_6mo",
    name: "Digital Loyalty Stamps & VIP Club — 6 Months",
    description: "WhatsApp digital loyalty stamp card and VIP rewards automation for 6 months (₹4.44/day).",
    days: 180,
    price: 799,
    originalPrice: 1598,
    discountPercent: 50,
    badge: "Loyalty (6 Mo)",
    popular: false,
    active: true
  },
  {
    planKey: "loyalty_yearly",
    name: "Digital Loyalty Stamps & VIP Club — 1 Year",
    description: "Full year of loyalty automation (₹3.56/day Billed yearly).",
    days: 365,
    price: 1299,
    originalPrice: 2598,
    discountPercent: 50,
    badge: "Loyalty (1 Year)",
    popular: false,
    active: true
  },
  {
    planKey: "reviews_6mo",
    name: "Smart Ai (SEO Optimized) Google Reviews [upto 1000 Reviews] — 6 Months",
    description: "Automated WhatsApp review collection with AI-drafted 5-star reviews [upto 1000 reviews] (₹3.05/day).",
    days: 180,
    price: 549,
    originalPrice: 1099,
    discountPercent: 50,
    badge: "Reviews (6 Mo)",
    popular: false,
    active: true
  },
  {
    planKey: "reviews_yearly",
    name: "Smart Ai (SEO Optimized) Google Reviews [upto 2500 Reviews] — 1 Year",
    description: "Full year automated review collection [upto 2500 reviews] (₹2.19/day Billed yearly).",
    days: 365,
    price: 799,
    originalPrice: 1599,
    discountPercent: 50,
    badge: "Reviews (1 Year)",
    popular: false,
    active: true
  },
  {
    planKey: "autoreply_6mo",
    name: "Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews — 6 Months",
    description: "AI-powered Google review replies published in 1-Click to Google Maps for 6 months (₹3.05/day).",
    days: 180,
    price: 549,
    originalPrice: 1099,
    discountPercent: 50,
    badge: "AutoReply (6 Mo)",
    popular: false,
    active: true
  },
  {
    planKey: "autoreply_yearly",
    name: "Ai Drafted (SEO Optimized) 1-Click AutoReply to GoogleReviews — 1 Year",
    description: "Full year of AI review replies published in 1-Click to Google Maps (₹2.19/day Billed yearly).",
    days: 365,
    price: 799,
    originalPrice: 1599,
    discountPercent: 50,
    badge: "AutoReply (1 Year)",
    popular: false,
    active: true
  },
  {
    planKey: "card_6mo",
    name: "Smart Digital Business Card — 6 Months",
    description: "Interactive Smart QR digital business card, 1-tap contact saving, direct Google review modal (₹1.94/day).",
    days: 180,
    price: 349,
    originalPrice: 699,
    discountPercent: 50,
    badge: "Starter (6 Mo)",
    popular: false,
    active: true
  },
  {
    planKey: "card_yearly",
    name: "Smart Digital Business Card — 1 Year",
    description: "Full year interactive digital business card with online ordering links, social profiles, and counter QR codes (₹1.37/day).",
    days: 365,
    price: 499,
    originalPrice: 1199,
    discountPercent: 58,
    badge: "⭐ Most Popular",
    popular: true,
    active: true
  },
  {
    planKey: "card_lifetime",
    name: "Smart Digital Business Card — Lifetime Deal",
    description: "Zero renewal fees forever. Pay once, keep your digital business card and QR code active for life (₹0.41/day).",
    days: 3650,
    price: 1499,
    originalPrice: 3999,
    discountPercent: 62,
    badge: "Lifetime Deal",
    popular: false,
    active: true
  }
];

async function main() {
  console.log("Updating subscription plans in database...");
  for (const item of updates) {
    const existing = await prisma.plan.findFirst({
      where: { OR: [{ planKey: item.planKey }, { name: item.name }] }
    });

    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: item
      });
      console.log(`Updated plan: ${item.planKey} -> ₹${item.price} (MRP: ₹${item.originalPrice})`);
    } else {
      await prisma.plan.create({
        data: item
      });
      console.log(`Created plan: ${item.planKey} -> ₹${item.price} (MRP: ₹${item.originalPrice})`);
    }
  }

  const all = await prisma.plan.findMany({ orderBy: { price: "asc" } });
  console.log("\nVerified plans in DB (low to high):");
  all.forEach(p => {
    console.log(`- ${p.planKey}: ₹${p.price} (MRP: ₹${p.originalPrice}, ${p.days}d) - ${p.name}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
