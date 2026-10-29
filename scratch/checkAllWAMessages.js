const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllWAMessages() {
  const msgs = await prisma.whatsAppMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  console.log("=== ALL WHATSAPP MESSAGES ===");
  msgs.forEach((m, idx) => {
    console.log(`[${idx+1}] ID: ${m.id}`);
    console.log(`     To: ${m.toPhone} | CustomerId: ${m.customerId}`);
    console.log(`     Template: ${m.template} | Status: ${m.status} | Time: ${m.createdAt.toISOString()}`);
    console.log(`     Body: ${m.body}`);
    console.log('----------------------------------------------------');
  });
}

checkAllWAMessages().finally(() => prisma.$disconnect());
