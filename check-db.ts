import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  console.log('--- WhatsApp Messages ---')
  const messages = await db.whatsAppMessage.findMany({ 
    where: { merchantId: 'cms3bgz9u0017w0kgtbv0pmfe' },
    orderBy: { createdAt: 'desc' },
    take: 5
  })
  console.log(JSON.stringify(messages, null, 2))

  console.log('\n--- Customers ---')
  const customers = await db.customer.findMany({ 
    where: { merchantId: 'cms3bgz9u0017w0kgtbv0pmfe' },
    orderBy: { createdAt: 'desc' },
    take: 2
  })
  console.log(JSON.stringify(customers, null, 2))
  
  console.log('\n--- Live Queue ---')
  const queue = await db.waitingCustomer.findMany({ 
    where: { merchantId: 'cms3bgz9u0017w0kgtbv0pmfe' },
    orderBy: { scannedAt: 'desc' },
    take: 2,
    include: { customer: true }
  })
  console.log(JSON.stringify(queue, null, 2))

  await db.$disconnect()
}

main().catch(console.error)
