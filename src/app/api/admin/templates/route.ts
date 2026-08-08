import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"

// GET /api/admin/templates — Super Admin list all templates (system defaults + merchant overrides)
export async function GET(req: NextRequest) {
  try {
    const systemDefaults = await db.messageTemplate.findMany({
      where: { merchantId: null },
      orderBy: { templateKey: "asc" },
    })

    const merchantOverridesCount = await db.messageTemplate.count({
      where: { merchantId: { not: null } },
    })

    const overrides = await db.messageTemplate.findMany({
      where: { merchantId: { not: null } },
      include: {
        merchant: { select: { id: true, name: true, ownerName: true } },
        history: { orderBy: { version: "desc" }, take: 5 },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    })

    return ok({
      systemDefaults,
      overridesCount: merchantOverridesCount,
      merchantOverrides: overrides,
    })
  } catch (error: any) {
    console.error("[GET /api/admin/templates Error]", error)
    return err("Failed to fetch admin templates", 500)
  }
}

// POST /api/admin/templates/reset — Super Admin force reset a merchant override
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || !body.merchantId || !body.templateKey) {
    return err("merchantId and templateKey are required.", 400)
  }

  try {
    const override = await db.messageTemplate.findFirst({
      where: { merchantId: body.merchantId, templateKey: body.templateKey },
    })

    if (override) {
      await db.messageTemplate.delete({ where: { id: override.id } })
    }

    return ok({ message: `Successfully reset template ${body.templateKey} for merchant ${body.merchantId}` })
  } catch (error: any) {
    console.error("[POST /api/admin/templates/reset Error]", error)
    return err("Failed to reset merchant template", 500)
  }
}
