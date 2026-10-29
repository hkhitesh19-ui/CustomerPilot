import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getJwtSecret } from "@/lib/jwt-secret";
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: SuperAdmin access required' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()));
    if (payload.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized: SuperAdmin access required' }, { status: 401 });
    }

    const scriptPath = path.resolve(process.cwd(), 'scripts', 'sync_vps_db.py');
    console.log('[SYNC-VPS] Executing sync script:', scriptPath);

    const { stdout, stderr } = await execPromise(`python "${scriptPath}"`, {
      timeout: 45000,
      cwd: process.cwd()
    });

    console.log('[SYNC-VPS] Output:', stdout);
    if (stderr) console.warn('[SYNC-VPS] Stderr:', stderr);

    return NextResponse.json({
      success: true,
      message: 'Successfully synced production database from Hostinger VPS!',
      output: stdout
    });
  } catch (error: any) {
    console.error('[SYNC-VPS] Error running sync:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to sync database from VPS'
    }, { status: 500 });
  }
}
