import { NextResponse } from "next/server"
import { runFullSystemSimulation } from "@/lib/simulation-runner"

export async function POST() {
  try {
    const result = await runFullSystemSimulation()
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("[Simulation Failed]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
