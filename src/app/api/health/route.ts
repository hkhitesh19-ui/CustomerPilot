import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const startTime = Date.now()
    const dbCheck: any = await db.$queryRawUnsafe(`PRAGMA quick_check;`)
    const latency = Date.now() - startTime

    const isDbHealthy = Array.isArray(dbCheck) && dbCheck[0]?.quick_check === "ok"

    if (isDbHealthy) {
      return NextResponse.json({
        status: "UP",
        version: "RC-3.0",
        timestamp: new Date().toISOString(),
        database: {
          status: "HEALTHY",
          latencyMs: latency,
        },
      }, { status: 200 })
    } else {
      return NextResponse.json({
        status: "DEGRADED",
        version: "RC-3.0",
        timestamp: new Date().toISOString(),
        database: {
          status: "UNHEALTHY",
          error: "PRAGMA quick_check failed",
        },
      }, { status: 503 })
    }
  } catch (e: any) {
    return NextResponse.json({
      status: "DOWN",
      version: "RC-3.0",
      timestamp: new Date().toISOString(),
      error: e.message || "Health check failed",
    }, { status: 500 })
  }
}
