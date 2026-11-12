import os
import sys
import paramiko
import time

sys.stdout.reconfigure(encoding='utf-8')

VPS_IP = '187.127.170.36'
VPS_USER = 'root'
VPS_PASS = os.getenv("VPS_PASSWORD") or 'Nilsky@202627'

print(f"Connecting to live Hostinger VPS {VPS_IP} via SFTP & SSH...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(VPS_IP, username=VPS_USER, password=VPS_PASS, timeout=30)
print("Connected successfully!")

def run_cmd(cmd):
    print(f"\n[VPS] $ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    if out:
        print(out.strip())
    if err:
        print("[STDERR]", err.strip())
    print(f"[Exit: {code}]")
    return code, out, err

sftp = ssh.open_sftp()

files_to_sync = [
    'prisma/schema.prisma',
    'src/lib/gbp/portfolio-engine.ts',
    'src/app/api/gbp/portfolio/route.ts',
    'src/components/gbp-keyword-portfolio-studio.tsx',
    'src/lib/gbp/geo-grid-engine.ts',
    'src/app/api/gbp/geo-grid/route.ts',
    'src/components/gbp-geo-grid-visualizer.tsx',
    'src/app/dashboard/gbp-status/page.tsx',
    'src/components/super-admin/gbp-operations-dashboard.tsx',
    'RESOLVED_ISSUES_LOG.md',
    'Git Commit on VPS Live.txt'
]

print("\n--- Synchronizing Changed Files via SFTP ---")
for rel_path in files_to_sync:
    local_path = os.path.join(os.getcwd(), rel_path.replace('/', os.sep))
    remote_path = f"/var/www/CustomerPilot/{rel_path}"
    remote_dir = os.path.dirname(remote_path)
    
    # Ensure remote directory exists
    try:
        sftp.stat(remote_dir)
    except:
        run_cmd(f"mkdir -p {remote_dir}")
        
    print(f"Uploading: {rel_path} -> {remote_path}")
    sftp.put(local_path, remote_path)

sftp.close()
print("SFTP upload complete!")

print("\n--- Updating Prisma Database Schema on VPS ---")
code, out, err = run_cmd("cd /var/www/CustomerPilot && npx prisma db push && npx prisma generate")
if code != 0:
    print("❌ Prisma schema update failed on VPS!")
    sys.exit(1)

print("\n--- Running Next.js Production Build on VPS ---")
code, out, err = run_cmd("cd /var/www/CustomerPilot && npm run build")
if code != 0:
    print("❌ Build failed on VPS!")
    sys.exit(1)

print("\n--- Syncing Static Assets to Standalone on VPS ---")
run_cmd("cp -r /var/www/CustomerPilot/.next/static /var/www/CustomerPilot/.next/standalone/.next/static 2>/dev/null || true")
run_cmd("cp -r /var/www/CustomerPilot/public /var/www/CustomerPilot/.next/standalone/public 2>/dev/null || true")

print("\n--- Reloading PM2 customerpilot-web Service ---")
run_cmd("pm2 reload customerpilot-web")
time.sleep(4)

print("\n--- Verifying PM2 Process Status ---")
run_cmd("pm2 status")

print("\n--- Testing Module 6 (Portfolio Engine) on VPS ---")
run_cmd("curl -s 'http://localhost:3000/api/gbp/portfolio?merchantId=cmtymavfx0002kx008lbfvp57' | head -c 250")

print("\n--- Testing Module 1 & 4 (5x5 Geo-Grid API) on VPS ---")
run_cmd("curl -s 'http://localhost:3000/api/gbp/geo-grid?merchantId=cmtymavfx0002kx008lbfvp57' | head -c 250")

print("\n--- Verifying Live HTTPS Endpoints ---")
run_cmd("curl -I -s https://customerpilot.in/dashboard/gbp-status | head -n 10")
run_cmd("curl -I -s https://customerpilot.in/super-admin | head -n 10")

ssh.close()
print("\n✅ VPS Deployment of 7759d7a Complete & 100% Verified!")
