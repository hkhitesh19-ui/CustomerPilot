const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const msgs = await prisma.whatsAppMessage.findMany({
    where: { template: 'review_request' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('COUNT:', msgs.length);
  msgs.forEach(m => {
    console.log({
      id: m.id,
      toPhone: m.toPhone,
      status: m.status,
      scheduledFor: m.scheduledFor,
      createdAt: m.createdAt,
      errorMessage: m.errorMessage
    });
  });
}

run().finally(() => prisma.$disconnect());
