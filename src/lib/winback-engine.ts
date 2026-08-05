// CustomerPilot V6 — Win-back Escalation Engine
// 4-stage escalation: 30 / 45 / 60 / 90 days since last active.
// Each stage has a progressively more personal / costly intervention.

export type WinBackStage = "day_30" | "day_45" | "day_60" | "day_90" | "recovered" | "lost"

export interface WinBackStageConfig {
  stage: WinBackStage
  daysSinceLastActive: number
  action: string
  channel: "whatsapp" | "phone_call" | "email" | "in_person"
  owner: "system" | "manager" | "owner"
  messageTemplate: string
  sampleBody: (customerName: string, merchantName: string) => string
  cost: "free" | "low" | "medium" | "high"
}

export const WIN_BACK_STAGES: WinBackStageConfig[] = [
  {
    stage: "day_30",
    daysSinceLastActive: 30,
    action: "Gentle reminder",
    channel: "whatsapp",
    owner: "system",
    messageTemplate: "churn_reminder_30",
    sampleBody: (name, merchant) =>
      `Hi ${name}! It's been a month since your last visit to ${merchant}. We'd love to see you again soon!`,
    cost: "free",
  },
  {
    stage: "day_45",
    daysSinceLastActive: 45,
    action: "Soft offer",
    channel: "whatsapp",
    owner: "system",
    messageTemplate: "churn_offer_45",
    sampleBody: (name, merchant) =>
      `Hi ${name}! Here's a small surprise — double stamps on your next visit to ${merchant}. Valid for 7 days only.`,
    cost: "low",
  },
  {
    stage: "day_60",
    daysSinceLastActive: 60,
    action: "Personal call from manager",
    channel: "phone_call",
    owner: "manager",
    messageTemplate: "churn_manager_call_60",
    sampleBody: (name, merchant) =>
      `Hi ${name}, this is Rahul from ${merchant}. We noticed we haven't seen you in a while — is everything okay?`,
    cost: "medium",
  },
  {
    stage: "day_90",
    daysSinceLastActive: 90,
    action: "Owner intervention + retention offer",
    channel: "phone_call",
    owner: "owner",
    messageTemplate: "churn_owner_call_90",
    sampleBody: (name, merchant) =>
      `Hi ${name}, this is Anita (owner of ${merchant}). I'd love to gift you a free reward — when can you drop by?`,
    cost: "high",
  },
]

export function getWinBackStage(daysSinceLastActive: number): WinBackStageConfig | null {
  const stages = [...WIN_BACK_STAGES].sort((a, b) => b.daysSinceLastActive - a.daysSinceLastActive)
  return stages.find((s) => daysSinceLastActive >= s.daysSinceLastActive) ?? null
}

export function getDaysSinceLastActive(lastActiveAt: Date | null, now: Date = new Date()): number {
  if (!lastActiveAt) return 999
  return Math.floor((now.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
}

export const LOST_CUSTOMER_THRESHOLD_DAYS = 120
