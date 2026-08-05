const prompts = require('prompts');
const fs = require('fs');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');
const http = require('http');

console.log('======================================================');
console.log(' CUSTOMERPILOT - V20 ZERO TOUCH SETUP WIZARD');
console.log('======================================================');
console.log('This wizard will fully bootstrap your environment.');
console.log('Press Ctrl+C at any time to abort.\n');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function checkDocker() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

async function waitForEvolution() {
  let retries = 30;
  while (retries > 0) {
    try {
      const result = execSync('curl -s http://localhost:8080/server/health', { stdio: 'pipe' }).toString();
      if (result.includes('"status":"UP"') || result.includes('ok')) {
        return true;
      }
    } catch (e) {
      // ignore
    }
    await delay(2000);
    retries--;
  }
  return false;
}

async function generateEnv() {
  if (!await checkDocker()) {
    console.error('\x1b[31m[ERROR] Docker is not running. Please start Docker Desktop.\x1b[0m');
    process.exit(1);
  }

  let response = {};
  if (process.env.AUTO_SETUP) {
    console.log('[AUTO-SETUP] Bypassing interactive prompts...');
  } else {
    const questions = [
      {
        type: 'text',
        name: 'googlePlacesKey',
        message: 'Enter your Google Places API Key (AIzaSy...):',
        validate: value => value.length > 20 ? true : 'Please enter a valid Google API Key'
      },
      {
        type: 'text',
        name: 'geminiKey',
        message: 'Enter your Google Gemini API Key (AIzaSy...):',
        validate: value => value.length > 20 ? true : 'Please enter a valid Gemini API Key'
      },
      {
        type: 'text',
        name: 'razorpayKeyId',
        message: 'Enter your Razorpay Key ID (rzp_...):'
      },
      {
        type: 'password',
        name: 'razorpayKeySecret',
        message: 'Enter your Razorpay Key Secret:'
      }
    ];

    response = await prompts(questions, {
      onCancel: () => {
        console.log('Setup aborted.');
        process.exit(1);
      }
    });
  }

  console.log('\n[1/7] Generating secure credentials and .env file...');
  
  const nextAuthSecret = crypto.randomBytes(32).toString('base64');
  const evolutionGlobalKey = crypto.randomBytes(16).toString('hex');
  const evolutionWebhookSecret = crypto.randomBytes(16).toString('hex');

  let envTemplate = fs.readFileSync('.env.example', 'utf8');

  // Secrets
  envTemplate = envTemplate.replace(/NEXTAUTH_SECRET="wizard_will_generate_this"/g, `NEXTAUTH_SECRET="${nextAuthSecret}"`);
  envTemplate = envTemplate.replace(/EVOLUTION_GLOBAL_API_KEY="wizard_will_generate_this"/g, `EVOLUTION_GLOBAL_API_KEY="${evolutionGlobalKey}"`);
  envTemplate = envTemplate.replace(/EVOLUTION_WEBHOOK_SECRET="wizard_will_generate_this"/g, `EVOLUTION_WEBHOOK_SECRET="${evolutionWebhookSecret}"`);

  // Google & Gemini & Razorpay
  envTemplate = envTemplate.replace(/GOOGLE_PLACES_API_KEY=""/g, `GOOGLE_PLACES_API_KEY="${response.googlePlacesKey || ''}"`);
  envTemplate = envTemplate.replace(/GEMINI_API_KEY=""/g, `GEMINI_API_KEY="${response.geminiKey || ''}"`);
  envTemplate = envTemplate.replace(/RAZORPAY_KEY_ID=""/g, `RAZORPAY_KEY_ID="${response.razorpayKeyId || ''}"`);
  envTemplate = envTemplate.replace(/RAZORPAY_KEY_SECRET=""/g, `RAZORPAY_KEY_SECRET="${response.razorpayKeySecret || ''}"`);

  // SMTP (Resend auto-configured)
  envTemplate = envTemplate.replace(/SMTP_HOST=""/g, `SMTP_HOST="smtp.resend.com"`);
  envTemplate = envTemplate.replace(/SMTP_PORT="587"/g, `SMTP_PORT="587"`);
  envTemplate = envTemplate.replace(/SMTP_USER=""/g, `SMTP_USER="resend"`);
  envTemplate = envTemplate.replace(/SMTP_PASS=""/g, `SMTP_PASS=""`);
  envTemplate = envTemplate.replace(/SMTP_FROM="noreply@customerpilot.com"/g, `SMTP_FROM="noreply@customerpilot.com"`);

  fs.writeFileSync('.env', envTemplate);
  console.log('\x1b[32m  -> .env file created successfully.\x1b[0m');

  console.log('\n[2/7] Starting Docker Containers...');
  execSync('docker-compose up -d', { stdio: 'inherit' });

  console.log('\n[3/7] Waiting for containers to be healthy...');
  // Postgres check
  console.log('  -> Waiting for PostgreSQL...');
  let pgHealthy = false;
  for(let i=0; i<30; i++) {
    try {
      execSync('docker exec customerpilot-postgres pg_isready -U postgres', { stdio: 'ignore' });
      pgHealthy = true;
      break;
    } catch(e) {}
    await delay(2000);
  }
  if(!pgHealthy) {
    console.error('\x1b[31m[ERROR] PostgreSQL failed to become healthy.\x1b[0m');
    process.exit(1);
  }

  // Evolution check
  console.log('  -> Waiting for Evolution API...');
  const evHealthy = await waitForEvolution();
  if(!evHealthy) {
    console.warn('\x1b[33m[WARN] Evolution API health check timeout. Proceeding anyway...\x1b[0m');
  }

  console.log('\n[4/7] Running Database Migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/customerpilot" }});
  
  console.log('\n[5/7] Seeding Database...');
  try {
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/customerpilot" }});
  } catch (e) {
    console.log('\x1b[33m[WARN] Seeding skipped or failed (might already be seeded).\x1b[0m');
  }

  console.log('\n[6/7] Creating WhatsApp Instance...');
  try {
    const qrcode = require('qrcode-terminal');
    const createRes = execSync(`curl -s -X POST http://localhost:8080/instance/create -H "apikey: ${evolutionGlobalKey}" -H "Content-Type: application/json" -d '{"instanceName":"customerpilot", "qrcode":true}'`, { stdio: 'pipe' }).toString();
    const createData = JSON.parse(createRes);
    if(createData?.qrcode?.base64) {
      console.log('\n=============================================');
      console.log(' WhatsApp QR Code generated! Please scan it.');
      console.log('=============================================\n');
      // Evolution returns base64, to use qrcode-terminal we might need the raw code if provided, otherwise we wait.
      // Usually it's better to fetch /instance/connect
      const connectRes = execSync(`curl -s -X GET http://localhost:8080/instance/connect/customerpilot -H "apikey: ${evolutionGlobalKey}"`, { stdio: 'pipe' }).toString();
      const connectData = JSON.parse(connectRes);
      if(connectData?.code) {
        qrcode.generate(connectData.code, {small: true});
      } else {
        console.log('\x1b[33mQR Code not instantly available in text format. Check Evolution API logs.\x1b[0m');
      }
    }
  } catch (e) {
    console.log('\x1b[33m[WARN] Could not automatically create WhatsApp instance.\x1b[0m', e.message);
  }

  console.log('\n[7/7] Starting Next.js Dev Server...');
  const nextDev = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true });
  
  console.log('======================================================');
  console.log('\x1b[32mCustomerPilot successfully installed and running!\x1b[0m');
  console.log('Open http://localhost:3000 in your browser.');
  console.log('Run \x1b[36mnpm run doctor\x1b[0m in another terminal to verify API connections.');
  console.log('======================================================');

  // Attempt to open browser automatically
  setTimeout(() => {
    try {
      if (process.platform === 'win32') execSync('start http://localhost:3000');
      else if (process.platform === 'darwin') execSync('open http://localhost:3000');
      else execSync('xdg-open http://localhost:3000');
    } catch(e) {}
  }, 5000);
}

generateEnv().catch(console.error);
