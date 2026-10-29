const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetMerchantAndCustomerData() {
  console.log("🧹 Starting Complete Reset of Merchant Setup & Customer Data...");

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
  try { await prisma.bill.deleteMany({}); } catch (e) {}

  // 7. Delete all Redemptions
  try { await prisma.redemption.deleteMany({}); } catch (e) {}

  // 8. Delete all Referrals
  try { await prisma.referral.deleteMany({}); } catch (e) {}

  // 9. Delete Achievements, Birthdays, WaitingCustomers, WinBackEscalations
  try { await prisma.achievement.deleteMany({}); } catch (e) {}
  try { await prisma.birthday.deleteMany({}); } catch (e) {}
  try { await prisma.waitingCustomer.deleteMany({}); } catch (e) {}
  try { await prisma.winBackEscalation.deleteMany({}); } catch (e) {}

  // 10. Nullify referredById on any customers
  await prisma.customer.updateMany({ data: { referredById: null } });

  // 11. Delete all Customers
  const customers = await prisma.customer.deleteMany({});
  console.log(`Deleted ${customers.count} Customer records.`);

  // 12. Delete StampCards
  const cards = await prisma.stampCard.deleteMany({});
  console.log(`Deleted ${cards.count} StampCard records.`);

  // 13. Delete MerchantGoogleConnections
  try { await prisma.merchantGoogleConnection.deleteMany({}); } catch (e) {}

  // 14. Reset Merchant Profile to Completely Fresh Blank State
  const updatedMerchants = await prisma.merchant.updateMany({
    data: {
      name: "",
      ownerName: "",
      businessType: "",
      category: "",
      address: "",
      whatsappPhone: null,
      whatsappInstanceName: null,
      loyaltyCategoryNames: null,
      vipUpgradeBonusStamps: 1,
      googleReviewDelayMinutes: 5,
      onboardingCompleted: false,
      currentStep: 1
    }
  });

  console.log(`✅ Reset ${updatedMerchants.count} Merchant records to completely fresh blank state!`);
}

resetMerchantAndCustomerData()
  .catch((e) => console.error("Error during merchant reset:", e))
  .finally(() => prisma.$disconnect());
