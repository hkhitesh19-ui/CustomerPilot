export interface SystemFeatureFlags {
  googleReviewAutomation: boolean
  whatsAppAutomation: boolean
  referralEngine: boolean
  birthdayEngine: boolean
}

// Memory-backed default feature flags
let currentFlags: SystemFeatureFlags = {
  googleReviewAutomation: true,
  whatsAppAutomation: true,
  referralEngine: true,
  birthdayEngine: true,
}

export function getFeatureFlags(): SystemFeatureFlags {
  return { ...currentFlags }
}

export function updateFeatureFlags(newFlags: Partial<SystemFeatureFlags>): SystemFeatureFlags {
  currentFlags = { ...currentFlags, ...newFlags }
  return getFeatureFlags()
}

export function isFeatureEnabled(featureName: keyof SystemFeatureFlags): boolean {
  return !!currentFlags[featureName]
}
