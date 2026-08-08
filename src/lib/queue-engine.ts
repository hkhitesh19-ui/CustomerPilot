// CustomerPilot V12 — Queue Engine with Unified Communication Pipeline
import { db } from "@/lib/db"
import { awardStampsForBill } from "@/lib/stamp-engine"
import { QUEUE_TIMEOUT_BY_BUSINESS, RESERVATION_TIMEOUT_SECONDS, UNDO_WINDOW_SECONDS, canTransition } from "@/lib/queue-state-machine"
import { CommunicationService } from "@/communication/services/CommunicationService"
import { scheduleGoogleReviewRequest } from "@/lib/review-scheduler"

export const QUEUE_TIMEOUT_MINUTES = 5

export interface QueueJoinResult {
  queueId: string
  customerId: string
  isNewCustomer: boolean
  customerName: string
  position: number
  expiresAt: Date
}

export async function joinQueue(opts: {
  merchantId: string
  phone: string
  name?: string
  scanSource?: string
}): Promise<QueueJoinResult> {
  const { merchantId, phone, name } = opts

  let customer = await db.customer.findFirst({
    where: { merchantId, phone },
  })

  const isNewCustomer = !customer

  if (!customer) {
    const customerName = name || `Customer ${phone.slice(-4)}`
    const referralCode = "CP-" + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
    customer = await db.customer.create({
      data: {
        merchantId,
        name: customerName,
        phone,
        acquisitionChan: "qr_scan",
        referralCode,
        whatsappOptIn: true,
        lastActiveAt: new Date(),
      },
    })

    // Dispatch Welcome WhatsApp via CommunicationService
    await CommunicationService.dispatch({
      to: phone,
      templateName: "qr_welcome",
      variables: { name: customerName },
      metadata: { merchantId, customerId: customer.id }
    }).catch(e => console.error("[joinQueue] Dispatch Error:", e))

    await db.achievement.create({
      data: {
        customerId: customer.id,
        type: "first_stamp",
        label: "First Scan",
        description: "Scanned QR for the first time",
      },
    })
  } else {
    await db.customer.update({
      where: { id: customer.id },
      data: { lastActiveAt: new Date() },
    })
  }

  const existingWaiting = await db.waitingCustomer.findFirst({
    where: { customerId: customer.id, status: "waiting" },
  })
  if (existingWaiting) {
    return {
      queueId: existingWaiting.id,
      customerId: customer.id,
      isNewCustomer: false,
      customerName: customer.name,
      position: await getQueuePosition(existingWaiting.id, merchantId),
      expiresAt: existingWaiting.expiresAt,
    }
  }

  const expiresAt = new Date(Date.now() + QUEUE_TIMEOUT_MINUTES * 60 * 1000)
  const queueEntry = await db.waitingCustomer.create({
    data: {
      merchantId,
      customerId: customer.id,
      status: "waiting",
      scannedAt: new Date(),
      expiresAt,
      scanSource: opts.scanSource ?? "qr_whatsapp",
    },
  })

  const position = await getQueuePosition(queueEntry.id, merchantId)

  await db.auditLog.create({
    data: {
      merchantId,
      actorType: "CUSTOMER",
      actorId: customer.id,
      action: "QUEUE_JOINED",
      entity: "WaitingCustomer",
      entityId: queueEntry.id,
      metadata: JSON.stringify({ customerId: customer.id, isNewCustomer, position }),
    },
  })

  return {
    queueId: queueEntry.id,
    customerId: customer.id,
    isNewCustomer,
    customerName: customer.name,
    position,
    expiresAt,
  }
}

async function getQueuePosition(queueId: string, merchantId: string): Promise<number> {
  const waiting = await db.waitingCustomer.findMany({
    where: { merchantId, status: "waiting" },
    orderBy: { scannedAt: "asc" },
  })
  const idx = waiting.findIndex((w) => w.id === queueId)
  return idx >= 0 ? idx + 1 : 0
}

