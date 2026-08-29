import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { storage } from "@/lib/storage"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || 'cpilot_jwt_secret_change_this_in_production_2026!'

async function resolveMerchant(req: NextRequest) {
  const headerId = req.headers.get("x-merchant-id")
  if (headerId && headerId !== "cms97ihsr0002w0ykccl3xvqy") {
    const m = await db.merchant.findUnique({ where: { id: headerId } }).catch(() => null)
    if (m) return m
  }

  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (token) {
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      const merchantId = payload.merchantId as string
      if (merchantId) {
        const m = await db.merchant.findUnique({ where: { id: merchantId } }).catch(() => null)
        if (m) return m
      }
    }
  } catch {}

  // Fallback to latest merchant
  return await db.merchant.findFirst({ orderBy: { createdAt: "desc" } })
}

export async function POST(req: NextRequest) {
  try {
    const merchant = await resolveMerchant(req)
    if (!merchant) return err("Unauthorized", 401)

    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "logo" or "cover"

    if (!file || !type) {
      return err("File and type are required", 400)
    }

    if (!["logo", "cover"].includes(type)) {
      return err("Invalid type", 400)
    }

    // ── FILE UPLOAD VALIDATION ─────────────────────────────────────────────
    // Whitelist allowed MIME types (images only)
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]
    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
      return err(`Invalid file type: ${file.type}. Only image files are allowed.`, 400)
    }

    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return err(`Invalid file extension: ${ext}. Only .jpg, .jpeg, .png, .webp, .gif, .svg are allowed.`, 400)
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return err(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`, 400)
    }
    // ── END VALIDATION ─────────────────────────────────────────────────────

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to Abstracted Storage Provider (Local/S3/Vercel)
    const publicUrl = await storage.upload(file.name, buffer, file.type)

    // Also copy to standalone public/uploads if running standalone
    try {
      const fs = await import("fs")
      const path = await import("path")
      const standaloneUploads = path.join(process.cwd(), ".next", "standalone", "public", "uploads")
      if (fs.existsSync(path.join(process.cwd(), ".next", "standalone", "public"))) {
        if (!fs.existsSync(standaloneUploads)) {
          fs.mkdirSync(standaloneUploads, { recursive: true })
        }
        const fileName = path.basename(publicUrl)
        fs.writeFileSync(path.join(standaloneUploads, fileName), buffer)
      }
    } catch {}

    // Update the database
    const updateData = type === "logo" ? { logoUrl: publicUrl } : { coverUrl: publicUrl }
    
    await db.merchant.update({
      where: { id: merchant.id },
      data: updateData
    })

    return ok({ url: publicUrl, message: `${type} uploaded successfully` })
  } catch (error: any) {
    console.error("[API] Upload Error:", error.message)
    return err("Upload failed: " + error.message, 500)
  }
}
