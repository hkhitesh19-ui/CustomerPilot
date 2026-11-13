import { db } from "@/lib/db"
import { NextRequest } from "next/server"
import crypto from "crypto"

export interface ScanMeta {
  deviceType?: string
  os?: string
  browser?: string
  referrer?: string
  ipHash?: string
}

/**
 * Normalizes a merchant business name or custom text into a permanent URL-friendly slug.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Parses user-agent header to extract deviceType, OS, and browser cleanly.
 */
export function parseUserAgent(uaString: string | null): { deviceType: string; os: string; browser: string } {
  if (!uaString) {
    return { deviceType: "unknown", os: "unknown", browser: "unknown" }
  }

  const ua = uaString.toLowerCase()

  // Device
  let deviceType = "desktop"
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = "tablet"
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(uaString)) {
    deviceType = "mobile"
  }

  // OS
  let os = "other"
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) os = "iOS"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS"
  else if (ua.includes("linux")) os = "Linux"

  // Browser
  let browser = "other"
  if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) browser = "Chrome"
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari"
  else if (ua.includes("firefox")) browser = "Firefox"
  else if (ua.includes("edg")) browser = "Edge"
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera"

  return { deviceType, os, browser }
}

/**
 * Privacy-safe IP hashing using SHA-256 with salt.
 */
export function hashIpAddress(ip: string | null): string {
  if (!ip) return "0000000000000000"
  return crypto.createHash("sha256").update(ip + (process.env.NEXTAUTH_SECRET || "cp_salt_2026")).digest("hex").substring(0, 16)
}

/**
 * Asynchronously logs a scan event without blocking user redirection.
 */
export async function logQrScanEvent(qrCodeId: string, merchantId: string, req: NextRequest): Promise<void> {
  try {
    const uaHeader = req.headers.get("user-agent")
    const { deviceType, os, browser } = parseUserAgent(uaHeader)
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "127.0.0.1"
    const ipHash = hashIpAddress(rawIp)
    const referrer = req.headers.get("referer") || req.headers.get("referrer") || undefined

    // Increment scan count & create scan event in transaction
    await db.$transaction([
      db.qrCode.update({
        where: { id: qrCodeId },
        data: { totalScans: { increment: 1 } }
      }),
      db.qrScanEvent.create({
        data: {
          qrCodeId,
          merchantId,
          deviceType,
          os,
          browser,
          referrer,
          ipHash,
          isBot: uaHeader ? /bot|crawler|spider|crawling/i.test(uaHeader) : false
        }
      })
    ])
  } catch (err) {
    console.error("[QR Engine] Failed to log scan event:", err)
  }
}
