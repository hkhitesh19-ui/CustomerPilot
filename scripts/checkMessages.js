const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.whatsAppMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15
  });
  
  console.log("\nRecent WhatsApp Messages:");
  console.table(messages.map(m => ({
    id: m.id,
    template: m.template,
    status: m.status,
    body: m.body.substring(0, 30),
    createdAt: m.createdAt,
    toPhone: m.toPhone
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
