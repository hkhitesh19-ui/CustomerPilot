// CustomerPilot V6 — Onboarding Engine (2-minute path)
//
// Goal: merchant goes from signup → first bill in under 2 minutes.
// The 8-step checklist is shown on the dashboard as a non-blocking widget.
// Only signup + default card + qr_ready are required to start billing.

import { db } from "@/lib/db"

export type OnboardingStepKey =
  | "signup"
  | "default_card"
  | "qr_ready"
  | "first_bill"
  | "add_staff"
  | "import_customers"
  | "add_rewards"
  | "configure_birthday"

export const ONBOARDING_STEPS: { key: OnboardingStepKey; label: string; required: boolean; description: string }[] = [
  { key: "signup", label: "Sign up", required: true, description: "Create your merchant account" },
  { key: "default_card", label: "Default stamp card", required: true, description: "Auto-created from business type" },
  { key: "qr_ready", label: "POS ready", required: true, description: "Open POS and start billing" },
  { key: "first_bill", label: "First bill", required: false, description: "Process your first customer bill" },
  { key: "add_staff", label: "Add staff", required: false, description: "Add cashier/manager for PIN login" },
  { key: "import_customers", label: "Import customers", required: false, description: "Optional — bulk import from CSV" },
  { key: "add_rewards", label: "Add rewards", required: false, description: "Customize your reward catalog" },
  { key: "configure_birthday", label: "Birthday rewards", required: false, description: "Set up automated birthday rewards" },
]

export const DEFAULT_CARD_BY_BUSINESS: Record<string, { name: string; stampsRequired: number; rewardName: string; color: string }> = {
  cafe: { name: "Coffee Lover's Card", stampsRequired: 9, rewardName: "1 Free Specialty Coffee", color: "amber" },
  bakery: { name: "Cake Lover's Card", stampsRequired: 9, rewardName: "1 Free Cupcake", color: "rose" },
  salon: { name: "Beauty Pass", stampsRequired: 6, rewardName: "20% off next service", color: "purple" },
  restaurant: { name: "Diner's Card", stampsRequired: 10, rewardName: "Free dessert", color: "emerald" },
  retail: { name: "Shopper's Card", stampsRequired: 8, rewardName: "₹200 off next purchase", color: "blue" },
}

/**
 * Initialize the onboarding checklist for a new merchant.
 * Marks signup as done, creates a default stamp card, marks default_card + qr_ready done.
 * The merchant can now process bills immediately.
 */
export async function fastStartOnboarding(merchantId: string, businessType: string) {
  const defaults = DEFAULT_CARD_BY_BUSINESS[businessType] ?? DEFAULT_CARD_BY_BUSINESS.cafe

  // Create default stamp card if none exists
  const existingCard = await db.stampCard.findFirst({ where: { merchantId } })
  if (!existingCard) {
    await db.stampCard.create({
      data: {
        merchantId,
        name: defaults.name,
        stampsRequired: defaults.stampsRequired,
        rewardName: defaults.rewardName,
        stampsPerBill: "1",
        color: defaults.color,
        active: true,
      },
    })
  }

  // Initialize checklist
  const existing = await db.onboardingStep.findMany({ where: { merchantId } })
  if (existing.length === 0) {
    await db.onboardingStep.createMany({
      data: ONBOARDING_STEPS.map((s) => ({
        merchantId,
        stepKey: s.key,
        label: s.label,
        completed: ["signup", "default_card", "qr_ready"].includes(s.key),
        completedAt: ["signup", "default_card", "qr_ready"].includes(s.key) ? new Date() : null,
      })),
    })
  }

  return { ok: true, defaults }
}

export async function markOnboardingStep(merchantId: string, stepKey: OnboardingStepKey, skipped: boolean = false) {
  const existing = await db.onboardingStep.findFirst({ where: { merchantId, stepKey } })
  if (existing) {
    return db.onboardingStep.update({
      where: { id: existing.id },
      data: { completed: true, skipped, completedAt: new Date() },
    })
  }
  return db.onboardingStep.create({
    data: {
      merchantId,
      stepKey,
      label: ONBOARDING_STEPS.find((s) => s.key === stepKey)?.label ?? stepKey,
      completed: true,
      skipped,
      completedAt: new Date(),
    },
  })
}

export function onboardingProgress(steps: { stepKey: string; completed: boolean; skipped: boolean }[]) {
  const total = ONBOARDING_STEPS.length
  const done = steps.filter((s) => s.completed).length
  const requiredDone = ONBOARDING_STEPS.filter((s) => s.required).every((s) =>
    steps.find((step) => step.stepKey === s.key && step.completed)
  )
  return {
    total,
    done,
    percent: Math.round((done / total) * 100),
    canStartBilling: requiredDone,
    nextStep: ONBOARDING_STEPS.find((s) => !steps.find((step) => step.stepKey === s.key && step.completed)),
  }
}
