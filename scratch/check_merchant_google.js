const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const m = await prisma.merchant.findUnique({ where: { id: 'cmsjw7n7i0001w0c0r6i3juhy' } });
  const conn = await prisma.merchantGoogleConnection.findUnique({ where: { merchantId: 'cmsjw7n7i0001w0c0r6i3juhy' } });
  console.log('Merchant:', m?.name, 'googleReviewDelayMinutes:', m?.googleReviewDelayMinutes);
  console.log('Google Connection:', conn);
}

run().finally(() => prisma.$disconnect());
