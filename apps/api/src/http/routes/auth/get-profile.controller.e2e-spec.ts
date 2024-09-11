import { hash } from 'bcryptjs'
import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Get Profile', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to get an authenticated profile', async () => {
    const data = await makeUser({
      passwordHash: await hash('testing-password', 6),
      email: 'testing@email.com',
    })

    await prisma.user.create({
      data,
    })

    const token = app.jwt.sign({ sub: data.id })

    const response = await request(app.server)
      .get('/sessions')
      .set('Authorization', `Bearer ${token}`)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchObject({
      user: expect.any(Object),
    })
  })

  it('should not be able to get a profile without authentication', async () => {
    const response = await request(app.server)
      .get('/sessions')
      .set('Authorization', `Bearer ${'invalid-token'}`)

    expect(response.statusCode).toEqual(401)
    expect(response.body.message).toEqual('Invalid auth token')
  })
})
