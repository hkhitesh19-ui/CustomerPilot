import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, getAuthenticatedMerchant } from "@/lib/api"
import { SYSTEM_DEFAULT_TEMPLATES } from "@/lib/default-templates"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  let merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) {
    const authM = await getAuthenticatedMerchant()
    merchantId = authM?.id || null
  }
  if (!merchantId) return err("Unauthorized", 401)

  const isSystem = merchantId === "system"

  try {
    // 1. Fetch system defaults directly from codebase
    const systemDefaults = SYSTEM_DEFAULT_TEMPLATES

    // 2. Fetch merchant custom overrides (or system overrides if isSystem)
    const merchantOverrides = await db.messageTemplate.findMany({
      where: { merchantId: isSystem ? null : merchantId },
    })

    const merchantMap = new Map(merchantOverrides.map((m) => [m.templateKey, m]))

    // 3. Merge system defaults with merchant overrides
    const mergedTemplates = systemDefaults.map((sys) => {
      const override = merchantMap.get(sys.templateKey)
      if (override) {
        return {
          ...override,
          isCustomized: true,
          defaultBody: sys.messageBody,
        }
      }
      return {
        ...sys,
        isCustomized: false,
        defaultBody: sys.messageBody,
      }
    })

    // Add any merchant custom templates that might not exist in system defaults
    for (const [key, override] of merchantMap.entries()) {
      if (!systemDefaults.some((s) => s.templateKey === key)) {
        mergedTemplates.push({
          ...override,
          isCustomized: true,
          defaultBody: override.messageBody,
        } as any)
      }
    }

    return ok({ templates: mergedTemplates })
  } catch (error: any) {
    console.error("[GET /api/templates Error]", error)
    return err("Failed to fetch message templates", 500)
  }
}
