import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeStore } from '@/test/factories/store-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Create Store', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a store', async () => {
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

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/stores`)
      .send({
        name: 'Testing Store',
        description: 'Testing the creation of a store',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(201)

    const storeOnDatabase = await prisma.store.findFirst({
      where: {
        name: 'Testing Store',
      },
    })

    expect(storeOnDatabase).toBeTruthy()
    expect(storeOnDatabase?.slug).toBe('testing-store')
  })

  it('should not be able to create a store without being an admin or manager', async () => {
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

    const token = app.jwt.sign({ sub: seller.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/stores`)
      .send({
        name: 'Testing Store',
        description: 'Testing the creation of a store',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)

    expect(response.body).toMatchObject({
      message: "You're not allowed to create a store.",
    })
  })

  it('should not be able to create a store with the same name within an organization', async () => {
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

    const store = makeStore({ name: 'Testing Store' }, organization.id)
    await prisma.store.create({
      data: store,
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/stores`)
      .send({
        name: 'Testing Store',
        description: 'Testing the creation of a store',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      message: 'Already exists a store with same name in this organization.',
    })
  })
})
