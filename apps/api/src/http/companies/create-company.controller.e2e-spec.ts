import { prisma } from '@/lib/prisma'
import { app } from '@/server'

describe('(E2E) Create Company', () => {
  it('should be able to create a company', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/companies',
      body: {
        name: 'Testing Company',
        document: '75862377000159',
      },
    })

    expect(response.statusCode).toEqual(201)

    const companyOnDatabase = await prisma.company.findUnique({
      where: {
        document: '75862377000159',
      },
    })

    expect(companyOnDatabase).toBeTruthy()
  })
})
