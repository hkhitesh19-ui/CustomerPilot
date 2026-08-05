export interface MessagePayload {
  to: string
  templateName: string
  templateData?: Record<string, string>
  variables?: Record<string, string>
  metadata?: {
    merchantId?: string
    customerId?: string
    source?: string
    priority?: "normal" | "high" | "urgent"
  }
}

export interface DeliveryResult {
  success: boolean
  messageId?: string
  status: "queued" | "sent" | "delivered" | "failed"
  error?: string
}

export interface WebhookEvent {
  messageId: string
  status: "sent" | "delivered" | "read" | "failed"
  timestamp: Date
  error?: string
}
