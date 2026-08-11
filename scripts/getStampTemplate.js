const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.messageTemplate.findFirst({ where: { templateKey: 'STAMP_EARNED' } })
  .then(t => console.log(JSON.stringify(t, null, 2)))
  .finally(() => prisma.$disconnect());
