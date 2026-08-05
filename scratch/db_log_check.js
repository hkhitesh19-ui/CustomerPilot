const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:F:/CustomerPilot_ByGLM_July2026/prisma/dev.db"
    }
  }
});

async function checkMessages() {
  console.log('=== WHATSAPP OTP SESSIONS LOG ===');
  const otps = await prisma.oTPSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  otps.forEach((o, i) => {
    console.log(`[${i+1}] Time: ${o.createdAt.toISOString()} | Destination Phone: +${o.phone} | Status: ${o.deliveryStatus} | MessageId: ${o.messageId} | OTP Code: ${o.otp}`);
  });

  console.log('\n=== EVOLUTION API INSTANCE INFO ===');
  console.log('Sender Number (Evolution VPS Instance Owner): +91 7203824012 (CakeConnection.in)');
}

checkMessages().finally(() => prisma.$disconnect());
