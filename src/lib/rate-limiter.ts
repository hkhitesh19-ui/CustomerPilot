// src/lib/rate-limiter.ts
// Rate limiter utility for auth routes using in-memory store (no Redis needed)
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { NextRequest, NextResponse } from 'next/server'

// Auth routes: max 10 requests per IP per minute
const authLimiter = new RateLimiterMemory({
  points: 10,       // 10 requests
  duration: 60,     // per 60 seconds (per IP)
  blockDuration: 60 // block for 60 seconds when exceeded
})

// Strict limiter for login (brute-force protection): max 5 attempts per IP per 5 minutes
const loginLimiter = new RateLimiterMemory({
  points: 5,         // 5 attempts
  duration: 300,     // per 5 minutes
  blockDuration: 300 // block for 5 minutes
})

// AI generation endpoints: max 20 calls per merchant per minute (cost control)
const aiLimiter = new RateLimiterMemory({
  points: 20,        // 20 AI calls
  duration: 60,      // per 60 seconds
  blockDuration: 60  // block for 60 seconds
})

// Bulk AI reply: stricter limit — max 5 bulk operations per merchant per minute
const bulkAiLimiter = new RateLimiterMemory({
  points: 5,         // 5 bulk AI calls
  duration: 60,      // per 60 seconds
  blockDuration: 120 // block for 2 minutes
})

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Apply auth rate limiting. Returns a 429 response if limit exceeded, else null.
 * Usage: const limited = await applyAuthRateLimit(req); if (limited) return limited;
 */
export async function applyAuthRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req)
  try {
    await authLimiter.consume(ip)
    return null
  } catch {
    return NextResponse.json(
      { error: 'Too many requests. Please wait 1 minute before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' }
      }
    )
  }
}

/**
 * Apply strict login rate limiting (brute-force protection).
 * Returns a 429 response if limit exceeded, else null.
 */
export async function applyLoginRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req)
  try {
    await loginLimiter.consume(ip)
    return null
  } catch {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 5 minutes before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': '300' }
      }
    )
  }
}

/**
 * Apply AI endpoint rate limiting — keyed by merchant ID, not IP.
 * AI costs are per account, so we limit per merchant to control spend.
 * Returns a 429 response if limit exceeded, else null.
 * Usage: const limited = await applyAiRateLimit(merchantId); if (limited) return limited;
 */
export async function applyAiRateLimit(merchantId: string): Promise<NextResponse | null> {
  try {
    await aiLimiter.consume(merchantId)
    return null
  } catch {
    return NextResponse.json(
      { ok: false, error: 'AI rate limit reached. Maximum 20 AI requests per minute per account. Please wait before retrying.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' }
      }
    )
  }
}

/**
 * Apply bulk AI rate limiting — stricter, for bulk AI operations.
 * Returns a 429 response if limit exceeded, else null.
 */
export async function applyBulkAiRateLimit(merchantId: string): Promise<NextResponse | null> {
  try {
    await bulkAiLimiter.consume(merchantId)
    return null
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Bulk AI rate limit reached. Maximum 5 bulk AI operations per minute. Please wait before retrying.' },
      {
        status: 429,
        headers: { 'Retry-After': '120' }
      }
    )
  }
}
