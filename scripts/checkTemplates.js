const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const t = await prisma.messageTemplate.findMany({
    where: { templateKey: 'REWARD_UNLOCKED' }
  });
  console.log(JSON.stringify(t, null, 2));
}

run().finally(() => prisma.$disconnect());
