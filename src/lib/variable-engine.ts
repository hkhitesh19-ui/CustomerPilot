// CustomerPilot Enterprise Communication Engine — Variable Engine

export interface VariableDefinition {
  key: string
  label: string
  description: string
  category: "customer" | "merchant" | "loyalty" | "reward" | "referral" | "system"
  mockValue: string
}

export const VARIABLE_DICTIONARY: Record<string, VariableDefinition> = {
  customerName: {
    key: "customerName",
    label: "Customer Name",
    description: "First or full name of the customer",
    category: "customer",
    mockValue: "Rahul Sharma",
  },
  detectedName: {
    key: "detectedName",
    label: "Detected WhatsApp Name",
    description: "Name automatically detected from WhatsApp profile",
    category: "customer",
    mockValue: "Aarav",
  },
  phone: {
    key: "phone",
    label: "Customer Phone",
    description: "Customer WhatsApp phone number",
    category: "customer",
    mockValue: "+91 98765 43210",
  },
  birthday: {
    key: "birthday",
    label: "Birthday Date",
    description: "Customer's birthday date",
    category: "customer",
    mockValue: "15th August",
  },
  merchantName: {
    key: "merchantName",
    label: "Merchant Business Name",
    description: "Name of the merchant store/business",
    category: "merchant",
    mockValue: "Cake Connection",
  },
  businessName: {
    key: "businessName",
    label: "Business Name (Alias)",
    description: "Alias for merchant business name",
    category: "merchant",
    mockValue: "Cake Connection",
  },
  storeAddress: {
    key: "storeAddress",
    label: "Store Address",
    description: "Physical location address of the store",
    category: "merchant",
    mockValue: "Shop #12, MG Road, Connaught Place, New Delhi",
  },
  storePhone: {
    key: "storePhone",
    label: "Store Contact Phone",
    description: "Official store phone number",
    category: "merchant",
    mockValue: "+91 11 2345 6789",
  },
  storeWebsite: {
    key: "storeWebsite",
    label: "Store Website URL",
    description: "Official merchant website URL",
    category: "merchant",
    mockValue: "https://cakeconnection.com",
  },
  supportNumber: {
    key: "supportNumber",
    label: "Support Hotline",
    description: "Customer support phone number",
    category: "merchant",
    mockValue: "1800-123-4567",
  },
  stampCount: {
    key: "stampCount",
    label: "Stamps Collected",
    description: "Current number of collected stamps",
    category: "loyalty",
    mockValue: "3",
  },
  totalStamps: {
    key: "totalStamps",
    label: "Total Wallet Stamps",
    description: "Total stamps customer currently holds",
    category: "loyalty",
    mockValue: "2",
  },
  visitNumber: {
    key: "visitNumber",
    label: "Visit Number",
    description: "How many times customer has visited",
    category: "loyalty",
    mockValue: "2",
  },
  requiredStamp: {
    key: "requiredStamp",
    label: "Stamps Required",
    description: "Total stamps required to earn a reward",
    category: "loyalty",
    mockValue: "5",
  },
  remainingStamps: {
    key: "remainingStamps",
    label: "Remaining Stamps",
    description: "Stamps left to unlock reward",
    category: "loyalty",
    mockValue: "2",
  },
  rewardName: {
    key: "rewardName",
    label: "Reward Name",
    description: "Title of the unlocked reward",
    category: "reward",
    mockValue: "FREE Chocolate Truffle Cake",
  },
  rewardPoints: {
    key: "rewardPoints",
    label: "Reward Points / Value",
    description: "Points or currency value of reward",
    category: "reward",
    mockValue: "100",
  },
  rewardExpiry: {
    key: "rewardExpiry",
    label: "Reward Expiry Date",
    description: "Expiration date for reward redemption",
    category: "reward",
    mockValue: "31st August 2026",
  },
  couponCode: {
    key: "couponCode",
    label: "Coupon / Voucher Code",
    description: "Unique coupon code for redemption",
    category: "reward",
    mockValue: "VIPCAKE50",
  },
  googleReviewLink: {
    key: "googleReviewLink",
    label: "Google Review Link",
    description: "Direct link to submit Google Review",
    category: "system",
    mockValue: "https://g.page/r/sample/review",
  },
  reviewUrl: {
    key: "reviewUrl",
    label: "AI Review Draft Link",
    description: "CustomerPilot AI auto-drafted review link",
    category: "system",
    mockValue: "http://localhost:3000/review?c=123&m=abc",
  },
  referralLink: {
    key: "referralLink",
    label: "Customer Referral Link",
    description: "Unique referral link for sharing",
    category: "referral",
    mockValue: "https://customerpilot.app/ref/rahul123",
  },
  offerName: {
    key: "offerName",
    label: "Special Offer Title",
    description: "Name of campaign or promotional offer",
    category: "reward",
    mockValue: "Monsoon BOGO Sale 20% OFF",
  },
  offerExpiry: {
    key: "offerExpiry",
    label: "Offer Expiry Date",
    description: "Expiration date of the offer",
    category: "reward",
    mockValue: "15th August 2026",
  },
  otpCode: {
    key: "otpCode",
    label: "OTP Verification Code",
    description: "6-digit authentication pin",
    category: "system",
    mockValue: "482910",
  },
  count: {
    key: "count",
    label: "General Count",
    description: "Count of items/customers for reports",
    category: "system",
    mockValue: "10",
  },
  revenue: {
    key: "revenue",
    label: "Revenue",
    description: "Revenue amount for reports",
    category: "merchant",
    mockValue: "5500",
  },
}

