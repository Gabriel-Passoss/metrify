import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get Organizations', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to search for the organizations user is part of', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const seller = await makeUser()
    await prisma.user.create({
      data: seller,
    })

    const organizationOne = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organizationOne,
    })

    await prisma.member.create({
      data: {
        userId: seller.id,
        organizationId: organizationOne.id,
        role: 'SELLER',
      },
    })

    const organizationTwo = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organizationTwo,
    })

    await prisma.member.create({
      data: {
        userId: seller.id,
        organizationId: organizationTwo.id,
        role: 'SELLER',
      },
    })

    const token = app.jwt.sign({ sub: seller.id })

    const response = await request(app.server)
      .get(`/organizations`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.organizations).toHaveLength(2)
  })
})
