import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { ensureMasterPlans } from "../src/lib/master-plans";

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:../prisma/dev.db";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding canonical Master Plans into local SQLite DB...");
  const result = await ensureMasterPlans(prisma);
  console.log("ensureMasterPlans result:", result);

  const plans = await prisma.plan.findMany({
    where: { active: true },
    select: { planKey: true, name: true, price: true, days: true }
  });

  console.log("\n--- Active Plans in DB ---");
  for (const p of plans) {
    console.log(`[${p.planKey}] ${p.name} -> ₹${p.price} (${p.days}d)`);
  }
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
