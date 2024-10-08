import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeStore } from '@/test/factories/store-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Create Product', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a product', async () => {
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

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/stores/${store.slug}/products`)
      .send({
        name: 'Testing Product',
        platform: 'Kiwify',
        price: 1000,
        quantity: 1,
        installmentPrice: [
          {
            installmentNumber: 1,
            price: 10,
          },
        ],
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(201)

    const productOnDatabase = await prisma.product.findFirst({
      where: {
        name: 'Testing Product',
      },
      include: {
        installmentPrice: true,
      },
    })

    expect(productOnDatabase).toBeTruthy()
    expect(productOnDatabase?.installmentPrice).toMatchObject([
      {
        id: expect.any(String),
        productId: expect.any(String),
        installmentNumber: 1,
        price: 10,
      },
    ])
  })

  it('should not be able to create a product without being an admin or manager', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const seller = await makeUser()
    await prisma.user.create({
      data: seller,
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

    await prisma.member.create({
      data: {
        userId: seller.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const store = makeStore({}, organization.id)
    await prisma.store.create({
      data: store,
    })

    const token = app.jwt.sign({ sub: seller.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/stores/${store.slug}/products`)
      .send({
        name: 'Testing Product',
        platform: 'Kiwify',
        price: 1000,
        quantity: 1,
        installmentPrice: [
          {
            installmentNumber: 1,
            price: 10,
          },
        ],
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "You're not allowed to create a product.",
    })
  })
})
