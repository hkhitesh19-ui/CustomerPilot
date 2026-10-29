const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const msgs = await prisma.whatsAppMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  console.log('--- RECENT MESSAGES (BOTH SIDES) ---');
  msgs.forEach(m => {
    const direction = m.template === 'INCOMING' ? '📥 INCOMING (From Customer)' : '📤 OUTGOING (From System/Merchant)';
    console.log(`[${m.createdAt.toISOString()}] ${direction} | Phone: ${m.toPhone} | Template: ${m.template} | Status: ${m.status}`);
    console.log(`Body: ${m.body}`);
    console.log('------------------------------------');
  });

  const q = await prisma.waitingCustomer.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { customer: true } });
  console.log('--- RECENT QUEUE ---');
  q.forEach(qi => {
    console.log(`[${qi.createdAt.toISOString()}] Customer: ${qi.customer.phone} (${qi.customer.name}) | Status: ${qi.status} | Scan Source: ${qi.scanSource}`);
  });
}

run().finally(() => prisma.$disconnect());
