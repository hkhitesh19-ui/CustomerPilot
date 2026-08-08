import { db } from "@/lib/db"
import { SYSTEM_DEFAULT_TEMPLATES } from "@/lib/default-templates"
import { renderTemplate } from "@/lib/variable-engine"

export async function resolveAndRenderTemplate({
  merchantId,
  templateKey,
  variables = {},
  language = "en",
}: {
  merchantId?: string | null
  templateKey: string
  variables?: Record<string, any>
  language?: string
}) {
  let templateBody = ""

  // 1. If merchantId provided, check for enabled merchant custom override
  if (merchantId) {
    const merchantOverride = await db.messageTemplate.findFirst({
      where: {
        merchantId,
        templateKey,
        language,
        enabled: true,
      },
    })
    if (merchantOverride) {
      templateBody = merchantOverride.messageBody
    }
  }

  // 2. Fall back to System Default template from database (merchantId === null)
  if (!templateBody) {
    const systemDefault = await db.messageTemplate.findFirst({
      where: {
        merchantId: null,
        templateKey,
        language,
        enabled: true,
      },
    })
    if (systemDefault) {
      templateBody = systemDefault.messageBody
    }
  }

  // 3. Fall back to in-memory System Default definition
  if (!templateBody) {
    const inCodeDefault = SYSTEM_DEFAULT_TEMPLATES.find(
      (t) => t.templateKey === templateKey || t.templateKey.toLowerCase() === templateKey.toLowerCase()
    )
    if (inCodeDefault) {
      templateBody = inCodeDefault.messageBody
    }
  }

  if (!templateBody) {
    throw new Error(`Template '${templateKey}' not found in DB or System Defaults.`)
  }

  // 4. Safely render template with variables
  const rendered = renderTemplate(templateBody, variables)
  return {
    text: rendered.text,
    templateBody,
    missingVars: rendered.missingVars,
  }
}
