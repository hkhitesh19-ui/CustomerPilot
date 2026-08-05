import { runFullSystemSimulation } from "./src/lib/simulation-runner"

async function run() {
  const result = await runFullSystemSimulation()
  console.log(JSON.stringify(result, null, 2))
}

run().catch(console.error)
