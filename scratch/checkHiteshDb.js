const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHiteshStatus() {
  const customer = await prisma.customer.findFirst({ where: { phone: { contains: '9033304707' } } });
  if (!customer) { 
    console.log('No customer found'); 
    return; 
  }
  console.log('=== CUSTOMER PROFILE ===');
  console.log(`ID: ${customer.id}`);
  console.log(`Name: ${customer.name}`);
  console.log(`Lifetime Stamps: ${customer.lifetimeStamps}`);
  console.log(`Bot State: ${customer.botState}`);

  console.log('\n=== REVIEWS RECORDED ===');
  const reviews = await prisma.review.findMany({ where: { customerId: customer.id } });
  console.log(JSON.stringify(reviews, null, 2));

  console.log('\n=== GOOGLE BUSINESS REVIEWS ===');
  const gbpReviews = await prisma.googleBusinessReview.findMany({ 
    where: { 
      OR: [
        { merchantId: customer.merchantId },
        { reviewerName: { contains: 'Hitesh' } }
      ] 
    } 
  });
  console.log(JSON.stringify(gbpReviews, null, 2));

  console.log('\n=== STAMPS RECORDED ===');
  const stamps = await prisma.stamp.findMany({ where: { customerId: customer.id } });
  console.log(JSON.stringify(stamps, null, 2));

  console.log('\n=== RECENT WHATSAPP MESSAGES ===');
  const messages = await prisma.whatsAppMessage.findMany({ 
    where: { customerId: customer.id }, 
    orderBy: { createdAt: 'desc' }, 
    take: 10 
  });
  console.log(JSON.stringify(messages, null, 2));
}

checkHiteshStatus().finally(() => prisma.$disconnect());
