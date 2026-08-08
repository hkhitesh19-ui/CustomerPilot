import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const scheduled = await db.whatsAppMessage.count({ where: { status: "scheduled" } })
    const queued = await db.whatsAppMessage.count({ where: { status: "queued" } })
    const sent = await db.whatsAppMessage.count({ where: { status: "sent" } })
    const failed = await db.whatsAppMessage.count({ where: { status: "failed" } })
    const retrying = await db.whatsAppMessage.count({ where: { status: "queued", retryCount: { gt: 0 } } })
    const total = await db.whatsAppMessage.count()

    return NextResponse.json({
      success: true,
      queueBreakdown: {
        total,
        scheduled,
        queued,
        sent,
        failed,
        retrying,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
