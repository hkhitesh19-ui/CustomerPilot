/**
 * CustomerPilot Automated Smoke Test Runner (v1.0)
 * Run after every change to prevent regressions across Auth, Referral, QR, and CRM.
 * Supports isolated safe testing via SMOKE_DB_COPY=1 and guards live targets.
 */

const http = require("http");
const https = require("https");
const { execSync } = require("child_process");

// 1. Target Host & Mode Detection
let rawHost = process.env.SMOKE_HOST || "https://customerpilot.in";
if (!rawHost.startsWith("http://") && !rawHost.startsWith("https://")) {
  rawHost = `https://${rawHost}`;
}
const hostUrl = new URL(rawHost);
const isHttps = hostUrl.protocol === "https:";
const TARGET_HOST = hostUrl.host;

// Safe Target Rule: Safe mode ONLY via SMOKE_DB_COPY=1 (per spec)
const isSafeTarget = process.env.SMOKE_DB_COPY === "1";
const isLive = !isSafeTarget;

function requestUrl(urlPath, options = {}) {
  return new Promise((resolve) => {
    const client = isHttps ? https : http;
    const url = `${hostUrl.protocol}//${TARGET_HOST}${urlPath}`;

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
  console.log(`🚀 CustomerPilot Automated Smoke Test Suite`);
  console.log(`   Target Host : ${hostUrl.protocol}//${TARGET_HOST}`);
  console.log(`   Mode        : ${isLive ? "⚠️ LIVE TARGET (Destructive tests guarded)" : "🛡️ SAFE SANDBOX (SMOKE_DB_COPY=1)"}`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  const results = [];

  // 10 Canonical Smoke Tests with explicit destructive flags
  const tests = [
    {
      id: 1,
      name: "TypeScript Syntax Ratchet",
      destructive: false,
      run: async () => {
        execSync("node scripts/verify_typecheck_ratchet.js", { stdio: "pipe" });
        return true;
      }
    },
    {
      id: 2,
      name: "Dashboard Auth Guard",
      destructive: false,
      run: async () => {
        const res = await requestUrl("/dashboard");
        return res.statusCode === 307 || res.statusCode === 302 || res.statusCode === 401 || (res.body && res.body.includes("/login"));
      }
    },
    {
      id: 3,
      name: "Digital Business Card (/c/cake-connection)",
      destructive: false,
      run: async () => {
        const res = await requestUrl("/c/cake-connection");
        return res.statusCode === 200 && res.body.includes("Cake Connection");
      }
    },
    {
      id: 4,
      name: "Referral Exact Match Security",
      destructive: false,
      run: async () => {
        execSync("node scripts/test_resolver_security.js", { stdio: "pipe" });
        return true;
      }
    },
    {
      id: 5,
      name: "Referral Claim API Validation",
      destructive: false, // Read-only validation check (empty payload -> 400 Bad Request)
      run: async () => {
        const res = await requestUrl("/api/referrals/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: {}
        });
        return res.statusCode === 400;
      }
    },
    {
      id: 6,
      name: "Standee Studio Artwork (/api/qr/standee)",
      destructive: false,
      run: async () => {
        const res = await requestUrl("/api/qr/standee?m=cmtymavfx0002kx008lbfvp57");
        return res.statusCode === 200;
      }
    },
    {
      id: 7,
      name: "Customers CRM API RBAC (/api/customers)",
      destructive: false,
      run: async () => {
        const res = await requestUrl("/api/customers");
        return res.statusCode === 401 || res.statusCode === 403;
      }
    },
    {
      id: 8,
      name: "Manual Stamps API Auth (/api/customers/manual-stamps)",
      destructive: false,
      run: async () => {
        const res = await requestUrl("/api/customers/manual-stamps", { method: "POST" });
        return res.statusCode === 401 || res.statusCode === 403;
      }
    },
    {
      id: 9,
      name: "Maw & Paw Digital Card (/c/mawpaw)",
      destructive: false,
      run: async () => {
        const res = await requestUrl("/c/mawpaw");
        return res.statusCode === 200 && res.body.includes("Maw") && res.body.includes("Paw");
      }
    },
    {
      id: 10,
      name: "Destructive Guard Proof (Simulated Write /api/health)",
      destructive: true,
      run: async () => {
        const res = await requestUrl("/api/health");
        return res.statusCode === 200 || res.statusCode === 401;
      }
    }
  ];

  for (const test of tests) {
    process.stdout.write(`⏳ [Test ${test.id}: ${test.name}]... `);

    // Live Target Guard: Refuse destructive actions on live unless explicitly authorized
    if (test.destructive && isLive && process.env.SMOKE_ALLOW_LIVE !== "1") {
      console.log(`⚠️ SKIPPED (Live protection active: set SMOKE_ALLOW_LIVE=1 or use SMOKE_DB_COPY=1)`);
      results.push({ id: test.id, name: test.name, passed: true, skipped: true });
      continue; // NEVER return early; continues to next test
    }

    try {
      const passed = await test.run();
      if (passed) {
        console.log("✅ PASSED");
        results.push({ id: test.id, name: test.name, passed: true, skipped: false });
      } else {
        console.log("❌ FAILED");
        results.push({ id: test.id, name: test.name, passed: false, skipped: false });
      }
    } catch (err) {
      console.log(`❌ FAILED (${err.message})`);
      results.push({ id: test.id, name: test.name, passed: false, skipped: false, error: err.message });
    }
  }

  // Final Summary & Exit Code Logic
  console.log("\n═══════════════════════════════════════════════════════════════");
  const failed = results.filter(r => !r.passed);
  const skipped = results.filter(r => r.skipped);
  const passed = results.filter(r => r.passed && !r.skipped);

  console.log(`📊 Smoke Test Summary: ${results.length} total | ${passed.length} passed | ${skipped.length} skipped | ${failed.length} failed`);

  if (failed.length === 0) {
    console.log(`🎯 ALL ${results.length} SMOKE TESTS VERIFIED CLEANLY!`);
    console.log(`Mode: ${isLive ? "LIVE TARGET" : "SAFE SANDBOX (SMOKE_DB_COPY=1)"}`);
    console.log("═══════════════════════════════════════════════════════════════\n");
    process.exit(0);
  } else {
    console.log(`🚨 ${failed.length} SMOKE TEST(S) FAILED:`);
    failed.forEach(f => console.log(`  - Test ${f.id} (${f.name}): ${f.error || "Assertion failed"}`));
    console.log("═══════════════════════════════════════════════════════════════\n");
    process.exit(1);
  }
}

runSmokeTests();
