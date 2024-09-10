import { prisma } from '@/lib/prisma'
import { app } from '@/server'

describe('(E2E) Create Account', () => {
  it('should be able to create an account', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'Testing User',
        email: 'testing@email.com',
        password: 'testing-password',
      },
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

    const response = await app.inject({
      method: 'POST',
      url: '/users',
      body: {
        name: 'name',
        email: 'existing-email@email.com',
        password: 'password',
      },
    })

    expect(response.statusCode).toEqual(400)
    expect(response.json()).toMatchObject({
      message: 'Already exists an user with same e-mail',
    })
  })
})
