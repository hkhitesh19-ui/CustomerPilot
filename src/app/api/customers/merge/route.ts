// POST /api/customers/merge — merge duplicate customer into canonical.
// Body: { staffId, canonicalId, duplicateId, keepBirthday }
import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, requireMerchant } from "@/lib/api"
import { can, type Role } from "@/lib/rbac"
import { executeMerge, previewMerge } from "@/lib/customer-merge"

export async function POST(req: NextRequest) {
  const merchant = await requireMerchant()
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { staffId, canonicalId, duplicateId, keepBirthday } = body as {
    staffId?: string; canonicalId?: string; duplicateId?: string; keepBirthday?: "canonical" | "duplicate"
  }
  if (!staffId || !canonicalId || !duplicateId) return err("staffId, canonicalId, duplicateId required")
  if (!keepBirthday) return err("keepBirthday (canonical|duplicate) required")

  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.merchantId !== merchant.id) return err("Staff not found", 404)
  if (!can(staff.role as Role, "customers.block")) { // merge requires manager-level
    return err("Only Manager or Owner can merge customers", 403)
  }

  try {
    const result = await executeMerge({
      staffId,
      canonicalId,
      duplicateId,
      keepBirthday,
      merchantId: merchant.id,
    })
    return ok({ mergeId: result.mergeId })
  } catch (e: any) {
    return err(e.message ?? "Merge failed", 500)
  }
}

// GET endpoint for preview
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const canonicalId = url.searchParams.get("canonicalId")
  const duplicateId = url.searchParams.get("duplicateId")
  if (!canonicalId || !duplicateId) return err("canonicalId and duplicateId required")
  try {
    const preview = await previewMerge({ canonicalId, duplicateId })
    return ok({ preview })
  } catch (e: any) {
    return err(e.message ?? "Preview failed", 500)
  }
}
