const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    console.log("No merchant found.");
    return;
  }
  
  console.log(`Merchant Name: ${merchant.name}`);
  console.log(`googleReviewDelayMinutes: ${merchant.googleReviewDelayMinutes}`);
  
  const reviewMessages = await prisma.whatsAppMessage.findMany({
    where: {
      template: "review_request"
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log("\nRecent Review Request Messages:");
  console.table(reviewMessages.map(m => ({
    id: m.id,
    toPhone: m.toPhone,
    status: m.status,
    scheduledFor: m.scheduledFor,
    createdAt: m.createdAt
  })));
  
}

main().catch(console.error).finally(() => prisma.$disconnect());
