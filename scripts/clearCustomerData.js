const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing customer and transaction data...');
  
  await prisma.stamp.deleteMany();
  await prisma.customerStampCard.deleteMany();
  await prisma.redemption.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.review.deleteMany();
  await prisma.googleBusinessReview.deleteMany();
  await prisma.whatsAppMessage.deleteMany();
  await prisma.waitingCustomer.deleteMany();
  await prisma.fraudAlert.deleteMany();
  await prisma.birthday.deleteMany();
  await prisma.winBackEscalation.deleteMany();
  await prisma.achievement.deleteMany();
  
  // Clear referredBy first to avoid self-referencing FK issues
  await prisma.customer.updateMany({
    data: { referredById: null }
  });

  // Clear customers
  await prisma.customer.deleteMany();
  
  console.log('Customer data cleared successfully! Merchant settings and templates are intact.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
