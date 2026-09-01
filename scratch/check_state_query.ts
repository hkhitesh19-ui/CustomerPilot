import { db } from "../src/lib/db";

async function testStateQueries() {
  const merchant = await db.merchant.findFirst();
  if (!merchant) {
    console.log("No merchant found");
    return;
  }
  console.log("Testing queries for merchant:", merchant.id);

  const queries = [
    { name: "staff", fn: () => db.staff.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" }, take: 100 }) },
    { name: "customers", fn: () => db.customer.findMany({ where: { merchantId: merchant.id, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 500 }) },
    { name: "stampCards", fn: () => db.stampCard.findMany({ where: { merchantId: merchant.id, active: true }, orderBy: { updatedAt: "desc" }, take: 10 }) },
    { name: "customerStampCards", fn: () => db.customerStampCard.findMany({ where: { merchantId: merchant.id }, include: { stamps: true }, orderBy: { createdAt: "desc" }, take: 500 }) },
    { name: "rewards", fn: () => db.reward.findMany({ where: { merchantId: merchant.id, active: true, deletedAt: null }, orderBy: { createdAt: "asc" }, take: 100 }) },
    { name: "bills", fn: () => db.bill.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }) },
    { name: "redemptions", fn: () => db.redemption.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }) },
    { name: "referrals", fn: () => db.referral.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }) },
    { name: "auditLogs", fn: () => db.auditLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }) },
    { name: "waMessages", fn: () => db.whatsAppMessage.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 100 }) },
    { name: "subscriptions", fn: () => db.subscription.findMany({ where: { merchantId: merchant.id } }) },
    { name: "reviews", fn: () => db.review.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 100 }) },
    { name: "birthdays", fn: () => db.birthday.findMany({ where: { merchantId: merchant.id }, take: 500 }) },
    { name: "vipTiers", fn: () => db.vipTier.findMany({ where: { merchantId: merchant.id }, orderBy: { minSpend: "asc" } }) },
    { name: "winBacks", fn: () => db.winBackEscalation.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "achievements", fn: () => db.achievement.findMany({ where: { customer: { merchantId: merchant.id } }, take: 100 }) },
    { name: "supportTickets", fn: () => db.supportTicket.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "onboardingSteps", fn: () => db.onboardingStep.findMany({ where: { merchantId: merchant.id } }) },
    { name: "fraudAlerts", fn: () => db.fraudAlert.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "customerMergeLogs", fn: () => db.customerMergeLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "merchantTransferLogs", fn: () => db.merchantTransferLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "rewardWaitlists", fn: () => db.rewardWaitlist.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "cardRuleChangeLogs", fn: () => db.cardRuleChangeLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "campaignDeliveryLogs", fn: () => db.campaignDeliveryLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "ownerOverrideLogs", fn: () => db.ownerOverrideLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "waitingCustomers", fn: () => db.waitingCustomer.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }) },
    { name: "merchantGoogleConnections", fn: () => db.merchantGoogleConnection.findMany({ where: { merchantId: merchant.id } }) },
  ];

  for (const q of queries) {
    try {
      const res = await q.fn();
      console.log(`✅ [${q.name}] success: count=${Array.isArray(res) ? res.length : 1}`);
    } catch (e: any) {
      console.error(`❌ [${q.name}] FAILED:`, e.message);
    }
  }
}

testStateQueries().catch(console.error);
