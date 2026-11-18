/**
 * scripts/localCronRunner.js
 *
 * CustomerPilot + RankLocal AI™ Unified Production AutoPilot Scheduler (IST-Aware)
 * Runs continuously under PM2 (`customerpilot-cron`) with idempotent per-window execution locks:
 *
 * 1. Every 1 min             -> /api/cron/automations & /api/cron/google-reviews
 * 2. Daily 09:00 AM IST      -> /api/cron/gbp-daily-serp (Live Google Maps Keyword Rank Capture & Graph)
 * 3. Every Monday 09:30 IST  -> /api/cron/gbp-posts?mode=generate (4 Weekly Posts + WhatsApp Approval)
 * 4. Hourly 10:00-21:00 IST  -> /api/cron/gbp-posts?mode=publish (Auto-Publish Due Approved Posts to Google Maps)
 * 5. Every Sunday 11:00 IST  -> /api/cron/gbp-autopilot (Live 5x5 Geo-Grid & 30-Day Top-3 Checklist Sync)
 * 6. 1st of Month 09:15 IST  -> /api/cron/gbp-monthly-reports (Monthly 30-Day Audit Report)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

const PORT = parseInt(process.env.PORT || '3000', 10);
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// In-memory idempotency markers so each scheduled window fires cleanly once per date/hour/month
const lastRun = {
  dailySerpDate: null,      // "YYYY-MM-DD"
  mondayPostsDate: null,    // "YYYY-MM-DD"
  hourlyPublishKey: null,   // "YYYY-MM-DD-HH"
  sundayAutopilotDate: null,// "YYYY-MM-DD"
  monthlyReportMonth: null, // "YYYY-MM"
};

function getIstParts() {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return {
    dateStr: ist.toISOString().slice(0, 10), // YYYY-MM-DD
    monthStr: ist.toISOString().slice(0, 7), // YYYY-MM
    dayOfWeek: ist.getUTCDay(),              // 0=Sun, 1=Mon, ...
    dayOfMonth: ist.getUTCDate(),            // 1..31
    hour: ist.getUTCHours(),                 // 0..23
    minute: ist.getUTCMinutes(),             // 0..59
    iso: ist.toISOString().replace('Z', '+05:30'),
  };
}

function callLocalEndpoint(path, timeoutMs = 120000) {
  const options = {
    hostname: '127.0.0.1',
    port: PORT,
    path,
    method: 'GET',
    timeout: timeoutMs,
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (c) => (body += c));
    res.on('end', () => {
      console.log(
        `[RankLocal Cron] ${path} Response (${res.statusCode}):`,
        body.substring(0, 160)
      );
    });
  });

  req.on('timeout', () => {
    console.error(`[RankLocal Cron] Timeout triggering ${path} after ${timeoutMs}ms`);
    req.destroy();
  });

  req.on('error', (e) => {
    console.error(`[RankLocal Cron] Error triggering ${path}: ${e.message}`);
  });

  req.end();
}

async function updateDelay() {
  try {
    await prisma.merchant.updateMany({
      data: { googleReviewDelayMinutes: 5 },
    });
    console.log('[RankLocal Cron] Updated Merchant googleReviewDelayMinutes to 5 minutes.');
  } catch (e) {
    console.error('[RankLocal Cron] updateDelay warning:', e.message);
  }
}

function runTick() {
  const ist = getIstParts();

  // 1. Every 1 minute: Core WhatsApp Automations & Live Google Review Auto-Reply Polling
  console.log(`[RankLocal Cron] Tick at ${ist.iso} — triggering core crons...`);
  callLocalEndpoint('/api/cron/automations', 45000);
  callLocalEndpoint('/api/cron/google-reviews', 45000);

  // 2. Daily at 09:00 AM IST (catches up if process started after 9 AM on that day)
  if (ist.hour >= 9 && lastRun.dailySerpDate !== ist.dateStr) {
    lastRun.dailySerpDate = ist.dateStr;
    console.log(`[RankLocal Cron] ⏰ 09:00 AM IST Daily Keyword SERP Capture (${ist.dateStr})...`);
    callLocalEndpoint('/api/cron/gbp-daily-serp', 240000);
  }

  // 3. Every Monday at 09:30 AM IST: Generate 4 Weekly Posts + Dispatch WhatsApp Approval
  if (
    ist.dayOfWeek === 1 &&
    (ist.hour > 9 || (ist.hour === 9 && ist.minute >= 30)) &&
    lastRun.mondayPostsDate !== ist.dateStr
  ) {
    lastRun.mondayPostsDate = ist.dateStr;
    console.log(`[RankLocal Cron] 📅 Monday 09:30 AM IST 4-Post Generation + WhatsApp Approval (${ist.dateStr})...`);
    callLocalEndpoint('/api/cron/gbp-posts?mode=generate', 180000);
  }

  // 4. Hourly between 10:00 AM and 09:00 PM IST: Auto-Publish Due APPROVED Posts to Google Maps API
  const hourKey = `${ist.dateStr}-${String(ist.hour).padStart(2, '0')}`;
  if (ist.hour >= 10 && ist.hour <= 21 && lastRun.hourlyPublishKey !== hourKey) {
    lastRun.hourlyPublishKey = hourKey;
    console.log(`[RankLocal Cron] 🚀 Hourly Due Google Posts Auto-Publisher (${hourKey} IST)...`);
    callLocalEndpoint('/api/cron/gbp-posts?mode=publish', 180000);
  }

  // 5. Every Sunday at 11:00 AM IST: Weekly 5x5 Geo-Grid Refresh & 30-Day Top-3 Checklist Sync
  if (ist.dayOfWeek === 0 && ist.hour >= 11 && lastRun.sundayAutopilotDate !== ist.dateStr) {
    lastRun.sundayAutopilotDate = ist.dateStr;
    console.log(`[RankLocal Cron] 🗺️ Sunday 11:00 AM IST Weekly Geo-Grid & AutoPilot Sync (${ist.dateStr})...`);
    callLocalEndpoint('/api/cron/gbp-autopilot', 240000);
  }

  // 6. 1st of Month at 09:15 AM IST: Monthly 30-Day GBP Audit Report
  if (
    ist.dayOfMonth === 1 &&
    (ist.hour > 9 || (ist.hour === 9 && ist.minute >= 15)) &&
    lastRun.monthlyReportMonth !== ist.monthStr
  ) {
    lastRun.monthlyReportMonth = ist.monthStr;
    console.log(`[RankLocal Cron] 📊 Monthly 30-Day GBP Audit Reports (${ist.monthStr})...`);
    callLocalEndpoint('/api/cron/gbp-monthly-reports', 180000);
  }
}

async function main() {
  await updateDelay();
  runTick();
  setInterval(runTick, 60000);
  console.log('[RankLocal Cron] Unified AutoPilot Scheduler running (1-minute IST heartbeat).');
}

main();
