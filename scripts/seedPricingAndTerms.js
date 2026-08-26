const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_TERMS = `
# CustomerPilot Merchant Terms of Service & Agreement

**Effective Date:** 01 August 2026  
**Last Updated:** 11 August 2026  

Welcome to **CustomerPilot**. By registering your business, generating a loyalty QR code, or subscribing to any paid plan, you (the "Merchant") agree to be bound by the following Terms & Conditions.

---

### 1. Description of Service
CustomerPilot provides an AI-powered customer retention, WhatsApp loyalty stamp card, and automated review management platform designed to help local retail stores, cafes, restaurants, salons, and businesses engage repeat customers.

---

### 2. Merchant Responsibilities
- **Accurate Business Information:** You agree to maintain accurate business profile details (store name, timing, category, contact information).
- **Loyalty Program Honesty:** When customers achieve the required number of loyalty stamps, you agree to honor the promised reward (e.g., Free Product/Discount) in good faith.
- **WhatsApp Messaging Compliance:** Messages sent through CustomerPilot must only be directed to customers who voluntarily scan your in-store QR code or opt-in for your loyalty club. You agree not to use the service for unsolicited spam.

---

### 3. Subscriptions, Payments & Billing
- **Free Trial:** New merchants receive a complimentary 7-Day trial period with full access to all features.
- **Paid Plans:** CustomerPilot offers 30-Day, 180-Day, and 365-Day subscription plans billed securely via Razorpay.
- **Service Continuity:** If a subscription expires without renewal, access enters a read-only state, and background automations (QR scanning & cron messages) are paused until renewed.
- **Refund Policy:** Subscriptions are non-refundable once activated, as system infrastructure and WhatsApp server capacity are provisioned immediately upon purchase.

---

### 4. Fair Use & Prohibited Activities
You agree NOT to:
- Attempt to reverse engineer, duplicate, or resell the CustomerPilot platform.
- Abuse the automated messaging engine to send offensive, illegal, or deceptive content.
- Falsify customer bills or transactions for fraudulent loyalty point accumulation.

---

### 5. Limitation of Liability
CustomerPilot provides software tools to facilitate customer relationship management. We are not liable for any lost profits, customer disputes, or indirect damages arising from third-party service downtimes (e.g., WhatsApp API, Google My Business API, or payment gateway delays).

---

### 6. Modifications to Terms & Plans
CustomerPilot reserves the right to modify these Terms, pricing plans, and promotional offers. Continued use of the platform following any updates constitutes acceptance of the revised Terms.

---

For legal inquiries or business support, contact **support@customerpilot.in**.
`;

