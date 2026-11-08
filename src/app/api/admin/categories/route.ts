import { NextRequest, NextResponse } from "next/server"
import { ok, err } from "@/lib/api"
import { getAllGbpCategories, addCustomGbpCategory, deleteCustomGbpCategory } from "@/lib/gbp-categories-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const categories = await getAllGbpCategories()
    return ok({ categories })
  } catch (e: any) {
    return err(e.message || "Failed to load categories", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { label, group, icon, googleType, reviewKeywords, defaultLoyaltyRule, id } = body

    if (!label || !label.trim()) {
      return err("Category label is required", 400)
    }

    const catId = (id || label).toLowerCase().trim().replace(/[^a-z0-9_]/g, "_")
    const keywords = Array.isArray(reviewKeywords)
      ? reviewKeywords
      : typeof reviewKeywords === "string"
      ? reviewKeywords.split(",").map((s: string) => s.trim()).filter(Boolean)
      : []

    const rule = defaultLoyaltyRule || {
      stamps: 5,
      reward: "Special Customer Reward",
      value: 150
    }

    const updated = await addCustomGbpCategory({
      id: catId,
      label: label.trim(),
      group: (group || "Custom Categories").trim(),
      groupId: (group || "custom").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      icon: (icon || "⭐").trim(),
      googleType: (googleType || "establishment").trim(),
      reviewKeywords: keywords,
      defaultLoyaltyRule: rule
    })

    return ok({ success: true, categories: updated, addedId: catId })
  } catch (e: any) {
    return err(e.message || "Failed to add category", 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const categoryId = url.searchParams.get("id")

    if (!categoryId) {
      return err("id parameter is required", 400)
    }

    const updated = await deleteCustomGbpCategory(categoryId)
    return ok({ success: true, categories: updated })
  } catch (e: any) {
    return err(e.message || "Failed to delete category", 500)
  }
}
