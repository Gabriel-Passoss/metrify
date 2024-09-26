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
      .patch(`/organizations/${organization.slug}`)
      .send({
        name: 'Test Change',
      })
      .set('Authorization', `Bearer ${token}`)

    console.log(response.body)

    expect(response.status).toBe(204)

    const organizationOnDatabase = await prisma.organization.findFirst({
      where: {
        name: 'Test Change',
      },
    })

    expect(organizationOnDatabase).toBeTruthy()
  })
})
