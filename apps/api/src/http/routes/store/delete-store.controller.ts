import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function deleteStore(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      '/organizations/:organizationSlug/stores/:storeSlug',
      {
        schema: {
          tags: ['Store'],
          summary: 'Delete a store',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            storeSlug: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { organizationSlug, storeSlug } = request.params
        const { membership, organization } =
          await request.getUserMembership(organizationSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'Store')) {
          throw new UnauthorizedError("You're not allowed to delete a store.")
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

        await prisma.store.delete({
          where: {
            id: storeOnDatabase.id,
            organizationId: organization.id,
          },
        })

        return reply.status(204).send()
      },
    )
}