async function seed() {
  console.log("Seeding Plans, Coupons, and Terms...");

  // 1. Seed Plans (Exact User-Defined Pricing: Standalone + Capacity Tiers)
  const plans = [
    // ─── CustomerPilot Complete Capacity Plans ───
    {
      planKey: "starter_30",
      name: "Complete Starter Trial (30 Days)",
      description: "Introductory 30-day full-featured access for new retail stores.",
      days: 30,
      price: 399,
      originalPrice: 599,
      discountPercent: 33,
      badge: "Starter Trial",
      popular: false,
      features: JSON.stringify([
        "Up to 500 VIP Customers",
        "WhatsApp Stamp Card Engine",
        "Magic Google Review AI Flow",
        "1-Click AutoReply Assistant",
        "Counter QR Standee Printable",
        "Daily Morning Intelligence"
      ]),
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
      active: true
    },
    {
      planKey: "growth_180",
      name: "Starter Growth Plan (6 Months)",
      description: "Full CustomerPilot Complete suite for up to 500 VIP customers (₹10/day).",
      days: 180,
      price: 1799,
      originalPrice: 2999,
      discountPercent: 40,
      badge: "Ideal for Growing Shops",
      popular: false,
      features: JSON.stringify([
        "Up to 500 VIP Customers",
        "Unlimited WhatsApp Stamps",
        "AI Google Review 5-Star Filter",
        "1-Click Google Maps AutoReply",
        "Automated 30/60/90 Day Win-Backs",
        "Printable Counter Standee",
        "Basic Morning Intelligence"
      ]),
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
      active: true
    },
    {
      planKey: "enterprise_365",
      name: "Pro Scaling Plan (1 Year)",
      description: "Full CustomerPilot Complete suite for up to 1,500 VIP customers (₹8/day).",
      days: 365,
      price: 2899,
      originalPrice: 4999,
      discountPercent: 42,
      badge: "⭐ Most Popular",
      popular: true,
      features: JSON.stringify([
        "Up to 1,500 VIP Customers",
        "365-Day Unlimited Automation",
        "AI Review Reply Generator",
        "Customizable WhatsApp Templates",
        "VIP Tier Upgrades & Bonus Stamps",
        "Live Queue Cashier Tablet Mode",
        "Priority WhatsApp Helpdesk (+91 90333 04707)"
      ]),
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
      active: true
    },
    {
      planKey: "enterprise_unlimited_365",
      name: "High-Volume / Enterprise (1 Year)",
      description: "Unlimited capacity & multi-outlet retention system for busy retail brands (₹14/day).",
      days: 365,
      price: 4999,
      originalPrice: 8999,
      discountPercent: 44,
      badge: "Busy Outlets & Chains",
      popular: false,
      features: JSON.stringify([
        "Unlimited VIP Customers",
        "Multi-Outlet Store Switcher",
        "Custom Brand Domain & Logo",
        "Dedicated Account Manager",
        "Custom ERP/POS Sync Assistance",
        "Maximum ROI Guarantee"
      ]),
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
      active: true
    },

    // ─── Standalone Service 1: WhatsApp Loyalty Rewards ───
    {
      planKey: "loyalty_monthly",
      name: "WhatsApp Loyalty Rewards — 1 Month",
      description: "Digital stamp cards, QR check-in, birthday rewards, and automated win-backs.",
      days: 30,
      price: 149,
      originalPrice: 249,
      discountPercent: 40,
      badge: "Loyalty (1 Mo)",
      popular: false,
      features: JSON.stringify([
        "Digital Loyalty Stamp Card",
        "QR Counter Check-In",
        "Birthday Rewards Engine",
        "VIP Tier Upgrades",
        "Automated 30/60/90 Day Win-Backs",
        "Basic Customer Analytics"
      ]),
      enabledModules: "LOYALTY",
      active: true
    },
    {
      planKey: "loyalty_6mo",
      name: "WhatsApp Loyalty Rewards — 6 Months",
      description: "Digital stamp cards, QR check-in, birthday rewards, and automated win-backs.",
      days: 180,
      price: 649,
      originalPrice: 999,
      discountPercent: 35,
      badge: "Loyalty (6 Mo)",
      popular: false,
      features: JSON.stringify([
        "Digital Loyalty Stamp Card",
        "QR Counter Check-In",
        "Birthday Rewards Engine",
        "VIP Tier Upgrades",
        "Automated 30/60/90 Day Win-Backs",
        "Basic Customer Analytics"
      ]),
      enabledModules: "LOYALTY",
      active: true
    },
    {
      planKey: "loyalty_yearly",
      name: "WhatsApp Loyalty Rewards — 1 Year",
      description: "Full year of loyalty automation (₹3/day Billed yearly).",
      days: 365,
      price: 999,
      originalPrice: 1788,
      discountPercent: 44,
      badge: "Loyalty (1 Year)",
      popular: false,
      features: JSON.stringify([
        "Everything in Loyalty 6 Months",
        "365-Day Unlimited Automation",
        "VIP Customer CRM & Export",
        "Custom Store Branding",
        "Priority WhatsApp Support"
      ]),
      enabledModules: "LOYALTY",
      active: true
    },

    // ─── Standalone Service 2: Magic SEO Optimized Google Reviews ───
    {
      planKey: "reviews_monthly",
      name: "Magic AI Google Reviews — 1 Month",
      description: "Automated WhatsApp review collection with AI-drafted 5-star reviews.",
      days: 30,
      price: 149,
      originalPrice: 249,
      discountPercent: 40,
      badge: "Reviews (1 Mo)",
      popular: false,
      features: JSON.stringify([
        "WhatsApp Review Request Automation",
        "AI-Drafted Customer Reviews",
        "5-Star Review Filter",
        "Google Maps Deep Link",
        "Review Analytics Dashboard"
      ]),
      enabledModules: "REVIEWS",
      active: true
    },
    {
      planKey: "reviews_6mo",
      name: "Magic AI Google Reviews — 6 Months",
      description: "Automated WhatsApp review collection with AI-drafted 5-star reviews.",
      days: 180,
      price: 649,
      originalPrice: 999,
      discountPercent: 35,
      badge: "Reviews (6 Mo)",
      popular: false,
      features: JSON.stringify([
        "WhatsApp Review Request Automation",
        "AI-Drafted Customer Reviews",
        "5-Star Review Filter",
        "Google Maps Deep Link",
        "Review Analytics Dashboard"
      ]),
      enabledModules: "REVIEWS",
      active: true
    },
    {
      planKey: "reviews_yearly",
      name: "Magic AI Google Reviews — 1 Year",
      description: "Full year of automated review collection (₹3/day Billed yearly).",
      days: 365,
      price: 999,
      originalPrice: 1788,
      discountPercent: 44,
      badge: "Reviews (1 Year)",
      popular: false,
      features: JSON.stringify([
        "Everything in Reviews 6 Months",
        "365-Day Unlimited Review Collection",
        "Priority WhatsApp Delivery",
        "Review Sentiment Reports"
      ]),
      enabledModules: "REVIEWS",
      active: true
    },

    // ─── Standalone Service 3: 1-Click GoogleReview AutoReply ───
    {
      planKey: "autoreply_monthly",
      name: "1-Click AI AutoReply — 1 Month",
      description: "AI-powered Google review replies published in 1-Click to Google Maps.",
      days: 30,
      price: 149,
      originalPrice: 249,
      discountPercent: 40,
      badge: "AutoReply (1 Mo)",
      popular: false,
      features: JSON.stringify([
        "Google Business Profile Connect",
        "Smart AI Context-Aware Replies",
        "1-Click Publish to Google Maps",
        "Smart Sentiment Adaptation",
        "Bulk Reply Engine",
        "Review Sync Dashboard"
      ]),
      enabledModules: "AUTOREPLY",
      active: true
    },
    {
      planKey: "autoreply_6mo",
      name: "1-Click AI AutoReply — 6 Months",
      description: "AI-powered Google review replies published in 1-Click to Google Maps.",
      days: 180,
      price: 649,
      originalPrice: 999,
      discountPercent: 35,
      badge: "AutoReply (6 Mo)",
      popular: false,
      features: JSON.stringify([
        "Google Business Profile Connect",
        "Smart AI Context-Aware Replies",
        "1-Click Publish to Google Maps",
        "Smart Sentiment Adaptation",
        "Bulk Reply Engine",
        "Review Sync Dashboard"
      ]),
      enabledModules: "AUTOREPLY",
      active: true
    },
    {
      planKey: "autoreply_yearly",
      name: "1-Click AI AutoReply — 1 Year",
      description: "Full year of AI review replies (₹3/day Billed yearly).",
      days: 365,
      price: 999,
      originalPrice: 1788,
      discountPercent: 44,
      badge: "AutoReply (1 Year)",
      popular: false,
      features: JSON.stringify([
        "Everything in AutoReply 6 Months",
        "365-Day Unlimited AI Replies",
        "Dead-Letter Queue Safety",
        "Multi-Location Google Support"
      ]),
      enabledModules: "AUTOREPLY",
      active: true
    }
  ];

  for (const p of plans) {
    const existing = await prisma.plan.findFirst({
      where: { OR: [{ planKey: p.planKey }, { name: p.name }] }
    });
    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: p
      });
      console.log(`Updated plan: ${p.name}`);
    } else {
      await prisma.plan.create({ data: p });
      console.log(`Created plan: ${p.name}`);
    }
  }

  // 2. Seed Coupons
  const coupons = [
    {
      code: "WELCOME20",
      description: "20% off on any subscription plan",
      discountType: "percent",
      discountValue: 20,
      minOrderAmount: 500,
      maxDiscount: 2000,
      maxUses: 500,
      active: true
    },
    {
      code: "LAUNCH50",
      description: "Special 50% discount for early adopters",
      discountType: "percent",
      discountValue: 50,
      minOrderAmount: 900,
      maxDiscount: 5000,
      maxUses: 100,
      active: true
    },
    {
      code: "FLAT500",
      description: "Flat ₹500 discount on 6-Month or 1-Year plans",
      discountType: "fixed",
      discountValue: 500,
      minOrderAmount: 4000,
      maxUses: 200,
      active: true
    }
  ];

  for (const c of coupons) {
    const existing = await prisma.coupon.findUnique({ where: { code: c.code } });
    if (existing) {
      await prisma.coupon.update({ where: { code: c.code }, data: c });
      console.log(`Updated coupon: ${c.code}`);
    } else {
      await prisma.coupon.create({ data: c });
      console.log(`Created coupon: ${c.code}`);
    }
  }

  // 3. Seed Terms & Conditions
  const existingTerms = await prisma.systemContent.findUnique({
    where: { key: "MERCHANT_TERMS_AND_CONDITIONS" }
  });
  if (existingTerms) {
    await prisma.systemContent.update({
      where: { key: "MERCHANT_TERMS_AND_CONDITIONS" },
      data: {
        value: DEFAULT_TERMS.trim(),
        section: "legal",
        category: "terms"
      }
    });
    console.log("Updated Merchant Terms & Conditions");
  } else {
    await prisma.systemContent.create({
      data: {
        key: "MERCHANT_TERMS_AND_CONDITIONS",
        section: "legal",
        category: "terms",
        value: DEFAULT_TERMS.trim()
      }
    });
    console.log("Created Merchant Terms & Conditions");
  }

  console.log("Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
