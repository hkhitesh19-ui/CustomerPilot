import { runSeoAndAeoAudit } from "./seo-harness"

async function main() {
  console.log("=== CustomerPilot V15 Technical SEO & AI Search Audit ===")
  const res = await runSeoAndAeoAudit()
  console.log("SEO Audit Results:", JSON.stringify(res, null, 2))
}

main().catch(console.error)
