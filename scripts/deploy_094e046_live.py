import paramiko
import os
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

HOST = "187.127.170.36"
PORT = 22
USER = "root"
PASSWORD = os.getenv("VPS_PASSWORD") or "Nilsky@202627"

def deploy():
    print(f"[1/7] Connecting to Hostinger VPS ({HOST})...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    sftp = ssh.open_sftp()
    print("Connected successfully via SSH/SFTP!")

    print("[2/7] Uploading changed files to VPS...")
    files_to_upload = [
        ("src/lib/feature-gate.ts", "/var/www/CustomerPilot/src/lib/feature-gate.ts"),
        ("src/lib/master-plans.ts", "/var/www/CustomerPilot/src/lib/master-plans.ts"),
        ("src/lib/branded-qr.ts", "/var/www/CustomerPilot/src/lib/branded-qr.ts"),
        ("src/lib/client-branded-qr.ts", "/var/www/CustomerPilot/src/lib/client-branded-qr.ts"),
        ("src/components/pricing/pricing-studio.tsx", "/var/www/CustomerPilot/src/components/pricing/pricing-studio.tsx"),
        ("src/components/qr-generator.tsx", "/var/www/CustomerPilot/src/components/qr-generator.tsx"),
        ("src/app/dashboard/subscription/page.tsx", "/var/www/CustomerPilot/src/app/dashboard/subscription/page.tsx"),
        ("src/app/api/admin/merchants/sync-gbp/route.ts", "/var/www/CustomerPilot/src/app/api/admin/merchants/sync-gbp/route.ts"),
        ("src/app/api/qr-codes/leads/route.ts", "/var/www/CustomerPilot/src/app/api/qr-codes/leads/route.ts"),
        ("src/app/api/wg/[slug]/register/route.ts", "/var/www/CustomerPilot/src/app/api/wg/[slug]/register/route.ts"),
        ("scripts/sync_master_plans_db.ts", "/var/www/CustomerPilot/scripts/sync_master_plans_db.ts"),
        ("scripts/verify_typecheck_ratchet.js", "/var/www/CustomerPilot/scripts/verify_typecheck_ratchet.js"),
        ("RESOLVED_ISSUES_LOG.md", "/var/www/CustomerPilot/RESOLVED_ISSUES_LOG.md"),
        ("Git Commit on VPS Live.txt", "/var/www/CustomerPilot/Git Commit on VPS Live.txt"),
    ]

    for local_path, remote_path in files_to_upload:
        if os.path.exists(local_path):
            sftp.put(local_path, remote_path)
            print(f"  -> Uploaded: {local_path} -> {remote_path}")
        else:
            print(f"  WARNING: Local file {local_path} not found!")

    sftp.close()

    print("\n[3/7] Synchronizing Master Plans in SQLite Database on VPS...")
    sync_cmd = """
    cd /var/www/CustomerPilot
    npx tsx scripts/sync_master_plans_db.ts
    """
    stdin, stdout, stderr = ssh.exec_command(sync_cmd)
    for line in iter(stdout.readline, ""):
        print("  [db-sync]", line.strip())
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if err:
        print("  [db-sync stderr]", err)

    print("\n[4/7] Compiling Next.js production build on VPS...")
    build_cmd = """
    cd /var/www/CustomerPilot
    export NODE_OPTIONS="--max-old-space-size=4096"
    npm run build
    """
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    for line in iter(stdout.readline, ""):
        clean = line.strip()
        if clean:
            print("  [build]", clean)
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if err:
        print("\n  [build stderr]\n", err)

    print("\n[5/7] Synchronizing assets & DB into Next.js standalone on VPS...")
    sync_standalone_cmd = """
    cd /var/www/CustomerPilot
    cp -r .next/static .next/standalone/.next/static
    cp -r public .next/standalone/public
    mkdir -p .next/standalone/prisma
    cp prisma/dev.db .next/standalone/prisma/dev.db
    mkdir -p .next/standalone/prisma/prisma
    cp prisma/dev.db .next/standalone/prisma/prisma/dev.db
    """
    stdin, stdout, stderr = ssh.exec_command(sync_standalone_cmd)
    print(stdout.read().decode())

    print("\n[6/7] Reloading PM2 services...")
    pm2_cmd = """
    cd /var/www/CustomerPilot
    pm2 reload customerpilot-web
    pm2 status
    """
    stdin, stdout, stderr = ssh.exec_command(pm2_cmd)
    print(stdout.read().decode())

    time.sleep(3)

    print("\n[7/7] Live Health Verification on VPS...")
    health_cmd = """
    echo "1. Port 3000 local: $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)"
    echo "2. Public homepage: $(curl -s -o /dev/null -w "%{http_code}" https://customerpilot.in/)"
    echo "3. Public pricing:  $(curl -s -o /dev/null -w "%{http_code}" https://customerpilot.in/pricing)"
    echo "4. Super-admin:     $(curl -s -o /dev/null -w "%{http_code}" https://customerpilot.in/super-admin)"
    """
    stdin, stdout, stderr = ssh.exec_command(health_cmd)
    print(stdout.read().decode())

    ssh.close()
    print("\n✅ DEPLOYMENT SUCCESSFULLY COMPLETED ON VPS (187.127.170.36)!")

if __name__ == "__main__":
    deploy()
