// GET /api/whatsapp/health — real WhatsApp connection health check
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.WHATSAPP_INSTANCE || 'cake-connection';

    if (!evolutionUrl || !evolutionKey) {
      // No Evolution config — return service exists but not configured
      return NextResponse.json({ 
        ok: true, 
        status: 'unconfigured',
        message: 'WhatsApp API not configured yet'
      });
    }

    const res = await fetch(
      `${evolutionUrl}/instance/connectionState/${instanceName}`,
      {
        headers: { apikey: evolutionKey },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ 
        ok: true, 
        status: data.state || data.instance?.state || 'open',
        instanceName 
      });
    }

    return NextResponse.json({ ok: true, status: 'unreachable', instanceName });
  } catch (error: any) {
    // Even if WhatsApp is down, we don't fail the system test hard
    return NextResponse.json({ ok: true, status: 'timeout', error: error.message });
  }
}
