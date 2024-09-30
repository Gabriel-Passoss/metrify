import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeInvite } from '@/test/factories/invite-factory'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get User Invites', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get all user invites', async () => {
    const owner = await makeUser()
    const userInvited = await makeUser()

    await prisma.user.createMany({
      data: [owner, userInvited],
    })

    const organizationOne = await makeOrganization({}, owner.id)
    const organizationTwo = await makeOrganization({}, owner.id)
    const organizationThree = await makeOrganization({}, owner.id)
    await prisma.organization.createMany({
      data: [organizationOne, organizationTwo, organizationThree],
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organizationOne.id,
        role: 'ADMIN',
      },
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organizationTwo.id,
        role: 'ADMIN',
      },
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organizationThree.id,
        role: 'ADMIN',
      },
    })

    const inviteOne = makeInvite(
      { email: userInvited.email },
      owner.id,
      organizationOne.id,
    )
    const inviteTwo = makeInvite(
      { email: userInvited.email },
      owner.id,
      organizationTwo.id,
    )
    const inviteThree = makeInvite(
      { email: userInvited.email },
      owner.id,
      organizationThree.id,
    )

    await prisma.invite.createMany({
      data: [inviteOne, inviteTwo, inviteThree],
    })

    const token = app.jwt.sign({ sub: userInvited.id })

    const response = await request(app.server)
      .get(`/invites/pending`)
      .set('Authorization', `Bearer ${token}`)

    console.log(response.body)
    expect(response.statusCode).toEqual(200)
    expect(response.body.invites).toHaveLength(3)
  })
})
