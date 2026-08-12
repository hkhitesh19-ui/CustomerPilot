const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const merchants = await prisma.merchant.findMany({});
  console.log("=== ALL MERCHANT RECORDS ===");
  merchants.forEach(m => {
    console.log(JSON.stringify({
      id: m.id,
      name: m.name,
      ownerName: m.ownerName,
      businessType: m.businessType,
      category: m.category,
      address: m.address,
      whatsappPhone: m.whatsappPhone,
      whatsappInstanceName: m.whatsappInstanceName,
      currentStep: m.currentStep,
      onboardingCompleted: m.onboardingCompleted,
    }, null, 2));
  });
}
main().finally(() => prisma.$disconnect());
