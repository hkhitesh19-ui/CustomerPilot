// CustomerPilot V6 — Birthday Engine
// 7-day reminder window before birthday, 7-day redemption window after.
// Bonus stamps awarded on first visit during the redemption window.

export interface BirthdaySchedule {
  customerId: string
  customerName: string
  birthMonth: number
  birthDay: number
  reminderDate: Date // 7 days before birthday
  windowStart: Date // 7 days before birthday
  windowEnd: Date // 7 days after birthday
  rewardName: string
  bonusStamps: number
}

/**
 * Compute the next birthday occurrence for a given MM-DD.
 * If the birthday has already passed this year, return next year's.
 */
export function nextBirthday(birthMonth: number, birthDay: number, now: Date = new Date()): Date {
  const year = now.getFullYear()
  const thisYear = new Date(year, birthMonth - 1, birthDay, 0, 0, 0, 0)
  if (thisYear.getTime() < now.getTime()) {
    return new Date(year + 1, birthMonth - 1, birthDay, 0, 0, 0, 0)
  }
  return thisYear
}

export function computeBirthdaySchedule(opts: {
  customerId: string
  customerName: string
  birthMonth: number
  birthDay: number
  rewardName?: string
  bonusStamps?: number
  now?: Date
}): BirthdaySchedule {
  const now = opts.now ?? new Date()
  const bday = nextBirthday(opts.birthMonth, opts.birthDay, now)
  const windowStart = new Date(bday)
  windowStart.setDate(windowStart.getDate() - 7)
  const windowEnd = new Date(bday)
  windowEnd.setDate(windowEnd.getDate() + 7)
  const reminderDate = new Date(windowStart)

  return {
    customerId: opts.customerId,
    customerName: opts.customerName,
    birthMonth: opts.birthMonth,
    birthDay: opts.birthDay,
    reminderDate,
    windowStart,
    windowEnd,
    rewardName: opts.rewardName ?? "Free Birthday Slice",
    bonusStamps: opts.bonusStamps ?? 3,
  }
}

/**
 * Returns "upcoming" birthdays within the next N days, sorted by date.
 */
export function upcomingBirthdays(
  customers: { id: string; name: string; birthday: string | null }[],
  withinDays: number = 30,
  now: Date = new Date()
): BirthdaySchedule[] {
  const upcoming: BirthdaySchedule[] = []
  for (const c of customers) {
    if (!c.birthday) continue
    const [mm, dd] = c.birthday.split("-").map((x) => parseInt(x, 10))
    if (!mm || !dd) continue
    const sched = computeBirthdaySchedule({
      customerId: c.id,
      customerName: c.name,
      birthMonth: mm,
      birthDay: dd,
      now,
    })
    const daysUntil = Math.floor((sched.windowEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= withinDays) {
      upcoming.push(sched)
    }
  }
  return upcoming.sort((a, b) => a.windowStart.getTime() - b.windowStart.getTime())
}

export function isTodayInBirthdayWindow(sched: BirthdaySchedule, now: Date = new Date()): boolean {
  return now >= sched.windowStart && now <= sched.windowEnd
}
