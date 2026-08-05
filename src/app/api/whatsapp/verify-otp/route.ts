// POST /api/whatsapp/verify-otp
// Verify OTP entered by merchant
import { NextRequest } from "next/server"
import { verifyOTP } from "@/lib/whatsapp-business-api"
import { ok, err } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || !body.sessionId || !body.otp) {
      return err("sessionId and otp are required", 400)
    }

    const { sessionId, otp } = body

    // Validate OTP format (4 digits)
    if (!/^\d{4}$/.test(otp)) {
      return err("OTP must be 4 digits", 400)
    }

    const result = await verifyOTP(sessionId, otp)

    if (result.valid) {
      return ok({
        verified: true,
        message: "WhatsApp number verified successfully!",
        verifiedAt: new Date().toISOString(),
      })
    } else {
      return ok({
        verified: false,
        reason: result.reason,
        remainingAttempts: result.remainingAttempts,
        message: getErrorMessage(result.reason, result.remainingAttempts),
      }, { status: result.reason === "MAX_ATTEMPTS_EXCEEDED" ? 429 : 400 })
    }
  } catch (error: any) {
    console.error("[API] WhatsApp verify-otp error:", error.message)
    return err(error.message || "Verification failed", 500)
  }
}

function getErrorMessage(reason: string | undefined, remaining?: number): string {
  switch (reason) {
    case "SESSION_NOT_FOUND":
      return "Session expired or invalid. Please request a new OTP."
    case "ALREADY_VERIFIED":
      return "This OTP has already been verified."
    case "OTP_EXPIRED":
      return "OTP has expired. Please request a new one."
    case "MAX_ATTEMPTS_EXCEEDED":
      return "Maximum attempts reached. Please request a new OTP."
    case "INVALID_OTT":
      return `Incorrect OTP. ${remaining !== undefined ? `${remaining} attempts remaining.` : "Please try again."}`
    default:
      return "Verification failed. Please try again."
  }
}
