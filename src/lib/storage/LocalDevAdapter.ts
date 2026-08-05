import fs from "fs"
import path from "path"
import { CloudStorageProvider } from "./StorageProvider"

export class LocalDevAdapter implements CloudStorageProvider {
  private uploadDir: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async upload(fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`
    const filePath = path.join(this.uploadDir, safeName)
    
    await fs.promises.writeFile(filePath, fileBuffer)
    
    // Return the public URL path
    return `/uploads/${safeName}`
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return
    
    const fileName = url.replace("/uploads/", "")
    const filePath = path.join(this.uploadDir, fileName)
    
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
      }
    } catch (error) {
      console.error("[LocalDevAdapter] Delete error:", error)
    }
  }
}
