import os
import paramiko
import sys

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('187.127.170.36', port=22, username='root', password=os.getenv("VPS_PASSWORD"), timeout=15)

script = """node -e '
const { PrismaClient } = require("./node_modules/@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const res = await prisma.merchant.deleteMany({
    where: { email: { startsWith: "test_qr_" } }
  });
  console.log("Deleted test merchants count:", res.count);
  const remaining = await prisma.merchant.count();
  console.log("Remaining real merchants count:", remaining);
  await prisma.$disconnect();
}
main().catch(err => { console.error(err); process.exit(1); });
'
"""

stdin, stdout, stderr = ssh.exec_command(f"cd /var/www/CustomerPilot && {script}")
print(stdout.read().decode('utf-8', errors='replace'))
err = stderr.read().decode('utf-8', errors='replace')
if err:
    print("ERR:", err)
ssh.close()
