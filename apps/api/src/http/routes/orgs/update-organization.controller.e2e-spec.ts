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
      .patch(`/organizations/${organization.slug}`)
      .send({
        name: 'Test Change',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(204)

    const organizationOnDatabase = await prisma.organization.findFirst({
      where: {
        name: 'Test Change',
      },
    })

    expect(organizationOnDatabase).toBeTruthy()
  })

  it('should not be able update an organization using no admin member', async () => {
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

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    })

    await prisma.member.create({
      data: {
        userId: seller.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const token = app.jwt.sign({ sub: seller.id })

    const response = await request(app.server)
      .patch(`/organizations/${organization.slug}`)
      .send({
        name: 'Test Change',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)

    const organizationOnDatabase = await prisma.organization.findFirst({
      where: {
        name: organization.name,
      },
    })

    expect(organizationOnDatabase).toBeTruthy()
  })
})
