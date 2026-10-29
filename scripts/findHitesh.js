const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.customer.findMany({ where: { name: { contains: 'Hitesh' } } })
  .then(c => console.log("Found customers:", c))
  .catch(e => console.error(e))
  .finally(() => p.$disconnect());
