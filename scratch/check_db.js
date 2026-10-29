const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const msgs = await prisma.whatsAppMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log('Recent Messages:', msgs.length ? msgs.map(m => m.body + ' | ' + m.createdAt) : 'None');
  const queue = await prisma.waitingCustomer.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log('Recent Queue:', queue.length ? queue.map(q => q.status + ' | ' + q.createdAt) : 'None');
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  console.log('Recent Customers:', customers.length ? customers.map(c => c.phone + ' | ' + c.createdAt) : 'None');
}

check().finally(() => prisma.$disconnect());
