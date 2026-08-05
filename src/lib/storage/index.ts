import { CloudStorageProvider } from "./StorageProvider"
import { LocalDevAdapter } from "./LocalDevAdapter"
import { VercelBlobAdapter } from "./VercelBlobAdapter"

class StorageFactory {
  static getProvider(): CloudStorageProvider {
    const provider = process.env.STORAGE_PROVIDER || "local"
    
    switch (provider.toLowerCase()) {
      case "vercel":
        return new VercelBlobAdapter()
      case "local":
      default:
        return new LocalDevAdapter()
    }
  }
}

export const storage = StorageFactory.getProvider()
