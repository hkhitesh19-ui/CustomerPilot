// Global cross-component & cross-tab merchant logo synchronization utility.
// Whenever a merchant uploads or removes their store logo on ANY standee or digital card,
// every other standee component & open tab updates immediately without needing a manual reload.

export type StandeeLogoSize = "l" | "xl" | "xxl"

const STORAGE_KEY = "cp_merchant_logo_sync_v1"
const EVENT_NAME = "cp:merchant-logo-updated"

export interface LogoSyncPayload {
  merchantId: string
  logoUrl: string | null
  updatedAt: number
}

export function broadcastMerchantLogoUpdate(merchantId: string | null | undefined, logoUrl: string | null) {
  if (typeof window === "undefined" || !merchantId) return
  const payload: LogoSyncPayload = {
    merchantId,
    logoUrl,
    updatedAt: Date.now(),
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage quota / private mode errors
  }
  try {
    window.dispatchEvent(new CustomEvent<LogoSyncPayload>(EVENT_NAME, { detail: payload }))
  } catch {
    // Ignore dispatch errors
  }
}

export function subscribeMerchantLogoUpdate(
  merchantId: string | null | undefined,
  onUpdate: (logoUrl: string | null, updatedAt: number) => void
): () => void {
  if (typeof window === "undefined" || !merchantId) return () => {}

  const handleCustom = (e: Event) => {
    const detail = (e as CustomEvent<LogoSyncPayload>).detail
    if (detail && detail.merchantId === merchantId) {
      onUpdate(detail.logoUrl, detail.updatedAt)
    }
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return
    try {
      const detail = JSON.parse(e.newValue) as LogoSyncPayload
      if (detail && detail.merchantId === merchantId) {
        onUpdate(detail.logoUrl, detail.updatedAt)
      }
    } catch {}
  }

  window.addEventListener(EVENT_NAME, handleCustom)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustom)
    window.removeEventListener("storage", handleStorage)
  }
}

export function getLatestSyncedLogo(merchantId: string | null | undefined): LogoSyncPayload | null {
  if (typeof window === "undefined" || !merchantId) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LogoSyncPayload
    if (parsed && parsed.merchantId === merchantId) return parsed
  } catch {}
  return null
}

/**
 * Helper to trigger an Ultra-HD Full Standee JPEG download from /api/qr/standee
 */
export async function downloadFullHdStandeeJpg(params: {
  merchantId: string
  design: "review" | "card" | "combo" | "master" | "google_review_v3" | "wa_booster" | "dynamic_qr"
  logoSize?: StandeeLogoSize
  fileName: string
  extraParams?: Record<string, string>
}): Promise<{ sizeMB: string }> {
  const qs = new URLSearchParams({
    design: params.design,
    m: params.merchantId,
    logoSize: params.logoSize || "xl",
    hd: "1",
    format: "print",
    _t: String(Date.now()),
  })
  if (params.extraParams) {
    for (const [k, v] of Object.entries(params.extraParams)) {
      if (v !== undefined && v !== null) qs.set(k, v)
    }
  }

  const res = await fetch(`/api/qr/standee?${qs.toString()}`, {
    headers: { "x-merchant-id": params.merchantId },
    cache: "no-store",
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "Failed to generate HD standee JPEG")
    throw new Error(errText || "Failed to generate HD standee JPEG")
  }

  const blob = await res.blob()
  const sizeMB = (blob.size / (1024 * 1024)).toFixed(2)
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = blobUrl
  link.download = params.fileName.endsWith(".jpg") ? params.fileName : `${params.fileName}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)

  return { sizeMB }
}
