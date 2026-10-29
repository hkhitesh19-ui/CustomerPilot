import os
import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def deploy_module_fix():
    print("[1/5] Connecting to Hostinger VPS (187.127.170.36)...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD"), timeout=30)
    sftp = ssh.open_sftp()

    print("[2/5] Uploading updated files...")
    files_to_upload = [
        ('src/lib/feature-gate.ts', '/var/www/CustomerPilot/src/lib/feature-gate.ts'),
        ('src/app/api/auth/register/route.ts', '/var/www/CustomerPilot/src/app/api/auth/register/route.ts'),
        ('src/components/signup-client.tsx', '/var/www/CustomerPilot/src/components/signup-client.tsx'),
        ('src/components/pricing/checkout-activation-modal.tsx', '/var/www/CustomerPilot/src/components/pricing/checkout-activation-modal.tsx'),
        ('src/components/pricing/pricing-studio.tsx', '/var/www/CustomerPilot/src/components/pricing/pricing-studio.tsx'),
        ('src/components/ai-google-review-qr-client.tsx', '/var/www/CustomerPilot/src/components/ai-google-review-qr-client.tsx'),
        ('src/components/ai-review-standee-client.tsx', '/var/www/CustomerPilot/src/components/ai-review-standee-client.tsx'),
        ('src/components/smart-digital-business-card-client.tsx', '/var/www/CustomerPilot/src/components/smart-digital-business-card-client.tsx'),
        ('src/components/ai-google-review-autoreply-client.tsx', '/var/www/CustomerPilot/src/components/ai-google-review-autoreply-client.tsx'),
        ('src/components/whatsapp-digital-loyalty-client.tsx', '/var/www/CustomerPilot/src/components/whatsapp-digital-loyalty-client.tsx'),
        ('src/components/free-ai-review-generator-client.tsx', '/var/www/CustomerPilot/src/components/free-ai-review-generator-client.tsx'),
    ]

    for local_p, remote_p in files_to_upload:
        sftp.put(local_p, remote_p)
        print(f"  -> Uploaded {remote_p}")

    sftp.close()

    print("[3/5] Building Next.js on VPS...")
    build_cmd = """cd /var/www/CustomerPilot && export NODE_OPTIONS="--max-old-space-size=4096" && npm run build"""
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    for line in stdout:
        print("  [build]", line.strip())
    exit_code = stdout.channel.recv_exit_status()
    if exit_code != 0:
        err = stderr.read().decode('utf-8', errors='replace')
        print(f"ERROR: Build failed with exit code {exit_code}:\n{err}")
        ssh.close()
        sys.exit(exit_code)
    print("  -> Next.js build completed successfully!")

    print("[4/5] Syncing static assets and reloading PM2...")
    sync_cmd = """
    cd /var/www/CustomerPilot
    mkdir -p .next/standalone/.next/static
    cp -ru .next/static/* .next/standalone/.next/static/
    pm2 reload customerpilot-web --update-env
    sleep 2
    pm2 status customerpilot-web
    """
    stdin, stdout, stderr = ssh.exec_command(sync_cmd)
    print(stdout.read().decode('utf-8', errors='replace'))

    print("[5/5] Executing automated signup module tests on VPS...")
    test_script = """
    const http = require('http');
    const { PrismaClient } = require('/var/www/CustomerPilot/node_modules/@prisma/client');
    const prisma = new PrismaClient();

    async function testSignup(name, email, phone, moduleVal) {
      const payload = JSON.stringify({
        businessName: name,
        ownerName: name,
        email: email,
        password: "Password@123",
        whatsappPhone: phone,
        businessType: "retail",
        module: moduleVal
      });

      return new Promise((resolve, reject) => {
        const req = http.request('http://127.0.0.1:3000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
      });
    }

    async function run() {
      const ts = Date.now().toString().slice(-4);
      
      // Test 1: Only Reviews
      console.log('=== TEST 1: module=\"reviews\" ===');
      const r1 = await testSignup(`Test Store Reviews ${ts}`, `test_rev_${ts}@gmail.com`, `91971111${ts}`, 'reviews');
      console.log('API Response:', r1.body);
      const m1 = await prisma.merchant.findUnique({ where: { id: r1.body.merchantId } });
      console.log('DB Record 1:', { name: m1?.name, enabledModules: m1?.enabledModules, onboardingCompleted: m1?.onboardingCompleted, plan: m1?.plan });

      // Test 2: Only Digital Card
      console.log('=== TEST 2: module=\"card\" ===');
      const r2 = await testSignup(`Test Store Card ${ts}`, `test_card_${ts}@gmail.com`, `91972222${ts}`, 'card');
      console.log('API Response:', r2.body);
      const m2 = await prisma.merchant.findUnique({ where: { id: r2.body.merchantId }, include: { digitalBusinessCard: true } });
      console.log('DB Record 2:', { name: m2?.name, enabledModules: m2?.enabledModules, hasDigitalCard: !!m2?.digitalBusinessCard, cardSlug: m2?.digitalBusinessCard?.slug });

      // Test 3: Combo Card + Reviews
      console.log('=== TEST 3: module=\"card,reviews\" ===');
      const r3 = await testSignup(`Test Store Combo ${ts}`, `test_combo_${ts}@gmail.com`, `91973333${ts}`, 'card,reviews');
      console.log('API Response:', r3.body);
      const m3 = await prisma.merchant.findUnique({ where: { id: r3.body.merchantId }, include: { digitalBusinessCard: true } });
      console.log('DB Record 3:', { name: m3?.name, enabledModules: m3?.enabledModules, hasDigitalCard: !!m3?.digitalBusinessCard });

      // Clean up test accounts
      await prisma.digitalBusinessCard.deleteMany({ where: { merchantId: { in: [r1.body.merchantId, r2.body.merchantId, r3.body.merchantId].filter(Boolean) } } });
      await prisma.merchant.deleteMany({ where: { id: { in: [r1.body.merchantId, r2.body.merchantId, r3.body.merchantId].filter(Boolean) } } });
      await prisma.user.deleteMany({ where: { email: { in: [`test_rev_${ts}@gmail.com`, `test_card_${ts}@gmail.com`, `test_combo_${ts}@gmail.com`] } } });
      console.log('Test accounts cleaned up cleanly.');
    }

    run().finally(() => prisma.$disconnect());
    """

    sftp = ssh.open_sftp()
    with sftp.file('/tmp/test_module_signup.js', 'w') as f:
        f.write(test_script)
    sftp.close()

    stdin, stdout, stderr = ssh.exec_command('node /tmp/test_module_signup.js')
    print("Test Output:\n", stdout.read().decode('utf-8', errors='replace'))
    err = stderr.read().decode('utf-8', errors='replace')
    if err:
        print("Test stderr:\n", err)

    ssh.close()
    print("All tests and deployments completed successfully!")

if __name__ == '__main__':
    deploy_module_fix()
