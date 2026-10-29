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

    if (customer.deletedAt) {
      return NextResponse.json({ ok: false, error: "Customer is already deleted" }, { status: 409 });
    }

    const now = new Date();

    // ─── Soft-delete: mark records with deletedAt timestamp ──────────────
    // We do NOT hard-delete data. This preserves audit trail and allows recovery.
    await db.$transaction(async (tx) => {
      // 1. Soft-delete all Stamps
      await tx.stamp.updateMany({
        where: { customerId, deletedAt: null },
        data: { deletedAt: now }
      });

      // 2. Soft-delete the Customer record itself
      await tx.customer.update({
        where: { id: customerId },
        data: {
          deletedAt: now,
          status: "DELETED",
          botState: "IDLE",
        }
      });

      // 3. Audit log — record who deleted and when
      await tx.auditLog.create({
        data: {
          merchantId: merchant.id,
          actorType: "STAFF",
          action: "CUSTOMER_SOFT_DELETED",
          entity: "Customer",
          entityId: customerId,
          metadata: JSON.stringify({
            name: customer.name,
            phone: customer.phone,
            deletedAt: now.toISOString(),
            reason: "Manual reset via dashboard"
          })
        }
      });
    });

    return NextResponse.json({
      ok: true,
      message: `Customer ${customer.name || customer.phone} has been soft-deleted. Data is preserved for audit trail.`
    });
  } catch (error: any) {
    console.error("[Customer DELETE Error]", error);
    return NextResponse.json({ ok: false, error: error.message || "Failed to delete customer" }, { status: 500 });
  }
}
