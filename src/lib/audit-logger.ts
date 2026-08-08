import { db } from "@/lib/db"

export interface AuditLogInput {
  merchantId: string
  actorType?: "ADMIN" | "MERCHANT" | "SYSTEM"
  actorId?: string
  staffId?: string
  action: string
  entity?: string
  entityId?: string
  metadata?: Record<string, any>
}

export async function logAuditEvent(input: AuditLogInput) {
  try {
    return await db.auditLog.create({
      data: {
        merchantId: input.merchantId,
        actorType: input.actorType || "ADMIN",
        actorId: input.actorId || null,
        staffId: input.staffId || null,
        action: input.action,
        entity: input.entity || null,
        entityId: input.entityId || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      }
    })
  } catch (e: any) {
    console.error("Failed to log audit event:", e.message)
    return null
  }
}
