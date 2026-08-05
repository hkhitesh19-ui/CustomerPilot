import { NextResponse } from "next/server"
import { QueueWorker } from "@/communication/workers/QueueWorker"

export async function GET() {
  try {
    const processed = await QueueWorker.processBatch("standard_messages", 20)
    return NextResponse.json({ success: true, processed })
  } catch (error: any) {
    console.error("[API Worker] Failed:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
