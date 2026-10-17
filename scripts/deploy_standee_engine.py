import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def deploy():
    print("[1/5] Connecting to Hostinger VPS (187.127.170.36)...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('187.127.170.36', port=22, username='root', password='Nilsky@202627', timeout=30)
    sftp = ssh.open_sftp()

    print("[2/5] Uploading modified files...")
    files = [
        ('src/app/api/qr/standee/route.ts', '/var/www/CustomerPilot/src/app/api/qr/standee/route.ts'),
        ('src/components/qr-generator.tsx', '/var/www/CustomerPilot/src/components/qr-generator.tsx'),
        ('src/app/dashboard/settings/page.tsx', '/var/www/CustomerPilot/src/app/dashboard/settings/page.tsx'),
        ('src/app/dashboard/digital-card/page.tsx', '/var/www/CustomerPilot/src/app/dashboard/digital-card/page.tsx'),
    ]

    for local_p, remote_p in files:
        sftp.put(local_p, remote_p)
        print(f"  -> Uploaded {remote_p}")

    sftp.close()

    print("[3/5] Running Next.js build on VPS...")
    build_cmd = """cd /var/www/CustomerPilot && export NODE_OPTIONS="--max-old-space-size=4096" && npm run build"""
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    for line in stdout:
        print("  [build]", line.strip())
    exit_code = stdout.channel.recv_exit_status()
    print(f"  Build exited with code {exit_code}")
    if exit_code != 0:
        err = stderr.read().decode('utf-8', errors='replace')
        print("Build error:", err)
        ssh.close()
        return False

    print("[4/5] Syncing standalone static assets & reloading PM2...")
    sync_cmd = """
cp -ru /var/www/CustomerPilot/.next/static /var/www/CustomerPilot/.next/standalone/.next/
cp -ru /var/www/CustomerPilot/public /var/www/CustomerPilot/.next/standalone/
pm2 reload customerpilot-web
"""
    stdin, stdout, stderr = ssh.exec_command(sync_cmd)
    for line in stdout:
        print("  [pm2]", line.strip())
    stdout.channel.recv_exit_status()

    time.sleep(2)

    print("[5/5] Verifying live standee endpoints for Cake Connection (cmtymavfx0002kx008lbfvp57)...")
    check_cmd = """
python3 -c "
import urllib.request

designs = ['review', 'card', 'combo', 'master']
for d in designs:
    url = f'http://127.0.0.1:3000/api/qr/standee?design={d}&m=cmtymavfx0002kx008lbfvp57'
    req = urllib.request.Request(url, headers={'User-Agent': 'TestClient'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            print(f'Design [{d}]: Status={resp.status}, Content-Type={resp.headers.get(\\"Content-Type\\")}, Bytes={len(data)}')
    except Exception as e:
        print(f'Design [{d}]: FAILED -> {e}')
"
"""
    stdin, stdout, stderr = ssh.exec_command(check_cmd)
    for line in stdout:
        print("  [verify]", line.strip())
    err = stderr.read().decode('utf-8', errors='replace')
    if err:
        print("Verify stderr:", err)

    ssh.close()
    print("Deployment and verification complete!")
    return True

if __name__ == '__main__':
    deploy()
