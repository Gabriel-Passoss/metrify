import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Update Organization', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able update an organization', async () => {
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
      .delete(`/organizations/${organization.slug}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(204)

    const organizationOnDatabase = await prisma.organization.findUnique({
      where: {
        slug: organization.slug,
      },
    })

    expect(organizationOnDatabase).toBeFalsy()
  })

  it('should be able update an organization', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const member = await makeUser()
    await prisma.user.create({
      data: member,
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
        role: 'ADMIN',
      },
    })

    const token = app.jwt.sign({ sub: member.id })

    const response = await request(app.server)
      .delete(`/organizations/${organization.slug}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "You're not allowed to shutdown this organization.",
    })

    const organizationOnDatabase = await prisma.organization.findUnique({
      where: {
        slug: organization.slug,
      },
    })

    expect(organizationOnDatabase).toBeTruthy()
  })
})
