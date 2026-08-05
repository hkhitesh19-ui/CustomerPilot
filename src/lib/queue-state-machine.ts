// CustomerPilot V6.4 — QUEUE STATE MACHINE
// Formal definition of the Live Queue operational state machine.
//
// 9 STATES: idle → waiting → reserved → claimed → cancelled → expired → recovered → merged → (archived)
//
// For each state: entry conditions, exit conditions, timeout, allowed actions,
// audit log, notifications, recovery rules.
//
// This is the formalization of the "Tap to Claim Reward™" flow into a
// production-grade operational state machine.

export interface QueueStateDef {
  state: string
  color: string // UI color
  description: string
  entryConditions: string[]
  exitConditions: string[]
  timeout: string
  allowedActions: string[]
  auditActions: string[]
  notifications: string[]
  recoveryRules: string[]
}

export const QUEUE_STATE_MACHINE: QueueStateDef[] = [
  {
    state: "idle",
    color: "grey",
    description: "Customer has not scanned. No queue entry exists. This is the default state for all customers who haven't scanned QR today.",
    entryConditions: [
      "Customer has not scanned QR in current session",
      "Previous queue entry was claimed/expired/cancelled >24h ago",
    ],
    exitConditions: [
      "Customer scans QR → transitions to 'waiting'",
      "Merchant manually adds customer via Manual Search (exception flow)",
    ],
    timeout: "N/A (no entry exists)",
    allowedActions: [
      "Customer can scan QR at any time",
      "Merchant can manually search customer (exception flow, not queue)",
    ],
    auditActions: [],
    notifications: [],
    recoveryRules: ["N/A — no state to recover from"],
  },
  {
    state: "waiting",
    color: "blue",
    description: "Customer has scanned QR and is waiting in the merchant's Live Queue. Visible to all staff. Waiting for merchant to tap.",
    entryConditions: [
      "POST /api/queue/join received with valid phone",
      "Customer scanned QR (scanSource = 'qr_whatsapp' | 'qr_web')",
      "If customer is new → Customer record auto-created (no forms)",
      "If customer is returning → identified by phone, lastActiveAt updated",
    ],
    exitConditions: [
      "Merchant taps customer → transitions to 'reserved' (10s lock)",
      "Queue timeout expires (5 min default, configurable by business type) → 'expired'",
      "Customer scans again (duplicate scan) → timer refreshed, stays in 'waiting'",
      "Merchant cancels → 'cancelled'",
    ],
    timeout: "5 minutes (bakery default). Configurable by business type: cafe=15min, restaurant=60min, salon=120min, gym=30min, retail=10min. Merchant can override in Settings.",
    allowedActions: [
      "Merchant taps to reserve (transitions to 'reserved')",
      "Customer can re-scan to refresh timer (no duplicate entry)",
      "System auto-expires if timeout reached",
      "Merchant can cancel (if customer left without claiming)",
    ],
    auditActions: ["QUEUE_JOINED", "QUEUE_DUPLICATE_SCAN_REFRESHED", "QUEUE_TIMER_REFRESHED"],
    notifications: [
      "Customer gets WhatsApp on join: 'Hi {name}! You're in the queue. Merchant will tap your card shortly.'",
      "If timeout approaching (30s before expiry): customer gets 'Hurry! Your queue entry expires in 30 seconds.'",
    ],
    recoveryRules: [
      "If customer left without claiming: merchant can cancel or let expire",
      "If customer returns within grace period (15 min after expiry): merchant can manually re-add to queue",
      "If customer's phone died: merchant can use Manual Search to find customer and process reward",
    ],
  },
  {
    state: "reserved",
    color: "orange",
    description: "Merchant has tapped the customer card. 10-second optimistic lock prevents double-claim by another staff member. Merchant is entering amount / confirming.",
    entryConditions: [
      "Merchant taps a 'waiting' customer card in Live Queue",
      "POST /api/queue/reserve called with staffId + queueId",
      "Optimistic lock: status set to 'reserved', reservedById = staffId, reservationExpiresAt = now + 10s",
    ],
    exitConditions: [
      "Merchant confirms (enters amount + clicks 'Claim Reward') → 'claimed'",
      "Merchant cancels (clicks 'Cancel' or closes modal) → released back to 'waiting'",
      "10-second reservation timeout → auto-released to 'waiting'",
    ],
    timeout: "10 seconds (RESERVATION_TIMEOUT_SECONDS in queue-engine.ts). If merchant doesn't confirm in 10s, auto-release.",
    allowedActions: [
      "Only the reserving staff (reservedById) can confirm or cancel",
      "Other staff see 'Reserved by {staffName}' badge, cannot tap",
      "Reserving staff can enter amount, confirm, or cancel",
    ],
    auditActions: ["QUEUE_RESERVED", "QUEUE_RESERVATION_RELEASED", "QUEUE_RESERVATION_TIMEOUT"],
    notifications: [
      "Other staff POS screens show 'Reserved by {staffName} — {X}s ago' badge on the card",
      "Customer sees no change (they're still waiting, unaware of reservation)",
    ],
    recoveryRules: [
      "If reserving staff's device crashes: 10s timeout auto-releases",
      "If reserving staff navigates away: reservation stays until 10s timeout",
      "If another staff tries to tap reserved card: blocked with 'Reserved by {name}' message",
    ],
  },
  {
    state: "claimed",
    color: "green",
    description: "Merchant confirmed the claim. Stamps awarded, WhatsApp sent to customer. 30-second undo window active before notifications are finalized.",
    entryConditions: [
      "Merchant clicks 'Claim Reward' in the reservation modal",
      "POST /api/queue/claim called with staffId + queueId + amount (optional)",
      "System creates Bill (internal purchase event), awards stamps via stamp engine",
      "WhatsApp confirmation queued to customer",
      "undoWindowUntil = now + 30s",
    ],
    exitConditions: [
      "30-second undo window expires → 'claimed' becomes permanent (final state)",
      "Merchant clicks 'Undo' within 30s → transitions to 'recovered' (stamps reversed)",
    ],
    timeout: "30-second undo window (UNDO_WINDOW_SECONDS in queue-engine.ts). After 30s, claim is permanent.",
    allowedActions: [
      "Merchant can 'Undo Claim' within 30s (reverses stamps, cancels WhatsApp)",
      "After 30s: no undo possible (would require bill refund flow)",
    ],
    auditActions: ["QUEUE_CLAIMED", "QUEUE_UNDO_WINDOW_EXPIRED"],
    notifications: [
      "Customer gets WhatsApp: 'You earned {N} stamp(s)! Total: {X}/{Y}.'",
      "If card completed: '🎉 You've completed your card! Visit us to claim your reward.'",
      "Merchant sees confidence toast: '✓ Reward Delivered — Customer Notified'",
    ],
    recoveryRules: [
      "Undo within 30s: stamps reversed, WhatsApp cancelled (if not yet sent), card returns to 'recovered' state",
      "Undo after 30s: not possible via queue. Must use bill refund flow (manager+).",
      "If WhatsApp already sent before undo: customer gets follow-up 'Sorry, that was an error. Your stamps have been reversed.'",
    ],
  },
  {
    state: "cancelled",
    color: "red",
    description: "Merchant explicitly cancelled the queue entry (customer left without claiming, wrong scan, etc.).",
    entryConditions: [
      "Merchant clicks 'Cancel' on a 'waiting' or 'reserved' customer card",
      "POST /api/queue/cancel called with staffId + queueId + reason",
    ],
    exitConditions: [
      "Cancelled is a terminal state (no recovery from here)",
      "Customer can re-scan QR to create a new 'waiting' entry",
    ],
    timeout: "N/A (terminal state)",
    allowedActions: [
      "Merchant can cancel from 'waiting' or 'reserved' state",
      "Reason is optional but recommended for audit",
    ],
    auditActions: ["QUEUE_CANCELLED"],
    notifications: [
      "Customer gets WhatsApp: 'Sorry we missed you! Your reward is saved — ask the merchant next time.'",
      "Merchant sees 'Cancelled: {customerName}' in queue history",
    ],
    recoveryRules: [
      "No recovery from cancelled state",
      "Customer can re-scan QR to rejoin queue",
      "If cancellation was a mistake: customer re-scans, new entry created",
    ],
  },
  {
    state: "expired",
    color: "grey",
    description: "Customer scanned but didn't get claimed within the queue timeout (5 min default). System auto-expired.",
    entryConditions: [
      "Cron (every 1 min): check all 'waiting' entries where expiresAt < now",
      "Update status to 'expired'",
    ],
    exitConditions: [
      "Expired is a terminal state",
      "Customer can re-scan QR to create a new 'waiting' entry",
    ],
    timeout: "N/A (already timed out)",
    allowedActions: [
      "Merchant can view expired entries in Queue Analytics",
      "Customer can re-scan to rejoin",
      "Merchant can manually re-add customer if they're still at counter",
    ],
    auditActions: ["QUEUE_EXPIRED"],
    notifications: [
      "Customer gets WhatsApp: 'Sorry we missed you! Your queue entry expired. Please scan again when you're ready.'",
      "Merchant dashboard: 'Expired today: {N}' in Queue Analytics widget",
    ],
    recoveryRules: [
      "If customer is still at counter: merchant can manually re-add via Manual Search",
      "If customer left: no recovery, counted as 'Missed Customer' in adoption KPI",
      "Grace period: merchant can claim within 15 min after expiry if customer is present (requires manager approval)",
    ],
  },
  {
    state: "recovered",
    color: "purple",
    description: "A claim was undone within the 30-second undo window. Stamps reversed, WhatsApp cancelled. Entry is preserved for audit trail.",
    entryConditions: [
      "Merchant clicks 'Undo Claim' within 30s of claiming",
      "POST /api/queue/undo called with staffId + queueId",
      "System reverses: stamps deleted, bill voided, WhatsApp cancelled (if not sent)",
    ],
    exitConditions: [
      "Recovered is a terminal state (for this queue entry)",
      "Customer can re-scan QR to create a new 'waiting' entry",
    ],
    timeout: "N/A (terminal state)",
    allowedActions: [
      "Undo only available within 30s of claim (undoWindowUntil > now)",
      "After 30s: must use bill refund flow (manager+)",
    ],
    auditActions: ["QUEUE_UNDONE", "QUEUE_STAMPS_REVERSED"],
    notifications: [
      "If WhatsApp not yet sent: no customer notification (silent undo)",
      "If WhatsApp already sent: customer gets 'Sorry, that was an error. Your stamps have been reversed.'",
      "Merchant sees: '✓ Claim undone — {customerName} can re-scan'",
    ],
    recoveryRules: [
      "Customer can re-scan QR to rejoin queue and re-claim",
      "If undo was a mistake: merchant re-scans customer manually, re-claims",
      "Bill is voided (status='voided'), not deleted — audit trail preserved",
    ],
  },
  {
    state: "merged",
    color: "grey",
    description: "Customer was merged into another customer record (duplicate merge). Queue entry migrated to canonical customer.",
    entryConditions: [
      "Customer merge executed (POST /api/customers/merge)",
      "If duplicate customer had a 'waiting' queue entry: migrated to canonical customer, status='merged'",
    ],
    exitConditions: [
      "Merged is a terminal state (for this queue entry)",
      "Canonical customer may have an active 'waiting' entry (the merged one is archived)",
    ],
    timeout: "N/A (terminal state)",
    allowedActions: [
      "No actions on merged entries (they're archived)",
      "Canonical customer's queue entry (if any) is the active one",
    ],
    auditActions: ["QUEUE_MERGED"],
    notifications: [
      "No customer notification (merge is transparent)",
      "Merchant sees merged entry in Queue Analytics history",
    ],
    recoveryRules: [
      "If merge is undone within 7-day unmerge window: queue entry can be restored",
      "After 7 days: merged entry permanently archived",
    ],
  },
]

