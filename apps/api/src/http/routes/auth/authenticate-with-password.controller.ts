import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { prisma } from '@/lib/prisma'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with e-mail and password',
        body: z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const userOnDatabase = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userOnDatabase) {
        throw new UnauthorizedError('Invalid credentials.')
      }

      if (userOnDatabase.passwordHash === null) {
        throw new BadRequestError(
          'User does not have a password, use social login',
        )
      }

      const isValindPassword = await compare(
        password,
        userOnDatabase.passwordHash,
      )

      if (!isValindPassword) {
        throw new UnauthorizedError('Invalid credentials.')
      }

      const token = await reply.jwtSign(
        {
          sub: userOnDatabase.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      reply.status(200).send({ token })
    },
  )
}
