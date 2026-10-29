const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  
  await prisma.merchant.updateMany({
    data: { trialEndsAt: futureDate }
  });
  console.log("All merchants have been set to ACTIVE (7 days trial remaining).");
}

main().finally(() => prisma.$disconnect());