export async function claimFromQueue(opts: {
  staffId: string
  queueId: string
  amount?: number
}): Promise<{ ok: boolean; stampsAwarded: number; cardCompleted: boolean; reason?: string }> {
  const { staffId, queueId, amount } = opts

  const queueEntry = await db.waitingCustomer.findUnique({
    where: { id: queueId },
    include: { customer: true },
  })
  if (!queueEntry) return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: "Queue entry not found" }
  if (queueEntry.status !== "waiting" && !(queueEntry.status === "reserved" && queueEntry.reservedById === staffId)) {
    return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: `Already ${queueEntry.status}` }
  }

  if (new Date() > queueEntry.expiresAt) {
    await db.waitingCustomer.update({
      where: { id: queueId },
      data: { status: "expired" },
    })
    return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: "Queue entry expired" }
  }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== queueEntry.merchantId) {
    return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: "Staff not found" }
  }

  if (staff.requireManagerApprovalUntil && new Date() < staff.requireManagerApprovalUntil) {
    return {
      ok: false,
      stampsAwarded: 0,
      cardCompleted: false,
      reason: `Manager approval required — cashier flagged until ${staff.requireManagerApprovalUntil.toISOString()}`,
    }
  }

  const merchant = await db.merchant.findUnique({ where: { id: queueEntry.merchantId } })
  if (!merchant) return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: "Merchant not found" }

  const billNumber = `CP-${new Date().getFullYear()}-${String(await db.bill.count({ where: { merchantId: merchant.id } }) + 1).padStart(4, "0")}`
  // Round to 2dp to prevent float drift — SQLite has no Decimal type (same guard as bills/route.ts)
  const billAmount = Math.round((amount ?? 0) * 100) / 100

  const bill = await db.bill.create({
    data: {
      merchantId: merchant.id,
      customerId: queueEntry.customerId,
      issuedById: staffId,
      number: billNumber,
      amount: billAmount,
      stampsAwarded: 0,
      status: "confirmed",
      notes: `Claimed from queue (scan source: ${queueEntry.scanSource})`,
    },
  })

  let stampsAwarded = 0
  let cardCompleted = false

  if (billAmount > 0) {
    const result = await awardStampsForBill({
      merchantId: merchant.id,
      customerId: queueEntry.customerId,
      billId: bill.id,
      amount: billAmount,
    })
    stampsAwarded = result.stampsAwarded
    cardCompleted = result.cardCompleted

    await db.bill.update({
      where: { id: bill.id },
      data: { stampsAwarded },
    })

    if (queueEntry.customer.whatsappOptIn && queueEntry.customer.phone) {
      const template = await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } })
      if (template) {
        const card = await db.customerStampCard.findFirst({
          where: { customerId: queueEntry.customerId, stampCardId: template.id, completed: false, redeemed: false },
        })
        const currentStamps = card?.stampsCollected ?? 0
        const remaining = Math.max(0, template.stampsRequired - currentStamps)

        if (cardCompleted) {
          await CommunicationService.dispatch({
            to: queueEntry.customer.phone,
            templateName: "reward_ready",
            variables: { name: queueEntry.customer.name, cardName: template.name, rewardName: template.rewardName },
            metadata: { merchantId: merchant.id, customerId: queueEntry.customerId }
          }).catch(e => console.error("[claimFromQueue] Dispatch Error:", e))
        } else {
          await CommunicationService.dispatch({
            to: queueEntry.customer.phone,
            templateName: "stamp_earned",
            variables: { name: queueEntry.customer.name, stampsEarned: String(stampsAwarded), total: String(currentStamps), goal: String(template.stampsRequired), remaining: String(remaining) },
            metadata: { merchantId: merchant.id, customerId: queueEntry.customerId }
          }).catch(e => console.error("[claimFromQueue] Dispatch Error:", e))
        }
      }
      // Schedule Google Review request based on merchant delay configuration
      await scheduleGoogleReviewRequest({
        merchantId: merchant.id,
        customerId: queueEntry.customerId,
      }).catch(e => console.error("[claimFromQueue] Review Scheduler Error:", e))
    }
  } else {
    const template = await db.stampCard.findFirst({ where: { merchantId: merchant.id, active: true } })
    if (template) {
      const result = await awardStampsForBill({
        merchantId: merchant.id,
        customerId: queueEntry.customerId,
        billId: bill.id,
        amount: 0,
      })
      stampsAwarded = result.stampsAwarded
      cardCompleted = result.cardCompleted
    }
  }

  // RACE CONDITION FIX: Atomically verify status is still 'waiting/reserved' and mark as 'claimed'
  try {
    await db.$transaction(async (tx) => {
      const freshEntry = await tx.waitingCustomer.findUnique({ where: { id: queueId } })
      if (!freshEntry) throw new Error('NOT_FOUND')
      if (freshEntry.status !== 'waiting' && !(freshEntry.status === 'reserved' && freshEntry.reservedById === staffId)) {
        throw new Error(`ALREADY_${freshEntry.status.toUpperCase()}`)
      }

      await tx.waitingCustomer.update({
        where: { id: queueId },
        data: {
          status: 'claimed',
          claimedAt: new Date(),
          claimedById: staffId,
          amount: billAmount,
          stampsAwarded,
          undoWindowUntil: new Date(Date.now() + UNDO_WINDOW_SECONDS * 1000),
        },
      })
    })
  } catch (txError: any) {
    if (txError.message === 'NOT_FOUND') return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: 'Queue entry not found' }
    if (txError.message?.startsWith('ALREADY_')) {
      const status = txError.message.replace('ALREADY_', '').toLowerCase()
      return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: `Already ${status}` }
    }
    console.error('[claimFromQueue] Transaction error:', txError)
    return { ok: false, stampsAwarded: 0, cardCompleted: false, reason: 'Server error during claim' }
  }

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "QUEUE_CLAIMED",
      entity: "WaitingCustomer",
      entityId: queueId,
      metadata: JSON.stringify({
        customerId: queueEntry.customerId,
        customerName: queueEntry.customer.name,
        amount: billAmount,
        stampsAwarded,
        cardCompleted,
      }),
    },
  })

  return { ok: true, stampsAwarded, cardCompleted }
}

