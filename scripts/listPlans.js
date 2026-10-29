const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const plans = await prisma.plan.findMany();
  console.log("PLANS COUNT:", plans.length);
  console.log(plans);
}

run().finally(() => prisma.$disconnect());
