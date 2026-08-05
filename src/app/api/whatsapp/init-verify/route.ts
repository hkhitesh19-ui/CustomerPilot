import { NextRequest } from "next/server"
import { ok, err } from "@/lib/api"
import { db } from "@/lib/db"

function generateVerifyCode(): string {
  // Generate a random 6-character alphanumeric code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || !body.phone) {
      return err("Phone number is required", 400)
    }

    const { phone } = body
    const cleanPhone = phone.replace(/\D/g, "")

    const adminInstance = process.env.EVOLUTION_ADMIN_INSTANCE
    const adminNumber = process.env.EVOLUTION_ADMIN_NUMBER

    if (!adminInstance || !adminNumber) {
      return err("Server is missing Admin WhatsApp configuration for verification.", 500)
    }

    // 1. Check if the number exists on WhatsApp (Active check)
    if (process.env.EVOLUTION_API_URL) {
      try {
        const evRes = await fetch(`${process.env.EVOLUTION_API_URL}/chat/whatsappNumbers/${adminInstance}`, {
          method: "POST",
          headers: {
            "apikey": process.env.EVOLUTION_API_KEY || process.env.EVOLUTION_GLOBAL_API_KEY || "",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            numbers: [cleanPhone]
          })
        })

        const evData = await evRes.json().catch(() => null)
        
        if (evRes.ok && evData && evData.length > 0) {
          const checkResult = evData[0]
          if (!checkResult.exists) {
            return err("This number is not registered on WhatsApp.", 400)
          }
        } else {
          console.warn("[Evolution API] checkNumber fallback or failed:", evData || evRes.statusText)
          // If the admin instance is disconnected or down, we throw an error for robust testing.
          return err(`WhatsApp Admin Server Error: ${evData?.response?.message || evData?.message || evRes.statusText}`, 500)
        }
      } catch (e: any) {
         return err(`Evolution API Connection Failed: ${e.message}`, 500)
      }
    }

    // 2. Generate a Unique Verification Code
    const verifyCode = generateVerifyCode()
    const verifyText = `VERIFY-${verifyCode}`

    // 3. Create OTPSession to track this verification
    const sessionId = `verify_${Date.now()}_${verifyCode}`
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 mins validity

    await db.oTPSession.create({
      data: {
        id: sessionId,
        phone: cleanPhone,
        otp: verifyCode, // Store the code
        verified: false,
        expiresAt,
        attempts: 0,
        maxAttempts: 5,
        deliveryStatus: "pending",
      },
    })

    // 4. Generate the Deep Link
    const deepLink = `https://wa.me/${adminNumber}?text=${encodeURIComponent(verifyText)}`

    // 5. Send the Deep Link to the Merchant's Phone via Admin Instance
    // This allows the merchant to easily click the link if they are setting up via Desktop
    try {
      const msgBody = {
        number: cleanPhone,
        options: {
          delay: 1000,
          presence: "composing"
        },
        text: `*CustomerPilot Verification*\n\nPlease click the link below and send the pre-filled message to verify your WhatsApp Business connection:\n\n👉 ${deepLink}`
      }

      await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${adminInstance}`, {
        method: "POST",
        headers: {
          "apikey": process.env.EVOLUTION_API_KEY || process.env.EVOLUTION_GLOBAL_API_KEY || "",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(msgBody)
      })
      console.log(`[WhatsApp] Sent verification link to ${cleanPhone}`)
    } catch (e: any) {
      console.error("[WhatsApp] Failed to send verification link:", e.message)
      // We don't fail the request here, because they can still click the UI button if on mobile
    }

    return ok({
      sessionId,
      verifyCode,
      deepLink,
      expiresAt,
      message: "Ready to verify. Check your WhatsApp for the link or click the button."
    })
  } catch (error: any) {
    console.error("[API] WhatsApp init-verify error:", error.message)
    return err(error.message || "Failed to initialize verification", 500)
  }
}
