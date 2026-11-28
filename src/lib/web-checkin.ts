import { db } from "@/lib/db"
import { normalizePhone } from "@/lib/utils"
import { resolveLoyaltyCategoryName } from "@/lib/loyalty-category-service"
import { sendWhatsAppNotification } from "@/lib/whatsapp-notify"

export const CHECKIN_TIMEOUT_MINUTES = 30
export const QR_WA_REDIRECT_ACTION = "QR_WA_REDIRECT_SCAN"
export const QR_WA_DISMISS_ACTION = "QR_WA_SCAN_DISMISSED"
export const WEB_CHECKIN_JOIN_ACTION = "WEB_CHECKIN_JOINED"

export type PhoneValidationResult =
  | { ok: true; normalized: string; last10: string }
  | { ok: false; error: string }

export type WaConfirmStatus = "wa_verified" | "web_instant" | "pending_wa"

export interface PendingScanAlert {
  scanId: string
  scannedAt: string
  source: string
  status: "awaiting_wa" | "drop_suspected"
  elapsedSeconds: number
}

export interface MerchantCheckinSummary {
  merchantId: string
  name: string
  shortName: string
  logoUrl: string | null
  whatsappPhone: string | null
  cardSlug: string | null
  isActive: boolean
  isTrialExpired: boolean
  stampCard: {
    id?: string
    name: string
    rewardName: string
    stampValue: number
    stampsRequired: number
    googleReviewBonus: number
  }
}

export interface WebCheckinResult {
  queueId: string
  customerId: string
  customerName: string
  phone: string
  position: number
  expiresAt: Date
  alreadyWaiting: boolean
  isNewCustomer: boolean
  merchantId: string
  merchantName: string
  waConfirmUrl: string | null
}

/**
 * Derive a clean customer-facing store name without overflowing SEO suffixes.
 */
