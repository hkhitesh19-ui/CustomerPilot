import fs from "fs"
import path from "path"
import { CloudStorageProvider } from "./StorageProvider"

export class LocalDevAdapter implements CloudStorageProvider {
  private getTargetDirs(): string[] {
    const cwd = process.cwd()
    const dirs = new Set<string>()

    dirs.add(path.join(cwd, "public", "uploads"))
    dirs.add(path.join(cwd, ".next", "standalone", "public", "uploads"))

    // Dedicated persistent storage outside volatile build directory on production Linux VPS
    if (fs.existsSync("/var/www")) {
      dirs.add("/var/www/uploads")
      dirs.add("/var/www/CustomerPilot/public/uploads")
      dirs.add("/var/www/CustomerPilot/.next/standalone/public/uploads")
    }

    return Array.from(dirs)
  }

  constructor() {
    for (const dir of this.getTargetDirs()) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
      } catch {}
    }
  }

  async upload(fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`
    
    for (const dir of this.getTargetDirs()) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true })
        }
        const filePath = path.join(dir, safeName)
        await fs.promises.writeFile(filePath, fileBuffer)
      } catch (err) {
        console.warn(`[LocalDevAdapter] Write to ${dir} failed:`, err)
      }
    }
    
    // Return the public URL path
    return `/uploads/${safeName}`
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return
    
    const fileName = url.replace("/uploads/", "")
    for (const dir of this.getTargetDirs()) {
      const filePath = path.join(dir, fileName)
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath)
        }
      } catch (error) {
        console.error("[LocalDevAdapter] Delete error:", error)
      }
    }
  }
}
