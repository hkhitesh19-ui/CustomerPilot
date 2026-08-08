import { NextRequest } from "next/server"
import { ok, err } from "@/lib/api"
import { renderTemplate, generateSamplePreview, validateTemplateVariables } from "@/lib/variable-engine"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.messageBody !== "string") {
    return err("Invalid payload. messageBody string is required.", 400)
  }

  const messageBody = body.messageBody
  const customVariables = body.variables || {}

  const validation = validateTemplateVariables(messageBody)
  const rendered = renderTemplate(messageBody, customVariables, { useMockFallbacks: true })

  return ok({
    previewText: rendered.text,
    samplePreview: generateSamplePreview(messageBody),
    invalidVars: validation.invalidVars,
    foundVars: validation.foundVars,
    isValid: validation.isValid,
    charCount: rendered.text.length,
    estimatedSegments: Math.ceil(rendered.text.length / 160) || 1,
  })
}
