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

  it('should be able to obtain a list of all members of an organization.', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const sellerOne = await makeUser()
    await prisma.user.create({
      data: sellerOne,
    })

    const sellerTwo = await makeUser()
    await prisma.user.create({
      data: sellerTwo,
    })

    const manager = await makeUser()
    await prisma.user.create({
      data: manager,
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
        userId: sellerOne.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    await prisma.member.create({
      data: {
        userId: sellerTwo.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    await prisma.member.create({
      data: {
        userId: manager.id,
        organizationId: organization.id,
        role: 'MANAGER',
      },
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.members).toHaveLength(4)
  })

  it('should not be able to obtain a list members if the user is not a member of this organization', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const sellerOne = await makeUser()
    await prisma.user.create({
      data: sellerOne,
    })

    const sellerTwo = await makeUser()
    await prisma.user.create({
      data: sellerTwo,
    })

    const manager = await makeUser()
    await prisma.user.create({
      data: manager,
    })

    const strangerUser = await makeUser()
    await prisma.user.create({
      data: strangerUser,
    })

    const organization = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organization,
    })

    const otherOrganization = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: otherOrganization,
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
        userId: sellerOne.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    await prisma.member.create({
      data: {
        userId: sellerTwo.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    await prisma.member.create({
      data: {
        userId: manager.id,
        organizationId: organization.id,
        role: 'MANAGER',
      },
    })

    await prisma.member.create({
      data: {
        userId: strangerUser.id,
        organizationId: otherOrganization.id,
        role: 'ADMIN',
      },
    })

    const token = app.jwt.sign({ sub: strangerUser.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: `You're not a member of ${organization.slug} company`,
    })
  })
})