/**
 * Sanitizes template content by removing HTML/Script tags while leaving WhatsApp markdown intact.
 */
export function sanitizeTemplate(body: string): string {
  if (!body) return ""
  return body
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
}

/**
 * Validates template variable syntax `{{variableName}}`.
 * Returns list of unknown variables if not found in dictionary or allowed list.
 */
export function validateTemplateVariables(
  templateBody: string,
  allowedVars?: string[]
): { invalidVars: string[]; foundVars: string[]; isValid: boolean } {
  const matches = templateBody.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || []
  const foundVars = Array.from(
    new Set(matches.map((m) => m.replace(/[\{\}\s]/g, "")))
  )

  const allowedSet = new Set(allowedVars || Object.keys(VARIABLE_DICTIONARY))
  const invalidVars = foundVars.filter((v) => !allowedSet.has(v))

  return {
    invalidVars,
    foundVars,
    isValid: invalidVars.length === 0,
  }
}

/**
 * Renders a template body by safely interpolating variables.
 * Missing or null variables fall back safely without leaving raw braces.
 */
export function renderTemplate(
  templateBody: string,
  variables: Record<string, any> = {},
  options?: { useMockFallbacks?: boolean }
): { text: string; missingVars: string[]; isValid: boolean } {
  const sanitized = sanitizeTemplate(templateBody)
  const missingVars: string[] = []

  const text = sanitized.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    const val = variables[key]

    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return String(val)
    }

    // Fallback logic
    if (options?.useMockFallbacks && VARIABLE_DICTIONARY[key]) {
      return VARIABLE_DICTIONARY[key].mockValue
    }

    missingVars.push(key)
    return "" // Safe fallback: empty string instead of raw broken brace
  })

  return {
    text: text.trim(),
    missingVars: Array.from(new Set(missingVars)),
    isValid: true,
  }
}

/**
 * Generates sample data preview for a template using mock dictionary values.
 */
export function generateSamplePreview(templateBody: string): string {
  const mockVars: Record<string, string> = {}
  Object.keys(VARIABLE_DICTIONARY).forEach((key) => {
    mockVars[key] = VARIABLE_DICTIONARY[key].mockValue
  })

  const { text } = renderTemplate(templateBody, mockVars)
  return text
}
