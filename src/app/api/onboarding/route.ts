// POST /api/onboarding — mark an onboarding step as completed or skipped.
// Body: { staffId, stepKey, skipped? }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { markOnboardingStep, type OnboardingStepKey } from "@/lib/onboarding-engine"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, stepKey, skipped } = body as { staffId?: string; stepKey?: string; skipped?: boolean }
  if (!staffId || !stepKey) return err("staffId and stepKey required")

  const step = await markOnboardingStep(merchant.id, stepKey as OnboardingStepKey, skipped ?? false)

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staffId,
      staffId,
      action: "ONBOARDING_STEP_DONE",
      entity: "OnboardingStep",
      entityId: step.id,
      metadata: JSON.stringify({ stepKey, skipped }),
    },
  })

  return ok({ step })
}
