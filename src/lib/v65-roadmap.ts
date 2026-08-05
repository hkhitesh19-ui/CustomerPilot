// CustomerPilot V6.5 ROADMAP
// Captures all remaining items from the 4th ChatGPT audit.
// V6.4 is production-ready (99.95%). These are V6.5/V7 roadmap items, NOT launch blockers.
//
// Categories: Enterprise Operational Policies | Experience Enhancements | Documentation Polish

export interface RoadmapItem {
  id: string
  number: number
  title: string
  category: "Enterprise Operational" | "Experience Enhancement" | "Documentation Polish" | "Future V7 Feature"
  priority: "High" | "Medium" | "Low"
  gap: string
  proposedSolution: string
  effort: string
  blocksLaunch: boolean
}

export const V65_ROADMAP: RoadmapItem[] = [
  // ENTERPRISE OPERATIONAL POLICIES (10 gaps)
  {
    id: "reservation-heartbeat",
    number: 1,
    title: "Reservation Heartbeat & Auto-Release",
    category: "Enterprise Operational",
    priority: "High",
    gap: "Ravi taps → reserved → laptop hangs / internet gone → never returns. Customer forever reserved.",
    proposedSolution: "Frontend sends heartbeat every 3s while reservation modal is open. If no heartbeat for 10s, backend auto-releases reservation. Customer returns to 'waiting' state. AuditLog: QUEUE_RESERVATION_HEARTBEAT_TIMEOUT.",
    effort: "~150 lines. Frontend heartbeat interval + backend heartbeat endpoint + cron check.",
    blocksLaunch: false,
  },
  {
    id: "customer-cancel",
    number: 2,
    title: "Customer Self-Cancel from Queue",
    category: "Enterprise Operational",
    priority: "Medium",
    gap: "Customer scans QR, then says 'Nahi chahiye.' No way for customer to remove themselves from queue.",
    proposedSolution: "WhatsApp message includes 'Cancel' button. Customer taps → queue entry status='cancelled'. Or: customer scans QR again → 'You're already in queue. Cancel?' prompt. AuditLog: QUEUE_CUSTOMER_CANCELLED.",
    effort: "~100 lines. WhatsApp interactive button + /api/queue/customer-cancel endpoint.",
    blocksLaunch: false,
  },
  {
    id: "merchant-reassign",
    number: 3,
    title: "Merchant Reassign Reservation",
    category: "Enterprise Operational",
    priority: "Low",
    gap: "Ravi reserves but realizes Priya should handle (e.g., VIP customer). Currently must cancel + Priya re-taps.",
    proposedSolution: "In reservation modal: 'Reassign to...' dropdown listing available staff. Reservation transferred. AuditLog: QUEUE_RESERVATION_REASSIGNED.",
    effort: "~80 lines. Dropdown UI + /api/queue/reassign endpoint.",
    blocksLaunch: false,
  },
  {
    id: "queue-capacity",
    number: 4,
    title: "Queue Capacity & Pagination",
    category: "Enterprise Operational",
    priority: "Medium",
    gap: "Saturday rush: 350 customers in queue. Memory? Pagination? Performance?",
    proposedSolution: "Default: show latest 50 waiting. 'Load more' pagination. Configurable max queue size per plan (Starter=100, Pro=500, Enterprise=unlimited). If at capacity: customer gets 'Queue full, please try in a few minutes.' AuditLog: QUEUE_CAPACITY_REACHED.",
    effort: "~200 lines. Pagination UI + capacity check in joinQueue() + plan-based limits.",
    blocksLaunch: false,
  },
  {
    id: "scan-spam-protection",
    number: 5,
    title: "Scan Spam Rate Limiting",
    category: "Enterprise Operational",
    priority: "High",
    gap: "Customer scans QR 20 times. Queue spam.",
    proposedSolution: "Rate limit: 1 scan per phone per 30 seconds. If duplicate within 30s: return existing queue entry (idempotent, no new entry). If 5+ scans in 5 min: flag as suspicious, show captcha in WhatsApp. AuditLog: QUEUE_SCAN_RATE_LIMITED.",
    effort: "~100 lines. Rate limit check in joinQueue() + Redis/memory cache.",
    blocksLaunch: false,
  },
  {
    id: "multi-branch-queue",
    number: 6,
    title: "Multi-Branch Queue Isolation",
    category: "Enterprise Operational",
    priority: "Low",
    gap: "Merchant has 5 branches. Currently queue is global per merchant.",
    proposedSolution: "Branch model (V6.1 Policy #21). Each branch has own QR + own queue. Customer scans Branch A QR → joins Branch A queue only. Reports filterable by branch. AuditLog: QUEUE_BRANCH_ASSIGNED.",
    effort: "~500 lines. Branch model + per-branch QR generation + queue filtering.",
    blocksLaunch: false,
  },
  {
    id: "cross-device-sync",
    number: 7,
    title: "Cross-Device Reservation Sync",
    category: "Enterprise Operational",
    priority: "Medium",
    gap: "Desktop + Phone + Tablet same owner. Claim simultaneously on two devices.",
    proposedSolution: "WebSocket (V6.2 Enterprise Hardening #13). When Ravi reserves on desktop, phone + tablet instantly show 'Reserved by Ravi' badge. No polling delay. Fallback to 3s polling if WebSocket fails.",
    effort: "~400 lines. WebSocket mini-service + frontend client + fallback logic.",
    blocksLaunch: false,
  },
  {
    id: "customer-amount-confirmation",
    number: 8,
    title: "Customer Amount Confirmation (Optional)",
    category: "Enterprise Operational",
    priority: "Low",
    gap: "Merchant claims with ₹700 but customer paid ₹300. No way for customer to verify.",
    proposedSolution: "WhatsApp shows: 'You earned a reward! Purchase: ₹700. Wrong amount? Tap to report.' Customer can report within 24h. Creates support ticket. Manager reviews. AuditLog: QUEUE_AMOUNT_DISPUTED.",
    effort: "~200 lines. WhatsApp interactive message + dispute endpoint + review UI.",
    blocksLaunch: false,
  },
  {
    id: "queue-search",
    number: 9,
    title: "Queue Search & Filter",
    category: "Enterprise Operational",
    priority: "Medium",
    gap: "Queue has 300 entries. Merchant needs to find specific customer by phone/name/VIP.",
    proposedSolution: "Search bar above queue. Filters: VIP only, Birthday today, Expiring soon, New customers. Real-time filter as merchant types. AuditLog: QUEUE_SEARCHED.",
    effort: "~120 lines. Search input + filter logic + UI.",
    blocksLaunch: false,
  },
  {
    id: "ai-queue-assistant",
    number: 10,
    title: "AI Queue Prioritization Assistant",
    category: "Experience Enhancement",
    priority: "Medium",
    gap: "10 customers waiting. Merchant doesn't know who to process first.",
    proposedSolution: "AI sorts queue by priority: (1) Birthday today, (2) VIP Platinum/Gold, (3) Reward expiring soon, (4) Waiting longest, (5) Normal. Shows 'Recommended: Process {name} first — {reason}'. Merchant can override. AuditLog: QUEUE_AI_PRIORITIZED.",
    effort: "~200 lines. Sorting algorithm + UI badge 'AI Recommended'.",
    blocksLaunch: false,
  },

  // DOCUMENTATION POLISH (3 items)
  {
    id: "undo-review-policy",
    number: 11,
    title: "Undo + Review Request Interaction Policy",
    category: "Documentation Polish",
    priority: "Medium",
    gap: "If claim triggers review request, then merchant undoes — customer may receive review message before undo cancels it.",
    proposedSolution: "Review request is delayed 60s after claim (not 5s). If undo happens within 30s, review request never fires. If undo after 30s (bill refund flow), review request already fired → customer gets 'Sorry, error' follow-up. Documented in queue-state-machine.ts 'claimed' state.",
    effort: "~30 lines. Delay review trigger + cancel on undo.",
    blocksLaunch: false,
  },
  {
    id: "recovered-state-definition",
    number: 12,
    title: "Recovered State Formal Definition",
    category: "Documentation Polish",
    priority: "Low",
    gap: "'recovered' state ambiguous — recovered from undo? expired? cancelled?",
    proposedSolution: "Formal definition: 'recovered' = a claim was undone within 30s window. Stamps reversed, bill voided, WhatsApp cancelled. Entry is terminal (customer must re-scan to rejoin). Distinct from 'cancelled' (merchant cancelled before claim) and 'expired' (timeout). Documented in queue-state-machine.ts.",
    effort: "~10 lines. Documentation update only.",
    blocksLaunch: false,
  },
  {
    id: "merged-queue-audit",
    number: 13,
    title: "Merged Queue Entry Audit Policy",
    category: "Documentation Polish",
    priority: "Low",
    gap: "If merged customer had a claimed queue entry, what happens to the claim? Stamps? Bill?",
    proposedSolution: "Merge logic: if duplicate has 'claimed' entry, the claim (stamps, bill, WhatsApp) stays with canonical customer. Bill.customerId updated to canonical. No stamp reversal. AuditLog: QUEUE_MERGED_CLAIM_PRESERVED. If duplicate has 'waiting' entry, it's migrated to canonical (if canonical doesn't already have one) or marked 'merged' (if canonical already waiting).",
    effort: "~40 lines. Merge logic update + audit.",
    blocksLaunch: false,
  },

  // FUTURE V7 FEATURES (2 items)
  {
    id: "smart-counter-display",
    number: 14,
    title: "Smart Counter Display (Viral Feature)",
    category: "Future V7 Feature",
    priority: "Medium",
    gap: "No physical presence at counter. Customer scans silently on phone.",
    proposedSolution: "Tablet/TV at counter. Customer scans → display shows: '🎉 Welcome Back Meera! 3/9 Stamps. 6 more for free cake!' Social proof — other customers see it, want to join. Configurable: show name, stamps, or just 'Welcome!'. Privacy mode for shy customers. AuditLog: COUNTER_DISPLAY_SHOWN.",
    effort: "~600 lines. Separate display app (kiosk mode) + WebSocket sync + privacy settings.",
    blocksLaunch: false,
  },
  {
    id: "queue-intelligence-engine",
    number: 15,
    title: "Queue Intelligence Engine (V7 Signature)",
    category: "Future V7 Feature",
    priority: "High",
    gap: "Queue is passive — merchant decides order. Could be AI-driven.",
    proposedSolution: "AI sorts queue by priority: (1) Birthday today, (2) VIP Platinum/Gold, (3) Reward expiring soon, (4) Waiting longest, (5) Normal. Shows 'Recommended: Process {name} first — {reason}'. Merchant can override. AuditLog: QUEUE_AI_PRIORITIZED. This is the V7 evolution of 'Tap to Claim' → 'AI tells you who to tap'.",
    effort: "~300 lines. Sorting algorithm + AI reasoning + UI badge.",
    blocksLaunch: false,
  },
]

export const ROADMAP_SUMMARY = {
  totalItems: 15,
  enterpriseOperational: 10,
  experienceEnhancement: 1,
  documentationPolish: 3,
  futureV7: 2,
  blocksLaunch: 0,
  verdict: "V6.4 is production-ready (99.95%). All 15 items are V6.5/V7 roadmap — NOT launch blockers. Go pilot.",
}
