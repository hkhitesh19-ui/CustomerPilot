import paramiko
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def deploy_standee_fix():
    print("[1/5] Connecting to Hostinger VPS (187.127.170.36)...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD"), timeout=30)
    sftp = ssh.open_sftp()

    print("[2/5] Uploading cleaned master template and updated standee route...")
    # Upload standee_master_authentic.jpg
    local_img = 'public/standees/standee_master_authentic.jpg'
    remote_img = '/var/www/CustomerPilot/public/standees/standee_master_authentic.jpg'
    standalone_img = '/var/www/CustomerPilot/.next/standalone/public/standees/standee_master_authentic.jpg'
    
    sftp.put(local_img, remote_img)
    print(f"  -> Uploaded {remote_img}")
    
    # Also put in standalone public
    try:
        sftp.put(local_img, standalone_img)
        print(f"  -> Uploaded {standalone_img}")
    except Exception as e:
        print(f"  -> Standalone public notice: {e}")

    # Upload route.ts
    local_route = 'src/app/api/qr/standee/route.ts'
    remote_route = '/var/www/CustomerPilot/src/app/api/qr/standee/route.ts'
    sftp.put(local_route, remote_route)
    print(f"  -> Uploaded {remote_route}")

    sftp.close()

    print("[3/5] Building Next.js on VPS...")
    build_cmd = """cd /var/www/CustomerPilot && export NODE_OPTIONS="--max-old-space-size=4096" && npm run build"""
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    
    # Stream output
    for line in stdout:
        print("  [build]", line.strip())
    
    exit_code = stdout.channel.recv_exit_status()
    if exit_code != 0:
        err = stderr.read().decode('utf-8', errors='replace')
        print(f"ERROR: Build failed with exit code {exit_code}:\n{err}")
        ssh.close()
        sys.exit(exit_code)
    print("  -> Next.js build completed successfully!")

    print("[4/5] Syncing static assets and restarting PM2...")
    sync_cmd = """
    cd /var/www/CustomerPilot
    mkdir -p .next/standalone/.next/static
    cp -ru .next/static/* .next/standalone/.next/static/
    mkdir -p .next/standalone/public/standees
    cp -u public/standees/* .next/standalone/public/standees/
    pm2 reload customerpilot-web --update-env
    sleep 2
    pm2 status customerpilot-web
    """
    stdin, stdout, stderr = ssh.exec_command(sync_cmd)
    print(stdout.read().decode('utf-8', errors='replace'))
    print(stderr.read().decode('utf-8', errors='replace'))

    print("[5/5] Checking live HTTP response for Standee endpoint...")
    check_cmd = """curl -s -I "http://127.0.0.1:3000/api/qr/standee?design=master&m=cmvaruybf0n9akvtmbog4k7u7" | head -n 5"""
    stdin, stdout, stderr = ssh.exec_command(check_cmd)
    print(stdout.read().decode('utf-8', errors='replace'))

    ssh.close()
    print("Deployment finished successfully!")

if __name__ == '__main__':
    deploy_standee_fix()
