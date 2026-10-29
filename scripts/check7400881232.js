const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.whatsAppMessage.findMany({
    where: { toPhone: { contains: '7400881232' } },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.table(messages.map(m => ({
    id: m.id,
    template: m.template,
    status: m.status,
    body: m.body.substring(0, 50),
    createdAt: m.createdAt,
    toPhone: m.toPhone
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
