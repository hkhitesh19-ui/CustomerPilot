import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

export const AGENCY_EMAIL = "CustomerPilot1@gmail.com"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get("merchantId")
    if (!merchantId) return err("merchantId is required", 400)

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        gbpServiceTrack: true,
        gbpProfileStatus: true,
        merchantGoogleConnections: {
          select: {
            id: true,
            syncStatus: true,
            verified: true,
            placeName: true,
            address: true,
            connectionType: true,
          },
        },
        gbpChecklistItems: {
          where: { taskKey: "MANAGER_ACCESS" },
          select: { id: true, isDone: true, doneAt: true, notes: true },
        },
      },
    })

    if (!merchant) return err("Merchant not found", 404)

    const managerTask = merchant.gbpChecklistItems[0]
    const gbpConn = merchant.merchantGoogleConnections

    const isInvited = 
      managerTask?.isDone || 
      gbpConn?.syncStatus === "MANAGER_INVITED" || 
      gbpConn?.syncStatus === "MANAGER_CONNECTED"

    const isConnected = 
      gbpConn?.syncStatus === "MANAGER_CONNECTED" || 
      (managerTask?.isDone && gbpConn?.verified)

    return ok({
      merchantId,
      agencyEmail: AGENCY_EMAIL,
      isInvited: !!isInvited,
      isConnected: !!isConnected,
      invitedAt: managerTask?.doneAt ?? null,
      status: isConnected ? "CONNECTED" : isInvited ? "INVITED" : "NOT_INVITED",
      managerTask: managerTask ?? null,
    })
  } catch (error) {
    console.error("[GBP Manager Access GET] Error:", error)
    return err("Failed to retrieve manager access state", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return err("Invalid JSON body", 400)

    const { merchantId, status = "INVITED", notes } = body as {
      merchantId?: string
      status?: "INVITED" | "CONNECTED" | "REVOKED"
      notes?: string
    }

    if (!merchantId) return err("merchantId is required", 400)

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      include: {
        merchantGoogleConnections: true,
        gbpChecklistItems: { where: { taskKey: "MANAGER_ACCESS" } },
      },
    })

    if (!merchant) return err("Merchant not found", 404)

    const isInvited = status === "INVITED" || status === "CONNECTED"
    const isDone = isInvited

    // 1. Update or create MerchantGoogleConnection
    if (merchant.merchantGoogleConnections) {
      await db.merchantGoogleConnection.update({
        where: { id: merchant.merchantGoogleConnections.id },
        data: {
          syncStatus: status === "CONNECTED" ? "MANAGER_CONNECTED" : "MANAGER_INVITED",
          connectionType: "agency_manager",
          verified: status === "CONNECTED",
        },
      })
    } else {
      await db.merchantGoogleConnection.create({
        data: {
          merchantId,
          syncStatus: status === "CONNECTED" ? "MANAGER_CONNECTED" : "MANAGER_INVITED",
          connectionType: "agency_manager",
          verified: status === "CONNECTED",
          placeName: merchant.name,
          address: merchant.address,
        },
      })
    }

    // 2. Mark the MANAGER_ACCESS checklist task if it exists
    const managerTask = merchant.gbpChecklistItems[0]
    if (managerTask) {
      await db.gbpChecklistItem.update({
        where: { id: managerTask.id },
        data: {
          isDone,
          doneAt: isDone ? new Date() : null,
          doneByEmail: AGENCY_EMAIL,
          notes: notes || `Manager access invite sent to ${AGENCY_EMAIL}`,
        },
      })
    }

    // 3. Log in AuditLog
    await db.auditLog.create({
      data: {
        merchantId,
        actorType: "MERCHANT",
        actorId: merchantId,
        action: "GBP_MANAGER_ACCESS_INVITE_SENT",
        entity: "MerchantGoogleConnection",
        entityId: merchantId,
        metadata: JSON.stringify({
          agencyEmail: AGENCY_EMAIL,
          status,
          notes: notes || `Manager access invite sent to ${AGENCY_EMAIL}`,
        }),
      },
    })

    return ok({
      success: true,
      agencyEmail: AGENCY_EMAIL,
      status: status === "CONNECTED" ? "CONNECTED" : "INVITED",
      message: `Manager access recorded for ${AGENCY_EMAIL}. CustomerPilot team will accept the invite shortly.`,
    })
  } catch (error) {
    console.error("[GBP Manager Access POST] Error:", error)
    return err("Failed to record manager access invite", 500)
  }
}
