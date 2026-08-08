import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const merchantsCount = await db.merchant.count()
    const activeCustomersCount = await db.customer.count()
    const billsTodayCount = await db.bill.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } }
    })

    // Queue & WhatsApp Telemetry
    const totalMessages = await db.whatsAppMessage.count()
    const queuedMessages = await db.whatsAppMessage.count({ where: { status: "queued" } })
    const scheduledMessages = await db.whatsAppMessage.count({ where: { status: "scheduled" } })
    const failedMessages = await db.whatsAppMessage.count({ where: { status: "failed" } })
    const sentMessages = await db.whatsAppMessage.count({ where: { status: "sent" } })

    const failureRatePct = totalMessages > 0 ? Number(((failedMessages / totalMessages) * 100).toFixed(2)) : 0

    // Threshold Alerting Logic
    const alerts: string[] = []
    if (queuedMessages > 500) {
      alerts.push(`CRITICAL: WhatsApp Queue backlog exceeded threshold (${queuedMessages} queued messages).`)
    }
    if (failureRatePct > 5.0) {
      alerts.push(`WARNING: WhatsApp Gateway failure rate elevated (${failureRatePct}% failed).`)
    }

    // Incidents Summary
    const openIncidentsCount = await db.incident.count({ where: { status: "OPEN" } })
    const recentIncidents = await db.incident.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { merchant: { select: { name: true } } }
    })

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        merchantsCount,
        activeCustomersCount,
        billsTodayCount,
      },
      whatsAppTelemetry: {
        totalMessages,
        queuedMessages,
        scheduledMessages,
        sentMessages,
        failedMessages,
        failureRatePct,
      },
      alerts: {
        hasAlerts: alerts.length > 0,
        alertMessages: alerts,
      },
      incidents: {
        openIncidentsCount,
        recentIncidents,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
