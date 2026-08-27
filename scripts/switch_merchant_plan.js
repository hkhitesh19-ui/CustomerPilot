/**
 * Quick Merchant Plan & Module Switcher for Manual UI Testing
 * 
 * Usage:
 *   node scripts/switch_merchant_plan.js [all | loyalty | reviews | autoreply] [phone_or_email]
 * 
 * Example:
 *   node scripts/switch_merchant_plan.js loyalty 9033304707
 *   node scripts/switch_merchant_plan.js all 9033304707
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MODULE_MAP = {
  all: { plan: "growth_180", modules: "LOYALTY,REVIEWS,AUTOREPLY", label: "CustomerPilot Complete (All 3 Services)" },
  complete: { plan: "enterprise_365", modules: "LOYALTY,REVIEWS,AUTOREPLY", label: "CustomerPilot Complete (All 3 Services)" },
  loyalty: { plan: "loyalty_6mo", modules: "LOYALTY", label: "WhatsApp Loyalty Rewards Only (Standalone)" },
  reviews: { plan: "reviews_6mo", modules: "REVIEWS", label: "Magic AI Google Reviews Only (Standalone)" },
  autoreply: { plan: "autoreply_6mo", modules: "AUTOREPLY", label: "1-Click AI AutoReply Only (Standalone)" },
};

async function main() {
  const targetType = (process.argv[2] || "all").toLowerCase();
  const targetIdentifier = process.argv[3];

  const config = MODULE_MAP[targetType];
  if (!config) {
    console.error(`Invalid mode '${targetType}'. Supported modes: all, loyalty, reviews, autoreply`);
    process.exit(1);
  }

  // Find merchant
  let merchant;
  if (targetIdentifier) {
    merchant = await prisma.merchant.findFirst({
      where: {
        OR: [
          { whatsappPhone: { contains: targetIdentifier } },
          { email: { contains: targetIdentifier } },
          { id: targetIdentifier }
        ]
      }
    });
  } else {
    // Default to first active merchant
    merchant = await prisma.merchant.findFirst({
      orderBy: { createdAt: "asc" }
    });
  }

  if (!merchant) {
    console.error("No merchant found to update.");
    process.exit(1);
  }

  const updated = await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      plan: config.plan,
      enabledModules: config.modules
    }
  });

  console.log("================================================================");
  console.log(`✅ Merchant Plan Switched Successfully!`);
  console.log(`👤 Merchant: ${updated.name} (Phone: ${updated.whatsappPhone || 'N/A'})`);
  console.log(`📦 Active Plan: ${config.label}`);
  console.log(`🔑 Plan Key: ${updated.plan}`);
  console.log(`⚡ Enabled Modules: ${updated.enabledModules}`);
  console.log("================================================================");
  console.log(`\nNow refresh http://localhost:3000/dashboard in your browser to see the live changes!`);
}

main()
  .catch(e => {
    console.error("Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
