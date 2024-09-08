import { describe, it } from 'vitest'

import { prisma } from '@/lib/prisma'

describe('(E2E) Create Company', () => {
  it('should be able to create a company', async () => {
    const response = await prisma.company.create({
      data: {
        name: 'Test',
        document: '132132',
      },
    })

    console.log(response)
  })
})
