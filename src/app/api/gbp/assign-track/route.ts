// POST /api/gbp/assign-track — Assign a GBP service track to a merchant.
// Idempotent: re-assigning clears old checklist and creates fresh one.
// Body: { merchantId, track: "TRACK_A_NEW" | "TRACK_B_EXISTING" }
// Auth: Super Admin only.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { TRACK_A_CHECKLIST, TRACK_B_CHECKLIST } from "@/lib/gbp-checklist-seed"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")

    const { merchantId, track } = body as { merchantId?: string; track?: string }
    if (!merchantId) return err("merchantId is required")
    if (!["TRACK_A_NEW", "TRACK_B_EXISTING"].includes(track ?? "")) {
      return err("track must be 'TRACK_A_NEW' or 'TRACK_B_EXISTING'")
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant) return err("Merchant not found", 404)

    // Determine review velocity cap based on track
    const velocityCap = track === "TRACK_A_NEW" ? 3 : 10

    // Clear any existing checklist for this merchant
    await db.gbpChecklistItem.deleteMany({ where: { merchantId } })

    // Seed the track-specific checklist
    const template = track === "TRACK_A_NEW" ? TRACK_A_CHECKLIST : TRACK_B_CHECKLIST
    await db.gbpChecklistItem.createMany({
      data: template.map((item) => ({
        merchantId,
        track: track!,
        week: item.week,
        taskKey: item.taskKey,
        taskLabel: item.taskLabel,
      })),
    })

    // Update merchant's GBP fields
    const updated = await db.merchant.update({
      where: { id: merchantId },
      data: {
        gbpServiceTrack: track,
        gbpProfileStatus: "UNVERIFIED",
        gbpOnboardingWeek: 1,
        gbpReviewCount: 0,
        gbpReviewVelocityCap: velocityCap,
        gbpCitationsReady: false,
        gbpSurgeryCompleted: false,
        gbpMapTrafficEnabled: false,
        gbpTrackStartedAt: new Date(),
        gbpLastReportSentAt: null,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        merchantId,
        actorType: "ADMIN",
        actorId: "super_admin",
        action: "GBP_TRACK_ASSIGNED",
        entity: "Merchant",
        entityId: merchantId,
        metadata: JSON.stringify({ track, velocityCap, checklistCount: template.length }),
      },
    })

    return ok({
      merchant: { id: updated.id, name: updated.name, gbpServiceTrack: updated.gbpServiceTrack },
      checklistItemsCreated: template.length,
      velocityCap,
      message: `Track ${track} assigned successfully with ${template.length} checklist items.`,
    })
  } catch (error) {
    console.error("[GBP AssignTrack] Error:", error)
    return err("Failed to assign GBP track", 500)
  }
}
