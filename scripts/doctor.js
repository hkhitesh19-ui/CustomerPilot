const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const http = require('http');
const nodemailer = require('nodemailer');

console.log('======================================================');
console.log(' CUSTOMERPILOT - V22 REAL API & INFRASTRUCTURE DOCTOR');
console.log('======================================================');
console.log('Performing REAL LIVE SERVICE VALIDATIONS (Secrets masked)...');
console.log('------------------------------------------------------');

// Ensure .env is loaded
if (!fs.existsSync('.env')) {
  console.log('\x1b[31m[FAIL]\x1b[0m .env file is missing. Run npm run setup first.');
  process.exit(1);
}
require('dotenv').config();

let errors = 0;

function printPass(name, details = '') {
  console.log(`\x1b[32m[PASS]\x1b[0m ${name} ${details ? `(${details})` : ''}`);
}

function printFail(name, reason, fix) {
  console.log(`\x1b[31m[FAIL]\x1b[0m ${name}`);
  console.log(`       \x1b[31mReason:\x1b[0m ${reason}`);
  console.log(`       \x1b[33mFix:\x1b[0m ${fix}`);
  errors++;
}

function maskSecret(val) {
  if (!val) return '[EMPTY]';
  if (val.length <= 8) return '****';
  return val.slice(0, 4) + '...' + val.slice(-4);
}

async function checkPostgres() {
  try {
    execSync('docker exec customerpilot-postgres pg_isready -U postgres', { stdio: 'ignore' });
    printPass('PostgreSQL Database Container');
  } catch (e) {
    printFail('PostgreSQL Database Container', 'Docker container customerpilot-postgres not ready or Docker Desktop engine initializing', 'Ensure Docker Desktop app is open and running.');
  }
}

async function checkRedis() {
  try {
    execSync('docker exec customerpilot-redis redis-cli ping', { stdio: 'ignore' });
    printPass('Redis Cache Container');
  } catch (e) {
    printFail('Redis Cache Container', 'Docker container customerpilot-redis not ready', 'Ensure Docker Desktop app is open and running.');
  }
}

async function checkEvolution() {
  return new Promise((resolve) => {
    http.get('http://localhost:8080/server/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          printPass('Evolution API (WhatsApp Gateway)');
        } else {
          printFail('Evolution API (WhatsApp Gateway)', `Status ${res.statusCode}`, 'Check Evolution container status');
        }
        resolve();
      });
    }).on('error', (e) => {
      printFail('Evolution API (WhatsApp Gateway)', 'Connection refused on http://localhost:8080', 'Start containers with `docker-compose up -d`');
      resolve();
    });
  });
}

async function checkSMTP() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return printFail('SMTP (Resend)', 'Missing credentials', 'Provide SMTP settings in .env');

  const transporter = nodemailer.createTransport({
    host: host,
    port: parseInt(port || '587'),
    secure: parseInt(port || '587') === 465,
    auth: { user, pass }
  });

  try {
    await transporter.verify();
    printPass('SMTP (Resend Mail)', `Host: ${host}, User: ${user}`);
  } catch (e) {
    printFail('SMTP (Resend Mail)', e.message, 'Verify Resend API Key');
  }
}

async function checkGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return printFail('Groq AI API', 'GROQ_API_KEY missing in .env', 'Add GROQ_API_KEY to .env');

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Ping' }],
      max_tokens: 5
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          printPass('Groq AI API (llama-3.1-8b-instant)', `Key: ${maskSecret(apiKey)}`);
        } else {
          printFail('Groq AI API', `HTTP ${res.statusCode}: ${body.slice(0, 100)}`, 'Check Groq API key');
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      printFail('Groq AI API', e.message, 'Check network connection');
      resolve();
    });

    req.write(payload);
    req.end();
  });
}

async function checkGoogleOAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId) return printFail('Google OAuth Client ID', 'GOOGLE_CLIENT_ID missing in .env', 'Add GOOGLE_CLIENT_ID to .env');

  if (clientId.includes('apps.googleusercontent.com')) {
    printPass('Google OAuth Client ID', `ID: ${maskSecret(clientId)}`);
  } else {
    printFail('Google OAuth Client ID', 'Invalid Client ID format', 'Format must end with .apps.googleusercontent.com');
  }
}

async function checkGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return printFail('Google Gemini AI API', 'GEMINI_API_KEY missing in .env', 'Add GEMINI_API_KEY to .env');

  return new Promise((resolve) => {
    // Check model list first to find available models for this key
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models?key=${apiKey}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          printPass('Google Gemini AI API', `Key Verified (${maskSecret(apiKey)})`);
        } else {
          printFail('Google Gemini AI API', `HTTP ${res.statusCode}: ${body.slice(0, 100)}`, 'Check Google AI Studio Key');
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      printFail('Google Gemini AI API', e.message, 'Check network connection');
      resolve();
    });

    req.end();
  });
}

async function checkRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) return printFail('Razorpay Test API', 'Credentials missing in .env', 'Add RAZORPAY keys to .env');

  return new Promise((resolve) => {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const options = {
      hostname: 'api.razorpay.com',
      path: '/v1/customers?count=1',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          printPass('Razorpay Test API', `Key ID: ${maskSecret(keyId)}`);
        } else {
          printFail('Razorpay Test API', `HTTP ${res.statusCode}: ${body.slice(0, 100)}`, 'Check Razorpay Test API Key ID and Secret');
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      printFail('Razorpay Test API', e.message, 'Check network connection');
      resolve();
    });

    req.end();
  });
}

async function runAll() {
  await checkPostgres();
  await checkRedis();
  await checkEvolution();
  await checkSMTP();
  await checkGroq();
  await checkGemini();
  await checkGoogleOAuth();
  await checkRazorpay();

  console.log('------------------------------------------------------');
  if (errors === 0) {
    console.log('\x1b[32mALL TESTED SERVICES VERIFIED & RESPONDING IN PRODUCTION/TEST MODE!\x1b[0m');
  } else {
    console.log(`\x1b[33mVERIFICATION COMPLETED WITH ${errors} PENDING INFRASTRUCTURE/API ISSUE(S).\x1b[0m`);
  }
  console.log('======================================================');
}

runAll();
