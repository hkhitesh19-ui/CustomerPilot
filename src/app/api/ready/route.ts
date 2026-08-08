import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    await db.merchant.findFirst({ select: { id: true } })
    return NextResponse.json({ ready: true, timestamp: new Date().toISOString() }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ ready: false, error: e.message }, { status: 503 })
  }
}