export function getCleanStoreName(rawName?: string | null): string {
  const clean = (rawName || "Store").trim()
  if (!clean) return "Store"
  const split = clean.split(/\s*(?:\(|:|\||—|–)\s*/)[0]?.trim()
  if (split && split.length >= 3) {
    return split.slice(0, 48)
  }
  return clean.slice(0, 48)
}

/**
 * Strip unsafe characters from customer-entered display names before storing or echoing.
 */
export function sanitizeCheckinName(raw?: string | null): string {
  if (!raw || typeof raw !== "string") return ""
  return raw
    .trim()
    .replace(/[<>"'`\0]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 60)
}

/**
 * Validate and normalize mobile phone numbers for Indian/international WhatsApp delivery.
 */
export function validateCheckinPhone(raw?: string | null): PhoneValidationResult {
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "Please enter a valid 10-digit WhatsApp mobile number." }
  }
  const normalized = normalizePhone(raw.trim())
  if (!normalized) {
    return { ok: false, error: "Please enter a valid 10-digit WhatsApp mobile number." }
  }
  if (normalized.length < 10 || normalized.length > 15) {
    return { ok: false, error: "Phone number must be between 10 and 15 digits." }
  }
  const last10 = normalized.slice(-10)
  // Reject trivial single-digit repeated test patterns like 0000000000 or 9999999999
  if (/^(\d)\1{9}$/.test(last10)) {
    return { ok: false, error: "Please enter a genuine WhatsApp mobile number." }
  }
  return { ok: true, normalized, last10 }
}

/**
 * Build WhatsApp deep-link URL:
 * - "confirm_done": Sent AFTER Web Check-in succeeds; avoids QR trigger phrases & wallet keywords
 *   so frozen evolution webhook logs INCOMING telemetry without emitting duplicate queue notices.
 * - "fallback_direct": Traditional QR trigger phrase for customers opting out of the web form.
 */
export function buildWebCheckinWhatsappUrl(params: {
  whatsappPhone?: string | null
  phoneNumber?: string | null
  displayName: string
  mode: "confirm_done" | "fallback_direct"
  referralCode?: string | null
}): string | null {
  const rawPhone = normalizePhone(params.whatsappPhone || params.phoneNumber || "")
  if (!rawPhone) return null

  const shortName = getCleanStoreName(params.displayName)
  if (params.mode === "confirm_done") {
    const text = `Hi ${shortName}! VIP Check-in Done ✅`
    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`
  }

  const refSuffix = params.referralCode ? ` ${params.referralCode.trim().toUpperCase()}` : ""
  const text = `Hi ${shortName}! Checking in for my VIP Club stamps (ref:counter)${refSuffix} 🎁`
  return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`
}

/**
 * Resolve public merchant & loyalty summary by merchantId or digital card slug.
 */
export async function resolveMerchantForCheckin(opts: {
  merchantId?: string | null
  slug?: string | null
}): Promise<MerchantCheckinSummary | null> {
  const mId = opts.merchantId?.trim() || ""
  const cardSlug = opts.slug?.trim().toLowerCase() || ""
  if (!mId && !cardSlug) return null

  let resolvedMerchantId = mId
  if (!resolvedMerchantId && cardSlug) {
    const card = await db.digitalBusinessCard.findUnique({
      where: { slug: cardSlug },
      select: { merchantId: true },
    })
    if (!card?.merchantId) return null
    resolvedMerchantId = card.merchantId
  }

  const merchant = await db.merchant.findUnique({
    where: { id: resolvedMerchantId },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      whatsappPhone: true,
      status: true,
      trialEndsAt: true,
      digitalBusinessCard: {
        select: { slug: true, whatsappNumber: true, phoneNumber: true, logoUrl: true },
      },
      stampCards: {
        where: { active: true },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          id: true,
          name: true,
          rewardName: true,
          stampValue: true,
          stampsRequired: true,
          googleReviewBonus: true,
        },
      },
    },
  })

  if (!merchant) return null

  const isTrialExpired = Boolean(
    merchant.trialEndsAt && new Date(merchant.trialEndsAt).getTime() < Date.now()
  )
  const shortName = getCleanStoreName(merchant.name)
  const activeCard = merchant.stampCards[0]

  return {
    merchantId: merchant.id,
    name: merchant.name,
    shortName,
    logoUrl: merchant.logoUrl || merchant.digitalBusinessCard?.logoUrl || null,
    whatsappPhone: normalizePhone(
      merchant.whatsappPhone ||
        merchant.digitalBusinessCard?.whatsappNumber ||
        merchant.digitalBusinessCard?.phoneNumber ||
        ""
    ),
    cardSlug: merchant.digitalBusinessCard?.slug || null,
    isActive: merchant.status !== "suspended" && !isTrialExpired,
    isTrialExpired,
    stampCard: {
      id: activeCard?.id,
      name: activeCard?.name || `${shortName} VIP Club`,
      rewardName: activeCard?.rewardName || "FREE Special Treat",
      stampValue: activeCard?.stampValue || 500,
      stampsRequired: activeCard?.stampsRequired || 10,
      googleReviewBonus: activeCard?.googleReviewBonus || 0,
    },
  }
}

/**
 * Pure helper: compute LiveQueue WhatsApp verification badge for waiting entries.
 */
export function annotateQueueWaStatus<
  T extends {
    scannedAt: Date | string
    scanSource?: string | null
    customer?: { phone?: string | null } | null
  }
>(params: {
  waitingEntries: T[]
  incomingMessages: Array<{ toPhone: string; createdAt: Date | string; template: string }>
  now?: Date
}): Array<T & { waConfirmStatus: WaConfirmStatus }> {
  const nowMs = (params.now || new Date()).getTime()

  return params.waitingEntries.map((entry) => {
    const source = entry.scanSource || ""
    if (!source.startsWith("qr_web")) {
      return { ...entry, waConfirmStatus: "wa_verified" as const }
    }

    const scannedMs = new Date(entry.scannedAt).getTime()
    const custDigits = (entry.customer?.phone || "").replace(/\D/g, "")
    const last10 = custDigits.slice(-10)

    const matchedInbound = last10.length === 10 && params.incomingMessages.some((msg) => {
      if (msg.template !== "INCOMING") return false
      const msgDigits = (msg.toPhone || "").replace(/\D/g, "")
      const msgMs = new Date(msg.createdAt).getTime()
      return msgDigits.slice(-10) === last10 && msgMs >= scannedMs - 30_000
    })

    if (matchedInbound) {
      return { ...entry, waConfirmStatus: "wa_verified" as const }
    }
    if (nowMs - scannedMs >= 90_000) {
      return { ...entry, waConfirmStatus: "pending_wa" as const }
    }
    return { ...entry, waConfirmStatus: "web_instant" as const }
  })
}

