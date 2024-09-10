import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'

describe('(E2E) Create Account', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create an account', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'Testing User',
      email: 'testing@email.com',
      password: 'testing-password',
    })

    expect(response.statusCode).toEqual(201)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'testing@email.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })

  it('should not be able to create an account with same e-mail', async () => {
    await prisma.user.create({
      data: {
        name: 'name',
        email: 'existing-email@email.com',
        passwordHash: 'password',
      },
    })

    const response = await request(app.server).post('/users').send({
      name: 'name',
      email: 'existing-email@email.com',
      password: 'password',
    })

    expect(response.statusCode).toEqual(400)
    expect(response.body).toMatchObject({
      message: 'Already exists an user with same e-mail',
    })
  })
})
