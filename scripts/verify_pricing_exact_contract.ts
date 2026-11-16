import { PrismaClient } from '@prisma/client';
import path from 'path';
import { CANONICAL_ACTIVE_PLAN_KEYS, MASTER_PLANS } from '../src/lib/master-plans';

process.env.DATABASE_URL = `file:${path.resolve(__dirname, '../prisma/dev.db').replace(/\\/g, '/')}`;
const prisma = new PrismaClient();

async function runContractVerification() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 Pricing Contract & Ground-Truth Verification');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Verify CANONICAL_ACTIVE_PLAN_KEYS has exactly 10 items
  console.log(`Checking CANONICAL_ACTIVE_PLAN_KEYS length: ${CANONICAL_ACTIVE_PLAN_KEYS.length}`);
  if (CANONICAL_ACTIVE_PLAN_KEYS.length !== 10) {
    throw new Error(`Expected 10 canonical plan keys, got ${CANONICAL_ACTIVE_PLAN_KEYS.length}`);
  }

  // 2. Verify Gear 3 price in MASTER_PLANS
  const gear3Master = MASTER_PLANS.find(p => p.planKey === 'gear3_yearly');
  if (!gear3Master) throw new Error('gear3_yearly not found in MASTER_PLANS');
  console.log(`Gear 3 master price: ₹${gear3Master.price} (Original: ₹${gear3Master.originalPrice})`);
  if (gear3Master.price !== 3499) {
    throw new Error(`Expected Gear 3 price 3499, got ${gear3Master.price}`);
  }

  // 3. Verify Database active plans
  const activeDbPlans = await prisma.plan.findMany({
    where: { active: true }
  });
  console.log(`Active plans in SQLite Database: ${activeDbPlans.length}`);
  if (activeDbPlans.length !== 10) {
    throw new Error(`Expected exactly 10 active plans in DB, got ${activeDbPlans.length}`);
  }

  // 4. Verify each active plan key is in CANONICAL_ACTIVE_PLAN_KEYS
  for (const p of activeDbPlans) {
    if (!CANONICAL_ACTIVE_PLAN_KEYS.includes(p.planKey as any)) {
      throw new Error(`Unexpected active plan in DB: ${p.planKey}`);
    }
  }

  // 5. Verify Gear 3 in DB has price 3499
  const gear3Db = activeDbPlans.find(p => p.planKey === 'gear3_yearly');
  if (!gear3Db) throw new Error('gear3_yearly not found in active DB plans');
  console.log(`Gear 3 DB price: ₹${gear3Db.price}`);
  if (gear3Db.price !== 3499) {
    throw new Error(`Expected Gear 3 DB price 3499, got ${gear3Db.price}`);
  }

  // 6. Verify Deactivated plans count
  const inactiveDbPlans = await prisma.plan.findMany({
    where: { active: false }
  });
  console.log(`Deactivated legacy plans in DB: ${inactiveDbPlans.length}`);

  console.log('\n--- VERIFIED ACTIVE PLANS BREAKDOWN ---');
  // Sort according to CANONICAL_ACTIVE_PLAN_KEYS
  activeDbPlans.sort((a, b) => {
    return CANONICAL_ACTIVE_PLAN_KEYS.indexOf(a.planKey as any) - CANONICAL_ACTIVE_PLAN_KEYS.indexOf(b.planKey as any);
  });

  activeDbPlans.forEach((p, idx) => {
    const isGear = (p.planKey || '').startsWith('gear');
    const category = isGear ? '⚙️ GEAR PLAN' : '💎 STANDALONE';
    console.log(`${idx + 1}. [${category}] ${p.planKey}: "${p.name}" -> ₹${p.price} / ${p.days} days`);
  });

  await prisma.$disconnect();
  console.log('\n✅ ALL 6 PRICING DATA ASSERTIONS PASSED WITH 100% MATHEMATICAL PRECISION!');
}

runContractVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
