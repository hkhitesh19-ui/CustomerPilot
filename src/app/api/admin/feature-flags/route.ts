import { NextResponse } from "next/server"
import { getFeatureFlags, updateFeatureFlags } from "@/lib/feature-flags"

export async function GET() {
  return NextResponse.json({ success: true, flags: getFeatureFlags() })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const updated = updateFeatureFlags(body)
    return NextResponse.json({ success: true, flags: updated })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 })
  }
}
