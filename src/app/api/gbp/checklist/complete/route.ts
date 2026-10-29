// POST /api/gbp/checklist/complete — Mark a GBP checklist item as done.
// Body: { itemId, doneByEmail, notes? }
// Also handles side-effects: e.g. when VELOCITY_UNLOCKED is done → update cap to 10;
// when VIDEO_VERIFICATION_PASS is done → set gbpProfileStatus to SANDBOX;
// when TOP3_CHECK / TOP3_CONFIRMED is done → set gbpProfileStatus to TOP3_LOCKED.
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body")

    const { itemId, doneByEmail, notes } = body as {
      itemId?: string
      doneByEmail?: string
      notes?: string
    }
    if (!itemId) return err("itemId is required")

    const item = await db.gbpChecklistItem.findUnique({ where: { id: itemId } })
    if (!item) return err("Checklist item not found", 404)

    // Mark item done
    const updated = await db.gbpChecklistItem.update({
      where: { id: itemId },
      data: {
        isDone: true,
        doneAt: new Date(),
        doneByEmail: doneByEmail ?? null,
        notes: notes ?? null,
      },
    })

    // ─── Side-effects based on taskKey ───────────────────────────────────────
    let merchantUpdate: Record<string, unknown> = {}

    switch (item.taskKey) {
      case "MANAGER_ACCESS":
        await db.merchantGoogleConnection.upsert({
          where: { merchantId: item.merchantId },
          update: {
            syncStatus: "MANAGER_CONNECTED",
            connectionType: "agency_manager",
            verified: true,
          },
          create: {
            merchantId: item.merchantId,
            syncStatus: "MANAGER_CONNECTED",
            connectionType: "agency_manager",
            verified: true,
          },
        })
        break

      case "NAP_CITATIONS_DONE":
      case "CITATIONS_READY":
        merchantUpdate.gbpCitationsReady = true
        break

      case "VIDEO_VERIFICATION_PASS":
        // Profile just got verified — enter 30-day Google Sandbox
        merchantUpdate.gbpProfileStatus = "SANDBOX"
        break

      case "VELOCITY_UNLOCKED":
        // Track A: Week 5 unlock — raise review cap from 3 to 10
        merchantUpdate.gbpReviewVelocityCap = 10
        merchantUpdate.gbpProfileStatus = "VERIFIED"
        break

      case "DIRECTORIES_FIXED":
        // Track B: Surgery complete when all surgery tasks are done
        const surgeryTasks = ["MANAGER_ACCESS", "CATEGORY_COPIED", "PRODUCTS_UPLOADED", "QA_UPLOADED", "MINI_WEBSITE_CONNECTED", "DIRECTORIES_FIXED"]
        const allDone = await db.gbpChecklistItem.count({
          where: { merchantId: item.merchantId, taskKey: { in: surgeryTasks }, isDone: true },
        })
        if (allDone >= surgeryTasks.length) {
          merchantUpdate.gbpSurgeryCompleted = true
        }
        break

      case "TRAFFIC_BROADCAST_1":
      case "TRAFFIC_BROADCAST_2":
        merchantUpdate.gbpMapTrafficEnabled = true
        break

      case "TOP3_CHECK":
      case "TOP3_CONFIRMED":
        merchantUpdate.gbpProfileStatus = "TOP3_LOCKED"
        break
    }

    // Apply merchant side-effects if any
    if (Object.keys(merchantUpdate).length > 0) {
      await db.merchant.update({
        where: { id: item.merchantId },
        data: merchantUpdate,
      })
    }

    // Audit log
    await db.auditLog.create({
      data: {
        merchantId: item.merchantId,
        actorType: "ADMIN",
        actorId: doneByEmail ?? "exec",
        action: "GBP_CHECKLIST_ITEM_DONE",
        entity: "GbpChecklistItem",
        entityId: itemId,
        metadata: JSON.stringify({ taskKey: item.taskKey, week: item.week, merchantUpdate }),
      },
    })

    return ok({ item: updated, merchantUpdates: merchantUpdate })
  } catch (error) {
    console.error("[GBP Checklist Complete] Error:", error)
    return err("Failed to complete checklist item", 500)
  }
}