export async function undoClaim(opts: {
  staffId: string
  queueId: string
  reason?: string
}): Promise<{ ok: boolean; reason?: string }> {
  const { staffId, queueId } = opts
  const queueEntry = await db.waitingCustomer.findUnique({
    where: { id: queueId },
    include: { customer: true },
  })
  if (!queueEntry) return { ok: false, reason: "Queue entry not found" }
  if (queueEntry.status !== "claimed") return { ok: false, reason: "Entry is not claimed" }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== queueEntry.merchantId) {
    return { ok: false, reason: "Staff not found" }
  }

  await db.waitingCustomer.update({
    where: { id: queueId },
    data: {
      status: "recovered",
      recoveredAt: new Date(),
      recoveredById: staffId,
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: queueEntry.merchantId,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "QUEUE_UNDONE",
      entity: "WaitingCustomer",
      entityId: queueId,
      metadata: JSON.stringify({
        customerName: queueEntry.customer.name,
        stampsReversed: queueEntry.stampsAwarded,
        reason: opts.reason,
      }),
    },
  })

  return { ok: true }
}

export async function expireQueue(merchantId: string): Promise<number> {
  const result = await db.waitingCustomer.updateMany({
    where: {
      merchantId,
      status: "waiting",
      expiresAt: { lt: new Date() },
    },
    data: { status: "expired" },
  })
  return result.count
}

export async function getQueue(merchantId: string) {
  const waiting = await db.waitingCustomer.findMany({
    where: { merchantId, status: "waiting" },
    orderBy: { scannedAt: "desc" },
    include: { customer: true },
  })

  const now = new Date()
  return waiting
    .filter((w) => w.expiresAt > now)
    .map((w) => ({
      id: w.id,
      customerId: w.customerId,
      customerName: w.customer.name,
      customerPhone: w.customer.phone,
      scannedAt: w.scannedAt,
      expiresAt: w.expiresAt,
      waitingSeconds: Math.floor((now.getTime() - w.scannedAt.getTime()) / 1000),
      vipTier: w.customer.vipTier,
      isReturning: w.customer.lifetimeStamps > 0,
      hasBirthday: w.customer.birthday !== null,
      isNew: w.customer.lifetimeStamps === 0,
      status: w.status,
      reservedBy: w.reservedById,
      reservationExpiresAt: w.reservationExpiresAt,
    }))
}

export async function reserveFromQueue(opts: {
  staffId: string
  queueId: string
}): Promise<{ ok: boolean; reason?: string; reservationExpiresAt?: Date }> {
  const { staffId, queueId } = opts

  const queueEntry = await db.waitingCustomer.findUnique({
    where: { id: queueId },
  })
  if (!queueEntry) return { ok: false, reason: "Queue entry not found" }

  if (!canTransition(queueEntry.status, "reserved")) {
    return { ok: false, reason: `Cannot reserve — entry is '${queueEntry.status}'` }
  }

  if (new Date() > queueEntry.expiresAt) {
    await db.waitingCustomer.update({
      where: { id: queueId },
      data: { status: "expired" },
    })
    return { ok: false, reason: "Queue entry expired" }
  }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== queueEntry.merchantId) {
    return { ok: false, reason: "Staff not found" }
  }

  const reservationExpiresAt = new Date(Date.now() + RESERVATION_TIMEOUT_SECONDS * 1000)
  await db.waitingCustomer.update({
    where: { id: queueId },
    data: {
      status: "reserved",
      reservedAt: new Date(),
      reservedById: staffId,
      reservationExpiresAt,
    },
  })

  return { ok: true, reservationExpiresAt }
}

export async function releaseReservation(opts: {
  staffId: string
  queueId: string
  reason?: string
}): Promise<{ ok: boolean }> {
  const { staffId, queueId } = opts
  const queueEntry = await db.waitingCustomer.findUnique({ where: { id: queueId } })
  if (!queueEntry) return { ok: false }
  if (queueEntry.status !== "reserved") return { ok: false }
  if (queueEntry.reservedById !== staffId) return { ok: false }

  await db.waitingCustomer.update({
    where: { id: queueId },
    data: {
      status: "waiting",
      reservedAt: null,
      reservedById: null,
      reservationExpiresAt: null,
    },
  })

  return { ok: true }
}

export async function validateAmount(opts: {
  merchantId: string
  amount: number
}): Promise<{ isOutlier: boolean; warning?: string; average?: number }> {
  const { merchantId, amount } = opts

  if (amount <= 0) return { isOutlier: false }

  const recentBills = await db.bill.findMany({
    where: { merchantId, status: "confirmed", amount: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { amount: true },
  })

  if (recentBills.length < 10) {
    return { isOutlier: false }
  }

  const amounts = recentBills.map((b) => b.amount)
  const average = amounts.reduce((s, a) => s + a, 0) / amounts.length
  const max = Math.max(...amounts)

  if (amount > average * 5 && amount > max * 2) {
    return {
      isOutlier: true,
      warning: `₹${amount} looks unusual. Your average is ₹${Math.round(average)}. Your max is ₹${Math.round(max)}. Continue?`,
      average: Math.round(average),
    }
  }

  return { isOutlier: false, average: Math.round(average) }
}
