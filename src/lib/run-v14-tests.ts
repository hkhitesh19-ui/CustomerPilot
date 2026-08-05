import { runReliabilityTestSuite } from "./reliability-harness"
import { runPerformanceBenchmark } from "./performance-harness"

async function main() {
  console.log("=== CustomerPilot V14 Production Hardening Harness ===")

  console.log("\n1. Running Reliability & Resilience Tests...")
  const relRes = await runReliabilityTestSuite()
  console.log("Reliability Test Results:", JSON.stringify(relRes, null, 2))

  console.log("\n2. Running Performance & Load Benchmarks...")
  const perfRes = await runPerformanceBenchmark(50)
  console.log("Performance Benchmark Results:", JSON.stringify(perfRes, null, 2))
}

main().catch(console.error)
