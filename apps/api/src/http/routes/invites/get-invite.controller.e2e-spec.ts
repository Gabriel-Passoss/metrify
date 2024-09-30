import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeInvite } from '@/test/factories/invite-factory'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get Invite', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get details from an invite', async () => {
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

    const invite = makeInvite({}, owner.id, organization.id)

    await prisma.invite.create({
      data: invite,
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .get(`/invites/${invite.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchObject({
      invite: expect.any(Object),
    })
  })

  it('should not be able to get details from an inexistent invite', async () => {
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

    const invite = makeInvite({}, owner.id, organization.id)

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .get(`/invites/${invite.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(400)
    expect(response.body).toMatchObject({
      message: 'Invite not found.',
    })
  })
})
