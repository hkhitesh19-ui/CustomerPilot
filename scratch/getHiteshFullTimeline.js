const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.findFirst({
    where: { phone: { contains: '9033304707' } },
    include: { merchant: true }
  });

  if (!customer) {
    console.log('No Hitesh customer found');
    return;
  }

  const messages = await prisma.whatsAppMessage.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'asc' }
  });

  const stamps = await prisma.stamp.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'asc' }
  });

  const reviews = await prisma.review.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'asc' }
  });

  console.log('=== CUSTOMER ===');
  console.log(JSON.stringify(customer, null, 2));

  console.log('=== MESSAGES ===');
  console.log(JSON.stringify(messages, null, 2));

  console.log('=== STAMPS ===');
  console.log(JSON.stringify(stamps, null, 2));

  console.log('=== REVIEWS ===');
  console.log(JSON.stringify(reviews, null, 2));
}

main().finally(() => prisma.$disconnect());
