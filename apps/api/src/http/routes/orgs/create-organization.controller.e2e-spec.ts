import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Create Organization', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create an organization', async () => {
    const user = await makeUser()

    await prisma.user.create({
      data: user,
    })

    const token = app.jwt.sign({ sub: user.id })

    const response = await request(app.server)
      .post('/organizations')
      .send({
        name: 'Testing Org',
        document: '12.345.678/0001-34',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      organizationId: expect.any(String),
    })

    const organizationOnDatabase = await prisma.organization.findUnique({
      where: {
        id: response.body.organizationId,
      },
    })

    expect(organizationOnDatabase?.ownerId).toBe(user.id)
    expect(organizationOnDatabase?.slug).toBe('testing-org')
  })

  it('should not be able to create an organization with invalid document', async () => {
    const user = await makeUser()

    await prisma.user.create({
      data: user,
    })

    const token = app.jwt.sign({ sub: user.id })

    const response = await request(app.server)
      .post('/organizations')
      .send({
        name: 'Testing Org',
        document: '12.3456780001-34',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      message: 'Validation error',
    })
  })

  it('should not be able to create an organization without authentication', async () => {
    const response = await request(app.server).post('/organizations').send({
      name: 'Testing Org',
      document: '12.345.678/0001-34',
    })

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: 'Invalid auth token',
    })
  })

  it('should not be able to create an organization with an existent slug', async () => {
    const user = await makeUser()
    await prisma.user.create({
      data: user,
    })

    const organization = await makeOrganization(
      { name: 'Testing Org' },
      user.id,
    )
    await prisma.organization.create({
      data: organization,
    })

    const token = app.jwt.sign({ sub: user.id })

    const response = await request(app.server)
      .post('/organizations')
      .send({
        name: 'Testing Org',
        document: '12.345.678/0006-34',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(409)
    expect(response.body).toMatchObject({
      message: 'Another organization with same slug/name already exists',
    })
  })
})
