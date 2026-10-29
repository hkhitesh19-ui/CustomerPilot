/**
 * scripts/test_token_redaction.js
 * 
 * Unit test for token and secret redaction in hardened-test.ts.
 * Verifies Bearer tokens, raw JWTs, session cookies, query string tokens, and API keys.
 */

const { sanitizeSensitiveData } = require('../e2e/fixtures/hardened-test');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔒 Token & Secret Sanitization Unit Verification');
console.log('═══════════════════════════════════════════════════════════════\n');

const testCases = [
  {
    name: 'Bearer Authorization Token',
    input: 'Authorization: Bearer secret_live_token_abc123456789==',
    expectedPattern: /Bearer \[REDACTED_BEARER_TOKEN\]/
  },
  {
    name: 'Raw 3-Segment JWT Token',
    input: 'Token is eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c in header',
    expectedPattern: /Token is \[REDACTED_JWT\] in header/
  },
  {
    name: 'Session Cookie Header',
    input: 'Cookie: session_token=xyz987654321; auth_token=secret_pass_123;',
    expectedPattern: /session_token=\[REDACTED_COOKIE\].*auth_token=\[REDACTED_COOKIE\]/
  },
  {
    name: 'Query-String Sensitive Tokens',
    input: 'GET /api/auth/callback?access_token=secret_oauth_token_777&api_key=AIzaSyD-1234567890abcdef',
    expectedPattern: /access_token=\[REDACTED_QUERY_PARAM\]&api_key=\[REDACTED_SECRET\]/
  },
  {
    name: 'API Key and Secret Passwords in JSON',
    input: '{"apiKey": "AIzaSyD_SECRET_KEY_12345", "password": "super_secret_password_99"}',
    expectedPattern: /"apiKey"\s*:\s*"\[REDACTED_SECRET\]".*"password"\s*:\s*"\[REDACTED_SECRET\]"/
  }
];

let allPassed = true;

testCases.forEach((tc, idx) => {
  const sanitized = sanitizeSensitiveData(tc.input);
  const passed = tc.expectedPattern.test(sanitized);
  console.log(`[Case ${idx + 1}] ${tc.name}:`, passed ? '✅ PASS' : '❌ FAIL');
  console.log('  Input:    ', tc.input);
  console.log('  Sanitized:', sanitized);
  console.log('---------------------------------------------------------------');
  if (!passed) allPassed = false;
});

if (allPassed) {
  console.log('\n🎯 SUCCESS: All 5 sensitive token vectors redacted securely!');
  process.exit(0);
} else {
  console.error('\n❌ FAILURE: Redaction leak detected.');
  process.exit(1);
}
