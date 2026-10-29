/**
 * scripts/copy_standalone_assets.js
 * 
 * In Next.js standalone build mode (output: 'standalone'), Next.js creates a minimal server
 * at .next/standalone/server.js. Next.js documentation mandates copying the static assets:
 * 1. .next/static -> .next/standalone/.next/static
 * 2. public       -> .next/standalone/public
 * 
 * This cross-platform script runs as a post-build step in package.json or CI.
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📦 Next.js Standalone Static Asset Synchronizer');
console.log('═══════════════════════════════════════════════════════════════\n');

const ROOT_DIR = path.resolve(__dirname, '..');
const STANDALONE_DIR = path.join(ROOT_DIR, '.next', 'standalone');

if (!fs.existsSync(STANDALONE_DIR)) {
  console.log('ℹ️ No .next/standalone directory found. Skipping static sync.');
  process.exit(0);
}

// 1. Copy .next/static -> .next/standalone/.next/static
const staticSrc = path.join(ROOT_DIR, '.next', 'static');
const staticDest = path.join(STANDALONE_DIR, '.next', 'static');

if (fs.existsSync(staticSrc)) {
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });
  fs.cpSync(staticSrc, staticDest, { recursive: true });
  console.log('✅ Synchronized: .next/static ➔ .next/standalone/.next/static');
} else {
  console.warn('⚠️ Warning: .next/static not found.');
}

// 2. Copy public -> .next/standalone/public
const publicSrc = path.join(ROOT_DIR, 'public');
const publicDest = path.join(STANDALONE_DIR, 'public');

if (fs.existsSync(publicSrc)) {
  fs.mkdirSync(publicDest, { recursive: true });
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log('✅ Synchronized: public/ ➔ .next/standalone/public');
} else {
  console.warn('⚠️ Warning: public/ directory not found.');
}

console.log('\n🚀 Next.js standalone bundle is ready for production execution via node .next/standalone/server.js\n');
process.exit(0);
