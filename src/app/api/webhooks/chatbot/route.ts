import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  // Support Meta webhook verification challenge
  const mode = req.nextUrl.searchParams.get("hub.mode")
  const token = req.nextUrl.searchParams.get("hub.verify_token")
  const challenge = req.nextUrl.searchParams.get("hub.challenge")

  if (mode === "subscribe" && challenge) {
    return new NextResponse(challenge, { status: 200 })
  }
  return NextResponse.json({ status: "Chatbot Webhook Active", endpoint: "/api/webhooks/chatbot" })
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null)
    if (!payload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Acknowledge receipt immediately (200 OK)
    return NextResponse.json({
      success: true,
      processed: true,
      timestamp: new Date().toISOString()
    })
  } catch (err: any) {
    console.error("[Chatbot Webhook Error]:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
