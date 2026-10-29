import { NextRequest, NextResponse } from "next/server"
import { runFleetWhatsAppMonitor } from "@/lib/whatsapp-monitor"

/**
 * GET & POST /api/cron/whatsapp-health
 * 
 * Scheduled health-check runner (invoked every 30-60 mins via server cron / PM2 / scheduler)
 * Scans all merchant WhatsApp instances, detects unlinked/disconnected states,
 * and dispatches targeted alerts ONLY to affected merchants with 6-hour anti-spam cooldown.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dryRun = searchParams.get("dryRun") === "true"
    const forceSend = searchParams.get("forceSend") === "true"
    const targetMerchantId = searchParams.get("merchantId") || undefined

    const report = await runFleetWhatsAppMonitor({
      dryRun,
      forceSend,
      targetMerchantId
    })

    return NextResponse.json({
      ok: true,
      message: `WhatsApp Health Monitor completed: ${report.healthyCount}/${report.totalMerchants} healthy, ${report.issueCount} issues, ${report.alertsSentCount} alerts sent, ${report.cooldownSkippedCount} cooldown skipped.`,
      report
    })
  } catch (error: any) {
    console.error("[CRON_WHATSAPP_HEALTH_ERROR]:", error)
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to execute WhatsApp Health Monitor Cron" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
