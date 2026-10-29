import type { PrismaClient } from "@prisma/client";

/**
 * Generates a unique, human-readable merchant ID number in the format CP-XXXXXX.
 * Verifies uniqueness against the database before returning.
 */
export async function generateMerchantIdNumber(db: any): Promise<string> {
  let merchantIdNumber = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 15) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    merchantIdNumber = `CP-${randomNum}`;
    
    // Check database uniqueness
    const existing = await db.merchant.findUnique({
      where: { merchantIdNumber }
    });
    
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  // Fallback to slice of timestamp if there is collision run out (highly unlikely)
  if (!isUnique) {
    merchantIdNumber = `CP-${Date.now().toString().slice(-6)}`;
  }

  return merchantIdNumber;
}