// V6.4 — Business-type default queue timeouts (minutes)
export const QUEUE_TIMEOUT_BY_BUSINESS: Record<string, number> = {
  cafe: 15,
  bakery: 5,
  salon: 120,
  restaurant: 60,
  retail: 10,
  gym: 30,
  spa: 120,
  other: 10,
}

export const RESERVATION_TIMEOUT_SECONDS = 10
export const UNDO_WINDOW_SECONDS = 30
export const GRACE_PERIOD_AFTER_EXPIRY_MINUTES = 15

// V6.4 — Status colors for UI (replacing simple green/amber/red)
export const QUEUE_STATUS_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  waiting: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", label: "Waiting" },
  reserved: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", label: "Reserved" },
  claimed: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", label: "Claimed" },
  cancelled: { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", label: "Cancelled" },
  expired: { bg: "bg-stone-100", border: "border-stone-300", text: "text-stone-500", label: "Expired" },
  recovered: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", label: "Recovered" },
  merged: { bg: "bg-stone-100", border: "border-stone-300", text: "text-stone-500", label: "Merged" },
}

// V6.4 — State transition map (for validation)
export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  idle: ["waiting"],
  waiting: ["reserved", "cancelled", "expired", "merged"],
  reserved: ["claimed", "waiting", "cancelled", "expired"],
  claimed: ["recovered"],
  cancelled: [],
  expired: [],
  recovered: [],
  merged: [],
}

export function canTransition(from: string, to: string): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}
