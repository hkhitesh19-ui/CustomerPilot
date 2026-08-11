const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const m = await prisma.whatsAppMessage.findFirst({
    where: { toPhone: '919033304707', template: 'INCOMING' },
    orderBy: { createdAt: 'desc' }
  });
  console.log(m ? m.body : 'No message found');
}
main().finally(() => prisma.$disconnect());
