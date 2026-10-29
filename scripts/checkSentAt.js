const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const msgs = await prisma.whatsAppMessage.findMany({
    where: { toPhone: '919033304707' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('--- RECENT MESSAGES ---');
  for (const m of msgs) {
    console.log(`[createdAt: ${m.createdAt.toISOString()}] | [sentAt: ${m.sentAt ? m.sentAt.toISOString() : 'NULL'}] | Template: ${m.template} | Status: ${m.status}`);
  }
}
main().finally(() => prisma.$disconnect());
