/**
 * Cloud Storage Provider Abstraction
 * Handles storing and retrieving files for Merchant Branding.
 */
export interface CloudStorageProvider {
  /**
   * Uploads a file and returns the permanent public URL
   */
  upload(fileName: string, fileBuffer: Buffer, mimeType: string): Promise<string>
  
  /**
   * Deletes a file by its URL
   */
  delete(url: string): Promise<void>
}
