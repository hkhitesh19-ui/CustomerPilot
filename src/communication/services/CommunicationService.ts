import { QueueService } from "../queue/service"
import { TEMPLATE_REGISTRY } from "../templates/registry"
import { MessagePayload } from "../types"
import { resolveAndRenderTemplate } from "@/lib/template-resolver"

export class CommunicationService {
  /**
   * Dispatches a message to the unified queue.
   * Dynamically resolves merchant editable template or system default.
   */
  static async dispatch(payload: MessagePayload): Promise<string> {
    const templateKey = payload.templateName

    // If template has dynamic body variables and merchant context, render dynamically
    if (payload.metadata?.merchantId && templateKey) {
      try {
        const resolved = await resolveAndRenderTemplate({
          merchantId: payload.metadata.merchantId,
          templateKey: templateKey,
          variables: payload.variables || {},
        })
        payload.variables = {
          ...payload.variables,
          _renderedBody: resolved.text,
        }
      } catch (err) {
        console.warn(`[CommunicationEngine] Template resolution warning for ${templateKey}:`, err)
      }
    }

    // Assign priority queue if urgent
    const queueName = payload.metadata?.priority === "urgent" ? "priority_messages" : "standard_messages"

    // Abstracted away to QueueService
    const messageId = await QueueService.enqueue(queueName, payload)
    console.log(`[CommunicationEngine] Dispatched message to ${queueName}. ID: ${messageId}`)
    return messageId
  }
}
