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

// Public Web Check-In: max 15 check-in submissions per IP per minute (shared shop Wi-Fi safe)
const webCheckinIpLimiter = new RateLimiterMemory({
  points: 15,        // 15 check-ins
  duration: 60,      // per 60 seconds per IP
  blockDuration: 60  // block for 60 seconds when flooded
})

// Public Web Check-In per phone per merchant: max 3 submissions per 5 minutes
const webCheckinPhoneLimiter = new RateLimiterMemory({
  points: 3,         // 3 check-in hits per mobile number per store
  duration: 300,     // per 5 minutes
  blockDuration: 300 // block for 5 minutes
})

// Anonymous scan-ping telemetry: max 10 pings per IP per store per 5 minutes
const scanPingIpLimiter = new RateLimiterMemory({
  points: 10,        // 10 scan pings
  duration: 300,     // per 5 minutes
  blockDuration: 300 // block for 5 minutes
})

/**
 * Resolve client IP prioritizing Cloudflare (`cf-connecting-ip`) and Nginx TCP peer (`x-real-ip`)
 * before falling back to the rightmost proxy-appended `x-forwarded-for` hop to prevent spoofing.
 */
export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get('cf-connecting-ip')?.trim()
  if (cfIp) return cfIp

  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const xffParts = (req.headers.get('x-forwarded-for') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (xffParts.length > 0) {
    return xffParts[xffParts.length - 1]
  }

  return 'unknown'
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

/**
 * Apply per-IP rate limiting on public POST /api/queue/web-checkin to prevent queue flooding.
 */
export async function applyWebCheckinIpLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req)
  try {
    await webCheckinIpLimiter.consume(ip)
    return null
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Too many check-in attempts from this network. Please wait 1 minute.' },
      {
        status: 429,
        headers: { 'Retry-After': '60' }
      }
    )
  }
}

/**
 * Apply per-merchant + per-phone throttling on POST /api/queue/web-checkin (3 per 5 min).
 */
export async function applyWebCheckinPhoneLimit(merchantId: string, phoneLast10: string): Promise<NextResponse | null> {
  try {
    await webCheckinPhoneLimiter.consume(`${merchantId}:${phoneLast10}`)
    return null
  } catch {
    return NextResponse.json(
      { ok: false, error: 'You have already checked in recently. Please show your queue ticket at billing or try after 5 minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': '300' }
      }
    )
  }
}

/**
 * Apply per-IP + per-merchant rate limiting on POST /api/queue/web-checkin/scan-ping.
 */
export async function applyScanPingIpLimit(req: NextRequest, merchantId: string): Promise<NextResponse | null> {
  const ip = getClientIp(req)
  try {
    await scanPingIpLimiter.consume(`${ip}:${merchantId}`)
    return null
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Too many QR scan pings. Please wait a few minutes before retrying.' },
      {
        status: 429,
        headers: { 'Retry-After': '300' }
      }
    )
  }
}
