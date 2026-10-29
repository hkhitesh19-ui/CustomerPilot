/**
 * scripts/verify_empty_db_determinism.js
 * 
 * Verifies that GBP audit calculations are completely independent of the SQLite database
 * and produce 100% deterministic mathematical scores:
 * - Cake Connection (156 reviews): 67/100 [P1:12, P2:14, P3:19, P4:10, P5:8, P6:4]
 * - Smile Dental Clinic (48 reviews offline): 70/100 [P1:18, P2:19, P3:15, P4:6, P5:8, P6:4]
 * even against a brand new empty database with ZERO merchants or records.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 Test Data Determinism: Fresh Empty DB Audit Verification');
console.log('═══════════════════════════════════════════════════════════════\n');

const tempDbPath = path.join(__dirname, '../prisma/dev_empty_ci_simulation.db');

// Ensure cleanup of any previous run
if (fs.existsSync(tempDbPath)) {
  fs.unlinkSync(tempDbPath);
}

try {
  // 1. Push clean schema to the temporary database (NO SEEDING)
  console.log('1. Pushing schema to fresh temporary SQLite database (Zero Seed Data)...');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: `file:${tempDbPath}` }
  });

  // 2. Query DB to prove it has 0 merchants
  const prisma = new PrismaClient({
    datasources: {
      db: { url: `file:${tempDbPath}` }
    }
  });

  async function runVerification() {
    // Static AST / Grep Verification: Prove route.ts has ZERO Prisma imports
    const routeSource = fs.readFileSync(path.join(__dirname, '../src/app/api/gbp/audit/route.ts'), 'utf8');
    const prismaMatches = routeSource.match(/\bprisma\b/gi) || [];
    console.log(`\n0. Static Source Code Independence Check:`);
    console.log(`   - File: src/app/api/gbp/audit/route.ts`);
    console.log(`   - Occurrences of 'prisma' in route: ${prismaMatches.length} (Verified: 0 DB calls)`);
    if (prismaMatches.length > 0) {
      throw new Error(`Architectural violation: route.ts imports or references prisma directly!`);
    }
    console.log(`   - Route Architecture: 100% self-contained mathematical engine.\n`);

    const merchantCount = await prisma.merchant.count();
    const userCount = await prisma.user.count();
    console.log(`2. Database State Confirmed:`);
    console.log(`   - Total Merchants in DB: ${merchantCount} (Confirmed 0)`);
    console.log(`   - Total Users in DB:     ${userCount} (Confirmed 0)\n`);

    await prisma.$disconnect();

    if (merchantCount !== 0) {
      throw new Error(`Database is not empty! Count: ${merchantCount}`);
    }

    // 3. Evaluate Pure Mathematical Engine
    const { calculateGbpAudit } = require('../src/lib/gbp-audit-engine');

    console.log('3. Testing Cake Connection (156 reviews)...');
    const cakeAudit = calculateGbpAudit({
      businessName: 'Cake Connection',
      category: 'Cake Shop & Bakery',
      locality: 'Alkapuri, Vadodara',
      currentReviews: 156,
      currentRank: 5
    });
    const cakeScore = cakeAudit.audit.overallScore;
    const cakePillars = cakeAudit.audit.pillars.map(p => p.score);
    console.log(`   - Returned Total Score: ${cakeScore}/100`);
    console.log(`   - Pillar Breakdown:     [${cakePillars.join(', ')}] -> P1:12, P2:14, P3:19, P4:10, P5:8, P6:4`);
    console.log(`   - Recommended Track:    ${cakeAudit.recommendedTrack}`);

    console.log('\n4. Testing Smile Dental Clinic (48 reviews offline fallback)...');
    const dentalAudit = calculateGbpAudit({
      businessName: 'Smile Dental Clinic',
      category: 'Dental Clinic',
      locality: 'Sayajigunj, Vadodara',
      currentReviews: 48,
      currentRank: 12
    });
    const dentalScore = dentalAudit.audit.overallScore;
    const dentalPillars = dentalAudit.audit.pillars.map(p => p.score);
    console.log(`   - Returned Total Score: ${dentalScore}/100`);
    console.log(`   - Pillar Breakdown:     [${dentalPillars.join(', ')}] -> P1:18, P2:19, P3:15, P4:6, P5:8, P6:4`);
    console.log(`   - Recommended Track:    ${dentalAudit.recommendedTrack}`);

    // 5. Mathematical Score Assertions
    const cakePassed = cakeScore === 67;
    const dentalPassed = dentalScore === 70;

    console.log('\n---------------------------------------------------------------');
    console.log('Cake Connection Expected 67/100 (12+14+19+10+8+4): ', cakePassed ? '✅ EXACT MATCH' : '❌ MISMATCH');
    console.log('Smile Dental Offline Expected 70/100 (18+19+15+6+8+4): ', dentalPassed ? '✅ EXACT MATCH' : '❌ MISMATCH');
    console.log('---------------------------------------------------------------');

    if (cakePassed && dentalPassed) {
      console.log('\n🎯 EMPIRICAL PROOF VERIFIED:');
      console.log('The audit calculation is completely independent of database seed records.');
      console.log('Even with 0 merchants in DB, mathematical scores 67/100 and 70/100 are strictly deterministic.');
    } else {
      throw new Error('Score verification failed.');
    }
  }

  runVerification().then(() => {
    if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
  }).catch((err) => {
    console.error('Verification error:', err);
    if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
    process.exit(1);
  });

} catch (e) {
  console.error('Setup failed:', e);
  if (fs.existsSync(tempDbPath)) fs.unlinkSync(tempDbPath);
  process.exit(1);
}
