import { db } from "@/lib/db"
import {
  DefaultMerchantSettingsData,
  FALLBACK_GLOBAL_DEFAULTS
} from "./default-merchant-settings-types"

export type { DefaultMerchantSettingsData }
export { FALLBACK_GLOBAL_DEFAULTS }

const SETTINGS_KEY = "GLOBAL_DEFAULT_MERCHANT_SETTINGS"

/**
 * Fetch global default merchant settings from SystemContent, with fallback
 */
export async function getGlobalDefaultMerchantSettings(): Promise<DefaultMerchantSettingsData> {
  try {
    const record = await db.systemContent.findUnique({
      where: { key: SETTINGS_KEY }
    })

    if (record?.value) {
      const parsed = JSON.parse(record.value)
      return {
        ...FALLBACK_GLOBAL_DEFAULTS,
        ...parsed,
        loyaltyCategoryNames: Array.isArray(parsed.loyaltyCategoryNames) && parsed.loyaltyCategoryNames.length === 10
          ? parsed.loyaltyCategoryNames
          : FALLBACK_GLOBAL_DEFAULTS.loyaltyCategoryNames
      }
    }
  } catch (error) {
    console.error("[default-merchant-settings] Failed to load settings from DB:", error)
  }

  return FALLBACK_GLOBAL_DEFAULTS
}

/**
 * Save global default merchant settings to SystemContent
 */
export async function saveGlobalDefaultMerchantSettings(data: Partial<DefaultMerchantSettingsData>): Promise<DefaultMerchantSettingsData> {
  const current = await getGlobalDefaultMerchantSettings()
  const updated: DefaultMerchantSettingsData = {
    ...current,
    ...data,
    loyaltyCategoryNames: Array.isArray(data.loyaltyCategoryNames) && data.loyaltyCategoryNames.length === 10
      ? data.loyaltyCategoryNames
      : current.loyaltyCategoryNames
  }

  await db.systemContent.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      section: "super_admin",
      category: "default_merchant_rules",
      value: JSON.stringify(updated)
    },
    update: {
      value: JSON.stringify(updated)
    }
  })

  return updated
}
