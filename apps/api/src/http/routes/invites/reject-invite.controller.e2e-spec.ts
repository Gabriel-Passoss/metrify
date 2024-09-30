import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeInvite } from '@/test/factories/invite-factory'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Reject Invite', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to reject an invite', async () => {
    const owner = await makeUser()
    const userToInvite = await makeUser()

    await prisma.user.createMany({
      data: [owner, userToInvite],
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

    const invite = makeInvite(
      { email: userToInvite.email, role: 'SELLER' },
      owner.id,
      organization.id,
    )

    await prisma.invite.create({
      data: invite,
    })

    const token = app.jwt.sign({ sub: userToInvite.id })

    const response = await request(app.server)
      .patch(`/invites/${invite.id}/reject`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(204)

    const memberOnDatabase = await prisma.member.findFirst({
      where: {
        userId: userToInvite.id,
      },
    })

    expect(memberOnDatabase).toBeFalsy()

    const inviteOnDatabase = await prisma.invite.findUnique({
      where: {
        id: invite.id,
      },
    })

    expect(inviteOnDatabase).toBeFalsy()
  })

  it('should not be able to reject an invite logged in with another email from invite', async () => {
    const owner = await makeUser()
    const userToInvite = await makeUser()
    const anotherUser = await makeUser()

    await prisma.user.createMany({
      data: [owner, userToInvite, anotherUser],
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

    const invite = makeInvite(
      { email: userToInvite.email, role: 'SELLER' },
      owner.id,
      organization.id,
    )

    await prisma.invite.create({
      data: invite,
    })

    const token = app.jwt.sign({ sub: anotherUser.id })

    const response = await request(app.server)
      .patch(`/invites/${invite.id}/reject`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(400)
    expect(response.body).toMatchObject({
      message: 'This invite belongs to another user.',
    })

    const inviteOnDatabase = await prisma.invite.findUnique({
      where: {
        id: invite.id,
      },
    })

    expect(inviteOnDatabase).toBeTruthy()
  })
})
