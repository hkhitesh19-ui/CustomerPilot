// CustomerPilot V6.2 — Fraud Detection Engine
// Soft rules: flag suspicious patterns, alert manager, DON'T block bills.
// Owner reviews flags and can reverse stamps on confirmed fraud.
//
// V6.2 additions:
//   - 4-level severity matrix: info | warning | high | critical
//   - Auto-approval trigger: 2+ HIGH or 1+ CRITICAL in 24h → cashier requires manager approval for 24h
//   - While requireManagerApprovalUntil is set, cashier's bills create with status="pending_manager_approval"

export type FraudRuleId =
  | "low_value_bill"
  | "rapid_repeat"
  | "rapid_repeat_critical" // V6.2: 3+ rapid repeats in 1h = critical
  | "high_frequency"
  | "after_hours"
  | "cashier_self_deal"
  | "stamp_spike"

// V6.2: 4-level severity matrix
export type FraudSeverity = "info" | "warning" | "high" | "critical"

export interface FraudAlertInput {
  merchantId: string
  billId: string
  customerId: string
  cashierId: string
  cashierPhone: string
  customerPhone: string
  amount: number
  customerLifetimeStamps: number
  customerStampsBeforeBill: number
  billsBySameCustomerIn24h: number
  rapidRepeatsInLast1h: number // V6.2: for critical threshold
  recentBillsBySameCustomer: { amount: number; createdAt: Date }[]
  now?: Date
  merchantTimezone?: string
  merchantOpenHour?: number // 0-23
  merchantCloseHour?: number // 0-23
}

export interface FraudAlert {
  ruleId: FraudRuleId
  severity: FraudSeverity
  reason: string
  metadata: Record<string, any>
}

const LOW_VALUE_THRESHOLD = 10 // ₹10
const RAPID_REPEAT_WINDOW_MIN = 5
const RAPID_REPEAT_CRITICAL_THRESHOLD = 3 // V6.2: 3+ rapid repeats in 1h = critical
const HIGH_FREQ_THRESHOLD_24H = 8
const STAMP_SPIKE_THRESHOLD_24H = 10

// V6.2: Auto-approval trigger thresholds
const AUTO_APPROVAL_HIGH_THRESHOLD = 2 // 2+ HIGH in 24h triggers approval requirement
const AUTO_APPROVAL_DURATION_HOURS = 24 // cashier requires approval for 24h

export function checkBillForFraud(opts: FraudAlertInput): FraudAlert[] {
  const alerts: FraudAlert[] = []
  const now = opts.now ?? new Date()

  // RULE 1 — Low-value bill (severity: info)
  if (opts.amount < LOW_VALUE_THRESHOLD) {
    alerts.push({
      ruleId: "low_value_bill",
      severity: "info",
      reason: `Bill amount ₹${opts.amount} below ₹${LOW_VALUE_THRESHOLD} threshold.`,
      metadata: { amount: opts.amount, threshold: LOW_VALUE_THRESHOLD },
    })
  }

  // RULE 2 — Rapid repeat (severity: high, or critical if 3+ in 1h)
  const rapidRepeat = opts.recentBillsBySameCustomer.find((b) => {
    const diffMin = (now.getTime() - new Date(b.createdAt).getTime()) / (1000 * 60)
    return diffMin <= RAPID_REPEAT_WINDOW_MIN && b.amount === opts.amount
  })
  if (rapidRepeat) {
    // V6.2: Check if this is part of a critical pattern (3+ rapid repeats in 1h)
    if (opts.rapidRepeatsInLast1h >= RAPID_REPEAT_CRITICAL_THRESHOLD) {
      alerts.push({
        ruleId: "rapid_repeat_critical",
        severity: "critical",
        reason: `Same customer billed same amount ${opts.rapidRepeatsInLast1h}+ times in 1h (critical threshold: ${RAPID_REPEAT_CRITICAL_THRESHOLD}). Possible coordinated fraud.`,
        metadata: {
          repeatsIn1h: opts.rapidRepeatsInLast1h,
          threshold: RAPID_REPEAT_CRITICAL_THRESHOLD,
          amount: opts.amount,
        },
      })
    } else {
      alerts.push({
        ruleId: "rapid_repeat",
        severity: "high",
        reason: `Same customer billed ₹${opts.amount} within ${RAPID_REPEAT_WINDOW_MIN} minutes.`,
        metadata: {
          previousBillAmount: rapidRepeat.amount,
          previousBillAt: rapidRepeat.createdAt,
          windowMin: RAPID_REPEAT_WINDOW_MIN,
        },
      })
    }
  }

  // RULE 3 — High frequency (severity: warning)
  if (opts.billsBySameCustomerIn24h > HIGH_FREQ_THRESHOLD_24H) {
    alerts.push({
      ruleId: "high_frequency",
      severity: "warning",
      reason: `Customer billed ${opts.billsBySameCustomerIn24h} times in 24h (threshold: ${HIGH_FREQ_THRESHOLD_24H}).`,
      metadata: { count24h: opts.billsBySameCustomerIn24h, threshold: HIGH_FREQ_THRESHOLD_24H },
    })
  }

  // RULE 4 — After-hours (severity: info)
  const merchantHour = getMerchantHour(now, opts.merchantTimezone)
  const openHour = opts.merchantOpenHour ?? 9
  const closeHour = opts.merchantCloseHour ?? 21
  if (isAfterHours(merchantHour, openHour, closeHour)) {
    alerts.push({
      ruleId: "after_hours",
      severity: "info",
      reason: `Bill created at hour ${merchantHour} (outside business hours ${openHour}:00-${closeHour}:00).`,
      metadata: { billHour: merchantHour, openHour, closeHour },
    })
  }

  // RULE 5 — Cashier self-deal (severity: high)
  if (opts.cashierPhone && opts.customerPhone && opts.cashierPhone === opts.customerPhone) {
    alerts.push({
      ruleId: "cashier_self_deal",
      severity: "high",
      reason: "Cashier billing own phone number (potential self-deal).",
      metadata: { cashierPhone: opts.cashierPhone },
    })
  }

  // RULE 6 — Stamp spike (severity: warning, or critical if >25 stamps in 24h)
  const stampsAwarded = opts.customerLifetimeStamps - opts.customerStampsBeforeBill
  if (opts.customerStampsBeforeBill > 0 && stampsAwarded > STAMP_SPIKE_THRESHOLD_24H) {
    const isCritical = stampsAwarded > 25
    alerts.push({
      ruleId: "stamp_spike",
      severity: isCritical ? "critical" : "warning",
      reason: `Customer accumulated ${stampsAwarded} stamps in 24h (threshold: ${STAMP_SPIKE_THRESHOLD_24H}${isCritical ? ", CRITICAL: >25" : ""}).`,
      metadata: { stampsIn24h: stampsAwarded, threshold: STAMP_SPIKE_THRESHOLD_24H, critical: isCritical },
    })
  }

  return alerts
}

