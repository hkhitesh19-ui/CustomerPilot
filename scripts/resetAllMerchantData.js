const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAllMerchantData() {
  console.log('=== Starting Complete Merchant & Transactional Data Reset ===');

  try {
    const merchantCount = await prisma.merchant.count();
    const customerCount = await prisma.customer.count();
    console.log(`Found ${merchantCount} merchant(s) and ${customerCount} customer(s) to remove.`);

    console.log('Cleaning transactional logs, messages, and queues...');
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

    console.log('Clearing customers...');
    await prisma.customer.updateMany({ data: { referredById: null } });
    await prisma.customer.deleteMany();

    console.log('Deleting all merchants and merchant user accounts...');
    await prisma.merchant.deleteMany();

    try {
      await prisma.user.deleteMany();
    } catch (e) {
      console.log('User table delete skipped');
    }

    console.log('=== ✅ Complete Reset Successful! Database is now 100% clean for fresh manual testing. ===');
  } catch (error) {
    console.error('Error during reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllMerchantData();
