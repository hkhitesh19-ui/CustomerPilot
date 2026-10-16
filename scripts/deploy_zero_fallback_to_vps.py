import paramiko
import sys
import os

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.170.36', port=22, username='root', password='Nilsky@202627', timeout=15)
sftp = ssh.open_sftp()

files_to_upload = [
    "src/app/api/google-business/locations/route.ts",
    "src/app/api/google-business/oauth/route.ts",
    "src/app/onboarding/page.tsx",
]

for rel_path in files_to_upload:
    local_path = os.path.join(r"f:\HITESH\CustomerPilot_GLM_Agent_July2026", rel_path.replace("/", "\\"))
    remote_path = f"/var/www/CustomerPilot/{rel_path}"
    print(f"Uploading {rel_path} -> {remote_path}...")
    sftp.put(local_path, remote_path)

sftp.close()
print("Uploaded successfully!")

build_cmd = """
cd /var/www/CustomerPilot
echo "=== COMPILING NEXT.JS ON VPS ==="
npm run build
echo "=== SYNCING STATIC ASSETS ==="
cp -ru .next/static .next/standalone/.next/
cp -ru public .next/standalone/
echo "=== RESTARTING PM2 ==="
pm2 restart customerpilot-web
"""

stdin, stdout, stderr = ssh.exec_command(build_cmd)
for line in iter(stdout.readline, ""):
    print(line, end="")
print(stderr.read().decode('utf-8', errors='replace'))
ssh.close()
