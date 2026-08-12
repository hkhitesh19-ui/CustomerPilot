const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customerId = 'cmspurg3r001bw0xk0yitmjpv';
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { merchant: true }
  });

  if (!customer) {
    console.log('No customer found with ID:', customerId);
    return;
  }

  console.log('=== CUSTOMER PROFILE ===');
  console.log(`Name: ${customer.name}`);
  console.log(`Phone: ${customer.phone}`);
  console.log(`Lifetime Stamps: ${customer.lifetimeStamps}`);
  console.log(`Bot State: ${customer.botState}`);

  const reviews = await prisma.review.findMany({ where: { customerId } });
  console.log('\n=== REVIEWS RECORDED ===');
  console.log(JSON.stringify(reviews, null, 2));

  const gbpReviews = await prisma.googleBusinessReview.findMany({ 
    where: { merchantId: customer.merchantId, reviewerName: { contains: 'Hitesh' } } 
  });
  console.log('\n=== GBP REVIEWS ===');
  console.log(JSON.stringify(gbpReviews, null, 2));

  const stamps = await prisma.stamp.findMany({ where: { customerId } });
  console.log('\n=== STAMPS RECORDED ===');
  console.log(JSON.stringify(stamps, null, 2));

  const messages = await prisma.whatsAppMessage.findMany({ 
    where: { customerId }, 
    orderBy: { createdAt: 'desc' } 
  });
  console.log('\n=== WHATSAPP MESSAGES ===');
  console.log(JSON.stringify(messages, null, 2));
}

main().finally(() => prisma.$disconnect());
