import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get Stores', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get organization stores', async () => {
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

    await prisma.store.create({
      data: {
        name: 'Testing Store 1',
        organizationId: organization.id,
      },
    })

    await prisma.store.create({
      data: {
        name: 'Testing Store 2',
        organizationId: organization.id,
      },
    })

    await prisma.store.create({
      data: {
        name: 'Testing Store 3',
        organizationId: organization.id,
      },
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/stores`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.stores).toHaveLength(3)
  })
})
