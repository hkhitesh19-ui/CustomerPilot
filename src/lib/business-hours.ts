// CustomerPilot V6 — Business Hours Engine
// Timezone-aware business hours logic for daily summary + morning briefing scheduling.

export interface BusinessHours {
  timezone: string // IANA timezone, e.g. "Asia/Kolkata"
  openHour: number // 0-23
  closeHour: number // 0-23 (can be < openHour for overnight, e.g. open=11 close=1)
  closedDays: number[] // 0=Sunday, 1=Monday, ..., 6=Saturday
}

export const DEFAULT_BUSINESS_HOURS_BY_TYPE: Record<string, BusinessHours> = {
  cafe: { timezone: "Asia/Kolkata", openHour: 8, closeHour: 20, closedDays: [] },
  bakery: { timezone: "Asia/Kolkata", openHour: 9, closeHour: 21, closedDays: [0] }, // closed Sunday
  salon: { timezone: "Asia/Kolkata", openHour: 10, closeHour: 19, closedDays: [0] },
  restaurant: { timezone: "Asia/Kolkata", openHour: 11, closeHour: 23, closedDays: [] },
  retail: { timezone: "Asia/Kolkata", openHour: 10, closeHour: 22, closedDays: [0] },
}

const DEFAULT_TIMEZONE = "Asia/Kolkata"

export function getMerchantNow(timezone: string = DEFAULT_TIMEZONE): Date {
  // Returns current time in merchant's timezone (as a Date object, but interpreted in that tz)
  const now = new Date()
  return now // Date objects are timezone-agnostic; we use Intl for display
}

export function getMerchantHour(timezone: string = DEFAULT_TIMEZONE, now: Date = new Date()): number {
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

export function getMerchantWeekday(timezone: string = DEFAULT_TIMEZONE, now: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
    })
    const dayName = formatter.format(now)
    const map: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    }
    return map[dayName] ?? now.getDay()
  } catch {
    return now.getDay()
  }
}

export function isWithinBusinessHours(opts: {
  hours: BusinessHours
  now?: Date
}): boolean {
  const { hours } = opts
  const now = opts.now ?? new Date()
  const hour = getMerchantHour(hours.timezone, now)
  const weekday = getMerchantWeekday(hours.timezone, now)

  if (hours.closedDays.includes(weekday)) return false

  if (hours.closeHour < hours.openHour) {
    // Overnight (e.g. open=11, close=1 → open 11 AM to 1 AM)
    return hour >= hours.openHour || hour < hours.closeHour
  }
  return hour >= hours.openHour && hour < hours.closeHour
}

export function isClosedDay(opts: { hours: BusinessHours; now?: Date }): boolean {
  const { hours } = opts
  const now = opts.now ?? new Date()
  const weekday = getMerchantWeekday(hours.timezone, now)
  return hours.closedDays.includes(weekday)
}

/**
 * Returns the next time the daily summary should be sent (1 hour after closing).
 * If business is closed today, returns next open day's summary time.
 */
export function nextSummaryTime(opts: {
  hours: BusinessHours
  now?: Date
}): Date {
  const { hours } = opts
  const now = opts.now ?? new Date()
  const summaryHour = hours.closeHour < hours.openHour
    ? hours.closeHour + 1 // overnight close, summary 1h after
    : hours.closeHour + 1

  // Find next non-closed day
  let candidate = new Date(now)
  for (let i = 0; i < 7; i++) {
    const weekday = getMerchantWeekday(hours.timezone, candidate)
    if (!hours.closedDays.includes(weekday)) {
      // Set time to summary hour in merchant timezone
      // This is approximate — production should use a proper timezone-aware datetime library
      const candidateHour = getMerchantHour(hours.timezone, candidate)
      if (i === 0 && candidateHour < summaryHour) {
        // Today, summary hasn't fired yet
        candidate.setHours(summaryHour, 0, 0, 0)
        return candidate
      } else if (i > 0) {
        candidate.setHours(summaryHour, 0, 0, 0)
        return candidate
      }
    }
    candidate.setDate(candidate.getDate() + 1)
  }

  // Fallback: 24h from now
  return new Date(now.getTime() + 24 * 60 * 60 * 1000)
}

/**
 * Returns the next time the morning briefing should be sent (at opening time).
 */
export function nextMorningBriefingTime(opts: {
  hours: BusinessHours
  now?: Date
}): Date {
  const { hours } = opts
  const now = opts.now ?? new Date()
  let candidate = new Date(now)
  for (let i = 0; i < 7; i++) {
    const weekday = getMerchantWeekday(hours.timezone, candidate)
    if (!hours.closedDays.includes(weekday)) {
      const candidateHour = getMerchantHour(hours.timezone, candidate)
      if (i === 0 && candidateHour < hours.openHour) {
        candidate.setHours(hours.openHour, 0, 0, 0)
        return candidate
      } else if (i > 0) {
        candidate.setHours(hours.openHour, 0, 0, 0)
        return candidate
      }
    }
    candidate.setDate(candidate.getDate() + 1)
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000)
}

/**
 * Determine the "business day" a given timestamp belongs to.
 * For overnight businesses (close < open), bills from 12 AM to closeHour belong to previous day.
 */
export function getBusinessDay(opts: {
  hours: BusinessHours
  timestamp: Date
}): Date {
  const { hours, timestamp } = opts
  const hour = getMerchantHour(hours.timezone, timestamp)
  const weekday = getMerchantWeekday(hours.timezone, timestamp)

  // For overnight businesses: if it's after midnight but before closeHour, it's "yesterday's" business day
  if (hours.closeHour < hours.openHour && hour < hours.closeHour) {
    const prevDay = new Date(timestamp)
    prevDay.setDate(prevDay.getDate() - 1)
    return prevDay
  }

  return timestamp
}
