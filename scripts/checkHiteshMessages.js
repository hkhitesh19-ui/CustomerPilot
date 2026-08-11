const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const customer = await prisma.customer.findFirst({
    where: { name: { contains: "Hitesh" } },
    include: {
      bills: { orderBy: { createdAt: 'desc' } },
      reviews: true,
    }
  });

  console.log("=== CUSTOMER HITESH RECORD ===");
  console.log(JSON.stringify(customer, null, 2));

  if (customer) {
    const messages = await prisma.whatsAppMessage.findMany({
      where: {
        OR: [
          { customerId: customer.id },
          { toPhone: { contains: customer.phone.replace(/\D/g, "").slice(-10) } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    console.log("\n=== WHATSAPP MESSAGES LOG (Total: " + messages.length + ") ===");
    console.log(JSON.stringify(messages, null, 2));
  }
}

run().finally(() => prisma.$disconnect());
