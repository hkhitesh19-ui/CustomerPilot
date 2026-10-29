const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditHitesh() {
  const merchant = await prisma.merchant.findFirst({
    where: { whatsappPhone: { not: null } },
    include: { stampCards: true }
  });
  
  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: '9033304707' } },
    include: {
      stampCards: { include: { stamps: true } },
      stamps: true,
      bills: true,
      redemptions: true,
      reviews: true,
    }
  });

  const cCards = await prisma.customerStampCard.findMany({
    where: { customerId: customer?.id },
    include: { stamps: true }
  });

  const waMessages = await prisma.whatsAppMessage.findMany({
    where: { customerId: customer?.id },
    orderBy: { createdAt: 'asc' }
  });

  console.log("=== 1. MERCHANT REWARD CARD RULES ===");
  console.log("Merchant ID:", merchant?.id);
  console.log("Merchant Name:", merchant?.name);
  console.log("Merchant vipUpgradeBonusStamps:", merchant?.vipUpgradeBonusStamps);
  console.log("StampCards (Active Rules):", JSON.stringify(merchant?.stampCards, null, 2));

  console.log("\n=== 2. CUSTOMER DETAILS & STAMP CARDS ===");
  console.log("Customer ID:", customer?.id);
  console.log("Customer Name:", customer?.name);
  console.log("Lifetime Spend:", customer?.lifetimeSpend);
  console.log("Lifetime Stamps:", customer?.lifetimeStamps);
  console.log("Customer Stamp Cards:", JSON.stringify(cCards, null, 2));

  console.log("\n=== 3. ALL STAMPS DETAILED LOG ===");
  console.log(JSON.stringify(customer?.stamps, null, 2));

  console.log("\n=== 4. CUSTOMER BILLS ===");
  console.log(JSON.stringify(customer?.bills, null, 2));

  console.log("\n=== 5. CUSTOMER REDEMPTIONS ===");
  console.log(JSON.stringify(customer?.redemptions, null, 2));

  console.log("\n=== 6. WHATSAPP MESSAGES CHRONOLOGICAL LOG ===");
  waMessages.forEach((m, idx) => {
    console.log(`[${idx+1}] Time: ${m.createdAt.toISOString()}`);
    console.log(`     Template: ${m.template}`);
    console.log(`     Status: ${m.status}`);
    console.log(`     Body: ${m.body}`);
    console.log('----------------------------------------------------');
  });
}

auditHitesh().finally(() => prisma.$disconnect());
