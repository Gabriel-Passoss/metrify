import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Remove Member', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able remove a member', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const user = await makeUser()
    await prisma.user.create({
      data: user,
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

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .delete(`/organizations/${organization.slug}/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(204)

    const memberOnDatabase = await prisma.member.findUnique({
      where: {
        id: member.id,
      },
    })

    expect(memberOnDatabase).toBeFalsy()
  })

  it('should not be possible to remove a member without being an admin or manager', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const seller = await makeUser()
    await prisma.user.create({
      data: seller,
    })

    const user = await makeUser()
    await prisma.user.create({
      data: user,
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
        userId: user.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const member = await prisma.member.create({
      data: {
        userId: seller.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const token = app.jwt.sign({ sub: user.id })

    const response = await request(app.server)
      .delete(`/organizations/${organization.slug}/members/${member.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "You're not allowed to remove this member.",
    })
  })
})
