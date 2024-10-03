import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function updateStore(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .patch(
      '/organizations/:slug/stores/:storeId',
      {
        schema: {
          tags: ['Store'],
          summary: 'Update a store',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            storeId: z.string(),
          }),
          body: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug, storeId } = request.params
        const { name, description } = request.body
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', 'Store')) {
          throw new UnauthorizedError("You're not allowed to update a store.")
        }

        await prisma.store.update({
          where: {
            id: storeId,
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
