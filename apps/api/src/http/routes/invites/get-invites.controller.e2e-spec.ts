import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeInvite } from '@/test/factories/invite-factory'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get Organization Invites', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get all organization invites', async () => {
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

    const inviteOne = makeInvite({}, owner.id, organization.id)
    const inviteTwo = makeInvite({}, owner.id, organization.id)
    const inviteThree = makeInvite({}, owner.id, organization.id)

    await prisma.invite.createMany({
      data: [inviteOne, inviteTwo, inviteThree],
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body.invites).toHaveLength(3)
  })

  it('should not be able to get all invites from an organization without permission', async () => {
    const owner = await makeUser()
    const member = await makeUser()

    await prisma.user.createMany({
      data: [owner, member],
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
        userId: member.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const inviteOne = makeInvite({}, owner.id, organization.id)
    const inviteTwo = makeInvite({}, owner.id, organization.id)
    const inviteThree = makeInvite({}, owner.id, organization.id)

    await prisma.invite.createMany({
      data: [inviteOne, inviteTwo, inviteThree],
    })

    const token = app.jwt.sign({ sub: member.id })

    const response = await request(app.server)
      .get(`/organizations/${organization.slug}/invites`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(401)
    expect(response.body).toMatchObject({
      message: "You're not allowed to get organization invites",
    })
  })
})
