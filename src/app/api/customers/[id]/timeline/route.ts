import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: customerId } = await params

  const [auditLogs, messages, bills] = await Promise.all([
    db.auditLog.findMany({
      where: { merchantId, entityId: customerId },
      orderBy: { createdAt: "desc" }
    }),
    db.whatsAppMessage.findMany({
      where: { merchantId, customerId },
      orderBy: { createdAt: "desc" }
    }),
    db.bill.findMany({
      where: { merchantId, customerId },
      orderBy: { createdAt: "desc" }
    })
  ])

  // Normalize into standard timeline format
  const timeline = [
    ...auditLogs.map(log => ({
      id: log.id,
      type: "event",
      action: log.action,
      metadata: log.metadata,
      timestamp: log.createdAt
    })),
    ...messages.map(msg => ({
      id: msg.id,
      type: "message",
      template: msg.template,
      body: msg.body,
      status: msg.status,
      timestamp: msg.createdAt
    })),
    ...bills.map(bill => ({
      id: bill.id,
      type: "transaction",
      amount: bill.amount,
      stampsAwarded: bill.stampsAwarded,
      timestamp: bill.createdAt
    }))
  ]

  // Sort by latest first
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({ timeline })
}
