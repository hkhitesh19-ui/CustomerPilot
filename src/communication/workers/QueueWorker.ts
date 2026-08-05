import { QueueService } from "../queue/service"
import { evolution } from "../adapters/evolution"
import { MessagePayload } from "../types"

export class QueueWorker {
  static async processBatch(queueName: string = "standard_messages", batchSize: number = 10) {
    console.log(`[QueueWorker] Polling queue: ${queueName}`)
    const messages = await QueueService.dequeue(queueName, batchSize)
    
    if (messages.length === 0) return 0

    let processedCount = 0
    for (const msg of messages) {
      try {
        const payload = JSON.parse(msg.payload) as MessagePayload
        const merchantId = msg.merchantId || payload.metadata?.merchantId

        if (!merchantId) {
          throw new Error("Missing merchantId for routing")
        }

        // Deliver via the Evolution API Adapter
        const result = await evolution.sendMessage(merchantId, payload)
        
        if (result.success) {
          await QueueService.ack(msg.id)
          processedCount++
        } else {
          await QueueService.nack(msg.id, result.error || "Delivery failed")
        }
      } catch (error: any) {
        console.error(`[QueueWorker] Failed to process message ${msg.id}:`, error.message)
        await QueueService.nack(msg.id, error.message)
      }
    }
    
    return processedCount
  }
}
