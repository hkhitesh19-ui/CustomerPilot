import { NextResponse } from "next/server"
import { runFullSystemSimulation } from "@/lib/simulation-runner"
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function requireSuperAdmin(): Promise<{ error: NextResponse } | null> {
  if (!process.env.JWT_SECRET) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    if (payload.role !== 'super_admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    return null;
  } catch {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
}

export async function POST() {
  const authError = await requireSuperAdmin();
  if (authError) return authError.error;
  try {
    const result = await runFullSystemSimulation()
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error("[Simulation Failed]", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
