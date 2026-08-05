import sitemap from "@/app/sitemap"

export interface GrowthAuditResult {
  totalSitemapRoutes: number
  industryRoutesCount: number
  featureRoutesCount: number
  comparisonRoutesCount: number
  helpCenterAvailable: boolean
  programmaticCoverageScore: number
  logs: string[]
}

export async function runCommercialGrowthAudit(): Promise<GrowthAuditResult> {
  const auditLogs: string[] = []
  const entries = sitemap()

  const industryRoutes = entries.filter(e => e.url.includes("-loyalty"))
  const featureRoutes = entries.filter(e => e.url.includes("/features/"))
  const compareRoutes = entries.filter(e => e.url.includes("/compare/"))
  const helpRoute = entries.find(e => e.url.endsWith("/help"))

  auditLogs.push(`Total Programmatic Sitemap Routes: ${entries.length}`)
  auditLogs.push(`Industry Solutions (/bakery, /restaurant, /cafe, /salon): ${industryRoutes.length} pages.`)
  auditLogs.push(`Feature Deep-Dives (/whatsapp-stamp-card, /google-review-automation): ${featureRoutes.length} pages.`)
  auditLogs.push(`Comparison Matrix (/vs-traditional-pos): ${compareRoutes.length} pages.`)
  auditLogs.push(`Help Center & Documentation (/help): ${helpRoute ? "AVAILABLE" : "MISSING"}`)

  const programmaticCoverageScore = Math.min(100, Math.round((entries.length / 13) * 100))

  return {
    totalSitemapRoutes: entries.length,
    industryRoutesCount: industryRoutes.length,
    featureRoutesCount: featureRoutes.length,
    comparisonRoutesCount: compareRoutes.length,
    helpCenterAvailable: Boolean(helpRoute),
    programmaticCoverageScore,
    logs: auditLogs
  }
}
