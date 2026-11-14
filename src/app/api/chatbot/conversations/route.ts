import { NextRequest, NextResponse } from "next/server"

const DEMO_CONVERSATIONS = [
  {
    id: "conv-1",
    customerName: "Pooja Patel",
    customerPhone: "+91 9825123456",
    channel: "WhatsApp",
    lastMessage: "Thank you! I will visit the store to pick it up.",
    lastMessageTime: "10 mins ago",
    status: "AI_HANDLED",
    unreadCount: 0,
    messages: [
      { sender: "customer", text: "Hi, do you have 1kg chocolate cake today?", time: "08:12 AM" },
      { sender: "bot", text: "Hello! I am your AI assistant for Cake Connection. Yes, we have freshly baked 1 kg Special Chocolate Truffle Cake available for Rs 650! Would you like us to keep one aside for you?", time: "08:12 AM" },
      { sender: "customer", text: "Thank you! I will visit the store to pick it up.", time: "08:15 AM" }
    ]
  },
  {
    id: "conv-2",
    customerName: "Amit Shah",
    customerPhone: "+91 9712345678",
    channel: "WhatsApp",
    lastMessage: "I need to talk to the store manager about bulk discount.",
    lastMessageTime: "45 mins ago",
    status: "HUMAN_TAKEOVER",
    unreadCount: 1,
    messages: [
      { sender: "customer", text: "Do you give discounts on 5 cakes?", time: "07:30 AM" },
      { sender: "bot", text: "For bulk orders of 5 or more cakes, special custom pricing is available. Let me connect you with our store manager.", time: "07:31 AM" },
      { sender: "customer", text: "I need to talk to the store manager about bulk discount.", time: "07:32 AM" }
    ]
  }
]

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      conversations: DEMO_CONVERSATIONS
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, action } = body // action: "TAKEOVER" | "RELEASE"

    return NextResponse.json({
      success: true,
      message: action === "TAKEOVER" ? "Conversation taken over by agent" : "Released to AI bot auto-reply"
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update conversation status" }, { status: 500 })
  }
}
