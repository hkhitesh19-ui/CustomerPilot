/**
 * scripts/test_scoring_engine.js
 * 
 * Table-driven mathematical unit test for GBP 100-Point Audit Scoring Engine.
 * Directly imports and tests `calculateGbpAudit` from `src/lib/gbp-audit-engine.ts`.
 * 
 * Covers all boundary values:
 * - Review counts: 14 (sandbox risk), 15 (safe drip), 39, 40 (mid-tier), 49, 50, 51 (photo ratio flip), 99, 100 (high-volume)
 * - Category in Name: true vs false
 * - Keyword stuffing: clean vs stuffed
 * - Real Google Place Override: verifies 78 vs 70 when realPlace is passed vs offline fallback
 * 
 * Architectural Documentation:
 * - Pillar 5 (Voice Search & Hidden Attributes): Fixed at 8/15 (baseline for unconfigured attributes).
 * - Pillar 6 (GEO AI Citations): Fixed at 4/10 (baseline for zero structured third-party citations).
 */

const { calculateGbpAudit } = require('../src/lib/gbp-audit-engine');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📐 GBP Audit Scoring Engine: Table-Driven Boundary Unit Tests');
console.log('Target Module: src/lib/gbp-audit-engine.ts');
console.log('═══════════════════════════════════════════════════════════════\n');

const testTable = [
  {
    name: 'Boundary 1: Review 14 (Sandbox Critical Edge)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 14 },
    expected: { p1: 12, p2: 14, p3: 7, p4: 6, p5: 8, p6: 4, total: 51, isSandboxRisk: true, track: 'TRACK_A' }
  },
  {
    name: 'Boundary 2: Review 15 (Sandbox Cleared Threshold)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 15 },
    expected: { p1: 12, p2: 14, p3: 12, p4: 6, p5: 8, p6: 4, total: 56, isSandboxRisk: false, track: 'TRACK_A' } // rank defaults to 28 (>25)
  },
  {
    name: 'Boundary 3: Review 39 (Tier 1 Upper Bound)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 39 },
    expected: { p1: 12, p2: 14, p3: 12, p4: 6, p5: 8, p6: 4, total: 56, isSandboxRisk: false, track: 'TRACK_B' } // rank 12 <= 25
  },
  {
    name: 'Boundary 4: Review 40 (Tier 2 Step-Up)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 40 },
    expected: { p1: 12, p2: 14, p3: 15, p4: 6, p5: 8, p6: 4, total: 59, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 5: Review 49 (Photo Ratio Low Edge)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 49 },
    expected: { p1: 12, p2: 14, p3: 15, p4: 6, p5: 8, p6: 4, total: 59, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 6: Review 50 (Photo Ratio Boundary Edge)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 50 },
    expected: { p1: 12, p2: 14, p3: 15, p4: 6, p5: 8, p6: 4, total: 59, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 7: Review 51 (Photo Ratio Step-Up to 10 points)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 51 },
    expected: { p1: 12, p2: 14, p3: 15, p4: 10, p5: 8, p6: 4, total: 63, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 8: Review 99 (Tier 2 Upper Bound)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 99 },
    expected: { p1: 12, p2: 14, p3: 15, p4: 10, p5: 8, p6: 4, total: 63, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 9: Review 100 (Tier 3 Velocity Step-Up to 19 points)',
    params: { businessName: 'Fresh Bakes', category: 'Bakery', currentReviews: 100 },
    expected: { p1: 12, p2: 14, p3: 19, p4: 10, p5: 8, p6: 4, total: 67, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 10A: Offline Fallback with 48 Reviews (Deterministic: 70/100)',
    params: { businessName: 'Smile Dental Clinic', category: 'Dental Clinic', currentReviews: 48 },
    expected: { p1: 18, p2: 19, p3: 15, p4: 6, p5: 8, p6: 4, total: 70, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 10B: Live Google Place Injected with 156 Reviews (78/100 Parity)',
    params: {
      businessName: 'Smile Dental Clinic',
      category: 'Dental Clinic',
      currentReviews: 48,
      realPlace: { userRatingCount: 156, rating: 4.9 }
    },
    expected: { p1: 18, p2: 19, p3: 19, p4: 10, p5: 8, p6: 4, total: 78, isSandboxRisk: false, track: 'TRACK_B' }
  },
  {
    name: 'Boundary 11: Keyword Stuffed Penalization (Hyphen/Pipe spam: P2 drops to 8)',
    params: { businessName: 'Vadodara Bakery - Best Cakes - Midnight Delivery', category: 'Bakery', currentReviews: 80 },
    expected: { p1: 18, p2: 8, p3: 15, p4: 10, p5: 8, p6: 4, total: 63, isSandboxRisk: false, track: 'TRACK_B' }
  }
];

let allPassed = true;

testTable.forEach((tc, idx) => {
  const res = calculateGbpAudit(tc.params);
  const p1 = res.audit.pillars[0].score;
  const p2 = res.audit.pillars[1].score;
  const p3 = res.audit.pillars[2].score;
  const p4 = res.audit.pillars[3].score;
  const p5 = res.audit.pillars[4].score;
  const p6 = res.audit.pillars[5].score;
  const isSandboxRisk = res.audit.pillars[2].score === 7;

  const match = (
    p1 === tc.expected.p1 &&
    p2 === tc.expected.p2 &&
    p3 === tc.expected.p3 &&
    p4 === tc.expected.p4 &&
    p5 === tc.expected.p5 &&
    p6 === tc.expected.p6 &&
    res.audit.overallScore === tc.expected.total &&
    isSandboxRisk === tc.expected.isSandboxRisk &&
    res.recommendedTrack === tc.expected.track
  );

  console.log(`[Case ${idx + 1}] ${tc.name}:`, match ? '✅ PASS' : '❌ FAIL');
  console.log(`  Expected Total: ${tc.expected.total}/100 | Actual: ${res.audit.overallScore}/100 [P1:${p1}, P2:${p2}, P3:${p3}, P4:${p4}, P5:${p5}, P6:${p6}]`);
  console.log(`  Competitor Rows: ${res.competitors.length} (Expected: 4) | Track: ${res.recommendedTrack}`);
  console.log('---------------------------------------------------------------');
  if (!match || res.competitors.length !== 4) allPassed = false;
});

if (allPassed) {
  console.log('\n🎯 SUCCESS: All 12 mathematical boundary conditions strictly verified against pure gbp-audit-engine.ts!');
  process.exit(0);
} else {
  console.error('\n❌ FAILURE: Mathematical discrepancy in scoring engine.');
  process.exit(1);
}
