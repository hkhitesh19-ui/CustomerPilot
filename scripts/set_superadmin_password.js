const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setSuperAdminPassword(email, newPassword) {
  const cleanEmail = (email || 'admin@customerpilot.in').trim().toLowerCase();
  const passwordToSet = newPassword || 'Admin@CustomerPilot2026!';

  const hashedPassword = await bcrypt.hash(passwordToSet, 10);

  const user = await prisma.user.upsert({
    where: { email: cleanEmail },
    update: {
      password: hashedPassword,
      role: 'super_admin',
      name: 'Founder / Super Admin'
    },
    create: {
      email: cleanEmail,
      name: 'Founder / Super Admin',
      password: hashedPassword,
      role: 'super_admin'
    }
  });

  console.log('==================================================');
  console.log('✅ SUPERADMIN ACCOUNT CONFIGURED');
  console.log('==================================================');
  console.log(`Email:    ${user.email}`);
  console.log(`Role:     ${user.role}`);
  console.log(`Password: ${passwordToSet}`);
  console.log('==================================================');
  console.log('👉 You can now log in at: http://localhost:3000/login');
  console.log('   (It will automatically redirect to /super-admin)');
  console.log('==================================================');
}

const targetEmail = process.argv[2] || 'admin@customerpilot.in';
const targetPassword = process.argv[3] || 'Admin@CustomerPilot2026!';

setSuperAdminPassword(targetEmail, targetPassword)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
