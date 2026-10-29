import os
import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def deploy():
    print("[1/5] Connecting to Hostinger VPS (187.127.170.36)...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD"), timeout=30)
    sftp = ssh.open_sftp()

    print("[2/5] Uploading modified files to VPS...")
    files = [
        ('src/app/api/state/route.ts', '/var/www/CustomerPilot/src/app/api/state/route.ts'),
        ('src/app/dashboard/page.tsx', '/var/www/CustomerPilot/src/app/dashboard/page.tsx'),
        ('src/app/dashboard/queue/page.tsx', '/var/www/CustomerPilot/src/app/dashboard/queue/page.tsx'),
        ('src/app/dashboard/settings/page.tsx', '/var/www/CustomerPilot/src/app/dashboard/settings/page.tsx'),
        ('src/components/dashboard/RewardModal.tsx', '/var/www/CustomerPilot/src/components/dashboard/RewardModal.tsx'),
        ('src/components/reward-setup-card.tsx', '/var/www/CustomerPilot/src/components/reward-setup-card.tsx'),
        ('src/lib/queue-engine.ts', '/var/www/CustomerPilot/src/lib/queue-engine.ts'),
    ]

    for local_p, remote_p in files:
        sftp.put(local_p, remote_p)
        print(f"  -> Uploaded {remote_p}")
    sftp.close()

    print("[3/5] Building Next.js production bundle on VPS...")
    build_cmd = """cd /var/www/CustomerPilot && export NODE_OPTIONS="--max-old-space-size=3072" && npm run build"""
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    for line in stdout:
        clean = line.strip()
        if clean:
            print("  [build]", clean)
    exit_code = stdout.channel.recv_exit_status()
    if exit_code != 0:
        err = stderr.read().decode('utf-8', errors='replace')
        print(f"ERROR: Build failed with exit code {exit_code}:\n{err}")
        ssh.close()
        sys.exit(exit_code)
    print("  -> Next.js build completed successfully on VPS!")

    print("[4/5] Syncing standalone assets and reloading PM2...")
    sync_cmd = """
    cd /var/www/CustomerPilot
    mkdir -p .next/standalone/.next/static
    cp -ru .next/static/* .next/standalone/.next/static/
    pm2 reload customerpilot-web --update-env
    sleep 3
    pm2 status customerpilot-web
    """
    stdin, stdout, stderr = ssh.exec_command(sync_cmd)
    print(stdout.read().decode('utf-8', errors='replace'))

    print("[5/5] Live Health Check on customerpilot.in...")
    health_cmd = """curl -s -o /dev/null -w "%{http_code}" https://customerpilot.in/login"""
    stdin, stdout, stderr = ssh.exec_command(health_cmd)
    code = stdout.read().decode('utf-8', errors='replace').strip()
    print(f"  -> Health Check response: HTTP {code}")
    ssh.close()
    print("Deployment completed successfully!")

if __name__ == "__main__":
    deploy()
