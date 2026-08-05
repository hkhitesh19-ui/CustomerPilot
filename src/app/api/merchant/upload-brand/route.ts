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
