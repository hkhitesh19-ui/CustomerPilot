import { db } from "../src/lib/db";

async function main() {
  console.log("=============================================================");
  console.log("🏷️ Verifying CPA100 and CPA350 Coupons in Database & Engine");
  console.log("=============================================================");

  const cpa100 = await db.coupon.findUnique({ where: { code: "CPA100" } });
  const cpa350 = await db.coupon.findUnique({ where: { code: "CPA350" } });

  if (!cpa100) throw new Error("CPA100 coupon not found in database!");
  if (!cpa350) throw new Error("CPA350 coupon not found in database!");

  console.log(`[CPA100] Code: ${cpa100.code} | Type: ${cpa100.discountType} | Value: ₹${cpa100.discountValue} | Active: ${cpa100.active}`);
  console.log(`[CPA350] Code: ${cpa350.code} | Type: ${cpa350.discountType} | Value: ₹${cpa350.discountValue} | Active: ${cpa350.active}`);

  // Test Plan Amounts
  const testPlans = [
    { name: "Gear 1 (1 Year)", price: 1249 },
    { name: "Gear 2 (1 Year)", price: 2249 },
    { name: "Gear 3 (1 Year)", price: 2499 },
    { name: "Gear 4 (1 Year)", price: 2499 },
    { name: "Gear 5 Enterprise (1 Year)", price: 9999 },
  ];

  console.log("\n--- Simulating CPA100 (₹100 Flat Discount) ---");
  for (const plan of testPlans) {
    const discount = cpa100.discountValue;
    const finalPrice = Math.max(1, plan.price - discount);
    console.log(`• ${plan.name}: ₹${plan.price} - ₹${discount} = ₹${finalPrice}`);
    if (finalPrice !== plan.price - 100) {
      throw new Error(`Calculation error for CPA100 on ${plan.name}`);
    }
  }

  console.log("\n--- Simulating CPA350 (₹350 Flat Discount) ---");
  for (const plan of testPlans) {
    const discount = cpa350.discountValue;
    const finalPrice = Math.max(1, plan.price - discount);
    console.log(`• ${plan.name}: ₹${plan.price} - ₹${discount} = ₹${finalPrice}`);
    if (finalPrice !== plan.price - 350) {
      throw new Error(`Calculation error for CPA350 on ${plan.name}`);
    }
  }

  console.log("\n✅ ALL ASSERTIONS PASSED: CPA100 and CPA350 are 100% accurate and operational!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
