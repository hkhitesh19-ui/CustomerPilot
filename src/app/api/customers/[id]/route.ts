import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMerchant } from "@/lib/api";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const merchant = await requireMerchant();
    const { id: customerId } = await params;

    if (!customerId) {
      return NextResponse.json({ ok: false, error: "Customer ID is required" }, { status: 400 });
    }

    const customer = await db.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer || customer.merchantId !== merchant.id) {
      return NextResponse.json({ ok: false, error: "Customer not found" }, { status: 404 });
    }

    // Cascade delete all associated records for clean testing reset
    await db.$transaction(async (tx) => {
      // 1. Stamps
      await tx.stamp.deleteMany({ where: { customerId } });

      // 2. Customer Stamp Cards
      await tx.customerStampCard.deleteMany({ where: { customerId } });

      // 3. Bills
      await tx.bill.deleteMany({ where: { customerId } });

      // 4. Waiting Customers (Queue entries)
      await tx.waitingCustomer.deleteMany({ where: { customerId } });

      // 5. Redemptions
      await tx.redemption.deleteMany({ where: { customerId } });

      // 6. Referrals
      await tx.referral.deleteMany({
        where: { OR: [{ referrerId: customerId }, { friendCustomerId: customerId }] }
      });

      // 7. Reviews
      await tx.review.deleteMany({ where: { customerId } });

      // 8. Fraud Alerts
      await tx.fraudAlert.deleteMany({ where: { customerId } });

      // 9. Achievements
      await tx.achievement.deleteMany({ where: { customerId } });

      // 10. WhatsApp Messages (by phone or customerId)
      if (customer.phone) {
        await tx.whatsAppMessage.deleteMany({
          where: {
            OR: [
              { customerId },
              { toPhone: customer.phone },
              { toPhone: `+${customer.phone}` },
              { toPhone: customer.phone.replace(/^91/, '') }
            ]
          }
        });
      }

      // 11. Delete Customer record
      await tx.customer.delete({ where: { id: customerId } });

      // Audit log
      await tx.auditLog.create({
        data: {
          merchantId: merchant.id,
          actorType: "SUPERADMIN",
          action: "CUSTOMER_DELETED",
          entity: "Customer",
          entityId: customerId,
          metadata: JSON.stringify({ name: customer.name, phone: customer.phone })
        }
      });
    });

    return NextResponse.json({
      ok: true,
      message: `Customer ${customer.name || customer.phone} and all associated data deleted successfully.`
    });
  } catch (error: any) {
    console.error("[Customer DELETE Error]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to delete customer" }, { status: 500 });
  }
}
