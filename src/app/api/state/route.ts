// GET /api/state — returns the full snapshot for the authenticated merchant.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function GET(req: NextRequest) {
  // merchantId is injected by middleware from JWT token
  const merchantId = req.headers.get('x-merchant-id')
  
  // Find merchant by authenticated ID; fall back to first if no session (dev support page)
  const merchant = merchantId
    ? await db.merchant.findUnique({ where: { id: merchantId } })
    : await db.merchant.findFirst({ orderBy: { createdAt: 'asc' } })
    
  if (!merchant) return err("Merchant not found", 404)

  const [
    staff,
    customers,
    stampCards,
    customerStampCards,
    rewards,
    bills,
    redemptions,
    referrals,
    auditLogs,
    waMessages,
    subscriptions,
    reviews,
    birthdays,
    vipTiers,
    winBacks,
    achievements,
    supportTickets,
    onboardingSteps,
    fraudAlerts,
    customerMergeLogs,
    merchantTransferLogs,
    rewardWaitlists,
    cardRuleChangeLogs,
    campaignDeliveryLogs,
    ownerOverrideLogs,
    waitingCustomers,
    merchantGoogleConnections,
  ] = await Promise.all([
    db.staff.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" } }),
    db.customer.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }),
    db.stampCard.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" } }),
    db.customerStampCard.findMany({ where: { merchantId: merchant.id }, include: { stamps: true }, orderBy: { createdAt: "desc" } }),
    db.reward.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" } }),
    db.bill.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.redemption.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.referral.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }),
    db.auditLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.whatsAppMessage.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.subscription.findMany({ where: { merchantId: merchant.id } }),
    db.review.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }),
    db.birthday.findMany({ where: { merchantId: merchant.id } }),
    db.vipTier.findMany({ where: { merchantId: merchant.id }, orderBy: { minLifetimeSpend: "asc" } }),
    db.winBackEscalation.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }),
    db.achievement.findMany({
      where: { customer: { merchantId: merchant.id } },
      orderBy: { earnedAt: "desc" },
    }).catch(() => []),
    db.supportTicket.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }),
    db.onboardingStep.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" } }),
    // V6.1 policy support
    db.fraudAlert.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.customerMergeLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }).catch(() => []),
    db.merchantTransferLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }).catch(() => []),
    db.rewardWaitlist.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }).catch(() => []),
    db.cardRuleChangeLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }).catch(() => []),
    db.campaignDeliveryLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.ownerOverrideLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" } }).catch(() => []),
    db.waitingCustomer.findMany({ where: { merchantId: merchant.id, status: 'waiting' }, include: { customer: true }, orderBy: { scannedAt: "desc" }, take: 50 }).catch(() => []),
    db.merchantGoogleConnection.findMany({ where: { merchantId: merchant.id } }).catch(() => []),
  ])

  return ok({
    merchant,
    staff,
    customers,
    stampCards,
    customerStampCards,
    rewards,
    bills,
    redemptions,
    referrals,
    auditLogs,
    waMessages,
    subscriptions,
    // V6 additions
    reviews,
    birthdays,
    vipTiers,
    winBacks,
    achievements: achievements as any[],
    supportTickets,
    onboardingSteps,
    // V6.1 policy support
    fraudAlerts: fraudAlerts as any[],
    customerMergeLogs,
    merchantTransferLogs,
    rewardWaitlists,
    cardRuleChangeLogs,
    campaignDeliveryLogs,
    ownerOverrideLogs,
    waitingCustomers: waitingCustomers as any[],
    merchantGoogleConnections: merchantGoogleConnections as any[],
  })
}
