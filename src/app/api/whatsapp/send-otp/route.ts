// POST /api/whatsapp/send-otp
// Send OTP to merchant's WhatsApp number via Meta Cloud API
import { NextRequest } from "next/server"
import { createOTPSession, sendOTPViaWhatsApp } from "@/lib/whatsapp-business-api"
import { ok, err } from "@/lib/api"

// The WhatsApp number connected to our Evolution API instance
// Messages to this same number will NOT show (WhatsApp self-message limitation)
const EVOLUTION_OWNER_NUMBER = "917203824012"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || !body.phone) {
      return err("Phone number is required", 400)
    }

    const { phone } = body

    // Validate phone format (basic international format check)
    const cleanPhone = phone.replace(/\D/g, "")
    if (cleanPhone.length < 10 || !/^\+?\d+$/.test(cleanPhone)) {
      return err("Invalid phone number format. Include country code (e.g., +91 9876543210)", 400)
    }

    // Create OTP session (includes rate limiting)
    const session = await createOTPSession(cleanPhone)

    const result = await sendOTPViaWhatsApp(cleanPhone, session.otp, session.sessionId)

    // If we have Evolution configured but it failed, strictly throw the error for real testing
    if (!result.success && process.env.EVOLUTION_API_URL) {
      return err(`Failed to send via Evolution API: ${result.error}`, 500)
    }

    // In demo mode OR when Evolution/WhatsApp not connected, show OTP for testing
    const isDemoMode = !process.env.META_API_KEY && !process.env.EVOLUTION_API_URL
    const evolutionFailed = !result.success

    // SELF-MESSAGE DETECTION: WhatsApp cannot deliver messages to itself
    // If merchant enters same number as Evolution API owner, show OTP on screen
    const isSameNumber = cleanPhone === EVOLUTION_OWNER_NUMBER || 
                         cleanPhone.endsWith(EVOLUTION_OWNER_NUMBER) ||
                         EVOLUTION_OWNER_NUMBER.endsWith(cleanPhone)

    const showOtpOnScreen = isDemoMode || evolutionFailed || isSameNumber

    let message = "OTP sent via WhatsApp Business API"
    if (isDemoMode || evolutionFailed) {
      message = `⚠️ WhatsApp not connected. Your OTP is: ${session.otp} (Valid 10 min)`
    } else if (isSameNumber) {
      message = `ℹ️ Same number as business WhatsApp — OTP on screen: ${session.otp} (Valid 10 min)`
    }

    return ok({
      sessionId: session.sessionId,
      otp: showOtpOnScreen ? session.otp : undefined,
      expiresAt: session.expiresAt,
      deliveryResult: {
        success: result.success,
        status: result.status,
        messageId: result.messageId,
      },
      demoMode: showOtpOnScreen,
      isSameNumber,
      message,
      resendCooldownSeconds: 10,
    })
  } catch (error: any) {
    console.error("[API] WhatsApp send-otp error:", error.message)
    
    if (error.message.includes("RATE_LIMITED")) {
      return err("Too many OTP requests. Please try again later.", 429)
    }
    
    return err(error.message || "Failed to send OTP", 500)
  }
}
