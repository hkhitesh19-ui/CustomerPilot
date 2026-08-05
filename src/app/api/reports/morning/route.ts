import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [todayBills, customers, waitingCount, pendingReviews, deadLetters] = await Promise.all([
      db.bill.findMany({
        where: { merchantId, status: "confirmed", createdAt: { gte: todayStart } },
        select: { amount: true, stampsAwarded: true }
      }),
      db.customer.findMany({
        where: { merchantId },
        select: { id: true, lifetimeSpend: true, lifetimeStamps: true }
      }),
      db.waitingCustomer.count({
        where: { merchantId, status: "waiting" }
      }),
      db.review.count({
        where: { merchantId, status: "pending" }
      }),
      db.deadLetterQueue.count({
        where: { merchantId }
      })
    ])

    const todayRevenue = todayBills.reduce((acc, b) => acc + (b.amount || 0), 0)
    const todayStamps = todayBills.reduce((acc, b) => acc + (b.stampsAwarded || 0), 0)
    const repeatCustomers = customers.filter(c => c.lifetimeStamps > 1).length

    const suggestions: string[] = []
    if (customers.length > 0 && repeatCustomers / customers.length < 0.3) {
      suggestions.push("Repeat customer rate is under 30%. Consider running a 2x Bonus Stamp weekend event.")
    }
    if (pendingReviews > 0) {
      suggestions.push(`You have ${pendingReviews} pending Google review(s) waiting for AI reply approval.`)
    }
    if (suggestions.length === 0) {
      suggestions.push("All metrics are optimal. Loyalty engagement is performing steadily.")
    }

    return NextResponse.json({
      report: {
        date: new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
        todayRevenue,
        todayStamps,
        totalCustomers: customers.length,
        repeatCustomers,
        waitingQueueCount: waitingCount,
        pendingReviews,
        communicationHealth: deadLetters === 0 ? "HEALTHY" : "DEGRADED",
        deadLetters,
        aiSuggestions: suggestions
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate morning report" }, { status: 500 })
  }
}
