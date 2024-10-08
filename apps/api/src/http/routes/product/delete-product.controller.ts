import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function deleteProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      '/organizations/:organizationSlug/stores/:storeSlug/products/:productId',
      {
        schema: {
          tags: ['Product'],
          summary: 'Delete a product',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            storeSlug: z.string(),
            productId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { organizationSlug, productId } = request.params
        const { membership } = await request.getUserMembership(organizationSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'Product')) {
          throw new UnauthorizedError("You're not allowed to delete products.")
        }

        await prisma.product.delete({
          where: {
            id: productId,
          },
        })

        return reply.status(204).send()
      },
    )
}
