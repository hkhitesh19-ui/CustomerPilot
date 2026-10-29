const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function updateDelay() {
  await prisma.merchant.updateMany({
    data: { googleReviewDelayMinutes: 5 }
  });
  console.log("Updated Merchant googleReviewDelayMinutes to 5 minutes.");
}

function triggerCron() {
  console.log(`[Local Cron Runner] Triggering Automations & Google Reviews Crons at ${new Date().toISOString()}...`);
  
  const endpoints = ['/api/cron/automations', '/api/cron/google-reviews'];

  endpoints.forEach(path => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log(`[Local Cron Runner] ${path} Response (${res.statusCode}):`, body.substring(0, 100));
      });
    });

    req.on('error', (e) => {
      console.error(`[Local Cron Runner] Error triggering ${path}: ${e.message}`);
    });

    req.end();
  });
}

async function main() {
  await updateDelay();
  
  // Trigger immediately
  triggerCron();
  
  // Then every 60 seconds
  setInterval(triggerCron, 60000);
  console.log("Local Cron Runner started. Polling every 1 minute.");
}

main();
