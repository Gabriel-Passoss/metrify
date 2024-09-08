import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import { config } from 'dotenv'
import { afterEach, beforeEach } from 'vitest'

import { prisma } from '@/lib/prisma'

config({ path: '.env', override: true })

function generateUniqueDatabaseUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL enviroment variable')
  }

  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()

beforeEach(() => {
  const databaseUrl = generateUniqueDatabaseUrl(schemaId)
  process.env.DATABASE_URL = databaseUrl
  execSync('npx prisma migrate deploy')
})

afterEach(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
