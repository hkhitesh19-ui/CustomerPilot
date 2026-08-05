// POST /api/rewards — create or update a reward (manager+).
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, deniedMessage, type Role } from "@/lib/rbac"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, name, description, stampsCost, stock, requiresManagerApproval } = body as {
    staffId?: string
    name?: string
    description?: string
    stampsCost?: number
    stock?: number
    requiresManagerApproval?: boolean
  }

  if (!staffId || !name || typeof stampsCost !== "number" || typeof stock !== "number") {
    return err("staffId, name, stampsCost, stock required")
  }

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "rewards.create")) {
    return err(deniedMessage(staff.role as Role, "rewards.create"), 403)
  }

  const reward = await db.reward.create({
    data: {
      merchantId: merchant.id,
      name,
      description: description ?? null,
      stampsCost,
      stock,
      requiresManagerApproval: requiresManagerApproval ?? false,
    },
  })

  await db.auditLog.create({
    data: {
      merchantId: merchant.id,
      actorType: "STAFF",
      actorId: staff.id,
      staffId: staff.id,
      action: "REWARD_CREATED",
      entity: "Reward",
      entityId: reward.id,
      metadata: JSON.stringify({ name, stampsCost, stock }),
    },
  })

  return ok({ reward })
}
