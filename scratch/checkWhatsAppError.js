const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const merchant = await prisma.merchant.findFirst();
  console.log('=== MERCHANT ===');
  console.log('id:', merchant?.id);
  console.log('whatsappInstanceName:', merchant?.whatsappInstanceName);
  console.log('whatsappPhone:', merchant?.whatsappPhone);

  const messages = await prisma.whatsAppMessage.findMany({
    where: { template: { in: ['review_bonus_reward', 'merchant_review_alert'] } },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('=== REWARD / ALERT MESSAGES ===');
  console.log(JSON.stringify(messages, null, 2));
}

main().finally(() => prisma.$disconnect());
