const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepAudit() {
  // 1. Merchant Rules
  const merchant = await prisma.merchant.findFirst({
    where: { id: 'cmsjw7n7i0001w0c0r6i3juhy' },
    include: { stampCards: true }
  });

  const stampCard = merchant.stampCards?.[0];
  console.log("=== MERCHANT CONFIGURED RULES ===");
  console.log("Business Name:", merchant.name);
  console.log("Stamp Goal (stampsRequired):", stampCard?.stampsRequired);
  console.log("Reward Description (rewardName):", stampCard?.rewardName);
  console.log("Min Purchase per Stamp (minPurchaseAmount):", stampCard?.minPurchaseAmount);
  console.log("Stamps per Purchase Rule (stampsPerPurchase):", stampCard?.stampsPerPurchase);
  console.log("Google Review Bonus (reviewBonusStamps):", stampCard?.reviewBonusStamps);
  console.log("VIP Upgrade Bonus / Next Level Kickstart (vipUpgradeBonusStamps):", merchant.vipUpgradeBonusStamps);
  console.log("Full StampCard Config:", JSON.stringify(stampCard, null, 2));

  // 2. Customer Stamp Cards
  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: '9033304707' } }
  });

  const cards = await prisma.customerStampCard.findMany({
    where: { customerId: customer.id },
    include: { stamps: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'asc' }
  });

  console.log("\n=== ALL STAMP CARDS IN DB FOR HITESH ===");
  cards.forEach((c, idx) => {
    console.log(`\n--- Card #${idx+1} (ID: ${c.id}) ---`);
    console.log(`  stampsCollected: ${c.stampsCollected}`);
    console.log(`  completed: ${c.completed} | redeemed: ${c.redeemed}`);
    console.log(`  createdAt: ${c.createdAt.toISOString()}`);
    console.log(`  Stamps:`);
    c.stamps.forEach((s, si) => {
      console.log(`    [${si+1}] source: ${s.source} | billId: ${s.billId} | time: ${s.createdAt.toISOString()}`);
    });
  });

  // 3. Bills
  const bills = await prisma.bill.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'asc' }
  });
  console.log("\n=== BILLS ===");
  bills.forEach((b, i) => {
    console.log(`[Bill #${i+1}] INV: ${b.number} | Amount: ₹${b.amount} | stampsAwarded: ${b.stampsAwarded} | time: ${b.createdAt.toISOString()}`);
  });

  // 4. WhatsApp messages SENT only
  const messages = await prisma.whatsAppMessage.findMany({
    where: { toPhone: { contains: '9033304707' }, status: { not: 'received' } },
    orderBy: { createdAt: 'asc' },
    select: { id: true, template: true, status: true, body: true, createdAt: true }
  });
  console.log("\n=== ALL OUTBOUND WHATSAPP MESSAGES ===");
  messages.forEach((m, i) => {
    console.log(`\n[WA #${i+1}] ${m.createdAt.toISOString()} | Template: ${m.template}`);
    console.log(`  Body: ${m.body?.substring(0, 200)}`);
  });
}

deepAudit().catch(console.error).finally(() => prisma.$disconnect());