/**
 * Pure helper: detect QR->WhatsApp skip scans that did NOT materialize in LiveQueue or inbound logs.
 */
export function computePendingScanAlerts(params: {
  scanLogs: Array<{ id: string; createdAt: Date | string; metadata: string | null }>
  dismissLogs: Array<{ entityId: string | null; metadata: string | null }>
  waitingEntries: Array<{ scannedAt: Date | string }>
  incomingMessages: Array<{ template: string; createdAt: Date | string; body: string }>
  now?: Date
  windowMinutes?: number
}): PendingScanAlert[] {
  const nowMs = (params.now || new Date()).getTime()
  const maxAgeMs = (params.windowMinutes ?? 15) * 60 * 1000

  const dismissedIds = new Set<string>()
  for (const d of params.dismissLogs) {
    if (d.entityId) dismissedIds.add(d.entityId)
    if (d.metadata) {
      try {
        const parsed = JSON.parse(d.metadata) as { scanId?: string }
        if (parsed.scanId) dismissedIds.add(parsed.scanId)
      } catch {
        // Ignore malformed metadata
      }
    }
  }

  const alerts: PendingScanAlert[] = []

  for (const log of params.scanLogs) {
    const scanMs = new Date(log.createdAt).getTime()
    const ageMs = nowMs - scanMs
    if (ageMs < 0 || ageMs > maxAgeMs) continue

    let scanId = log.id
    let source = "qr_counter"
    if (log.metadata) {
      try {
        const meta = JSON.parse(log.metadata) as { scanId?: string; source?: string }
        if (meta.scanId) scanId = meta.scanId
        if (meta.source) source = meta.source
      } catch {
        // Ignore malformed metadata
      }
    }

    if (dismissedIds.has(scanId) || dismissedIds.has(log.id)) continue

    // Confirmed if ANY customer entered queue within -5s..+15m of this scan
    const matchedQueue = params.waitingEntries.some((w) => {
      const wMs = new Date(w.scannedAt).getTime()
      return wMs >= scanMs - 5_000 && wMs <= scanMs + maxAgeMs
    })
    if (matchedQueue) continue

    // Confirmed if ANY trigger-like incoming WhatsApp arrived right after scan
    const matchedTriggerMsg = params.incomingMessages.some((m) => {
      if (m.template !== "INCOMING") return false
      const mMs = new Date(m.createdAt).getTime()
      if (mMs < scanMs - 5_000 || mMs > scanMs + maxAgeMs) return false
      return /checking in|vip.*stamps?|club stamps?/i.test(m.body || "")
    })
    if (matchedTriggerMsg) continue

    const elapsedSeconds = Math.max(0, Math.floor(ageMs / 1000))
    alerts.push({
      scanId,
      scannedAt: new Date(scanMs).toISOString(),
      source,
      status: elapsedSeconds >= 60 ? "drop_suspected" : "awaiting_wa",
      elapsedSeconds,
    })
  }

  return alerts.slice(0, 10)
}

/**
 * Execute guaranteed zero-drop customer check-in via HTTP (removes Evolution inbound decryption dependency).
 */
