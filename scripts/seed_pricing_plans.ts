import path from "path";
import { PrismaClient } from "@prisma/client";
import { ensureMasterPlans } from "../src/lib/master-plans";

const absoluteDbPath = path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/");
process.env.DATABASE_URL = `file:${absoluteDbPath}`;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${absoluteDbPath}`
    }
  }
});

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
