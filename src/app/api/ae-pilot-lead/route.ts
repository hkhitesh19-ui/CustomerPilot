import { NextRequest, NextResponse } from "next/server";

interface AePilotLeadPayload {
  businessName: string;
  ownerName: string;
  workEmail: string;
  googleMapsLink?: string;
  city: "Dubai" | "Abu Dhabi" | "Other UAE";
  lead_ref: string;
  submitted_at: string;
}

const VALID_CITIES = new Set(["Dubai", "Abu Dhabi", "Other UAE"]);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Partial<AePilotLeadPayload> | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const businessName = (body.businessName || "").trim();
    const ownerName = (body.ownerName || "").trim();
    const workEmail = (body.workEmail || "").trim();
    const googleMapsLink = (body.googleMapsLink || "").trim();
    const city = (body.city || "").trim();
    const leadRef = (body.lead_ref || "direct").trim();
    const submittedAt = (body.submitted_at || new Date().toISOString()).trim();

    if (!businessName || !ownerName || !workEmail || !VALID_CITIES.has(city)) {
      return NextResponse.json(
        { ok: false, error: "Business Name, Owner/Manager Name, Work Email, and UAE City are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid work email address." }, { status: 400 });
    }

    const payload: AePilotLeadPayload = {
      businessName,
      ownerName,
      workEmail,
      googleMapsLink: googleMapsLink || undefined,
      city: city as AePilotLeadPayload["city"],
      lead_ref: leadRef,
      submitted_at: submittedAt,
    };

    const webhookUrl = process.env.AE_LEAD_WEBHOOK_URL?.trim();

    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) {
          console.warn(`[AE Pilot Lead] Webhook returned HTTP ${res.status}; falling back to server log.`);
          console.info("[AE Pilot Lead Fallback]", JSON.stringify(payload));
        } else {
          return NextResponse.json({ ok: true, mode: "webhook" });
        }
      } catch (webhookErr: unknown) {
        const message = webhookErr instanceof Error ? webhookErr.message : "Webhook request failed";
        console.warn(`[AE Pilot Lead] Webhook error (${message}); falling back to server log.`);
        console.info("[AE Pilot Lead Fallback]", JSON.stringify(payload));
      }
    } else {
      console.info("[AE Pilot Lead Fallback - No AE_LEAD_WEBHOOK_URL set]", JSON.stringify(payload));
    }

    return NextResponse.json({ ok: true, mode: "fallback_log" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit pilot request";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
