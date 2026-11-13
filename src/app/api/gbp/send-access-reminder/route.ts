import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, err } from "@/lib/api";
import { sendCentralWhatsAppMessage } from "@/lib/whatsapp-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const merchantId = body.merchantId;

    if (!merchantId) {
      return err("merchantId is required", 400);
    }

    const merchant = await db.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        whatsappPhone: true,
        city: true,
      }
    });

    if (!merchant) {
      return err("Merchant not found", 404);
    }

    const recipientPhone = (merchant.whatsappPhone || "917203824012").replace(/\D/g, "");
    const agencyEmail = "customerpilot1@gmail.com";

    const reminderText = 
`🌟 *Google Business Profile Manager Access Request* 🌟

Namaste *${merchant.name}* ji!

CustomerPilot RankLocal AI™ ko aapke Google Business Profile ka *Manager Access* chahiye taaki:
✅ Weekly 3x High-Ranking Google Posts auto-publish ho sakein
✅ Local 3-Pack SEO & Keyword optimization chal sake
✅ Customer photo reviews aur auto-replies automate ho sakein

*Simple 3 Steps to Grant Access:*
1️⃣ Google par search karein: *${merchant.name}*
2️⃣ 3 dots ⋮ (Menu) par click karein ➔ *Business Profile settings* ➔ *People and access*
3️⃣ *Add* par click karein aur Agency Email enter karein:
📧 *${agencyEmail}*
Role: *Manager* (Invite send karein)

Access grant karne ke baad dashboard me automatically "Verified" show ho jayega.

Dhanyawad,
*CustomerPilot AI Team*
📞 Support: +91 90333 04707`;

    // Dispatch WhatsApp via centralized WhatsApp service
    const dispatchResult = await sendCentralWhatsAppMessage({
      merchantId: merchant.id,
      toPhone: recipientPhone,
      text: reminderText,
      template: "GBP_MANAGER_ACCESS_REMINDER",
    });

    return ok({
      success: true,
      message: `Manager Access WhatsApp reminder sent to ${merchant.name} (+${recipientPhone})`,
      agencyEmail,
      recipientPhone,
      dispatchResult,
    });
  } catch (error: any) {
    console.error("[GBP Send Access Reminder Error]:", error);
    return err("Failed to dispatch WhatsApp reminder", 500, { details: error.message });
  }
}
