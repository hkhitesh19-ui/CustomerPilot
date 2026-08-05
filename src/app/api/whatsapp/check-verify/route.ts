import { NextRequest } from "next/server"
import { ok, err } from "@/lib/api"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return err("Session ID is required", 400)
    }

    const session = await db.oTPSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return err("Session not found", 404)
    }

    return ok({
      verified: session.verified,
      expiresAt: session.expiresAt
    })
  } catch (error: any) {
    console.error("[API] WhatsApp check-verify error:", error.message)
    return err(error.message || "Failed to check verification", 500)
  }
}
