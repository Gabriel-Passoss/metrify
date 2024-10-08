import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeProduct } from '@/test/factories/product-factory'
import { makeStore } from '@/test/factories/store-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Update Product', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a product', async () => {
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

    const product = makeProduct({}, store.id)
    await prisma.product.create({
      data: product,
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .patch(
        `/organizations/${organization.slug}/stores/${store.slug}/products/${product.id}`,
      )
      .send({
        name: 'Changed name',
        price: 10000,
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(204)

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        name: 'Changed name',
      },
    })

    expect(productOnDatabase).toBeTruthy()
    expect(productOnDatabase?.price).toBe(10000)
  })
})
