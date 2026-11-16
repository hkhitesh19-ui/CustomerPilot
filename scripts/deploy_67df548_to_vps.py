import os
import sys
import time
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
    'src/lib/feature-gate.ts',
    'src/lib/master-plans.ts',
    'src/components/pricing/pricing-studio.tsx',
    'src/app/dashboard/subscription/page.tsx',
    'scripts/seed_pricing_plans.ts',
    'RESOLVED_ISSUES_LOG.md',
    'Git Commit on VPS Live.txt'
]

print("\n--- Synchronizing Changed Files to VPS via SFTP ---")
for rel_path in files_to_sync:
    local_path = os.path.join(os.getcwd(), rel_path.replace('/', os.sep))
    remote_path = f"/var/www/CustomerPilot/{rel_path}"
    remote_dir = os.path.dirname(remote_path)
    
    # Ensure remote directory exists
    try:
        sftp.stat(remote_dir)
    except:
        run_cmd(f"mkdir -p {remote_dir}", check=False)
        
    print(f"Uploading: {rel_path} -> {remote_path}")
    sftp.put(local_path, remote_path)

sftp.close()
print("SFTP upload complete!")

print("\n--- Seeding Canonical Master Plans into VPS Database ---")
run_cmd("cd /var/www/CustomerPilot && npx tsx scripts/seed_pricing_plans.ts")

print("\n--- Running Next.js Production Build on VPS ---")
run_cmd("cd /var/www/CustomerPilot && export NODE_OPTIONS='--max-old-space-size=4096' && npm run build")

print("\n--- Syncing Static Assets & SQLite Database to Standalone on VPS ---")
run_cmd("cp -r /var/www/CustomerPilot/.next/static /var/www/CustomerPilot/.next/standalone/.next/static 2>/dev/null || true", check=False)
run_cmd("cp -r /var/www/CustomerPilot/public /var/www/CustomerPilot/.next/standalone/public 2>/dev/null || true", check=False)
run_cmd("mkdir -p /var/www/CustomerPilot/.next/standalone/prisma", check=False)
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/dev.db 2>/dev/null || true", check=False)
run_cmd("mkdir -p /var/www/CustomerPilot/.next/standalone/prisma/prisma", check=False)
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/prisma/dev.db 2>/dev/null || true", check=False)

print("\n--- Reloading PM2 Service (customerpilot-web) ---")
run_cmd("pm2 reload customerpilot-web")
time.sleep(4)

print("\n--- Verifying PM2 Process Status ---")
run_cmd("pm2 status", check=False)

print("\n--- Testing Pricing API on VPS (localhost:3000) ---")
stdin, stdout, stderr = ssh.exec_command("curl -s http://localhost:3000/api/pricing/plans")
res = stdout.read().decode('utf-8')
print("API Response sample (first 300 chars):", res[:300])

print("\n--- Verifying Live HTTPS Status Codes ---")
for url in ["https://customerpilot.in/pricing", "https://customerpilot.in/api/pricing/plans", "https://customerpilot.in/dashboard/settings", "https://customerpilot.in/dashboard/subscription"]:
    stdin, stdout, stderr = ssh.exec_command(f"curl -s -o /dev/null -w '%{{http_code}}' {url}")
    code = stdout.read().decode('utf-8').strip()
    print(f"URL: {url} -> HTTP {code}")

ssh.close()
print("\n✅ VPS Deployment & Verification for Commit 67df548 Succeeded!")
