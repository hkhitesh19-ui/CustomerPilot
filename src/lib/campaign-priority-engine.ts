// CustomerPilot V6 — Campaign Priority Engine
// Prevents WhatsApp message spam. 1 marketing message per customer per 48h.
// Transactional messages (stamp_earned, redemption_confirm, referral_bonus) always sent.
//
// Priority order (highest wins on collision):
//   1. birthday_reward_ready
//   2. birthday_reminder_sent
//   3. winback_day_60 / day_90 (these are phone_call tasks, not WhatsApp, so no collision)
//   4. winback_day_30 / day_45
//   5. vip_upgrade
//   6. festival_broadcast
//   7. review_request
//   8. stamp_earned (transactional — exempt)
//   9. redemption_confirm (transactional — exempt)

export type MessageType =
  | "birthday_reward_ready"
  | "birthday_reminder_sent"
  | "winback_day_30"
  | "winback_day_45"
  | "winback_day_60"
  | "winback_day_90"
  | "vip_upgrade"
  | "festival_broadcast"
  | "review_request"
  | "stamp_earned"
  | "redemption_confirm"
  | "referral_bonus"
  | "churn_winback"
  | "invite"
  | "review_thank_you"
  | "birthday_redeemed"
  | "manual"

const PRIORITY: Record<MessageType, number> = {
  birthday_reward_ready: 100,
  birthday_reminder_sent: 95,
  winback_day_90: 80,
  winback_day_60: 80,
  winback_day_45: 70,
  winback_day_30: 70,
  vip_upgrade: 60,
  festival_broadcast: 50,
  review_request: 40,
  churn_winback: 35,
  invite: 30,
  review_thank_you: 25,
  birthday_redeemed: 20,
  stamp_earned: 10, // transactional
  redemption_confirm: 10, // transactional
  referral_bonus: 10, // transactional
  manual: 15,
}

const TRANSACTIONAL: MessageType[] = ["stamp_earned", "redemption_confirm", "referral_bonus"]

const SUPPRESSION_WINDOW_HOURS = 48

export interface MessageDecision {
  send: boolean
  suppress: boolean
  reason?: string
  bundleWith?: string[]
  delayUntil?: Date
}

/**
 * Decide whether a marketing message should be sent, suppressed, or bundled.
 * Transactional messages are always sent (return send=true).
 */
export function shouldSendMessage(opts: {
  messageType: MessageType
  recentMessages: { template: string; sentAt: Date; status: string }[]
  now?: Date
}): MessageDecision {
  const { messageType, recentMessages } = opts
  const now = opts.now ?? new Date()

  // Transactional — always send
  if (TRANSACTIONAL.includes(messageType)) {
    return { send: true, suppress: false }
  }

  // Check for marketing messages sent in last 48h
  const cutoff = new Date(now.getTime() - SUPPRESSION_WINDOW_HOURS * 60 * 60 * 1000)
  const recentMarketing = recentMessages.filter((m) => {
    if (m.status !== "sent" && m.status !== "delivered") return false
    if (new Date(m.sentAt) < cutoff) return false
    // Exclude transactional from collision check
    const templateType = mapTemplateToType(m.template)
    if (TRANSACTIONAL.includes(templateType)) return false
    return true
  })

  if (recentMarketing.length === 0) {
    return { send: true, suppress: false }
  }

  // Check if any recent message has higher priority
  const newPriority = PRIORITY[messageType]
  const higherPriorityExists = recentMarketing.some((m) => {
    const t = mapTemplateToType(m.template)
    return PRIORITY[t] > newPriority
  })

  if (higherPriorityExists) {
    // Suppress — a higher-priority message was already sent
    const delayUntil = new Date(
      Math.max(...recentMarketing.map((m) => new Date(m.sentAt).getTime())) +
        SUPPRESSION_WINDOW_HOURS * 60 * 60 * 1000
    )
    return {
      send: false,
      suppress: true,
      reason: `Suppressed: higher-priority message sent in last 48h. Will retry at ${delayUntil.toISOString()}.`,
      delayUntil,
    }
  }

  // Check for bundling opportunity — if a marketing message was sent in last 6h
  const bundleCutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000)
  const bundleCandidates = recentMarketing.filter((m) => new Date(m.sentAt) >= bundleCutoff)

  if (bundleCandidates.length > 0) {
    return {
      send: true,
      suppress: false,
      bundleWith: bundleCandidates.map((m) => m.template),
      reason: `Bundled with ${bundleCandidates.length} recent marketing message(s).`,
    }
  }

  // New message has higher priority than recent — send it, optionally append P.S. about suppressed lower-priority
  return { send: true, suppress: false }
}

function mapTemplateToType(template: string): MessageType {
  const map: Record<string, MessageType> = {
    stamp_earned: "stamp_earned",
    reward_ready: "stamp_earned", // treated as transactional (card completion)
    redemption_confirm: "redemption_confirm",
    referral_bonus: "referral_bonus",
    referral_invite: "invite",
    birthday_reminder: "birthday_reminder_sent",
    birthday_redeemed: "birthday_redeemed",
    review_request: "review_request",
    review_thank_you: "review_thank_you",
    churn_reminder_30: "winback_day_30",
    churn_offer_45: "winback_day_45",
    churn_manager_call_60: "winback_day_60",
    churn_owner_call_90: "winback_day_90",
    churn_winback: "churn_winback",
    vip_upgrade: "vip_upgrade",
    festival_broadcast: "festival_broadcast",
    invite: "invite",
  }
  return map[template] ?? "manual"
}

/**
 * Generate bundled message body combining multiple marketing messages.
 */
export function bundleMessageBody(opts: {
  customerName: string
  merchantName: string
  messages: { template: string; body: string }[]
}): string {
  const { customerName, merchantName, messages } = opts
  if (messages.length === 1) return messages[0].body

  const parts = messages.map((m) => m.body)
  return `Hi ${customerName}! Updates from ${merchantName}:\n\n${parts.join("\n\n")}`
}
