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
sftp = ssh.open_sftp()
print("✅ Connected successfully to Hostinger VPS!")

files_to_deploy = [
    ('Git Commit on VPS Live.txt', '/var/www/CustomerPilot/Git Commit on VPS Live.txt'),
    ('InstructionFlow.md', '/var/www/CustomerPilot/InstructionFlow.md'),
    ('RESOLVED_ISSUES_LOG.md', '/var/www/CustomerPilot/RESOLVED_ISSUES_LOG.md'),
    ('RANKPILOT_AI_TOP3_LOCAL_DOMINATION_PLAYBOOK.md', '/var/www/CustomerPilot/RANKPILOT_AI_TOP3_LOCAL_DOMINATION_PLAYBOOK.md'),
    ('playwright.config.ts', '/var/www/CustomerPilot/playwright.config.ts'),
    ('prisma/schema.prisma', '/var/www/CustomerPilot/prisma/schema.prisma'),
    ('src/lib/auditCalculator.ts', '/var/www/CustomerPilot/src/lib/auditCalculator.ts'),
    ('src/lib/geminiReviewVerifier.ts', '/var/www/CustomerPilot/src/lib/geminiReviewVerifier.ts'),
    ('src/components/seo/schema-injector.tsx', '/var/www/CustomerPilot/src/components/seo/schema-injector.tsx'),
    ('src/components/gbp-ranking-audit-client.tsx', '/var/www/CustomerPilot/src/components/gbp-ranking-audit-client.tsx'),
    ('src/app/[city]/[slug]/page.tsx', '/var/www/CustomerPilot/src/app/[city]/[slug]/page.tsx'),
    ('src/app/api/webhooks/whatsapp-review/route.ts', '/var/www/CustomerPilot/src/app/api/webhooks/whatsapp-review/route.ts'),
    ('src/app/rankpilot/page.tsx', '/var/www/CustomerPilot/src/app/rankpilot/page.tsx'),
    ('src/app/rankpilot-ai/page.tsx', '/var/www/CustomerPilot/src/app/rankpilot-ai/page.tsx'),
    ('src/components/rankpilot/rankpilot-landing-client.tsx', '/var/www/CustomerPilot/src/components/rankpilot/rankpilot-landing-client.tsx'),
    ('e2e/rankpilot-landing.spec.ts', '/var/www/CustomerPilot/e2e/rankpilot-landing.spec.ts'),
]

print("\n📤 STEP 1: Uploading updated files via SFTP...")
for lp, rp in files_to_deploy:
    if os.path.exists(lp):
        remote_dir = os.path.dirname(rp)
        try:
            sftp.stat(remote_dir)
        except IOError:
            ssh.exec_command(f'mkdir -p {remote_dir}')
            time.sleep(0.5)
        sftp.put(lp, rp)
        print(f"  ✓ SFTP Synced: {lp} -> {rp}")
    else:
        print(f"  ✗ WARNING: Local file not found: {lp}")

sftp.close()

def run_cmd(cmd, timeout=900):
    print(f"\n▶ RUNNING: {cmd.strip()[:100]}...", flush=True)
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            chunk = stdout.channel.recv(4096).decode('utf-8', errors='replace')
            print(chunk, end='', flush=True)
        time.sleep(0.3)
    remaining = stdout.channel.recv(16384).decode('utf-8', errors='replace')
    if remaining:
        print(remaining, end='', flush=True)
    code = stdout.channel.recv_exit_status()
    print(f"\n[Exit: {code}]", flush=True)
    return code

try:
    # 2. Sync database schema & generate client
    print("\n📦 STEP 2: Running Prisma DB Push & Generate on VPS...")
    run_cmd("""
    cd /var/www/CustomerPilot
    npx prisma generate
    npx prisma db push --skip-generate
    """)

    # 3. Build Next.js on VPS
    print("\n🏗️ STEP 3: Building Next.js production bundle on live VPS...")
    build_code = run_cmd("""
    cd /var/www/CustomerPilot
    npm run build
    """, timeout=900)

    if build_code != 0:
        print("❌ Build failed on VPS! Aborting deployment.")
        sys.exit(1)

    # 4. Synchronize standalone assets
    print("\n📂 STEP 4: Copying standalone static & public assets...")
    run_cmd("""
    cd /var/www/CustomerPilot
    cp -r .next/static .next/standalone/.next/static
    cp -r public .next/standalone/public
    mkdir -p .next/standalone/prisma
    ln -sf /var/www/CustomerPilot/prisma/dev.db .next/standalone/prisma/dev.db
    """)

    # 5. Reload PM2 service
    print("\n🔄 STEP 5: Reloading PM2 customerpilot-web...")
    run_cmd("""
    cd /var/www/CustomerPilot
    pm2 reload customerpilot-web --update-env
    """)

    # 6. Live health checks
    print("\n🩺 STEP 6: Live Health Checks on Hostinger VPS...")
    time.sleep(5)
    run_cmd("""
    echo "--- CHECK 1: Production Domain (HTTP/2 200 OK) ---"
    curl -I -s https://customerpilot.in/
    echo "--- CHECK 2: RankPilot Dedicated Landing Page ---"
    curl -I -s "https://customerpilot.in/rankpilot"
    echo "--- CHECK 3: RankPilot AI Alias Redirect ---"
    curl -I -s "https://customerpilot.in/rankpilot-ai"
    echo "--- CHECK 4: PM2 Status ---"
    pm2 status customerpilot-web
    """)

    print("\n🎉 Live VPS Deployment of commit 35f6885 COMPLETED SUCCESSFULLY!")

finally:
    ssh.close()