export async function performWebCheckin(opts: {
  merchantId?: string | null
  slug?: string | null
  phone: string
  name?: string | null
  scanSource?: string | null
  referralCode?: string | null
}): Promise<{ ok: true; data: WebCheckinResult } | { ok: false; status: number; error: string }> {
  const phoneCheck = validateCheckinPhone(opts.phone)
  if (!phoneCheck.ok) {
    return { ok: false, status: 400, error: phoneCheck.error }
  }
  const { normalized: normPhone, last10 } = phoneCheck

  const merchantSummary = await resolveMerchantForCheckin({
    merchantId: opts.merchantId,
    slug: opts.slug,
  })
  if (!merchantSummary) {
    return { ok: false, status: 404, error: "Store loyalty program not found." }
  }
  if (!merchantSummary.isActive) {
    return { ok: false, status: 403, error: "Store loyalty check-in is temporarily paused." }
  }

  const merchant = await db.merchant.findUnique({
    where: { id: merchantSummary.merchantId },
    select: {
      id: true,
      name: true,
      whatsappPhone: true,
      whatsappInstanceName: true,
      loyaltyCategoryNames: true,
    },
  })
  if (!merchant) {
    return { ok: false, status: 404, error: "Merchant not found." }
  }

  const cleanName = sanitizeCheckinName(opts.name)
  const cleanSource = (opts.scanSource || "qr_web_hybrid").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "qr_web_hybrid"

  // Resolve strict exact referral code if provided
  let pendingReferral = await db.referral.findFirst({
    where: {
      merchantId: merchant.id,
      status: "pending",
      OR: [
        { friendPhone: normPhone },
        { friendPhone: last10 },
        { friendPhone: `+${normPhone}` },
        { friendPhone: `91${last10}` },
      ],
    },
  })

  if (!pendingReferral && opts.referralCode) {
    const cleanRef = opts.referralCode.trim().toUpperCase()
    const referrer = await db.customer.findFirst({
      where: { merchantId: merchant.id, referralCode: cleanRef, deletedAt: null },
    })
    const referrerPhone = referrer ? (normalizePhone(referrer.phone) || referrer.phone) : ""
    if (referrer && referrerPhone !== normPhone && referrerPhone.slice(-10) !== last10) {
      pendingReferral = await db.referral.create({
        data: {
          merchantId: merchant.id,
          referrerId: referrer.id,
          friendPhone: normPhone,
          status: "pending",
          rewardType: "stamps",
          rewardAmount: 1,
        },
      }).catch(() => null)
    }
  }

  // Match without deletedAt filter first to avoid P2002 unique constraint collision on [merchantId, phone]
  let customer = await db.customer.findFirst({
    where: {
      merchantId: merchant.id,
      OR: [{ phone: normPhone }, { phone: last10 }, { phone: opts.phone.trim() }],
    },
  })

  const isNewCustomer = !customer

  if (!customer) {
    const initialCategory = resolveLoyaltyCategoryName(merchant.loyaltyCategoryNames, 0)
    const fallbackName = cleanName || `Customer ${last10.slice(-4)}`
    const referralCode = `CP-${last10.slice(-4)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    customer = await db.customer.create({
      data: {
        merchantId: merchant.id,
        name: fallbackName,
        phone: normPhone,
        vipTier: initialCategory,
        acquisitionChan: pendingReferral ? "referral" : "qr_scan",
        referredById: pendingReferral ? pendingReferral.referrerId : null,
        referralCode,
        whatsappOptIn: true,
        lastActiveAt: new Date(),
        // Keep IDLE so optional "VIP Check-in Done" WhatsApp confirmation cannot overwrite customer name
        botState: "IDLE",
        botStateUpdatedAt: new Date(),
      },
    })

    if (pendingReferral) {
      await db.referral.update({
        where: { id: pendingReferral.id },
        data: { friendCustomerId: customer.id },
      }).catch(() => {})
    }

    await db.achievement.create({
      data: {
        customerId: customer.id,
        type: "first_stamp",
        label: "First Scan",
        description: "Checked in via Web Loyalty QR",
      },
    }).catch(() => {})
  } else {
    const isPlaceholderName = /^Customer\s+\d{4}$/i.test(customer.name)
    const updatedName = cleanName && (isPlaceholderName || !customer.name) ? cleanName : undefined

    customer = await db.customer.update({
      where: { id: customer.id },
      data: {
        ...(customer.deletedAt ? { deletedAt: null } : {}),
        ...(updatedName ? { name: updatedName } : {}),
        ...(!customer.referredById && pendingReferral
          ? { referredById: pendingReferral.referrerId, acquisitionChan: "referral" }
          : {}),
        whatsappOptIn: true,
        lastActiveAt: new Date(),
        botState: "IDLE",
      },
    })

    if (pendingReferral && !pendingReferral.friendCustomerId) {
      await db.referral.update({
        where: { id: pendingReferral.id },
        data: { friendCustomerId: customer.id },
      }).catch(() => {})
    }
  }

  const now = new Date()
  const newExpiresAt = new Date(now.getTime() + CHECKIN_TIMEOUT_MINUTES * 60 * 1000)

  const existingWaiting = await db.waitingCustomer.findFirst({
    where: {
      merchantId: merchant.id,
      customerId: customer.id,
      status: "waiting",
    },
    orderBy: { scannedAt: "desc" },
  })

  let queueEntry: NonNullable<typeof existingWaiting>
  let alreadyWaiting = false

  if (existingWaiting && existingWaiting.expiresAt > now) {
    queueEntry = existingWaiting
    alreadyWaiting = true
  } else if (existingWaiting) {
    // Expired waiting row -> revive cleanly with fresh 30-min countdown
    queueEntry = await db.waitingCustomer.update({
      where: { id: existingWaiting.id },
      data: {
        scannedAt: now,
        expiresAt: newExpiresAt,
        scanSource: cleanSource,
      },
    })
  } else {
    queueEntry = await db.waitingCustomer.create({
      data: {
        merchantId: merchant.id,
        customerId: customer.id,
        status: "waiting",
        scannedAt: now,
        expiresAt: newExpiresAt,
        scanSource: cleanSource,
      },
    })
  }

  const activeWaiting = await db.waitingCustomer.findMany({
    where: {
      merchantId: merchant.id,
      status: "waiting",
      expiresAt: { gt: now },
    },
    orderBy: { scannedAt: "asc" },
    select: { id: true },
  })
  const idx = activeWaiting.findIndex((w) => w.id === queueEntry.id)
  const position = idx >= 0 ? idx + 1 : 1

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "CUSTOMER",
      actorId: customer.id,
      action: WEB_CHECKIN_JOIN_ACTION,
      entity: "WaitingCustomer",
      entityId: queueEntry.id,
      metadata: JSON.stringify({
        customerId: customer.id,
        phone: normPhone,
        isNewCustomer,
        alreadyWaiting,
        scanSource: cleanSource,
        position,
      }),
    },
  }).catch(() => {})

  // Outbound WhatsApp confirmation (best-effort, non-blocking: never fails check-in if Evolution API stalls)
  if (!alreadyWaiting && merchant.whatsappInstanceName) {
    const shortStore = getCleanStoreName(merchant.name)
    const confirmText = isNewCustomer
      ? `🎉 Welcome *${customer.name}* to *${shortStore} VIP Club*!\n\n✅ You are in the Live Queue (*#${position}*). Show this at billing to get your digital loyalty stamps! 🌟`
      : `👋 Welcome back, *${customer.name}*! ❤️\n\n✅ You're in the Live Queue (*#${position}*) at *${shortStore}*.\nOur team will add your stamps after billing! 🌟`

    void sendWhatsAppNotification(
      merchant.id,
      normPhone,
      confirmText,
      isNewCustomer ? "qr_welcome_web" : "queue_checkin_web"
    ).catch(() => {})
  }

  const waConfirmUrl = buildWebCheckinWhatsappUrl({
    whatsappPhone: merchant.whatsappPhone,
    displayName: merchant.name,
    mode: "confirm_done",
  })

  return {
    ok: true,
    data: {
      queueId: queueEntry.id,
      customerId: customer.id,
      customerName: customer.name,
      phone: normPhone,
      position,
      expiresAt: queueEntry.expiresAt,
      alreadyWaiting,
      isNewCustomer,
      merchantId: merchant.id,
      merchantName: merchantSummary.shortName,
      waConfirmUrl,
    },
  }
}
