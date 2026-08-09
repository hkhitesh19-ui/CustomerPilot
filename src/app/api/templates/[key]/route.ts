import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err } from "@/lib/api"
import { validateTemplateVariables, sanitizeTemplate } from "@/lib/variable-engine"
import { SYSTEM_DEFAULT_TEMPLATES } from "@/lib/default-templates"

// GET /api/templates/[key] — Get single template details + version history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) return err("Unauthorized", 401)
  const { key } = await params

  try {
    const override = await db.messageTemplate.findFirst({
      where: { merchantId, templateKey: key },
      include: { history: { orderBy: { version: "desc" } } },
    })

    const systemDefault = SYSTEM_DEFAULT_TEMPLATES.find((t) => t.templateKey === key)

    if (!override && !systemDefault) {
      return err("Template not found", 404)
    }

    return ok({
      template: override || systemDefault,
      isCustomized: !!override,
      defaultBody: systemDefault?.messageBody || override?.messageBody || "",
      history: override?.history || [],
    })
  } catch (error: any) {
    console.error("[GET /api/templates/[key] Error]", error)
    return err("Failed to fetch template", 500)
  }
}

// PATCH /api/templates/[key] — Update merchant template override (creates version history)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) return err("Unauthorized", 401)
  const { key } = await params

  const body = await req.json().catch(() => null)
  if (!body || typeof body.messageBody !== "string") {
    return err("Invalid payload. messageBody string is required.", 400)
  }

  const sanitizedBody = sanitizeTemplate(body.messageBody)
  if (!sanitizedBody.trim()) {
    return err("Message body cannot be empty.", 400)
  }

  // Validate variables
  const validation = validateTemplateVariables(sanitizedBody)
  if (!validation.isValid) {
    return err(
      `Invalid variable placeholders found: ${validation.invalidVars.map((v) => `{{${v}}}`).join(", ")}`,
      400
    )
  }

  try {
    const systemDefault = SYSTEM_DEFAULT_TEMPLATES.find((t) => t.templateKey === key)

    const existingOverride = await db.messageTemplate.findFirst({
      where: { merchantId, templateKey: key },
    })

    let templateRecord

    if (existingOverride) {
      const nextVersion = existingOverride.version + 1
      templateRecord = await db.messageTemplate.update({
        where: { id: existingOverride.id },
        data: {
          messageBody: sanitizedBody,
          enabled: body.enabled !== undefined ? Boolean(body.enabled) : existingOverride.enabled,
          version: nextVersion,
          updatedBy: "MERCHANT",
        },
      })

      // Create version history snapshot
      await db.templateVersionHistory.create({
        data: {
          templateId: existingOverride.id,
          version: nextVersion,
          messageBody: sanitizedBody,
          changedBy: "MERCHANT",
          changeReason: body.changeReason || "Merchant template update",
        },
      })
    } else {
      templateRecord = await db.messageTemplate.create({
        data: {
          merchantId,
          templateKey: key,
          templateName: systemDefault?.templateName || key,
          triggerEvent: systemDefault?.triggerEvent || "Custom journey message",
          category: systemDefault?.category || "MARKETING",
          messageBody: sanitizedBody,
          language: "en",
          variables: systemDefault?.variables || JSON.stringify(validation.foundVars),
          enabled: body.enabled !== undefined ? Boolean(body.enabled) : true,
          version: 1,
          createdBy: "MERCHANT",
          updatedBy: "MERCHANT",
        },
      })

      await db.templateVersionHistory.create({
        data: {
          templateId: templateRecord.id,
          version: 1,
          messageBody: sanitizedBody,
          changedBy: "MERCHANT",
          changeReason: "Initial merchant customization",
        },
      })
    }

    return ok({
      message: "Template saved successfully",
      template: templateRecord,
    })
  } catch (error: any) {
    console.error("[PATCH /api/templates/[key] Error]", error)
    return err("Failed to save template override", 500)
  }
}

// DELETE /api/templates/[key] — Reset merchant template back to System Default
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const merchantId = req.headers.get("x-merchant-id")
  if (!merchantId) return err("Unauthorized", 401)
  const { key } = await params

  try {
    const existing = await db.messageTemplate.findFirst({
      where: { merchantId, templateKey: key },
    })

    if (existing) {
      await db.messageTemplate.delete({ where: { id: existing.id } })
    }

    const systemDefault = SYSTEM_DEFAULT_TEMPLATES.find((t) => t.templateKey === key)

    return ok({
      message: "Template reset to system default successfully",
      template: systemDefault,
    })
  } catch (error: any) {
    console.error("[DELETE /api/templates/[key] Error]", error)
    return err("Failed to reset template", 500)
  }
}
