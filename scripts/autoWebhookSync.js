const fs = require('fs');
const path = require('path');
const http = require('http');

const logFilePath = path.join(__dirname, '..', 'cloudflared.log');
const logFilePath2 = path.join(__dirname, '..', 'cloudflared2.log'); 
const EVOLUTION_API_URL = 'http://200.97.170.53:8080';
const API_KEY = 'Evo_Api_Key_Secure_998877!';

let extractedUrl = null;

function waitForUrl() {
    let logContent = '';
    if (fs.existsSync(logFilePath)) logContent += fs.readFileSync(logFilePath, 'utf8');
    if (fs.existsSync(logFilePath2)) logContent += fs.readFileSync(logFilePath2, 'utf8');
    
    const match = logContent.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    
    if (match && match[0]) {
        extractedUrl = match[0];
        console.log('[Auto-Sync] Found Cloudflare URL:', extractedUrl);
        fetchAllInstancesAndUpdate(extractedUrl);
    } else {
        setTimeout(waitForUrl, 1000);
    }
}

function fetchAllInstancesAndUpdate(url) {
    const options = {
        hostname: '200.97.170.53',
        port: 8080,
        path: '/instance/fetchInstances',
        method: 'GET',
        headers: {
            'apikey': API_KEY
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    const instances = JSON.parse(responseBody);
                    console.log(`[Auto-Sync] Found ${instances.length} instances.`);
                    updateAllInstances(instances, url);
                } catch (e) {
                    console.error('[Auto-Sync] Failed to parse instances:', e);
                    process.exit(1);
                }
            } else {
                console.error('[Auto-Sync] Failed to fetch instances. Status:', res.statusCode);
                console.error('[Auto-Sync] Response:', responseBody);
                process.exit(1);
            }
        });
    });

    req.on('error', (error) => {
        console.error('[Auto-Sync] Error fetching instances:', error);
        process.exit(1);
    });

    req.end();
}

async function updateAllInstances(instances, url) {
    const webhookUrl = `${url}/api/webhook/evolution`;
    const data = JSON.stringify({
        webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            events: [
                "APPLICATION_STARTUP", "MESSAGES_UPSERT", "MESSAGES_UPDATE", "MESSAGES_DELETE", "SEND_MESSAGE",
                "CONTACTS_SET", "CONTACTS_UPSERT", "CONTACTS_UPDATE", "PRESENCE_UPDATE", "CHATS_SET",
                "CHATS_UPSERT", "CHATS_UPDATE", "CHATS_DELETE", "GROUPS_UPSERT", "GROUP_UPDATE",
                "GROUP_PARTICIPANTS_UPDATE", "CONNECTION_UPDATE", "CALL", "TYPEBOT_START", "TYPEBOT_CHANGE_STATUS"
            ]
        }
    });

    let successCount = 0;
    
    for (const instance of instances) {
        if (!instance.name) continue;
        console.log(`[Auto-Sync] Updating webhook for instance: ${instance.name}`);
        
        const success = await new Promise((resolve) => {
            const options = {
                hostname: '200.97.170.53',
                port: 8080,
                path: `/webhook/set/${instance.name}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': API_KEY,
                    'Content-Length': Buffer.byteLength(data)
                }
            };
            const req = http.request(options, (res) => {
                let responseBody = '';
                res.on('data', (chunk) => { responseBody += chunk; });
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(true);
                    } else {
                        console.error(`[Auto-Sync] Failed for ${instance.name}. Status: ${res.statusCode} Response: ${responseBody}`);
                        resolve(false);
                    }
                });
            });
            req.on('error', (error) => {
                console.error(`[Auto-Sync] Error for ${instance.name}:`, error.message);
                resolve(false);
            });
            req.write(data);
            req.end();
        });
        
        if (success) successCount++;
    }
    
    console.log(`[Auto-Sync] Finished updating. Successfully updated ${successCount} out of ${instances.length} instances.`);
    process.exit(0);
}

console.log('[Auto-Sync] Waiting for Cloudflare Tunnel URL...');
waitForUrl();
