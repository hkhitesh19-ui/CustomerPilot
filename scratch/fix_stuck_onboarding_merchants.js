/**
 * Emergency Remediation Script
 * Finds all merchants stuck in onboarding (onboardingCompleted = false)
 * and fast-tracks them to Reviews mode.
 * Run with: node scratch/fix_stuck_onboarding_merchants.js
 */
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  console.log('🔍 Finding merchants stuck in onboarding...\n');

  const stuckMerchants = await db.merchant.findMany({
    where: { onboardingCompleted: false },
    orderBy: { createdAt: 'desc' },
  });

  if (stuckMerchants.length === 0) {
    console.log('✅ No merchants stuck in onboarding. All good!');
    return;
  }

  console.log(`Found ${stuckMerchants.length} merchant(s):\n`);
  stuckMerchants.forEach(m => {
    console.log(`  - ${m.email} | Step: ${m.currentStep} | Modules: ${m.enabledModules} | ID: ${m.merchantIdNumber || 'N/A'}`);
  });

  console.log('\n🚀 Fast-tracking all stuck merchants to Reviews mode...\n');

  for (const m of stuckMerchants) {
    await db.merchant.update({
      where: { id: m.id },
      data: {
        onboardingCompleted: true,
        currentStep: 99,
        enabledModules: 'REVIEWS',
      },
    });

    const updated = await db.onboardingStep.updateMany({
      where: { merchantId: m.id },
      data: { completed: true },
    });

    console.log(`  ✅ Fixed: ${m.email} (${updated.count} onboarding steps marked complete)`);
  }

  console.log('\n✅ All done! Merchants will now land on /dashboard/reviews on next login/refresh.');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
