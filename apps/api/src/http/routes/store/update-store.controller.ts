import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function updateStore(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .patch(
      '/organizations/:organizationSlug/stores/:storeSlug',
      {
        schema: {
          tags: ['Store'],
          summary: 'Update a store',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            storeSlug: z.string(),
          }),
          body: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
          }),
          response: {
            204: z.null(),
            401: z.object({
              message: z.literal("You're not allowed to update a store."),
            }),
            400: z.object({
              message: z.literal('Store not found.'),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { organizationSlug, storeSlug } = request.params
        const { name, description } = request.body
        const { membership, organization } =
          await request.getUserMembership(organizationSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', 'Store')) {
          throw new UnauthorizedError("You're not allowed to update a store.")
        }

        const storeOnDatabase = await prisma.store.findFirst({
          where: {
            slug: storeSlug,
            organizationId: organization.id,
          },
        })

        if (!storeOnDatabase) {
          throw new BadRequestError('Store not found.')
        }

        await prisma.store.update({
          where: {
            id: storeOnDatabase.id,
            organizationId: organization.id,
          },
          data: {
            name,
            description,
          },
        })

        return reply.status(204).send()
      },
    )
}
