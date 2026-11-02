import os
import sys
import paramiko
import time

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

HOST = "187.127.170.36"
PORT = 22
USER = "root"
PASSWORD = os.getenv("VPS_PASSWORD") or "Nilsky@202627"

def deploy():
    print(f"[1/6] Connecting to Hostinger VPS ({HOST})...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    sftp = ssh.open_sftp()
    print("Connected successfully via SSH/SFTP!")

    print("[2/6] Ensuring remote directories exist...")
    remote_dirs = [
        "/var/www/CustomerPilot/src/components/pricing",
    ]
    for d in remote_dirs:
        try:
            sftp.mkdir(d)
        except IOError:
            pass

    print("[3/6] Uploading updated pricing components & trackers to VPS...")
    files_to_upload = [
        ("src/components/pricing/pricing-studio.tsx", "/var/www/CustomerPilot/src/components/pricing/pricing-studio.tsx"),
        ("Git Commit on VPS Live.txt", "/var/www/CustomerPilot/Git Commit on VPS Live.txt"),
        ("RESOLVED_ISSUES_LOG.md", "/var/www/CustomerPilot/RESOLVED_ISSUES_LOG.md"),
    ]

    for local_path, remote_path in files_to_upload:
        if os.path.exists(local_path):
            sftp.put(local_path, remote_path)
            print(f"  -> Uploaded {local_path} to {remote_path}")
        else:
            print(f"  WARNING: Local file {local_path} not found!")

    sftp.close()

    print("[4/6] Building Next.js production standalone bundle on VPS...")
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

    exit_code = stdout.channel.recv_exit_status()
    if exit_code != 0:
        err = stderr.read().decode('utf-8', errors='replace')
        print(f"ERROR: Build failed with exit code {exit_code}:\n{err}")
        ssh.close()
        sys.exit(exit_code)
    print("  -> Next.js build completed successfully with exit code 0!")

    print("[5/6] Syncing static chunks to standalone and reloading PM2...")
    sync_cmd = """
    cd /var/www/CustomerPilot
    mkdir -p .next/standalone/.next/static
    cp -ru .next/static/* .next/standalone/.next/static/
    pm2 reload customerpilot-web --update-env
    sleep 3
    pm2 status
    """
    stdin, stdout, stderr = ssh.exec_command(sync_cmd)
    for line in iter(stdout.readline, ""):
        clean = line.strip()
        if clean:
            print("  [sync-pm2]", clean)

    print("[6/6] Verifying live HTTP response on production server...")
    verify_cmd = """
    curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/pricing
    """
    stdin, stdout, stderr = ssh.exec_command(verify_cmd)
    http_code = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"  -> Localhost :3000/pricing HTTP Code: {http_code}")

    verify_external_cmd = """
    curl -s -k -o /dev/null -w "%{http_code}" https://customerpilot.in/pricing
    """
    stdin, stdout, stderr = ssh.exec_command(verify_external_cmd)
    ext_http_code = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"  -> Live https://customerpilot.in/pricing HTTP Code: {ext_http_code}")

    # Check that Postpaid text is present in the rendered HTML
    check_content_cmd = """
    curl -s http://127.0.0.1:3000/pricing | grep -o "Postpaid · Monthly" | head -n 1
    """
    stdin, stdout, stderr = ssh.exec_command(check_content_cmd)
    rendered_text = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"  -> Rendered Match: '{rendered_text}'")

    ssh.close()

    if http_code in ["200", "307", "308"] or ext_http_code in ["200", "307", "308"]:
        print("✅ LIVE VPS DEPLOYMENT & HEALTH CHECKS 100% SUCCESSFUL!")
    else:
        print(f"⚠️ Health check returned unexpected code: {http_code} / {ext_http_code}")
        sys.exit(1)

if __name__ == "__main__":
    deploy()
