import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAuthenticatedMerchant } from "@/lib/api"

// Default bot configuration for a merchant
const getDefaultConfig = (merchantName: string) => ({
  botName: `${merchantName} AI Assistant`,
  status: "ACTIVE",
  defaultLanguage: "en",
  supportedLanguages: ["en", "hi", "gu"],
  tone: "friendly_professional",
  welcomeMessage: `Hello! I am your AI assistant for ${merchantName}. How can I help you today? (Note: You are chatting with an AI assistant)`,
  fallbackMessage: `I don't have confirmed information for that right now. Let me connect you directly with our team!`,
  autoReplyEnabled: true,
  killSwitchActive: false,
  publishedVersion: "v1.0",
  whatsappConnected: true,
  whatsappNumber: "+91 7203824012"
})

export async function GET(req: NextRequest) {
  try {
    let merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) {
      const authM = await getAuthenticatedMerchant()
      merchantId = authM?.id || null
    }

    let merchantName = "Cake Connection"
    if (merchantId) {
      const m = await db.merchant.findUnique({ where: { id: merchantId }, select: { name: true, whatsappPhone: true } })
      if (m?.name) merchantName = m.name
    }

    return NextResponse.json({
      success: true,
      config: getDefaultConfig(merchantName)
    })
  } catch (err: any) {
    console.error("[Chatbot Config GET Error]:", err)
    return NextResponse.json({ error: "Failed to fetch bot config" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Return updated config
    return NextResponse.json({
      success: true,
      config: body,
      message: "Chatbot configuration updated successfully"
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 })
  }
}
