import { runCommercialGrowthAudit } from "./growth-harness"

async function main() {
  console.log("=== CustomerPilot V16 Growth & Search Authority Audit ===")
  const res = await runCommercialGrowthAudit()
  console.log("Growth Audit Results:", JSON.stringify(res, null, 2))
}

main().catch(console.error)
