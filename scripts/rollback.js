const { execSync } = require('child_process');

console.log('======================================================');
console.log(' CUSTOMERPILOT - V20 ROLLBACK VALIDATION');
console.log('======================================================');

try {
  console.log('1. Attempting Database Reset (dropping schema)...');
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  console.log('\x1b[32m[PASS] Database Reset Successful.\x1b[0m');

  console.log('2. Attempting Docker Re-creation...');
  execSync('docker-compose down -v', { stdio: 'inherit' });
  execSync('docker-compose up -d', { stdio: 'inherit' });
  console.log('\x1b[32m[PASS] Docker Volumes Recreated Successfully.\x1b[0m');

} catch (e) {
  console.error('\x1b[31m[FAIL] Rollback Validation Failed.\x1b[0m', e.message);
  process.exit(1);
}
