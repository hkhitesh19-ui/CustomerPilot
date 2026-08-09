require('dotenv').config();
const { spawn } = require('child_process');
const http = require('http');

const API_KEY = 'Evo_Api_Key_Secure_998877!';
const RENEWAL_INTERVAL = 55 * 60 * 1000; // 55 minutes

let currentPinggyProcess = null;

function fetchAllInstancesAndUpdate(url) {
    console.log(`[PinggySync] Updating instances with new URL: ${url}`);
    const options = {
        hostname: '200.97.170.53',
        port: 8080,
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
    const webhookUrl = url + '/api/webhook/evolution?secret=' + process.env.EVOLUTION_WEBHOOK_SECRET;
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
                hostname: '200.97.170.53',
                port: 8080,
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
        currentPinggyProcess.kill();
    }

    console.log('[PinggySync] Starting new Pinggy tunnel...');
    currentPinggyProcess = spawn('ssh', ['-p', '443', '-R0:localhost:3000', 'a.pinggy.io', '-o', 'StrictHostKeyChecking=no']);

    let urlFound = false;

    const handleOutput = (data) => {
        const output = data.toString();
        // Look for the specific pinggy-free.link URL
        const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.run\.pinggy-free\.link/);
        
        if (match && match[0] && !urlFound) {
            urlFound = true;
            const extractedUrl = match[0];
            console.log('[PinggySync] Found Pinggy URL:', extractedUrl);
            fetchAllInstancesAndUpdate(extractedUrl);
        }
    };

    currentPinggyProcess.stdout.on('data', handleOutput);
    currentPinggyProcess.stderr.on('data', handleOutput); // ssh often prints to stderr

    currentPinggyProcess.on('close', (code) => {
        console.log(`[PinggySync] Pinggy process exited with code ${code}`);
    });
}

// Start immediately
startPinggy();

// Renew every 55 minutes
setInterval(startPinggy, RENEWAL_INTERVAL);

console.log('[PinggySync] Daemon started. Will renew Pinggy every 55 minutes.');
