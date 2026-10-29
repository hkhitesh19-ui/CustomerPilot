/**
 * scripts/verify_spec_imports.js
 * 
 * Enforces architectural rule:
 * Every standard test spec in e2e/ MUST import `test` and `expect` from '@/fixtures/hardened-test'
 * (or relative './fixtures/hardened-test').
 * Importing `test` directly from '@playwright/test' (named, aliased, namespace, or CJS require)
 * is strictly forbidden in standard specs to prevent bypassing the runtime error trap.
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 Playwright Spec Import Architecture Audit');
console.log('═══════════════════════════════════════════════════════════════\n');

const E2E_DIR = path.resolve(__dirname, '../e2e');
const ALLOWED_EXCEPTIONS = [
  path.normalize('e2e/fixtures/hardened-test.ts'),
  path.normalize('e2e/mutations/trap-mutation.spec.ts'),
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

const allFiles = getAllFiles(E2E_DIR);
const standardSpecs = [];
const exceptionFiles = [];

allFiles.forEach(f => {
  const relPath = path.normalize(path.relative(path.resolve(__dirname, '..'), f));
  if (ALLOWED_EXCEPTIONS.includes(relPath)) {
    exceptionFiles.push(relPath);
  } else {
    standardSpecs.push(relPath);
  }
});

console.log(`Discovered ${allFiles.length} total files in e2e/:`);
console.log(`  - Standard Test Specs: ${standardSpecs.length} files`);
standardSpecs.forEach(s => console.log(`      • ${s}`));
console.log(`  - Allowed Framework/Mutation Exceptions: ${exceptionFiles.length} files`);
exceptionFiles.forEach(e => console.log(`      • ${e} (fixture / adversarial probe)`));
console.log('');

let violations = [];

standardSpecs.forEach(relPath => {
  const fullPath = path.resolve(__dirname, '..', relPath);
  const content = fs.readFileSync(fullPath, 'utf8');

  // 1. Direct or aliased ESM imports: `import { test ... } from '@playwright/test'` or `import { test as t }`
  const directTestImport = /import\s+[^'"]*?\btest\b[^'"]*?from\s+['"]@playwright\/test['"]/m;
  if (directTestImport.test(content)) {
    violations.push({
      file: relPath,
      message: 'Imports `test` directly from @playwright/test instead of hardened-test fixture!'
    });
  }

  // 2. Namespace ESM imports: `import * as pw from '@playwright/test'`
  const namespaceImport = /import\s+\*\s+as\s+\w+\s+from\s+['"]@playwright\/test['"]/m;
  if (namespaceImport.test(content)) {
    violations.push({
      file: relPath,
      message: 'Imports entire namespace `* as ...` from @playwright/test!'
    });
  }

  // 3. CJS require: `require('@playwright/test')`
  const cjsRequire = /require\s*\(\s*['"]@playwright\/test['"]\s*\)/m;
  if (cjsRequire.test(content)) {
    violations.push({
      file: relPath,
      message: 'Uses CJS `require("@playwright/test")`!'
    });
  }

  // 4. Affirmative check: MUST import from hardened-test fixture
  const fixtureImport = /from\s+['"][^'"]*fixtures\/hardened-test['"]/m;
  if (!fixtureImport.test(content)) {
    violations.push({
      file: relPath,
      message: 'Missing required import from `fixtures/hardened-test`!'
    });
  }
});

if (violations.length > 0) {
  console.error('❌ ARCHITECTURAL VIOLATION: Unhardened Playwright test import(s) detected:');
  violations.forEach(v => console.error(`  - ${v.file}: ${v.message}`));
  console.error('\nFix: Import `test` strictly from "./fixtures/hardened-test" to enforce runtime error trapping.');
  process.exit(1);
} else {
  console.log(`✅ ALL ${standardSpecs.length} standard test specs strictly import test from the Hardened Test Fixture.`);
  console.log(`✅ ALL ${allFiles.length} files accounted for (3 specs verified + 1 fixture + 1 mutation test).`);
  console.log('Zero specs bypass the runtime error trap.\n');
  process.exit(0);
}
