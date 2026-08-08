// POST /api/seed — re-run the seed script from HTTP (idempotent).
import { NextRequest } from "next/server"
import { ok } from "@/lib/api"
import { execSync } from "child_process"

export async function POST(_req: NextRequest) {
  // SECURITY: Block in production — this route resets the entire database
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    execSync("npx tsx src/lib/seed.ts", {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 30000,
    })
    return ok({ reseeded: true })
  } catch (e: any) {
    return Response.json(
      { ok: false, error: e.message, stdout: e.stdout?.toString(), stderr: e.stderr?.toString() },
      { status: 500 }
    )
  }
}
