import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get Membership', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get a membership from an organization', async () => {
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

    const member = await prisma.member.create({
      data: {
        userId: seller.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const token = app.jwt.sign({ sub: seller.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/membership`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      membership: expect.objectContaining({
        id: member.id,
        role: 'SELLER',
        organizationId: organization.id,
      }),
    })
  })

  it('should not be able to obtain membership in an organization when he is not a part of it', async () => {
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

    const token = app.jwt.sign({ sub: seller.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/membership`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: `You're not a member of ${organization.slug} company`,
    })
  })
})
