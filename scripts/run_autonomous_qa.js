/**
 * scripts/run_autonomous_qa.js
 * 
 * Autonomous E2E Test & Self-Debug Runner for CustomerPilot
 * Executes Playwright tests with strict console/network error trapping.
 * Dumps structured diagnostics to scratch/qa_debug_trace.json on failure.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const targetArg = process.argv[2] || 'e2e';
const SCRATCH_DIR = path.join(__dirname, '../scratch');
const TRACE_FILE = path.join(SCRATCH_DIR, 'qa_debug_trace.json');

if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('🤖 CustomerPilot Autonomous QA & Self-Debug Engine');
console.log(`🎯 Target Test Suite: ${targetArg}`);
console.log('═══════════════════════════════════════════════════════════════\n');

const startTime = Date.now();
let exitCode = 0;

try {
  // Execute Playwright test
  const cmd = `npx playwright test ${targetArg} --reporter=list`;
  console.log(`Executing: ${cmd}\n`);
  
  execSync(cmd, {
    stdio: 'inherit',
    env: { ...process.env, CI: '' },
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const osEnv = `${process.platform} (${process.arch}), Node ${process.version}`;
  console.log(`\n✅ [Autonomous QA Passed] Test suite passed in ${durationSec}s.`);
  console.log(`📊 Environment: ${osEnv} | CI: ${process.env.CI ? 'Running in CI' : 'Local Development'}`);
  console.log('🔒 Zero unwhitelisted console errors, page crashes, or network failures.');
  
  // Clean up any stale failure trace
  if (fs.existsSync(TRACE_FILE)) {
    fs.unlinkSync(TRACE_FILE);
  }
  process.exit(0);

} catch (error) {
  exitCode = 1;
  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.error(`\n❌ [Autonomous QA FAILED] Test execution failed after ${durationSec}s.`);

  // Write structured failure trace for Antigravity Agent
  const failurePayload = {
    timestamp: new Date().toISOString(),
    targetSuite: targetArg,
    durationSeconds: durationSec,
    errorMessage: error.message || 'Playwright test execution failed',
    status: 'FAILED',
    instructionsForAgent: [
      '1. Read this failure trace carefully.',
      '2. Inspect the failed test and corresponding application source code.',
      '3. Fix the root cause (e.g. proxy whitelist, button disabled state, API status 200, or missing DOM selector).',
      '4. Re-run node scripts/run_autonomous_qa.js until Exit Code 0 is achieved.',
      '5. Do NOT present results to Admin until Exit Code 0 passes cleanly.'
    ]
  };

  try {
    fs.writeFileSync(TRACE_FILE, JSON.stringify(failurePayload, null, 2), 'utf-8');
    console.error(`📁 Structured debug trace saved to: ${TRACE_FILE}`);
  } catch (writeErr) {
    console.error('Failed to write debug trace:', writeErr.message);
  }

  process.exit(exitCode);
}
