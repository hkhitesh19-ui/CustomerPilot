import { QueueService } from "../queue/service"
import { TEMPLATE_REGISTRY } from "../templates/registry"
import { MessagePayload } from "../types"

export class CommunicationService {
  /**
   * Dispatches a message to the unified queue.
   * Workflows should ONLY call this method, NEVER Evolution API directly.
   */
  static async dispatch(payload: MessagePayload): Promise<string> {
    if (!TEMPLATE_REGISTRY[payload.templateName]) {
      throw new Error(`Template ${payload.templateName} not found in registry.`)
    }

    // Assign priority queue if urgent
    const queueName = payload.metadata?.priority === "urgent" ? "priority_messages" : "standard_messages"
    
    // Abstracted away to QueueService (which currently uses Prisma DeadLetterQueue)
    const messageId = await QueueService.enqueue(queueName, payload)
    console.log(`[CommunicationEngine] Dispatched message to ${queueName}. ID: ${messageId}`)
    return messageId
  }
}
