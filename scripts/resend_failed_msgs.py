import paramiko
import os
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD") or "Nilsky@202627", timeout=30)

sftp = ssh.open_sftp()
with sftp.file('/tmp/resend_failed.py', 'w') as f:
    f.write('''import requests
import sqlite3
import json

conn = sqlite3.connect('/var/www/CustomerPilot/prisma/dev.db')
c = conn.cursor()

# Get all failed messages from tonight
rows = c.execute("SELECT id, toPhone, body, template FROM WhatsAppMessage WHERE status = 'failed' ORDER BY createdAt DESC LIMIT 5").fetchall()

headers = {
    'Content-Type': 'application/json',
    'apikey': '4e986a3b3252b3128a76663959fd835e45ec8bd41215dd5f6f4dd7fa7632b386'
}

for msg_id, phone, body, tmpl in rows:
    payload = {
        'number': phone,
        'text': body,
        'linkPreview': False
    }
    url = 'http://187.127.170.36:8080/message/sendText/CP_917203824012_cmtymavf_mw0whjx7'
    r = requests.post(url, json=payload, headers=headers)
    print(f'Sending [{tmpl}] to {phone}: status {r.status_code}, response: {r.text[:120]}')
    if r.status_code in [200, 201]:
        c.execute("UPDATE WhatsAppMessage SET status='sent', errorMessage=NULL, sentAt=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?", (msg_id,))
        conn.commit()
        print(f'Updated message {msg_id} to sent')
''')
sftp.close()

stdin, stdout, stderr = ssh.exec_command("python3 /tmp/resend_failed.py")
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
ssh.close()
