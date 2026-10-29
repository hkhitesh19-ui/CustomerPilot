const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const templates = await prisma.messageTemplate.findMany();
  console.log("Total DB templates:", templates.length);
  templates.forEach(t => {
    console.log(`- Key: ${t.templateKey} | Name: ${t.templateName}`);
    console.log(`  Body: ${t.messageBody}`);
  });
}

check().finally(() => prisma.$disconnect());
