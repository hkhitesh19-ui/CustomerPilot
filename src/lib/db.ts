import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Enable SQLite Write-Ahead Logging (WAL) and 10s Busy Timeout for concurrent write safety
db.$executeRawUnsafe(`PRAGMA journal_mode = WAL;`).catch(() => {})
db.$executeRawUnsafe(`PRAGMA busy_timeout = 10000;`).catch(() => {})
db.$executeRawUnsafe(`PRAGMA synchronous = NORMAL;`).catch(() => {})