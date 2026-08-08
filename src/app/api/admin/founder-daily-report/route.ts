import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { calculateCustomerPilotSuccessScore } from "@/lib/merchant-intelligence"
import { APP_VERSION } from "@/lib/version"

export async function GET() {
  try {
    const activeMerchants = await db.merchant.count({ where: { status: "ACTIVE" } })
    const totalCustomers = await db.customer.count()

    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
    const todayBillsCount = await db.bill.count({ where: { createdAt: { gte: startOfToday } } })
    const todayRevenueAgg = await db.bill.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { amount: true },
    })
    const todayRevenue = todayRevenueAgg._sum.amount || 0

    const queuedMessages = await db.whatsAppMessage.count({ where: { status: "queued" } })
    const failedMessages = await db.whatsAppMessage.count({ where: { status: "failed" } })
    const openIncidentsCount = await db.incident.count({ where: { status: "OPEN" } })

    const merchants = await db.merchant.findMany({ select: { id: true } })
    const merchantScores = await Promise.all(merchants.map(m => calculateCustomerPilotSuccessScore(m.id)))
    const atRiskMerchants = merchantScores.filter(m => m.churnRisk.isAtRisk)

    // Format WhatsApp / Email Daily Briefing Text for Founder
    const reportText = `
🚀 CUSTOMERPILOT DAILY FOUNDER BRIEFING (${new Date().toLocaleDateString("en-IN")})
Version: ${APP_VERSION}

📊 TODAY'S HIGHLIGHTS:
• Today's Revenue: ₹${todayRevenue.toLocaleString("en-IN")} (${todayBillsCount} POS Bills)
• Active Merchants: ${activeMerchants}
• Total Customer Profiles: ${totalCustomers}

⚙️ OPERATIONAL TELEMETRY:
• Pending WhatsApp Queue: ${queuedMessages}
• Failed Messages (24h): ${failedMessages}
• Open Incidents: ${openIncidentsCount}
• Merchants At Churn Risk: ${atRiskMerchants.length}

🏆 TOP PERFORMING MERCHANT:
${merchantScores[0] ? `• ${merchantScores[0].merchantName} (${merchantScores[0].successScore}/100 Score)` : "None"}

Have a productive day leading CustomerPilot to pilot expansion!
    `.trim()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      formattedReport: reportText,
      data: {
        activeMerchants,
        totalCustomers,
        todayRevenue,
        todayBillsCount,
        queuedMessages,
        failedMessages,
        openIncidentsCount,
        atRiskCount: atRiskMerchants.length,
      }
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
