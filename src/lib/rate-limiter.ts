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
