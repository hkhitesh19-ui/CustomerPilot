const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const msgs = await prisma.whatsAppMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  console.log('--- RECENT MESSAGES ---');
  for (const m of msgs) {
    console.log(`[${m.createdAt.toISOString()}] To: ${m.toPhone} | Template: ${m.template} | Status: ${m.status}`);
  }
}
main().finally(() => prisma.$disconnect());
