import { NextRequest, NextResponse } from "next/server"

const DEMO_LEADS = [
  {
    id: "lead-1",
    customerName: "Pooja Patel",
    customerPhone: "+91 9825123456",
    requirement: "1kg Dutch Chocolate Truffle for 15 Nov Evening",
    channel: "WhatsApp",
    status: "NEW",
    createdAt: "14 Nov 2026, 08:15 AM"
  },
  {
    id: "lead-2",
    customerName: "Amit Shah",
    customerPhone: "+91 9712345678",
    requirement: "Custom Photo Cake enquiry for Birthday",
    channel: "WhatsApp",
    status: "CONTACTED",
    createdAt: "13 Nov 2026, 06:40 PM"
  },
  {
    id: "lead-3",
    customerName: "Sneha Desai",
    customerPhone: "+91 9898112233",
    requirement: "Inquired about home delivery to Gotri area",
    channel: "Website Widget",
    status: "CONVERTED",
    createdAt: "13 Nov 2026, 02:10 PM"
  }
]

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      totalLeads: DEMO_LEADS.length,
      leads: DEMO_LEADS
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 })
  }
}
