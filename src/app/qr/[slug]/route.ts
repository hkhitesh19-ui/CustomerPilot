import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { resolveDigitalCardBySlug } from "@/lib/digital-card-service"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const cleanSlug = decodeURIComponent(String(slug || "")).toLowerCase().trim()

    if (!cleanSlug) {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // 1. Check if an active QrCode record exists with this slug
    const qrRecord = await db.qrCode.findFirst({
      where: { slug: cleanSlug, isActive: true },
    })

    if (qrRecord) {
      // Increment total scans in background
      await db.qrCode.update({
        where: { id: qrRecord.id },
        data: { totalScans: { increment: 1 } },
      }).catch(() => null)

      const dest = qrRecord.currentDest
      if (dest) {
        if (dest.startsWith("http://") || dest.startsWith("https://")) {
          return NextResponse.redirect(dest, 307)
        }
        if (dest.startsWith("/")) {
          return NextResponse.redirect(new URL(dest, req.url), 307)
        }
        return NextResponse.redirect(new URL(`/${dest}`, req.url), 307)
      }
    }

    // 2. Self-healing fallback: Check if a Digital Business Card exists
    const card = await resolveDigitalCardBySlug(cleanSlug)
    if (card) {
      return NextResponse.redirect(new URL(`/c/${card.slug}`, req.url), 307)
    }

    // 3. Fallback: Check if merchant exists
    const merchant = await db.merchant.findFirst({
      where: {
        OR: [
          { id: cleanSlug },
          { name: { contains: cleanSlug.replace(/-/g, " ") } },
        ],
      },
    })
    if (merchant) {
      return NextResponse.redirect(new URL(`/c/${cleanSlug}`, req.url), 307)
    }

    // If completely unknown, redirect to /c/[slug]
    return NextResponse.redirect(new URL(`/c/${cleanSlug}`, req.url), 307)
  } catch (error) {
    console.error("[QR_ROUTE_ERROR]", error)
    return NextResponse.redirect(new URL("/", req.url))
  }
}
