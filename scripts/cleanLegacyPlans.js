const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const result = await prisma.plan.updateMany({
    where: { planKey: null },
    data: { active: false }
  });
  console.log("Deactivated legacy plans:", result);
}

run().finally(() => prisma.$disconnect());
