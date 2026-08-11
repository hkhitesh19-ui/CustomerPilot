const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.messageTemplate.findMany().then(t => console.log(JSON.stringify(t, null, 2))).finally(() => prisma.$disconnect());
