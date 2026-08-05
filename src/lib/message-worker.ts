// CustomerPilot V6.4 — Production Message Worker
//
// BACKGROUND PROCESSING SYSTEM
//
// Handles:
// - Queue processing (flush "queued" messages)
// - Retry logic with exponential backoff
// - Dead Letter Queue (DLQ) management
// - Delivery tracking and statistics
// - Cron job simulation for demo mode
//
// In production, this would be a separate worker process (BullMQ, etc.)
// For Next.js, we use API routes + cron triggers

import { db } from "@/lib/db"
import { sendTemplateMessage, retryFailedMessages, getDeliveryStats } from "./whatsapp-business-api"

// ===========================================================================
// TYPES
// ===========================================================================

export interface WorkerConfig {
  batchSize: number          // Messages per batch
  pollIntervalMs: number     // How often to check queue
  maxConcurrent: number      // Parallel sends
  enableRetry: boolean       // Auto-retry failed messages
  enableDLQ: boolean         // Move to DLQ after max retries
}

export interface WorkerStats {
  processed: number
  succeeded: number
  failed: number
  retried: number
  dlqMoved: number
  averageProcessingTimeMs: number
  lastRunAt: Date | null
  uptimeSeconds: number
}

export interface BatchResult {
  batchId: string
  totalMessages: number
  succeeded: number
  failed: number
  skipped: number
  startedAt: Date
  completedAt: Date
  durationMs: number
  errors: string[]
}

// ===========================================================================
// DEFAULT CONFIGURATION
// ===========================================================================

export const DEFAULT_WORKER_CONFIG: WorkerConfig = {
  batchSize: 20,             // Process 20 messages at a time
  pollIntervalMs: 30000,     // Check every 30 seconds
  maxConcurrent: 5,          // Send up to 5 in parallel
  enableRetry: true,
  enableDLQ: true,
}

// ===========================================================================
// MESSAGE QUEUE WORKER
// ===========================================================================

let workerInstance: MessageWorker | null = null

/**
 * Get or create the singleton worker instance
 */
export function getMessageWorker(config?: Partial<WorkerConfig>): MessageWorker {
  if (!workerInstance) {
    workerInstance = new MessageWorker({ ...DEFAULT_WORKER_CONFIG, ...config })
  }
  return workerInstance
}

/**
 * Main Message Worker class
 * Processes queued WhatsApp messages in batches
 */
export class MessageWorker {
  private config: WorkerConfig
  private stats: WorkerStats
  private isRunning: boolean
  private startTime: Date
  private intervalHandle: ReturnType<typeof setInterval> | null

