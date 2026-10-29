import { NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = (formData.get("photo") || formData.get("file")) as File | null

    if (!file) {
      return NextResponse.json({ error: "Photo file is required" }, { status: 400 })
    }

    // Validation: Image types only
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/heic"]
    if (!allowedMimes.includes(file.type) && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files (JPEG, PNG, WEBP) are allowed" }, { status: 400 })
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image file is too large (max 10MB)" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const originalName = file.name || "review_photo.jpg"
    const publicUrl = await storage.upload(originalName, buffer, file.type || "image/jpeg")

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Photo uploaded successfully"
    })
  } catch (error: any) {
    console.error("[Review Photo Upload Error]:", error)
    return NextResponse.json({ error: error.message || "Failed to upload photo" }, { status: 500 })
  }
}
