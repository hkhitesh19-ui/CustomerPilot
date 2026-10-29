const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const messages = await prisma.whatsAppMessage.findMany({
    where: { toPhone: { contains: "9033304707" } },
    orderBy: { createdAt: 'asc' },
  });

  console.log("=== ALL MESSAGES TO HITESH (Total: " + messages.length + ") ===");
  messages.forEach((m, idx) => {
    console.log(`\n--- [${idx + 1}] Template: ${m.template} | SentAt: ${m.createdAt.toISOString()} ---`);
    console.log(m.body);
  });

  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: "9033304707" } },
    include: {
      stampCards: true,
      stamps: true,
      bills: true
    }
  });

  console.log("\n=== HITESH CUSTOMER PROFILE ===");
  console.log(JSON.stringify(customer, null, 2));
}

run().finally(() => prisma.$disconnect());
