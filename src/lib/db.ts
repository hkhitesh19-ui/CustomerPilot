import { PrismaClient } from '@prisma/client'

import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl() {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && !envUrl.startsWith('file:.')) {
    return envUrl
  }
  const absoluteDbPath = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/')
  return `file:${absoluteDbPath}`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Enable SQLite Write-Ahead Logging (WAL) and 10s Busy Timeout for concurrent write safety
db.$queryRawUnsafe(`PRAGMA journal_mode = WAL;`).catch(() => {})
db.$queryRawUnsafe(`PRAGMA busy_timeout = 10000;`).catch(() => {})
db.$queryRawUnsafe(`PRAGMA synchronous = NORMAL;`).catch(() => {})