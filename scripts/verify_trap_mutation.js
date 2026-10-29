/**
 * scripts/verify_trap_mutation.js
 * 
 * Verifies all 6 failure vectors against the Hardened Error Trap:
 * 1. Console Error (console.error)
 * 2. Unhandled Server Crash (HTTP 500)
 * 3. Near-Miss Query Parameter Bypass (/api/auth/me?unauthorized_admin_probe=1)
 * 4. True Uncaught Page Crash (pageerror)
 * 5. Dropped/Aborted Network Request (requestfailed)
 * 6. Foreign Host SSRF/Origin Escape (https://untrusted-foreign-host.com/api/auth/me)
 */

const { spawnSync } = require('child_process');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 Hardened Trap Multi-Vector Mutation Verification (6 Vectors)');
console.log('Target: e2e/mutations/trap-mutation.spec.ts');
console.log('═══════════════════════════════════════════════════════════════\n');

// Run Playwright on the mutation suite
const result = spawnSync('npx', ['playwright', 'test', 'e2e/mutations/trap-mutation.spec.ts', '--reporter=list'], {
  encoding: 'utf-8',
  shell: true,
  env: { ...process.env, CI: '', RUN_MUTATIONS: 'true' }
});

const stdout = result.stdout || '';
const stderr = result.stderr || '';
const combinedOutput = stdout + '\n' + stderr;

console.log('--- RAW PLAYWRIGHT OUTPUT BEGIN ---');
console.log(combinedOutput);
console.log('--- RAW PLAYWRIGHT OUTPUT END ---\n');

// 1. Verify that Playwright returned non-zero exit code (FAILED)
if (result.status === 0) {
  console.error('❌ CRITICAL FAILURE: The mutation tests passed! The trap is broken!');
  process.exit(1);
}

// 2. Verify all 6 vectors were trapped with their specific failure strings
const trappedConsole = combinedOutput.includes('PROBE_MUTATION_CONSOLE_ERROR: Deliberate JavaScript Syntax/Runtime Simulation') || combinedOutput.includes('[Console Error]');
const trapped500 = combinedOutput.includes('[Network Failure] HTTP 500 on /api/gbp/audit');
const trappedNearMiss = combinedOutput.includes('[Network Failure] HTTP 401 on /api/auth/me?unauthorized_admin_probe=1');
const trappedPageError = combinedOutput.includes('PROBE_MUTATION_PAGEERROR: Unhandled runtime exception in window event loop') || combinedOutput.includes('[Page Crash]');
const trappedRequestFailed = combinedOutput.includes('[Request Failed]') && combinedOutput.includes('/api/telemetry/probe') && (combinedOutput.includes('ERR_FAILED') || combinedOutput.includes('failed'));
const trappedForeignOrigin = combinedOutput.includes('[Network Failure] HTTP 401 on https://untrusted-foreign-host.com/api/auth/me');
const trapHeaderFound = combinedOutput.includes('Hardened Autonomous QA Trap Caught');

console.log('Vector 1 (Console Error Trapped):', trappedConsole ? '✅ YES' : '❌ NO');
console.log('Vector 2 (HTTP 500 Crash Trapped):', trapped500 ? '✅ YES' : '❌ NO');
console.log('Vector 3 (Near-Miss 401 Query Trapped):', trappedNearMiss ? '✅ YES' : '❌ NO');
console.log('Vector 4 (Uncaught Page Crash Trapped):', trappedPageError ? '✅ YES' : '❌ NO');
console.log('Vector 5 (Request Failed / Dropped Trapped):', trappedRequestFailed ? '✅ YES' : '❌ NO');
console.log('Vector 6 (Foreign Origin 401 Trapped):', trappedForeignOrigin ? '✅ YES' : '❌ NO');
console.log('Trap Guard Header (Hardened Fixture Assertion Banner):', trapHeaderFound ? '✅ YES' : '❌ NO');

if (trappedConsole && trapped500 && trappedNearMiss && trappedPageError && trappedRequestFailed && trappedForeignOrigin && trapHeaderFound) {
  console.log('\n🎯 EMPIRICAL PROOF VERIFIED: All 6 failure modes were trapped by hardened-test.ts.');
  console.log('Exit Code != 0 was triggered, proving the safety net is active and ruthless.');
  process.exit(0);
} else {
  console.error('\n❌ Incomplete trap coverage detected.');
  process.exit(1);
}
