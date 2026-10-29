const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.findFirst();
  if (merchant) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { trialEndsAt: pastDate }
    });
    console.log(`Merchant ${merchant.name} has been set to EXPIRED.`);
  } else {
    console.log("No merchant found.");
  }
}
main().finally(() => prisma.$disconnect());
