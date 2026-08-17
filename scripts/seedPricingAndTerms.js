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

  // 1. Seed Plans
  const plans = [
    {
      planKey: "starter_30",
      name: "1 Month (30 Days)",
      description: "Essential loyalty & review growth for small retail stores & cafes.",
      days: 30,
      price: 999,
      originalPrice: 1499,
      discountPercent: 33,
      badge: "Starter",
      popular: false,
      features: JSON.stringify([
        "Loyalty QR Code Automation",
        "WhatsApp Smart Engine",
        "Google Review 5-Star Filter",
        "Live Counter Queue",
        "Basic Customer Analytics"
      ]),
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
      active: true
    },
    {
      planKey: "growth_180",
      name: "6 Months (180 Days)",
      description: "Most popular choice for fast-growing businesses looking for high retention.",
      days: 180,
      price: 4999,
      originalPrice: 8999,
      discountPercent: 44,
      badge: "Most Popular",
      popular: true,
      features: JSON.stringify([
        "Everything in 1 Month Plan",
        "Automated 30/60/90 Day Win-Backs",
        "VIP Tier Upgrades & Bonus Stamps",
        "7-Day Expiry & Milestone Alerts",
        "Photo Review Bonus Stamps",
        "Priority WhatsApp Delivery"
      ]),
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
      active: true
    },
    {
      planKey: "enterprise_365",
      name: "1 Year (365 Days)",
      description: "Maximum savings & annual peace of mind for established merchants.",
      days: 365,
      price: 8999,
      originalPrice: 17999,
      discountPercent: 50,
      badge: "Best Value",
      popular: false,
      features: JSON.stringify([
        "Everything in 6 Months Plan",
        "Full 365-Day Unlimited Automation",
        "VIP Customer CRM & Export",
        "Dedicated Account Manager Support",
        "Custom Store Branding & Posters",
        "Maximum Savings Guarantee"
      ]),
      enabledModules: "LOYALTY,REVIEWS,AUTOREPLY",
      active: true
    },
    // ─── Standalone Service Plans ───
    {
      planKey: "loyalty_monthly",
      name: "Loyalty Rewards — Monthly",
      description: "Digital stamp cards, QR check-in, birthday rewards, and automated win-backs.",
      days: 30,
      price: 499,
      originalPrice: 799,
      discountPercent: 37,
      badge: "Loyalty Only",
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
      name: "Loyalty Rewards — Annual",
      description: "Full year of loyalty automation at maximum savings.",
      days: 365,
      price: 3999,
      originalPrice: 5988,
      discountPercent: 33,
      badge: "Loyalty Only — Annual",
      popular: false,
      features: JSON.stringify([
        "Everything in Loyalty Monthly",
        "365-Day Unlimited Automation",
        "VIP Customer CRM & Export",
        "Custom Store Branding"
      ]),
      enabledModules: "LOYALTY",
      active: true
    },
    {
      planKey: "reviews_monthly",
      name: "Magic Google Reviews — Monthly",
      description: "Automated WhatsApp review collection with AI-drafted 5-star reviews.",
      days: 30,
      price: 399,
      originalPrice: 699,
      discountPercent: 43,
      badge: "Reviews Only",
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
      name: "Magic Google Reviews — Annual",
      description: "Full year of automated review collection at maximum savings.",
      days: 365,
      price: 2999,
      originalPrice: 4788,
      discountPercent: 37,
      badge: "Reviews Only — Annual",
      popular: false,
      features: JSON.stringify([
        "Everything in Reviews Monthly",
        "365-Day Unlimited Review Collection",
        "Priority WhatsApp Delivery"
      ]),
      enabledModules: "REVIEWS",
      active: true
    },
    {
      planKey: "autoreply_monthly",
      name: "1-Click AutoReply — Monthly",
      description: "AI-powered Google review replies published in 1-Click to Google Maps.",
      days: 30,
      price: 299,
      originalPrice: 499,
      discountPercent: 40,
      badge: "AutoReply Only",
      popular: false,
      features: JSON.stringify([
        "Google Business Profile Connect",
        "Gemini AI Context-Aware Replies",
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
      name: "1-Click AutoReply — Annual",
      description: "Full year of AI review replies at maximum savings.",
      days: 365,
      price: 1999,
      originalPrice: 3588,
      discountPercent: 44,
      badge: "AutoReply Only — Annual",
      popular: false,
      features: JSON.stringify([
        "Everything in AutoReply Monthly",
        "365-Day Unlimited AI Replies",
        "Dead-Letter Queue Safety"
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
