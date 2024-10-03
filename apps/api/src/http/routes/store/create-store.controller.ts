import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { ConflictError } from '@/http/_errors/conflict-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function createStore(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/organizations/:slug/stores',
      {
        schema: {
          tags: ['Store'],
          summary: 'Create a new store',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          body: z.object({
            name: z.string(),
            description: z.string().nullable(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params
        const { membership, organization } =
          await request.getUserMembership(slug)
        const { name, description } = request.body

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Store')) {
          throw new UnauthorizedError("You're not allowed to create a store.")
        }

        const storeOnDatabase = await prisma.store.findFirst({
          where: {
            name,
            organizationId: organization.id,
          },
        })

        if (storeOnDatabase) {
          throw new ConflictError(
            'Already exists a store with same name in this organization.',
          )
        }

        await prisma.store.create({
          data: {
            name,
            description,
            organizationId: organization.id,
          },
        })

        return reply.status(201).send()
      },
    )
}
