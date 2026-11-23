/**
 * CustomerPilot Automated Smoke Test Runner (v1.0)
 * Run after every change to prevent regressions across Auth, Referral, QR, and CRM.
 */

const http = require("http");
const https = require("https");
const { execSync } = require("child_process");

const TARGET_HOST = process.env.SMOKE_HOST || "customerpilot.in";

function requestUrl(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = !TARGET_HOST.includes("localhost") && !TARGET_HOST.includes("127.0.0.1");
    const client = isHttps ? https : http;
    const url = isHttps ? `https://${TARGET_HOST}${urlPath}` : `http://${TARGET_HOST}${urlPath}`;

    const reqOptions = {
      method: options.method || "GET",
      headers: {
        "User-Agent": "CustomerPilot-SmokeTester/1.0",
        ...(options.headers || {})
      },
      timeout: 10000
    };

    const req = client.request(url, reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on("error", (err) => resolve({ statusCode: 0, error: err.message }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ statusCode: 408, error: "Request Timeout" });
    });

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runSmokeTests() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`🚀 CustomerPilot Automated Smoke Test Suite — Target: ${TARGET_HOST}`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  const results = [];

  // Test 1: TypeScript Ratchet Guard
  process.stdout.write("⏳ [Test 1: TypeScript Ratchet Guard (Baseline <= 36)]... ");
  try {
    execSync("node scripts/verify_typecheck_ratchet.js", { stdio: "pipe" });
    console.log("✅ PASSED (0 new type regressions)");
    results.push({ id: 1, name: "TypeScript Syntax", passed: true });
  } catch (err) {
    console.log("❌ FAILED");
    results.push({ id: 1, name: "TypeScript Syntax", passed: false, error: err.message });
  }

  // Test 2: Auth Guard Redirect
  process.stdout.write("⏳ [Test 2: Dashboard Auth Guard (Redirect logged-out)]... ");
  const authRes = await requestUrl("/dashboard");
  if (authRes.statusCode === 307 || authRes.statusCode === 302 || authRes.statusCode === 401 || (authRes.body && authRes.body.includes("/login"))) {
    console.log(`✅ PASSED (HTTP ${authRes.statusCode} Guarded)`);
    results.push({ id: 2, name: "Auth Guard", passed: true });
  } else {
    console.log(`❌ FAILED (Unexpected status: ${authRes.statusCode})`);
    results.push({ id: 2, name: "Auth Guard", passed: false });
  }

  // Test 3: Public Digital Business Card
  process.stdout.write("⏳ [Test 3: Digital Business Card (/c/cake-connection)]... ");
  const cardRes = await requestUrl("/c/cake-connection");
  if (cardRes.statusCode === 200 && cardRes.body.includes("Cake Connection")) {
    console.log("✅ PASSED (HTTP 200 Live)");
    results.push({ id: 3, name: "Digital Card", passed: true });
  } else {
    console.log(`❌ FAILED (Status: ${cardRes.statusCode})`);
    results.push({ id: 3, name: "Digital Card", passed: false });
  }

  // Test 4: Referral Link VIP Banner
  process.stdout.write("⏳ [Test 4: Referral Link With Fallback (?ref=CP-4707)]... ");
  const refRes = await requestUrl("/c/cake-connection?ref=CP-4707");
  if (refRes.statusCode === 200 && (refRes.body.includes("VIP Invite") || refRes.body.includes("referral") || refRes.body.includes("Activate Pass"))) {
    console.log("✅ PASSED (HTTP 200 VIP Banner Rendered)");
    results.push({ id: 4, name: "Referral Link", passed: true });
  } else {
    console.log(`❌ FAILED (Banner missing or status: ${refRes.statusCode})`);
    results.push({ id: 4, name: "Referral Link", passed: false });
  }

  // Test 5: Referral Claim API Validation
  process.stdout.write("⏳ [Test 5: Referral Claim API Validation (Empty payload test)]... ");
  const claimRes = await requestUrl("/api/referrals/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {}
  });
  if (claimRes.statusCode === 400) {
    console.log("✅ PASSED (HTTP 400 Bad Request trapped cleanly)");
    results.push({ id: 5, name: "Referral Claim API", passed: true });
  } else {
    console.log(`❌ FAILED (Expected 400, got: ${claimRes.statusCode})`);
    results.push({ id: 5, name: "Referral Claim API", passed: false });
  }

  // Test 6: Standee Studio Dynamic QR Endpoint
  process.stdout.write("⏳ [Test 6: Standee Studio Artwork (/api/qr/standee)]... ");
  const standeeRes = await requestUrl("/api/qr/standee?m=cmtymavfx0002kx008lbfvp57");
  if (standeeRes.statusCode === 200) {
    console.log("✅ PASSED (HTTP 200 Standee Rendered)");
    results.push({ id: 6, name: "Standee Studio", passed: true });
  } else {
    console.log(`❌ FAILED (Status: ${standeeRes.statusCode})`);
    results.push({ id: 6, name: "Standee Studio", passed: false });
  }

  // Test 7: Customers CRM RBAC Protection
  process.stdout.write("⏳ [Test 7: Customers CRM API RBAC (/api/customers)]... ");
  const crmRes = await requestUrl("/api/customers");
  if (crmRes.statusCode === 401 || crmRes.statusCode === 403) {
    console.log(`✅ PASSED (HTTP ${crmRes.statusCode} Protected)`);
    results.push({ id: 7, name: "CRM RBAC", passed: true });
  } else {
    console.log(`❌ FAILED (Expected 401/403, got: ${crmRes.statusCode})`);
    results.push({ id: 7, name: "CRM RBAC", passed: false });
  }

  // Test 8: Manual Stamp Override API Protection
  process.stdout.write("⏳ [Test 8: Manual Stamps API Auth (/api/customers/manual-stamps)]... ");
  const manualRes = await requestUrl("/api/customers/manual-stamps", { method: "POST" });
  if (manualRes.statusCode === 401 || manualRes.statusCode === 403) {
    console.log(`✅ PASSED (HTTP ${manualRes.statusCode} Protected)`);
    results.push({ id: 8, name: "Manual Stamps Auth", passed: true });
  } else {
    console.log(`❌ FAILED (Expected 401/403, got: ${manualRes.statusCode})`);
    results.push({ id: 8, name: "Manual Stamps Auth", passed: false });
  }

  // Test 9: Maw & Paw Digital Business Card (/c/mawpaw)
  process.stdout.write("⏳ [Test 9: Maw & Paw Card & Socials (/c/mawpaw)]... ");
  const mawpawRes = await requestUrl("/c/mawpaw");
  if (mawpawRes.statusCode === 200 && mawpawRes.body.includes("Maw") && mawpawRes.body.includes("Paw")) {
    console.log("✅ PASSED (HTTP 200 Live)");
    results.push({ id: 9, name: "Maw & Paw Digital Card", passed: true });
  } else {
    console.log(`❌ FAILED (Status: ${mawpawRes.statusCode})`);
    results.push({ id: 9, name: "Maw & Paw Digital Card", passed: false });
  }

  console.log("\n═══════════════════════════════════════════════════════════════");
  const failed = results.filter(r => !r.passed);
  if (failed.length === 0) {
    console.log(`🎯 ALL ${results.length} SMOKE TESTS PASSED CLEANLY!`);
    console.log("Production state is healthy. No regressions detected.");
    console.log("═══════════════════════════════════════════════════════════════\n");
    process.exit(0);
  } else {
    console.log(`🚨 ${failed.length} SMOKE TEST(S) FAILED:`);
    failed.forEach(f => console.log(`  - Test ${f.id} (${f.name})`));
    console.log("═══════════════════════════════════════════════════════════════\n");
    process.exit(1);
  }
}

runSmokeTests();
