import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeProduct } from '@/test/factories/product-factory'
import { makeStore } from '@/test/factories/store-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get Products', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get products', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const organization = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organization,
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    })

    const store = makeStore({}, organization.id)
    await prisma.store.create({
      data: store,
    })

    const productOne = makeProduct({}, store.id)
    const productTwo = makeProduct({}, store.id)
    const productThree = makeProduct({}, store.id)
    await prisma.product.createMany({
      data: [productOne, productTwo, productThree],
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/stores/${store.slug}/products`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.products).toHaveLength(3)
  })
})
