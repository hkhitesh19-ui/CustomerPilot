export function computeChurnRisk(opts: {
  lastActiveAt: Date | null
  lifetimeStamps: number
  lifetimeSpend: number
  now?: Date
}): number {
  const now = opts.now ?? new Date()
  if (!opts.lastActiveAt) return 80 // never active = high risk

  const daysSince = Math.floor(
    (now.getTime() - opts.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  let score = 0
  if (daysSince > 90) score += 60
  else if (daysSince > 60) score += 40
  else if (daysSince > 30) score += 20
  else if (daysSince > 14) score += 10

  // engagement dampener
  if (opts.lifetimeStamps > 50) score = Math.max(0, score - 30)
  else if (opts.lifetimeStamps > 20) score = Math.max(0, score - 15)

  if (opts.lifetimeSpend > 5000) score = Math.max(0, score - 20)

  return Math.min(100, score)
}
