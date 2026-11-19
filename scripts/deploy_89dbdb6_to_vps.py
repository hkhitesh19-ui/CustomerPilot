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
    'src/app/api/rewards/award/route.ts',
    'src/app/api/webhook/evolution/route.ts',
    'src/hooks/use-dashboard-state.ts',
    'src/lib/review-photo-verifier.ts',
    'guard/core-guard.js',
    'guard/core-guard.sh',
    'guard/core.sha256',
    'guard/install.sh',
    'guard/pre-commit',
    '.github/CODEOWNERS',
    'scripts/run_adversarial_guard.js',
    'RESOLVED_ISSUES_LOG.md',
    'Git Commit on VPS Live.txt'
]

print("\n[3/6] Synchronizing updated application files & Layer 5 guard via SFTP...")
for rel_path in files_to_sync:
    local_path = os.path.join(os.getcwd(), rel_path.replace('/', os.sep))
    remote_path = f"/var/www/CustomerPilot/{rel_path}"
    remote_dir = os.path.dirname(remote_path)
    
    try:
        sftp.stat(remote_dir)
    except:
        run_cmd(f"mkdir -p {remote_dir}", check=False)
        
    print(f"Uploading: {rel_path} -> {remote_path}")
    sftp.put(local_path, remote_path)

sftp.close()
print("SFTP file sync completed successfully!")

print("\n[4/6] Building Next.js 16 standalone production bundle on VPS...")
run_cmd("cd /var/www/CustomerPilot && export NODE_OPTIONS='--max-old-space-size=4096' && npm run build")

print("\n[5/6] Syncing static chunks to standalone and reloading PM2...")
run_cmd("cp -ru /var/www/CustomerPilot/.next/static/* /var/www/CustomerPilot/.next/standalone/.next/static/ 2>/dev/null || true", check=False)
run_cmd("cp -ru /var/www/CustomerPilot/public/* /var/www/CustomerPilot/.next/standalone/public/ 2>/dev/null || true", check=False)
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/dev.db 2>/dev/null || true", check=False)
run_cmd("cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/prisma/dev.db 2>/dev/null || true", check=False)

run_cmd("pm2 reload customerpilot-web --update-env")
time.sleep(5)

print("\n--- Verifying PM2 Process Status ---")
run_cmd("pm2 status customerpilot-web", check=False)

print("\n[6/6] Live Endpoint Health Verification...")
stdin, stdout, stderr = ssh.exec_command("curl -sI http://localhost:3000/dashboard/settings")
print("[Dashboard Settings Header Result]:\n", stdout.read().decode('utf-8'))

stdin, stdout, stderr = ssh.exec_command("curl -sI http://localhost:3000/")
print("[Homepage Header Result]:\n", stdout.read().decode('utf-8'))

stdin, stdout, stderr = ssh.exec_command("curl -sI https://customerpilot.in/")
print("[Live Domain HTTPS Header Result]:\n", stdout.read().decode('utf-8'))

ssh.close()
print("\n🎉 VPS DEPLOYMENT & PM2 RELOAD FOR COMMIT 89dbdb6 COMPLETED SUCCESSFULLY!")
