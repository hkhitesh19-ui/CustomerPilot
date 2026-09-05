require('dotenv').config();
const { spawn } = require('child_process');
const http = require('http');

const API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_URL = new URL(process.env.EVOLUTION_API_URL || 'http://localhost:8080');
const RENEWAL_INTERVAL = 55 * 60 * 1000; // 55 minutes

let currentPinggyProcess = null;

function fetchAllInstancesAndUpdate(url) {
    console.log(`[PinggySync] Updating instances with new URL: ${url}`);
    const options = {
        hostname: EVOLUTION_URL.hostname,
        port: EVOLUTION_URL.port || 80,
        path: '/instance/fetchInstances',
        method: 'GET',
        headers: { 'apikey': API_KEY }
    };
    http.request(options, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            try {
                const instances = JSON.parse(body);
                updateAllInstances(instances, url);
            } catch (e) {
                console.error('[PinggySync] Failed to parse instances:', e);
            }
        });
    }).end();
}

async function updateAllInstances(instances, url) {
    const webhookUrl = url + '/api/webhook/evolution?secret=' + 'cpilot_webhook_secret_change_in_prod_2026';
    const data = JSON.stringify({
        webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            events: [
                'APPLICATION_STARTUP', 'MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'MESSAGES_DELETE', 'SEND_MESSAGE',
                'CONTACTS_SET', 'CONTACTS_UPSERT', 'CONTACTS_UPDATE', 'PRESENCE_UPDATE', 'CHATS_SET',
                'CHATS_UPSERT', 'CHATS_UPDATE', 'CHATS_DELETE', 'GROUPS_UPSERT', 'GROUP_UPDATE',
                'GROUP_PARTICIPANTS_UPDATE', 'CONNECTION_UPDATE', 'CALL', 'TYPEBOT_START', 'TYPEBOT_CHANGE_STATUS'
            ]
        }
    });

    for (const instance of instances) {
        if (!instance.name) continue;
        await new Promise((resolve) => {
            const req = http.request({
                hostname: EVOLUTION_URL.hostname,
                port: EVOLUTION_URL.port || 80,
                path: '/webhook/set/' + instance.name,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY,
                    'Content-Length': Buffer.byteLength(data)
                }
            }, (res) => {
                let rbody = '';
                res.on('data', c => rbody += c);
                res.on('end', () => {
                    console.log(`[PinggySync] Updated ${instance.name} - Status: ${res.statusCode}`);
                    resolve();
                });
            });
            req.on('error', (err) => {
                console.error(`[PinggySync] Error updating ${instance.name}:`, err);
                resolve();
            });
            req.write(data);
            req.end();
        });
    }
}

function startPinggy() {
    if (currentPinggyProcess) {
        console.log('[PinggySync] Killing old Pinggy process...');
        const oldProc = currentPinggyProcess;
        oldProc.wasKilled = true;
        try { oldProc.kill(); } catch (_) {}
    }

    console.log('[PinggySync] Starting new Pinggy tunnel...');
    const proc = spawn('ssh', [
        '-p', '443',
        '-R0:localhost:3000',
        'a.pinggy.io',
        '-o', 'StrictHostKeyChecking=no',
        '-T'
    ]);
    currentPinggyProcess = proc;
    proc.wasKilled = false;

    let urlFound = false;

    const handleOutput = (data) => {
        const output = data.toString();
        // Look for the specific pinggy-free.link URL
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.run\.pinggy-free\.link/);
        
        if (match && match[0] && !urlFound) {
            urlFound = true;
            const extractedUrl = match[0];
            console.log('[PinggySync] Found Pinggy URL:', extractedUrl);

            // ── KEY FIX: Update NEXT_PUBLIC_APP_URL in .env.local & WHATSAPP_WEBHOOK_URL in .env ──
            try {
                const fs = require('fs');
                const path = require('path');
                const envPath = path.join(__dirname, '..', '.env.local');
                if (fs.existsSync(envPath)) {
                    let envContent = fs.readFileSync(envPath, 'utf8');
                    if (envContent.includes('NEXT_PUBLIC_APP_URL=')) {
                        envContent = envContent.replace(/NEXT_PUBLIC_APP_URL=.*/g, `NEXT_PUBLIC_APP_URL=${extractedUrl}`);
                    } else {
                        envContent += `\nNEXT_PUBLIC_APP_URL=${extractedUrl}`;
                    }
                    fs.writeFileSync(envPath, envContent, 'utf8');
                    console.log(`[PinggySync] ✅ Updated NEXT_PUBLIC_APP_URL=${extractedUrl} in .env.local`);
                }

                const rootEnvPath = path.join(__dirname, '..', '.env');
                if (fs.existsSync(rootEnvPath)) {
                    let rootEnv = fs.readFileSync(rootEnvPath, 'utf8');
                    rootEnv = rootEnv.replace(/WHATSAPP_WEBHOOK_URL=.*/g, `WHATSAPP_WEBHOOK_URL="${extractedUrl}/api/webhook/evolution"`);
                    fs.writeFileSync(rootEnvPath, rootEnv, 'utf8');
                    console.log(`[PinggySync] ✅ Updated WHATSAPP_WEBHOOK_URL=${extractedUrl}/api/webhook/evolution in .env`);
                }
            } catch (e) {
                console.error('[PinggySync] Failed to update env files:', e.message);
            }

            fetchAllInstancesAndUpdate(extractedUrl);
        }
    };

    proc.stdout.on('data', handleOutput);
    proc.stderr.on('data', handleOutput); // ssh often prints to stderr

    proc.on('close', (code) => {
        console.log(`[PinggySync] Pinggy process exited with code ${code}`);
        if (!proc.wasKilled) {
            console.log('[PinggySync] 🔄 Tunnel disconnected unexpectedly! Reconnecting in 5 seconds...');
            setTimeout(startPinggy, 5000);
        }
    });

    proc.on('error', (err) => {
        console.error('[PinggySync] Tunnel error:', err.message);
    });
}

// Start immediately
startPinggy();

// Renew every 55 minutes
setInterval(() => {
    console.log('[PinggySync] ⏰ Scheduled 55-minute renewal triggered...');
    startPinggy();
}, RENEWAL_INTERVAL);

console.log('[PinggySync] Daemon started. Will auto-reconnect on disconnect and renew every 55 minutes.');
