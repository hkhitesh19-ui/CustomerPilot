/**
 * URL Sanitizer & Validation Utility
 * Prevents accidental URL concatenation, malformed links, and multi-paste errors.
 */

export interface UrlValidationResult {
  isValid: boolean
  cleanUrl: string
  error?: string
  hadMultipleUrls?: boolean
}

/**
 * Detects if string contains multiple HTTP/HTTPS prefixes or repeated domains
 */
export function detectMultipleUrls(input: string): boolean {
  if (!input) return false
  const trimmed = input.trim()
  const protocolMatches = trimmed.match(/https?:\/\//gi)
  if (protocolMatches && protocolMatches.length > 1) return true

  const waMatches = trimmed.match(/chat\.whatsapp\.com/gi)
  if (waMatches && waMatches.length > 1) return true

  return false
}

/**
 * Extracts and sanitizes the destination URL.
 * If multiple URLs were accidentally concatenated (e.g., pasting a new link over an unselected old one),
 * it extracts the last valid URL that the user just pasted.
 */
export function sanitizeDestinationUrl(
  input: string,
  options: { requireWhatsApp?: boolean } = {}
): UrlValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      cleanUrl: "",
      error: "Destination URL cannot be empty."
    }
  }

  let raw = input.trim()
  const hasMulti = detectMultipleUrls(raw)

  // If multiple URLs detected (e.g. https://chat.whatsapp.com/AAAhttps://chat.whatsapp.com/BBB?xyz)
  if (hasMulti) {
    const splitUrls = raw.split(/(?=https?:\/\/)/gi).filter(Boolean).map(s => s.trim())
    const candidate = splitUrls[splitUrls.length - 1]
    const candidateValidation = validateSingleUrl(candidate, options)
    return {
      isValid: candidateValidation.isValid,
      cleanUrl: candidateValidation.cleanUrl,
      hadMultipleUrls: true,
      error: candidateValidation.isValid
        ? undefined
        : `Multiple concatenated URLs detected, and the latest link (${candidate}) is invalid.`
    }
  }

  return validateSingleUrl(raw, options)
}

function validateSingleUrl(
  urlStr: string,
  options: { requireWhatsApp?: boolean } = {}
): UrlValidationResult {
  let toTest = urlStr.trim()

  // Auto-prepend https:// if merchant omitted protocol (e.g. chat.whatsapp.com/...)
  if (!toTest.startsWith("http://") && !toTest.startsWith("https://")) {
    toTest = `https://${toTest}`
  }

  let parsed: URL
  try {
    parsed = new URL(toTest)
  } catch {
    return {
      isValid: false,
      cleanUrl: urlStr,
      error: "Invalid URL syntax. Please enter a complete web address."
    }
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      isValid: false,
      cleanUrl: urlStr,
      error: "URL must begin with http:// or https://"
    }
  }

  // Ensure domain has at least one dot or is localhost
  if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") {
    return {
      isValid: false,
      cleanUrl: urlStr,
      error: "Invalid domain name. Please enter a complete web address (e.g. https://example.com)"
    }
  }

  // Ensure no residual embedded protocol inside the pathname
  // e.g. /HDlqDkVYITQGomcU8Nbz65https://chat.whatsapp.com/...
  if (/https?:\/\//i.test(parsed.pathname) || /chat\.whatsapp\.com/i.test(parsed.pathname)) {
    // Concatenation hidden inside path!
    const parts = parsed.pathname.split(/(?=https?:\/\/|chat\.whatsapp\.com)/i)
    const lastPart = parts[parts.length - 1]
    const cleanCandidate = lastPart.startsWith("http") ? lastPart : `https://${lastPart.replace(/^\/+/, "")}`
    return validateSingleUrl(cleanCandidate, options)
  }

  // If WhatsApp specific validation is requested
  if (options.requireWhatsApp) {
    const host = parsed.hostname.toLowerCase()
    const validWaHosts = ["chat.whatsapp.com", "wa.me", "api.whatsapp.com"]
    const isWaHost = validWaHosts.some(h => host === h || host.endsWith(`.${h}`))

    if (!isWaHost) {
      return {
        isValid: false,
        cleanUrl: parsed.toString(),
        error: "Please enter a valid WhatsApp invite link (e.g. https://chat.whatsapp.com/...)"
      }
    }

    if (host.includes("chat.whatsapp.com")) {
      // Must have invite code in pathname (at least 5 characters)
      const code = parsed.pathname.replace(/^\/+/, "").split(/[/?#]/)[0]
      if (!code || code.length < 5) {
        return {
          isValid: false,
          cleanUrl: parsed.toString(),
          error: "Invalid WhatsApp Group Invite link. Missing invite code."
        }
      }
      // Return clean canonical group invite link without tracking debris
      const cleanWaUrl = `https://chat.whatsapp.com/${code}`
      return {
        isValid: true,
        cleanUrl: cleanWaUrl
      }
    }
  }

  return {
    isValid: true,
    cleanUrl: parsed.toString()
  }
}
