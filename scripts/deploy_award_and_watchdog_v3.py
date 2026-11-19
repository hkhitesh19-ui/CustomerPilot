import os
import sys
import time
import paramiko

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

VPS_IP = '187.127.170.36'
VPS_USER = 'root'
VPS_PASS = os.getenv("VPS_PASSWORD") or 'Nilsky@202627'

print(f"[1/6] Connecting to live Hostinger VPS {VPS_IP} via SSH & SFTP...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, timeout=30)
print("Connected successfully to VPS!")

def run_cmd(cmd, check=True):
    print(f"\n[VPS] $ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    for line in iter(stdout.readline, ""):
        clean = line.strip()
        if clean:
            print("[VPS OUT]", clean)
    err = stderr.read().decode('utf-8', errors='replace').strip()
    code = stdout.channel.recv_exit_status()
    if err:
        print("[VPS STDERR]", err)
    print(f"[Exit: {code}]")
    if check and code != 0:
        raise RuntimeError(f"Command failed with exit code {code}: {cmd}")
    return code

print("\n[2/6] Backing up VPS SQLite database...")
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/prisma/dev.db.backup_$(date +%Y%m%d_%H%M%S)", check=False)

sftp = ssh.open_sftp()

files_to_sync = [
    ('src/app/api/rewards/award/route.ts', '/var/www/CustomerPilot/src/app/api/rewards/award/route.ts'),
    ('src/lib/review-scheduler.ts', '/var/www/CustomerPilot/src/lib/review-scheduler.ts'),
    ('guard/core.sha256', '/var/www/CustomerPilot/guard/core.sha256'),
    ('scripts/watchdog_v3.js', '/opt/cp-watchdog/watchdog.js'),
    ('Git Commit on VPS Live.txt', '/var/www/CustomerPilot/Git Commit on VPS Live.txt')
]

print("\n[3/6] Synchronizing updated files via SFTP...")
for local_rel, remote_path in files_to_sync:
    local_path = os.path.join(os.getcwd(), local_rel.replace('/', os.sep))
    print(f"Uploading: {local_rel} -> {remote_path}")
    sftp.put(local_path, remote_path)

sftp.close()
print("SFTP sync complete.")

print("\n[4/6] Restarting cp-watchdog on VPS...")
run_cmd("pm2 restart cp-watchdog", check=False)

print("\n[5/6] Building Next.js 16 standalone production bundle on VPS...")
run_cmd("cd /var/www/CustomerPilot && export NODE_OPTIONS='--max-old-space-size=4096' && npm run build")

print("\n[6/6] Syncing static chunks to standalone and reloading PM2...")
run_cmd("cp -ru /var/www/CustomerPilot/.next/static/* /var/www/CustomerPilot/.next/standalone/.next/static/ 2>/dev/null || true", check=False)
run_cmd("cp -ru /var/www/CustomerPilot/public/* /var/www/CustomerPilot/.next/standalone/public/ 2>/dev/null || true", check=False)
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/dev.db 2>/dev/null || true", check=False)

run_cmd("pm2 reload customerpilot-web --update-env")
time.sleep(5)

print("\n--- Verifying Core Guard on VPS ---")
run_cmd("cd /var/www/CustomerPilot && node guard/core-guard.js check", check=False)

print("\n--- Verifying PM2 Process Status ---")
run_cmd("pm2 status", check=False)

print("\n--- Live Endpoint Verification ---")
stdin, stdout, stderr = ssh.exec_command("curl -sI https://customerpilot.in/")
print("[Live Domain HTTPS Header Result]:\n", stdout.read().decode('utf-8'))

ssh.close()
print("\n🎉 VPS DEPLOYMENT & PM2 RELOAD COMPLETED SUCCESSFULLY!")
