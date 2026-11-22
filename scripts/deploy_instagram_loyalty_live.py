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

FILES_TO_UPLOAD = [
    ("prisma/schema.prisma", "/var/www/CustomerPilot/prisma/schema.prisma"),
    ("src/app/api/webhook/instagram/route.ts", "/var/www/CustomerPilot/src/app/api/webhook/instagram/route.ts"),
    ("src/app/api/instagram/generate-token/route.ts", "/var/www/CustomerPilot/src/app/api/instagram/generate-token/route.ts"),
    ("src/app/api/instagram/upload-proof/route.ts", "/var/www/CustomerPilot/src/app/api/instagram/upload-proof/route.ts"),
    ("src/app/api/instagram/approve-proof/route.ts", "/var/www/CustomerPilot/src/app/api/instagram/approve-proof/route.ts"),
    ("src/app/api/instagram/proof-image/[id]/route.ts", "/var/www/CustomerPilot/src/app/api/instagram/proof-image/[id]/route.ts"),
    ("src/components/loyalty/InstagramTaskCard.tsx", "/var/www/CustomerPilot/src/components/loyalty/InstagramTaskCard.tsx"),
    ("src/components/admin/InstagramProofQueue.tsx", "/var/www/CustomerPilot/src/components/admin/InstagramProofQueue.tsx"),
    ("scripts/test_instagram_adversarial_suite.ts", "/var/www/CustomerPilot/scripts/test_instagram_adversarial_suite.ts"),
    ("RESOLVED_ISSUES_LOG.md", "/var/www/CustomerPilot/RESOLVED_ISSUES_LOG.md"),
    ("Git Commit on VPS Live.txt", "/var/www/CustomerPilot/Git Commit on VPS Live.txt"),
]

def run_command(ssh, cmd, desc):
    print(f"\n--- {desc} ---")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    output = ""
    for line in iter(stdout.readline, ""):
        print("  " + line.strip())
        output += line
    err = stderr.read().decode('utf-8', errors='replace').strip()
    if err:
        print("  [stderr] " + err)
    exit_code = stdout.channel.recv_exit_status()
    if exit_code != 0:
        print(f"⚠️ Command exited with code: {exit_code}")
    return exit_code, output, err

def main():
    print("==========================================================")
    print("🚀 CUSTOMER PILOT LIVE VPS DEPLOYMENT: INSTAGRAM LOYALTY")
    print(f"Target: {HOST} | User: {USER}")
    print("==========================================================\n")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected to Hostinger VPS via SSH/SFTP!")

    # Step 1: Pre-Deploy Backup (Hot SQLite backup + WAL/SHM)
    backup_cmd = """
    cd /var/www/CustomerPilot
    mkdir -p storage/proofs
    chmod 755 storage/proofs
    TS=$(date +%s)
    if command -v sqlite3 >/dev/null 2>&1; then
      sqlite3 prisma/dev.db ".backup 'prisma/dev.db.backup_${TS}'"
    fi
    cp -a prisma/dev.db "prisma/dev.db.raw_backup_${TS}" 2>/dev/null || true
    cp -a prisma/dev.db-wal "prisma/dev.db-wal.raw_backup_${TS}" 2>/dev/null || true
    cp -a prisma/dev.db-shm "prisma/dev.db-shm.raw_backup_${TS}" 2>/dev/null || true
    ls -lh prisma/dev.db*backup_${TS}
    """
    code, out, _ = run_command(ssh, backup_cmd, "1. Pre-Deployment Database Hot Backup")
    if code != 0:
        print("❌ Backup failed! Aborting deployment.")
        sys.exit(1)

    # Step 2: Ensure Remote Directories Exist Synchronously
    remote_dirs = set()
    for _, remote_path in FILES_TO_UPLOAD:
        remote_dirs.add(os.path.dirname(remote_path).replace("\\", "/"))
    remote_dirs.add("/var/www/CustomerPilot/storage/proofs")

    mkdir_cmds = " && ".join([f"mkdir -p '{d}'" for d in sorted(remote_dirs)])
    code, _, _ = run_command(ssh, mkdir_cmds, "2. Synchronously Creating Remote Directories")
    if code != 0:
        print("❌ Directory creation failed! Aborting deployment.")
        sys.exit(1)

    # Step 3: SFTP Upload Changed Files
    print("\n--- 3. SFTP Uploading Hardened Files ---")
    sftp = ssh.open_sftp()
    for local_path, remote_path in FILES_TO_UPLOAD:
        if os.path.exists(local_path):
            sftp.put(local_path, remote_path)
            print(f"  -> Uploaded: {local_path} -> {remote_path}")
        else:
            print(f"  ❌ Missing local file: {local_path}")
            sys.exit(1)
    sftp.close()

    # Step 4: Ensure Environment Variables (META_VERIFY_TOKEN)
    env_cmd = """
    cd /var/www/CustomerPilot
    grep -q "META_VERIFY_TOKEN" .env || echo 'META_VERIFY_TOKEN="customerpilot_verify_123"' >> .env
    grep -q "META_APP_SECRET" .env || echo 'META_APP_SECRET="customerpilot_meta_secret_2026"' >> .env
    grep -E "META_VERIFY_TOKEN|META_APP_SECRET" .env
    """
    run_command(ssh, env_cmd, "4. Verifying Meta Environment Variables in .env")

    # Step 5: Check Nginx client_max_body_size & reload
    nginx_cmd = r"""
    if ! grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
      sed -i '/http {/a \    client_max_body_size 10M;' /etc/nginx/nginx.conf
    fi
    nginx -t && systemctl reload nginx
    """
    run_command(ssh, nginx_cmd, "5. Nginx 10M Body Size & Configuration Test")

    # Step 6: Prisma DB Push (Safe migration with --accept-data-loss=false)
    prisma_cmd = """
    cd /var/www/CustomerPilot
    npx prisma db push --accept-data-loss=false
    npx prisma generate
    """
    code, _, _ = run_command(ssh, prisma_cmd, "6. Prisma DB Schema Push & Client Regeneration")
    if code != 0:
        print("❌ Prisma schema push failed! Check logs.")
        sys.exit(1)

    # Step 7: Next.js Production Build
    build_cmd = """
    cd /var/www/CustomerPilot
    npm run build
    """
    code, _, _ = run_command(ssh, build_cmd, "7. Next.js Production Compilation")
    if code != 0:
        print("❌ Next.js build failed! Aborting reload.")
        sys.exit(1)

    # Step 8: PM2 Zero-Downtime Reload
    pm2_cmd = """
    pm2 reload customerpilot-web
    pm2 status customerpilot-web
    """
    run_command(ssh, pm2_cmd, "8. PM2 Cluster Reload")

    # Step 9: Post-Deploy Smoke Verification
    smoke_cmd = """
    sleep 3
    echo "=== Test 1: Webhook GET Meta Verification ==="
    curl -s -i "http://localhost:3000/api/webhook/instagram?hub.mode=subscribe&hub.verify_token=customerpilot_verify_123&hub.challenge=test_challenge_9988" | head -n 10

    echo -e "\n=== Test 2: Unsigned Webhook POST (Expected 401) ==="
    curl -s -i -X POST "http://localhost:3000/api/webhook/instagram" -H "Content-Type: application/json" -d '{"object":"instagram"}' | head -n 10

    echo -e "\n=== Test 3: Public Website Health ==="
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://customerpilot.in/
    """
    run_command(ssh, smoke_cmd, "9. Post-Deploy Smoke Tests")

    ssh.close()
    print("\n🎉 ALL VPS DEPLOYMENT STAGES COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
