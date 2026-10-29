/**
 * scripts/verify_typecheck_ratchet.js
 * 
 * Ratchet mechanism for TypeScript type safety across the entire application.
 * Prevents introduction of ANY new TypeScript errors.
 * As legacy errors are fixed, BASELINE_ERROR_LIMIT can be lowered.
 */
const { spawnSync } = require('child_process');

const BASELINE_ERROR_LIMIT = 36;

console.log('═══════════════════════════════════════════════════════════════');
console.log('🛡️ Full-App TypeScript Typecheck Ratchet Guard');
console.log(`🎯 Baseline Max Errors Allowed: ${BASELINE_ERROR_LIMIT}`);
console.log('═══════════════════════════════════════════════════════════════\n');

const result = spawnSync('npx', ['tsc', '--noEmit'], {
  encoding: 'utf-8',
  shell: true
});

const output = (result.stdout || '') + '\n' + (result.stderr || '');
const matches = output.match(/: error TS\d+:/g) || [];
const errorCount = matches.length;

console.log(`📊 Measured Full-App TypeScript Errors: ${errorCount}`);

if (errorCount > BASELINE_ERROR_LIMIT) {
  console.error(`❌ REGRESSION DETECTED: TypeScript errors (${errorCount}) exceeded baseline (${BASELINE_ERROR_LIMIT})!`);
  console.error(`New type errors were introduced into the repository. Fix them before merging.`);
  process.exit(1);
} else {
  console.log(`✅ TYPECHECK RATCHET PASSED: Error count (${errorCount}) is at or below baseline (${BASELINE_ERROR_LIMIT}).`);
  if (errorCount < BASELINE_ERROR_LIMIT) {
    console.log(`🎉 Improvements made! Current errors (${errorCount}) < baseline (${BASELINE_ERROR_LIMIT}). Consider ratcheting down!`);
  }
  process.exit(0);
}