  constructor(config: WorkerConfig) {
    this.config = config
    this.isRunning = false
    this.startTime = new Date()
    this.intervalHandle = null
    
    this.stats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      retried: 0,
      dlqMoved: 0,
      averageProcessingTimeMs: 0,
      lastRunAt: null,
      uptimeSeconds: 0,
    }
  }

  /**
   * Start the worker (begins polling for queued messages)
   */
  start(): void {
    if (this.isRunning) {
      console.warn("[Worker] Already running")
      return
    }

    this.isRunning = true
    console.log(`[Worker] Started with config:`, this.config)

    // Start polling loop
    this.intervalHandle = setInterval(() => {
      this.processBatch().catch(error => {
        console.error("[Worker] Unhandled error:", error)
      })
    }, this.config.pollIntervalMs)

    // Run first batch immediately
    this.processBatch()

    // Update uptime counter
    setInterval(() => {
      this.stats.uptimeSeconds = Math.floor((Date.now() - this.startTime.getTime()) / 1000)
    }, 1000)
  }

  /**
   * Stop the worker gracefully
   */
  stop(): void {
    this.isRunning = false
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }
    console.log("[Worker] Stopped")
  }

  /**
   * Get current worker statistics
   */
  getStats(): WorkerStats {
    return { ...this.stats }
  }

  /**
   * Check if worker is currently running
   */
  isActive(): boolean {
    return this.isRunning
  }

  /**
   * Process a single batch of queued messages
   * This is the main work function
   */
  async processBatch(): Promise<BatchResult> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const startedAt = new Date()
    let errors: string[] = []

    try {
      // Fetch queued messages (respecting batch size)
      const queuedMessages = await db.whatsAppMessage.findMany({
        where: { status: "queued" },
        orderBy: { createdAt: "asc" },
        take: this.config.batchSize,
      })

      if (queuedMessages.length === 0) {
        return {
          batchId,
          totalMessages: 0,
          succeeded: 0,
          failed: 0,
          skipped: 0,
          startedAt,
          completedAt: new Date(),
          durationMs: 0,
          errors: [],
        }
      }

      console.log(`[Worker] Processing batch ${batchId} with ${queuedMessages.length} messages`)

      let succeeded = 0
      let failed = 0
      let skipped = 0

      // Process messages (with concurrency limit)
      const chunks = this.chunkArray(queuedMessages, this.config.maxConcurrent)
      
      for (const chunk of chunks) {
        const results = await Promise.allSettled(
          chunk.map(msg => this.processSingleMessage(msg))
        )

        for (const result of results) {
          if (result.status === "fulfilled") {
            if (result.value) {
              succeeded++
            } else {
              failed++
            }
          } else {
            failed++
            errors.push(result.reason?.message || "Unknown error")
          }
        }
      }

      // Handle retries if enabled
      if (this.config.enableRetry && failed > 0) {
        const retryResult = await retryFailedMessages()
        this.stats.retried += retryResult.retried
        this.stats.dlqMoved += retryResult.permanentlyFailed
      }

      const completedAt = new Date()
      const durationMs = completedAt.getTime() - startedAt.getTime()

      // Update stats
      this.stats.processed += queuedMessages.length
      this.stats.succeeded += succeeded
      this.stats.failed += failed
      this.stats.lastRunAt = completedAt
      
      // Rolling average processing time
      const prevAvg = this.stats.averageProcessingTimeMs
      this.stats.averageProcessingTimeMs = Math.round(
        (prevAvg * (this.stats.processed - queuedMessages.length) + durationMs) / 
        this.stats.processed
      )

      const result: BatchResult = {
        batchId,
        totalMessages: queuedMessages.length,
        succeeded,
        failed,
        skipped,
        startedAt,
        completedAt,
        durationMs,
        errors,
      }

      console.log(`[Worker] Batch ${batchId} complete: ${succeeded}/${queuedMessages.length} succeeded (${durationMs}ms)`)

      return result
    } catch (error: any) {
      errors.push(error.message)
      
      const result: BatchResult = {
        batchId,
        totalMessages: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        startedAt,
        completedAt: new Date(),
        durationMs: new Date().getTime() - startedAt.getTime(),
        errors,
      }

      console.error(`[Worker] Batch ${batchId} failed:`, error.message)
      return result
    }
  }

  /**
   * Process a single message through WhatsApp API
   */
  private async processSingleMessage(message: any): Promise<boolean> {
    try {
      // Parse template data from stored body
      let templateData: Record<string, string> = {}
      try {
        templateData = JSON.parse(message.body || "{}")
      } catch {
        templateData = {}
      }

      const result = await sendTemplateMessage({
        to: message.toPhone,
        templateName: message.template,
        templateData,
        metadata: {
          merchantId: message.merchantId,
          customerId: message.customerId,
        },
      })

      return result.success
    } catch (error: any) {
      console.error(`[Worker] Failed to process message ${message.id}:`, error.message)
      
      // Mark as failed
      await db.whatsAppMessage.update({
        where: { id: message.id },
        data: {
          status: "failed",
          errorMessage: error.message.slice(0, 500),
          retryCount: { increment: 1 },
          updatedAt: new Date(),
        },
      })

      return false
    }
  }

  /**
   * Split array into chunks of given size
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }
}

// ===========================================================================
// CRON JOB DEFINITIONS
// ===========================================================================

/**
 * All scheduled jobs that should run periodically
 * In production, these would be actual cron jobs (node-cron, Bull, etc.)
 * For demo, they can be triggered via API calls
 */

