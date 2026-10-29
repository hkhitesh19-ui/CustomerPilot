const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Recent WhatsApp Messages:");
  const msgs = await prisma.whatsAppMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(msgs, null, 2));

  console.log("\nWaiting Customers in Queue:");
  const queue = await prisma.waitingCustomer.findMany({
    where: { status: 'waiting' },
    include: { customer: true }
  });
  console.log(JSON.stringify(queue, null, 2));
}

main().finally(() => prisma.$disconnect());
