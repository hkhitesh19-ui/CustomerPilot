import { runFullSystemSimulation } from "./simulation-runner"

async function main() {
  console.log("=== Running CustomerPilot V13 Full SaaS Simulation ===")
  const res = await runFullSystemSimulation()
  console.log("Simulation Result:", JSON.stringify(res, null, 2))
}

main().catch(console.error)
