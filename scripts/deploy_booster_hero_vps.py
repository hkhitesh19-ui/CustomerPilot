import os
import sys
import time
import json
import paramiko

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

VPS_IP = '187.127.170.36'
VPS_USER = 'root'
VPS_PASS = os.getenv("VPS_PASSWORD") or 'Nilsky@202627'

print(f"Connecting to live Hostinger VPS {VPS_IP} via SFTP & SSH...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, timeout=30)
print("Connected successfully!")

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

sftp = ssh.open_sftp()

files_to_sync = [
    'src/app/dashboard/WAGroupBooster/page.tsx',
    'src/app/dashboard/WAGroupBoosterPro/page.tsx',
    'public/wa_booster_bigger_logo_comparison.png',
    'public/wa_booster_full_dashboard_preview.png',
    'public/wa_booster_standee_hero_card.png',
    'public/wa_booster_standee_large_card.png',
    'RESOLVED_ISSUES_LOG.md',
    'Git Commit on VPS Live.txt'
]

print("\n--- Synchronizing WhatsApp Booster & Documentation Files to VPS via SFTP ---")
for rel_path in files_to_sync:
    local_path = os.path.join(os.getcwd(), rel_path.replace('/', os.sep))
    if not os.path.exists(local_path):
        print(f"Skipping non-existent local file: {local_path}")
        continue
    remote_path = f"/var/www/CustomerPilot/{rel_path}"
    remote_dir = os.path.dirname(remote_path)
    
    try:
        sftp.stat(remote_dir)
    except:
        run_cmd(f"mkdir -p {remote_dir}", check=False)
        
    print(f"Uploading: {rel_path} -> {remote_path}")
    sftp.put(local_path, remote_path)

sftp.close()
print("SFTP upload complete!")

print("\n--- Verifying Upload on VPS ---")
run_cmd("grep -n 'Hero X-Large' /var/www/CustomerPilot/src/app/dashboard/WAGroupBooster/page.tsx")

print("\n--- Running Next.js Production Build on VPS ---")
run_cmd("cd /var/www/CustomerPilot && export NODE_OPTIONS='--max-old-space-size=4096' && npm run build")

print("\n--- Syncing Static Assets & Standalone Public Directory on VPS ---")
run_cmd("cp -r /var/www/CustomerPilot/.next/static /var/www/CustomerPilot/.next/standalone/.next/static 2>/dev/null || true", check=False)
run_cmd("cp -r /var/www/CustomerPilot/public /var/www/CustomerPilot/.next/standalone/public 2>/dev/null || true", check=False)
run_cmd("mkdir -p /var/www/CustomerPilot/.next/standalone/prisma", check=False)
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/dev.db 2>/dev/null || true", check=False)
run_cmd("mkdir -p /var/www/CustomerPilot/.next/standalone/prisma/prisma", check=False)
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/prisma/dev.db 2>/dev/null || true", check=False)

print("\n--- Reloading PM2 Services on VPS ---")
run_cmd("pm2 reload customerpilot-web --update-env")
run_cmd("pm2 restart customerpilot-cron --update-env", check=False)
time.sleep(4)

print("\n--- Checking PM2 Status on VPS ---")
run_cmd("pm2 status")

print("\n--- Verifying Live Health via HTTP ---")
run_cmd("curl -s -o /dev/null -w 'Localhost 3000 /dashboard/WAGroupBooster: %{http_code}\\n' http://127.0.0.1:3000/dashboard/WAGroupBooster")
run_cmd("curl -s -o /dev/null -w 'Public HTTPS /dashboard/WAGroupBooster: %{http_code}\\n' https://customerpilot.in/dashboard/WAGroupBooster")
run_cmd("curl -s -o /dev/null -w 'Public HTTPS /dashboard/WAGroupBoosterPro: %{http_code}\\n' https://customerpilot.in/dashboard/WAGroupBoosterPro")
run_cmd("curl -s -o /dev/null -w 'Public HTTPS /dashboard/reviews: %{http_code}\\n' https://customerpilot.in/dashboard/reviews")
run_cmd("curl -s -o /dev/null -w 'Public HTTPS /: %{http_code}\\n' https://customerpilot.in/")

ssh.close()
print("\n✅ VPS Deployment Finished Successfully!")
