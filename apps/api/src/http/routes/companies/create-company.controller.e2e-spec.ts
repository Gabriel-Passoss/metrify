import { prisma } from '@/lib/prisma'
import { app } from '@/server'

describe('(E2E) Create Company', () => {
  it('should be able to create a company', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/companies',
      body: {
        name: 'Testing Company',
        slug: 'testing-company',
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

  it('should not be able to create a company with same document', async () => {
    await prisma.company.create({
      data: {
        name: 'Test Company 1',
        slug: 'testing-company-1',
        document: '75862377000139',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/companies',
      body: {
        name: 'Test Company 2',
        slug: 'testing-company-2',
        document: '75862377000139',
      },
    })

    expect(response.statusCode).toEqual(400)
    expect(response.json()).toMatchObject({
      message: 'Company with that document already exists.',
    })
  })

  it('should not be able to create a company with same slug', async () => {
    await prisma.company.create({
      data: {
        name: 'Test Company 3',
        slug: 'testing-company-3',
        document: '75862377001139',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/companies',
      body: {
        name: 'Test Company 3',
        slug: 'testing-company-3',
        document: '75862377003139',
      },
    })

    expect(response.statusCode).toEqual(400)
    expect(response.json()).toMatchObject({
      message: 'Company with that slug already exists.',
    })
  })
})
