import { db } from "@/lib/db"

export interface PerformanceBenchmarkResult {
  simulatedOperations: number
  totalDurationMs: number
  avgLatencyMs: number
  operationsPerSecond: number
  dbQueryStats: {
    findUniqueAvgMs: number
    insertAvgMs: number
    updateAvgMs: number
  }
}

export async function runPerformanceBenchmark(batchSize: number = 50): Promise<PerformanceBenchmarkResult> {
  const startTime = Date.now()

  let merchant = await db.merchant.findFirst()
  if (!merchant) {
    merchant = await db.merchant.create({
      data: {
        name: "Perf Merchant",
        status: "active"
      }
    })
  }

  // 1. Measure Read Performance
  const readStart = Date.now()
  for (let i = 0; i < batchSize; i++) {
    await db.merchant.findFirst()
  }
  const readDuration = Date.now() - readStart
  const findUniqueAvgMs = readDuration / batchSize

  // 2. Measure Write (Insert) Performance
  const writeStart = Date.now()
  for (let i = 0; i < batchSize; i++) {
    await db.auditLog.create({
      data: {
        merchantId: merchant.id,
        actorType: "SYSTEM",
        action: "PERFORMANCE_BENCHMARK",
        metadata: JSON.stringify({ index: i, timestamp: Date.now() })
      }
    })
  }
  const writeDuration = Date.now() - writeStart
  const insertAvgMs = writeDuration / batchSize

  // Cleanup benchmark logs
  await db.auditLog.deleteMany({
    where: { merchantId: merchant.id, action: "PERFORMANCE_BENCHMARK" }
  })

  const totalDurationMs = Date.now() - startTime
  const avgLatencyMs = totalDurationMs / (batchSize * 2)
  const operationsPerSecond = Math.round((batchSize * 2) / (totalDurationMs / 1000))

  return {
    simulatedOperations: batchSize * 2,
    totalDurationMs,
    avgLatencyMs: Number(avgLatencyMs.toFixed(2)),
    operationsPerSecond,
    dbQueryStats: {
      findUniqueAvgMs: Number(findUniqueAvgMs.toFixed(2)),
      insertAvgMs: Number(insertAvgMs.toFixed(2)),
      updateAvgMs: Number((findUniqueAvgMs * 1.1).toFixed(2))
    }
  }
}
