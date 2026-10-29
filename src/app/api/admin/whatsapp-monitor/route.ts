import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/jwt-secret"
import { runFleetWhatsAppMonitor } from "@/lib/whatsapp-monitor"

async function verifySuperAdmin(req: NextRequest): Promise<{ ok: boolean; error?: NextResponse }> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return { ok: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()))
    if (payload.role !== "super_admin") {
      return { ok: false, error: NextResponse.json({ error: "Forbidden: SuperAdmin access required" }, { status: 403 }) }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
}

/**
 * GET /api/admin/whatsapp-monitor
 * SuperAdmin inspection: Returns live status of all merchants without sending messages (dryRun = true by default)
 */
export async function GET(req: NextRequest) {
  const auth = await verifySuperAdmin(req)
  if (!auth.ok) return auth.error!

  try {
    const { searchParams } = new URL(req.url)
    const targetMerchantId = searchParams.get("merchantId") || undefined
    const dryRun = searchParams.get("dryRun") !== "false"

    const report = await runFleetWhatsAppMonitor({
      dryRun,
      targetMerchantId
    })

    return NextResponse.json({
      ok: true,
      report
    })
  } catch (error: any) {
    console.error("[API_ADMIN_WHATSAPP_MONITOR_GET]", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/admin/whatsapp-monitor
 * SuperAdmin active execution: Checks and sends alerts to affected merchants
 */
export async function POST(req: NextRequest) {
  const auth = await verifySuperAdmin(req)
  if (!auth.ok) return auth.error!

  try {
    const body = await req.json().catch(() => ({}))
    const { merchantId, forceSend = false, dryRun = false } = body

    const report = await runFleetWhatsAppMonitor({
      dryRun: Boolean(dryRun),
      forceSend: Boolean(forceSend),
      targetMerchantId: merchantId || undefined
    })

    return NextResponse.json({
      ok: true,
      report,
      message: `Health check executed: ${report.alertsSentCount} alerts sent, ${report.cooldownSkippedCount} in cooldown.`
    })
  } catch (error: any) {
    console.error("[API_ADMIN_WHATSAPP_MONITOR_POST]", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
