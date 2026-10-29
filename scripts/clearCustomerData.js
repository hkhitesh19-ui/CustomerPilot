const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Clearing All Merchant & Transactional Data ===');
  
  const merchantCount = await prisma.merchant.count();
  const customerCount = await prisma.customer.count();
  console.log(`Found ${merchantCount} merchant(s) and ${customerCount} customer(s) to remove.`);

  console.log('Deleting transactional logs, messages, and child records...');
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
  await prisma.supportTicket.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.onboardingStep.deleteMany();
  await prisma.customerMergeLog.deleteMany();
  await prisma.merchantTransferLog.deleteMany();
  await prisma.rewardWaitlist.deleteMany();
  await prisma.cardRuleChangeLog.deleteMany();
  await prisma.campaignDeliveryLog.deleteMany();
  await prisma.ownerOverrideLog.deleteMany();
  await prisma.merchantGoogleConnection.deleteMany();
  await prisma.oTPSession.deleteMany();
  await prisma.deadLetterQueue.deleteMany();
  await prisma.backgroundJob.deleteMany();
  await prisma.templateVersionHistory.deleteMany();
  await prisma.messageTemplate.deleteMany();
  await prisma.merchantReferral.deleteMany();
  await prisma.growthSnapshot.deleteMany();
  await prisma.growthReport.deleteMany();
  await prisma.vipTier.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.stampCard.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.staff.deleteMany();

  // Clear referredBy first to avoid self-referencing FK issues
  console.log('Clearing customer self-references & deleting customers...');
  await prisma.customer.updateMany({
    data: { referredById: null }
  });
  await prisma.customer.deleteMany();

  // Delete all merchants
  console.log('Deleting all merchants...');
  await prisma.merchant.deleteMany();

  try {
    await prisma.user.deleteMany();
  } catch (e) {
    // ignore
  }
  
  console.log('=== ✅ Complete Reset Successful! All old merchant data has been deleted for fresh manual testing. ===');
}

main().catch(console.error).finally(() => prisma.$disconnect());

