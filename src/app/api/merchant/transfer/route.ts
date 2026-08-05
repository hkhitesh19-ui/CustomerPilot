// @ts-nocheck
// POST /api/merchant/transfer — initiate ownership transfer.
// Body: { staffId, newOwnerEmail, newOwnerName, reason }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, newOwnerEmail, newOwnerName, reason } = body as {
    staffId?: string; newOwnerEmail?: string; newOwnerName?: string; reason?: string
  }
  if (!staffId || !newOwnerEmail || !newOwnerName) return err("staffId, newOwnerEmail, newOwnerName required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (staff.role !== "OWNER") return err("Only current Owner can initiate transfer", 403)

  // Check if new owner email is already associated with any merchant account
  const existingOwner = await db.staff.findFirst({
    where: { email: newOwnerEmail, role: "OWNER" },
  })
  if (existingOwner) {
    return err("New owner email is already associated with another merchant account. Use a different email or contact support.", 409)
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const transferLog = await db.merchantTransferLog.create({
    data: {
      merchantId: merchant.id,
      oldOwnerId: staff.id,
      oldOwnerName: staff.name,
      newOwnerEmail,
      newOwnerName,
      status: "pending",
      reason: reason ?? "Ownership transfer",
      legalAttestation: `As of ${new Date().toISOString()}, ownership of ${merchant.name} is being transferred from ${staff.name} to ${newOwnerName}. All customer data consent transferred per Indian DPDP Act 2023.`,
      expiresAt,
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "MERCHANT_TRANSFER_INITIATED",
      entity: "MerchantTransferLog",
      entityId: transferLog.id,
      metadata: JSON.stringify({ newOwnerEmail, newOwnerName, expiresAt }),
    },
  })

  return ok({
    transferId: transferLog.id,
    expiresAt,
    legalAttestation: transferLog.legalAttestation,
    message: `Transfer initiated. ${newOwnerName} (${newOwnerEmail}) has 7 days to accept.`,
  })
}



