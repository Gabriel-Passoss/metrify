import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeStore } from '@/test/factories/store-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Update Store', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to update a store', async () => {
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
      .patch(`/organizations/${organization.slug}/stores/${store.slug}`)
      .send({
        name: 'Testing Name',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(204)

    const storeOnDatabase = await prisma.store.findFirst({
      where: {
        name: 'Testing Name',
      },
    })

    expect(storeOnDatabase).toBeTruthy()
  })

  it('should not be able to update a store without being an admin or manager', async () => {
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
      .patch(`/organizations/${organization.slug}/stores/${store.slug}`)
      .send({
        name: 'Changed Name',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)

    const storeOnDatabase = await prisma.store.findFirst({
      where: {
        name: 'Changed Name',
      },
    })

    expect(storeOnDatabase).toBeFalsy()
  })
})
