import { notFound, redirect } from "next/navigation"
import { Metadata } from "next"
import { resolveQrBySlug } from "@/lib/qr-engine"
import { sanitizeDestinationUrl } from "@/lib/url-sanitizer"
import WhatsAppGroupRegistrationForm from "./registration-form"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const qrCode = await resolveQrBySlug(slug)
  const storeName = qrCode?.merchant?.name || "Official WhatsApp Community"
  return {
    title: `${storeName} · Join WhatsApp Community`,
    description: `Join the official WhatsApp community for ${storeName} to get secret member discounts and updates.`,
  }
}

export default async function WhatsAppGroupPage({ params }: PageProps) {
  const { slug } = await params
  if (!slug) notFound()

  const qrCode = await resolveQrBySlug(slug)
  if (!qrCode || !qrCode.isActive) {
    notFound()
  }

  // Fast Mode / Direct Mode: 0-second instant redirect, ZERO friction!
  if (qrCode.redirectMode === "DIRECT") {
    const isWa = qrCode.currentDest.toLowerCase().includes("whatsapp") || qrCode.slug.includes("whatsapp")
    const sanitized = sanitizeDestinationUrl(qrCode.currentDest, { requireWhatsApp: isWa })
    let targetUrl = (sanitized.isValid ? sanitized.cleanUrl : qrCode.currentDest).trim()
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`
    }
    redirect(targetUrl)
  }

  // Lead Capture Mode: Render VIP registration form
  return (
    <WhatsAppGroupRegistrationForm
      slug={slug}
      initialQrCode={{
        id: qrCode.id,
        slug: qrCode.slug,
        label: qrCode.label,
        currentDest: qrCode.currentDest,
        redirectMode: qrCode.redirectMode
      }}
      initialMerchant={{
        id: qrCode.merchant.id,
        name: qrCode.merchant.name,
        logoUrl: qrCode.merchant.logoUrl,
        category: (qrCode.merchant as any).category || "Local Business"
      }}
    />
  )
}