export const CRON_JOBS = {
  /**
   * DAILY 9:00 AM — Birthday reminder sweep
   * Send reminders 7 days before each customer's birthday
   */
  birthday_reminder_sweep: {
    schedule: "0 9 * * *", // 9:00 AM daily
    description: "Send birthday reminders 7 days before",
    handler: "birthdayEngine.sendReminders",
  },

  /**
   * DAILY 9:00 AM — Win-back escalation sweep
   * Create escalations at 30/45/60/90 day thresholds
   */
  winback_escalation_sweep: {
    schedule: "0 9 * * *",
    description: "Check inactive customers and create escalations",
    handler: "winbackEngine.checkAndEscalate",
  },

  /**
   * DAILY 10:00 AM — WhatsApp queue flush
   * Send all queued messages (main worker job)
   */
  whatsapp_queue_flush: {
    schedule: "0 10 * * *",
    description: "Flush WhatsApp message queue",
    handler: "worker.processBatch",
  },

  /**
   * DAILY 6:00 PM — Daily summary to merchant
   * Send today's stats via WhatsApp
   */
  daily_merchant_summary: {
    schedule: "0 18 * * *",
    description: "Send daily summary to merchant",
    handler: "notifications.sendDailySummary",
  },

  /**
   * WEEKLY Monday 9 AM — Churn risk recompute
   * Recalculate churn scores for all customers
   */
  churn_risk_recompute: {
    schedule: "0 9 * * 1", // Mondays at 9 AM
    description: "Recompute churn risk scores",
    handler: "stampEngine.recomputeChurnScores",
  },

  /**
   * HOURLY — Review expiry sweep
   * Mark expired reviews as declined/expired
   */
  review_expiry_sweep: {
    schedule: "0 * * * *", // Every hour
    description: "Mark expired review requests",
    handler: "reviewEngine.expireOldReviews",
  },

  /**
   * DAILY — Subscription check
   * Attempt auto-renewal, mark payment failures
   */
  subscription_check: {
    schedule: "0 3 * * *", // 3 AM daily
    description: "Check subscription renewals",
    handler: "subscription.checkRenewals",
  },
}

// ===========================================================================
// API ROUTE HELPERS
// ===========================================================================

/**
 * Trigger a specific cron job manually (for testing/demo)
 * POST /api/admin/cron/{jobName}
 */
export async function triggerCronJob(jobName: string): Promise<{
  success: boolean
  jobName: string
  executedAt: Date
  result?: any
  error?: string
}> {
  const job = CRON_JOBS[jobName as keyof typeof CRON_JOBS]
  
  if (!job) {
    return { success: false, jobName, executedAt: new Date(), error: `UNKNOWN_JOB: ${jobName}` }
  }

  try {
    // Execute the appropriate handler based on job name
    let result: any

    switch (jobName) {
      case "whatsapp_queue_flush":
        const worker = getMessageWorker()
        result = await worker.processBatch()
        break
      
      default:
        // For other jobs, just log that they were triggered
        result = { message: `Job ${jobName} triggered (handler: ${job.handler})`, demoMode: true }
    }

    // Log execution
    await db.auditLog.create({
      data: {
        merchantId: "SYSTEM",
        actorType: "SYSTEM",
        action: `CRON_TRIGGERED_${jobName.toUpperCase()}`,
        entity: "CronJob",
        entityId: jobName,
        metadata: JSON.stringify({ executedAt: new Date().toISOString(), result }),
      },
    })

    return { success: true, jobName, executedAt: new Date(), result }
  } catch (error: any) {
    return { success: false, jobName, executedAt: new Date(), error: error.message }
  }
}

/**
 * Get all cron job definitions (for admin dashboard)
 */
export function getCronJobDefinitions(): typeof CRON_JOBS {
  return CRON_JOBS
}

/**
 * Get queue status (for monitoring dashboard)
 */
export async function getQueueStatus(): Promise<{
  queued: number
  sent: number
  delivered: number
  read: number
  failed: number
  dlq: number
  workerActive: boolean
  lastBatch?: BatchResult
  deliveryStats: Awaited<ReturnType<typeof getDeliveryStats>>
}> {
  const worker = getMessageWorker()
  
  const [queued, sent, delivered, read, failed, dlq] = await Promise.all([
    db.whatsAppMessage.count({ where: { status: "queued" } }),
    db.whatsAppMessage.count({ where: { status: "sent" } }),
    db.whatsAppMessage.count({ where: { status: "delivered" } }),
    db.whatsAppMessage.count({ where: { status: "read" } }),
    db.whatsAppMessage.count({ where: { status: "failed" } }),
    db.deadLetterQueue.count(),
  ])

  return {
    queued,
    sent,
    delivered,
    read,
    failed,
    dlq,
    workerActive: worker.isActive(),
    deliveryStats: await getDeliveryStats("default_merchant"), // Would use real merchant ID
  }
}
