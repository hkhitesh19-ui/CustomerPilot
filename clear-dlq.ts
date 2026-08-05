import { PrismaClient } from '@prisma/client'

async function main() {
  const db = new PrismaClient()
  const r = await db.deadLetterQueue.deleteMany({})
  console.log('Cleared dead letters:', r.count)
  await db.$disconnect()
}

main().catch(console.error)
