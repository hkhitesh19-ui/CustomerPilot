// CustomerPilot V6.2 — ENTERPRISE HARDENING ADDENDUM
// 12 enterprise reliability policies from the 3rd ChatGPT audit.
// Concise decision-matrix format. No new features — operational governance only.
//
// Audit's final verdict: "ab sabse valuable validation real pilot, QA automation,
// aur production telemetry se hi milegi, documentation se nahi."
// These 12 points are documentation-only (no enforcement code) — they define
// production behavior for when CustomerPilot scales beyond single-merchant demo.

export interface HardeningPoint {
  id: string
  number: number
  title: string
  category: "Critical" | "High" | "Medium"
  question: string
  decisionMatrix: { option: string; tradeoff: string; recommended: boolean }[]
  productionBehavior: string
  auditActions: string[]
  implementationNote: string
}

export const ENTERPRISE_HARDENING: HardeningPoint[] = [
  {
    id: "idempotency-external-events",
    number: 1,
    title: "Idempotency for External Webhooks",
    category: "Critical",
    question: "Razorpay/Google/WhatsApp webhooks can retry or duplicate. How do we prevent double-processing?",
    decisionMatrix: [
      { option: "Trust webhooks — process every callback as new", tradeoff: "Simplest. But double-charges, double-stamp-awards, duplicate redemptions on retry.", recommended: false },
      { option: "Idempotency keys: store event_id, skip if already processed", tradeoff: "Standard pattern. Each external event gets a unique ID. Process once, ignore duplicates.", recommended: true },
      { option: "Time-window dedup: ignore same-event-type within 5 min", tradeoff: "Fragile. Legitimate rapid events get dropped. Doesn't handle provider-specific IDs.", recommended: false },
    ],
    productionBehavior: "Every external webhook MUST include an event_id (provider-supplied). On receipt: (1) check WebhookEventLog table for event_id, (2) if exists → return 200 OK silently (idempotent), (3) if not → process + insert event_id. WebhookEventLog schema: { id, provider, event_id, received_at, processed_at, status, payload_hash }. Retention: 90 days. Table indexed on (provider, event_id) unique.",
    auditActions: ["WEBHOOK_RECEIVED", "WEBHOOK_PROCESSED", "WEBHOOK_DUPLICATE_IGNORED", "WEBHOOK_PROCESSING_FAILED"],
    implementationNote: "New table: WebhookEventLog. Wrap each webhook handler (Razorpay, Google Reviews, WhatsApp delivery) in idempotency check. ~50 lines per handler.",
  },
  {
    id: "distributed-locking",
    number: 2,
    title: "Concurrency & Distributed Locking",
    category: "Critical",
    question: "Rule change + rollback + customer redeem + stock update happening simultaneously. Race conditions?",
    decisionMatrix: [
      { option: "Single-threaded DB operations — rely on SQLite/Postgres serializability", tradeoff: "Works for SQLite demo. Fails at scale with concurrent merchants.", recommended: false },
      { option: "Optimistic locking: version column on every row, retry on conflict", tradeoff: "Standard pattern. Add version INT to critical tables. On update, WHERE version = X. If 0 rows updated → conflict → retry 3x.", recommended: true },
      { option: "Pessimistic locking: SELECT FOR UPDATE on every critical write", tradeoff: "Safe but slow. Deadlocks possible. Overkill for most operations.", recommended: false },
    ],
    productionBehavior: "Optimistic locking on: Customer, CustomerStampCard, Reward, Bill, Redemption. Each has `version INT DEFAULT 0`. On update: UPDATE ... SET version = version + 1 WHERE id = ? AND version = ?. If 0 rows affected → conflict → retry up to 3 times with 100ms backoff. After 3 retries → return 409 Conflict to client. Client UI shows 'Concurrent modification — please refresh and retry'. Critical operations (rule change, ownership transfer) use DB transactions with SERIALIZABLE isolation.",
    auditActions: ["OPTIMISTIC_LOCK_RETRY", "OPTIMISTIC_LOCK_CONFLICT_FAILED", "TRANSACTION_SERIALIZABLE_USED"],
    implementationNote: "Add `version Int @default(0)` to 5 models. Update all write queries to include version check. ~200 lines across API routes.",
  },
  {
    id: "cron-retry-dlq",
    number: 3,
    title: "Cron Retry & Dead-Letter Queue",
    category: "Critical",
    question: "7+ cron jobs (hourly/daily/weekly). What happens when they fail? Partial completion? Timeout? Retry storm?",
    decisionMatrix: [
      { option: "Fire-and-forget — if cron fails, wait for next run", tradeoff: "Simplest. But missed birthdays, stuck waitlists, undelivered summaries. Silent failures.", recommended: false },
      { option: "Retry with exponential backoff + dead-letter queue", tradeoff: "Standard pattern. 3 retries (1s, 10s, 60s). If still failing → move to DLQ. Alert ops.", recommended: true },
      { option: "Circuit breaker — pause cron after 5 consecutive failures", tradeoff: "Prevents retry storms. But may pause legitimate cron if transient issue.", recommended: false },
    ],
    productionBehavior: "Every cron job wrapped in CronJobRunner. On failure: retry 3x with exponential backoff (1s → 10s → 60s). If still failing → insert into CronDeadLetterQueue { jobName, payload, lastError, failedAt, retryCount }. Alert sent to ops dashboard + Slack webhook. DLQ entries reviewed daily by ops. Can be manually re-queued. Auto-purge after 7 days. Job timeout: 5 min max per job (configurable). If timeout → treated as failure, same retry/DLQ flow. Partial completion: each job is idempotent (safe to re-run).",
    auditActions: ["CRON_JOB_STARTED", "CRON_JOB_SUCCEEDED", "CRON_JOB_FAILED", "CRON_JOB_RETRYING", "CRON_JOB_DLQ_INSERTED", "CRON_JOB_TIMEOUT"],
    implementationNote: "New table: CronDeadLetterQueue. New lib: src/lib/cron-runner.ts with retry wrapper. Wrap all 7 cron jobs. ~150 lines.",
  },
  {
    id: "multi-device-session",
    number: 4,
    title: "Multi-Device Owner Session Management",
    category: "High",
    question: "Owner logs in from desktop + mobile + tablet simultaneously. Active sessions? Force logout? Session revocation?",
    decisionMatrix: [
      { option: "Single session — new login auto-logs-out old session", tradeoff: "Strict. Owner can't use phone + desktop simultaneously. Frustrating.", recommended: false },
      { option: "Unlimited sessions, no management", tradeoff: "Convenient. But security risk — lost device = permanent access until password change.", recommended: false },
      { option: "Up to 5 concurrent sessions per staff, revocable from dashboard", tradeoff: "Balanced. Owner sees active sessions in Settings, can revoke any. New logins beyond 5 → oldest revoked.", recommended: true },
    ],
    productionBehavior: "StaffSession table: { id, staffId, deviceInfo, ipAddress, createdAt, lastActiveAt, revokedAt }. On login: create session. If active sessions >= 5 → revoke oldest. Dashboard (Settings → Active Sessions): list of devices, last-active time, 'Revoke' button per session. 'Revoke all' button for emergency. Session expires after 30 days inactivity (configurable). On password change: all sessions revoked. On staff status=suspended: all sessions revoked. JWT token includes sessionId for validation on every API call.",
    auditActions: ["SESSION_CREATED", "SESSION_REVOKED", "SESSION_EXPIRED", "SESSION_LIMIT_REACHED", "ALL_SESSIONS_REVOKED"],
    implementationNote: "New table: StaffSession. Update auth middleware to validate session. New Settings view section. ~250 lines.",
  },
  {
    id: "whatsapp-permanent-failure",
    number: 5,
    title: "WhatsApp Permanent Failure Handling",
    category: "High",
    question: "WhatsApp message permanently fails (invalid number, template rejected, customer opted out). What happens to the queue?",
    decisionMatrix: [
      { option: "Retry forever — never give up", tradeoff: "Spams provider. Wastes quota. Annoys ops with stuck queue.", recommended: false },
      { option: "3 retries then mark 'failed', no recovery", tradeoff: "Simple. But customer never gets the message. No opt-out recovery path.", recommended: false },
      { option: "3 retries → classify failure → opt-out recovery for soft failures, permanent block for hard failures", tradeoff: "Comprehensive. Soft failures (provider timeout) auto-retry next day. Hard failures (invalid number) mark customer.whatsappOptIn=false.", recommended: true },
    ],
    productionBehavior: "After 3 retries, classify failure: SOFT (provider timeout, rate limit, temporary) → status='failed_soft', retry once more after 24h. HARD (invalid number, template rejected, customer blocked) → status='failed_hard', customer.whatsappOptIn set to false, customer notified via next POS visit ('We couldn't reach you on WhatsApp — please update your number'). Template rejected → alert ops, template disabled until fixed. Opt-out recovery: customer can text 'START' to merchant WhatsApp number → whatsappOptIn=true, queue resumes. Permanent block: only on customer request ('Delete my data') or 10+ hard failures.",
    auditActions: ["WHATSAPP_FAILED_SOFT", "WHATSAPP_FAILED_HARD", "WHATSAPP_OPT_OUT_TRIGGERED", "WHATSAPP_OPT_IN_RECOVERED", "WHATSAPP_TEMPLATE_REJECTED", "WHATSAPP_PERMANENT_BLOCK"],
    implementationNote: "Update WhatsAppMessage state machine. Add WhatsAppFailureClassification logic. New endpoint: POST /api/whatsapp/recover-opt-in. ~180 lines.",
  },
  {
    id: "support-ticket-lifecycle",
    number: 6,
    title: "Merchant Support Ticket Lifecycle",
    category: "High",
    question: "Support tickets need SLA, priority, reopening, escalation. Current model is basic.",
    decisionMatrix: [
      { option: "Basic open/resolved states only", tradeoff: "Current V6.1. No SLA tracking. No escalation. Tickets get lost.", recommended: false },
      { option: "Full ITSM lifecycle: open → in_progress → waiting_customer → resolved → closed, with SLA + reopening", tradeoff: "Standard support workflow. SLA per priority. Auto-escalation on breach. Reopen within 7 days.", recommended: true },
      { option: "AI-triaged: LLM categorizes + prioritizes + suggests resolution", tradeoff: "Advanced. But adds LLM dependency. Defer to V7.", recommended: false },
    ],
    productionBehavior: "States: open → in_progress → waiting_customer → resolved → closed. SLA by priority: urgent=4h, high=24h, normal=72h, low=168h. SLA timer pauses while waiting_customer. On SLA breach: auto-escalate priority (low→normal→high→urgent) + alert ops. Resolved tickets auto-close after 7 days if no reopen. Reopen allowed within 7 days of resolution → ticket reopens with priority +1. After 7 days: closed permanently, new ticket required. Dashboard: 'Tickets breaching SLA' widget for ops. Merchant can rate resolution (👍/👎) — feedback improves support quality.",
    auditActions: ["TICKET_CREATED", "TICKET_PRIORITY_ESCALATED", "TICKET_SLA_BREACHED", "TICKET_REOPENED", "TICKET_CLOSED", "TICKET_FEEDBACK_RECEIVED"],
    implementationNote: "Update SupportTicket model with slaDeadline, reopenedAt, reopenedFromId. New cron: sla-monitor.ts hourly. ~200 lines.",
  },
  {
    id: "backup-restore-dr",
    number: 7,
    title: "Backup, Restore & Disaster Recovery",
    category: "High",
    question: "Production data loss (DB corruption, accidental delete, cloud outage). What's the recovery strategy?",
    decisionMatrix: [
      { option: "Rely on cloud provider backups only", tradeoff: "Simple. But limited restore granularity. No tested recovery procedure.", recommended: false },
      { option: "Daily snapshots + weekly restore drills + documented RTO/RPO", tradeoff: "Industry standard. RPO=24h (max data loss), RTO=4h (max downtime). Tested quarterly.", recommended: true },
      { option: "Real-time replication + cross-region failover", tradeoff: "Enterprise-grade. RPO≈0, RTO<15min. But expensive. Overkill for V6.2 scale.", recommended: false },
    ],
    productionBehavior: "Backup: daily full DB snapshot at 3 AM IST (off-peak) + continuous WAL streaming. Retention: 30 daily + 12 monthly + 7 yearly. Storage: encrypted, cross-region (Mumbai + Singapore). Restore: quarterly drill — restore to staging, verify data integrity, document time-to-restore. RPO=24h (acceptable: lose max 1 day of bills). RTO=4h (acceptable: 4h downtime max). Disaster recovery runbook: (1) provision new DB from latest snapshot, (2) update connection string, (3) verify merchant count + customer count, (4) switch DNS, (5) post-incident report. Backup monitoring: alert if daily backup fails or snapshot size drops >50% (data loss indicator).",
    auditActions: ["BACKUP_STARTED", "BACKUP_COMPLETED", "BACKUP_FAILED", "RESTORE_DRILL_COMPLETED", "RESTORE_DRILL_FAILED", "DISASTER_RECOVERY_TRIGGERED"],
    implementationNote: "No code changes — ops infrastructure. Document in runbook. Cron: backup-verify.ts daily. ~100 lines for monitoring.",
  },
  {
    id: "notification-preferences",
    number: 8,
    title: "Merchant Notification Preferences",
    category: "Medium",
    question: "Merchant gets daily summary, morning briefing, fraud alerts, birthday digest, win-back digest. Can they customize?",
    decisionMatrix: [
      { option: "All-or-nothing — merchant receives every notification type", tradeoff: "Simple. But notification fatigue. Owner may mute entirely.", recommended: false },
      { option: "Per-notification-type toggle + per-channel (WhatsApp/Email/Dashboard)", tradeoff: "Maximum control. 5 types × 3 channels = 15 toggles per merchant.", recommended: true },
      { option: "Quiet hours — no notifications 10 PM - 8 AM", tradeoff: "Reduces annoyance but doesn't solve relevance. Some alerts are urgent.", recommended: false },
    ],
    productionBehavior: "MerchantNotificationPreference table: { merchantId, notificationType, channel, enabled }. Notification types: daily_summary, morning_briefing, fraud_alert, birthday_digest, win_back_digest, review_request, low_stock_alert, subscription_alert. Channels: whatsapp, email, dashboard. Defaults by role: Owner=all enabled, Manager=operational only (no subscription), Cashier=none (no notifications). Merchant can override in Settings → Notifications. Dashboard notifications always enabled (can't disable — they're in-app). Urgent alerts (fraud critical, subscription payment_failed) bypass preferences — always sent. Quiet hours: configurable per merchant (default 10 PM - 7 AM, urgent alerts still sent).",
    auditActions: ["NOTIFICATION_PREFERENCE_CHANGED", "NOTIFICATION_SENT", "NOTIFICATION_SUPPRESSED_BY_PREFERENCE", "NOTIFICATION_URGENT_BYPASS"],
    implementationNote: "New table: MerchantNotificationPreference. New Settings view section. Update all notification-sending code to check preferences. ~300 lines.",
  },
  {
    id: "data-export",
    number: 9,
    title: "Data Export Policy",
    category: "Medium",
    question: "Merchant says 'Give me all my data in Excel'. Customers ask 'Give me my data' (GDPR/DPDP). What's exportable, in what format?",
    decisionMatrix: [
      { option: "No export — data locked in system", tradeoff: "Vendor lock-in. Violates DPDP Act. Merchants leave.", recommended: false },
      { option: "Manual export by support on request", tradeoff: "Slow (3-5 days). Doesn't scale. Support bottleneck.", recommended: false },
      { option: "Self-service export from dashboard, CSV/Excel, all entities, async generation", tradeoff: "Standard SaaS pattern. Merchant clicks 'Export', gets email link in 5-30 min. Customers can self-export too.", recommended: true },
    ],
    productionBehavior: "Settings → Data Export. Merchant picks: entity type (Customers/Bills/Redemptions/Reviews/AuditLog/All), date range, format (CSV/Excel/JSON). System creates async job → DataExportJob { merchantId, entities, dateRange, format, status, downloadUrl, expiresAt }. Job runs in background (5-30 min depending on size). On completion: email + WhatsApp with secure download link (signed URL, 7-day expiry). Customer self-export: Customer portal (future) → 'Download my data' → JSON with their stamps, bills, redemptions, reviews. Privacy: export logs to AuditLog (who exported what, when). Rate limit: 1 export per merchant per hour. Large exports (>100K rows) chunked into ZIP.",
    auditActions: ["DATA_EXPORT_REQUESTED", "DATA_EXPORT_COMPLETED", "DATA_EXPORT_FAILED", "DATA_EXPORT_DOWNLOADED", "CUSTOMER_DATA_EXPORTED"],
    implementationNote: "New table: DataExportJob. New endpoint: POST /api/export. Background worker: export-worker.ts. ~400 lines.",
  },
  {
    id: "retention-policy",
    number: 10,
    title: "Retention Policy for Soft-Deleted Entities",
    category: "Medium",
    question: "Customer merge soft-deletes duplicate (30-day hard delete). What about Staff, Rewards, Bills, AuditLog, WhatsApp messages?",
    decisionMatrix: [
      { option: "Keep everything forever", tradeoff: "Storage grows unbounded. GDPR/DPDP violations (right to erasure).", recommended: false },
      { option: "Hard delete immediately on soft-delete", tradeoff: "No recovery window. Accidental deletes are permanent.", recommended: false },
      { option: "Tiered retention: 30-90-365 days by entity type, then hard delete", tradeoff: "Compliant + practical. Recovery windows per entity criticality.", recommended: true },
    ],
    productionBehavior: "Retention schedule: Customer (soft-deleted via merge): 30 days → hard delete. Customer (requested deletion): 30 days cold storage → hard delete (DPDP). Staff (suspended/resigned): 90 days → hard delete (payroll/legal records). Rewards (inactive): 90 days → hard delete (after all pending redemptions resolved). Bills (voided/refunded): 365 days → hard delete (tax requirement). Bills (confirmed): 7 years (GST law). AuditLog: 7 years (compliance). WhatsAppMessage: 90 days → hard delete (privacy). Reviews: 365 days after clawback/expiry → hard delete. Cron: retention-enforcer.ts daily. Checks each entity type, hard-deletes past retention. AuditLog: RETENTION_HARD_DELETE per batch.",
    auditActions: ["RETENTION_SOFT_DELETE", "RETENTION_HARD_DELETE", "RETENTION_RECOVERY_WINDOW_EXPIRED"],
    implementationNote: "New cron: retention-enforcer.ts. Configurable retention periods in Merchant settings (with legal minimums enforced). ~200 lines.",
  },
  {
    id: "api-versioning",
    number: 11,
    title: "API Versioning Strategy",
    category: "Medium",
    question: "V6 has /api/bills. Future V7 might change response schema. How do we version without breaking existing merchants?",
    decisionMatrix: [
      { option: "No versioning — change API, break clients, force update", tradeoff: "Simplest. But merchants' integrated systems break. Trust lost.", recommended: false },
      { option: "URL versioning: /v1/api/bills, /v2/api/bills", tradeoff: "Industry standard. Clear, cacheable, explicit. Old versions supported for 12 months.", recommended: true },
      { option: "Header versioning: Accept-Version: v1", tradeoff: "Clean URLs. But invisible in logs, harder to debug.", recommended: false },
    ],
    productionBehavior: "URL versioning: /api/v1/bills, /api/v2/bills. Default (no version) → latest stable. Version lifecycle: v1 released → v2 released (v1 deprecated, 12-month sunset) → v1 sunset (410 Gone). Breaking changes (response schema, required params, status codes) require new version. Non-breaking changes (new optional params, new response fields) backward-compatible, no new version. Deprecation headers: API-Deprecation: true, Sunset: <date>. Developer Manual documents per-version. Migration guide per major version. Current: v1 (V6.2). Next: v2 when multi-tenant auth lands.",
    auditActions: ["API_VERSION_DEPRECATED", "API_VERSION_SUNSET", "API_BREAKING_CHANGE_INTRODUCED"],
    implementationNote: "Restructure /api/* → /api/v1/*. Add version middleware. Update Developer Manual. ~150 lines for restructure + middleware.",
  },
  {
    id: "feature-licensing",
    number: 12,
    title: "Feature Licensing Matrix",
    category: "Medium",
    question: "Starter / Pro / Enterprise plans. What's in each? Merchant needs to see upgrade path.",
    decisionMatrix: [
      { option: "Single plan — all features for everyone", tradeoff: "Simple. But no upsell path. Power users and small merchants pay same.", recommended: false },
      { option: "3-tier matrix: Starter / Pro / Enterprise, feature-gated", tradeoff: "Standard SaaS. Clear value ladder. Merchant sees locked features with 'Upgrade to unlock'.", recommended: true },
      { option: "Usage-based pricing — pay per bill/customer/stamp", tradeoff: "Fair but unpredictable for merchants. Hard to forecast revenue.", recommended: false },
    ],
    productionBehavior: "Plans: Starter (₹999/mo) — 1 staff, 100 customers, 1 stamp card, basic reports, WhatsApp 100/mo. Pro (₹2,499/mo) — 5 staff, 1000 customers, 5 stamp cards, advanced reports + AI insights, WhatsApp 1000/mo, VIP tiers, birthday engine, review engine. Enterprise (₹9,999/mo) — unlimited staff/customers/cards, white-label, multi-branch, API access, priority support, custom integrations. Feature gating: each feature checks merchant.plan against feature matrix. Locked features show 'Upgrade to Pro' CTA. Over-limit: soft warnings at 80%, hard block at 100% (merchant can't add 101st customer on Starter). Upgrade flow: Settings → Plan → pick → pay prorated → features unlock instantly. Downgrade: takes effect at next billing cycle (no mid-cycle feature loss).",
    auditActions: ["PLAN_UPGRADED", "PLAN_DOWNGRADED", "FEATURE_LIMIT_REACHED", "FEATURE_LIMIT_BLOCKED", "PLAN_PAYMENT_FAILED"],
    implementationNote: "New table: FeatureMatrix. Middleware: check-plan-limit on all create endpoints. Settings → Plan view. ~350 lines.",
  },
]
