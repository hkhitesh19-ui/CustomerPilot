import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  const conn = await db.merchantGoogleConnection.findFirst({ 
    where: { merchantId: 'cms3bgz9u0017w0kgtbv0pmfe' } 
  })
  console.log(JSON.stringify(conn, null, 2))
  
  // Also get the first customer to test review link
  const customer = await db.customer.findFirst({
    where: { merchantId: 'cms3bgz9u0017w0kgtbv0pmfe' }
  })
  console.log('\nFirst Customer:', JSON.stringify({ name: customer?.name, phone: customer?.phone }, null, 2))
  
  await db.$disconnect()
}

main().catch(console.error)
