import { db } from "@/lib/db";
import { SYSTEM_DEFAULT_TEMPLATES } from "@/lib/default-templates";
import { renderTemplate } from "@/lib/variable-engine";

export async function getCompiledTemplate(
  merchantId: string,
  templateKey: string,
  variables: Record<string, any>
): Promise<string> {
  try {
    // Fetch overrides for this specific merchant and global system overrides
    const dbTemplates = await db.messageTemplate.findMany({
      where: {
        templateKey,
        OR: [{ merchantId }, { merchantId: null }],
      },
    });

    // 1. Merchant Override (Highest Priority)
    const merchantOverride = dbTemplates.find((t) => t.merchantId === merchantId && t.enabled);
    if (merchantOverride) {
      return renderTemplate(merchantOverride.messageBody, variables).text;
    }

    // 2. System Default Override (SuperAdmin modified)
    const systemOverride = dbTemplates.find((t) => t.merchantId === null && t.enabled);
    if (systemOverride) {
      return renderTemplate(systemOverride.messageBody, variables).text;
    }

    // 3. Fallback to hardcoded default (Base System)
    const fallbackTemplate = SYSTEM_DEFAULT_TEMPLATES.find((t) => t.templateKey === templateKey);
    if (fallbackTemplate) {
      return renderTemplate(fallbackTemplate.messageBody, variables).text;
    }

    // Extreme fallback if template key is missing entirely
    console.warn(`[Template Engine] Missing template key: ${templateKey}`);
    return `Message from Merchant (Key: ${templateKey})`;
  } catch (error) {
    console.error(`[Template Engine] Error compiling ${templateKey}:`, error);
    // Safe fallback to prevent breaking message flow
    const fallback = SYSTEM_DEFAULT_TEMPLATES.find((t) => t.templateKey === templateKey);
    return fallback ? renderTemplate(fallback.messageBody, variables).text : "";
  }
}
