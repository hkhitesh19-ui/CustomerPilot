// POST /api/rbac/check — pure check, no side effects.
// Body: { role, permission }
import { NextRequest } from "next/server"
import { can, ROLE_PERMISSIONS, type Role } from "@/lib/rbac"
import { ok, err } from "@/lib/api"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return err("Invalid JSON body")
  const { role, permission } = body as { role?: string; permission?: string }
  if (!role || !permission) return err("role and permission required")
  if (!["OWNER", "MANAGER", "CASHIER"].includes(role)) return err("Invalid role")

  return ok({
    allowed: can(role as Role, permission as any),
    permissions: ROLE_PERMISSIONS[role as Role],
  })
}
