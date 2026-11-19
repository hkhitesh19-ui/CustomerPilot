#!/usr/bin/env node
/**
 * CustomerPilot Layer 5 Core Guard (Cross-Platform Node.js)
 * Protects the 4 critical production core files from unauthorized modification.
 * 
 * Usage:
 *   node guard/core-guard.js check
 *   ALLOW_CORE_CHANGE=1 node guard/core-guard.js update
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'guard', 'core.sha256');

const CORE_FILES = [
  'src/lib/queue-engine.ts',
  'src/components/dashboard/RewardModal.tsx',
  'src/app/api/webhook/evolution/route.ts',
  'src/app/api/rewards/award/route.ts'
];

function hashFile(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Core file not found: ${relPath}`);
  }
  const content = fs.readFileSync(fullPath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

const action = process.argv[2] || 'check';

if (action === 'update') {
  if (process.env.ALLOW_CORE_CHANGE !== '1') {
    console.error('🚨 [Core Guard] Update blocked. Set ALLOW_CORE_CHANGE=1 to approve changes to frozen core files.');
    process.exit(1);
  }
  const lines = CORE_FILES.map(f => `${hashFile(f)}  ${f.replace(/\\/g, '/')}`);
  fs.writeFileSync(MANIFEST, lines.join('\n') + '\n', 'utf8');
  console.log('✅ [Core Guard] Manifest guard/core.sha256 updated successfully with current hashes.');
  process.exit(0);
}

if (action === 'check') {
  if (process.env.ALLOW_CORE_CHANGE === '1') {
    console.log('⚠️ [Core Guard] ALLOW_CORE_CHANGE=1 detected: Bypassing frozen core check for approved change.');
    process.exit(0);
  }
  if (!fs.existsSync(MANIFEST)) {
    console.error(`🚨 [Core Guard] Manifest missing: ${MANIFEST}. Run 'ALLOW_CORE_CHANGE=1 node guard/core-guard.js update' first.`);
    process.exit(1);
  }
  const lines = fs.readFileSync(MANIFEST, 'utf8').split('\n').filter(Boolean);
  const expected = {};
  for (const l of lines) {
    const parts = l.trim().split(/\s+/);
    if (parts.length >= 2) {
      expected[parts[1].trim()] = parts[0].trim();
    }
  }

  let failed = false;
  for (const f of CORE_FILES) {
    const norm = f.replace(/\\/g, '/');
    const currentHash = hashFile(norm);
    const expHash = expected[norm];
    if (!expHash) {
      console.error(`🚨 [Core Guard] File ${norm} is not tracked in manifest!`);
      failed = true;
    } else if (currentHash !== expHash) {
      console.error(`🚨 [Core Guard] FROZEN CORE MODIFIED: ${norm}`);
      console.error(`   Expected: ${expHash}`);
      console.error(`   Actual:   ${currentHash}`);
      failed = true;
    }
  }

  if (failed) {
    console.error('\n❌ [Core Guard] COMMIT REJECTED: Frozen core files have been modified without approval.');
    console.error('To proceed with an approved change, set ALLOW_CORE_CHANGE=1 and update manifest.');
    process.exit(1);
  }

  console.log('🛡️ [Core Guard] All 4 frozen core files intact (SHA-256 verified).');
  process.exit(0);
}
