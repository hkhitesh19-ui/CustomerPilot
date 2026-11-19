import paramiko
import os
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD") or "Nilsky@202627", timeout=30)

sftp = ssh.open_sftp()
with sftp.file('/tmp/trace_events.py', 'w') as f:
    f.write('''import sqlite3
import json

conn = sqlite3.connect('/var/www/CustomerPilot/prisma/dev.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

print("=== WAITING CUSTOMERS (last 5) ===")
for r in c.execute("SELECT * FROM WaitingCustomer ORDER BY scannedAt DESC LIMIT 5"):
    print(dict(r))

print("\\n=== CUSTOMERS (Customer Pilot & Ekta) ===")
for r in c.execute("SELECT id, name, phone, lifetimeStamps, referralCode, referredById, updatedAt FROM Customer WHERE phone IN ('919033304707', '919033456106')"):
    print(dict(r))

print("\\n=== BILLS (last 5) ===")
for r in c.execute("SELECT * FROM Bill ORDER BY createdAt DESC LIMIT 5"):
    print(dict(r))

print("\\n=== STAMPS (last 5) ===")
for r in c.execute("SELECT * FROM Stamp ORDER BY createdAt DESC LIMIT 5"):
    print(dict(r))

print("\\n=== WHATSAPP MESSAGES (last 10) ===")
for r in c.execute("SELECT * FROM WhatsAppMessage ORDER BY createdAt DESC LIMIT 10"):
    print(dict(r))

print("\\n=== EVOLUTION WEBHOOK / LOGS or recent logs ===")
''')
sftp.close()

stdin, stdout, stderr = ssh.exec_command("python3 /tmp/trace_events.py")
print(stdout.read().decode('utf-8', errors='replace'))
print(stderr.read().decode('utf-8', errors='replace'))
ssh.close()
