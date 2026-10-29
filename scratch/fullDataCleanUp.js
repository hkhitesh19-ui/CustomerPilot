const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fullDataCleanUp() {
  console.log("🧹 Starting Full Database Cleanup for Fresh Manual Testing...");

  // 1. Delete all Stamps
  const stamps = await prisma.stamp.deleteMany({});
  console.log(`Deleted ${stamps.count} Stamp records.`);

  // 2. Delete all CustomerStampCards
  const customerStampCards = await prisma.customerStampCard.deleteMany({});
  console.log(`Deleted ${customerStampCards.count} CustomerStampCard records.`);

  // 3. Delete all Reviews
  const reviews = await prisma.review.deleteMany({});
  console.log(`Deleted ${reviews.count} Review records.`);

  // 4. Delete all GoogleBusinessReviews
  const gbpReviews = await prisma.googleBusinessReview.deleteMany({});
  console.log(`Deleted ${gbpReviews.count} GoogleBusinessReview records.`);

  // 5. Delete all WhatsAppMessages
  const messages = await prisma.whatsAppMessage.deleteMany({});
  console.log(`Deleted ${messages.count} WhatsAppMessage records.`);

  // 6. Delete all Bills
  try {
    const bills = await prisma.bill.deleteMany({});
    console.log(`Deleted ${bills.count} Bill records.`);
  } catch (e) {}

  // 7. Delete all Redemptions
  try {
    const redemptions = await prisma.redemption.deleteMany({});
    console.log(`Deleted ${redemptions.count} Redemption records.`);
  } catch (e) {}

  // 8. Delete all Referrals
  try {
    await prisma.referral.deleteMany({});
  } catch (e) {}

  // 9. Delete Achievements, Birthdays, WaitingCustomers, WinBackEscalations
  try { await prisma.achievement.deleteMany({}); } catch (e) {}
  try { await prisma.birthday.deleteMany({}); } catch (e) {}
  try { await prisma.waitingCustomer.deleteMany({}); } catch (e) {}
  try { await prisma.winBackEscalation.deleteMany({}); } catch (e) {}

  // 10. Nullify referredById on any customers
  await prisma.customer.updateMany({
    data: { referredById: null }
  });

  // 11. Delete all Customers (leaving Merchant & Users intact for testing)
  const customers = await prisma.customer.deleteMany({});
  console.log(`Deleted ${customers.count} Customer records.`);

  console.log("✅ Database is 100% Clean and Ready for Fresh End-to-End Manual Testing!");
}

fullDataCleanUp()
  .catch((e) => console.error("Error during cleanup:", e))
  .finally(() => prisma.$disconnect());
