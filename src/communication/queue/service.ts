import { db } from "@/lib/db"
import { MessagePayload } from "../types"

/**
 * Message Queue Abstraction (Redis-compatible signature)
 * Currently backed by Prisma for zero-infrastructure deployment.
 */
export class QueueService {
  /**
   * Enqueues a message payload to be processed later.
   */
  static async enqueue(queueName: string, payload: MessagePayload): Promise<string> {
    const record = await db.deadLetterQueue.create({
      data: {
        payload: JSON.stringify(payload),
        originalTable: queueName, // We use originalTable to denote queue name in this abstraction
        retryCount: 0,
        merchantId: payload.metadata?.merchantId,
      }
    })
    return record.id
  }

  /**
   * Dequeues a batch of messages for processing.
   */
  static async dequeue(queueName: string, batchSize: number = 10) {
    const messages = await db.deadLetterQueue.findMany({
      where: { originalTable: queueName, errorReason: null },
      take: batchSize,
      orderBy: { createdAt: "asc" }
    })
    return messages
  }

  /**
   * Removes a processed message from the queue.
   */
  static async ack(messageId: string): Promise<void> {
    await db.deadLetterQueue.delete({ where: { id: messageId } })
  }

  /**
   * Marks a message as failed.
   */
  static async nack(messageId: string, error: string): Promise<void> {
    await db.deadLetterQueue.update({
      where: { id: messageId },
      data: { errorReason: error, retryCount: { increment: 1 } }
    })
  }
}
