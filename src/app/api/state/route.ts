// GET /api/state — returns the full snapshot for the authenticated merchant.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    // merchantId is injected by middleware from JWT token
    const merchantId = req.headers.get('x-merchant-id')

    // SECURITY: Require authenticated merchantId — never expose other merchants' data
    if (!merchantId) {
      return err('Unauthorized', 401)
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
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
    db.staff.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" }, take: 100 }),
    db.customer.findMany({ where: { merchantId: merchant.id, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 500 }),
    db.stampCard.findMany({ where: { merchantId: merchant.id, active: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
    db.customerStampCard.findMany({ where: { merchantId: merchant.id }, include: { stamps: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    db.reward.findMany({ where: { merchantId: merchant.id, active: true, deletedAt: null }, orderBy: { createdAt: "asc" }, take: 100 }),
    db.bill.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.redemption.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.referral.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.auditLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.whatsAppMessage.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.subscription.findMany({ where: { merchantId: merchant.id } }),
    db.review.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.birthday.findMany({ where: { merchantId: merchant.id }, take: 500 }),
    db.vipTier.findMany({ where: { merchantId: merchant.id }, orderBy: { minLifetimeSpend: "asc" }, take: 20 }),
    db.winBackEscalation.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.achievement.findMany({
      where: { customer: { merchantId: merchant.id } },
      orderBy: { earnedAt: "desc" },
      take: 200,
    }).catch(() => []),
    db.supportTicket.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    db.onboardingStep.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" } }),
    // V6.1 policy support
    db.fraudAlert.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.customerMergeLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.merchantTransferLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.rewardWaitlist.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.cardRuleChangeLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.campaignDeliveryLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
    db.ownerOverrideLog.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []),
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
  } catch (error: unknown) {
    console.error('[State GET Error]', error)
    return err('Failed to load dashboard state', 500)
  }
}
