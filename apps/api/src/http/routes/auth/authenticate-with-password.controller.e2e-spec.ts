import { hash } from 'bcryptjs'
import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Authenticate with password', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to authenticate with password', async () => {
    const { name, passwordHash, email } = await makeUser({
      passwordHash: await hash('testing-password', 6),
    })

    await prisma.user.create({
      data: {
        name,
        passwordHash,
        email,
      },
    })

    const response = await request(app.server)
      .post('/sessions/password')
      .send({ email, password: 'testing-password' })

    expect(response.statusCode).toEqual(200)
    expect(response.body).toMatchObject({
      token: expect.any(String),
    })
  })

  it('should not be able to authenticate with a wrong password', async () => {
    const { name, passwordHash, email } = await makeUser({
      passwordHash: await hash('correct-password', 6),
    })

    await prisma.user.create({
      data: {
        name,
        passwordHash,
        email,
      },
    })

    const response = await request(app.server)
      .post('/sessions/password')
      .send({ email, password: 'wrong-password' })

    expect(response.statusCode).toEqual(401)
    expect(response.body).toMatchObject({
      message: 'Invalid credentials.',
    })
  })

  it('should not be possible to authenticate a user who does not have a password', async () => {
    const { name, passwordHash, email } = await makeUser({
      passwordHash: await hash('correct-password', 6),
    })

    await prisma.user.create({
      data: {
        name,
        passwordHash,
        email,
      },
    })

    const response = await request(app.server)
      .post('/sessions/password')
      .send({ email, password: 'wrong-password' })

    expect(response.statusCode).toEqual(401)
    expect(response.body).toMatchObject({
      message: 'Invalid credentials.',
    })
  })
})
