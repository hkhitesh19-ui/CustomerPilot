// GET /api/state — returns the full snapshot for the authenticated merchant.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import {
  QR_WA_DISMISS_ACTION,
  QR_WA_REDIRECT_ACTION,
  annotateQueueWaStatus,
  computePendingScanAlerts,
} from "@/lib/web-checkin"

export async function GET(req: NextRequest) {
  try {
    // merchantId is injected by middleware from JWT token
    let merchantId = req.headers.get('x-merchant-id')
    const userRole = req.headers.get('x-user-role')

    if (!merchantId || merchantId === 'admin_merchant') {
      if (userRole === 'super_admin') {
        merchantId = 'cmw1vwviv06f3kvwlkx62ghap' // Default to CustomerPilot HQ
      }
    }

    // SECURITY: Require authenticated merchantId — never expose other merchants' data
    if (!merchantId) {
      return err('Unauthorized', 401)
    }

    let merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant && userRole === 'super_admin') {
      merchant = await db.merchant.findFirst({
        where: { status: 'active' },
        orderBy: { createdAt: 'asc' }
      })
    }
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
    digitalBusinessCard,
    recentScanLogs,
    recentDismissLogs,
    recentWaitingAnyStatus,
    recentIncomingWa,
  ] = await Promise.all([
    db.staff.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "asc" }, take: 100 }),
    db.customer.findMany({ where: { merchantId: merchant.id, deletedAt: null }, orderBy: { createdAt: "desc" }, take: 500 }),
    db.stampCard.findMany({ where: { merchantId: merchant.id, active: true }, orderBy: { updatedAt: "desc" }, take: 10 }),
    db.customerStampCard.findMany({ where: { merchantId: merchant.id }, include: { stamps: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    db.reward.findMany({ where: { merchantId: merchant.id, active: true, deletedAt: null }, orderBy: { createdAt: "asc" }, take: 100 }),
    db.bill.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.redemption.findMany({ where: { merchantId: merchant.id }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.referral.findMany({ where: { merchantId: merchant.id }, include: { referrer: true, friendCustomer: true }, orderBy: { createdAt: "desc" }, take: 200 }),
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
    db.waitingCustomer.findMany({ 
      where: { 
        merchantId: merchant.id, 
        status: 'waiting',
        // V13 FIX: Filter out expired entries at DB level so dashboard shows real active queue.
        // Previously, state API returned ALL 'waiting' status entries even if expiresAt had passed.
        // The getQueue() lib function had this filter but the state route did not, causing mismatch.
        expiresAt: { gt: new Date() }
      }, 
      include: { 
        customer: {
          include: {
            referredBy: { select: { id: true, name: true, phone: true } },
            referralsReceived: {
              include: {
                referrer: { select: { id: true, name: true, phone: true } }
              }
            }
          }
        } 
      }, 
      orderBy: { scannedAt: "desc" }, 
      take: 50 
    }).catch(() => []),
    db.merchantGoogleConnection.findMany({ where: { merchantId: merchant.id } }).catch(() => []),
    db.digitalBusinessCard.findUnique({ where: { merchantId: merchant.id } }).catch(() => null),
    db.auditLog.findMany({
      where: {
        merchantId: merchant.id,
        action: QR_WA_REDIRECT_ACTION,
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, createdAt: true, metadata: true },
    }).catch(() => []),
    db.auditLog.findMany({
      where: {
        merchantId: merchant.id,
        action: QR_WA_DISMISS_ACTION,
        createdAt: { gte: new Date(Date.now() - 20 * 60 * 1000) },
      },
      select: { entityId: true, metadata: true },
    }).catch(() => []),
    db.waitingCustomer.findMany({
      where: {
        merchantId: merchant.id,
        scannedAt: { gte: new Date(Date.now() - 20 * 60 * 1000) },
      },
      select: { scannedAt: true },
    }).catch(() => []),
    db.whatsAppMessage.findMany({
      where: {
        merchantId: merchant.id,
        template: "INCOMING",
        createdAt: { gte: new Date(Date.now() - 40 * 60 * 1000) },
      },
      select: { toPhone: true, createdAt: true, template: true, body: true },
    }).catch(() => []),
  ])

  const annotatedWaitingCustomers = annotateQueueWaStatus({
    waitingEntries: waitingCustomers,
    incomingMessages: recentIncomingWa,
  })
  const pendingScanAlerts = computePendingScanAlerts({
    scanLogs: recentScanLogs,
    dismissLogs: recentDismissLogs,
    waitingEntries: recentWaitingAnyStatus,
    incomingMessages: recentIncomingWa,
  })

  return ok({
    merchant,
    digitalBusinessCard,
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
    waitingCustomers: annotatedWaitingCustomers as any[],
    pendingScanAlerts,
    merchantGoogleConnections: merchantGoogleConnections as any[],
  })
  } catch (error: unknown) {
    console.error('[State GET Error]', error)
    return err('Failed to load dashboard state', 500)
  }
}
