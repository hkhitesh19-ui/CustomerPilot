import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt-secret";
import { getLiveLlmQuotas } from "@/lib/llm-quota-service";

async function verifySuperAdmin(req: NextRequest): Promise<{ ok: boolean; error?: NextResponse }> {
  // Check role forwarded by proxy.ts
  const proxyRole = req.headers.get("x-user-role");
  if (proxyRole === "super_admin") {
    return { ok: true };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return { ok: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()));
    if (payload.role !== "super_admin" && payload.impersonatedBy !== "super_admin") {
      return { ok: false, error: NextResponse.json({ error: "Forbidden: SuperAdmin access required" }, { status: 403 }) };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
}

/**
 * GET /api/admin/llm-quota
 * Real-time countdown and token quota monitor for SuperAdmin
 */
export async function GET(req: NextRequest) {
  const auth = await verifySuperAdmin(req);
  if (!auth.ok) return auth.error!;

  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "true";

    const quotas = await getLiveLlmQuotas(refresh);

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      models: quotas
    });
  } catch (err: any) {
    console.error("[API_ADMIN_LLM_QUOTA]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
