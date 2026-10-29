const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const merchantId = 'cmsjw7n7i0001w0c0r6i3juhy';
  const stampCard = await prisma.stampCard.findFirst({ where: { merchantId, active: true } });
  console.log('=== STAMP CARD CONFIG ===');
  console.log(JSON.stringify(stampCard, null, 2));

  const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
  console.log('=== MERCHANT ===');
  console.log(JSON.stringify(merchant, null, 2));
}

main().finally(() => prisma.$disconnect());
