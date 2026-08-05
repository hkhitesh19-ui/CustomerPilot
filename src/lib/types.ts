// CustomerPilot V5 — shared types for the SPA frontend.

export type Role = "OWNER" | "MANAGER" | "CASHIER"

export interface Merchant {
  id: string
  name: string
  businessType: string
  whatsappPhone: string | null
  plan: string
  status: string
}

export interface Staff {
  id: string
  merchantId: string
  name: string
  phone: string
  email: string | null
  pin: string
  role: Role
  status: string
}

export interface Customer {
  id: string
  merchantId: string
  name: string
  phone: string
  email: string | null
  whatsappOptIn: boolean
  status: string
  vipTier: string
  referralCode: string
  referredById: string | null
  acquisitionChan: string
  lifetimeStamps: number
  lifetimeSpend: number
  lifetimeRedemptions: number
  currentStreak: number
  longestStreak: number
  birthday: string | null
  notes: string | null
  favorite: boolean
  churnRiskScore: number
  lastActiveAt: string | null
  createdAt: string
}

export interface StampCard {
  id: string
  merchantId: string
  name: string
  stampsRequired: number
  rewardName: string
  stampsPerBill: string
  color: string
  active: boolean
}

export interface CustomerStampCard {
  id: string
  customerId: string
  stampCardId: string
  stampsCollected: number
  completed: boolean
  redeemed: boolean
  stamps: { id: string; source: string; createdAt: string }[]
}

export interface Reward {
  id: string
  merchantId: string
  name: string
  description: string | null
  stampsCost: number
  stock: number
  requiresManagerApproval: boolean
  active: boolean
}

export interface Bill {
  id: string
  merchantId: string
  customerId: string
  issuedById: string
  number: string
  amount: number
  stampsAwarded: number
  status: string
  notes: string | null
  createdAt: string
}

export interface Redemption {
  id: string
  merchantId: string
  customerId: string
  rewardId: string
  approvedById: string | null
  stampsSpent: number
  status: string
  notes: string | null
  createdAt: string
}

export interface Referral {
  id: string
  merchantId: string
  referrerId: string
  friendPhone: string
  friendCustomerId: string | null
  status: string
  bonusStampsReferrer: number
  bonusStampsFriend: number
  flaggedReason: string | null
  createdAt: string
}

export interface WhatsAppMessage {
  id: string
  merchantId: string
  customerId: string | null
  toPhone: string
  template: string
  body: string
  status: string
  createdAt: string
}

export interface AuditLog {
  id: string
  merchantId: string
  actorType: string
  actorId: string | null
  staffId: string | null
  action: string
  entity: string | null
  entityId: string | null
  metadata: string | null
  createdAt: string
}

export interface Subscription {
  id: string
  merchantId: string
  plan: string
  amount: number
  currency: string
  status: string
  renewalDate: string
}

export interface AppState {
  merchant: Merchant
  staff: Staff[]
  customers: Customer[]
  stampCards: StampCard[]
  customerStampCards: CustomerStampCard[]
  rewards: Reward[]
  bills: Bill[]
  redemptions: Redemption[]
  referrals: Referral[]
  auditLogs: AuditLog[]
  waMessages: WhatsAppMessage[]
  subscriptions: Subscription[]
  // V6 additions
  reviews: Review[]
  birthdays: Birthday[]
  vipTiers: VipTier[]
  winBacks: WinBackEscalation[]
  achievements: Achievement[]
  supportTickets: SupportTicket[]
  onboardingSteps: OnboardingStep[]
  // V6.3 — Live Queue
  waitingCustomers: WaitingCustomer[]
}

export interface Review {
  id: string
  merchantId: string
  customerId: string
  platform: string
  rating: number
  aiDraft: string | null
  finalText: string | null
  photoUrl: string | null
  status: string
  bonusStampsAwarded: number
  photoBonusStamps: number
  requestSource: string
  createdAt: string
  updatedAt: string
  submittedAt: string | null
}

export interface Birthday {
  id: string
  merchantId: string
  customerId: string
  birthMonth: number
  birthDay: number
  rewardName: string
  bonusStamps: number
  status: string
  reminderSentAt: string | null
  rewardWindowStart: string | null
  rewardWindowEnd: string | null
  createdAt: string
  updatedAt: string
}

export interface VipTier {
  id: string
  merchantId: string
  name: string
  minLifetimeSpend: number
  perks: string
  bonusMultiplier: number
  color: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface WinBackEscalation {
  id: string
  merchantId: string
  customerId: string
  stage: string
  action: string
  messageTemplate: string
  sentAt: string | null
  outcome: string | null
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  customerId: string
  type: string
  label: string
  description: string | null
  earnedAt: string
}

export interface SupportTicket {
  id: string
  merchantId: string
  subject: string
  category: string
  priority: string
  status: string
  description: string
  resolution: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

export interface OnboardingStep {
  id: string
  merchantId: string
  stepKey: string
  label: string
  completed: boolean
  completedAt: string | null
  skipped: boolean
  createdAt: string
  updatedAt: string
}

// V6.3 — Live Queue (Tap to Claim Reward)
export interface WaitingCustomer {
  id: string
  merchantId: string
  customerId: string
  status: string // waiting, claimed, expired, cancelled
  scannedAt: string
  claimedAt: string | null
  claimedById: string | null
  expiresAt: string
  amount: number | null
  stampsAwarded: number
  scanSource: string
  createdAt: string
  updatedAt: string
}
