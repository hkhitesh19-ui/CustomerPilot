const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const customers = await p.customer.findMany({ take: 5, orderBy: { createdAt: 'desc' } });
  const merchantId = 'cmsjw7n7i0001w0c0r6i3juhy';
  const baseUrl = 'https://lhiap-49-43-34-113.run.pinggy-free.link';
  
  console.log("=== Latest Customers ===");
  customers.forEach(c => {
    const link = `${baseUrl}/review?c=${c.id}&m=${merchantId}`;
    console.log(`Phone: ${c.phone} | Name: ${c.name} | ID: ${c.id}`);
    console.log(`Review Link: ${link}`);
    console.log('---');
  });
}

main().finally(() => p.$disconnect());
