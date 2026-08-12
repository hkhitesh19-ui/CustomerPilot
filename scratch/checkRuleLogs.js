const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRuleLogs() {
  const cardLogs = await prisma.cardRuleChangeLog.findMany({
    orderBy: { createdAt: 'desc' }
  });
  console.log("=== Card Rule Change Logs ===");
  console.log(JSON.stringify(cardLogs, null, 2));

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  console.log("\n=== Audit Logs ===");
  console.log(JSON.stringify(auditLogs, null, 2));
}

checkRuleLogs().finally(() => prisma.$disconnect());
