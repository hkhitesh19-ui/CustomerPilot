/**
 * src/lib/schemas.ts — Centralized Zod validation schemas for all API routes.
 * Import and use these in route handlers before processing any body.
 * Pattern: const result = SomeSchema.safeParse(body); if (!result.success) return zodErr(result.error)
 */
import { z } from 'zod'

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns a flat list of human-readable Zod error messages */
export function zodErrors(error: z.ZodError): string[] {
  return error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
}

/** Phone: 10–15 digits, optional leading + */
const phoneSchema = z
  .string()
  .min(10, 'Phone must be at least 10 digits')
  .max(20, 'Phone too long')
  .regex(/^\+?\d{10,15}$/, 'Invalid phone number format (use digits with optional leading +)')

/** Non-empty trimmed string */
const nameSchema = z.string().min(1, 'Required').max(200, 'Too long').trim()

/** Optional email */
const emailSchema = z.string().email('Invalid email address').optional().or(z.literal(''))

// ── Auth Schemas ────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  businessName: nameSchema,
  ownerName: nameSchema,
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: phoneSchema,
})

// ── Customer Schemas ────────────────────────────────────────────────────────

export const CreateCustomerSchema = z.object({
  staffId: z.string().cuid('Invalid staffId'),
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  whatsappOptIn: z.boolean().optional(),
  acquisitionChan: z.string().max(50).optional(),
  referredByCode: z.string().max(50).optional(),
})

export const ImportCustomersSchema = z.object({
  staffId: z.string().cuid('Invalid staffId'),
  rows: z
    .array(
      z.object({
        name: nameSchema,
        phone: phoneSchema,
        email: emailSchema,
      })
    )
    .min(1, 'rows[] must not be empty')
    .max(500, 'Maximum 500 rows per import'),
})

// ── Bill Schemas ────────────────────────────────────────────────────────────

export const CreateBillSchema = z.object({
  staffId: z.string().cuid('Invalid staffId'),
  customerId: z.string().cuid('Invalid customerId'),
  amount: z.number().positive('Amount must be greater than 0'),
  notes: z.string().max(500).optional(),
})

// ── Staff Schemas ────────────────────────────────────────────────────────────

export const CreateStaffSchema = z.object({
  staffId: z.string().cuid('Invalid staffId'),
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d{4}$/, 'PIN must be 4 numeric digits'),
  role: z.enum(['owner', 'manager', 'cashier'], { message: 'Role must be owner, manager, or cashier' }),
})

// ── Reward Schemas ──────────────────────────────────────────────────────────

export const RedeemRewardSchema = z.object({
  staffId: z.string().cuid('Invalid staffId'),
  customerId: z.string().cuid('Invalid customerId'),
  rewardId: z.string().cuid('Invalid rewardId'),
})

export const CreateRewardSchema = z.object({
  staffId: z.string().cuid('Invalid staffId'),
  name: nameSchema,
  description: z.string().max(1000).optional(),
  stampsCost: z.number().int().positive('stampsCost must be a positive integer'),
  stock: z.number().int().nonnegative('stock cannot be negative').optional(),
  requiresManagerApproval: z.boolean().optional(),
})

// ── Referral Schemas ────────────────────────────────────────────────────────

export const CreateReferralSchema = z.object({
  referrerId: z.string().cuid('Invalid referrerId'),
  friendPhone: phoneSchema,
})

// ── Support Ticket Schemas ──────────────────────────────────────────────────

export const CreateSupportTicketSchema = z.object({
  subject: nameSchema,
  category: z.string().min(1).max(100),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().max(5000).optional(),
})

// ── OTP Schemas ─────────────────────────────────────────────────────────────

export const SendOTPSchema = z.object({
  phone: phoneSchema,
})

export const VerifyOTPSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d{4}$/, 'OTP must be 4 numeric digits'),
})

// ── Stamp Card Schemas ───────────────────────────────────────────────────────

export const CreateStampCardSchema = z.object({
  name: nameSchema,
  stampsRequired: z.number().int().min(1).max(100),
  rewardName: nameSchema,
  stampsPerBill: z.string().optional(),
  color: z.string().max(20).optional(),
  stampValue: z.number().positive().optional(),
  validityDays: z.number().int().positive().optional(),
})

// ── Payment Schemas ──────────────────────────────────────────────────────────

export const PaymentVerifySchema = z.object({
  razorpay_order_id: z.string().min(1, 'razorpay_order_id is required'),
  razorpay_payment_id: z.string().min(1, 'razorpay_payment_id is required'),
  razorpay_signature: z.string().min(1, 'razorpay_signature is required'),
  plan: z.enum(['starter', 'growth', 'enterprise', 'trial']).optional(),
})
