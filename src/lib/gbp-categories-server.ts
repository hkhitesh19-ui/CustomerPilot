import { db } from "@/lib/db"
import { OFFICIAL_GBP_CATEGORIES, type GbpCategoryItem } from "@/lib/gbp-categories"

const CUSTOM_CATEGORIES_KEY = "gbp_custom_categories"

/**
 * Fetch all categories: combines built-in official GBP categories with
 * custom categories created dynamically by SuperAdmin in SystemContent.
 */
export async function getAllGbpCategories(): Promise<GbpCategoryItem[]> {
  try {
    const customRecord = await db.systemContent.findUnique({
      where: { key: CUSTOM_CATEGORIES_KEY }
    })

    if (!customRecord || !customRecord.value) {
      return OFFICIAL_GBP_CATEGORIES
    }

    const customList: GbpCategoryItem[] = JSON.parse(customRecord.value)
    if (!Array.isArray(customList)) return OFFICIAL_GBP_CATEGORIES

    // Merge: custom items override or append to official categories
    const map = new Map<string, GbpCategoryItem>()
    OFFICIAL_GBP_CATEGORIES.forEach((c) => map.set(c.id.toLowerCase(), c))
    customList.forEach((c) => {
      if (c && c.id) map.set(c.id.toLowerCase(), { ...c, isCustom: true })
    })

    return Array.from(map.values())
  } catch (error) {
    console.error("[getAllGbpCategories] Failed to load custom categories:", error)
    return OFFICIAL_GBP_CATEGORIES
  }
}

/**
 * Add or update a custom category created by SuperAdmin
 */
export async function addCustomGbpCategory(category: Omit<GbpCategoryItem, "isCustom">): Promise<GbpCategoryItem[]> {
  const existing = await getAllGbpCategories()
  const customOnly = existing.filter((c) => c.isCustom)

  const newEntry: GbpCategoryItem = {
    ...category,
    id: category.id.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
    isCustom: true
  }

  const updatedCustom = [...customOnly.filter((c) => c.id !== newEntry.id), newEntry]

  await db.systemContent.upsert({
    where: { key: CUSTOM_CATEGORIES_KEY },
    create: {
      key: CUSTOM_CATEGORIES_KEY,
      section: "admin_settings",
      category: "categories",
      value: JSON.stringify(updatedCustom)
    },
    update: {
      value: JSON.stringify(updatedCustom)
    }
  })

  return getAllGbpCategories()
}

/**
 * Delete a custom category created by SuperAdmin
 */
export async function deleteCustomGbpCategory(categoryId: string): Promise<GbpCategoryItem[]> {
  const existing = await getAllGbpCategories()
  const customOnly = existing.filter((c) => c.isCustom && c.id !== categoryId)

  await db.systemContent.upsert({
    where: { key: CUSTOM_CATEGORIES_KEY },
    create: {
      key: CUSTOM_CATEGORIES_KEY,
      section: "admin_settings",
      category: "categories",
      value: JSON.stringify(customOnly)
    },
    update: {
      value: JSON.stringify(customOnly)
    }
  })

  return getAllGbpCategories()
}
