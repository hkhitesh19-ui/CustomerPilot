const https = require('https');
const http = require('http');

const EVOLUTION_API_URL = 'http://200.97.170.53:8080';
const INSTANCE_NAME = '89554948-3b67-48c4-b98d-f7b56e021cc6';
const API_KEY = 'Evo_Api_Key_Secure_998877!';

function updateEvolutionWebhook(url) {
    const webhookUrl = `${url}/api/webhook/evolution`;
    const data = JSON.stringify({
        webhook: {
            url: webhookUrl,
            byEvents: false,
            events: [
                "APPLICATION_STARTUP",
                "MESSAGES_UPSERT",
                "MESSAGES_UPDATE",
                "MESSAGES_DELETE",
                "SEND_MESSAGE",
                "CONTACTS_SET",
                "CONTACTS_UPSERT",
                "CONTACTS_UPDATE",
                "PRESENCE_UPDATE",
                "CHATS_SET",
                "CHATS_UPSERT",
                "CHATS_UPDATE",
                "CHATS_DELETE",
                "GROUPS_UPSERT",
                "GROUP_UPDATE",
                "GROUP_PARTICIPANTS_UPDATE",
                "CONNECTION_UPDATE",
                "CALL",
                "TYPEBOT_START",
                "TYPEBOT_CHANGE_STATUS"
            ]
        }
    });

    const options = {
        hostname: '200.97.170.53',
        port: 8080,
        path: `/webhook/set/${INSTANCE_NAME}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': API_KEY,
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
            console.log('Response:', responseBody);
        });
    });

    req.write(data);
    req.end();
}

updateEvolutionWebhook("https://gpl-allowing-behalf-indicate.trycloudflare.com");