function getMerchantHour(now: Date, timezone?: string): number {
  if (!timezone) return now.getHours()
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    })
    return parseInt(formatter.format(now), 10)
  } catch {
    return now.getHours()
  }
}

function isAfterHours(hour: number, open: number, close: number): boolean {
  if (close < open) {
    return hour >= close && hour < open
  }
  return hour < open || hour >= close
}

/**
 * V6.2: Determine if cashier should be auto-flagged for manager approval.
 * Triggers when: 2+ HIGH severity alerts OR 1+ CRITICAL alert in last 24h.
 * Returns the until-timestamp if triggered, null otherwise.
 */
export function shouldRequireManagerApproval(opts: {
  highSeverityAlertsIn24h: number
  criticalAlertsIn24h: number
  now?: Date
}): { trigger: boolean; until: Date | null; reason: string } {
  const now = opts.now ?? new Date()

  if (opts.criticalAlertsIn24h >= 1) {
    const until = new Date(now.getTime() + AUTO_APPROVAL_DURATION_HOURS * 60 * 60 * 1000)
    return {
      trigger: true,
      until,
      reason: `Cashier triggered ${opts.criticalAlertsIn24h} CRITICAL fraud alert(s) in 24h. Manager approval required for all bills until ${until.toISOString()}.`,
    }
  }

  if (opts.highSeverityAlertsIn24h >= AUTO_APPROVAL_HIGH_THRESHOLD) {
    const until = new Date(now.getTime() + AUTO_APPROVAL_DURATION_HOURS * 60 * 60 * 1000)
    return {
      trigger: true,
      until,
      reason: `Cashier triggered ${opts.highSeverityAlertsIn24h} HIGH severity fraud alerts in 24h (threshold: ${AUTO_APPROVAL_HIGH_THRESHOLD}). Manager approval required for all bills until ${until.toISOString()}.`,
    }
  }

  return { trigger: false, until: null, reason: "" }
}

/**
 * Pattern detection: same cashier triggers >5 fraud alerts in 30 days.
 * Returns true if pattern detected (caller escalates to owner).
 */
export function detectCashierFraudPattern(opts: {
  cashierId: string
  alertsInLast30Days: number
}): { pattern: boolean; recommendation: string } {
  const PATTERN_THRESHOLD = 5
  if (opts.alertsInLast30Days > PATTERN_THRESHOLD) {
    return {
      pattern: true,
      recommendation: `Cashier has ${opts.alertsInLast30Days} fraud alerts in 30 days (threshold: ${PATTERN_THRESHOLD}). Recommend reviewing cashier access.`,
    }
  }
  return { pattern: false, recommendation: "" }
}

// V6.2: Severity level rank for comparisons
export const SEVERITY_RANK: Record<FraudSeverity, number> = {
  info: 1,
  warning: 2,
  high: 3,
  critical: 4,
}

// V6.2: Severity colors for UI
export const SEVERITY_COLORS: Record<FraudSeverity, string> = {
  info: "bg-blue-100 text-blue-700 border-blue-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-rose-100 text-rose-700 border-rose-200",
}
