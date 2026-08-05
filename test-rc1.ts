import { runReliabilityTestSuite } from "./src/lib/reliability-harness"
import { runPerformanceBenchmark } from "./src/lib/performance-harness"
import { runCommercialGrowthAudit } from "./src/lib/growth-harness"

async function runTests() {
  console.log("=== V17 RC1 Independent Verification ===")
  
  console.log("\n--- Reliability Tests ---")
  const reliabilityResults = await runReliabilityTestSuite()
  console.log(JSON.stringify(reliabilityResults, null, 2))

  console.log("\n--- Performance Tests ---")
  const performanceResults = await runPerformanceBenchmark()
  console.log(JSON.stringify(performanceResults, null, 2))

  console.log("\n--- Growth & SEO Validation ---")
  const growthResults = await runCommercialGrowthAudit()
  console.log(JSON.stringify(growthResults, null, 2))
}

runTests().catch(console.error)
