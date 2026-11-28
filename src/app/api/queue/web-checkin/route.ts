import { NextRequest } from "next/server"
import { ok, err } from "@/lib/api"
import {
  performWebCheckin,
  resolveMerchantForCheckin,
  buildWebCheckinWhatsappUrl,
  validateCheckinPhone,
} from "@/lib/web-checkin"
import {
  applyWebCheckinIpLimit,
  applyWebCheckinPhoneLimit,
} from "@/lib/rate-limiter"

/**
 * GET /api/queue/web-checkin?m=<merchantId>&slug=<slug>
 * Public endpoint returning store branding, active stamp rules, and direct fallback WA URL.
 */
export async function GET(req: NextRequest) {
  try {
    const merchantId = req.nextUrl.searchParams.get("m")
    const slug = req.nextUrl.searchParams.get("slug")
    const referralCode = req.nextUrl.searchParams.get("ref")

    const summary = await resolveMerchantForCheckin({ merchantId, slug })
    if (!summary) {
      return err("Store loyalty check-in page not found", 404)
    }

    const fallbackWhatsappUrl = buildWebCheckinWhatsappUrl({
      whatsappPhone: summary.whatsappPhone,
      displayName: summary.name,
      mode: "fallback_direct",
      referralCode,
    })

    return ok({
      ...summary,
      fallbackWhatsappUrl,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load check-in details"
    return err(message, 500)
  }
}

/**
 * POST /api/queue/web-checkin
 * Public endpoint: logs customer directly into WaitingCustomer (zero dependency on inbound WhatsApp decryption).
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Per-IP anti-flood guard before parsing/DB lookups
    const ipLimited = await applyWebCheckinIpLimit(req)
    if (ipLimited) return ipLimited

    const body = (await req.json().catch(() => null)) as {
      merchantId?: string
      slug?: string
      phone?: string
      name?: string
      scanSource?: string
      referralCode?: string
    } | null

    if (!body) {
      return err("Invalid JSON body", 400)
    }
    if (!body.merchantId && !body.slug) {
      return err("merchantId or slug is required", 400)
    }
    if (!body.phone) {
      return err("phone is required", 400)
    }

    // 2. Validate phone format and resolve verified merchant before throttling per-phone
    const phoneCheck = validateCheckinPhone(body.phone)
    if (!phoneCheck.ok) {
      return err(phoneCheck.error, 400)
    }

    const summary = await resolveMerchantForCheckin({
      merchantId: body.merchantId,
      slug: body.slug,
    })
    if (!summary) {
      return err("Store loyalty program not found.", 404)
    }
    if (!summary.isActive) {
      return err("Store loyalty check-in is temporarily paused.", 403)
    }

    // 3. Per-(merchantId, phone) throttling to prevent single-number spam & outbound WA abuse
    const phoneLimited = await applyWebCheckinPhoneLimit(summary.merchantId, phoneCheck.last10)
    if (phoneLimited) return phoneLimited

    const result = await performWebCheckin({
      merchantId: summary.merchantId,
      phone: body.phone,
      name: body.name,
      scanSource: body.scanSource,
      referralCode: body.referralCode,
    })

    if (!result.ok) {
      return err(result.error, result.status)
    }

    return ok(result.data)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to complete web check-in"
    return err(message, 500)
  }
}
