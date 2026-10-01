import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * normalizePhone — Single source of truth for WhatsApp phone normalisation.
 *
 * Rules (Indian numbers, expandable for other countries):
 *  • Strips everything except digits.
 *  • 10-digit local number  → prepend "91"  (e.g. 9404800921  → 919404800921)
 *  • 11-digit starting "0"  → replace leading 0 with "91"
 *  • 12-digit starting "91" → already correct, keep as-is
 *  • ownerJid from Evolution API ("919404800921@s.whatsapp.net") → strip suffix first
 *
 * Returns null if the input is empty / cannot be normalised.
 *
 * Usage:
 *   normalizePhone("+91 9404 800921")  → "919404800921"
 *   normalizePhone("9404800921")       → "919404800921"
 *   normalizePhone("919404800921@s.whatsapp.net") → "919404800921"
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null

  // Strip Evolution API JID suffix first
  const stripped = raw.replace(/@.*$/, "")

  // Keep only digits
  const digits = stripped.replace(/\D/g, "")

  if (!digits) return null

  if (digits.length === 10) {
    // Plain Indian local number — prepend country code
    return `91${digits}`
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    // 0XXXXXXXXXX format — replace leading 0 with 91
    return `91${digits.slice(1)}`
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    // Already fully qualified Indian number
    return digits
  }

  // For any other format (e.g. international numbers) return as-is if >= 10 digits
  if (digits.length >= 10) return digits

  return null
}
