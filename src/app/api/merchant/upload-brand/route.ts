import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { storage } from "@/lib/storage"

export async function POST(req: NextRequest) {
  try {
    const merchantId = req.headers.get("x-merchant-id")
    if (!merchantId) return err("Unauthorized", 401)

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
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return err(`Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF images are allowed.`, 400)
    }

    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return err(`Invalid file extension: ${ext}. Only .jpg, .jpeg, .png, .webp, .gif are allowed.`, 400)
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return err(`File too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 2MB.`, 400)
    }
    // ── END VALIDATION ─────────────────────────────────────────────────────

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to our Abstracted Storage Provider (Vercel/S3/Local)
    const publicUrl = await storage.upload(file.name, buffer, file.type)

    // Update the database
    const updateData = type === "logo" ? { logoUrl: publicUrl } : { coverUrl: publicUrl }
    
    await db.merchant.update({
      where: { id: merchantId },
      data: updateData
    })

    return ok({ url: publicUrl, message: `${type} uploaded successfully` })
  } catch (error: any) {
    console.error("[API] Upload Error:", error.message)
    return err("Upload failed", 500)
  }
}
