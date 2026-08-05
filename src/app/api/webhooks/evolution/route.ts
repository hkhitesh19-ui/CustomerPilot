import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => null)
    
    // Quick validation of the webhook payload structure
    if (!payload || !payload.event || !payload.data) {
      return NextResponse.json({ success: true, message: "Ignored, invalid structure" })
    }

    // We only care about incoming messages
    if (payload.event !== "messages.upsert") {
      return NextResponse.json({ success: true, message: "Ignored, not a message event" })
    }

    const msgData = payload.data?.message || payload.data
    const isFromMe = msgData?.key?.fromMe

    // Extract the text content from different potential message formats
    let textContent = ""
    if (msgData?.message?.conversation) {
      textContent = msgData.message.conversation
    } else if (msgData?.message?.extendedTextMessage?.text) {
      textContent = msgData.message.extendedTextMessage.text
    } else if (msgData?.text) {
      textContent = msgData.text
    }
    
    const normalizedText = textContent ? textContent.trim().toUpperCase() : ""
    const isVerifyCommand = normalizedText.startsWith("VERIFY-")

    if (isFromMe && !isVerifyCommand) {
      return NextResponse.json({ success: true, message: "Ignored, message is from me" })
    }

    if (!isVerifyCommand) {
      return NextResponse.json({ success: true, message: "Ignored, not a verify command" })
    }

    const verifyCode = normalizedText.replace("VERIFY-", "")
    
    // Extract the sender's phone number
    const remoteJid = msgData?.key?.remoteJid
    if (!remoteJid) {
      return NextResponse.json({ success: true, message: "Ignored, no remoteJid" })
    }
    
    // remoteJid format: 919876543210@s.whatsapp.net
    const senderPhone = remoteJid.split("@")[0]

    // Find the pending verification session
    const session = await db.oTPSession.findFirst({
      where: {
        otp: verifyCode,
        verified: false,
        phone: senderPhone,
        expiresAt: { gt: new Date() }
      }
    })

    if (!session) {
      console.warn(`[Webhook] Invalid or expired verify code received: ${verifyCode} from ${senderPhone}`)
      return NextResponse.json({ success: true, message: "Ignored, session not found or expired" })
    }

    // 1. Mark session as verified
    await db.oTPSession.update({
      where: { id: session.id },
      data: { verified: true }
    })

    // 2. We need the merchant ID to update the merchant record natively.
    // However, the OTPSession doesn't link directly to the merchant.
    // Wait, the new architecture doesn't have merchantId in OTPSession. 
    // We can just verify it, and let the frontend PATCH the merchant record once polling succeeds.
    // Alternatively, we could add a `messageId` field to OTPSession storing the merchantId when we created it.
    // For now, let the frontend handle the merchant update since it has the merchantId context when polling succeeds!

    return NextResponse.json({ success: true, message: "Verified successfully" })
  } catch (error: any) {
    console.error("[API] Webhook error:", error.message)
    // Always return 200 to webhooks to avoid retries on parsing errors
    return NextResponse.json({ success: false, error: error.message })
  }
}
