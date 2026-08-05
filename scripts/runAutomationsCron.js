/**
 * Background script to automatically run the CustomerPilot automations engine.
 * It triggers the /api/cron/automations endpoint every 60 seconds.
 */

const http = require('http');

console.log("🚀 CustomerPilot Auto-Cron Engine Started!");
console.log("Checking for automations (Reviews, Reports) every 60 seconds...");

const CRON_URL = "http://localhost:3000/api/cron/automations";

function runCron() {
  http.get(CRON_URL, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.success && (response.stats?.reviewsRequested > 0 || response.stats?.reportsSent > 0 || response.stats?.winbacksSent > 0)) {
           console.log(`[${new Date().toLocaleTimeString()}] ✅ Cron Action:`, response.stats);
        }
      } catch(e) {
        // silently fail on invalid json so we don't spam console
      }
    });
  }).on('error', (err) => {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Cron failed to connect:`, err.message);
  });
}

// Run immediately
runCron();

// Run every 60 seconds
setInterval(runCron, 60000);
