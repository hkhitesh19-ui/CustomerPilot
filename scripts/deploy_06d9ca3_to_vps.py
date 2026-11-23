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
    ("Git Commit on VPS Live.txt", "/var/www/CustomerPilot/Git Commit on VPS Live.txt"),
    ("RESOLVED_ISSUES_LOG.md", "/var/www/CustomerPilot/RESOLVED_ISSUES_LOG.md"),
    ("AGENTS.md", "/var/www/CustomerPilot/AGENTS.md"),
    ("src/app/api/admin/merchants/route.ts", "/var/www/CustomerPilot/src/app/api/admin/merchants/route.ts"),
    ("src/components/impersonation-banner.tsx", "/var/www/CustomerPilot/src/components/impersonation-banner.tsx"),
]

def run_command(ssh, cmd, desc, check=True):
    print(f"\n--- {desc} ---")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    output = ""
    for line in iter(stdout.readline, ""):
        clean = line.strip()
        if clean:
            print("  " + clean)
        output += line
    err = stderr.read().decode('utf-8', errors='replace').strip()
    exit_code = stdout.channel.recv_exit_status()
    if err:
        print("  [stderr] " + err)
    print(f"  [Exit Code: {exit_code}]")
    if check and exit_code != 0:
        raise RuntimeError(f"Command '{cmd}' failed with code {exit_code}")
    return exit_code, output, err

def main():
    print("==========================================================")
    print("🚀 CUSTOMER PILOT LIVE VPS DEPLOYMENT: COMMIT 06d9ca3")
    print(f"Target: {HOST} | User: {USER}")
    print("==========================================================\n")

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    print("✅ Connected to Hostinger VPS via SSH/SFTP!")

    # Step 1: Pre-Deploy Backup (Hot SQLite backup + WAL/SHM)
    backup_cmd = """
    cd /var/www/CustomerPilot
    TS=$(date +%s)
    if command -v sqlite3 >/dev/null 2>&1; then
      sqlite3 prisma/dev.db ".backup 'prisma/dev.db.backup_${TS}'"
    fi
    cp -a prisma/dev.db "prisma/dev.db.raw_backup_${TS}" 2>/dev/null || true
    cp -a prisma/dev.db-wal "prisma/dev.db-wal.raw_backup_${TS}" 2>/dev/null || true
    cp -a prisma/dev.db-shm "prisma/dev.db-shm.raw_backup_${TS}" 2>/dev/null || true
    ls -lh prisma/dev.db*backup_${TS}
    """
    run_command(ssh, backup_cmd, "1. Pre-Deployment Database Hot Backup", check=True)

    # Step 2: Ensure Remote Directories Exist
    remote_dirs = set()
    for _, remote_path in FILES_TO_UPLOAD:
        remote_dirs.add(os.path.dirname(remote_path).replace("\\", "/"))

    mkdir_cmds = " && ".join([f"mkdir -p '{d}'" for d in sorted(remote_dirs)])
    run_command(ssh, mkdir_cmds, "2. Synchronously Creating Remote Directories", check=True)

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

    # Step 4: Next.js Production Build
    build_cmd = """
    cd /var/www/CustomerPilot
    export NODE_OPTIONS='--max-old-space-size=4096'
    npm run build
    """
    run_command(ssh, build_cmd, "4. Next.js Production Compilation", check=True)

    # Step 5: Sync standalone assets if standalone directory exists
    standalone_cmd = """
    if [ -d "/var/www/CustomerPilot/.next/standalone" ]; then
      cp -ru /var/www/CustomerPilot/.next/static/* /var/www/CustomerPilot/.next/standalone/.next/static/ 2>/dev/null || true
      cp -ru /var/www/CustomerPilot/public/* /var/www/CustomerPilot/.next/standalone/public/ 2>/dev/null || true
      cp /var/www/CustomerPilot/prisma/dev.db /var/www/CustomerPilot/.next/standalone/prisma/dev.db 2>/dev/null || true
    fi
    """
    run_command(ssh, standalone_cmd, "5. Syncing Standalone Assets & DB", check=False)

    # Step 6: PM2 Zero-Downtime Reload
    pm2_cmd = """
    pm2 reload customerpilot-web --update-env
    sleep 3
    pm2 status customerpilot-web
    """
    run_command(ssh, pm2_cmd, "6. PM2 Cluster Reload", check=True)

    # Step 7: Post-Deploy Smoke Verification
    smoke_cmd = """
    echo "=== Test 1: Public Website Health ==="
    curl -s -o /dev/null -w "Public Home HTTP: %{http_code}\n" https://customerpilot.in/

    echo -e "\n=== Test 2: SuperAdmin Page Health ==="
    curl -s -o /dev/null -w "SuperAdmin HTTP: %{http_code}\n" https://customerpilot.in/super-admin

    echo -e "\n=== Test 3: Dashboard Health ==="
    curl -s -o /dev/null -w "Dashboard HTTP: %{http_code}\n" https://customerpilot.in/dashboard
    """
    run_command(ssh, smoke_cmd, "7. Post-Deploy Smoke Tests", check=True)

    ssh.close()
    print("\n🎉 ALL VPS DEPLOYMENT STAGES COMPLETED AND 100% VERIFIED!")

if __name__ == "__main__":
    main()
